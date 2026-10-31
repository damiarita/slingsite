'use client';

import { useEffect, useState } from 'react';
import type { ResultsDictionary } from '@/i18n/type';
import { fillNodes } from '@/utils/i18n-format';

// Tags, attribute values and the rest, for a light syntax colouring.
const highlight = (markup: string) =>
  markup.split(/(<\/?[a-z]+|>|"[^"]*")/g).map((part, i) =>
    part.startsWith('"') ? (
      <span key={i} className="text-code-string">
        {part}
      </span>
    ) : part.startsWith('<') || part === '>' ? (
      <span key={i} className="text-code-key">
        {part}
      </span>
    ) : (
      part
    ),
  );

// The <picture> snippet of a finished image, with a Copy button. Code stays
// dark in both themes.
export function PictureCode({
  markup,
  translation,
}: {
  markup: string;
  translation: Pick<ResultsDictionary, 'markupTitle' | 'copy' | 'copied'>;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="bg-code text-code-ink">
      <div className="flex items-center gap-3 border-b border-code-rule px-4 py-2 text-sm text-code-dim">
        <span>
          {fillNodes(translation.markupTitle, {
            picture: <code className="font-mono">&lt;picture&gt;</code>,
          })}
        </span>
        <button
          type="button"
          onClick={() =>
            // Without clipboard access (an insecure origin), the code stays
            // selectable by hand.
            navigator.clipboard?.writeText(markup).then(
              () => setCopied(true),
              () => undefined,
            )
          }
          className="ms-auto inline-flex min-h-11 items-center rounded-input border border-code-edge px-4 font-semibold text-code-ink transition-colors duration-150 hover:bg-code-rule focus-visible:outline-accent"
        >
          <span aria-live="polite">
            {copied ? translation.copied : translation.copy}
          </span>
        </button>
      </div>
      {/* Markup is always left to right, even on Arabic pages */}
      <pre
        dir="ltr"
        className="overflow-x-auto p-4 text-start font-mono text-sm leading-relaxed"
      >
        <code>{highlight(markup)}</code>
      </pre>
    </div>
  );
}
