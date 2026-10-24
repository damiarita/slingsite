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
  <div
    className={`rounded-lg transition-all duration-300 ${keepAudio ? 'bg-gray-50 ring-2 ring-blue-200' : 'bg-gray-100'}`}
  >
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center font-semibold text-gray-700">
        <label htmlFor="audio-toggle">{translation.keepAudio}</label>
      </div>
      <Switch
        id="audio-toggle"
        checked={keepAudio}
        onChange={() => setKeepAudio(!keepAudio)}
      />
    </div>
    {!keepAudio && (
      <p className="px-4 pb-3 -mt-2 text-xs text-gray-500">
        {translation.keepAudioDescription}
      </p>
    )}
  </div>
);
