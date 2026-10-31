import { Check, Film, Image as ImageIcon } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type {
  FormatLinksDictionary,
  HomeDictionary,
  NavBarTranslations,
  ResultsDictionary,
  SettingsDictionary,
} from '@/i18n/type';
import type { AppHref } from '@/components/nav-link';
import type { CompressionInput } from '@/types/compressor';
import type { MediaDimensions } from '@/types/mediaDimensions';
import { buttonClass } from './buttons';
import LayoutDemo from './layout-demo';
import { PictureCode } from './picture-code';
import {
  type Tool,
  findToolPage,
  formatLabel,
  getToolPathname,
} from '@/utils/tool-pages';
import { type DeviceNames, getPresetSizes } from '@/utils/size-presets';
import { getCompressedFileName } from '@/utils/compressor/all';
import { getPictureSizes, getSizeFileKey } from '@/utils/jobs';
import { getPictureMarkup } from '@/utils/picture-markup';
import { scaleToWidth } from '@/utils/mediaDimensions';
import { webImageFormats } from '@/utils/formats';
import { fillNodes } from '@/utils/i18n-format';
import { samplePhotos } from '@/utils/samples';
import homeScreens from '@/utils/home-screens.json';

const toolHref = (
  tool: Tool,
  type: CompressionInput,
  slugs: string[] = [],
): AppHref => ({
  pathname: getToolPathname(tool, type),
  params: { slugs },
});

// A few child pages people search for, linked from the home page.
const popularPages: { tool: Tool; type: CompressionInput; slug: string }[] = [
  { tool: 'format', type: 'image', slug: 'jpg-to-webp' },
  { tool: 'format', type: 'image', slug: 'png-to-jpg' },
  { tool: 'format', type: 'image', slug: 'webp-to-jpg' },
  { tool: 'format', type: 'image', slug: 'avif-to-jpg' },
  { tool: 'format', type: 'image', slug: 'webp-to-png' },
  { tool: 'resize', type: 'image', slug: 'jpg' },
  { tool: 'resize', type: 'image', slug: 'png' },
  { tool: 'format', type: 'video', slug: 'mov-to-mp4' },
  { tool: 'format', type: 'video', slug: 'mkv-to-mp4' },
  { tool: 'format', type: 'video', slug: 'mp4-to-webm' },
  { tool: 'resize', type: 'video', slug: 'mp4' },
  { tool: 'thumbnail', type: 'video', slug: 'mp4' },
  { tool: 'thumbnail', type: 'video', slug: 'mov-to-jpg' },
];

function popularLabel(
  { tool, type, slug }: (typeof popularPages)[number],
  t: FormatLinksDictionary,
) {
  const page = findToolPage(tool, type, [slug]);
  if (!page) throw new Error(`Unknown popular page ${tool}/${type}/${slug}`);
  const from = page.source && formatLabel(page.source);
  const to = page.destination && formatLabel(page.destination);
  if (tool === 'resize') return t.resize.replace('{format}', to!);
  if (tool === 'thumbnail') {
    return to
      ? t.thumbnailFromTo.replace('{from}', from!).replace('{to}', to)
      : t.thumbnailFrom.replace('{from}', from!);
  }
  return t.fromTo.replace('{from}', from!).replace('{to}', to!);
}

// The <picture> markup the image compressor gives for the cardamom buns
// photo (1920 x 1322) with the default sizes: the same functions as the app.
function getShowcaseMarkup(deviceNames: DeviceNames) {
  const original: MediaDimensions = { width: 1920, height: 1322 };
  const sizes = getPresetSizes('recommended', deviceNames);
  const dimensions = Object.fromEntries(
    sizes.map((size) => [
      size.name,
      scaleToWidth(original, (size.screenWidth * size.percentage) / 100),
    ]),
  );
  const candidates = Object.fromEntries(
    webImageFormats.map((format) => [
      format,
      sizes.map((size) => ({
        fileName: getCompressedFileName(
          samplePhotos[0].fileName,
          getSizeFileKey(size),
          format,
        ),
        ...dimensions[size.name],
      })),
    ]),
  );
  return getPictureMarkup(getPictureSizes(sizes, dimensions), candidates);
}

// [width, height] of each capture, written by the capture script.
type ScreenSizes = Record<'results' | 'phone', number[]>;

