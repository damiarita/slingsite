
import {Locale, getDictionary} from '@/i18n/lib'
import { Redirecter } from '@/components/redirecter'

export default async function HomePage({ params }: {params:Promise<{locale:Locale}>}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return <Redirecter path={`/${locale}/image`} redirecting={dict.redirecting} />
}