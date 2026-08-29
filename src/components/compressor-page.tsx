'use client';

import { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/file-upload';
import { Results } from '@/components/results';
import { DimensionsSettings } from '@/components/dimension-settings';
import useCompressor from '@/hooks/use-compressor';
import type { Format } from '@/utils/formats';
import type { Job, Task } from '@/types/job';
import { createJob, jobIsIncomplete } from '@/utils/jobs';
import type { CompressionInput } from '@/types/compressor';
import type {
  CompressionPageSeoTranslations,
  ResultsDictionary,
  SettingsDictionary,
  UploadDictionary,
} from '@/i18n/type';
import Script from 'next/script';
import { SizingConfigs } from '@/types/config';

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

export default function App({
  compressorType,
  initialConfig,
  seoTranslation,
  uploadTranslation,
  settingTranslation,
  resultTranslation,
}: {
  compressorType: CompressionInput;
  initialConfig: SizingConfigs;
  seoTranslation: CompressionPageSeoTranslations;
  uploadTranslation: UploadDictionary;
  settingTranslation: SettingsDictionary;
  resultTranslation: ResultsDictionary;
}) {
  const [focus, setFocus] = useState<Focus>('initial');
  const [files, setFiles] = useState<File[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const uploadRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [configs, setConfigs] = useState<SizingConfigs>(initialConfig);
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

  const handleProcessClick = () => {
    const requestedConfignames = Object.entries(configs)
      .filter(([, config]) => config.enabled)
      .map(([device]) => device);
    Promise.allSettled(
      files.map((file) => createJob(file, requestedConfignames, configs)),
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
      (
        jobId: string,
        format: Format,
        configName: string,
        progress?: number,
      ) => {
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
      (jobId: string, format: Format, configName: string, message: string) => {
        setJobs((prevJobs) => {
          return getJobWithUpdatedTask(prevJobs, jobId, configName, format, {
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

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    applicationCategory: 'BrowserApplication',
    name: 'SlingSite',
    offers: { '@type': 'Offer', price: 0 },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      reviewCount: 100,
      bestRating: 5,
    },
    isAccessibleForFree: true,
  };

  return (
    <>
      <Script type="application/ld+json">{JSON.stringify(schema)}</Script>
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
                handleClickAddMoreFiles={() => {
                  setFocus('upload');
                }}
                handleRemoveFile={handleRemoveFile}
                files={files}
                configs={configs}
                setConfig={setConfigs}
                handleProcessClick={handleProcessClick}
                translation={settingTranslation}
              />
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
        </div>
      </div>
    </>
  );
}
