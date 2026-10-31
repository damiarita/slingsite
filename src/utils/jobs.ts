import type {
  DimensionsConfig,
  FormatConfig,
  SizingConfig,
} from '@/types/config';
import type { Job, JobIds, Task } from '@/types/job';
import type { MediaDimensions } from '@/types/mediaDimensions';
import {
  type Format,
  getOriginalOutputFormat,
  isImageFormat,
  videoFormats,
  webImageFormats,
} from '@/utils/formats';
import {
  getCompressedFileName,
  getFileNameWithExtensionAndSuffix,
  getToolFileName,
  toFileSlug,
} from '@/utils/compressor/all';
import {
  getMediumSize,
  scaleToHeight,
  scaleToWidth,
} from '@/utils/mediaDimensions';

// What stops a Start click. The page turns it into a message and focuses the
// field (`id` is the size's or version's), instead of disabling the button.
export type SizesProblem =
  | { kind: 'noSizes' }
  | { kind: 'noName'; id: string }
  | { kind: 'duplicateName'; id: string; name: string }
  | { kind: 'duplicateFileName'; id: string; name: string; other: string }
  | { kind: 'screenWidth'; id: string }
  | { kind: 'exactSize'; id: string };

const isPositive = (value: number) => Number.isFinite(value) && value > 0;

// The ASCII slug that names a size's output files (see SizingConfig).
export const getSizeFileKey = (size: SizingConfig) =>
  (size.renamed && toFileSlug(size.name)) || size.id;

// Names key the results and file keys the output files, so both must be
// unique (names ignoring case, as most file systems do).
export function getSizesProblem(sizes: SizingConfig[]): SizesProblem | null {
  if (sizes.length === 0) return { kind: 'noSizes' };
  const seen = new Set<string>();
  const fileKeys = new Map<string, string>();
  for (const size of sizes) {
    const name = size.name.trim();
    if (!name) return { kind: 'noName', id: size.id };
    if (seen.has(name.toLowerCase()))
      return { kind: 'duplicateName', id: size.id, name };
    seen.add(name.toLowerCase());
    const other = fileKeys.get(getSizeFileKey(size));
    if (other !== undefined)
      return { kind: 'duplicateFileName', id: size.id, name, other };
    fileKeys.set(getSizeFileKey(size), name);
    if (!isPositive(size.screenWidth))
      return { kind: 'screenWidth', id: size.id };
    if (size.sizingType !== 'percentage' && !isPositive(size[size.sizingType]))
      return { kind: 'exactSize', id: size.id };
  }
  return null;
}

export type FormatConfigProblem =
  | { kind: 'noFormat' }
  | { kind: 'sizeValue'; index: number };

export function getFormatConfigProblem(
  config: FormatConfig,
): FormatConfigProblem | null {
  if (config.formats.length === 0 && !config.originalFormat)
    return { kind: 'noFormat' };
  if (config.resize) {
    const index = config.versions.findIndex(
      (version) => !isPositive(version.value[version.type]),
    );
    if (index !== -1) return { kind: 'sizeValue', index };
  }
  return null;
}

// The `sizes` attribute of the <picture> snippet offered for each image:
// smallest screen first, each size taking its share of the viewport (or its
// exact width).
export function getPictureSizes(
  sizes: SizingConfig[],
  requestedDimensions: Record<string, MediaDimensions>,
) {
  const sorted = [...sizes].sort((a, b) => a.screenWidth - b.screenWidth);
  return sorted
    .map((size, i) => {
      const slot =
        size.sizingType === 'percentage'
          ? `${Math.round(size.percentage)}vw`
          : `${requestedDimensions[size.name.trim()].width}px`;
      return i < sorted.length - 1
        ? `(max-width: ${size.screenWidth}px) ${slot}`
        : slot;
    })
    .join(', ');
}

