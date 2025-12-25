export interface BasePageConfig {
    type: 'about' | 'publication' | 'card' | 'text' | 'blog';
    title: string;
    description?: string;
}

export interface PublicationPageConfig extends BasePageConfig {
    type: 'publication';
    source: string;
}

export interface TextPageConfig extends BasePageConfig {
    type: 'text';
    source: string;
}

export interface CardItem {
    title: string;
    subtitle?: string;
    date?: string;
    content?: string;
    tags?: string[];
    link?: string;
    image?: string;
    logo?: string; // 校徽/机构 logo
    institution?: string; // 学校/机构名称
    department?: string; // 院系
    major?: string; // 专业
    degree?: string; // 学位
}

export interface CardPageConfig extends BasePageConfig {
    type: 'card';
    items: CardItem[];
}

export interface BlogPost {
    id: string;
    title: string;
    date: string;
    description?: string;
    tags?: string[];
    cover?: string; // 封面图片
    author?: string;
}

export interface BlogPageConfig extends BasePageConfig {
    type: 'blog';
    posts: BlogPost[];
}
