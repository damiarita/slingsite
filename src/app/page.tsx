
import {Locale, getDictionary} from '@/i18n/lib'
import { Redirecter } from '@/components/redirecter'
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: "Redirecting...",
  }
}

export default async function HomePage() {
  const  locale = 'en' as Locale; 
  const dict = await getDictionary(locale)

  return <Redirecter path={`/${locale}/image`} redirecting={dict.redirecting} />
}