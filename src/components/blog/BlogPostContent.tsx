'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import { BlogPost } from '@/types/page';
import { useLocaleStore } from '@/lib/stores/localeStore';
import 'katex/dist/katex.min.css';

export interface BlogPostLocaleData {
    post: BlogPost;
    content: string;
}

interface BlogPostContentProps {
    dataByLocale: Record<string, BlogPostLocaleData>;
    defaultLocale: string;
}

export default function BlogPostContent({ dataByLocale, defaultLocale }: BlogPostContentProps) {
    const locale = useLocaleStore((state) => state.locale);
    const fallback = dataByLocale[defaultLocale] || Object.values(dataByLocale)[0];
    const data = dataByLocale[locale] || fallback;

    if (!data) return null;

    const { post, content } = data;
    const isChinese = locale === 'zh';

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
        >
            <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors mb-10 no-underline">
                <ArrowLeftIcon className="h-4 w-4" />
                {isChinese ? '返回博客' : 'Back to Blogs'}
            </Link>

            <header className="mb-10 pb-8 border-b border-neutral-200 dark:border-neutral-800">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent mb-4">
                    {isChinese ? '博客' : 'Blog'}
                </p>
                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-primary leading-tight tracking-tight mb-5">
                    {post.title}
                </h1>
                {post.description && (
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                        {post.description}
                    </p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-500 font-mono mb-6">
                    <time dateTime={post.date}>{post.date}</time>
                    {post.reading_time && <span>· {post.reading_time}</span>}
                    {post.author && <span>· {post.author}</span>}
                </div>
                {(post.paper || post.code) && (
                    <div className="flex flex-wrap gap-3">
                        {post.paper && (
                            <a href={post.paper} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                                {isChinese ? '阅读论文' : 'Read paper'}<ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </a>
                        )}
                        {post.code && (
                            <a href={post.code} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                                {isChinese ? '查看代码' : 'View code'}<ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            </a>
                        )}
                    </div>
                )}
            </header>

            <div className="text-neutral-800 dark:text-neutral-300">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                    rehypePlugins={[rehypeKatex, rehypeSlug]}
                    components={{
                        h2: ({ ...props }) => <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary mt-12 mb-5" {...props} />,
                        h3: ({ ...props }) => <h3 className="text-xl font-serif font-semibold text-primary mt-8 mb-4" {...props} />,
                        p: ({ ...props }) => <p className="text-base sm:text-lg leading-8 mb-5" {...props} />,
                        ul: ({ ...props }) => <ul className="list-disc list-outside pl-6 mb-6 space-y-2" {...props} />,
                        ol: ({ ...props }) => <ol className="list-decimal list-outside pl-6 mb-6 space-y-2" {...props} />,
                        li: ({ ...props }) => <li className="text-base sm:text-lg leading-8 pl-1" {...props} />,
                        strong: ({ ...props }) => <strong className="font-semibold text-primary" {...props} />,
                        blockquote: ({ ...props }) => <blockquote className="border-l-2 border-accent pl-5 py-1 my-7 text-neutral-600 dark:text-neutral-400 italic" {...props} />,
                        a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent" />,
                        code: ({ className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            if (!match) {
                                return <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono text-accent" {...props}>{children}</code>;
                            }
                            return (
                                <SyntaxHighlighter language={match[1]} style={vscDarkPlus} customStyle={{ margin: '1.75rem 0', borderRadius: '0.5rem', fontSize: '0.875rem', padding: '1rem' }}>
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            );
                        },
                        pre: ({ children }) => <>{children}</>,
                        hr: ({ ...props }) => <hr className="border-neutral-200 dark:border-neutral-800 my-10" {...props} />,
                        table: ({ ...props }) => <div className="overflow-x-auto my-7"><table className="w-full border-collapse text-sm" {...props} /></div>,
                        th: ({ ...props }) => <th className="bg-neutral-100 dark:bg-neutral-800 font-semibold text-left p-3 border border-neutral-200 dark:border-neutral-700" {...props} />,
                        td: ({ ...props }) => <td className="p-3 border border-neutral-200 dark:border-neutral-700" {...props} />,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>

            <footer className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                {post.tags && post.tags.length > 0 && (
                    <p className="text-sm text-neutral-500 mb-6">
                        {isChinese ? '主题' : 'Topics'} · {post.tags.join(' / ')}
                    </p>
                )}
                <Link href="/blogs" className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-dark transition-colors no-underline">
                    <ArrowLeftIcon className="h-4 w-4" />
                    {isChinese ? '返回博客' : 'Back to Blogs'}
                </Link>
            </footer>
        </motion.article>
    );
}
