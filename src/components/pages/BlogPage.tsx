'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRightIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BlogPageConfig } from '@/types/page';
import { useLocaleStore } from '@/lib/stores/localeStore';

export default function BlogPage({ config, embedded = false }: { config: BlogPageConfig; embedded?: boolean }) {
    const locale = useLocaleStore((state) => state.locale);
    const isChinese = locale === 'zh';
    const [query, setQuery] = useState('');
    const [activeTag, setActiveTag] = useState('all');
    const posts = useMemo(() => [...config.posts].sort((a, b) => b.date.localeCompare(a.date)), [config.posts]);
    const tags = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.tags || []))).sort(), [posts]);

    const filteredPosts = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return posts.filter((post) => {
            const matchesTag = activeTag === 'all' || post.tags?.includes(activeTag);
            const haystack = [post.title, post.description, post.author, ...(post.tags || [])].join(' ').toLowerCase();
            return matchesTag && (!keyword || haystack.includes(keyword));
        });
    }, [posts, query, activeTag]);

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <header className={embedded ? 'mb-5' : 'mb-8'}>
                <h1 className={`${embedded ? 'text-2xl' : 'text-4xl sm:text-5xl'} font-serif font-bold text-primary mb-4 tracking-tight`}>
                    {config.title}
                </h1>
                {config.description && (
                    <p className={`${embedded ? 'text-base' : 'text-lg'} text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed`}>
                        {config.description}
                    </p>
                )}
            </header>

            <div className="mb-7 space-y-4">
                <label className="relative block">
                    <span className="sr-only">{isChinese ? '搜索博客' : 'Search blogs'}</span>
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={isChinese ? '搜索标题、摘要或标签…' : 'Search titles, summaries, or tags…'}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 pl-12 pr-11 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} aria-label={isChinese ? '清空搜索' : 'Clear search'} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-primary">
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </label>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setActiveTag('all')}
                        className={`rounded-full px-3 py-1.5 text-xs font-mono transition-colors ${activeTag === 'all' ? 'bg-primary text-background' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary'}`}
                    >
                        {isChinese ? '全部博客' : 'All posts'}
                    </button>
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`rounded-full px-3 py-1.5 text-xs font-mono transition-colors ${activeTag === tag ? 'bg-accent text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="pb-3 text-xs font-mono text-neutral-500">
                    {isChinese ? `${filteredPosts.length} 篇博客` : `${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'}`}
                    {activeTag !== 'all' && ` · ${activeTag}`}
                </p>
                <div className="border-t border-neutral-200 dark:border-neutral-800">
                    {filteredPosts.map((post, index) => (
                        <Link
                            key={post.id}
                            href={`/blogs/${post.id}`}
                            className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] sm:grid-cols-[3rem_minmax(0,1fr)_auto] gap-3 sm:gap-5 py-7 border-b border-neutral-200 dark:border-neutral-800"
                        >
                            <span className="font-mono text-xs text-neutral-400 pt-2">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-primary leading-snug group-hover:text-accent transition-colors mb-3">
                                    {post.title}
                                </h2>
                                {post.description && (
                                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 max-w-2xl">
                                        {post.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-neutral-500 font-mono">
                                    <time dateTime={post.date}>{post.date}</time>
                                    {post.reading_time && <span>· {post.reading_time}</span>}
                                    {post.author && <span>· {post.author}</span>}
                                </div>
                                {post.tags && post.tags.length > 0 && (
                                    <p className="mt-3 text-xs font-mono text-accent">{post.tags.join(' / ')}</p>
                                )}
                            </div>
                            <ArrowUpRightIcon className="h-5 w-5 mt-2 text-neutral-400 group-hover:text-accent transition-colors" />
                        </Link>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-neutral-500 mb-3">{isChinese ? '没有找到匹配的博客。' : 'No matching posts found.'}</p>
                        <button onClick={() => { setQuery(''); setActiveTag('all'); }} className="text-sm text-accent hover:underline">
                            {isChinese ? '清除筛选' : 'Clear filters'}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
