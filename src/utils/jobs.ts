import type {
  DimensionsConfig,
  FormatConfig,
  SizingConfigs,
} from '@/types/config';
import type { Job, Task } from '@/types/job';
import type { MediaDimensions } from '@/types/mediaDimensions';
import { Format, imageFormats, videoFormats } from '@/utils/formats';
import {
  getMediumSize,
  scaleToHeight,
  scaleToWidth,
} from '@/utils/mediaDimensions';

const getEnabledConfigNames = (configs: SizingConfigs): string[] =>
  Object.entries(configs)
    .filter(([, config]) => config.enabled)
    .map(([configName]) => configName);

export const dimensionsConfigIsValid = (config: DimensionsConfig): boolean =>
  getEnabledConfigNames(config.sizes).length > 0;

export const formatConfigIsValid = (config: FormatConfig): boolean =>
  config.formats.length > 0 &&
  (!config.resize ||
    (config.versions.length > 0 &&
      config.versions.every((version) => version.value[version.type] > 0)));

// Used by the compress pages: one entry per enabled device, and the formats
// are fixed by the file type (videos also get a poster in every image format).
export const createDimensionsJob = (
  file: File,
  config: DimensionsConfig,
): Promise<Job> =>
  createJob(file, config.keepAudio, (originalDimensions) => {
    const configs = config.sizes;
    const requestedFormats: Format[] = file.type.startsWith('image/')
      ? [...imageFormats]
      : [...videoFormats, ...imageFormats];
    const requestedDimensions: Record<string, MediaDimensions> = {};
    const formatsByConfig: Record<string, Format[]> = {};
    getEnabledConfigNames(configs).forEach((configName) => {
      const sizing = configs[configName];
      if (sizing.sizingType === 'height') {
        requestedDimensions[configName] = scaleToHeight(
          originalDimensions,
          sizing.height,
        );
      } else if (sizing.sizingType === 'width') {
        requestedDimensions[configName] = scaleToWidth(
          originalDimensions,
          sizing.width,
        );
      } else {
        requestedDimensions[configName] = scaleToWidth(
          originalDimensions,
          sizing.screenWidth * (sizing.percentage / 100),
        );
      }
      formatsByConfig[configName] = requestedFormats;
    });
    return { requestedDimensions, requestedFormats: formatsByConfig };
  });

// Used by the format pages. Without resizing there is a single output at the
// original size, named `unresizedName` (it shows in the results and filenames).
export const createFormatJob = (
  file: File,
  config: FormatConfig,
  unresizedName: string,
): Promise<Job> =>
  createJob(file, config.keepAudio, (originalDimensions) => {
    const requestedDimensions: Record<string, MediaDimensions> = {};
    const formatsByConfig: Record<string, Format[]> = {};
    if (!config.resize) {
      requestedDimensions[unresizedName] = originalDimensions;
      formatsByConfig[unresizedName] = [...config.formats];
    } else {
      config.versions.forEach((version) => {
        if (version.type === 'height') {
          requestedDimensions[version.name] = scaleToHeight(
            originalDimensions,
            version.value.height,
          );
        } else if (version.type === 'width') {
          requestedDimensions[version.name] = scaleToWidth(
            originalDimensions,
            version.value.width,
          );
        } else {
          requestedDimensions[version.name] = scaleToWidth(
            originalDimensions,
            originalDimensions.width * (version.value.percentage / 100),
          );
        }
        formatsByConfig[version.name] = [...config.formats];
      });
    }
    return { requestedDimensions, requestedFormats: formatsByConfig };
  });

async function createJob(
  file: File,
  keepAudio: boolean,
  plan: (originalDimensions: MediaDimensions) => {
    requestedDimensions: Record<string, MediaDimensions>;
    requestedFormats: Record<string, Format[]>;
  },
): Promise<Job> {
  try {
    const originalDimensions = await getMediumSize(file);
    const { requestedDimensions, requestedFormats } = plan(originalDimensions);
    const tasks: Record<string, Partial<Record<Format, Task>>> = {};
    for (const [configName, formats] of Object.entries(requestedFormats)) {
      tasks[configName] = {};
      for (const format of formats) {
        tasks[configName][format] = { status: 'waiting' };
      }
    }
    return {
      id: crypto.randomUUID(),
      originalFile: file,
      originalFileObjectURL: URL.createObjectURL(file),
      originalDimensions,
      requestedDimensions,
      requestedFormats,
      keepAudio,
      tasks,
    };
  } catch (error) {
    const errorMessage =
      'Failed to create job for file ' +
      file.name +
      ': ' +
      ((error as Error)?.message || String(error));
    console.error(errorMessage);
    return Promise.reject(errorMessage);
  }
}

export const jobIsIncomplete = (job: Job): boolean => {
  return jobTasksAsArray(job).some(
    (task) => task.status === 'running' || task.status === 'waiting',
  );
};

const jobTasksAsArray = (job: Job): Task[] => {
  return Object.values(job.tasks).flatMap((deviceTasks) =>
    Object.values(deviceTasks),
  );
};

export const jobIsRunning = (job: Job): boolean => {
  return jobTasksAsArray(job).some((task) => task.status === 'running');
};

export const jobProportionOfDoneTasks = (job: Job): number => {
  const tasksAsArray = jobTasksAsArray(job);
  const total = tasksAsArray.length;
  if (total === 0) return 1;
  const done = tasksAsArray.filter(
    (task) => task.status === 'completed' || task.status === 'errored',
  ).length;
  if (done >= total) return 1;
  return done / total;
};

// Like jobProportionOfDoneTasks, but running tasks count by their reported
// percentage. Videos report it per output; images don't, so they count as 0
// until done.
export const jobProgress = (job: Job): number => {
  const tasksAsArray = jobTasksAsArray(job);
  if (tasksAsArray.length === 0) return 1;
  const progress = tasksAsArray.reduce((sum, task) => {
    if (task.status === 'completed' || task.status === 'errored')
      return sum + 1;
    if (task.status === 'running') return sum + (task.percentage ?? 0) / 100;
    return sum;
  }, 0);
  return Math.min(progress / tasksAsArray.length, 1);
};
