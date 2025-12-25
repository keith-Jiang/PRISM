import { notFound } from 'next/navigation';
import { getMarkdownContent, getPageConfig } from '@/lib/content';
import { BlogPageConfig } from '@/types/page';
import BlogPostContent from '@/components/blog/BlogPostContent';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

// 生成静态路径
export function generateStaticParams() {
    const blogsPath = path.join(process.cwd(), 'content', 'blogs');
    
    // 检查 blogs 文件夹是否存在
    if (!fs.existsSync(blogsPath)) {
        return [];
    }

    const files = fs.readdirSync(blogsPath);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    return mdFiles.map(file => ({
        id: file.replace('.md', ''),
    }));
}

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const blogConfig = getPageConfig('blogs') as BlogPageConfig | null;
    
    if (!blogConfig || blogConfig.type !== 'blog') {
        return { title: 'Blog Post' };
    }

    const post = blogConfig.posts.find(p => p.id === id);
    
    if (!post) {
        return { title: 'Blog Post Not Found' };
    }

    return {
        title: post.title,
        description: post.description,
    };
}

// 博客详情页面
export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // 获取博客配置
    const blogConfig = getPageConfig('blogs') as BlogPageConfig | null;
    
    if (!blogConfig || blogConfig.type !== 'blog') {
        notFound();
    }

    // 查找对应的博客文章
    const post = blogConfig.posts.find(p => p.id === id);
    
    if (!post) {
        notFound();
    }

    // 读取 markdown 内容
    let content = '';
    try {
        content = getMarkdownContent(`blogs/${id}.md`);
    } catch (error) {
        console.error(`Failed to load blog post: ${id}`, error);
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostContent post={post} content={content} />
        </div>
    );
}

