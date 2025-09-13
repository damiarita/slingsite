import { locales, localeIsValid, Locale } from '@/i18n/lib';
import { notFound } from 'next/navigation';
import "../globals.css";
import React from 'react';
import NavLink from '@/components/nav-link';
import { getPostUrl, getUrl } from '@/utils/urls';
import { Logo } from '@/components/logo';

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
                  <Logo />
                  <span className="text-2xl font-bold text-gray-800">SlingSite</span>
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
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 xl:col-span-1">
                        <div className="flex items-center space-x-3">
                            <Logo />
                            <span className="text-2xl font-bold text-gray-800">SlingSite</span>
                        </div>
                        <p className="text-gray-500 text-base">The modern tool for high-performance image optimization.</p>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Connect</h3>
                                <ul className="mt-4 space-y-4">
                                    <li><a href={getUrl(locale, 'suscribe')} className="text-base text-gray-500 hover:text-gray-900">Subscribe</a></li>
                                    <li><a href="https://github.com/damiarita/slingsite/issues" className="text-base text-gray-500 hover:text-gray-900" title='Issues · damiarita/slingsite' target="_blank">Contact Us</a></li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Legal</h3>
                                <ul className="mt-4 space-y-4">
                                    <li><a href={getPostUrl('privacy.mdx', locale)} className="text-base text-gray-500 hover:text-gray-900">Privacy</a></li>
                                    <li><a href={getPostUrl('short-t-and-c.mdx', locale)} className="text-base text-gray-500 hover:text-gray-900">Simplified Terms & Conditions</a></li>
                                    <li><a href={getPostUrl('t-and-c.mdx', locale)} className="text-base text-gray-500 hover:text-gray-900">Terms & Conditions</a></li>
                                    <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Cookies</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-1">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Development</h3>
                                <ul className="mt-4 space-y-4">
                                    <li><a href="https://github.com/damiarita/slingsite" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-base text-gray-500 hover:text-gray-900">Source Code</a></li>
                                    <li><a href="https://github.com/damiarita/slingsite/issues" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-base text-gray-500 hover:text-gray-900">Issues</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-200 pt-8">
                    <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} SlingSite. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
          <style>{`.toggle-checkbox:checked { right: 0; border-color: #2563eb; } .toggle-checkbox:checked + .toggle-label { background-color: #2563eb; }`}</style>
        </div>
      </body>
    </html>
  )
}