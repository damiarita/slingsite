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

export const downloadAllFiles = (jobs: Job[]) => {
  jobs.forEach((job) => {
    (
      Object.entries(job.tasks) as [Device, Partial<Record<Format, Task>>][]
    ).forEach(([device, formats]) => {
      (Object.entries(formats) as [Format, Task][]).forEach(([format]) => {
        downloadResultFile(job, device, format);
      });
    });
  });
};
