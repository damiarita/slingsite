import BaseDatalayer from '@/components/base-datalayer';
import HomePage from '@/components/home-page';
import PageContent from '@/components/page-content';
import { Locale, routing } from '@/i18n/routing';
import { getFormatLinksDictionary, getHomeDictionary } from '@/i18n/requests';
import { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { toAbsoluteUrl, withDefault } from '@/utils/seo';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { metadata } = await getHomeDictionary(locale);
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: getPathname({ locale, href: '/home/' }),
      languages: withDefault(
        routing.locales.reduce(
          (acc, locale) => {
            acc[locale] = getPathname({ href: '/home/', locale: locale });
            return acc;
          },
          {} as Record<Locale, string>,
        ),
      ),
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: getPathname({ locale, href: '/home/' }),
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
      title: metadata.title,
      description: metadata.description,
      images: ['/screenshots/image.jpg', '/favicon.ico'],
    },
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const translation = await getHomeDictionary(locale);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SlingSite',
    url: toAbsoluteUrl(getPathname({ locale, href: '/home/' })),
    inLanguage: locale,
    description: translation.metadata.description,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <HomePage
        locale={locale}
        translation={translation}
        linksTranslation={await getFormatLinksDictionary(locale)}
      />
      <PageContent locale={locale} slug="home" />
      <BaseDatalayer locale={locale} pageType="home" pageSubtype="home" />
    </>
  );
}
