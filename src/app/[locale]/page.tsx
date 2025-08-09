import { getTranslations, Locale } from '@/i18n/lib'

export async function generateMetadata({params}: {params:{locale:Locale}}) {
  const { locale } = params
  const t = await getTranslations(locale)
  
  return {
    title: t('key1'),
    description: t('key2'),
  }
}

export default async function HomePage({ params }: {params:{locale:Locale}}) {
  const { locale } = params
  const t = await getTranslations(locale)

  return (
    <div className="container">
      <h1>{t('key1')}</h1>
      <p>{t('key2')}</p>
      <p>Current locale: {locale}</p>
    </div>
  )
}