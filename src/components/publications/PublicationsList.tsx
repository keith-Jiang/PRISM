'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon,
    ClipboardDocumentIcon,
    DocumentTextIcon,
    ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import { useLocaleStore } from '@/lib/stores/localeStore';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

export default function PublicationsList({ config, publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const locale = useLocaleStore((state) => state.locale);
    const isChinese = locale === 'zh';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);
    const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

    // Extract unique years and types for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(publications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [publications]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(publications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [publications]);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;

            return matchesSearch && matchesYear && matchesType;
        });
    }, [publications, searchQuery, selectedYear, selectedType]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
        >
            <header className={embedded ? 'mb-5' : 'mb-8'}>
                <h1 className={`${embedded ? 'text-2xl' : 'text-4xl sm:text-5xl'} font-serif font-bold text-primary mb-4 tracking-tight`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? 'text-base' : 'text-lg'} text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed`}>
                        {config.description}
                    </p>
                )}
            </header>

            {/* Search and Filter Controls */}
            <div className="mb-7 space-y-4">
                {/* ... (keep existing controls) ... */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={messages.publications.searchPlaceholder}
                            aria-label={messages.publications.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 pl-12 pr-4 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-3 rounded-xl border text-sm transition-colors",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-6 py-1">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "rounded-full px-3 py-1.5 text-xs font-mono transition-colors",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "rounded-full px-3 py-1.5 text-xs font-mono transition-colors",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" /> {messages.publications.type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={cn(
                                                "rounded-full px-3 py-1.5 text-xs font-mono transition-colors",
                                                selectedType === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={cn(
                                                    "rounded-full px-3 py-1.5 text-xs font-mono capitalize transition-colors",
                                                    selectedType === type
                                                        ? "bg-accent text-white"
                                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary"
                                                )}
                                            >
                                                {type.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Publications Grid */}
            <p className="pb-3 text-xs font-mono text-neutral-500">
                {isChinese ? `${filteredPublications.length} 篇论文` : `${filteredPublications.length} ${filteredPublications.length === 1 ? 'publication' : 'publications'}`}
            </p>
            <div className="border-t border-neutral-200 dark:border-neutral-800">
                {filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map((pub, index) => (
                        <article
                            key={pub.id}
                            className="grid grid-cols-[2rem_minmax(0,1fr)_auto] sm:grid-cols-[3rem_minmax(0,1fr)_auto] gap-3 sm:gap-5 py-7 border-b border-neutral-200 dark:border-neutral-800"
                        >
                            <span className="font-mono text-xs text-neutral-400 pt-2">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                                <h3 className={`${embedded ? 'text-lg' : 'text-xl sm:text-2xl'} font-serif font-semibold text-primary leading-snug mb-3`}>
                                    {(pub.url || pub.doi) ? (
                                        <a href={pub.url || `https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                            {pub.title}
                                        </a>
                                    ) : pub.title}
                                </h3>
                                <p className={`${embedded ? 'text-sm' : 'text-sm sm:text-base'} text-neutral-600 dark:text-neutral-400 leading-relaxed mb-2`}>
                                    {pub.authors.map((author, idx) => (
                                        <span key={idx}>
                                            <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                                {author.name}
                                            </span>
                                            {author.isCorresponding && (
                                                <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>†</sup>
                                            )}
                                            {idx < pub.authors.length - 1 && ', '}
                                        </span>
                                    ))}
                                </p>
                                <p className="text-xs sm:text-sm font-mono text-neutral-500 mb-3">
                                    {pub.journal || pub.conference} {pub.year}
                                </p>

                                {pub.description && (
                                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 max-w-2xl">
                                        {pub.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {(pub.url || pub.doi) && (
                                        <a
                                            href={pub.url || `https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            {pub.url ? 'Paper' : 'DOI'}
                                        </a>
                                    )}
                                    {pub.code && (
                                        <a
                                            href={pub.code}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                        >
                                            {messages.publications.code}
                                        </a>
                                    )}
                                    {pub.abstract && (
                                        <button
                                            onClick={() => setExpandedAbstractId(expandedAbstractId === pub.id ? null : pub.id)}
                                            className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                                expandedAbstractId === pub.id
                                                    ? "bg-accent text-white"
                                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                            )}
                                        >
                                            <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                            {messages.publications.abstract}
                                        </button>
                                    )}
                                    {pub.bibtex && (
                                        <button
                                            onClick={() => setExpandedBibtexId(expandedBibtexId === pub.id ? null : pub.id)}
                                            className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                                expandedBibtexId === pub.id
                                                    ? "bg-accent text-white"
                                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                            )}
                                        >
                                            <BookOpenIcon className="h-3 w-3 mr-1.5" />
                                            {messages.publications.bibtex}
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {expandedAbstractId === pub.id && pub.abstract ? (
                                        <motion.div
                                            key="abstract"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden mt-4"
                                        >
                                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                                <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                                    {pub.abstract}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                    {expandedBibtexId === pub.id && pub.bibtex ? (
                                        <motion.div
                                            key="bibtex"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden mt-4"
                                        >
                                            <div className="relative bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                                <pre className="text-xs text-neutral-600 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap break-words pr-8 font-mono">
                                                    {pub.bibtex}
                                                </pre>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(pub.bibtex || '');
                                                        // Optional: Show copied feedback
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-neutral-700 text-neutral-500 hover:text-accent shadow-sm border border-neutral-200 dark:border-neutral-600 transition-colors"
                                                    title={messages.common.copyToClipboard}
                                                >
                                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                            {(pub.url || pub.doi) && (
                                <a href={pub.url || `https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" aria-label={pub.title} className="self-start mt-2 text-neutral-400 hover:text-accent transition-colors">
                                    <ArrowUpRightIcon className="h-5 w-5" />
                                </a>
                            )}
                        </article>
                    ))
                )}
            </div>
        </motion.div>
    );
}
