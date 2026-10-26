export const gtmId = 'GTM-THHRLH4N';

export const defaultConsentMode = {
  ad_personalization: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
};

// Inline in <head>, so it runs while the HTML is parsed, before React or any
// dataLayer push. GTM needs the consent default and `env` (its "needs
// tracking" check) before it handles `gtm.js`; from effects, the order
// depended on which component mounted first. gtag commands must be pushed as
// an `arguments` object: GTM ignores plain arrays.
export const getTagManagerBootstrap = () => `
window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }
gtag('consent', 'default', ${JSON.stringify(defaultConsentMode)});
window.dataLayer.push({ env: ${JSON.stringify(process.env.NODE_ENV || 'development')} });
(function(w,d,s,l,i){w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});
`;
