
import {Locale, getDictionary} from '@/i18n/lib'
import { Redirecter } from '@/components/redirecter'
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: "Redirecting...",
  }
}

export default async function HomePage({ params }: {params:Promise<{locale:Locale}>}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return <Redirecter path={`/${locale}/image`} redirecting={dict.redirecting} />
}