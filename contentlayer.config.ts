import { locales } from '@/i18n/lib';
import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import { remark } from 'remark';
import strip from 'strip-markdown';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import urlSlug from 'url-slug';

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
    folder: { type: 'string', required: false },
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
      resolve: (doc) => (doc.folder ? urlSlug(doc.folder) : ''),
    },
    fullSlug: {
      type: 'string',
      resolve: (doc) =>
        doc.folder ? `${urlSlug(doc.folder)}/${doc.slug}` : doc.slug,
    },
    readingTime: {
      type: 'number',
      resolve: (doc) => {
        const wordsPerMinute = 200;
        const noOfWords = doc.body.raw.split(/\s+/g).length;
        const minutes = noOfWords / wordsPerMinute;
        return Math.ceil(minutes);
      },
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
    modificationDate: { type: 'date', required: false },
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
