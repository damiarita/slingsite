export const metadata = {
  metadataBase: new URL('https://slingsite.github.io'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
