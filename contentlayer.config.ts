import { locales } from '@/i18n/lib'
import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import { remark } from 'remark';
import strip from 'strip-markdown';

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`, // where your files live
  contentType: 'markdown',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    publicationDate: { type: 'date', required: true },
    modificationDate: { type: 'date', required: true },
    locale: {type: 'enum', options:locales, required: true},
    slug: { type: 'string', required: true }
  },
  computedFields: {
    text: {
      type: 'string',
      resolve: async (doc) =>{
        const processed = await remark().use(strip).process(doc.body.raw);
        return processed.toString().trim();
      } ,
    },
    id: {
      type: 'string',
      resolve: async (doc) => doc._raw.sourceFileName
    }
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
})
