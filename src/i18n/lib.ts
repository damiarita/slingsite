export const defaultLocale = 'en';
export const locales = ['en', 'es', 'ca'] as const;

export type Locale = typeof locales[number];

export const localeIsValid = (locale:string) => locales.includes(locale as Locale)

type Dictionary = typeof import('./dictioraries/en.json');
type DictionaryKey = keyof Dictionary;

const dictionaries:Record<Locale, () => Promise<{ default: Dictionary}>> = {
  en: () => import('./dictioraries/en.json'),
  es: () => import('./dictioraries/es.json'),
  ca: () => import('./dictioraries/ca.json')
};

export const getTranslations = async (locale:Locale) :Promise<(key:DictionaryKey)=>string> =>{
    const data = (await dictionaries[locale]()).default;
    return (key:DictionaryKey)=>data[key];
}