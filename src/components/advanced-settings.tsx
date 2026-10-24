'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Collapsible section under the main settings. `activeLabels` name the
// settings changed from the page defaults: collapsing doesn't reset them, so
// they stay visible as badges.
export const AdvancedSettings = ({
  label,
  activeLabels,
  children,
}: {
  label: string;
  activeLabels: string[];
  children: ReactNode;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(activeLabels.length > 0);
  const Chevron = showAdvanced ? ChevronUp : ChevronDown;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        aria-expanded={showAdvanced}
        aria-controls="advanced-settings"
        className="flex items-center mt-4 mb-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <Chevron className="w-4 h-4 mr-1" />
        {label}
        {!showAdvanced &&
          activeLabels.map((activeLabel) => (
            <span
              key={activeLabel}
              className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full"
            >
              {activeLabel}
            </span>
          ))}
      </button>
      {showAdvanced && (
        <div id="advanced-settings" className="space-y-4">
          {children}
        </div>
      )}
    </>
  );
};
