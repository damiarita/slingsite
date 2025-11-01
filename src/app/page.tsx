import { Redirecter } from '@/components/redirecter';
import { getRedirectionDictionary } from '@/i18n/lib';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getRedirectionDictionary('en');
  return {
    title: dict.redirecting,
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
