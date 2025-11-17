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
import { createJob, jobIsWaiting } from '@/utils/jobs';
import { Locale } from '@/i18n/lib';
import { CompressionInput } from '@/types/compressor';
import { CompressionPageSeoTranslations } from '@/i18n/type';

function getJobWithUpdatedTask(
  jobs: Job[],
  jobIndex: number,
  device: Device,
  format: Format,
  newTask: Task,
) {
  return jobs.map((currentJob, index) => {
    if (index !== jobIndex) return currentJob;
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
  translation,
}: {
  locale: Locale;
  compressorType: CompressionInput;
  translation: CompressionPageSeoTranslations;
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
  const compressFunction = useCompressor(compressorType);

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
    if (!compressFunction) return; //compressor is not ready

    const runningJobIndex = jobs.findIndex((job) => jobIsWaiting(job));
    if (runningJobIndex === -1) return;

    const runningJob = jobs[runningJobIndex];

    compressFunction(
      runningJob.originalFile,
      runningJob.requestedFormats,
      runningJob.requestedDimensions,
      (format: Format, device: Device, progress?: number) => {
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(
            prevJobs,
            runningJobIndex,
            device,
            format,
            {
              status: 'running',
              percentage: progress && Math.floor(progress * 100),
            },
          );
        });
      },
      (format: Format, device: Device, output: File) => {
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(
            prevJobs,
            runningJobIndex,
            device,
            format,
            {
              status: 'completed',
              result: output,
            },
          );
        });
      },
    );
  }, [jobs, compressFunction]);

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
      {focus === 'initial' && (
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {translation.title}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {translation.subtitle}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 items-start">
        {focus !== 'settings' && (
          <div ref={uploadRef} className="scroll-mt-20">
            <FileUpload onFilesAdded={handleFilesAdded} type={compressorType} />
          </div>
        )}
        {focus === 'settings' && (
          <div ref={settingsRef} className="scroll-mt-20">
            <DimensionsSettings
              handleExitSettings={() => {
                setFocus('upload');
              }}
              handleRemoveFile={handleRemoveFile}
              files={files}
              config={deviceConfig}
              setConfig={setDeviceConfig}
              handleCompressClick={handleCompressClick}
            />
          </div>
        )}
        {jobs.length > 0 && (
          <div ref={resultsRef} className="scroll-mt-20">
            <Results jobs={jobs} handleRemoveJob={handleRemoveJob} />
          </div>
        )}
      </div>
    </div>
  );
}
