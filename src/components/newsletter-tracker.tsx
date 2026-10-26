'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/utils/analytics';

const successPanelId = 'success-message';
const activeClass = 'sib-form-message-panel--active';

// The Brevo form is an opaque HTML blob that submits on its own, so we watch
// for its success panel: Brevo's script adds `activeClass` to it once the
// subscription is accepted. Render it next to the form.
export default function NewsletterTracker() {
  useEffect(() => {
    let wasActive = false;
    const check = () => {
      const isActive =
        document
          .getElementById(successPanelId)
          ?.classList.contains(activeClass) ?? false;
      if (isActive && !wasActive) {
        trackEvent({ event: 'newsletter_subscribe' });
      }
      wasActive = isActive;
    };
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
