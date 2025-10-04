import { NavBarTranslations } from "@/i18n/type";
import { Logo } from "./logo";
import NavLink from "./nav-link";
import { Locale } from "@/i18n/lib";
import { getUrl } from "@/utils/urls";


export default function NavBar({translations, locale}:{translations:NavBarTranslations, locale:Locale}) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <a href={getUrl(locale, 'image')} className="flex items-center space-x-3">
                    <Logo />
                    <span className="text-2xl font-bold text-gray-800">SlingSite</span>
                </a>
                <nav className="flex space-x-6 text-sm font-medium">
                    <NavLink pageType='image' locale={locale}>{translations.imageCompressor}</NavLink>
                    <NavLink pageType='video' locale={locale}>{translations.videoCompressor}</NavLink>
                </nav>
            </div>
        </div>
  );
};