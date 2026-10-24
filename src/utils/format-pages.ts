import type { CompressionInput } from '@/types/compressor';
import { type Format, imageFormats, videoFormats } from '@/utils/formats';

export const formatPagePathnames = {
  image: '/image/format/[[...slugs]]',
  video: '/video/format/[[...slugs]]',
} as const satisfies Record<CompressionInput, string>;

// Formats a format page can output. Videos get video formats only (no poster).
export const formatPageFormats: Record<CompressionInput, Format[]> = {
  image: [...imageFormats],
  video: [...videoFormats],
};

// Input formats we advertise (upload box) and build "<source>-to-<output>"
// pages for. Anything the browser can decode works, these are just the ones
// we name.
export const inputFormats = {
  image: ['jpg', 'png', 'webp', 'gif', 'avif'],
  video: ['mp4', 'webm', 'mov', 'mkv'],
} as const satisfies Record<CompressionInput, readonly string[]>;
export type InputFormat = (typeof inputFormats)[CompressionInput][number];

// URL name of each output format. `mp4` is H.264 (what people mean by "MP4"),
// H.265 gets its own name.
export const outputFormatSlugs: Record<Format, string> = {
  jpg: 'jpg',
  webp: 'webp',
  avif: 'avif',
  'avc.mp4': 'mp4',
  'hevc.mp4': 'hevc',
  'vp9.webm': 'webm',
};

export const formatLabel = (format: InputFormat | Format) =>
  (format in outputFormatSlugs
    ? outputFormatSlugs[format as Format]
    : format
  ).toUpperCase();

export type FormatPage = {
  slug?: string; // undefined for the base /<type>/format/ page
  destination?: Format;
  source?: InputFormat;
};

// Every format page that exists: the base page, one "to-<output>" page per
// output format and one "<source>-to-<output>" page per valid pair (a format
// never converts to itself). Static params, the sitemap and the links block
// all read from here.
export function getFormatPages(type: CompressionInput): FormatPage[] {
  const outputs = formatPageFormats[type];
  return [
    {},
    ...outputs.map((destination) => ({
      slug: `to-${outputFormatSlugs[destination]}`,
      destination,
    })),
    ...inputFormats[type].flatMap((source) =>
      outputs
        .filter((destination) => outputFormatSlugs[destination] !== source)
        .map((destination) => ({
          slug: `${source}-to-${outputFormatSlugs[destination]}`,
          source,
          destination,
        })),
    ),
  ];
}

export function getFormatPageSlugs(type: CompressionInput): string[][] {
  return getFormatPages(type).map((page) => (page.slug ? [page.slug] : []));
}

// Returns null when the slugs don't match a generated page, so the page can
// call notFound().
export function findFormatPage(
  type: CompressionInput,
  slugs: string[] | undefined,
): FormatPage | null {
  const segments = slugs ?? [];
  if (segments.length > 1) return null;
  return getFormatPages(type).find((page) => page.slug === segments[0]) ?? null;
}

// Slug of the PageContent MDX (content/page-content/<locale>/) of a page.
export const getFormatPageContentSlug = (
  type: CompressionInput,
  page: FormatPage,
) => (page.slug ? `${type}-format-${page.slug}` : `${type}-format`);
