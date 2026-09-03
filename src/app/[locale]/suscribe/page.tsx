import BaseDatalayer from '@/components/base-datalayer';
import { Redirecter } from '@/components/redirecter';
import { Locale } from '@/i18n/routing';
import { getRedirectionDictionary } from '@/i18n/requests';
import { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const redirectionDictionary = await getRedirectionDictionary(locale);
  return {
    title: redirectionDictionary.redirecting,
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getRedirectionDictionary(locale);
  return (
    <>
      <Redirecter
        href={{ pathname: '/subscribe/' }}
        locale={locale}
        redirecting={dict.redirecting}
      />
      <BaseDatalayer
        locale={locale}
        pageType="redirect"
        pageSubtype="suscribe"
      />
    </>
  );
}
