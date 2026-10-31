import { Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { routing } from '@/i18n/routing';
import { getNavBarDictionary, getNotFoundDictionary } from '@/i18n/requests';
import { getPathname } from '@/i18n/navigation';
import { buttonClass } from './buttons';

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
    <div className="page-container py-24 lg:py-36">
      <h1 className="max-w-[20ch] text-display tracking-[-0.022em]">
        {notFoundTranslations.heading}
      </h1>
      <p className="mt-4 max-w-[48ch] text-lead text-ink-2">
        {notFoundTranslations.subtitle}
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a href={imageHref} className={buttonClass('primary')}>
          <ImageIcon className="size-5" aria-hidden="true" />
          {navBarTranslations.imageCompressor}
        </a>
        <a href={videoHref} className={buttonClass('quiet')}>
          <VideoIcon className="size-5" aria-hidden="true" />
          {navBarTranslations.videoCompressor}
        </a>
      </div>
    </div>
  );
}
