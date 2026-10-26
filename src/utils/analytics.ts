import type {
  AnalyticsEvent,
  FileEntry,
  PageContext,
  TaskDetails,
  TaskEntry,
} from '@/types/analytics';
import type { CompressionInput } from '@/types/compressor';
import type { Job } from '@/types/job';
import type { MediaDimensions } from '@/types/mediaDimensions';
import { type Format, getInputFormat, isImageFormat } from '@/utils/formats';

// GA4 drops the items after the 200th, so a bigger array is split into
// several pushes of the same event.
const maxEntriesPerEvent = 200;

let lastPageKey: string | undefined;

function push(message: object) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(message);
}

// gtag commands (consent) must be pushed as an `arguments` object.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

// Called on every page load and client navigation. The same page and context
// twice in a row is one view (StrictMode runs effects twice in dev).
export function setPageContext(context: PageContext) {
  const pageKey = JSON.stringify([window.location.pathname, context]);
  if (pageKey === lastPageKey) return;
  lastPageKey = pageKey;
  push({
    event: 'page_context',
    ...context,
  });
}

// GTM merges arrays by index (pushing [a] onto [a, b, c] leaves [a, b, c]),
// so an event's array is cleared right before the event.
export function trackEvent(event: AnalyticsEvent) {
  const [arrayKey, entries] =
    Object.entries(event).find((entry): entry is [string, unknown[]] =>
      Array.isArray(entry[1]),
    ) ?? [];
  if (!arrayKey || !entries) {
    push(event);
    return;
  }
  for (let i = 0; i === 0 || i < entries.length; i += maxEntriesPerEvent) {
    push({ [arrayKey]: null });
    push({ ...event, [arrayKey]: entries.slice(i, i + maxEntriesPerEvent) });
  }
}

export const getMediaType = (file: File): CompressionInput =>
  file.type.startsWith('image/') ? 'image' : 'video';

const getOutputType = (format: Format): CompressionInput =>
  isImageFormat(format) ? 'image' : 'video';

const getTaskId = (job: Job, configName: string, format: Format) =>
  job.taskIds[configName]?.[format] ?? '';

export const fileEntry = (
  fileId: string,
  file: File,
  dimensions: MediaDimensions | undefined,
): FileEntry => ({
  item_id: fileId,
  item_name: 'file',
  file_id: fileId,
  file_type: getMediaType(file),
  file_format: getInputFormat(file),
  width: dimensions?.width,
  height: dimensions?.height,
  size_bytes: file.size,
});

export const jobContext = (job: Job) => ({
  conversion_id: job.conversionId,
  job_id: job.id,
  file_id: job.fileId,
});

export const taskDetails = (
  job: Job,
  configName: string,
  format: Format,
): TaskDetails => ({
  ...jobContext(job),
  task_id: getTaskId(job, configName, format),
  file_type: getMediaType(job.originalFile),
  file_format: getInputFormat(job.originalFile),
  input_size_bytes: job.originalFile.size,
  output_type: getOutputType(format),
  output_format: format,
  output_width: job.requestedDimensions[configName]?.width ?? 0,
  output_height: job.requestedDimensions[configName]?.height ?? 0,
});

// The slim entry of downloads and Drive uploads: the rest joins by task_id.
export const taskEntry = (
  job: Job,
  configName: string,
  format: Format,
  output: File,
): TaskEntry => {
  const taskId = getTaskId(job, configName, format);
  return {
    item_id: taskId,
    item_name: 'task',
    task_id: taskId,
    output_type: getOutputType(format),
    output_format: format,
    output_size_bytes: output.size,
  };
};

export const sumBy = <T>(entries: T[], value: (entry: T) => number) =>
  entries.reduce((sum, entry) => sum + value(entry), 0);
