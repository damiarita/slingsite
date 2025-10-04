"use client";

import { useEffect } from "react";
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { acceptedCategory, run} from "vanilla-cookieconsent";
import { Locale, rtlLocales } from "@/i18n/lib";
import { CookieConsentTranslations } from "@/i18n/type";

const defaultConsentMode={
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500
};

function gtag(...args: any[]) {// eslint-disable-line @typescript-eslint/no-explicit-any
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(args);
};

const updateGtagConsent=()=>{
    gtag('consent', 'update', 
        {
            ...defaultConsentMode,
            analytics_storage: acceptedCategory('analytics') ? "granted" : "denied"
        }
    );
}

export default function CookieConsent( {locale, translations}:{locale: Locale, translations:CookieConsentTranslations} ) {
    useEffect(() => {
        gtag('consent', 'default', defaultConsentMode)
        run({
            categories: {
                necessary: {
                    enabled: true,  // this category is enabled by default
                    readOnly: true  // this category cannot be disabled
                },
                preferences: {},
                analytics: {}
            },
            language: {
                default: locale,
                autoDetect: "browser",
                rtl: rtlLocales,
                translations: {
                    [locale]: translations
                }
            },
            onFirstConsent: updateGtagConsent,
            onConsent: updateGtagConsent,
            onChange: updateGtagConsent
        });
    }, [translations, locale]);
    return null;
}