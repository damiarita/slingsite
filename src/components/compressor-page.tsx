'use client';

import { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Results } from '@/components/results';
import {
  DimensionsSettings,
  DimensionsConfig,
} from '@/components/dimension-settings';
import useCompressor from '@/hooks/use-compressor';
import { Format } from '@/utils/formats';
import { Device } from '@/types/devices';
import { Job, Task } from '@/types/job';
import { createJob, jobIsIncomplete } from '@/utils/jobs';
import { Locale } from '@/i18n/lib';
import { CompressionInput } from '@/types/compressor';
import {
  CompressionPageSeoTranslations,
  ResultsDictionary,
  SettingsDictionary,
  UploadDictionary,
} from '@/i18n/type';

function getJobWithUpdatedTask(
  jobs: Job[],
  jobId: string,
  device: Device,
  format: Format,
  newTask: Task,
) {
  return jobs.map((currentJob) => {
    if (currentJob.id !== jobId) return currentJob;
    return {
      ...currentJob,
      tasks: {
        ...currentJob.tasks,
        [device]: {
          ...(currentJob.tasks[device] || {}),
          [format]: newTask,
        },
      },
    };
  });
}

type Focus = 'initial' | 'upload' | 'settings' | 'results';

export default function App({
  compressorType,
  seoTranslation,
  uploadTranslation,
  settingTranslation,
  resultTranslation,
  devicesTranslation,
}: {
  locale: Locale;
  compressorType: CompressionInput;
  seoTranslation: CompressionPageSeoTranslations;
  uploadTranslation: UploadDictionary;
  settingTranslation: SettingsDictionary;
  resultTranslation: ResultsDictionary;
  devicesTranslation: Record<Device, string>;
}) {
  const [focus, setFocus] = useState<Focus>('initial');
  const [files, setFiles] = useState<File[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const uploadRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [deviceConfig, setDeviceConfig] = useState<DimensionsConfig>({
    mobile: {
      enabled: true,
      screenWidth: 450,
      sizingType: 'percentage',
      percentage: 100,
      width: 450,
      height: 100,
    },
    tablet: {
      enabled: true,
      screenWidth: 1050,
      sizingType: 'percentage',
      percentage: 50,
      width: 525,
      height: 100,
    },
    desktop: {
      enabled: true,
      screenWidth: 1950,
      sizingType: 'percentage',
      percentage: 33.33,
      width: 650,
      height: 100,
    },
  });
  const compressor = useCompressor(compressorType);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setFocus('settings');
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

  const handleCompressClick = () => {
    const requestedDevices = Object.entries(deviceConfig)
      .filter(([, config]) => config.enabled)
      .map(([device]) => device) as Device[];
    Promise.allSettled(
      files.map((file) => createJob(file, requestedDevices, deviceConfig)),
    ).then((jobCreationResults) => {
      const fulfilledJobs = jobCreationResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
      setJobs((prev) => [...prev, ...fulfilledJobs]);
      setFiles([]);
      setFocus('results');
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

    compressor.compress(
      jobToRun.id,
      jobToRun.originalFile,
      jobToRun.requestedFormats,
      jobToRun.requestedDimensions,
      (jobId: string, format: Format, device: Device, progress?: number) => {
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(prevJobs, jobId, device, format, {
            status: 'running',
            percentage: progress && Math.floor(progress * 100),
          });
        });
      },
      (jobId: string, format: Format, device: Device, output: File) => {
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(prevJobs, jobId, device, format, {
            status: 'completed',
            result: output,
          });
        });
      },
      (jobId: string, format: Format, device: Device, message: string) => {
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(prevJobs, jobId, device, format, {
            status: 'errored',
            errorMessage: message,
          });
        });
      },
    );
  }, [jobs, compressor]);

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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {seoTranslation.title}
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          {seoTranslation.subtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 items-start">
        <div ref={uploadRef} className="scroll-mt-20">
          <FileUpload
            onFilesAdded={handleFilesAdded}
            type={compressorType}
            translations={uploadTranslation}
          />
        </div>
        {files.length > 0 && (
          <div ref={settingsRef} className="scroll-mt-20">
            <DimensionsSettings
              handelClickAddMoreFiles={() => {
                setFocus('upload');
              }}
              handleRemoveFile={handleRemoveFile}
              files={files}
              config={deviceConfig}
              setConfig={setDeviceConfig}
              handleCompressClick={handleCompressClick}
              translation={settingTranslation}
              devicesTranslation={devicesTranslation}
            />
          </div>
        )}
        {jobs.length > 0 && (
          <div ref={resultsRef} className="scroll-mt-20">
            <Results
              jobs={jobs}
              handleRemoveJob={handleRemoveJob}
              translation={resultTranslation}
              devicesTranslation={devicesTranslation}
            />
          </div>
        )}
      </div>
    </div>
  );
}
