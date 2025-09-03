import { Locale, locales } from "@/i18n/lib"

export const pageTypes = ['image'] as const;
export type PageType = typeof pageTypes[number]

const pagePaths:Record<PageType, string> = {
    image: "image"
}

export const getUrl = (locale:Locale, pageType:PageType, queryParams?:string):string=>{
    const path = pagePaths[pageType]
    return `/${locale}/${path}/${queryParams||''}`
}
    
export const getUrlsByLocale = (pageType:PageType): Record<Locale, string>=>
    locales.reduce(
    function(acc, locale){
        acc[locale]=getUrl(locale, pageType)
        return acc
    },
    {} as Record<Locale, string>
)