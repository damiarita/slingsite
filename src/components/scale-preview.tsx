'use client';

import { useEffect, useRef, useState } from 'react';
import type { SizingConfig } from '@/types/config';
import type { SettingsDictionary } from '@/i18n/type';
import { getTargetWidth } from '@/utils/size-presets';
import { fill, formatNumber } from '@/utils/i18n-format';

// Each screen's column is at least this wide, so its caption fits.
const minColumn = 88;

// What one size produces, in words: "650 px wide" or "800 px tall".
export const describeOutput = (
  size: SizingConfig,
  translation: SettingsDictionary,
  locale: string,
) => {
  const width = getTargetWidth(size);
  return width === undefined
    ? fill(translation.outputTall, { px: formatNumber(locale, size.height) })
    : fill(translation.outputWide, { px: formatNumber(locale, width) });
};

// Every screen size drawn to the same scale, with the image as a green block
// in the layout share it takes. Decorative: the rows next to it say the same
// in words.
export function ScalePreview({
  sizes,
  translation,
  locale,
}: {
  sizes: SizingConfig[];
  translation: SettingsDictionary;
  locale: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailable(entry.contentRect.width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const screens = sizes
    .filter((size) => Number.isFinite(size.screenWidth) && size.screenWidth > 0)
    .sort((a, b) => a.screenWidth - b.screenWidth);
  const widest = screens[screens.length - 1]?.screenWidth ?? 1;
  const gap = available < 480 ? 12 : 24;
  // The widest screen is drawn at most 300px wide, less if the row would
  // not fit; past three sizes on a phone, the row scrolls instead.
  const boxWidth = (screenWidth: number, scale: number) =>
    Math.max(44, Math.round((screenWidth / widest) * scale));
  const rowWidth = (scale: number) =>
    screens.reduce(
      (sum, s) => sum + Math.max(boxWidth(s.screenWidth, scale), minColumn),
      gap * (screens.length - 1),
    );
  let scale = 300;
  while (scale > 60 && rowWidth(scale) > available) scale -= 4;

  return (
    <div className="rounded-card bg-paper-2 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap justify-between gap-2 text-sm text-muted">
        <b className="font-semibold text-ink">{translation.preview.title}</b>
        <span>{translation.preview.legend}</span>
      </div>
      <div
        ref={ref}
        className="flex items-end overflow-x-auto pb-1"
        style={{ gap }}
      >
        {screens.length === 0 && (
          <p className="text-sm text-muted">{translation.preview.empty}</p>
        )}
        {available > 0 &&
          screens.map((size) => {
            const w = boxWidth(size.screenWidth, scale);
            const ratio =
              size.screenWidth <= 600
                ? 1.9
                : size.screenWidth <= 1200
                  ? 1.3
                  : 0.62;
            const h = Math.min(Math.round(w * ratio), 180);
            const inner = w - 19;
            const share = 100 / size.percentage;
            const imageWidth =
              size.sizingType === 'percentage'
                ? (inner - 4 * (share - 1)) / share
                : size.sizingType === 'width'
                  ? Math.min(inner, (size.width / size.screenWidth) * inner)
                  : inner * 0.45;
            const imageHeight =
              size.sizingType === 'height'
                ? Math.min(h * 0.7, (size.height / size.screenWidth) * inner)
                : Math.min(h * 0.55, imageWidth * 0.62);
            return (
              <div
                key={size.id}
                className="grid flex-none justify-items-center gap-2"
                style={{ width: Math.max(w, minColumn) }}
              >
                <div
                  className="flex flex-col gap-1 overflow-hidden rounded-input border-[1.5px] border-ink bg-paper p-2"
                  style={{ width: w, height: h }}
                  aria-hidden="true"
                >
                  <div className="h-1.5 flex-none rounded-[2px] bg-rule" />
                  <div className="flex min-h-0 flex-1 gap-1">
                    <div
                      className="flex-none rounded-[3px] bg-accent"
                      style={{
                        width: Math.max(4, imageWidth),
                        height: Math.max(4, imageHeight),
                      }}
                    />
                    {imageWidth < inner - 10 && (
                      <div className="grid min-w-0 flex-1 content-start gap-1">
                        {Array.from({ length: 6 }, (_, i) => (
                          <i
                            key={i}
                            className={`h-1 rounded-[2px] bg-rule ${i % 3 === 2 ? 'w-2/3' : ''}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-center text-xs text-balance text-muted">
                  <b className="block text-sm font-semibold text-ink tabular-nums">
                    {describeOutput(size, translation, locale)}
                  </b>
                  {fill(translation.preview.caption, {
                    name: size.name,
                    screen: formatNumber(locale, size.screenWidth),
                  })}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
