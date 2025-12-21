import { Redirecter } from '@/components/redirecter';
import {
  getImagePageMetadataDictionary,
  getRedirectionDictionary,
} from '@/i18n/lib';
import { getUrl } from '@/utils/urls';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const redirectionDictionary = await getRedirectionDictionary('en');
  const destinationPageTranslation = await getImagePageMetadataDictionary('en');
  return {
    title: redirectionDictionary.redirecting,
    openGraph: {
      title: destinationPageTranslation.title,
      description: destinationPageTranslation.description,
      url: getUrl('en', 'image'),
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
      locale: 'en',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: destinationPageTranslation.title,
      description: destinationPageTranslation.description,
      images: ['/screenshots/image.jpg', '/favicon.ico'],
    },
  };
}

export default async function HomePage() {
  const dict = await getRedirectionDictionary('en');
  return (
    <html>
      <body>
        <Redirecter pageType="image" redirecting={dict.redirecting} />
      </body>
    </html>
  );
}
