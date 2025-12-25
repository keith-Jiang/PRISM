'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { BlogPageConfig } from '@/types/page';

export default function BlogPage({ config, embedded = false }: { config: BlogPageConfig; embedded?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className={embedded ? "mb-4" : "mb-8"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 ${embedded ? "gap-4" : "gap-6"}`}>
                {config.posts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                        <Link
                            href={`/blogs/${post.id}`}
                            className="block group"
                        >
                            <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] overflow-hidden h-full flex flex-col`}>
                                {/* 封面图片 */}
                                {post.cover && (
                                    <div className="relative w-full h-48 bg-neutral-100 dark:bg-neutral-800">
                                        <Image
                                            src={post.cover}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}

                                {/* 内容区域 */}
                                <div className={`${embedded ? "p-4" : "p-6"} flex-1 flex flex-col`}>
                                    <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary mb-2 group-hover:text-accent transition-colors`}>
                                        {post.title}
                                    </h3>

                                    {post.description && (
                                        <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 mb-4 line-clamp-3 flex-1`}>
                                            {post.description}
                                        </p>
                                    )}

                                    {/* 底部信息 */}
                                    <div className="mt-auto space-y-3">
                                        {/* 日期和作者 */}
                                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>{post.date}</span>
                                            </div>
                                            {post.author && (
                                                <span className="text-neutral-400">by {post.author}</span>
                                            )}
                                        </div>

                                        {/* 标签 */}
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <TagIcon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                                                {post.tags.map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* 如果没有博客 */}
            {config.posts.length === 0 && (
                <div className="text-center py-12 text-neutral-500">
                    <p>暂无博客文章</p>
                </div>
            )}
        </motion.div>
    );
}

