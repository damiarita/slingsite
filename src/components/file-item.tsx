import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, Code, Copy, Download, Info, Package, X } from 'lucide-react';
import { type Format, formatNames } from '@/utils/formats';
import type { Job, Task } from '@/types/job';
import {
  jobProgress,
  jobProportionOfDoneTasks,
  jobTaskEntries,
} from '@/utils/jobs';
import { IconButton, SecondaryButton } from './buttons';
import { GoogleDriveButton } from './google-drive-button';
import { PictureCode } from './picture-code';
import { ResultsDictionary } from '@/i18n/type';
import { persistenceType } from '@/types/persistence';
import { getJobPictureMarkup } from '@/utils/picture-markup';
import {
  type PluralForms,
  fill,
  formatBytes,
  formatCount,
  formatNumber,
} from '@/utils/i18n-format';

type FileItemProps = {
  onRemove: () => void;
  onAltChange: (text: string) => void;
  onDownloadAll: (type: persistenceType) => void;
  onDownloadOne: (configName: string, format: Format) => void;
  job: Job;
  translation: ResultsDictionary;
  fileCount: PluralForms;
};

const pillClass =
  'rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap tabular-nums';

// One output in the table: queued, working, its size and saving, or the error.
function TaskCell({
  task,
  fileName,
  originalSize,
  onDownload,
  translation,
}: {
  task: Task;
  fileName: string;
  originalSize: number;
  onDownload: () => void;
  translation: ResultsDictionary;
}) {
  const locale = useLocale();
  switch (task.status) {
    case 'waiting':
      return <span className="text-muted">{translation.queued}</span>;
    case 'running':
      return (
        <span className="inline-flex items-center gap-2 text-warn">
          <span
            className="size-2.5 animate-spin rounded-full border-2 border-current border-e-transparent"
            aria-hidden="true"
          />
          {task.percentage ? `${task.percentage}%` : translation.working}
        </span>
      );
    case 'errored':
      return (
        <span
          className="inline-flex items-center gap-1 text-error"
          title={task.errorMessage}
        >
          <Info className="size-4" aria-hidden="true" />
          {translation.failed}
          <span className="sr-only">: {task.errorMessage}</span>
        </span>
      );
    case 'completed': {
      const change = task.result.size / originalSize - 1;
      return (
        <span className="inline-flex items-center gap-2">
          {formatBytes(locale, task.result.size)}
          <span
            className={
              change < 0 ? 'font-semibold text-accent-deep' : 'text-muted'
            }
          >
            {formatNumber(locale, change, {
              style: 'percent',
              signDisplay: 'exceptZero',
              maximumFractionDigits: 0,
            })}
          </span>
          <IconButton
            label={fill(translation.downloadFile, { name: fileName })}
            onClick={onDownload}
            className="size-9 before:absolute before:-inset-1"
          >
            <Download className="size-4" aria-hidden="true" />
          </IconButton>
        </span>
      );
    }
  }
}

const backdrops = {
  checker:
    'bg-[repeating-conic-gradient(var(--color-paper-3)_0_25%,var(--color-paper)_0_50%)] bg-size-[1.5rem_1.5rem]',
  light: 'bg-white',
  dark: 'bg-black',
} as const;

// A finished cutout, over a checkerboard or a plain colour to judge the edges.
function CutoutPreview({
  file,
  translation,
}: {
  file: File;
  translation: ResultsDictionary;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [backdrop, setBackdrop] = useState<keyof typeof backdrops>('checker');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    if (imageRef.current) imageRef.current.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return (
    <div className="border-t border-rule px-4 py-3">
      <div className={`overflow-hidden rounded-input ${backdrops[backdrop]}`}>
        <img
          ref={imageRef}
          alt=""
          className="mx-auto max-h-96 object-contain"
        />
      </div>
      <div
        role="group"
        aria-label={translation.ai.previewBackground}
        className="mt-2 flex flex-wrap gap-2"
      >
        {(Object.keys(backdrops) as (keyof typeof backdrops)[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={backdrop === key}
            onClick={() => setBackdrop(key)}
            className="min-h-11 rounded-input border border-rule bg-paper px-3 text-sm text-ink transition-colors duration-150 hover:bg-paper-2 aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
          >
            {translation.ai.backdrops[key]}
          </button>
        ))}
      </div>
    </div>
  );
}

// The draft: the visitor can edit it, and the HTML snippet follows.
function AltField({
  jobId,
  text,
  onChange,
  translation,
}: {
  jobId: string;
  text: string;
  onChange: (text: string) => void;
  translation: ResultsDictionary;
}) {
  const [copied, setCopied] = useState(false);
  const fieldId = `alt-${jobId}`;
  return (
    <div className="border-t border-rule px-4 py-3">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4">
        <label htmlFor={fieldId} className="font-semibold">
          {translation.ai.altLabel}
        </label>
        <small className="text-sm text-muted">{translation.ai.altDraft}</small>
      </div>
      <textarea
        id={fieldId}
        dir="ltr"
        lang="en"
        rows={2}
        value={text}
        onChange={(event) => {
          setCopied(false);
          onChange(event.target.value);
        }}
        className="w-full rounded-input border border-muted bg-paper px-3 py-2 text-base text-ink"
      />
      <div className="mt-2">
        <SecondaryButton
          size="sm"
          onClick={() =>
            navigator.clipboard.writeText(text).then(() => setCopied(true))
          }
        >
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied ? translation.copied : translation.copy}
        </SecondaryButton>
      </div>
    </div>
  );
}

