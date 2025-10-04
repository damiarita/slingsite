import CompressorPage from '@/components/compressor-page';
import { getImagePageMetadataDictionary, getImagePageSeoDictionary, Locale } from '@/i18n/lib';
import { getUrl, getUrlsByLocale } from '@/utils/urls';
import { Metadata } from 'next'

type Props = {params: Promise<{locale:Locale}>}

export async function generateMetadata({params}:Props): Promise<Metadata> {
  const { locale } = await params;
  const translation = await getImagePageMetadataDictionary(locale);
  return {
    title: translation.title,
    description: translation.description,
    alternates: {
      canonical: getUrl(locale, 'image'),
      languages: getUrlsByLocale('image'),
    },
  }
}

export default async function App({params}:Props) {
  const { locale } = await params;
  const translation = await getImagePageSeoDictionary(locale);
  return <CompressorPage locale={locale} compressorType='image' translation={translation}/>
}