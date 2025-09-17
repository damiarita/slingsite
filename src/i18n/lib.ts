import { ConsentModalOptions, PreferencesModalOptions } from 'vanilla-cookieconsent';
import { Dictionary } from './dictioraries/type';

export const defaultLocale = 'en';
export const locales = ['en', 'es', 'ar', 'de', 'fr', 'it', 'zh'] as const;
export const rtlLocales = ['ar'];

export type Locale = typeof locales[number];

export const localeIsValid = (locale:string) => locales.includes(locale as Locale)

/**
 * @deprecated Use specific functions instead.
 */
export const getDictionary = async (locale:Locale) :Promise<Dictionary> =>{
    return (await import(`./dictioraries/${locale}.json`)).default;
}

export const getCookieDictionary = async (locale:Locale): Promise<{consentModal: ConsentModalOptions, preferencesModal: PreferencesModalOptions}> => {
    if (locale==='ar'){
        return (await import(`./dictioraries/cookies/ar.json`)).default;
    }
    if (locale==='de'){
        return (await import(`./dictioraries/cookies/de.json`)).default;
    }
    if (locale==='es'){
        return (await import(`./dictioraries/cookies/es.json`)).default;
    }
    if (locale==='fr'){
        return (await import(`./dictioraries/cookies/fr.json`)).default;
    }
    if (locale==='it'){
        return (await import(`./dictioraries/cookies/it.json`)).default;
    }
    if (locale==='zh'){
        return (await import(`./dictioraries/cookies/zh.json`)).default;
    }
    return (await import(`./dictioraries/cookies/en.json`)).default;
}