'use client';

import {
  useState,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useLocale } from 'next-intl';
import { Play, Plus, X } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';
import { Results } from '@/components/results';
import { PrimaryButton } from '@/components/buttons';
import { SettingsSection, StepHeading } from '@/components/settings-section';
import { SampleCredit } from '@/components/sample-credit';
import useCompressor from '@/hooks/use-compressor';
import useJobTracking from '@/hooks/use-job-tracking';
import type { Format } from '@/utils/formats';
import type { Job, JobIds, PendingFile, Task } from '@/types/job';
import { jobIsIncomplete } from '@/utils/jobs';
import type { CompressionInput } from '@/types/compressor';
import type { AnalyticsEventParams, TaskErrorKind } from '@/types/analytics';
import { getMediumSize } from '@/utils/mediaDimensions';
import { fileEntry, sumBy, trackEvent } from '@/utils/analytics';
import { fill, formatCount } from '@/utils/i18n-format';
import type {
  CompressorAppDictionary,
  ResultsDictionary,
  UploadDictionary,
} from '@/i18n/type';

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

// What is wrong with the settings, found on Start: the message shows next to
// the button and `fieldId` gets the focus (and aria-invalid).
export type ConfigProblem = { message: string; fieldId: string };

export type SettingsComponentProps<Config> = {
  config: Config;
  setConfig: (newConfig: Config) => void;
  invalidFieldId?: string;
};

// The settings of a Start click that the analytics can't read from the jobs.
export type ConversionSettings = Pick<
  AnalyticsEventParams['conversion_started'],
  'resize' | 'keep_audio' | 'original_format'
>;

