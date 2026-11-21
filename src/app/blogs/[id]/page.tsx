import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { getMarkdownContent, getPageConfig } from '@/lib/content';
import { getConfig } from '@/lib/config';
import { getRuntimeI18nConfig } from '@/lib/i18n/config';
import { BlogPageConfig } from '@/types/page';
import BlogPostContent, { type BlogPostLocaleData } from '@/components/blog/BlogPostContent';

export const dynamicParams = false;

export function generateStaticParams() {
    const blogsPath = path.join(process.cwd(), 'content', 'blogs');
    if (!fs.existsSync(blogsPath)) return [];

    return fs.readdirSync(blogsPath)
        .filter((file) => file.endsWith('.md'))
        .map((file) => ({ id: file.replace(/\.md$/, '') }));
}

function loadPostData(id: string, locale?: string): BlogPostLocaleData | null {
    const config = getPageConfig('blogs', locale) as BlogPageConfig | null;
    const post = config?.posts.find((item) => item.id === id);
    if (!post) return null;

    const content = getMarkdownContent(`blogs/${id}.md`, locale);
    if (!content) return null;

    return { post, content };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const config = getPageConfig('blogs') as BlogPageConfig | null;
    const post = config?.posts.find((item) => item.id === id);

    if (!post) return { title: 'Blog Post Not Found' };
    return { title: post.title, description: post.description };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const baseConfig = getConfig();
    const runtimeI18n = getRuntimeI18nConfig(baseConfig.i18n);
    const targetLocales = runtimeI18n.enabled ? runtimeI18n.locales : [runtimeI18n.defaultLocale];
    const dataByLocale: Record<string, BlogPostLocaleData> = {};

    for (const locale of targetLocales) {
        const data = loadPostData(id, locale);
        if (data) dataByLocale[locale] = data;
    }

    const defaultData = loadPostData(id);
    if (defaultData) {
        dataByLocale[runtimeI18n.defaultLocale] = dataByLocale[runtimeI18n.defaultLocale] || defaultData;
    }

    if (Object.keys(dataByLocale).length === 0) notFound();

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <BlogPostContent dataByLocale={dataByLocale} defaultLocale={runtimeI18n.defaultLocale} />
        </div>
    );
}
