import { locales, localeIsValid, Locale } from '@/i18n/lib';
import { notFound } from 'next/navigation'
import React from 'react';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }))
}

export default async function LocaleLayout({ children, params}:{children:React.ReactNode, params: Promise<{locale:Locale}>}) {
  const { locale } = await params;
  
  // Verificar que el locale es válido
  if (!localeIsValid(locale)) {
    notFound()
  }

  return (
    <html lang={locale}>
      <body>
        <main className="main">
          {children}
        </main>
      </body>
    </html>
  )
}