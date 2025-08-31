
import {defaultLocale, getDictionary} from '@/i18n/lib'
import { Redirecter } from '@/components/redirecter'
import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: "Redirecting...",
  }
}

export default async function HomePage() {
  
  const dict = await getDictionary(defaultLocale)

  return <Redirecter path={`/image`} redirecting={dict.redirecting} />
}