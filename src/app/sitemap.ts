import { getAllPosts } from '@/content/lib';
import { locales } from '@/i18n/lib';
import { getPostUrl, getPostUrlsByLocale, getUrl, getUrlsByLocale, pageTypes } from '@/utils/urls'
import type {MetadataRoute} from 'next'

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap{
    const dynamicPages = pageTypes.flatMap(function(pageType){
        return locales.map(function(locale){
            return {
                url:getUrl(locale, pageType),
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                alternates: {
                    languages: getUrlsByLocale(pageType)
                }
            }
        });
    });
    const staticPages =getAllPosts(true).map(function(post){
        return {
            url:getPostUrl(post),
            lastModified: new Date(post.publicationDate),
            changeFrequency: 'monthly' as const,
            alternates: {
                languages: getPostUrlsByLocale(post)
            }
        }
    })
    return dynamicPages.concat(staticPages);
}