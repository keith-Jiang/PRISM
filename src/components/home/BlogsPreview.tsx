'use client';

import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { BlogPost } from '@/types/page';
import { useLocaleStore } from '@/lib/stores/localeStore';

interface BlogsPreviewProps {
    posts: BlogPost[];
    title?: string;
}

export default function BlogsPreview({ posts, title }: BlogsPreviewProps) {
    const locale = useLocaleStore((state) => state.locale);
    const isChinese = locale === 'zh';
    if (posts.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{title || (isChinese ? '精选博客' : 'Selected Blogs')}</h2>
                <Link href="/blogs" className="text-accent hover:text-accent-dark text-sm font-medium">
                    {isChinese ? '查看全部' : 'View all'} →
                </Link>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-800">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/blogs/${post.id}`}
                        className="group block py-5 border-b border-neutral-200 dark:border-neutral-800"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                {post.tags?.[0] && <p className="font-mono text-[11px] text-accent mb-2">{post.tags[0]}</p>}
                                <h3 className="font-serif text-lg font-semibold text-primary leading-snug group-hover:text-accent transition-colors mb-2">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-neutral-500 font-mono">
                                    {post.date}{post.reading_time ? ` · ${post.reading_time}` : ''}
                                </p>
                            </div>
                            <ArrowUpRightIcon className="h-4 w-4 flex-shrink-0 mt-1 text-neutral-300 group-hover:text-accent transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
