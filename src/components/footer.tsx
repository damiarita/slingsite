import { Logo } from "./logo";
import BlogLink from "./blog-link";
import { FooterTranslations } from "@/i18n/type";
import { getUrl } from "@/utils/urls";
import { Locale } from "@/i18n/lib";


export default function Footer({translations, locale}:{translations:FooterTranslations, locale:Locale}) {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                <div className="space-y-8 xl:col-span-1">
                    <div className="flex items-center space-x-3">
                        <Logo />
                        <span className="text-2xl font-bold text-gray-800">SlingSite</span>
                    </div>
                    <p className="text-gray-500 text-base">{translations.claim}</p>
                </div>
                <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                    <div className="md:grid md:grid-cols-2 md:gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">{translations.headings.connect}</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href={getUrl(locale, 'suscribe')} className="text-base text-gray-500 hover:text-gray-900">{translations.suscribe}</a></li>
                                <li><a href="https://github.com/damiarita/slingsite/issues" className="text-base text-gray-500 hover:text-gray-900" title='Issues · damiarita/slingsite' target="_blank">{translations.contactUs}</a></li>
                            </ul>
                        </div>
                        <div className="mt-12 md:mt-0">
                            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">{translations.headings.legal}</h3>
                            <ul className="mt-4 space-y-4">
                                <li><BlogLink postId='privacy.mdx' className="text-base text-gray-500 hover:text-gray-900" locale={locale} /></li>
                                <li><BlogLink postId='short-t-and-c.mdx' className="text-base text-gray-500 hover:text-gray-900" locale={locale}/></li>
                                <li><BlogLink postId='t-and-c.mdx' className="text-base text-gray-500 hover:text-gray-900" locale={locale}/></li>
                                <li><button data-cc="show-preferencesModal" className="text-base text-gray-500 hover:text-gray-900">{translations.cookies}</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="md:grid md:grid-cols-1">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">{translations.headings.development}</h3>
                            <ul className="mt-4 space-y-4">
                                <li><a href="https://github.com/damiarita/slingsite" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-base text-gray-500 hover:text-gray-900">{translations.sourceCode}</a></li>
                                <li><a href="https://github.com/damiarita/slingsite/issues" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-base text-gray-500 hover:text-gray-900">{translations.issues}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-12 border-t border-gray-200 pt-8">
                <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} SlingSite. {translations.copyright}</p>
            </div>
        </div>
  );
};