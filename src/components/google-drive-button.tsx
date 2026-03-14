import type { MouseEventHandler } from 'react';
import { SiGoogledrive } from 'react-icons/si';

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /** Used for accessibility (aria-label/title) */
  label?: string;
  /** Tailwind classes to override styling (optional) */
  className?: string;
};

export const GoogleDriveButton = ({
  onClick,
  disabled,
  label = 'Upload to Google Drive',
  className = '',
}: Props) => {
  const base =
    'p-2 rounded-full transition-colors flex items-center justify-center';
  const enabled = 'hover:bg-gray-200';
  const disabledCls = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${base} ${className} ${disabled ? disabledCls : enabled}`}
    >
      <SiGoogledrive className="w-4 h-4" />
    </button>
  );
};
