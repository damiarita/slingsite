import type { CompressionInput } from '@/types/compressor';
import { type Format, imageFormats, videoFormats } from '@/utils/formats';

// Pages built on the format app (FormatConfig): convert, resize, extract a
// video's first frame (thumbnail), remove an image's background and write its
// alt text. The first three have a base page and children.
export const tools = [
  'format',
  'resize',
  'thumbnail',
  'remove-background',
  'alt',
] as const;
export type Tool = (typeof tools)[number];

export const toolPathnames = {
  format: {
    image: '/image/format/[[...slugs]]',
    video: '/video/format/[[...slugs]]',
  },
  resize: {
    image: '/image/resize/[[...slugs]]',
    video: '/video/resize/[[...slugs]]',
  },
  thumbnail: {
    video: '/video/thumbnail/[[...slugs]]',
  },
  'remove-background': {
    image: '/image/remove-background/[[...slugs]]',
  },
  alt: {
    image: '/image/alt/[[...slugs]]',
  },
} as const satisfies Record<Tool, Partial<Record<CompressionInput, string>>>;

export type ToolPathname = {
  [T in Tool]: (typeof toolPathnames)[T][keyof (typeof toolPathnames)[T]];
}[Tool];

// Thumbnail pages exist for videos only.
export const getToolPathname = (tool: Tool, type: CompressionInput) => {
  const pathname = (
    toolPathnames[tool] as Partial<Record<CompressionInput, ToolPathname>>
  )[type];
  if (!pathname) throw new Error(`No ${tool} page for ${type}`);
  return pathname;
};

// Reverse of toolPathnames, for code that only has the route template
// (sitemap, language selector).
export const findTool = (
  pathname: ToolPathname,
): { tool: Tool; type: CompressionInput } => {
  for (const tool of tools) {
    for (const [type, toolPathname] of Object.entries(toolPathnames[tool])) {
      if (toolPathname === pathname) {
        return { tool, type: type as CompressionInput };
      }
    }
  }
  throw new Error(`Unknown tool pathname ${pathname}`);
};

// Formats a tool page can output. Videos get video formats only (no poster),
// thumbnails get image formats.
export const toolOutputFormats = (
  tool: Tool,
  type: CompressionInput,
): Format[] => {
  // Without an alpha channel, the background couldn't go.
  if (tool === 'remove-background') return ['png', 'webp', 'avif'];
  if (tool === 'alt') return [];
  return tool === 'thumbnail' || type === 'image'
    ? [...imageFormats]
    : [...videoFormats];
};

// Input formats we advertise (upload box) and build "<source>-…" pages for.
// Anything the browser can decode works, these are just the ones we name.
export const inputFormats = {
  image: ['jpg', 'png', 'webp', 'gif', 'avif'],
  video: ['mp4', 'webm', 'mov', 'mkv'],
} as const satisfies Record<CompressionInput, readonly string[]>;
export type InputFormat = (typeof inputFormats)[CompressionInput][number];

// How the upload box lists them (proper names, the same in every language).
export const inputFormatNames: Record<InputFormat, string> = {
  jpg: 'JPG',
  png: 'PNG',
  webp: 'WebP',
  gif: 'GIF',
  avif: 'AVIF',
  mp4: 'MP4',
  webm: 'WebM',
  mov: 'MOV',
  mkv: 'MKV',
};

// URL name of each output format. `mp4` is H.264 (what people mean by "MP4"),
// H.265 gets its own name.
export const outputFormatSlugs: Record<Format, string> = {
  jpg: 'jpg',
  webp: 'webp',
  avif: 'avif',
  png: 'png',
  'avc.mp4': 'mp4',
  'hevc.mp4': 'hevc',
  'vp9.webm': 'webm',
};

export const formatLabel = (format: InputFormat | Format) =>
  (format in outputFormatSlugs
    ? outputFormatSlugs[format as Format]
    : format
  ).toUpperCase();

export type ToolPage = {
  slug?: string; // undefined for the base page
  destination?: Format;
  source?: InputFormat;
};

const toPages = (outputs: Format[]): ToolPage[] =>
  outputs.map((destination) => ({
    slug: `to-${outputFormatSlugs[destination]}`,
    destination,
  }));

const sourceToPages = (
  sources: readonly InputFormat[],
  outputs: Format[],
): ToolPage[] =>
  sources.flatMap((source) =>
    outputs
      // A format never converts to itself
      .filter((destination) => outputFormatSlugs[destination] !== source)
      .map((destination) => ({
        slug: `${source}-to-${outputFormatSlugs[destination]}`,
        source,
        destination,
      })),
  );

// Every page of a tool, the single source of truth for static params, the
// sitemap and the links block:
// - format: base, "to-<output>", "<source>-to-<output>".
// - resize: base, "<output>" (resize a JPG into a JPG…).
// - thumbnail: base, "<source>", "to-<output>", "<source>-to-<output>".
// - remove-background, alt: base only.
export function getToolPages(tool: Tool, type: CompressionInput): ToolPage[] {
  const outputs = toolOutputFormats(tool, type);
  switch (tool) {
    case 'format':
      return [
        {},
        ...toPages(outputs),
        ...sourceToPages(inputFormats[type], outputs),
      ];
    case 'resize':
      return [
        {},
        ...outputs.map((destination) => ({
          slug: outputFormatSlugs[destination],
          destination,
        })),
      ];
    case 'thumbnail':
      return [
        {},
        ...inputFormats[type].map((source) => ({ slug: source, source })),
        ...toPages(outputs),
        ...sourceToPages(inputFormats[type], outputs),
      ];
    case 'remove-background':
    case 'alt':
      return [{}];
    default: {
      const _exhaustiveCheck: never = tool;
      return _exhaustiveCheck;
    }
  }
}

export function getToolPageSlugs(
  tool: Tool,
  type: CompressionInput,
): string[][] {
  return getToolPages(tool, type).map((page) => (page.slug ? [page.slug] : []));
}

// Returns null when the slugs don't match a generated page, so the page can
// call notFound().
export function findToolPage(
  tool: Tool,
  type: CompressionInput,
  slugs: string[] | undefined,
): ToolPage | null {
  const segments = slugs ?? [];
  if (segments.length > 1) return null;
  return (
    getToolPages(tool, type).find((page) => page.slug === segments[0]) ?? null
  );
}

// Slug of the PageContent MDX (content/page-content/<locale>/) of a page.
export const getToolPageContentSlug = (
  tool: Tool,
  type: CompressionInput,
  page: ToolPage,
) => (page.slug ? `${type}-${tool}-${page.slug}` : `${type}-${tool}`);
