import type { Job } from '@/types/job';
import {
  jobIsIncomplete,
  jobProportionOfDoneTasks,
  jobTaskEntries,
} from '@/utils/jobs';
import { FileItem } from './file-item';
import type { Format } from '@/utils/formats';
import type { PersistenceScope, TaskOutcome } from '@/types/analytics';
import { sumBy, taskEntry, trackEvent } from '@/utils/analytics';
import { Cpu, Package, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { downloadAllFiles, downloadResultFile } from '@/utils/persistence';
import { IconButton, PrimaryButton } from './buttons';
import { GoogleDriveButton } from './google-drive-button';
import { StepHeading } from './settings-section';
import { CompressorAppDictionary, ResultsDictionary } from '@/i18n/type';
import { fill, formatBytes, formatCount } from '@/utils/i18n-format';
import { uploadFilesToGoogleDrive } from '@/utils/google-drive';
import {
  FilePersistenceJob,
  FilePersistenceJobStatus,
  persistenceType,
} from '@/types/persistence';
import { useState } from 'react';

type Props = {
  jobs: Job[];
  handleRemoveJob: (index: number) => void;
  onAltChange: (jobId: string, text: string) => void;
  translation: ResultsDictionary;
  counts: CompressorAppDictionary['counts'];
};

type CompletedTask = {
  job: Job;
  configName: string;
  format: Format;
  file: File;
};

function getCompletedTasks(
  jobs: Job[],
  only?: { configName: string; format: Format },
): CompletedTask[] {
  return jobs.flatMap((job) =>
    jobTaskEntries(job).flatMap(({ configName, format, task }) =>
      task.status === 'completed' &&
      (!only || (only.configName === configName && only.format === format))
        ? [{ job, configName, format, file: task.result }]
        : [],
    ),
  );
}

const getTaskId = ({ job, configName, format }: CompletedTask) =>
  job.taskIds[configName]?.[format] ?? `${job.id}-${configName}-${format}`;

const getTaskEntries = (tasks: CompletedTask[]) =>
  tasks.map((task) =>
    taskEntry(task.job, task.configName, task.format, task.file),
  );

function chagePersistanceJobStatus(
  jobs: FilePersistenceJob[],
  jobId: string,
  status: FilePersistenceJobStatus,
) {
  return jobs.map((job) => {
    if (job.id !== jobId) return job;
    return {
      ...job,
      status,
    };
  });
}

// Step 3: every job with its outputs, and the ways to save them.
export const Results = ({
  jobs,
  handleRemoveJob,
  onAltChange,
  translation,
  counts,
}: Props) => {
  const locale = useLocale();
  const [persistenceJobs, setPersistenceJobs] = useState<FilePersistenceJob[]>(
    [],
  );
  const [showPersistencePanel, setShowPersistencePanel] = useState(true);

  const addPersistenceJobs = (newJobs: FilePersistenceJob[]) => {
    setPersistenceJobs((currentJobs) => {
      const existingIds = new Set(currentJobs.map((j) => j.id));
      const uniqueJobs = newJobs.filter((j) => !existingIds.has(j.id));
      if (uniqueJobs.length === 0) return currentJobs;
      setShowPersistencePanel(true);
      return [...currentJobs, ...uniqueJobs];
    });
  };

  const updatePersistenceJob = (id: string, status: FilePersistenceJobStatus) =>
    setPersistenceJobs((currentJobs) =>
      chagePersistanceJobStatus(currentJobs, id, status),
    );

  // Downloads or uploads the outputs of one click, and tracks it.
  const persistTasks = (
    tasks: CompletedTask[],
    type: persistenceType,
    scope: PersistenceScope,
  ) => {
    if (tasks.length === 0) return;
    const newJobs: FilePersistenceJob[] = tasks.map((task) => ({
      file: task.file,
      id: getTaskId(task),
      type,
      status: { status: 'waiting' },
    }));
    if (type === 'device') {
      if (scope === 'file') {
        downloadResultFile(tasks[0].file);
      } else {
        addPersistenceJobs(newJobs);
        downloadAllFiles(newJobs, updatePersistenceJob);
      }
      const entries = getTaskEntries(tasks);
      trackEvent({
        event: 'files_downloaded',
        scope,
        task_count: entries.length,
        total_size_bytes: sumBy(entries, (entry) => entry.output_size_bytes),
        tasks: entries,
      });
      return;
    }

    const uploadId = crypto.randomUUID();
    const entries = getTaskEntries(tasks);
    trackEvent({
      event: 'drive_upload_started',
      upload_id: uploadId,
      scope,
      task_count: entries.length,
      total_size_bytes: sumBy(entries, (entry) => entry.output_size_bytes),
      tasks: entries,
    });
    const outcomes = new Map<string, TaskOutcome>();
    let finished = false;
    const trackFinished = () => {
      if (finished) return;
      finished = true;
      const uploaded = entries.map((entry) => ({
        ...entry,
        upload_status: outcomes.get(entry.task_id) ?? ('errored' as const),
      }));
      const completedCount = uploaded.filter(
        (entry) => entry.upload_status === 'completed',
      ).length;
      trackEvent({
        event: 'drive_upload_finished',
        upload_id: uploadId,
        scope,
        task_count: uploaded.length,
        completed_count: completedCount,
        errored_count: uploaded.length - completedCount,
        tasks: uploaded,
      });
    };
    addPersistenceJobs(newJobs);
    uploadFilesToGoogleDrive(newJobs, (id, status) => {
      updatePersistenceJob(id, status);
      if (status.status === 'completed' || status.status === 'errored') {
        outcomes.set(id, status.status);
        if (outcomes.size === newJobs.length) trackFinished();
      }
    }).catch((error) => {
      // Sign-in or folder picking failed or was cancelled: nothing uploaded.
      console.error('Google Drive upload error:', error);
      for (const job of newJobs) {
        if (!outcomes.has(job.id)) outcomes.set(job.id, 'errored');
      }
      trackFinished();
    });
  };

  const completed = getCompletedTasks(jobs);
  const anyDone = jobs.some((job) => jobProportionOfDoneTasks(job) > 0);
  const t = translation.upload;
  // Alt text pages: the results are text, with no files to save.
  const hasFiles = jobs.some((job) => jobTaskEntries(job).length > 0);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <StepHeading number={3} id="results-title">
          {translation.title}
        </StepHeading>
        <p className="text-sm text-muted" aria-live="polite">
          {completed.length > 0 &&
            fill(translation.totals, {
              files: formatCount(locale, completed.length, counts.file),
              size: formatBytes(
                locale,
                sumBy(completed, (task) => task.file.size),
              ),
            })}
        </p>
        {hasFiles && (
          <div className="flex flex-wrap gap-3 lg:ms-auto">
            <PrimaryButton
              size="sm"
              onClick={() => persistTasks(completed, 'device', 'all')}
              disabled={!anyDone}
            >
              <Package className="size-4" aria-hidden="true" />
              {translation.downloadAll}
            </PrimaryButton>
            <GoogleDriveButton
              onClick={() => persistTasks(completed, 'googleDrive', 'all')}
              disabled={!anyDone}
              label={translation.saveToDrive}
            />
          </div>
        )}
      </div>
      {jobs.some(jobIsIncomplete) && (
        <p className="mb-6 flex items-center gap-2 rounded-input bg-warn-wash px-4 py-3 text-sm text-warn">
          <Cpu className="size-5 shrink-0" aria-hidden="true" />
          {translation.keepTabOpen}
        </p>
      )}
      <div className="grid gap-4">
        {jobs.map((job, index) => (
          <FileItem
            key={job.id}
            onRemove={() => handleRemoveJob(index)}
            onAltChange={(text) => onAltChange(job.id, text)}
            onDownloadOne={(configName, format) =>
              persistTasks(
                getCompletedTasks([job], { configName, format }),
                'device',
                'file',
              )
            }
            onDownloadAll={(persistenceType) =>
              persistTasks(getCompletedTasks([job]), persistenceType, 'job')
            }
            job={job}
            translation={translation}
            fileCount={counts.file}
          />
        ))}
      </div>
      {persistenceJobs.length > 0 && showPersistencePanel && (
        <div className="fixed end-4 bottom-4 z-50 w-[360px] max-w-[calc(100%-2rem)] overflow-hidden rounded-card border border-rule bg-paper shadow-[0_16px_40px_-16px_var(--color-scrim)]">
          <div className="flex items-center justify-between border-b border-rule bg-paper-2 ps-4 pe-1 py-1">
            <p className="text-sm font-semibold text-ink">{t.title}</p>
            <IconButton
              label={t.close}
              onClick={() => setShowPersistencePanel(false)}
            >
              <X className="size-4" aria-hidden="true" />
            </IconButton>
          </div>
          <ul className="grid max-h-72 gap-3 overflow-auto p-4">
            {persistenceJobs.map((job) => (
              <li key={job.id} className="rounded-input border border-rule p-3">
                <p className="mb-2 truncate text-sm font-semibold text-ink">
                  {job.file.name}
                </p>
                {job.status.status === 'running' && (
                  <div className="h-2 overflow-hidden rounded-full bg-paper-3">
                    <div
                      className="h-full origin-left bg-accent rtl:origin-right"
                      style={{
                        transform: `scaleX(${job.status.percentage / 100})`,
                      }}
                    />
                  </div>
                )}
                {job.status.status === 'waiting' && (
                  <p className="text-xs text-muted">{t.waiting}</p>
                )}
                {job.status.status === 'completed' && (
                  <p className="text-xs font-semibold text-accent-deep">
                    {t.completed}
                  </p>
                )}
                {job.status.status === 'errored' && (
                  <p className="text-xs font-semibold text-error">
                    {fill(t.failed, { message: job.status.errorMessage })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {persistenceJobs.length > 0 && !showPersistencePanel && (
        <button
          type="button"
          onClick={() => setShowPersistencePanel(true)}
          className="fixed end-4 bottom-4 z-50 grid size-12 place-items-center rounded-full border border-rule bg-paper text-ink shadow-[0_8px_24px_-12px_var(--color-scrim)] hover:bg-paper-2"
          title={t.show}
        >
          <Package className="size-5" aria-hidden="true" />
          <span className="sr-only">{t.show}</span>
        </button>
      )}
    </>
  );
};
