import { locales, localeIsValid, Locale } from '@/i18n/lib';
import { notFound } from 'next/navigation';
import "../globals.css";
import React from 'react';
import NavLink from '@/components/nav-link';
import { getUrl } from '@/utils/urls';

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
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <div className="bg-gray-50 min-h-screen font-sans">
          <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <a href={getUrl(locale, 'image')} className="flex items-center space-x-3">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    viewBox="0 0 220 220"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M62,32 C76,110 122,80 135,198"
                      stroke="currentColor"
                      stroke-width="20"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <ellipse
                      cx="153"
                      cy="41"
                      rx="22"
                      ry="15"
                      transform="rotate(135, 153, 41)"
                      fill="currentColor"
                    />
                  </svg>
                  <h1 className="text-2xl font-bold text-gray-800">SlingSite</h1>
                </a>
                <nav className="flex space-x-6 text-sm font-medium">
                  <NavLink pageType='image' locale={locale} />
                  <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors duration-200 opacity-50 cursor-not-allowed">Video Compressor <span className="text-xs bg-gray-200 text-gray-500 rounded-full px-2 py-0.5 ml-1">Soon</span></a>
                </nav>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563eb; } .toggle-checkbox:checked + .toggle-label { background-color: #2563eb; }`}</style>
        </div>
      </body>
    </html>
  )
}