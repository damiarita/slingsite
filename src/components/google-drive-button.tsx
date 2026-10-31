import type { MouseEventHandler } from 'react';
import { SiGoogledrive } from 'react-icons/si';
import { buttonClass } from './buttons';

type Props = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  label: string;
  // Only the icon, with `label` as hidden text and a tooltip.
  iconOnly?: boolean;
};

export const GoogleDriveButton = ({
  onClick,
  disabled,
  label,
  iconOnly,
}: Props) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={iconOnly ? label : undefined}
    className={`${buttonClass('quiet', 'sm')} ${iconOnly ? 'w-11 px-0' : ''}`}
  >
    <SiGoogledrive className="size-4" aria-hidden="true" />
    {iconOnly ? <span className="sr-only">{label}</span> : label}
  </button>
);
