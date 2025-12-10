import React from 'react';
import { Post, PostType } from '../types';
import { Button, Card, Badge } from './Shared';
import { Clock, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DOMPurify from 'isomorphic-dompurify';
import Comments from './Comments';

interface PostViewPageProps {
    post: Post;
    currentUser: any;
    onBack: () => void;
    onDelete: (postId: string) => void;
}

const PostViewPage: React.FC<PostViewPageProps> = ({ post, currentUser, onBack, onDelete }) => {
    const canDelete = currentUser && (
        currentUser.id === post.authorId ||
        currentUser.role === 'ADMIN' ||
        currentUser.role === 'MODERATOR'
    );

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const { error } = await supabase.from('posts').delete().eq('id', post.id);
            if (error) throw error;

            alert('Post excluído com sucesso!');
            onDelete(post.id);
            onBack();
        } catch (error: any) {
            console.error('Error deleting post:', error);
            alert('Erro ao excluir post: ' + error.message);
        }
    };

    const sanitizedContent = DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target']
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                ← Voltar
            </Button>

            <Card className="p-8">
                {/* Header */}
                <div className="mb-8 border-b border-space-steel pb-6">
                    <div className="flex gap-2 mb-3">
                        <Badge color={post.type === PostType.ARTICLE ? 'bg-space-neon text-black' : 'bg-space-steel'}>
                            {post.type}
                        </Badge>
                        <span className="text-xs text-space-neon/80 uppercase font-mono border border-space-steel px-2 py-1">
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Author Meta */}
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-space-muted font-mono">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-space-steel overflow-hidden border-2 border-space-neon/30">
                                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorName}`} alt="avatar" />
                            </div>
                            <span className="text-space-text font-bold">{post.authorName}</span>
                        </div>
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                        <span>{post.views} visualizações</span>
                        <span>{post.likes} curtidas</span>
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="flex gap-2 mt-5 flex-wrap">
                            {post.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="text-xs text-space-muted uppercase font-mono bg-space-dark border border-space-steel px-3 py-1 rounded hover:border-space-neon transition-colors"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content */}
                {/* Custom CSS for Post Content Images */}
                <style>{`
                    .prose img, .prose video, .prose iframe {
                        max-width: 100% !important;
                        height: auto !important;
                        max-height: 500px !important; /* Limit vertical height */
                        object-fit: contain;
                        border-radius: 8px;
                        margin: 1rem auto;
                        display: block;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    }
                    /* Ensure content doesn't overflow horizontally */
                    .prose {
                        max-width: 100%;
                        overflow-wrap: break-word;
                        word-wrap: break-word;
                    }
                    .prose pre {
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                `}</style>

                {/* Safe Container for User Content */}
                <div className="w-full max-w-full overflow-x-auto pb-4">
                    <div
                        className="prose prose-invert prose-lg max-w-none text-space-text leading-relaxed break-words"
                        style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                </div>




                {/* Comments Section */}
                <div className="border-t border-space-steel pt-8 mt-8">
                    <Comments postId={post.id} currentUser={currentUser} />
                </div>

                {/* Footer Actions */}
                <div className="border-t border-space-steel pt-6 mt-8 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        {canDelete && (
                            <Button
                                variant="ghost"
                                onClick={handleDelete}
                                className="text-space-alert hover:bg-red-900/20"
                            >
                                <Trash2 size={14} className="mr-2" /> EXCLUIR POST
                            </Button>
                        )}
                    </div>
                    <Button variant="primary" onClick={onBack}>
                        VOLTAR
                    </Button>
                </div>
            </Card>

            {/* Extra space for scrolling */}
            <div className="h-20"></div>
        </div>
    );
};

export default PostViewPage;
