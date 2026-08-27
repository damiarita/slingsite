import { Link } from '@/i18n/navigation';
import { ComponentProps } from 'react';

export type AppHref = ComponentProps<typeof Link>['href'];
export type NavBarItem = { href: AppHref; label: string };
