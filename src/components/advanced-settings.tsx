'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

// Collapsible section under the main settings. `activeLabels` name the
// settings changed from the page defaults: collapsing doesn't reset them, so
// they stay visible as badges. `revealed` opens it (a Start click found a
// problem in a field inside).
export const AdvancedSettings = ({
  label,
  activeLabels,
  revealed,
  children,
}: {
  label: string;
  activeLabels: string[];
  revealed?: boolean;
  children: ReactNode;
}) => {
  const [expanded, setExpanded] = useState(activeLabels.length > 0);
  // Set during render, so the field is there to take the focus right away,
  // and it stays open once the problem is fixed.
  if (revealed && !expanded) setExpanded(true);

  return (
    <div className="border-t border-rule py-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="advanced-settings"
        className="flex min-h-11 flex-wrap items-center gap-2 font-semibold text-ink hover:text-ink-2"
      >
        <ChevronDown
          className={`size-5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
        {label}
        {!expanded &&
          activeLabels.map((activeLabel) => (
            <span
              key={activeLabel}
              className="rounded-full bg-accent-wash px-2 py-0.5 text-xs font-semibold text-accent-deep"
            >
              {activeLabel}
            </span>
          ))}
      </button>
      {/* Under the controls column of the sections above */}
      {expanded && (
        <div
          id="advanced-settings"
          className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-8"
        >
          <div className="hidden lg:block" />
          <div className="grid min-w-0 gap-8">{children}</div>
        </div>
      )}
    </div>
  );
};
