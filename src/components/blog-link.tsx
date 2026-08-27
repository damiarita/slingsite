import { getPostOfId } from '@/content/lib';
import { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

export default function BlogLink({
  postId,
  locale,
  className,
}: {
  postId: string;
  locale: Locale;
  className?: string;
}) {
  const post = getPostOfId(postId, locale);
  if (!post) {
    throw new Error(`Post with id ${postId} not found for locale ${locale}`);
  }

  return (
    <Link
      locale={locale}
      href={{
        pathname: '/content/[...slugs]',
        params: { slugs: post.slugPath },
      }}
      className={className}
    >
      {post.title}
    </Link>
  );
}
