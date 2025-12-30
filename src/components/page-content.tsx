import { allPageContents } from 'contentlayer/generated';
import { MDXRemote } from 'next-mdx-remote/rsc'; // Keep this
import { FAQ } from '@/components/faq'; // Import your new component

// Map components to be available in MDX
const mdxComponents = { FAQ };

export default function PageContent({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) {
  const pageContent = allPageContents.find(
    (page) => page.slug === slug && page.locale === locale,
  );

  if (!pageContent) {
    return null;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageContent.faqs?.map(
      (faq: { question: string; answer: string }) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer, // Text-only summary
        },
      }),
    ),
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="prose prose-lg mx-auto">
        <MDXRemote source={pageContent.body.raw} components={mdxComponents} />
      </article>
    </div>
  );
}
