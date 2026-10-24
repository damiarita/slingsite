import BaseDatalayer from '@/components/base-datalayer';
import CompressorPage from '@/components/compressor-page';
import FormatCompressorPage from '@/components/format-compressor-page';
import PageContent from '@/components/page-content';
import { Locale, routing } from '@/i18n/routing';
import {
  getImageFormatPageMetadataDictionary,
  getImageFormatPageSeoDictionary,
  getFormatSettingsDictionary,
  getFormatsDictionary,
  getResultDictionary,
  getUploadDictionary,
} from '@/i18n/requests';
import { withDefault } from '@/utils/seo';
import { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getDefaultFormatConfig } from '@/utils/compressor/all';
import {
  formatPageFormats,
  formatPagePathnames,
  getFormatPageSlugs,
  parseFormatSlugs,
} from '@/utils/format-pages';

type Params = { locale: Locale; slugs?: string[] };
type Props = { params: Promise<Params> };

const pathname = formatPagePathnames.image;

export function generateStaticParams(): Params[] {
  return routing.locales.flatMap((locale) =>
    getFormatPageSlugs('image').map((slugs) => ({ locale, slugs })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slugs } = await params;
  if (!parseFormatSlugs('image', slugs)) notFound();
  const translation = await getImageFormatPageMetadataDictionary(locale);
  const href = { pathname, params: { slugs: slugs ?? [] } };
  return {
    title: translation.title,
    description: translation.description,
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
      title: translation.title,
      description: translation.description,
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
      title: translation.title,
      description: translation.description,
      images: ['/screenshots/image.jpg', '/favicon.ico'],
    },
  };
}

export default async function App({ params }: Props) {
  const { locale, slugs } = await params;
  const parsedSlugs = parseFormatSlugs('image', slugs);
  if (!parsedSlugs) notFound();
  const availableFormats = formatPageFormats.image;
  const seoTranslation = await getImageFormatPageSeoDictionary(locale);
  const uploadTranslation = await getUploadDictionary(locale);
  const formatSettingTranslation = await getFormatSettingsDictionary(locale);
  const formatsTranslation = await getFormatsDictionary(locale);
  const resultTranslation = await getResultDictionary(locale);
  const initialConfig = getDefaultFormatConfig(
    parsedSlugs.destinationFormat
      ? [parsedSlugs.destinationFormat]
      : availableFormats,
    formatSettingTranslation.resized,
  );
  return (
    <>
      <CompressorPage seoTranslation={seoTranslation}>
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
      <PageContent locale={locale} slug="image-format" />
      <BaseDatalayer locale={locale} pageType="image" pageSubtype="format" />
    </>
  );
}