// Captures of the real app (scripts/capture-home-screens.mjs), one per
// locale and theme; CSS shows the one that matches the theme.
function Screenshot({
  locale,
  name,
  alt,
}: {
  locale: Locale;
  name: keyof ScreenSizes;
  alt: string;
}) {
  const screens = homeScreens as Record<string, ScreenSizes>;
  const [width, height] = (screens[locale] ?? screens.en)[name];
  const folder = locale in screens ? locale : 'en';
  return (
    <div
      className="overflow-hidden rounded-card bg-paper-2 outline-1 -outline-offset-1 outline-frame"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {(['light', 'dark'] as const).map((theme) => (
        <img
          key={theme}
          src={`/screens/${folder}/${name}-${theme}.webp`}
          width={width}
          height={height}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`size-full object-cover theme-${theme}-only`}
        />
      ))}
    </div>
  );
}

const sectionHeadClass = 'max-w-[30ch] text-section';

// Landing page: orients newcomers. The tool chooser is the hero; below, the
// app's own output, who it is for, the size presets to try, and the cost.
export default function HomePage({
  locale,
  translation,
  navTranslation,
  settingsTranslation,
  resultsTranslation,
  deviceNames,
  linksTranslation,
}: {
  locale: Locale;
  translation: HomeDictionary;
  navTranslation: NavBarTranslations;
  settingsTranslation: SettingsDictionary;
  resultsTranslation: ResultsDictionary;
  deviceNames: DeviceNames;
  linksTranslation: FormatLinksDictionary;
}) {
  const { hero, chooser, showcase, audiences, layouts, needs, popular, band } =
    translation;
  const toolGroups = [
    {
      icon: ImageIcon,
      label: navTranslation.images,
      tools: [
        { ...chooser.compressImages, href: '/image/' as AppHref, lead: true },
        { ...chooser.convertImages, href: toolHref('format', 'image') },
        { ...chooser.resizeImages, href: toolHref('resize', 'image') },
      ],
    },
    {
      icon: Film,
      label: navTranslation.videos,
      tools: [
        { ...chooser.compressVideos, href: '/video/' as AppHref },
        { ...chooser.convertVideos, href: toolHref('format', 'video') },
        { ...chooser.resizeVideos, href: toolHref('resize', 'video') },
        { ...chooser.videoThumbnail, href: toolHref('thumbnail', 'video') },
      ],
    },
  ];

  return (
    <>
      {/* Hero: what it is, and every tool as the first choice */}
      <section
        aria-labelledby="home-title"
        className="page-container grid items-center gap-10 py-10 sm:py-14 lg:min-h-[min(calc(100svh-4.0625rem),62.5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-16"
      >
        <div className="lg:ps-10">
          <h1
            id="home-title"
            className="max-w-[15ch] text-display tracking-[-0.022em]"
          >
            {hero.title}
          </h1>
          <p className="mt-5 max-w-[34ch] text-lead text-ink-2">
            {hero.subtitle}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-accent-deep">
            {hero.checks.map((check) => (
              <li key={check} className="inline-flex items-center gap-1.5">
                <Check
                  className="size-4"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {check}
              </li>
            ))}
          </ul>
        </div>
        <nav
          aria-label={chooser.label}
          className="grid gap-8 rounded-card bg-paper-2 p-4 sm:grid-cols-2 sm:gap-6 sm:p-10"
        >
          {toolGroups.map((group) => (
            <div key={group.label}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-normal text-ink-2">
                <group.icon className="size-5" aria-hidden="true" />
                {group.label}
              </h2>
              <ul className="grid gap-2">
                {group.tools.map((tool) => (
                  <li key={tool.label}>
                    <Link
                      locale={locale}
                      href={tool.href}
                      className={`grid min-h-24 content-center gap-0.5 rounded-input border px-4 py-3 no-underline transition-[background-color,transform] duration-200 active:translate-y-px ${
                        'lead' in tool
                          ? 'border-accent-deep bg-accent text-accent-ink hover:bg-accent-hover'
                          : 'border-rule bg-paper text-ink hover:bg-paper-3'
                      }`}
                    >
                      <b className="font-semibold">{tool.label}</b>
                      <small
                        className={`text-sm ${'lead' in tool ? '' : 'text-muted'}`}
                      >
                        {tool.description}
                      </small>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </section>

      {/* What one photo turns into */}
      <section
        aria-labelledby="showcase-title"
        className="page-container py-24 lg:py-36"
      >
        <div className="mb-12 max-w-3xl">
          <h2 id="showcase-title" className={sectionHeadClass}>
            {showcase.title}
          </h2>
          <p className="mt-4 text-lead text-ink-2">{showcase.lead}</p>
        </div>
        <figure>
          <Screenshot
            locale={locale}
            name="results"
            alt={showcase.screenshotAlt}
          />
          <figcaption className="mt-3 text-sm text-muted">
            {showcase.caption}
          </figcaption>
        </figure>
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div className="min-w-0 overflow-hidden rounded-card">
            <PictureCode
              markup={getShowcaseMarkup(deviceNames)}
              translation={resultsTranslation}
            />
          </div>
          <div className="grid gap-4">
            <p>
              <b className="font-semibold">{showcase.cmsLabel}</b>{' '}
              {showcase.cms}
            </p>
            <p>
              <b className="font-semibold">{showcase.codeLabel}</b>{' '}
              {fillNodes(showcase.code, {
                picture: (
                  <code className="font-mono text-sm">&lt;picture&gt;</code>
                ),
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section
        aria-labelledby="audiences-title"
        className="page-container grid gap-10 pb-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-8 lg:pb-32"
      >
        <h2 id="audiences-title" className="max-w-[12ch] text-section">
          {audiences.title}
        </h2>
        <dl className="border-b border-rule">
          {audiences.items.map((item) => (
            <div
              key={item.title}
              className="grid gap-2 border-t border-rule py-8 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:gap-8"
            >
              <dt className="text-title font-semibold tracking-[-0.015em]">
                {item.title}
              </dt>
              <dd className="text-ink-2">{item.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The size presets, live */}
      <section
        aria-labelledby="layouts-title"
        className="bg-paper-2 py-24 lg:py-32"
      >
        <div className="page-container">
          <div className="mb-12 max-w-3xl">
            <h2 id="layouts-title" className={sectionHeadClass}>
              {layouts.title}
            </h2>
            <p className="mt-4 text-lead text-ink-2">{layouts.lead}</p>
          </div>
          <LayoutDemo
            locale={locale}
            deviceNames={deviceNames}
            translation={settingsTranslation}
            tryIt={layouts.tryIt}
          />
        </div>
      </section>

      {/* What it costs: the honest table */}
      <section
        aria-labelledby="needs-title"
        className="page-container py-24 lg:py-36"
      >
        <h2 id="needs-title" className={`mb-12 ${sectionHeadClass}`}>
          {needs.title}
        </h2>
        <table className="w-full border-collapse">
          <tbody>
            {needs.rows.map((row) => (
              <tr
                key={row.label}
                className="grid border-t border-rule py-6 last:border-b sm:table-row sm:py-0"
              >
                <th
                  scope="row"
                  className={`text-start align-baseline text-title font-semibold tracking-[-0.015em] sm:w-1/3 sm:py-7 sm:pe-8 ${row.cost ? 'text-warn' : ''}`}
                >
                  {row.label}
                </th>
                <td className="align-baseline text-ink-2 sm:py-7">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Popular tools: direct links to pages people search for */}
      <section
        aria-labelledby="popular-title"
        className="page-container pb-24 lg:pb-32"
      >
        <h2 id="popular-title" className="mb-6 text-title">
          {popular.heading}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {popularPages.map((page) => (
            <li key={`${page.tool}-${page.type}-${page.slug}`}>
              <Link
                locale={locale}
                href={toolHref(page.tool, page.type, [page.slug])}
                className="inline-flex min-h-11 items-center rounded-full border border-rule px-4 text-sm text-ink-2 no-underline transition-colors duration-150 hover:bg-paper-2 hover:text-ink"
              >
                {popularLabel(page, linksTranslation)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Close: start, beside the phone */}
      <section
        aria-labelledby="band-title"
        className="bg-band py-20 text-band-ink lg:py-28"
      >
        <div className="page-container grid items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div>
            <h2 id="band-title" className={sectionHeadClass}>
              {band.title}
            </h2>
            <p className="mt-4 max-w-[40ch] text-lead text-band-muted">
              {band.lead}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                locale={locale}
                href="/image/"
                className={`${buttonClass('primary')} focus-visible:outline-accent`}
              >
                {band.ctaImages}
              </Link>
              <Link
                locale={locale}
                href="/video/"
                className="inline-flex min-h-12 items-center justify-center rounded-input border border-band-muted/40 px-6 leading-none font-semibold whitespace-nowrap text-band-ink no-underline transition-[background-color,transform] duration-200 ease-out hover:bg-band-ink/10 focus-visible:outline-accent active:translate-y-px"
              >
                {band.ctaVideos}
              </Link>
            </div>
          </div>
          <figure className="mx-auto w-full max-w-[320px] lg:ms-auto lg:me-0">
            <Screenshot locale={locale} name="phone" alt={band.phoneAlt} />
          </figure>
        </div>
      </section>
    </>
  );
}
