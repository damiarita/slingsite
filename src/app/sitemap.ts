import { Locale, locales } from '@/i18n/lib';
import { getUrl, pageTypes } from '@/utils/urls'
import type {MetadataRoute} from 'next'

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap{
    return pageTypes.flatMap(function(pageType){
        const urlByLocale: Record<Locale, string>=locales.reduce(
            function(acc, locale){
                acc[locale]=getUrl(locale, pageType)
                return acc
            },
            {} as Record<Locale, string>
        )
        return locales.map(function(locale){
            return {
                url:urlByLocale[locale],
                lastModified: new Date(),
                changeFrequency: 'monthly',
                alternates: {
                    languages: urlByLocale
                }
            }
        })
    })
}