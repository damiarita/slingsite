import React, { type ComponentProps } from 'react';
import { createNavigation } from 'next-intl/navigation';
import { routing, type Locale } from './routing';

const navigation = createNavigation(routing);
const BaseLink = navigation.Link;
const { getPathname, usePathname, redirect } = navigation;

// Use the Link type from the `navigation` object to avoid "value used as a type" errors.
type LinkProps = Omit<ComponentProps<(typeof navigation)['Link']>, 'locale'> & {
  locale: Locale;
}; // We force the link to have a locale as the automatic locale detection is not working properly with the output:export, so we need to pass the locale manually

export function Link(props: LinkProps) {
  // Render via createElement to avoid any JSX transform/type issues with the extracted value.
  return React.createElement(BaseLink as any, props);
}

export { getPathname, usePathname, redirect };
