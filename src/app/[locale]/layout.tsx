import { routing, Locale } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import Layout from '@/components/layout';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Verificar que el locale es válido
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const validatedLocale = locale as Locale;

  return <Layout locale={validatedLocale}>{children}</Layout>;
}
