import BaseDatalayer from '@/components/base-datalayer';
import CompressorPage from '@/components/compressor-page';
import FormatCompressorPage from '@/components/format-compressor-page';
import FormatPageLinks from '@/components/format-page-links';
import PageContent from '@/components/page-content';
import { Locale, routing } from '@/i18n/routing';
import {
  getImageFormatPageMetadataDictionary,
  getImageFormatPageSeoDictionary,
  getFormatLinksDictionary,
  getFormatSettingsDictionary,
  getFormatsDictionary,
  getResultDictionary,
  getUploadDictionary,
} from '@/i18n/requests';
import { getPageContent } from '@/content/lib';
import { withDefault } from '@/utils/seo';
import { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getDefaultFormatConfig } from '@/utils/compressor/all';
import {
  findFormatPage,
  formatPageFormats,
  formatPagePathnames,
  getFormatPageContentSlug,
  getFormatPageSlugs,
} from '@/utils/format-pages';

type Params = { locale: Locale; slugs?: string[] };
type Props = { params: Promise<Params> };

const pathname = formatPagePathnames.image;

export function generateStaticParams(): Params[] {
  return routing.locales.flatMap((locale) =>
    getFormatPageSlugs('image').map((slugs) => ({ locale, slugs })),
  );
}

// Conversion pages carry their copy in their PageContent frontmatter; the
// base page uses the format dictionaries.
async function getCopy(locale: Locale, slugs: string[] | undefined) {
  const page = findFormatPage('image', slugs);
  if (!page) notFound();
  const contentSlug = getFormatPageContentSlug('image', page);
  const content = page.slug ? getPageContent(contentSlug, locale) : undefined;
  if (page.slug && !content) {
    throw new Error(`Missing page content ${contentSlug} for ${locale}`);
  }
  const metadata = await getImageFormatPageMetadataDictionary(locale);
  const seo = await getImageFormatPageSeoDictionary(locale);
  return {
    page,
    contentSlug,
    title: content?.title ?? metadata.title,
    description: content?.description ?? metadata.description,
    seo: {
      title: content?.heading ?? seo.title,
      subtitle: content?.subheading ?? seo.subtitle,
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slugs } = await params;
  const { title, description } = await getCopy(locale, slugs);
  const href = { pathname, params: { slugs: slugs ?? [] } };
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
          url: '/screenshots/image.jpg',
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
      images: ['/screenshots/image.jpg', '/favicon.ico'],
    },
  };
}

export default async function App({ params }: Props) {
  const { locale, slugs } = await params;
  const { page, contentSlug, seo } = await getCopy(locale, slugs);
  const availableFormats = formatPageFormats.image;
  const uploadTranslation = await getUploadDictionary(locale);
  const formatSettingTranslation = await getFormatSettingsDictionary(locale);
  const formatsTranslation = await getFormatsDictionary(locale);
  const resultTranslation = await getResultDictionary(locale);
  const formatLinksTranslation = await getFormatLinksDictionary(locale);
  const initialConfig = getDefaultFormatConfig(
    page.destination ? [page.destination] : availableFormats,
    formatSettingTranslation.resized,
  );
  return (
    <>
      <CompressorPage seoTranslation={seo}>
        <FormatCompressorPage
          compressorType="image"
          initialConfig={initialConfig}
          availableFormats={availableFormats}
          uploadTranslation={uploadTranslation}
          formatSettingTranslation={formatSettingTranslation}
          formatsTranslation={formatsTranslation}
          resultTranslation={resultTranslation}
        />
      </CompressorPage>
      {/* Only the base page links to the conversion pages */}
      {!page.slug && (
        <FormatPageLinks
          type="image"
          locale={locale}
          translation={formatLinksTranslation}
        />
      )}
      <PageContent locale={locale} slug={contentSlug} />
      <BaseDatalayer
        locale={locale}
        pageType="image"
        pageSubtype={page.slug ? `format-${page.slug}` : 'format'}
      />
    </>
  );
}
