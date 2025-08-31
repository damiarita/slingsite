'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Locale, defaultLocale, locales } from '@/i18n/lib'

export const Redirecter = ({ redirecting, path, locale}: {redirecting: string, path: string, locale?: Locale}) => {
  const router = useRouter()
  useEffect(() => {
    const queryString = window.location.search;
    router.replace(`/${getRedirectLocale(locale)}${path}${queryString}`);
  }, [router, locale, path])
  
  return <div>{redirecting}...</div>
}

function getRedirectLocale(requestedLocale?:Locale) {
  if(requestedLocale) return requestedLocale;
  const browserLocale = navigator.language.split('-')[0];
  if(locales.includes(browserLocale as Locale)) return browserLocale as Locale
  return defaultLocale;
}