// Used by the compress pages: one entry per size, and the formats
// are fixed by the file type (videos also get a poster in every web image
// format).
export const createDimensionsJob = (
  file: File,
  config: DimensionsConfig,
  ids: JobIds,
): Promise<Job> => {
  const isImage = file.type.startsWith('image/');
  const fileKeys = Object.fromEntries(
    config.sizes.map((size) => [size.name.trim(), getSizeFileKey(size)]),
  );
  const getFileName = (configName: string, format: Format) =>
    isImage || !isImageFormat(format)
      ? getCompressedFileName(file.name, fileKeys[configName], format)
      : getFileNameWithExtensionAndSuffix(
          file.name,
          format,
          `-thumbnail-compressed-${fileKeys[configName]}`,
        );
  return createJob(
    file,
    ids,
    config.keepAudio,
    getFileName,
    (originalDimensions) => {
      const requestedFormats: Format[] = isImage
        ? [...webImageFormats]
        : [...videoFormats, ...webImageFormats];
      const requestedDimensions: Record<string, MediaDimensions> = {};
      const formatsByConfig: Record<string, Format[]> = {};
      config.sizes.forEach((sizing) => {
        const configName = sizing.name.trim();
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
      return {
        requestedDimensions,
        requestedFormats: formatsByConfig,
        pictureSizes: isImage
          ? getPictureSizes(config.sizes, requestedDimensions)
          : undefined,
      };
    },
  );
};

// How the tool pages name their outputs. The results show the translated
// names ("Redimensionado-2", from `version.name` plus a number); the files
// use the English key with the same number (`photo-resized-2.jpg`), so they
// are the same in every language.
export type ToolOutputNames = {
  unresized: { name: string; fileKey: string };
  version: { name: string; fileKey: string };
};

const getVersionFileKey = (
  name: string,
  version: ToolOutputNames['version'],
) => {
  if (!name.startsWith(version.name))
    return toFileSlug(name) || version.fileKey;
  const number = toFileSlug(name.slice(version.name.length));
  return number ? `${version.fileKey}-${number}` : version.fileKey;
};

// Used by the format, resize and thumbnail pages. Without resizing there is a
// single output at the original size, named `names.unresized`.
export const createFormatJob = (
  file: File,
  config: FormatConfig,
  names: ToolOutputNames,
  ids: JobIds,
): Promise<Job> => {
  const unresizedName = names.unresized.name;
  const formats = [
    ...new Set([
      ...(config.originalFormat ? [getOriginalOutputFormat(file)] : []),
      ...config.formats,
    ]),
  ];
  const getFileName = (configName: string, format: Format) =>
    getToolFileName(
      file.name,
      config.resize
        ? getVersionFileKey(configName, names.version)
        : names.unresized.fileKey,
      format,
    );
  return createJob(
    file,
    ids,
    config.keepAudio,
    getFileName,
    (originalDimensions) => {
      const requestedDimensions: Record<string, MediaDimensions> = {};
      const formatsByConfig: Record<string, Format[]> = {};
      if (!config.resize) {
        requestedDimensions[unresizedName] = originalDimensions;
        formatsByConfig[unresizedName] = formats;
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
          formatsByConfig[version.name] = formats;
        });
      }
      return { requestedDimensions, requestedFormats: formatsByConfig };
    },
  );
};

async function createJob(
  file: File,
  ids: JobIds,
  keepAudio: boolean,
  getFileName: (configName: string, format: Format) => string,
  plan: (originalDimensions: MediaDimensions) => {
    requestedDimensions: Record<string, MediaDimensions>;
    requestedFormats: Record<string, Format[]>;
    pictureSizes?: string;
  },
): Promise<Job> {
  try {
    const originalDimensions = await getMediumSize(file);
    const { requestedDimensions, requestedFormats, pictureSizes } =
      plan(originalDimensions);
    const tasks: Record<string, Partial<Record<Format, Task>>> = {};
    const outputFileNames: Record<string, Partial<Record<Format, string>>> = {};
    const taskIds: Record<string, Partial<Record<Format, string>>> = {};
    for (const [configName, formats] of Object.entries(requestedFormats)) {
      tasks[configName] = {};
      outputFileNames[configName] = {};
      taskIds[configName] = {};
      for (const format of formats) {
        tasks[configName][format] = { status: 'waiting' };
        outputFileNames[configName][format] = getFileName(configName, format);
        taskIds[configName][format] = crypto.randomUUID();
      }
    }
    return {
      ...ids,
      id: crypto.randomUUID(),
      originalFile: file,
      originalFileObjectURL: URL.createObjectURL(file),
      originalDimensions,
      requestedDimensions,
      requestedFormats,
      keepAudio,
      outputFileNames,
      pictureSizes,
      taskIds,
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

export const jobTaskEntries = (
  job: Job,
): Array<{ configName: string; format: Format; task: Task }> =>
  Object.entries(job.tasks).flatMap(([configName, formats]) =>
    (Object.entries(formats) as [Format, Task][]).map(([format, task]) => ({
      configName,
      format,
      task,
    })),
  );

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
