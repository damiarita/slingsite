import { Device } from '@/types/devices';
import { Format } from '@/utils/formats';
import { Job, Task } from '@/types/job';
import {
  FilePersistenceJob,
  FilePersistenceJobStatus,
} from '@/types/persistence';

export const downloadResultFile = (file: File) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadAllFiles = async (
  jobs: FilePersistenceJob[],
  onChange: (id: string, status: FilePersistenceJobStatus) => void,
) => {
  let count = 0;
  for (const job of jobs) {
    downloadResultFile(job.file);
    onChange(job.id, { status: 'completed' });
    if (++count >= 10) {
      await pause(1000); //We need to wait 1s for Chrome to allow another 10files to download
      count = 0;
    }
  }
};

function pause(msec: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
