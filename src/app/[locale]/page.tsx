import {getDictionary, Locale} from '@/i18n/lib'
import { Redirecter } from '@/components/redirecter'
import { Metadata } from 'next'

type Props = {params: Promise<{locale:Locale}>}

export async function generateMetadata({params}:Props): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)
  return {
    title: dict.redirecting,
  }
}

export default async function HomePage({params}:Props) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return <Redirecter locale={locale} pageType='image' redirecting={dict.redirecting} />
}