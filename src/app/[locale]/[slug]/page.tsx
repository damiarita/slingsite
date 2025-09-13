import { Locale } from "@/i18n/lib";
import { getAllPosts, getPost, getTranslations } from "@/content/lib";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPostUrl, getPostUrlsByLocale } from "@/utils/urls";

type Props = {slug:string, locale:Locale}

export function generateStaticParams():Props[] {
    return getAllPosts().map((post) => ({ slug: post.slug, locale: post.locale }));

}

export async function generateMetadata({params}:{params:Promise<Props>}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug, locale);
  if (!post) {
    return {
      title: "Post Not Found",
      description: "The post you are looking for does not exist.",
    };
  }
  const translations = getTranslations(post);
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: getPostUrl(post),
      languages: getPostUrlsByLocale(post),
    },
  }
}

const formatDateTime=(dt:Date, locale:Locale):string=>
  dt.toLocaleString(
    locale,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )

export default async function PostPage({ params }: { params: Promise<Props> }) {
  const { slug, locale } = await params;
  const post = getPost(slug, locale);
  if (!post) notFound();
  const url = getPostUrl(post);
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "url": url,
    "headline": post.title,
    "articleBody": post.text,
    "description": post.description,
    "datePublished": post.publicationDate,
    "dateModified": post.modificationDate,
  };
  return (
    <>
    <script type="application/ld+json">
      {JSON.stringify(schema)}      
    </script>
    <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div dangerouslySetInnerHTML={{ __html: post.body.html }} className="pt-6 pb-6 prose prose-lg max-w-4xl mx-auto prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-blockquote:border-l-blue-500 prose-li:marker:text-blue-600 prose-hr:border-gray-200"/>
        <footer>
          <p>Published on <time dateTime={post.publicationDate}>{formatDateTime(new Date(post.publicationDate), locale)}</time></p>
          <p>Last Edited on <time dateTime={post.modificationDate}>{formatDateTime(new Date(post.modificationDate), locale)}</time></p>
        </footer>
    </article>
    </>
  );
}
