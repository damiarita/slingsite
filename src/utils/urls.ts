import { Locale } from "@/i18n/lib"
import { PageType } from "@/types/urls"

const pagePaths:Record<PageType, string> = {
    image: "image",
    video: "video"
}

export const getUrl = (locale:Locale, pageType:PageType, queryParams?:string):string=>{
    const path = pagePaths[pageType]
    return `/${locale}/${path}/${queryParams}`
}
    