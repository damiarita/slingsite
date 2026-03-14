import { Job, Task } from '@/types/job';
import { jobProportionOfDoneTasks } from '@/utils/jobs';
import { FileItem } from './file-item';
import { Device } from '@/types/devices';
import { Format } from '@/utils/formats';
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
  devicesTranslation: Record<Device, string>;
};

function getPersistenceJobs(
  jobs: Job[],
  type: persistenceType,
): FilePersistenceJob[] {
  const persistenceJobs: FilePersistenceJob[] = [];
  for (const job of jobs) {
    for (const [device, formats] of Object.entries(job.tasks) as [
      Device,
      Partial<Record<Format, Task>>,
    ][]) {
      for (const [format] of Object.entries(formats) as [Format, Task][]) {
        const task = job.tasks[device]?.[format];
        if (task && task.status === 'completed' && task.result) {
          persistenceJobs.push({
            file: task.result,
            id: `${job.id}-${device}-${format}`,
            type,
            status: { status: 'waiting' },
          });
        }
      }
    }
  }
  return persistenceJobs;
}

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

export const Results = ({
  jobs,
  handleRemoveJob,
  translation,
  devicesTranslation,
}: Props) => {
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[200px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {translation.yourFiles}
        </h3>
        <PrimaryButton
          onClick={() => {
            const persistenceJobs = getPersistenceJobs(jobs, 'device');
            addPersistenceJobs(persistenceJobs);
            downloadAllFiles(persistenceJobs, (id, status) =>
              setPersistenceJobs((currentJobs) =>
                chagePersistanceJobStatus(currentJobs, id, status),
              ),
            );
          }}
          disabled={!jobs.some((job) => jobProportionOfDoneTasks(job) > 0)}
        >
          <Package className="w-4 h-4 mr-2" /> {translation.downloadAllFiles}
        </PrimaryButton>
        <GoogleDriveButton
          onClick={() => {
            const persistenceJobs = getPersistenceJobs(jobs, 'googleDrive');
            addPersistenceJobs(persistenceJobs);
            uploadFilesToGoogleDrive(persistenceJobs, (id, status) =>
              setPersistenceJobs((currentJobs) =>
                chagePersistanceJobStatus(currentJobs, id, status),
              ),
            );
          }}
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
              onDownloadOne={(file: File) => {
                downloadResultFile(file);
              }}
              onDownloadAll={(persistenceType) => {
                const jobs = getPersistenceJobs([job], persistenceType);
                setPersistenceJobs((currentJobs) => [...currentJobs, ...jobs]);
                if (persistenceType === 'device') {
                  downloadAllFiles(jobs, (id, status) =>
                    setPersistenceJobs((currentJobs) =>
                      chagePersistanceJobStatus(currentJobs, id, status),
                    ),
                  );
                } else if (persistenceType === 'googleDrive') {
                  uploadFilesToGoogleDrive(jobs, (id, status) =>
                    setPersistenceJobs((currentJobs) =>
                      chagePersistanceJobStatus(currentJobs, id, status),
                    ),
                  );
                }
              }}
              job={job}
              translation={translation}
              devicesTranslation={devicesTranslation}
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
