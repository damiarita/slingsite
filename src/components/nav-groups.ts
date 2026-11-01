import type { NavBarTranslations } from '@/i18n/type';
import type { CompressionInput } from '@/types/compressor';
import type { AppHref } from './nav-link';

export type NavItem = { href: AppHref; label: string };
export type NavGroup = {
  type: CompressionInput;
  label: string;
  items: NavItem[];
};

// Every tool page, grouped by media type. Shared by the nav bar, the footer
// and the tool tabs above each tool page's heading.
export const getNavGroups = (translation: NavBarTranslations): NavGroup[] => [
  {
    type: 'image',
    label: translation.images,
    items: [
      { href: '/image/', label: translation.imageCompressor },
      {
        href: { pathname: '/image/format/[[...slugs]]', params: { slugs: [] } },
        label: translation.imageConverter,
      },
      {
        href: { pathname: '/image/resize/[[...slugs]]', params: { slugs: [] } },
        label: translation.imageResizer,
      },
      {
        href: {
          pathname: '/image/remove-background/[[...slugs]]',
          params: { slugs: [] },
        },
        label: translation.imageRemoveBackground,
      },
      {
        href: { pathname: '/image/alt/[[...slugs]]', params: { slugs: [] } },
        label: translation.imageAlt,
      },
    ],
  },
  {
    type: 'video',
    label: translation.videos,
    items: [
      { href: '/video/', label: translation.videoCompressor },
      {
        href: { pathname: '/video/format/[[...slugs]]', params: { slugs: [] } },
        label: translation.videoConverter,
      },
      {
        href: { pathname: '/video/resize/[[...slugs]]', params: { slugs: [] } },
        label: translation.videoResizer,
      },
      {
        href: {
          pathname: '/video/thumbnail/[[...slugs]]',
          params: { slugs: [] },
        },
        label: translation.videoThumbnail,
      },
    ],
  },
];
