import { Dictionary } from './dictioraries/type';

export const defaultLocale = 'en';
export const locales = ['en', 'es'] as const;

export type Locale = typeof locales[number];

export const localeIsValid = (locale:string) => locales.includes(locale as Locale)

const dictionaries:Record<Locale, () => Promise<{ default: Dictionary}>> = {
  en: () => import('./dictioraries/en.json'),
  es: () => import('./dictioraries/es.json')
};

export const getDictionary = async (locale:Locale) :Promise<Dictionary> =>{
    const dict = (await dictionaries[locale]()).default;
    return dict;
}