import { locales } from '@/i18n/lib';
import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import { remark } from 'remark';
import strip from 'strip-markdown';
import rehypePrettyCode from 'rehype-pretty-code';

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
      resolve: async (doc) => {
        // Extract folder structure after locale
        // e.g., 'posts/en/blog/file.mdx' -> 'blog'
        // e.g., 'posts/en/file.mdx' -> ''
        const path = doc._raw.sourceFilePath;
        const parts = path.split('/');

        // parts[0] = 'posts', parts[1] = locale, parts[2..n-1] = folders, parts[-1] = filename
        // Everything from index 2 onwards (except filename) is the pathPrefix
        if (parts.length <= 3) {
          return ''; // No path prefix (just posts/locale/file.mdx)
        }

        return parts.slice(2, -1).join('/');
      },
    },
    fullSlug: {
      type: 'string',
      resolve: async (doc) => {
        // Slug that includes path prefix
        // e.g., 'privacy' or 'blog/my-article'
        const path = doc._raw.sourceFilePath;
        const parts = path.split('/');

        // parts[0] = 'posts', parts[1] = locale, parts[2..n-1] = folders, parts[-1] = filename
        if (parts.length <= 3) {
          return doc.slug; // No path prefix, just use slug
        }

        const prefix = parts.slice(2, -1).join('/');
        return `${prefix}/${doc.slug}`;
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
  mdx: {
    rehypePlugins: [
      [rehypePrettyCode, { theme: 'dark-plus', keepBackground: false }],
    ],
  },
});
