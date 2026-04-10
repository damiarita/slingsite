import { locales } from '@/i18n/lib';
import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import { remark } from 'remark';
import strip from 'strip-markdown';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`, // where your files live
  contentType: 'markdown',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    publicationDate: { type: 'date', required: true },
    modificationDate: { type: 'date', required: true },
    locale: { type: 'enum', options: locales, required: true },
    slug: { type: 'string', required: true },
    slugPrefix: { type: 'string', required: false },
  },
  computedFields: {
    text: {
      type: 'string',
      resolve: async (doc) => {
        const processed = await remark().use(strip).process(doc.body.raw);
        return processed.toString().trim();
      },
    },
    id: {
      type: 'string',
      resolve: async (doc) => doc._raw.sourceFileName,
    },
    pathPrefix: {
      type: 'string',
      resolve: (doc) => doc.slugPrefix || '',
    },
    fullSlug: {
      type: 'string',
      resolve: (doc) =>
        doc.slugPrefix ? `${doc.slugPrefix}/${doc.slug}` : doc.slug,
    },
  },
}));

export const PageContent = defineDocumentType(() => ({
  name: 'PageContent',
  filePathPattern: `page-content/**/*.mdx`, // where your files live
  contentType: 'mdx',
  fields: {
    locale: { type: 'enum', options: locales, required: true },
    slug: { type: 'string', required: true },
  },
  computedFields: {
    faqs: {
      type: 'list',
      resolve: (doc) => {
        // Regex to find <FAQ question="...">Content</FAQ>
        // Captures: Group 1 (Question), Group 2 (Answer Body)
        const faqRegex = /<FAQ\s+question="([^"]+)"[\s\S]*?>([\s\S]*?)<\/FAQ>/g;

        const faqs = [];
        let match;

        while ((match = faqRegex.exec(doc.body.raw)) !== null) {
          // Remove Markdown code fences (```) and HTML tags for Google's "Text" view
          const question = match[1];
          const answer = match[2]
            .replace(/<[^>]*>?/gm, '') // Remove HTML tags
            .trim();

          faqs.push({
            question,
            answer,
          });
        }

        return faqs;
      },
    },
  },
}));
export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post, PageContent],
  markdown: {
    remarkPlugins: [remarkGfm],
  },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypePrettyCode, { theme: 'dark-plus', keepBackground: false }],
    ],
  },
});
