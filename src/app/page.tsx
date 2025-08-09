'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {defaultLocale} from '@/i18n/lib'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Detectar idioma del navegador o usar español por defecto
    const browserLang = navigator.language || navigator.languages[0] || defaultLocale;
    router.replace(`/${browserLang}`)
  }, [router])
  
  return <div>Redirecting...</div>
}