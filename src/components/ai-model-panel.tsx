'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { SecondaryButton } from './buttons';
import { SwitchRow } from './audio-settings';
import type { AiWorker } from '@/hooks/use-ai-worker';
import type { AiModelsDictionary } from '@/i18n/type';
import {
  type AiModelId,
  aiModels,
  isAiModelDownloaded,
} from '@/utils/ai-models';
import { fill, formatBytes, formatNumber } from '@/utils/i18n-format';

// What a model costs: its download and licence. Everything
// here reads local state, so showing it contacts nobody.
export function AiModelPanel({
  modelId,
  ai,
  translation: t,
}: {
  modelId: AiModelId;
  ai: AiWorker;
  translation: AiModelsDictionary;
}) {
  const locale = useLocale();
  const model = aiModels[modelId];
  const { loadState } = ai;
  const [downloaded, setDownloaded] = useState(false);
  const ready = loadState.status === 'ready' && loadState.modelId === modelId;

  useEffect(() => {
    isAiModelDownloaded(model).then(setDownloaded);
  }, [model, ready]);

  const loading =
    loadState.status === 'loading' && loadState.modelId === modelId
      ? loadState
      : undefined;
  const failed =
    loadState.status === 'errored' && loadState.modelId === modelId;

  return (
    <div className="grid gap-2 rounded-input border border-rule bg-paper-2 px-4 py-3 text-sm">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <b className="font-semibold">
          {fill(t.modelLine, { model: model.name, license: model.license })}
        </b>
        {model.languages.includes('en') && <span>{t.englishOnly}</span>}
      </p>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-2">
        {downloaded || ready ? (
          <span className="inline-flex items-center gap-1 font-semibold text-accent-deep">
            <Check className="size-4" aria-hidden="true" />
            {t.downloaded}
          </span>
        ) : (
          <span>
            {fill(t.downloadLine, {
              size: formatBytes(locale, model.downloadMB * 1e6),
            })}
          </span>
        )}
      </p>
      <p className="text-muted">{t.onDevice}</p>
      {loading && (
        <p
          role="status"
          className="flex flex-wrap items-center gap-3 text-warn"
        >
          {loading.percentage === undefined || downloaded
            ? t.loading
            : fill(t.downloading, {
                percent: formatNumber(locale, loading.percentage / 100, {
                  style: 'percent',
                  maximumFractionDigits: 0,
                }),
              })}
          <SecondaryButton size="sm" onClick={ai.cancelDownload}>
            {t.cancel}
          </SecondaryButton>
        </p>
      )}
      {failed && (
        <p
          role="alert"
          className="flex flex-wrap items-center gap-3 text-error"
        >
          {t.failed}
          <SecondaryButton size="sm" onClick={() => ai.preload(modelId)}>
            {t.retry}
          </SecondaryButton>
        </p>
      )}
    </div>
  );
}

// `/image/`: off by default. Ticking it starts the download right away, so
// the model is ready when the job's turn comes.
export function AltTextOption({
  modelId,
  enabled,
  onChange,
  ai,
  translation: t,
  defaultModelId,
}: {
  modelId: AiModelId | undefined;
  enabled: boolean;
  onChange: (modelId: AiModelId | undefined) => void;
  ai: AiWorker;
  translation: AiModelsDictionary;
  defaultModelId: AiModelId;
}) {
  return (
    <div className="grid gap-3">
      <SwitchRow
        id="alt-toggle"
        label={t.altToggle}
        description={t.altToggleNote}
        checked={enabled}
        onChange={() => {
          if (enabled) {
            ai.cancelDownload();
            onChange(undefined);
          } else {
            ai.preload(defaultModelId);
            onChange(defaultModelId);
          }
        }}
      />
      {modelId && <AiModelPanel modelId={modelId} ai={ai} translation={t} />}
    </div>
  );
}
