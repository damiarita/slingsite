'use client';

import { useState } from 'react';
import { PresetPicker } from './dimension-settings';
import { ScalePreview, describeOutput } from './scale-preview';
import { buttonClass } from './buttons';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { SettingsDictionary } from '@/i18n/type';
import { type DeviceNames, getPresetSizes } from '@/utils/size-presets';
import { formatNumber } from '@/utils/i18n-format';

// The home page's "say where the image goes": the image compressor's own
// presets and preview to scale, to try without files.
export default function LayoutDemo({
  locale,
  deviceNames,
  translation,
  tryIt,
}: {
  locale: Locale;
  deviceNames: DeviceNames;
  translation: SettingsDictionary;
  tryIt: string;
}) {
  const [sizes, setSizes] = useState(() =>
    getPresetSizes('recommended', deviceNames),
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
      <PresetPicker
        sizes={sizes}
        deviceNames={deviceNames}
        translation={translation}
        onSelect={(preset) => setSizes(getPresetSizes(preset, deviceNames))}
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
      />
      <div className="grid gap-6">
        <ScalePreview sizes={sizes} translation={translation} locale={locale} />
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-3">
          {sizes.map((size) => (
            <div key={size.id} className="border-t border-rule pt-3">
              <dt className="text-sm text-muted">
                {size.name}, {formatNumber(locale, size.screenWidth)} px
              </dt>
              <dd className="font-semibold tabular-nums">
                {describeOutput(size, translation, locale)}
              </dd>
            </div>
          ))}
        </dl>
        <div>
          <Link locale={locale} href="/image/" className={buttonClass('quiet')}>
            {tryIt}
          </Link>
        </div>
      </div>
    </div>
  );
}
