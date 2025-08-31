
import {Locale, defaultLocale, getDictionary, locales} from '@/i18n/lib'
import { Redirecter } from '@/components/redirecter'
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: "Redirecting...",
  }
}

export default async function HomePage() {
  const browserLocale = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : null;
  const locale = locales.includes(browserLocale as Locale) ? browserLocale as Locale : defaultLocale;

  const dict = await getDictionary(locale)

  return <Redirecter path={`/${locale}/image`} redirecting={dict.redirecting} />
}