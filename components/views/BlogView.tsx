import React from 'react';
import { Button, Card } from '../ui/Shared';
import { PostCard } from '../PostCard';
import { Post, PostType, User } from '../../types';

interface BlogViewProps {
    posts: Post[];
    categories: string[];
    onCategoryClick: (category: string) => void;
    onCreateClick: () => void;
    onPostClick: (post: Post) => void;
    currentUser: User | null;
    onAuthorClick: (userId: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ posts, categories, onCategoryClick, onCreateClick, onPostClick, currentUser, onAuthorClick }) => {
    const blogPosts = posts.filter(p => p.type === PostType.ARTICLE);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold uppercase">Data Logs (Blog)</h2>
                <Button variant="primary" onClick={onCreateClick}>NOVO LOG</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                    <Card title="Temas de Pesquisa" className="p-4">
                        <ul className="space-y-3 font-heading text-lg text-space-muted uppercase tracking-wider">
                            <li onClick={() => onCategoryClick('')} className="hover:text-space-neon cursor-pointer text-space-neon font-bold">Todos os Artigos</li>
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
                        <div className="text-space-muted font-mono">Nenhum artigo encontrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
};