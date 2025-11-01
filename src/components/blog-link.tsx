import { getPostOfId } from '@/content/lib';
import { Locale } from '@/i18n/lib';
import { getPostUrl } from '@/utils/urls';

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
  const postUrl = getPostUrl(post);
  return (
    <a href={postUrl} className={className}>
      {post.title}
    </a>
  );
}
