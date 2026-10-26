'use client';

import { useState, useEffect, useRef, type ReactElement } from 'react';
import { Files, X, FilePlus, Play } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';
import { Results } from '@/components/results';
import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import useCompressor from '@/hooks/use-compressor';
import useJobTracking from '@/hooks/use-job-tracking';
import type { Format } from '@/utils/formats';
import type { Job, JobIds, PendingFile, Task } from '@/types/job';
import { jobIsIncomplete } from '@/utils/jobs';
import type { CompressionInput } from '@/types/compressor';
import type { AnalyticsEventParams, TaskErrorKind } from '@/types/analytics';
import { getMediumSize } from '@/utils/mediaDimensions';
import { fileEntry, sumBy, trackEvent } from '@/utils/analytics';
import type { ResultsDictionary, UploadDictionary } from '@/i18n/type';

function getJobWithUpdatedTask(
  jobs: Job[],
  jobId: string,
  configName: string,
  format: Format,
  newTask: Task,
) {
  return jobs.map((currentJob) => {
    if (currentJob.id !== jobId) return currentJob;
    return {
      ...currentJob,
      tasks: {
        ...currentJob.tasks,
        [configName]: {
          ...(currentJob.tasks[configName] || {}),
          [format]: newTask,
        },
      },
    };
  });
}

type Focus = 'initial' | 'upload' | 'settings' | 'results';

export type SettingsComponentProps<Config> = {
  config: Config;
  setConfig: (newConfig: Config) => void;
};

// Strings of the shell around the settings component. Each page maps them
// from its own settings dictionary ("compress" vs "convert" wording).
// The settings of a Start click that the analytics can't read from the jobs.
export type ConversionSettings = Pick<
  AnalyticsEventParams['conversion_started'],
  'resize' | 'keep_audio' | 'original_format'
>;

export type CompressorAppTranslation = {
  filesTitle: string;
  addMoreFiles: string;
  removeFile: string;
  start: string;
};

