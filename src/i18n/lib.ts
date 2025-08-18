import { Dictionary } from './dictioraries/type';

export const defaultLocale = 'en';
export const locales = ['en', 'es', 'ar'] as const;

export type Locale = typeof locales[number];

export const localeIsValid = (locale:string) => locales.includes(locale as Locale)

export const getDictionary = async (locale:Locale) :Promise<Dictionary> =>{
    return (await import(`./dictioraries/${locale}.json`)).default;
}