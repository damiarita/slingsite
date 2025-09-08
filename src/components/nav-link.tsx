"use client"
import { Locale } from '@/i18n/lib';
import { getUrl, PageType } from '@/utils/urls';
import { usePathname } from 'next/navigation';


export default function NavLink({locale, pageType}:{locale:Locale, pageType:PageType}){
    const href = getUrl(locale, pageType)
    const currentUrl = usePathname();
    const currentPath = currentUrl.split('?')[0]
    return (<a href={href} className={'pb-1 border-b-2 ' + (currentPath===href ? 'text-blue-800 border-blue-800':'text-blue-600 border-transparent hover:text-blue-800 hover:border-blue-800')}>Image Compressor</a>)
}
