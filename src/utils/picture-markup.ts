import type { Job } from '@/types/job';
import type { ImageFormat } from '@/utils/formats';

type Candidate = { fileName: string; width: number; height: number };

// srcset is split on whitespace and commas, so those are escaped in file
// names (size names can contain spaces).
const srcsetUrl = (fileName: string) =>
  fileName.replace(/[\s,]/g, (c) => encodeURIComponent(c));

const escapeAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// The <picture> element for one image: an AVIF and a WebP <source>, then a
// JPG <img> fallback, each listing every width it was made in.
export function getPictureMarkup(
  sizes: string,
  candidates: Partial<Record<ImageFormat, Candidate[]>>,
  alt = '',
) {
  const srcset = (list: Candidate[]) =>
    list
      .map(({ fileName, width }) => `${srcsetUrl(fileName)} ${width}w`)
      .join(',\n             ');
  const sources = (['avif', 'webp'] as const)
    .filter((format) => candidates[format]?.length)
    .map(
      (format) => `  <source type="image/${format}"
    srcset="${srcset(candidates[format]!)}"
    sizes="${sizes}">`,
    );
  const fallbackList = candidates.jpg ?? [];
  const fallback = fallbackList[fallbackList.length - 1];
  const img = fallback
    ? `  <img src="${srcsetUrl(fallback.fileName)}"
    srcset="${srcset(fallbackList)}"
    sizes="${sizes}"
    width="${fallback.width}" height="${fallback.height}"
    alt="${escapeAttribute(alt)}" loading="lazy">`
    : '';
  return ['<picture>', ...sources, img, '</picture>']
    .filter(Boolean)
    .join('\n');
}

// From a finished image compress job: only the outputs that were made, one
// candidate per width (two sizes can end up the same width when the original
// is small, since nothing is upscaled).
export function getJobPictureMarkup(job: Job) {
  if (!job.pictureSizes) return undefined;
  const candidates: Partial<Record<ImageFormat, Candidate[]>> = {};
  for (const format of ['avif', 'webp', 'jpg'] as const) {
    const byWidth = new Map<number, Candidate>();
    for (const [configName, tasks] of Object.entries(job.tasks)) {
      const fileName = job.outputFileNames[configName]?.[format];
      const dimensions = job.requestedDimensions[configName];
      if (tasks[format]?.status !== 'completed' || !fileName || !dimensions)
        continue;
      byWidth.set(dimensions.width, { fileName, ...dimensions });
    }
    candidates[format] = [...byWidth.values()].sort(
      (a, b) => a.width - b.width,
    );
  }
  if (!Object.values(candidates).some((list) => list.length)) return undefined;
  const altStep = job.alt?.step;
  return getPictureMarkup(
    job.pictureSizes,
    candidates,
    altStep?.status === 'completed' ? altStep.result.text : '',
  );
}
