import { Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { routing } from '@/i18n/routing';
import { getNavBarDictionary, getNotFoundDictionary } from '@/i18n/requests';
import { getPathname } from '@/i18n/navigation';

export default async function NotFoundContent() {
  const locale = routing.defaultLocale;

  const homeHref = getPathname({
    href: { pathname: '/home/' },
    locale,
  });
  const imageHref = getPathname({
    href: { pathname: '/image/' },
    locale,
  });
  const videoHref = getPathname({
    href: { pathname: '/video/' },
    locale,
  });
  const navBarTranslations = await getNavBarDictionary(locale);
  const notFoundTranslations = await getNotFoundDictionary(locale);

  return (
    <div className="w-full text-center">
      <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-800">
        {notFoundTranslations.heading}
      </h1>
      <p className="mt-4 text-base text-gray-500">
        {notFoundTranslations.subtitle}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={imageHref}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          {navBarTranslations.imageCompressor}
        </a>
        <a
          href={videoHref}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors"
        >
          <VideoIcon className="h-4 w-4" aria-hidden="true" />
          {navBarTranslations.videoCompressor}
        </a>
      </div>
    </div>
  );
}
