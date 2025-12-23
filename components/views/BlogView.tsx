import React from 'react';
import { Button, Card } from '../ui/Shared';
import { PostCard } from '../PostCard';
import { Post, PostType, User } from '../../types';
import { Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const STATIC_TEXT = {
    pt: {
        title: 'Data Logs',
        searchPlaceholder: 'Pesquisar logs...',
        newLog: 'NOVO LOG',
        themes: 'Temas de Pesquisa',
        all: 'Todos os Artigos',
        noResults: 'Nenhum artigo encontrado.'
    },
    en: {
        title: 'Data Logs',
        searchPlaceholder: 'Search logs...',
        newLog: 'NEW LOG',
        themes: 'Research Themes',
        all: 'All Articles',
        noResults: 'No articles found.'
    },
    fr: {
        title: 'Heures de Données',
        searchPlaceholder: 'Rechercher les journaux...',
        newLog: 'NOUVEAU JOURNAL',
        themes: 'Thèmes de Recherche',
        all: 'Tous les Articles',
        noResults: 'Aucun article trouvé.'
    }
};

interface BlogViewProps {
    posts: Post[];
    categories: string[];
    onCategoryClick: (category: string) => void;
    onCreateClick: () => void;
    onPostClick: (post: Post) => void;
    currentUser: User | null;
    onAuthorClick: (userId: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
    posts, categories, onCategoryClick, onCreateClick, onPostClick,
    currentUser, onAuthorClick, searchQuery, onSearchChange
}) => {
    const { language } = useLanguage();
    const t = STATIC_TEXT[language];
    const blogPosts = posts.filter(p => p.type === PostType.ARTICLE || p.type === PostType.BLOG);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-white">{t.title}</h2>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-space-muted" size={16} />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            className="w-full bg-space-black border border-space-steel rounded-sm py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-space-neon transition-all"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Button variant="primary" onClick={onCreateClick} className="whitespace-nowrap">NOVO LOG</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                    <Card title={t.themes} className="p-4">
                        <ul className="space-y-3 font-heading text-lg text-space-muted uppercase tracking-wider">
                            <li onClick={() => onCategoryClick('')} className="hover:text-space-neon cursor-pointer text-space-neon font-bold">{t.all}</li>
                            {categories.map(cat => (
                                <li key={cat} onClick={() => onCategoryClick(cat)} className="hover:text-space-neon cursor-pointer transition-colors">
                                    {cat}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="md:col-span-3 space-y-4">
                    {blogPosts.map(post => (
                        <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} currentUser={currentUser} onAuthorClick={onAuthorClick} />
                    ))}
                    {blogPosts.length === 0 && (
                        <div className="text-space-muted font-mono">{t.noResults}</div>
                    )}
                </div>
            </div>
        </div>
    );
};