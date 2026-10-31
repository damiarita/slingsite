import { Fragment } from 'react';
import type { UploadDictionary } from '@/i18n/type';
import { fillNodes } from '@/utils/i18n-format';
import { samplePhotos } from '@/utils/samples';

const linkClass = 'underline underline-offset-[0.18em] hover:text-ink';

// The attribution the sample photos' licences ask for.
export function SampleCredit({
  translation,
  locale,
}: {
  translation: UploadDictionary;
  locale: string;
}) {
  const credits = samplePhotos.map((photo) =>
    fillNodes(translation.samplePhoto, {
      title: (
        <a href={photo.source} className={linkClass} rel="noopener noreferrer">
          {photo.title}
        </a>
      ),
      author: photo.author,
      license: (
        <a
          href={photo.licenseUrl}
          className={linkClass}
          rel="noopener noreferrer license"
        >
          {photo.license}
        </a>
      ),
    }),
  );
  // "A and B" in the page's language, with elements as the items.
  const parts = new Intl.ListFormat(locale, {
    type: 'conjunction',
  }).formatToParts(credits.map((_, i) => String(i)));
  return (
    <p className="mt-4 text-xs text-muted">
      {fillNodes(translation.sampleCredit, {
        photos: parts.map((part, i) => (
          <Fragment key={i}>
            {part.type === 'element' ? credits[Number(part.value)] : part.value}
          </Fragment>
        )),
      })}
    </p>
  );
}
