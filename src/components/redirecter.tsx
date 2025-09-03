'use client'

import { useEffect } from 'react'
import { defaultLocale, Locale, localeIsValid} from '@/i18n/lib'
import { getUrl, PageType } from '@/utils/urls'

export const Redirecter = ({ redirecting, pageType, locale}: {redirecting: string, pageType: PageType, locale?: Locale}) => {
  useEffect(() => {
    const queryString = window.location.search;
    const destinationUrl = getUrl(locale?locale:getRedirectLocale(), pageType, queryString)
    
    const meta = document.createElement('meta')
    meta.httpEquiv='refresh'
    meta.content=`0; url=${destinationUrl}`

    document.head.appendChild(meta)
  }, [locale, pageType])
  
  return <div>{redirecting}...</div>
}

function getRedirectLocale():Locale{
  const browserLocale = navigator.language.split('-')[0];
  return localeIsValid(browserLocale)? browserLocale as Locale: defaultLocale
}