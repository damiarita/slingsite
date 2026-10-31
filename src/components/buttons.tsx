import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'quiet';
type Size = 'md' | 'sm';

// One filled (green) action per step; everything else is quiet. Also used on
// links that look like buttons.
export const buttonClass = (variant: Variant = 'primary', size: Size = 'md') =>
  [
    'inline-flex items-center justify-center gap-2 rounded-input border font-semibold leading-none whitespace-nowrap no-underline',
    'transition-[background-color,transform] duration-200 ease-out active:translate-y-px',
    'disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0',
    size === 'md' ? 'min-h-12 px-6 text-base' : 'min-h-11 px-4 text-sm',
    variant === 'primary'
      ? 'border-accent-deep bg-accent text-accent-ink hover:bg-accent-hover disabled:hover:bg-accent'
      : 'border-rule bg-paper text-ink hover:bg-paper-2 disabled:hover:bg-paper',
  ].join(' ');

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  size?: Size;
};

export const PrimaryButton = ({
  size,
  className = '',
  ...props
}: ButtonProps) => (
  <button
    type="button"
    className={`${buttonClass('primary', size)} ${className}`}
    {...props}
  />
);

export const SecondaryButton = ({
  size,
  className = '',
  ...props
}: ButtonProps) => (
  <button
    type="button"
    className={`${buttonClass('quiet', size)} ${className}`}
    {...props}
  />
);

// A square 44px icon button (remove, download). `label` is its name: hidden
// text (which every assistive tool and page translator reads, unlike
// aria-label for some) and a tooltip.
export const IconButton = ({
  label,
  className = '',
  children,
  ...props
}: Omit<ButtonProps, 'size' | 'aria-label'> & { label: string }) => (
  <button
    type="button"
    title={label}
    className={`relative grid size-11 shrink-0 place-items-center rounded-input text-muted transition-colors duration-150 hover:bg-paper-2 hover:text-ink disabled:opacity-55 ${className}`}
    {...props}
  >
    {children}
    <span className="sr-only">{label}</span>
  </button>
);