// A picked file's preview. The object URL lives as long as the thumbnail.
function FileThumb({
  file,
  removeLabel,
  onRemove,
}: {
  file: File;
  removeLabel: string;
  onRemove: () => void;
}) {
  const mediaRef = useRef<HTMLImageElement & HTMLVideoElement>(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    if (mediaRef.current) mediaRef.current.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  const isVideo = file.type.startsWith('video/') || !file.type;
  return (
    <figure className="relative m-0 aspect-square overflow-hidden rounded-input bg-paper-3">
      {isVideo ? (
        <video
          ref={mediaRef}
          className="size-full object-cover"
          disablePictureInPicture
          muted
        />
      ) : (
        <img ref={mediaRef} alt="" className="size-full object-cover" />
      )}
      <figcaption className="absolute inset-x-0 bottom-0 hidden truncate bg-linear-to-b from-transparent to-scrim px-2 pt-6 pb-1 text-xs text-paper sm:block">
        {file.name}
      </figcaption>
      <button
        type="button"
        onClick={onRemove}
        title={removeLabel}
        className="absolute end-1 top-1 grid size-7 place-items-center rounded-full bg-paper text-ink before:absolute before:-inset-2 hover:bg-paper-3"
      >
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">{removeLabel}</span>
      </button>
    </figure>
  );
}

// Shared by every compressor page. Only the settings component, the job
// creation and the config validation change between pages. The flow: the
// dropzone is the hero (step 1); picked files open the settings (step 2)
// below it, and Start turns them into jobs (step 3). Each step that opens
// is scrolled into view.
export default function CompressorApp<Config>({
  compressorType,
  initialConfig,
  intro,
  stepTitle,
  samples,
  translation,
  uploadTranslation,
  resultTranslation,
  renderSettings,
  getConfigProblem,
  describe,
  createJob,
  describeConfig,
}: {
  compressorType: CompressionInput;
  initialConfig: Config;
  // The page's heading, shown beside the dropzone.
  intro: ReactNode;
  stepTitle: string;
  // Image pages: offer two sample photos.
  samples?: boolean;
  translation: CompressorAppDictionary;
  uploadTranslation: UploadDictionary;
  resultTranslation: ResultsDictionary;
  // A render prop rather than a component, so the wrappers can define it
  // inline without remounting the settings (and losing their state) on
  // every render.
  renderSettings: (props: SettingsComponentProps<Config>) => ReactElement;
  getConfigProblem: (config: Config) => ConfigProblem | null;
  // The line above Start ("2 images, 3 sizes each…") and its label.
  describe: (
    config: Config,
    files: File[],
  ) => { summary: string; start: string };
  createJob: (file: File, config: Config, ids: JobIds) => Promise<Job>;
  describeConfig: (config: Config) => ConversionSettings;
}) {
  const locale = useLocale();
  const [focus, setFocus] = useState<Focus>('initial');
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [config, setConfig] = useState<Config>(initialConfig);
  const [problem, setProblem] = useState<ConfigProblem | null>(null);
  // Bumped on every refused Start, so the same problem refocuses its field.
  const [problemShown, setProblemShown] = useState(0);
  // The sample photos, so their credit shows while they are on the page.
  const [sampleFiles, setSampleFiles] = useState<File[]>([]);
  const inputId = useId();

  const uploadRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const compressor = useCompressor(compressorType);
  const tracking = useJobTracking(jobs);

  const counts = translation.counts;
  const mediaCount = (n: number) =>
    formatCount(
      locale,
      n,
      compressorType === 'video' ? counts.video : counts.image,
    );

  const handleFilesAdded = (
    newFiles: File[],
    options?: { sample?: boolean },
  ) => {
    if (options?.sample) setSampleFiles((prev) => [...prev, ...newFiles]);
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

  const updateConfig = (newConfig: Config) => {
    setConfig(newConfig);
    setProblem(null);
  };

  const handleProcessClick = () => {
    const found = getConfigProblem(config);
    if (found) {
      setProblem(found);
      setProblemShown((n) => n + 1);
      return;
    }
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
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    refToScroll[focus]?.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [focus]);

  // After the render that shows the problem (an advanced section may have
  // just opened to reveal its field).
  useEffect(() => {
    if (problem) document.getElementById(problem.fieldId)?.focus();
  }, [problem, problemShown]);

  const { summary, start } = describe(
    config,
    files.map(({ file }) => file),
  );
  const showSampleCredit =
    files.some(({ file }) => sampleFiles.includes(file)) ||
    jobs.some((job) => sampleFiles.includes(job.originalFile));

  return (
    <>
      <section
        aria-labelledby="page-title"
        className="page-container grid items-center gap-10 py-8 sm:py-12 lg:min-h-[min(calc(100svh-4.0625rem),62.5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24 lg:py-16"
      >
        <div>{intro}</div>
        <div ref={uploadRef} className="scroll-mt-4">
          <FileUpload
            onFilesAdded={handleFilesAdded}
            type={compressorType}
            translations={uploadTranslation}
            locale={locale}
            inputId={inputId}
            samples={samples}
          />
        </div>
      </section>
      {(files.length > 0 || jobs.length > 0) && (
        <div className="page-container">
          {files.length > 0 && (
            <section
              ref={settingsRef}
              aria-labelledby="settings-title"
              className="scroll-mt-4 border-t border-rule py-16"
            >
              <div className="mb-10">
                <StepHeading number={2} id="settings-title">
                  {stepTitle}
                </StepHeading>
              </div>
              <SettingsSection
                title={mediaCount(files.length)}
                note={translation.filesNote}
              >
                <ul className="grid grid-cols-4 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] sm:gap-3">
                  {files.map(({ id, file }, index) => (
                    <li key={id}>
                      <FileThumb
                        file={file}
                        removeLabel={fill(translation.removeFile, {
                          name: file.name,
                        })}
                        onRemove={() => handleRemoveFile(index)}
                      />
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => document.getElementById(inputId)?.click()}
                      className="grid aspect-square w-full place-content-center justify-items-center gap-1 rounded-input border border-dashed border-muted bg-paper text-sm text-ink-2 transition-colors duration-150 hover:bg-paper-2"
                    >
                      <Plus className="size-5" aria-hidden="true" />
                      {translation.addMore}
                    </button>
                  </li>
                </ul>
                {showSampleCredit && (
                  <SampleCredit
                    translation={uploadTranslation}
                    locale={locale}
                  />
                )}
              </SettingsSection>
              {renderSettings({
                config,
                setConfig: updateConfig,
                invalidFieldId: problem?.fieldId,
              })}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-rule pt-10">
                <p className="min-w-0 flex-1 basis-80">{summary}</p>
                <p
                  role="status"
                  aria-live="polite"
                  className="text-sm text-error"
                >
                  {problem?.message}
                </p>
                <PrimaryButton
                  onClick={handleProcessClick}
                  className="w-full sm:w-auto"
                >
                  <Play className="size-5" aria-hidden="true" />
                  {start}
                </PrimaryButton>
              </div>
            </section>
          )}
          {jobs.length > 0 && (
            <section
              ref={resultsRef}
              aria-labelledby="results-title"
              className="scroll-mt-4 border-t border-rule py-16"
            >
              <Results
                jobs={jobs}
                handleRemoveJob={handleRemoveJob}
                translation={resultTranslation}
                counts={counts}
              />
              {showSampleCredit && files.length === 0 && (
                <SampleCredit translation={uploadTranslation} locale={locale} />
              )}
            </section>
          )}
        </div>
      )}
    </>
  );
}
