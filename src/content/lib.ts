import { Locale } from "@/i18n/lib";
import { allPosts, Post } from "contentlayer/generated";

const sortPosts = (posts: Post[]) => {
    return posts.toSorted((a, b) => (a.publicationDate > b.publicationDate ? -1 : 1));
}

export function getAllPosts(sorted=false): Post[] {
    if (sorted) {
        return sortPosts(allPosts);
    }
    return allPosts;
}

export function getPostOfId(id:string, locale: Locale): Post | undefined {
    return allPosts.find((p) => p.id === id && p.locale === locale);
}

export function getPost(slug: string, locale: Locale): Post | undefined {
    return allPosts.find((p) => p.slug === slug && p.locale === locale);
}

export function getTranslations(post:Post): Record<Locale, Post> {
    return allPosts.filter((p) => p.id === post.id).reduce((acc, post) => {
        acc[post.locale] = post;
        return acc;
    }, {} as Record<Locale, Post>);
}
