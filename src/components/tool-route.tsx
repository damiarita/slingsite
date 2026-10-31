import BaseDatalayer from '@/components/base-datalayer';
import CompressorIntro from '@/components/compressor-intro';
import ToolCompressorPage from '@/components/tool-compressor-page';
import ToolPageLinks from '@/components/tool-page-links';
import PageContent from '@/components/page-content';
import { Locale, routing } from '@/i18n/routing';
import {
  getAudioSettingsDictionary,
  getCompressorAppDictionary,
  getFormatLinksDictionary,
  getFormatSettingsDictionary,
  getFormatsDictionary,
  getImageFormatPageMetadataDictionary,
  getImageFormatPageSeoDictionary,
  getNavBarDictionary,
  getResultDictionary,
  getUploadDictionary,
  getVideoFormatPageMetadataDictionary,
  getVideoFormatPageSeoDictionary,
} from '@/i18n/requests';
import { getPageContent } from '@/content/lib';
import { withDefault } from '@/utils/seo';
import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getDefaultFormatConfig } from '@/utils/compressor/all';
import type { CompressionInput } from '@/types/compressor';
import type { FormatConfig } from '@/types/config';
import type { FormatSettingsDictionary } from '@/i18n/type';
import {
  type Tool,
  type ToolPage,
  findToolPage,
  getToolPageContentSlug,
  getToolPageSlugs,
  getToolPathname,
  toolOutputFormats,
} from '@/utils/tool-pages';

// Shared by the format, resize and thumbnail routes, which only differ by
// their tool and type.

type Params = { locale: Locale; slugs?: string[] };
export type ToolRouteProps = { params: Promise<Params> };

export function getToolStaticParams(
  tool: Tool,
  type: CompressionInput,
): Params[] {
  return routing.locales.flatMap((locale) =>
    getToolPageSlugs(tool, type).map((slugs) => ({ locale, slugs })),
  );
}

// Every page carries its copy in its PageContent frontmatter, except the base
// format pages, which use the format dictionaries.
async function getCopy(
  tool: Tool,
  type: CompressionInput,
  locale: Locale,
  slugs: string[] | undefined,
) {
  const page = findToolPage(tool, type, slugs);
  if (!page) notFound();
  const contentSlug = getToolPageContentSlug(tool, type, page);
  const usesDictionaries = tool === 'format' && !page.slug;
  const content = usesDictionaries
    ? undefined
    : getPageContent(contentSlug, locale);
  if (!usesDictionaries) {
    if (
      !content?.title ||
      !content.description ||
      !content.heading ||
      !content.subheading
    ) {
      throw new Error(
        `Missing page content or copy ${contentSlug} for ${locale}`,
      );
    }
    return {
      page,
      contentSlug,
      title: content.title,
      description: content.description,
      seo: { title: content.heading, subtitle: content.subheading },
    };
  }
  const metadata = await (
    type === 'image'
      ? getImageFormatPageMetadataDictionary
      : getVideoFormatPageMetadataDictionary
  )(locale);
  const seo = await (
    type === 'image'
      ? getImageFormatPageSeoDictionary
      : getVideoFormatPageSeoDictionary
  )(locale);
  return { page, contentSlug, ...metadata, seo };
}

export async function getToolMetadata(
  tool: Tool,
  type: CompressionInput,
  { params }: ToolRouteProps,
): Promise<Metadata> {
  const { locale, slugs } = await params;
  const { title, description } = await getCopy(tool, type, locale, slugs);
  const href = {
    pathname: getToolPathname(tool, type),
    params: { slugs: slugs ?? [] },
  };
  const screenshot = `/screenshots/${type}.jpg`;
  return {
    title,
    description,
    alternates: {
      canonical: getPathname({ locale, href }),
      languages: withDefault(
        routing.locales.reduce(
          (acc, locale) => {
            acc[locale] = getPathname({ href, locale: locale });
            return acc;
          },
          {} as Record<Locale, string>,
        ),
      ),
    },
    openGraph: {
      title,
      description,
      url: getPathname({ locale, href }),
      siteName: 'SlingSite',
      images: [
        {
          url: screenshot,
          width: 910,
          height: 465,
          alt: 'SlingSite Logo',
        },
        {
          url: '/favicon.ico',
          width: 256,
          height: 256,
          alt: 'SlingSite Logo',
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [screenshot, '/favicon.ico'],
    },
  };
}

// Child pages preselect their output. Base pages: every format (format), the
// file's own format (resize), JPG (thumbnail).
function getInitialConfig(
  tool: Tool,
  type: CompressionInput,
  page: ToolPage,
  translation: FormatSettingsDictionary,
): FormatConfig {
  const destination = page.destination ? [page.destination] : undefined;
  switch (tool) {
    case 'format':
      return getDefaultFormatConfig({
        formats: destination ?? toolOutputFormats(tool, type),
        versionName: translation.resized,
      });
    case 'resize':
      return getDefaultFormatConfig({
        formats: destination ?? [],
        originalFormat: !destination,
        resize: true,
        percentage: 50,
        versionName: translation.resized,
      });
    case 'thumbnail':
      return getDefaultFormatConfig({
        formats: destination ?? ['jpg'],
        versionName: translation.thumbnail,
      });
    default: {
      const _exhaustiveCheck: never = tool;
      return _exhaustiveCheck;
    }
  }
}

export default async function ToolRoute({
  tool,
  type,
  params,
}: ToolRouteProps & { tool: Tool; type: CompressionInput }) {
  const { locale, slugs } = await params;
  const { page, contentSlug, seo } = await getCopy(tool, type, locale, slugs);
  const formatSettingTranslation = await getFormatSettingsDictionary(locale);
  // Thumbnails are images: no audio to keep.
  const audioTranslation =
    type === 'video' && tool !== 'thumbnail'
      ? await getAudioSettingsDictionary(locale)
      : undefined;
  const navBarTranslation = await getNavBarDictionary(locale);
  return (
    <>
      <ToolCompressorPage
        tool={tool}
        compressorType={type}
        initialConfig={getInitialConfig(
          tool,
          type,
          page,
          formatSettingTranslation,
        )}
        availableFormats={toolOutputFormats(tool, type)}
        intro={
          <CompressorIntro
            seoTranslation={seo}
            type={type}
            tool={tool}
            locale={locale}
            translation={navBarTranslation.tools}
          />
        }
        // The sample photos are JPGs: not offered where the page is about
        // another source format ("PNG to JPG").
        samples={type === 'image' && (!page.source || page.source === 'jpg')}
        appTranslation={await getCompressorAppDictionary(locale)}
        uploadTranslation={await getUploadDictionary(locale)}
        formatSettingTranslation={formatSettingTranslation}
        formatsTranslation={await getFormatsDictionary(locale)}
        resultTranslation={await getResultDictionary(locale)}
        audioTranslation={audioTranslation}
      />
      {/* Only the base page links to the children */}
      {!page.slug && (
        <ToolPageLinks
          tool={tool}
          type={type}
          locale={locale}
          translation={await getFormatLinksDictionary(locale)}
        />
      )}
      <PageContent locale={locale} slug={contentSlug} />
      <BaseDatalayer
        locale={locale}
        pageType={type}
        pageSubtype={page.slug ? `${tool}-${page.slug}` : tool}
      />
    </>
  );
}
