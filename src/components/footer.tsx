import { Logo } from './logo';
import BlogLink from './blog-link';
import { getNavGroups } from './nav-groups';
import { FooterTranslations, NavBarTranslations } from '@/i18n/type';
import { Locale } from '@/i18n/routing';
import LanguageSelector from './language-selector';
import { Link } from '@/i18n/navigation';

const linkClass =
  'inline-flex min-h-8 items-center text-sm text-ink-2 no-underline hover:text-ink hover:underline';

const Column = ({
  heading,
  children,
}: {
  heading: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div>
    <h2 className="mb-3 text-sm font-semibold tracking-normal text-ink">
      {heading}
    </h2>
    <ul className="grid gap-1">{children}</ul>
  </div>
);

// A mast: the wordmark set large over every link of the site.
export default function Footer({
  translations,
  navTranslations,
  locale,
}: {
  translations: FooterTranslations;
  navTranslations: NavBarTranslations;
  locale: Locale;
}) {
  return (
    <footer className="mt-auto border-t border-rule bg-paper-2 pt-24 pb-16">
      <div className="page-container">
        <Link
          locale={locale}
          href="/home/"
          className="inline-flex items-center gap-4 text-[clamp(2.25rem,4vw+0.5rem,3.75rem)] leading-none font-semibold tracking-[-0.028em] text-ink no-underline"
        >
          <Logo className="size-14" />
          SlingSite
        </Link>
        <p className="mt-4 max-w-[44ch] text-ink-2">{translations.claim}</p>

        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3 xl:grid-cols-6">
          {getNavGroups(navTranslations).map((group) => (
            <Column key={group.label} heading={group.label}>
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link locale={locale} href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </Column>
          ))}
          <Column
            heading={
              <Link
                locale={locale}
                href={{
                  pathname: '/content/[...slugs]',
                  params: { slugs: [translations.comparisonsSlug] },
                }}
                className="no-underline hover:underline"
              >
                {translations.headings.comparisons}
              </Link>
            }
          >
            {[
              'kraken.mdx',
              'tiny-png.mdx',
              'squoosh.mdx',
              'shortpixel.mdx',
              'cloudinary.mdx',
            ].map((postId) => (
              <li key={postId}>
                <BlogLink
                  postId={postId}
                  className={linkClass}
                  locale={locale}
                />
              </li>
            ))}
          </Column>
          <Column heading={translations.headings.legal}>
            {['privacy.mdx', 'short-t-and-c.mdx', 't-and-c.mdx'].map(
              (postId) => (
                <li key={postId}>
                  <BlogLink
                    postId={postId}
                    className={linkClass}
                    locale={locale}
                  />
                </li>
              ),
            )}
            <li>
              <button
                type="button"
                data-cc="show-preferencesModal"
                className={linkClass}
              >
                {translations.cookies}
              </button>
            </li>
          </Column>
          <Column heading={translations.headings.development}>
            <li>
              <a
                href="https://github.com/damiarita/slingsite"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {translations.sourceCode}
              </a>
            </li>
            <li>
              <a
                href="https://github.com/damiarita/slingsite/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {translations.issues}
              </a>
            </li>
          </Column>
          <Column heading={translations.headings.connect}>
            <li>
              <Link locale={locale} href="/subscribe/" className={linkClass}>
                {translations.subscribe}
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/damiarita/slingsite/issues"
                className={linkClass}
                title="Issues · damiarita/slingsite"
                target="_blank"
                rel="noopener noreferrer"
              >
                {translations.contactUs}
              </a>
            </li>
          </Column>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-rule pt-8">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} SlingSite. {translations.copyright}
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-normal tracking-normal text-muted">
              {translations.headings.languages}
            </h2>
            <LanguageSelector currentLocale={locale} />
          </div>
        </div>
      </div>
    </footer>
  );
}
