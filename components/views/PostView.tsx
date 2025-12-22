import React, { useEffect } from 'react';
import { Post, User, PostType } from '../../types';
import { Button, Card, Badge } from '../ui/Shared';
import { User as UserIcon, Clock, Eye, Heart, Share2, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DOMPurify from 'isomorphic-dompurify';
import Comments from '../Comments';
import { useToast } from '../../contexts/ToastContext';

interface PostViewProps {
    post: Post | null;
    onClose: () => void;
    currentUser: User | null;
    onDeleteConfirmed: (postId: string) => Promise<void>;
    onEdit: (post: Post) => void;
    onAuthorClick?: (userId: string) => void;
}

const POST_TYPE_LABELS: Record<PostType, string> = {
    [PostType.WIKI]: 'ENCYCLOPEDIA',
    [PostType.BLOG]: 'BLOG',
    [PostType.THREAD]: 'FORUM',
    [PostType.ARTICLE]: 'DATA LOGS',
};

export const PostView: React.FC<PostViewProps> = ({ post, onClose, currentUser, onDeleteConfirmed, onEdit, onAuthorClick }) => {
    const { showToast } = useToast();
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

    useEffect(() => {
        if (post) {
            // Scroll to top on load
            window.scrollTo(0, 0);

            // Increment view count
            supabase
                .from('posts')
                .update({ views: (post.views || 0) + 1 })
                .eq('id', post.id)
                .then(() => {
                    // View count updated
                });
        }
    }, [post?.id]);

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-space-muted font-mono">
                <p>Nenhum post selecionado ou post não encontrado.</p>
                <Button variant="ghost" className="mt-4" onClick={onClose}>
                    <ArrowLeft size={16} className="mr-2" /> VOLTAR
                </Button>
            </div>
        );
    }

    const canDelete = currentUser && (
        currentUser.id === post.authorId ||
        currentUser.role === 'ADMIN' ||
        currentUser.role === 'MODERATOR'
    );

    const handleDeleteClick = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            setTimeout(() => {
                setIsConfirmingDelete(false);
            }, 3000);
            return;
        }

        setIsDeleting(true);
        try {
            await onDeleteConfirmed(post.id);
            onClose();
        } catch (error: any) {
            console.error('Error deleting post:', error);
            showToast('Erro ao excluir post: ' + (error.message || 'Erro desconhecido'), 'error');
        } finally {
            setIsDeleting(false);
            setIsConfirmingDelete(false);
        }
    };

    const sanitizedContent = DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target']
    });

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
            {/* Navigation Back */}
            <div className="mb-6">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-space-muted hover:text-space-neon transition-colors font-mono text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> VOLTAR PARA O TERMINAL
                </button>
            </div>

            <Card className="bg-space-black/40 border-space-steel/30 p-8 md:p-12 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-space-neon/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 space-y-6 mb-12">
                    <div className="flex flex-wrap gap-3">
                        <Badge color={post.type === PostType.ARTICLE ? 'bg-space-neon text-black' : 'bg-space-steel'}>
                            {POST_TYPE_LABELS[post.type]}
                        </Badge>
                        <span className="text-xs text-space-neon/80 uppercase font-mono border border-space-neon/30 bg-space-neon/5 px-2 py-0.5 rounded">
                            {post.category}
                        </span>
                        {post.tags.map(tag => (
                            <span key={tag} className="text-xs text-space-muted uppercase font-mono px-1">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-space-steel/20">
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => onAuthorClick && onAuthorClick(post.authorId)}
                        >
                            <div className="w-10 h-10 rounded-full border border-space-neon/30 p-0.5 overflow-hidden group-hover:border-space-neon transition-colors">
                                <img
                                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorName}`}
                                    alt={post.authorName}
                                    className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all"
                                />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm group-hover:text-space-neon transition-colors">{post.authorName}</p>
                                <p className="text-[10px] text-space-muted font-mono uppercase">OFICIAL DE CAMPO</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-[10px] font-mono text-space-muted uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                                <Clock size={12} className="text-space-neon/50" /> {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-2">
                                <Eye size={12} className="text-space-neon/50" /> {post.views} VIEWS
                            </span>
                            <span className="flex items-center gap-2">
                                <Heart size={12} className="text-space-neon/50" /> {post.likes} LIKES
                            </span>
                        </div>

                        {canDelete && (
                            <div className="ml-auto flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(post)}
                                    className="text-space-neon hover:bg-space-neon/10 border border-space-neon/20 px-4"
                                >
                                    <Edit size={14} className="mr-2" /> EDITAR
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDeleteClick}
                                    className={`border border-space-alert/20 px-4 transition-all ${isConfirmingDelete ? 'bg-red-900/50 text-white animate-pulse' : 'text-space-alert hover:bg-red-900/20'}`}
                                    disabled={isDeleting}
                                >
                                    <Trash2 size={14} className="mr-2" />
                                    {isDeleting ? '...' : isConfirmingDelete ? 'CONFIRMAR?' : 'EXCLUIR'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                    <style>{`
                        .post-content img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 12px;
                            margin: 2rem auto;
                            display: block;
                            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                            border: 1px border-space-steel/20;
                        }
                        .post-content p {
                            margin-bottom: 1.5rem;
                            line-height: 1.8;
                        }
                        .post-content h2, .post-content h3 {
                            margin: 2.5rem 0 1rem;
                            font-family: 'Outfit', sans-serif;
                            font-weight: 700;
                            color: white;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        }
                        .post-content h2 { font-size: 1.8rem; }
                        .post-content h3 { font-size: 1.4rem; }
                        .post-content blockquote {
                            border-left: 4px solid var(--color-space-neon, #00c2ff);
                            padding-left: 1.5rem;
                            font-style: italic;
                            color: #a0aec0;
                            margin: 2rem 0;
                        }
                        .post-content pre {
                            background: rgba(0,0,0,0.5);
                            padding: 1.5rem;
                            border-radius: 8px;
                            border: 1px solid rgba(0,194,255,0.2);
                            font-family: 'JetBrains Mono', monospace;
                            margin: 2rem 0;
                            overflow-x: auto;
                        }
                    `}</style>
                    <div
                        className="post-content prose prose-invert max-w-none text-space-text font-mono text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                </div>

                {/* Footer / Last Edit */}
                {post.lastEditedByName && post.updatedAt && (
                    <div className="mt-12 pt-6 border-t border-space-steel/20 text-[10px] font-mono text-space-neon/60 uppercase text-right italic">
                        Última transmissão editada por {post.lastEditedByName} em {new Date(post.updatedAt).toLocaleString('pt-BR')}
                    </div>
                )}
            </Card>

            {/* Comments Section */}
            <div className="mt-12">
                <h3 className="text-xl font-display font-bold text-white uppercase mb-8 flex items-center gap-3">
                    <Share2 className="text-space-neon" size={20} /> Transmissões de Feedback
                </h3>
                <Comments postId={post.id} currentUser={currentUser} />
            </div>
        </div>
    );
};
