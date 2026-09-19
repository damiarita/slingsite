import { siteUrl } from '@/utils/seo';

export const metadata = {
  metadataBase: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
