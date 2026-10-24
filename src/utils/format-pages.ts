import type { CompressionInput } from '@/types/compressor';
import {
  type Format,
  imageFormats,
  isImageFormat,
  isVideoFormat,
  videoFormats,
} from '@/utils/formats';

export const formatPagePathnames = {
  image: '/image/format/[[...slugs]]',
  video: '/video/format/[[...slugs]]',
} as const satisfies Record<CompressionInput, string>;

// Formats a format page can output. Videos get video formats only (no poster).
export const formatPageFormats: Record<CompressionInput, Format[]> = {
  image: [...imageFormats],
  video: [...videoFormats],
};

// Single source of truth for which format pages exist: used by
// generateStaticParams and the sitemap. Only the base page for now; the
// per-conversion child pages will add `[destination, source]` pairs here.
export function getFormatPageSlugs(type: CompressionInput): string[][] {
  void type;
  return [[]];
}

// Slugs are `[destination?, source?]`. Returns null when they don't match a
// generated page, so the page can call notFound().
export function parseFormatSlugs(
  type: CompressionInput,
  slugs: string[] | undefined,
): { destinationFormat?: Format; sourceFormat?: Format } | null {
  const segments = slugs ?? [];
  const exists = getFormatPageSlugs(type).some(
    (pageSlugs) =>
      pageSlugs.length === segments.length &&
      pageSlugs.every((slug, i) => slug === segments[i]),
  );
  if (!exists) return null;
  const isFormat = type === 'image' ? isImageFormat : isVideoFormat;
  const [destinationFormat, sourceFormat] = segments as Format[];
  if (destinationFormat && !isFormat(destinationFormat)) return null;
  if (sourceFormat && !isFormat(sourceFormat)) return null;
  return { destinationFormat, sourceFormat };
}
