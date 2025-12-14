import { Device } from '@/types/devices';
import { Format } from '@/utils/formats';
import { Job, Task } from '@/types/job';

export const downloadResultFile = (
  job: Job,
  device: Device,
  format: Format,
) => {
  const task = job.tasks[device]?.[format];
  if (task && task.status === 'completed') {
    const url = URL.createObjectURL(task.result);
    const a = document.createElement('a');
    a.href = url;
    a.download = task.result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

export const downloadAllFiles = async (jobs: Job[]) => {
  let count = 0;
  for (const job of jobs) {
    for (const [device, formats] of Object.entries(job.tasks) as [
      Device,
      Partial<Record<Format, Task>>,
    ][]) {
      for (const [format] of Object.entries(formats) as [Format, Task][]) {
        downloadResultFile(job, device, format);
        if (++count >= 10) {
          await pause(1000); //We need to wait 1s for Chrome to allow another 10files to download
          count = 0;
        }
      }
    }
  }
};

function pause(msec: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
