'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { CardPageConfig } from '@/types/page';

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
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

            <div className={`grid ${embedded ? "gap-4" : "gap-6"}`}>
                {config.items.map((item, index) => {
                    const CardWrapper = item.link ? 'a' : 'div';
                    const cardProps = item.link ? {
                        href: item.link,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        className: `block bg-white dark:bg-neutral-900 ${embedded ? "p-4" : "p-6"} rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer`
                    } : {
                        className: `bg-white dark:bg-neutral-900 ${embedded ? "p-4" : "p-6"} rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]`
                    };

                    return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                        <CardWrapper {...cardProps}>
                        {/* 如果有 logo，使用左右布局；否则使用原来的布局 */}
                        {item.logo ? (
                            <div className="flex gap-4 sm:gap-6">
                                {/* 左侧：校徽 */}
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
                                        <Image
                                            src={item.logo}
                                            alt={item.institution || item.title}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>

                                {/* 右侧：学校信息 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            {item.institution && (
                                                <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary mb-1 flex items-center gap-2`}>
                                                    {item.institution}
                                                    {item.link && (
                                                        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-neutral-400 hover:text-accent transition-colors" />
                                                    )}
                                                </h3>
                                            )}
                                            {item.department && (
                                                <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium`}>
                                                    {item.department}
                                                </p>
                                            )}
                                            {item.major && (
                                                <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 mt-1`}>
                                                    {item.major}
                                                </p>
                                            )}
                                            {item.degree && (
                                                <p className={`${embedded ? "text-xs" : "text-sm"} text-neutral-500 dark:text-neutral-600 mt-1`}>
                                                    {item.degree}
                                                </p>
                                            )}
                                        </div>
                                        {item.date && (
                                            <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded ml-2 flex-shrink-0">
                                                {item.date}
                                            </span>
                                        )}
                                    </div>
                                    {item.content && (
                                        <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 leading-relaxed mt-3`}>
                                            {item.content}
                                        </p>
                                    )}
                                    {item.tags && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // 原来的布局（没有 logo 时）
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary flex items-center gap-2`}>
                                        {item.title}
                                        {item.link && (
                                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-neutral-400 hover:text-accent transition-colors" />
                                        )}
                                    </h3>
                                    {item.date && (
                                        <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                            {item.date}
                                        </span>
                                    )}
                                </div>
                                {item.subtitle && (
                                    <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium mb-3`}>{item.subtitle}</p>
                                )}
                                {item.content && (
                                    <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                                        {item.content}
                                    </p>
                                )}
                                {item.tags && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        </CardWrapper>
                    </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
