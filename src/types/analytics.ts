import type { Locale } from '@/i18n/routing';
import type { Format } from '@/utils/formats';
import type { CompressionInput } from './compressor';

export type PageType =
  | 'home'
  | 'image'
  | 'video'
  | 'post'
  | 'postlisting'
  | 'subscribe'
  | 'redirect'
  | '404';

// Pushed (only) on every page load and client navigation. GTM keeps it in
// its data model, so every later event is sent with it.
export type PageContext = {
  locale: Locale;
  page_type: PageType;
  page_subtype: string;
};

export type TaskErrorKind =
  | 'codec_unsupported'
  | 'audio_unsupported'
  | 'decode_failed'
  | 'frame_extraction_failed'
  | 'encode_failed'
  | 'unknown';

export type TaskOutcome = 'completed' | 'errored';

// Entries of the event arrays, which GTM sends as GA4 `items` as they are:
// GA4 drops an item without `item_id` or `item_name`, so every entry starts
// with both. An event carries an array only for entities with no event of
// their own, so nothing is described twice. Only anonymous data: never file
// names or raw error messages (they can contain the file name).
export type FileEntry = {
  item_id: string;
  item_name: 'file';
  file_id: string;
  file_type: CompressionInput;
  file_format: string;
  width: number | undefined;
  height: number | undefined;
  size_bytes: number;
};

export type TaskEntry = {
  item_id: string;
  item_name: 'task';
  task_id: string;
  output_type: CompressionInput;
  output_format: Format;
  output_size_bytes: number;
};

export type UploadedTaskEntry = TaskEntry & {
  upload_status: TaskOutcome;
};

export type PersistenceScope = 'all' | 'job' | 'file';

export type JobContext = {
  conversion_id: string;
  job_id: string;
  file_id: string;
};

// Task events are flat and complete (input and output), so they can be
// reported on without joins.
export type TaskDetails = JobContext & {
  task_id: string;
  file_type: CompressionInput;
  file_format: string;
  input_size_bytes: number;
  output_type: CompressionInput;
  output_format: Format;
  output_width: number;
  output_height: number;
};

// The exact payload of every event. GTM's data model keeps old values, so
// every key is required: a value that doesn't apply is pushed as `undefined`
// (`T | undefined`, never `?:`). analytics/sync-gtm-container.mjs reads this
// type, so keep each event a `{…}` and/or named types joined by `&`.
export type AnalyticsEventParams = {
  files_added: {
    compressor_type: CompressionInput;
    file_count: number;
    total_size_bytes: number;
    files: FileEntry[];
  };
  conversion_started: {
    conversion_id: string;
    compressor_type: CompressionInput;
    job_count: number;
    failed_count: number;
    output_formats: string;
    config_count: number;
    resize: boolean;
    keep_audio: boolean | undefined;
    original_format: boolean;
  };
  // Once every job of the conversion has finished or been removed.
  conversion_finished: {
    conversion_id: string;
    compressor_type: CompressionInput;
    job_count: number;
    removed_count: number;
    task_count: number;
    completed_count: number;
    errored_count: number;
    input_size_bytes: number;
    output_size_bytes: number;
    elapsed_ms: number;
  };
  // When the job is sent to the worker.
  job_started: JobContext & {
    task_count: number;
  };
  // `elapsed_ms` on every `*_finished` counts from its `*_started`.
  job_finished: JobContext & {
    task_count: number;
    completed_count: number;
    errored_count: number;
    input_size_bytes: number;
    output_size_bytes: number;
    elapsed_ms: number | undefined;
  };
  // On the task's first progress message (or when it ends without one).
  task_started: TaskDetails;
  task_finished: TaskDetails & {
    status: TaskOutcome;
    error_kind: TaskErrorKind | undefined;
    output_size_bytes: number | undefined;
    elapsed_ms: number;
  };
  files_downloaded: {
    scope: PersistenceScope;
    task_count: number;
    total_size_bytes: number;
    tasks: TaskEntry[];
  };
  drive_upload_started: {
    upload_id: string;
    scope: PersistenceScope;
    task_count: number;
    total_size_bytes: number;
    tasks: TaskEntry[];
  };
  drive_upload_finished: {
    upload_id: string;
    scope: PersistenceScope;
    task_count: number;
    completed_count: number;
    errored_count: number;
    tasks: UploadedTaskEntry[];
  };
  newsletter_subscribe: Record<never, never>;
};

export type AnalyticsEventName = keyof AnalyticsEventParams;

export type AnalyticsEvent = {
  [Name in AnalyticsEventName]: { event: Name } & AnalyticsEventParams[Name];
}[AnalyticsEventName];
