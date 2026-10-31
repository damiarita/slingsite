import type { ReactNode } from 'react';

// One block of the settings step: what it is on the start side, the controls
// on the other. Stacks on narrow screens.
export const SettingsSection = ({
  title,
  note,
  children,
}: {
  title: ReactNode;
  note?: ReactNode;
  children: ReactNode;
}) => (
  <div className="grid gap-6 border-t border-rule py-10 first-of-type:border-t-0 first-of-type:pt-0 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-8">
    <div>
      <h3 className="text-title">{title}</h3>
      {note && <p className="mt-2 max-w-[34ch] text-sm text-muted">{note}</p>}
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);

// "2 Choose sizes", "3 Your files": the steps under the dropzone (step 1).
export const StepHeading = ({
  number,
  id,
  children,
}: {
  number: number;
  id: string;
  children: ReactNode;
}) => (
  <h2
    id={id}
    className="flex items-baseline gap-3 text-[clamp(1.75rem,1.6vw+1.2rem,2.441rem)] leading-[1.1]"
  >
    <span className="text-accent-deep tabular-nums">{number}</span>
    {children}
  </h2>
);
