import type { Job } from '@/types/job';
import { jobProportionOfDoneTasks, jobTaskEntries } from '@/utils/jobs';
import { FileItem } from './file-item';
import type { Format } from '@/utils/formats';
import type { PersistenceScope, TaskOutcome } from '@/types/analytics';
import { sumBy, taskEntry, trackEvent } from '@/utils/analytics';
import { Package } from 'lucide-react';
import { downloadAllFiles, downloadResultFile } from '@/utils/persistence';
import { PrimaryButton } from './buttons';
import { GoogleDriveButton } from './google-drive-button';
import { ResultsDictionary } from '@/i18n/type';
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
  translation: ResultsDictionary;
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

export const Results = ({ jobs, handleRemoveJob, translation }: Props) => {
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[200px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {translation.yourFiles}
        </h3>
        <PrimaryButton
          onClick={() => persistTasks(getCompletedTasks(jobs), 'device', 'all')}
          disabled={!jobs.some((job) => jobProportionOfDoneTasks(job) > 0)}
        >
          <Package className="w-4 h-4 mr-2" /> {translation.downloadAllFiles}
        </PrimaryButton>
        <GoogleDriveButton
          onClick={() =>
            persistTasks(getCompletedTasks(jobs), 'googleDrive', 'all')
          }
          disabled={!jobs.some((job) => jobProportionOfDoneTasks(job) > 0)}
          className="ml-2"
        />
      </div>
      {jobs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>{translation.uploadMoreFiles}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, index) => (
            <FileItem
              key={job.id}
              onRemove={() => handleRemoveJob(index)}
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
            />
          ))}
        </div>
      )}
      {persistenceJobs.length > 0 && showPersistencePanel && (
        <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[94vw] bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-800">Upload status</p>
            <button
              type="button"
              onClick={() => setShowPersistencePanel(false)}
              className="p-1 rounded hover:bg-gray-200"
              title="Close"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="max-h-72 overflow-auto p-4 space-y-3">
            {persistenceJobs.map((job) => (
              <div
                key={job.id}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <p className="text-sm font-medium text-gray-700 mb-2 truncate">
                  {job.file.name}
                </p>
                {job.status.status === 'running' && (
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${job.status.percentage}%` }}
                    />
                  </div>
                )}
                {job.status.status === 'waiting' && (
                  <p className="text-xs text-gray-500">Waiting to start...</p>
                )}
                {job.status.status === 'completed' && (
                  <p className="text-xs text-green-600 font-medium">
                    Upload completed
                  </p>
                )}
                {job.status.status === 'errored' && (
                  <p className="text-xs text-red-600 font-medium">
                    Upload failed: {job.status.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {persistenceJobs.length > 0 && !showPersistencePanel && (
        <button
          type="button"
          onClick={() => setShowPersistencePanel(true)}
          className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50"
          title="Show upload progress"
        >
          <Package className="w-4 h-4 text-gray-600" />
          <span className="sr-only">Show upload progress</span>
        </button>
      )}
    </div>
  );
};
