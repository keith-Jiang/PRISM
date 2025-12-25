'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, TagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { BlogPost } from '@/types/page';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import 'katex/dist/katex.min.css';

interface BlogPostContentProps {
    post: BlogPost;
    content: string;
}

export default function BlogPostContent({ post, content }: BlogPostContentProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="prose prose-neutral dark:prose-invert max-w-none"
        >
            {/* 返回按钮 */}
            <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors mb-8 no-underline"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>返回博客列表</span>
            </Link>

            {/* 封面图片 */}
            {post.cover && (
                <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden mb-8 not-prose">
                    <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            )}

            {/* 标题 */}
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-primary mb-4">
                {post.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-6 not-prose">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>{post.date}</span>
                </div>
                {post.author && (
                    <span className="text-neutral-400">作者: {post.author}</span>
                )}
            </div>

            {/* 描述 */}
            {post.description && (
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 italic border-l-4 border-accent pl-4">
                    {post.description}
                </p>
            )}

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-8 not-prose">
                    <TagIcon className="h-5 w-5 text-neutral-400" />
                    {post.tags.map(tag => (
                        <span
                            key={tag}
                            className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* 分割线 */}
            <hr className="my-8 border-neutral-200 dark:border-neutral-800" />

            {/* Markdown 内容 */}
            <div className="text-neutral-800 dark:text-neutral-200">
                <ReactMarkdown
                    remarkPlugins={[
                        remarkGfm,        // GitHub Flavored Markdown (表格、删除线等)
                        remarkMath,       // 数学公式
                        remarkBreaks,     // 自动换行
                    ]}
                    rehypePlugins={[
                        rehypeKatex,      // 渲染数学公式
                        rehypeSlug,       // 为标题添加 ID
                        [rehypeAutolinkHeadings, { behavior: 'wrap' }], // 标题自动链接
                    ]}
                    components={{
                        // 标题
                        h1: ({ ...props }) => (
                            <h1 className="text-3xl font-serif font-bold text-primary mt-8 mb-4" {...props} />
                        ),
                        h2: ({ ...props }) => (
                            <h2 className="text-2xl font-serif font-bold text-primary mt-8 mb-4" {...props} />
                        ),
                        h3: ({ ...props }) => (
                            <h3 className="text-xl font-serif font-semibold text-primary mt-6 mb-3" {...props} />
                        ),
                        // 段落
                        p: ({ ...props }) => (
                            <p className="text-base leading-7 mb-4" {...props} />
                        ),
                        // 列表
                        ul: ({ ...props }) => (
                            <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />
                        ),
                        ol: ({ ...props }) => (
                            <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />
                        ),
                        li: ({ ...props }) => (
                            <li className="text-base leading-7" {...props} />
                        ),
                        // 强调
                        strong: ({ ...props }) => (
                            <strong className="font-semibold text-primary" {...props} />
                        ),
                        em: ({ ...props }) => (
                            <em className="italic" {...props} />
                        ),
                        // 引用
                        blockquote: ({ ...props }) => (
                            <blockquote className="border-l-4 border-accent pl-4 py-2 my-4 italic text-neutral-600 dark:text-neutral-400" {...props} />
                        ),
                        // 链接
                        a: ({ ...props }) => (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent underline hover:text-accent-dark transition-colors"
                            />
                        ),
                        // 图片
                        img: ({ alt, ...props }) => (
                            <span className="block my-6">
                                <img
                                    alt={alt || ''}
                                    {...props}
                                    className="rounded-lg shadow-md mx-auto max-w-full h-auto"
                                    loading="lazy"
                                />
                            </span>
                        ),
                        // 代码
                        code: ({ className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            const isInline = !match;
                            
                            if (isInline) {
                                return (
                                    <code
                                        className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono text-accent"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            }
                            
                            return (
                                <SyntaxHighlighter
                                    language={language}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: '1.5rem 0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        padding: '1rem',
                                    }}
                                    showLineNumbers={true}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            );
                        },
                        // 代码块容器 - 移除外层容器，让 SyntaxHighlighter 直接渲染
                        pre: ({ children }) => {
                            return <>{children}</>;
                        },
                        // 分割线
                        hr: ({ ...props }) => (
                            <hr className="border-neutral-200 dark:border-neutral-800 my-8" {...props} />
                        ),
                        // 表格
                        table: ({ ...props }) => (
                            <div className="overflow-x-auto my-6">
                                <table className="w-full border-collapse" {...props} />
                            </div>
                        ),
                        th: ({ ...props }) => (
                            <th className="bg-neutral-100 dark:bg-neutral-800 font-semibold text-left p-3 border border-neutral-200 dark:border-neutral-700" {...props} />
                        ),
                        td: ({ ...props }) => (
                            <td className="p-3 border border-neutral-200 dark:border-neutral-700" {...props} />
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>

            {/* 底部返回按钮 */}
            <hr className="my-8 border-neutral-200 dark:border-neutral-800" />
            <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors no-underline"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>返回博客列表</span>
            </Link>
        </motion.article>
    );
}