// Shared by every compressor page. Only the settings component, the job
// creation and the config validation change between pages.
export default function CompressorApp<Config>({
  compressorType,
  initialConfig,
  translation,
  uploadTranslation,
  resultTranslation,
  renderSettings,
  configIsValid,
  createJob,
  describeConfig,
}: {
  compressorType: CompressionInput;
  initialConfig: Config;
  translation: CompressorAppTranslation;
  uploadTranslation: UploadDictionary;
  resultTranslation: ResultsDictionary;
  // A render prop rather than a component, so the wrappers can define it
  // inline without remounting the settings (and losing their state) on
  // every render.
  renderSettings: (props: SettingsComponentProps<Config>) => ReactElement;
  configIsValid: (config: Config) => boolean;
  createJob: (file: File, config: Config, ids: JobIds) => Promise<Job>;
  describeConfig: (config: Config) => ConversionSettings;
}) {
  const [focus, setFocus] = useState<Focus>('initial');
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [config, setConfig] = useState<Config>(initialConfig);

  const uploadRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const compressor = useCompressor(compressorType);
  const tracking = useJobTracking(jobs);

  const handleFilesAdded = (newFiles: File[]) => {
    const added = newFiles.map((file) => ({ id: crypto.randomUUID(), file }));
    setFiles((prev) => [...prev, ...added]);
    setFocus('settings');
    Promise.all(
      added.map(({ id, file }) =>
        // Unreadable files are still reported, without dimensions.
        Promise.resolve()
          .then(() => getMediumSize(file))
          .catch(() => undefined)
          .then((dimensions) => fileEntry(id, file, dimensions)),
      ),
    ).then((entries) =>
      trackEvent({
        event: 'files_added',
        compressor_type: compressorType,
        file_count: entries.length,
        total_size_bytes: sumBy(entries, (entry) => entry.size_bytes),
        files: entries,
      }),
    );
  };

  const handleRemoveFile = (index: number) => {
    if (files.length === 1) {
      setFocus('upload'); // If it was the last file we cannot stay in settings mode
    }
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleProcessClick = () => {
    const conversionId = crypto.randomUUID();
    Promise.allSettled(
      files.map(({ id, file }) =>
        createJob(file, config, { fileId: id, conversionId }),
      ),
    ).then((jobCreationResults) => {
      const fulfilledJobs = jobCreationResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
      setJobs((prev) => [...prev, ...fulfilledJobs]);
      setFiles([]);
      setFocus('results');
      const configFormats = fulfilledJobs.map((job) =>
        Object.values(job.requestedFormats),
      );
      tracking.conversionStarted(
        {
          conversion_id: conversionId,
          compressor_type: compressorType,
          job_count: fulfilledJobs.length,
          failed_count: jobCreationResults.length - fulfilledJobs.length,
          output_formats: [...new Set(configFormats.flat(2))].sort().join(','),
          config_count: Math.max(
            0,
            ...configFormats.map((formats) => formats.length),
          ),
          ...describeConfig(config),
        },
        fulfilledJobs,
      );
    });
  };

  const handleRemoveJob = (index: number) => {
    setJobs((prev) => {
      const newJobs = [...prev];
      newJobs.splice(index, 1);
      return newJobs;
    });
  };

  useEffect(() => {
    if (compressor.status == 'loading') return; //compressor is not ready

    const jobToRunIndex = jobs.findIndex((job) => jobIsIncomplete(job));
    if (jobToRunIndex === -1) return;
    const jobToRun = jobs[jobToRunIndex];

    if (compressor.status === 'working') {
      if (jobToRun.id !== compressor.currentJobId) {
        return compressor.abort(); //abort current and start new
      } else {
        return; //same job is already running
      }
    }

    tracking.jobStarted(jobToRun);
    compressor.compress(
      jobToRun.id,
      jobToRun.originalFile,
      jobToRun.requestedFormats,
      jobToRun.requestedDimensions,
      jobToRun.keepAudio,
      jobToRun.outputFileNames,
      (
        jobId: string,
        format: Format,
        configName: string,
        progress?: number,
      ) => {
        tracking.taskProgressed(jobToRun, configName, format);
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(prevJobs, jobId, configName, format, {
            status: 'running',
            percentage: progress && Math.floor(progress * 100),
          });
        });
      },
      (jobId: string, format: Format, configName: string, output: File) => {
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(prevJobs, jobId, configName, format, {
            status: 'completed',
            result: output,
          });
        });
      },
      (
        jobId: string,
        format: Format,
        configName: string,
        message: string,
        kind: TaskErrorKind,
      ) => {
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(prevJobs, jobId, configName, format, {
            status: 'errored',
            errorMessage: message,
            errorKind: kind,
          });
        });
      },
    );
  }, [jobs, compressor, tracking]);

  useEffect(() => {
    const refToScroll: Record<
      Focus,
      React.RefObject<HTMLElement | null> | null
    > = {
      initial: null,
      settings: settingsRef,
      upload: uploadRef,
      results: resultsRef,
    };
    refToScroll[focus]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [focus]);

  return (
    <>
      <div ref={uploadRef} className="scroll-mt-20">
        <FileUpload
          onFilesAdded={handleFilesAdded}
          type={compressorType}
          translations={uploadTranslation}
        />
      </div>
      {files.length > 0 && (
        <div ref={settingsRef} className="scroll-mt-20">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Files className="w-6 h-6 text-gray-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                {translation.filesTitle}
              </h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {files.map(({ id, file }, index) => (
                <div key={id} className="relative group aspect-square">
                  {file.type.startsWith('video/') ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover rounded-md shadow-sm"
                      disablePictureInPicture
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover rounded-md shadow-sm"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-color duration-200 rounded-md" />
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-1 right-1 bg-white/70 hover:bg-white text-gray-800 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label={translation.removeFile}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end items-center mb-4">
              <SecondaryButton onClick={() => setFocus('upload')}>
                <FilePlus className="w-4 h-4 mr-2" />
                {translation.addMoreFiles}
              </SecondaryButton>
            </div>
            {renderSettings({ config, setConfig })}
            <div className="flex justify-end items-center mt-4">
              <PrimaryButton
                onClick={handleProcessClick}
                disabled={!configIsValid(config)}
              >
                <Play className="w-4 h-4 mr-2" />
                {translation.start}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
      {jobs.length > 0 && (
        <div ref={resultsRef} className="scroll-mt-20">
          <Results
            jobs={jobs}
            handleRemoveJob={handleRemoveJob}
            translation={resultTranslation}
          />
        </div>
      )}
    </>
  );
}
