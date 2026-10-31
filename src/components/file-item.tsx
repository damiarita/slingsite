import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Code, Download, Info, Package, X } from 'lucide-react';
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

export const FileItem = ({
  onRemove,
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
  const started = entries.some(({ task }) => task.status !== 'waiting');
  const failed = entries.some(({ task }) => task.status === 'errored');
  const progress = jobProgress(job);
  const formats = [
    ...new Set(Object.values(tasks).flatMap((t) => Object.keys(t))),
  ] as Format[];
  const markup = done ? getJobPictureMarkup(job) : undefined;
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
          className="block h-full origin-left bg-accent transition-transform duration-200 ease-linear rtl:origin-right"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
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
                      <td key={format} className="px-4 py-2 whitespace-nowrap">
                        {task && (
                          <TaskCell
                            task={task}
                            fileName={
                              job.outputFileNames[configName]?.[format] ??
                              format
                            }
                            originalSize={originalFile.size}
                            onDownload={() => onDownloadOne(configName, format)}
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
      {done && completedCount > 0 && (
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
