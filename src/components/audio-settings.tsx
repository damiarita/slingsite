import { Switch } from './switch';
import type { AudioSettingsDictionary } from '@/i18n/type';

// Badge for AdvancedSettings when the audio differs from the page default.
export const getAudioActiveLabels = (
  keepAudio: boolean,
  defaultKeepAudio: boolean,
  translation: AudioSettingsDictionary,
): string[] =>
  keepAudio === defaultKeepAudio
    ? []
    : [keepAudio ? translation.keepAudio : translation.noAudio];

export const AudioSettings = ({
  keepAudio,
  setKeepAudio,
  translation,
}: {
  keepAudio: boolean;
  setKeepAudio: (keepAudio: boolean) => void;
  translation: AudioSettingsDictionary;
}) => (
  <SwitchRow
    id="audio-toggle"
    label={translation.keepAudio}
    description={keepAudio ? undefined : translation.keepAudioDescription}
    checked={keepAudio}
    onChange={() => setKeepAudio(!keepAudio)}
  />
);

// A setting that is on or off: its name, a line on what "off" means, the
// switch at the end.
export const SwitchRow = ({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <div className="flex items-start justify-between gap-6 rounded-card bg-paper-2 p-4">
    <div>
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
      </label>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
    <Switch id={id} checked={checked} onChange={onChange} />
  </div>
);
