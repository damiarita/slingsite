import { locales } from '@/i18n/lib';
import { getUrl, getUrlsByLocale, pageTypes } from '@/utils/urls'
import type {MetadataRoute} from 'next'

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap{
    return pageTypes.flatMap(function(pageType){
        return locales.map(function(locale){
            return {
                url:getUrl(locale, pageType),
                lastModified: new Date(),
                changeFrequency: 'monthly',
                alternates: {
                    languages: getUrlsByLocale(pageType)
                }
            }
        })
    })
}