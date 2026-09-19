import type { Metadata } from 'next';
import NotFoundContent from '@/components/not-found-content';
import { routing } from '@/i18n/routing';
import BaseDatalayer from '@/components/base-datalayer';
import Layout from '@/components/layout';

// This file becomes `out/404.html` on `next build` (output: 'export'). GitHub
// Pages serves it, unchanged, for any request path that doesn't match a real
// file — including every locale's sub-paths, since there's only ever one
// 404.html for the whole site. It can't know the requested locale at build
// time, so the interactive content (NotFoundContent) figures that out in the
// browser instead, from the URL the visitor actually landed on.
export const metadata: Metadata = {
  title: '404 - Page Not Found | SlingSite',
  description: 'The page you are looking for does not exist or has moved.',
};

export default function NotFound() {
  return (
    <Layout locale={routing.defaultLocale}>
      <NotFoundContent />
      <BaseDatalayer
        locale={routing.defaultLocale}
        pageType="404"
        pageSubtype="404"
      />
    </Layout>
  );
}
