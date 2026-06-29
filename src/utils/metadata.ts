import { Metadata } from 'next';
import { Locale } from '@/i18n/lib';

export const siteConfig = {
  name: 'SlingSite',
  description:
    'The ultimate tool for media optimization and multilang content.',
  url: 'https://slingsite.com',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/damiarita/slingsite',
  },
};

export function constructMetadata({
  title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
  locale,
  canonical,
  languages,
}: {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  locale: Locale;
  canonical?: string;
  languages?: Record<string, string>;
}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description: description,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@damiarita',
    },
    alternates: {
      canonical,
      languages,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
