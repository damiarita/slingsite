import { getDictionary, Locale } from '@/i18n/lib'

export async function generateMetadata({params}: {params:Promise<{locale:Locale}>}) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  
  return {
    title: dict.key1,
    description: dict.key2
  }
}

export default async function HomePage({ params }: {params:Promise<{locale:Locale}>}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <div className="container">
      <h1>{dict.key1}</h1>
      <p>{dict.key2}</p>
      <p>Current locale: {locale}</p>
      <p>Key3, {dict.key3.a}, {dict.key3.b}</p>
    </div>
  )
}