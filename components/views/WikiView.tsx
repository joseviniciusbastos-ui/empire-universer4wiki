import React, { useMemo } from 'react';
import { Button, Card, Badge } from '../ui/Shared';
import { PostCard } from '../PostCard';
import { Post, PostType, User } from '../../types';
import { Database, FolderOpen, Star, Search } from 'lucide-react';

interface WikiViewProps {
    posts: Post[];
    categories: string[];
    onCategoryClick: (category: string) => void;
    activeCategory?: string;
    onCreateClick: () => void;
    onPostClick: (post: Post) => void;
    currentUser: User | null;
    onAuthorClick: (userId: string) => void;
}

export const WikiView: React.FC<WikiViewProps> = ({
    posts, categories, onCategoryClick, activeCategory = 'all',
    onCreateClick, onPostClick, currentUser, onAuthorClick
}) => {
    // Filter only WIKI posts (though App.tsx might already filter, safekeeping)
    const wikiPosts = useMemo(() => posts.filter(p => p.type === PostType.WIKI), [posts]);

    // Find a featured post (e.g., most views or likes)
    const featuredPost = useMemo(() => {
        if (wikiPosts.length === 0) return null;
        return [...wikiPosts].sort((a, b) => b.likes - a.likes)[0];
    }, [wikiPosts]);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Section */}
            <div className="relative bg-space-dark/40 border-b border-space-steel/30 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Database className="text-space-neon" size={24} />
                            <h2 className="text-4xl font-display font-bold uppercase text-white tracking-widest">
                                Encyclopedia<span className="text-space-neon">Galactica</span>
                            </h2>
                        </div>
                        <p className="font-mono text-space-muted text-sm max-w-xl">
                            Acesso ao repositório central de conhecimento da Aliança.
                            Verifique a classificação de segurança antes de compartilhar dados sensíveis.
                        </p>
                    </div>
                    <Button variant="primary" onClick={onCreateClick} className="shadow-[0_0_15px_rgba(0,194,255,0.3)]">
                        NOVA ENTRADA
                    </Button>
                </div>
            </div>

            {/* Featured Section (if any) */}
            {featuredPost && activeCategory === 'all' && (
                <div className="w-full bg-gradient-to-r from-space-dark to-transparent border-l-4 border-space-neon p-6 rounded-r-lg relative overflow-hidden group mb-8 cursor-pointer hover:bg-space-dark/60 transition-colors" onClick={() => onPostClick(featuredPost)}>
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Star size={100} className="text-space-neon" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge color="bg-yellow-500 text-black font-bold">DESTAQUE</Badge>
                            <span className="text-space-neon font-mono text-xs uppercase tracking-widest">{featuredPost.category}</span>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-white group-hover:text-space-neon transition-colors">
                            {featuredPost.title}
                        </h3>
                        <div className="text-space-muted font-mono text-sm line-clamp-2 max-w-3xl" dangerouslySetInnerHTML={{ __html: featuredPost.content.replace(/<[^>]+>/g, '') }} />
                        <div className="flex items-center gap-4 mt-4 text-xs font-mono text-space-steel">
                            <span>AUTOR: {featuredPost.authorName}</span>
                            <span>VIEWS: {featuredPost.views}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-4">
                    <Card className="p-0 overflow-hidden bg-transparent border-none">
                        <div className="bg-space-dark/80 p-3 border-b border-space-steel/30 flex items-center gap-2">
                            <FolderOpen size={16} className="text-space-muted" />
                            <span className="font-mono text-xs uppercase tracking-widest text-space-muted">Diretórios</span>
                        </div>
                        <ul className="space-y-1 p-2">
                            <li>
                                <button
                                    onClick={() => onCategoryClick('all')}
                                    className={`w-full text-left px-4 py-3 rounded text-sm font-mono uppercase tracking-wide transition-all duration-300 border-l-2 ${activeCategory === 'all' ? 'bg-space-neon/10 text-space-neon border-space-neon pl-6' : 'text-space-muted border-transparent hover:bg-space-dark hover:text-white hover:pl-5'}`}
                                >
                                    Index Global
                                </button>
                            </li>
                            {categories.map(cat => (
                                <li key={cat}>
                                    <button
                                        onClick={() => onCategoryClick(cat)}
                                        className={`w-full text-left px-4 py-3 rounded text-sm font-mono uppercase tracking-wide transition-all duration-300 border-l-2 ${activeCategory === cat ? 'bg-space-neon/10 text-space-neon border-space-neon pl-6' : 'text-space-muted border-transparent hover:bg-space-dark hover:text-white hover:pl-5'}`}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <div className="hidden md:block p-4 border border-blue-500/20 rounded-lg bg-blue-500/5">
                        <h4 className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase mb-2">
                            <Search size={14} /> Dica de Pesquisa
                        </h4>
                        <p className="text-[10px] text-space-muted font-mono leading-relaxed">
                            Utilize hashtags (#) na busca global para filtrar por tópicos específicos.
                        </p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="md:col-span-3">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono text-space-muted">
                            EXIBINDO {wikiPosts.length} REGISTROS {activeCategory !== 'all' && `EM [${activeCategory.toUpperCase()}]`}
                        </span>

                    </div>

                    <div className="space-y-4">
                        {wikiPosts.length > 0 ? (
                            wikiPosts.map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onClick={() => onPostClick(post)}
                                    currentUser={currentUser}
                                    onAuthorClick={onAuthorClick}
                                />
                            ))
                        ) : (
                            <div className="border border-dashed border-space-steel rounded-lg p-10 text-center">
                                <Database size={48} className="mx-auto text-space-steel mb-4 opacity-50" />
                                <p className="text-space-neon font-mono text-lg mb-2">Nenhum dado encontrado</p>
                                <p className="text-space-muted text-sm max-w-md mx-auto">
                                    Os sensores não detectaram entradas nesta frequência. Tente ajustar os filtros ou inicie um novo registro.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};