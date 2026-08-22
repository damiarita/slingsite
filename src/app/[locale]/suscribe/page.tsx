import BaseDatalayer from '@/components/base-datalayer';
import Body from '@/components/body';
import { Redirecter } from '@/components/redirecter';
import { routing } from '@/i18n/routing';
import { getRedirectionDictionary } from '@/i18n/requests';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const redirectionDictionary = await getRedirectionDictionary(
    routing.defaultLocale,
  );
  return {
    title: redirectionDictionary.redirecting,
  };
}

export default async function HomePage() {
  const dict = await getRedirectionDictionary(routing.defaultLocale);
  return (
    <Body locale={routing.defaultLocale}>
      <Redirecter
        pageType="subscribe"
        locale={routing.defaultLocale}
        redirecting={dict.redirecting}
      />
      <BaseDatalayer
        locale={routing.defaultLocale}
        pageType="redirect"
        pageSubtype="suscribe"
      />
    </Body>
  );
}