export const FileItem = ({
  onRemove,
  onAltChange,
  onDownloadAll,
  onDownloadOne,
  job,
  translation,
  fileCount,
}: FileItemProps) => {
  const locale = useLocale();
  const [showCode, setShowCode] = useState(false);
  const { originalFile, originalFileObjectURL, tasks } = job;
  const entries = jobTaskEntries(job);
  const done = jobProportionOfDoneTasks(job) === 1;
  const maskStep = job.removeBackground?.step;
  const altStep = job.alt?.step;
  const started =
    entries.some(({ task }) => task.status !== 'waiting') ||
    maskStep?.status === 'running' ||
    altStep?.status === 'running';
  const failed =
    entries.some(({ task }) => task.status === 'errored') ||
    altStep?.status === 'errored';
  const runningAiStep = [maskStep, altStep].find(
    (step) => step?.status === 'running',
  );
  const aiPercentage =
    runningAiStep?.status === 'running' ? runningAiStep.percentage : undefined;
  // The model reports nothing while it works, so there is no percentage.
  const aiWorking = Boolean(runningAiStep) && aiPercentage === undefined;
  const aiStatus = !runningAiStep
    ? undefined
    : aiPercentage !== undefined
      ? fill(translation.ai.downloadingModel, {
          percent: formatNumber(locale, aiPercentage / 100, {
            style: 'percent',
            maximumFractionDigits: 0,
          }),
        })
      : maskStep?.status === 'running'
        ? translation.ai.removingBackground
        : translation.ai.writingAlt;
  const maskIsEmpty = maskStep?.status === 'completed' && maskStep.result.empty;
  const cutout =
    job.removeBackground &&
    entries.find(({ task }) => task.status === 'completed')?.task;
  const progress = jobProgress(job);
  const formats = [
    ...new Set(Object.values(tasks).flatMap((t) => Object.keys(t))),
  ] as Format[];
  // Files are ready before the alt text, which comes last, so they can be
  // saved meanwhile. The snippet picks up the alt text when it arrives.
  const filesDone =
    entries.length > 0 &&
    entries.every(
      ({ task }) => task.status === 'completed' || task.status === 'errored',
    );
  const markup = filesDone ? getJobPictureMarkup(job) : undefined;
  const completedCount = entries.filter(
    ({ task }) => task.status === 'completed',
  ).length;

  return (
    <article
      aria-label={originalFile.name}
      className="overflow-hidden rounded-card border border-rule bg-paper"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {originalFile.type.startsWith('video/') || !originalFile.type ? (
          <video
            src={originalFileObjectURL}
            className="size-12 shrink-0 rounded-input object-cover"
            disablePictureInPicture
            muted
          />
        ) : (
          <img
            src={originalFileObjectURL}
            alt=""
            className="size-12 shrink-0 rounded-input object-cover"
          />
        )}
        <p className="min-w-0 flex-1">
          <b className="block truncate font-semibold" title={originalFile.name}>
            {originalFile.name}
          </b>
          <small className="text-sm text-muted tabular-nums">
            {formatNumber(locale, job.originalDimensions.width)}
            {' × '}
            {formatNumber(locale, job.originalDimensions.height)},{' '}
            {formatBytes(locale, originalFile.size)}
          </small>
        </p>
        {done ? (
          failed ? (
            <span className={`${pillClass} bg-error-wash text-error`}>
              {translation.doneWithErrors}
            </span>
          ) : (
            <span className={`${pillClass} bg-accent-wash text-accent-deep`}>
              {translation.done}
            </span>
          )
        ) : aiWorking ? (
          <span className={`${pillClass} bg-warn-wash text-warn`}>
            {translation.working}
          </span>
        ) : started ? (
          <span className={`${pillClass} bg-warn-wash text-warn`}>
            {formatNumber(locale, progress, {
              style: 'percent',
              maximumFractionDigits: 0,
            })}
          </span>
        ) : (
          <span className={`${pillClass} bg-paper-2 text-muted`}>
            {translation.inQueue}
          </span>
        )}
        <IconButton
          label={fill(translation.removeFile, { name: originalFile.name })}
          onClick={onRemove}
        >
          <X className="size-5" aria-hidden="true" />
        </IconButton>
      </div>
      <div className="h-[3px] bg-paper-2" aria-hidden="true">
        <i
          className={`block h-full origin-left bg-accent transition-transform duration-200 ease-linear rtl:origin-right ${aiWorking ? 'animate-pulse motion-reduce:animate-none' : ''}`}
          style={{ transform: `scaleX(${aiWorking ? 1 : progress})` }}
        />
      </div>
      {aiStatus && (
        <p role="status" className="px-4 py-3 text-sm text-warn">
          {aiStatus}
        </p>
      )}
      {maskStep?.status === 'completed' && maskStep.result.empty && (
        <p className="flex items-center gap-2 border-t border-rule bg-warn-wash px-4 py-3 text-sm text-warn">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          {translation.ai.noSubject}
        </p>
      )}
      {altStep?.status === 'errored' && (
        <p className="flex items-center gap-2 border-t border-rule bg-error-wash px-4 py-3 text-sm text-error">
          <Info className="size-4 shrink-0" aria-hidden="true" />
          {translation.ai.altFailed}
        </p>
      )}
      {altStep?.status === 'completed' && (
        <AltField
          jobId={job.id}
          text={altStep.result.text}
          onChange={onAltChange}
          translation={translation}
        />
      )}
      {cutout?.status === 'completed' && !maskIsEmpty && (
        <CutoutPreview file={cutout.result} translation={translation} />
      )}
      {entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-muted">
                <th scope="col" className="px-4 py-2 text-start font-normal">
                  {translation.sizeColumn}
                </th>
                {formats.map((format) => (
                  <th
                    key={format}
                    scope="col"
                    className="px-4 py-2 text-start font-normal whitespace-nowrap"
                  >
                    {formatNames[format]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(tasks).map(([configName, configTasks]) => {
                const dimensions = job.requestedDimensions[configName];
                return (
                  <tr key={configName} className="border-t border-rule">
                    <th
                      scope="row"
                      className="px-4 py-2 text-start font-normal whitespace-nowrap"
                    >
                      <b className="me-2 font-semibold">{configName}</b>
                      {dimensions && (
                        <small className="text-muted">
                          {formatNumber(locale, dimensions.width)}
                          {' × '}
                          {formatNumber(locale, dimensions.height)}
                        </small>
                      )}
                    </th>
                    {formats.map((format) => {
                      const task = configTasks[format];
                      return (
                        <td
                          key={format}
                          className="px-4 py-2 whitespace-nowrap"
                        >
                          {task && (
                            <TaskCell
                              task={task}
                              fileName={
                                job.outputFileNames[configName]?.[format] ??
                                format
                              }
                              originalSize={originalFile.size}
                              onDownload={() =>
                                onDownloadOne(configName, format)
                              }
                              translation={translation}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {filesDone && completedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-rule bg-paper-2 px-4 py-3">
          <span className="me-auto text-sm text-muted">
            {fill(translation.filesReady, {
              files: formatCount(locale, completedCount, fileCount),
            })}
          </span>
          {markup && (
            <SecondaryButton
              size="sm"
              aria-expanded={showCode}
              onClick={() => setShowCode((v) => !v)}
            >
              <Code className="size-4" aria-hidden="true" />
              {showCode ? translation.hideHtml : translation.getHtml}
            </SecondaryButton>
          )}
          <SecondaryButton size="sm" onClick={() => onDownloadAll('device')}>
            <Package className="size-4" aria-hidden="true" />
            {translation.download}
          </SecondaryButton>
          <GoogleDriveButton
            onClick={() => onDownloadAll('googleDrive')}
            label={translation.saveToDrive}
            iconOnly
          />
        </div>
      )}
      {markup && showCode && (
        <PictureCode markup={markup} translation={translation} />
      )}
    </article>
  );
};
