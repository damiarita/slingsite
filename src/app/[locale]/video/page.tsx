import ImagePage from '@/components/compressor-page';
import { Locale } from '@/i18n/lib';
import { getUrl, getUrlsByLocale } from '@/utils/urls';
import { Metadata } from 'next'

type Props = {params: Promise<{locale:Locale}>}

export async function generateMetadata({params}:Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Online Image Compressor and Resizer - SlingSite",
    description: "Compress and resize your images online for free with SlingSite's Image Compressor. Optimize images for web use, reduce file size without losing quality, and choose dimensions for mobile, tablet, and desktop devices.",
    alternates: {
      canonical: getUrl(locale, 'video'),
      languages: getUrlsByLocale('video'),
    },
  }
}

export default async function App({params}:Props) {
  const { locale } = await params;
  return <ImagePage locale={locale} compressorType='video'/>
}