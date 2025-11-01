import { BlogTranslations, CompressionPageSeoTranslations, CookieConsentTranslations, FooterTranslations, NavBarTranslations, PageMetadata, RedirectingTranslations } from './type';

export const defaultLocale = 'en';
export const locales = ['en', 'es', 'ar', 'de', 'fr', 'it', 'zh'] as const;
export const rtlLocales = ['ar'];

export type Locale = typeof locales[number];

export const localeIsValid = (locale:string) => locales.includes(locale as Locale)

export const getCookieDictionary = async (locale:Locale): Promise<CookieConsentTranslations> => {
    if (locale==='ar'){
        return (await import('./dictioraries/cookies/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/cookies/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/cookies/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/cookies/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/cookies/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/cookies/zh.json')).default;
    }
    return (await import('./dictioraries/cookies/en.json')).default;
}
export const getBlogDictionary = async (locale:Locale): Promise<BlogTranslations> => {
    if (locale==='ar'){
        return (await import('./dictioraries/blog/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/blog/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/blog/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/blog/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/blog/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/blog/zh.json')).default;
    }
    return (await import('./dictioraries/blog/en.json')).default;
}
export const getVideoPageMetadataDictionary = async (locale:Locale): Promise<PageMetadata> => {
    if (locale==='ar'){
        return (await import('./dictioraries/compression/video/metadata/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/compression/video/metadata/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/compression/video/metadata/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/compression/video/metadata/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/compression/video/metadata/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/compression/video/metadata/zh.json')).default;
    }
    return (await import('./dictioraries/compression/video/metadata/en.json')).default;
}
export const getImagePageMetadataDictionary = async (locale:Locale): Promise<PageMetadata> => {
    if (locale==='ar'){
        return (await import('./dictioraries/compression/image/metadata/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/compression/image/metadata/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/compression/image/metadata/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/compression/image/metadata/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/compression/image/metadata/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/compression/image/metadata/zh.json')).default;
    }
    return (await import('./dictioraries/compression/image/metadata/en.json')).default;
}
export const getImagePageSeoDictionary = async (locale:Locale): Promise<CompressionPageSeoTranslations> => {
    if (locale==='ar'){
        return (await import('./dictioraries/compression/image/seo/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/compression/image/seo/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/compression/image/seo/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/compression/image/seo/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/compression/image/seo/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/compression/image/seo/zh.json')).default;
    }
    return (await import('./dictioraries/compression/image/seo/en.json')).default;
}
export const getVideoPageSeoDictionary = async (locale:Locale): Promise<CompressionPageSeoTranslations> => {
    if (locale==='ar'){
        return (await import('./dictioraries/compression/video/seo/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/compression/video/seo/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/compression/video/seo/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/compression/video/seo/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/compression/video/seo/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/compression/video/seo/zh.json')).default;
    }
    return (await import('./dictioraries/compression/video/seo/en.json')).default;
}
export const getRedirectionDictionary = async (locale:Locale): Promise<RedirectingTranslations> => {
    if (locale==='ar'){
        return (await import('./dictioraries/redirecter/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/redirecter/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/redirecter/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/redirecter/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/redirecter/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/redirecter/zh.json')).default;
    }
    return (await import('./dictioraries/redirecter/en.json')).default;
}


export const getNavBarDictionary = async (locale:Locale): Promise<NavBarTranslations> => {
    if (locale==='ar'){
        return (await import('./dictioraries/nav-bar/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/nav-bar/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/nav-bar/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/nav-bar/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/nav-bar/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/nav-bar/zh.json')).default;
    }
    return (await import('./dictioraries/nav-bar/en.json')).default;
}


export const getFooterDictionary = async (locale:Locale): Promise<FooterTranslations> => {
    if (locale==='ar'){
        return (await import('./dictioraries/footer/ar.json')).default;
    }
    if (locale==='de'){
        return (await import('./dictioraries/footer/de.json')).default;
    }
    if (locale==='es'){
        return (await import('./dictioraries/footer/es.json')).default;
    }
    if (locale==='fr'){
        return (await import('./dictioraries/footer/fr.json')).default;
    }
    if (locale==='it'){
        return (await import('./dictioraries/footer/it.json')).default;
    }
    if (locale==='zh'){
        return (await import('./dictioraries/footer/zh.json')).default;
    }
    return (await import('./dictioraries/footer/en.json')).default;
}