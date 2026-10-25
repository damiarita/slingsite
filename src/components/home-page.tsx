import {
  ArrowRight,
  Check,
  Clapperboard,
  Download,
  Gauge,
  type LucideIcon,
  MousePointerClick,
  RefreshCw,
  Scaling,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type {
  FormatLinksDictionary,
  HomeDictionary,
  HomeFeature,
} from '@/i18n/type';
import type { AppHref } from '@/components/nav-link';
import type { CompressionInput } from '@/types/compressor';
import {
  type Tool,
  findToolPage,
  formatLabel,
  getToolPathname,
} from '@/utils/tool-pages';

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

const FeatureCard = ({
  locale,
  icon: Icon,
  feature,
  links,
}: {
  locale: Locale;
  icon: LucideIcon;
  feature: HomeFeature;
  links: { label: string; href: AppHref }[];
}) => (
  <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
      <Icon className="h-6 w-6 text-blue-700" aria-hidden="true" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
    <p className="mt-2 text-gray-600">{feature.description}</p>
    <ul className="mt-4 space-y-2 text-sm text-gray-600">
      {feature.points.map((point) => (
        <li key={point} className="flex items-start">
          <Check
            className="me-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
            aria-hidden="true"
          />
          {point}
        </li>
      ))}
    </ul>
    <div className="mt-auto flex flex-wrap gap-3 pt-6">
      {links.map((link) => (
        <Link
          key={link.label}
          locale={locale}
          href={link.href}
          className="group inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-blue-50 hover:text-blue-800"
        >
          {link.label}
          <ArrowRight
            className="ms-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  </div>
);

// Landing page: introduces every tool to newcomers and links to each one.
export default function HomePage({
  locale,
  translation,
  linksTranslation,
}: {
  locale: Locale;
  translation: HomeDictionary;
  linksTranslation: FormatLinksDictionary;
}) {
  const { hero, features, steps, privacy, popular } = translation;
  const stepIcons = [Upload, MousePointerClick, Download];

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-b from-blue-50 to-white px-6 py-16 text-center sm:py-20">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          {hero.subtitle}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            locale={locale}
            href="/image/"
            className="inline-flex items-center justify-center rounded-md bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
          >
            {hero.ctaImages}
          </Link>
          <Link
            locale={locale}
            href="/video/"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-800"
          >
            {hero.ctaVideos}
          </Link>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
          {hero.badges.map((badge) => (
            <li key={badge} className="flex items-center">
              <Check
                className="me-1.5 h-4 w-4 text-green-600"
                aria-hidden="true"
              />
              {badge}
            </li>
          ))}
        </ul>
      </section>

      {/* Tools */}
      <section>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {features.heading}
          </h2>
          <p className="mt-4 text-lg text-gray-600">{features.subheading}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FeatureCard
            locale={locale}
            icon={Gauge}
            feature={features.optimize}
            links={[
              { label: features.forImages, href: '/image/' },
              { label: features.forVideos, href: '/video/' },
            ]}
          />
          <FeatureCard
            locale={locale}
            icon={Scaling}
            feature={features.resize}
            links={[
              { label: features.forImages, href: toolHref('resize', 'image') },
              { label: features.forVideos, href: toolHref('resize', 'video') },
            ]}
          />
          <FeatureCard
            locale={locale}
            icon={RefreshCw}
            feature={features.convert}
            links={[
              { label: features.forImages, href: toolHref('format', 'image') },
              { label: features.forVideos, href: toolHref('format', 'video') },
            ]}
          />
          <FeatureCard
            locale={locale}
            icon={Clapperboard}
            feature={features.thumbnail}
            links={[
              {
                label: features.thumbnail.cta,
                href: toolHref('thumbnail', 'video'),
              },
            ]}
          />
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          {steps.heading}
        </h2>
        <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.items.map((step, index) => {
            const Icon = stepIcons[index] ?? Check;
            return (
              <li key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  <span className="sr-only">{index + 1}. </span>
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-gray-600">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Privacy */}
      <section className="rounded-2xl bg-gray-900 px-6 py-12 text-white sm:px-12">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[auto_1fr]">
          <ShieldCheck
            className="h-16 w-16 text-green-400 md:h-24 md:w-24"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              {privacy.heading}
            </h2>
            <p className="mt-4 text-gray-300">{privacy.description}</p>
            <ul className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {privacy.points.map((point) => (
                <li key={point} className="flex items-start">
                  <Check
                    className="me-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-400"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Popular tools */}
      <section className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {popular.heading}
        </h2>
        <ul className="flex flex-wrap justify-center gap-2">
          {popularPages.map((page) => (
            <li key={`${page.tool}-${page.type}-${page.slug}`}>
              <Link
                locale={locale}
                href={toolHref(page.tool, page.type, [page.slug])}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-800"
              >
                {popularLabel(page, linksTranslation)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
