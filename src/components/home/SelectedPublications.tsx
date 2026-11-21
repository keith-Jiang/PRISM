'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

export default function SelectedPublications({ publications, title, enableOnePageMode = false }: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                <Link
                    href={enableOnePageMode ? "/#publications" : "/publications"}
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium"
                >
                    {messages.home.viewAll} →
                </Link>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-800">
                {publications.map((pub) => (
                    <article key={pub.id} className="py-5 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h3 className="font-serif text-lg font-semibold text-primary leading-snug mb-2">
                                    {(pub.url || pub.doi) ? (
                                        <a href={pub.url || `https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                            {pub.title}
                                        </a>
                                    ) : pub.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-2">
                                    {pub.authors.map((author, idx) => (
                                        <span key={idx}>
                                            <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                {author.name}
                                            </span>
                                            {author.isCorresponding && (
                                                <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-500'}`}>†</sup>
                                            )}
                                            {idx < pub.authors.length - 1 && ', '}
                                        </span>
                                    ))}
                                </p>
                                <p className="text-xs text-neutral-500 font-mono mb-2">
                                    {pub.journal || pub.conference}
                                </p>
                                {pub.description && (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                        {pub.description}
                                    </p>
                                )}
                            </div>
                            {(pub.url || pub.doi) && (
                                <a href={pub.url || `https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" aria-label={pub.title} className="flex-shrink-0 mt-1 text-neutral-300 hover:text-accent transition-colors">
                                    <ArrowUpRightIcon className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </motion.section>
    );
}
