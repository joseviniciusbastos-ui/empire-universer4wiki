import React, { useEffect } from 'react';
import { Post, User } from '../../types';
import { Button, Card, Badge } from '../ui/Shared';
import { X, User as UserIcon, Clock, Eye, Heart, Share2, Trash2, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DOMPurify from 'isomorphic-dompurify';
import Comments from '../Comments';
import { useToast } from '../../contexts/ToastContext';

interface PostViewModalProps {
    post: Post | null;
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
    onDelete?: (postId: string) => void;
}

const PostViewModal: React.FC<PostViewModalProps> = ({ post, isOpen, onClose, currentUser, onDelete }) => {
    const { showToast } = useToast();
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

    useEffect(() => {
        // Increment view count when post is opened
        if (isOpen && post) {
            supabase
                .from('posts')
                .update({ views: (post.views || 0) + 1 })
                .eq('id', post.id)
                .then(() => {

                });
        }
    }, [isOpen, post]);



    if (!isOpen || !post) {
        return null;
    }



    const canDelete = currentUser && (
        currentUser.id === post.authorId ||
        currentUser.role === 'ADMIN' ||
        currentUser.role === 'MODERATOR'
    );

    const handleDelete = async () => {
        if (!isConfirmingDelete) {
            setIsConfirmingDelete(true);
            // Auto-reset confirmation after 3 seconds if not clicked again
            setTimeout(() => {
                setIsConfirmingDelete(prev => {
                    if (prev) return false; // Only reset if still verifying
                    return prev;
                });
            }, 3000);
            return;
        }

        setIsDeleting(true);

        try {

            const { error, count } = await supabase
                .from('posts')
                .delete({ count: 'exact' }) // Request count to verify deletion
                .eq('id', post.id);



            if (error) {
                console.error('[DEBUG] Supabase DELETE Error:', error);
                throw error;
            }

            // If count is 0, it means RLS prevented deletion or post not found
            /* Note: Supabase delete returns null count sometimes depending on headers, 
               but error is the main check. If no error but didn't delete, it's usually RLS. */

            showToast('Post excluído com sucesso!', 'success'); // Replaced alert
            if (onDelete) {

                onDelete(post.id);
            } else {
                console.warn('[DEBUG] onDelete prop missing');
            }
            onClose();
        } catch (error: any) {
            console.error('Error deleting post:', error);
            showToast('Erro ao excluir post: ' + (error.message || 'Erro desconhecido'), 'error');
        } finally {
            setIsDeleting(false);
            setIsConfirmingDelete(false);
        }
    };

    // Sanitize HTML content
    const sanitizedContent = DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target']
    });

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
            <Card className="w-full max-w-4xl bg-space-black border-space-neon shadow-[0_0_50px_rgba(0,194,255,0.15)] flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b border-space-steel pb-4">
                    <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                            <Badge color={post.type === 'BLOG' ? 'bg-space-neon text-black' : 'bg-space-steel'}>
                                {post.type}
                            </Badge>
                            <span className="text-[10px] text-space-neon/80 uppercase font-mono border border-space-steel px-1">{post.category}</span>
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white mb-2">{post.title}</h2>

                        {/* Author and Meta Info */}
                        <div className="flex items-center gap-4 text-xs text-space-muted font-mono">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-space-steel overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorName}`} alt="avatar" />
                                </div>
                                <span className="text-space-text">{post.authorName}</span>
                            </div>
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye size={12} /> {post.views} visualizações
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart size={12} /> {post.likes} curtidas
                            </span>
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {post.tags.map(tag => (
                                    <span key={tag} className="text-[10px] text-space-muted uppercase font-mono bg-space-dark border border-space-steel px-2 py-1 rounded">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={onClose} className="text-space-muted hover:text-space-alert p-2">
                        <X size={24} />
                    </button>
                </div>

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

                {/* Content */}
                <div className="flex-1 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-space-steel scrollbar-track-space-darker px-1">
                    {/* Safe Container for User Content */}
                    <div className="w-full max-w-full overflow-x-auto pb-4">
                        <div
                            className="prose prose-invert max-w-none text-space-text font-mono text-sm leading-relaxed break-words"
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        />
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-space-steel pt-6 mt-8">
                        <Comments postId={post.id} currentUser={currentUser} />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-space-steel pt-4 mt-6 flex justify-between items-center">
                    <div className="flex gap-2">
                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                className={`transition-all duration-200 ${isConfirmingDelete ? 'bg-red-900/50 text-white animate-pulse' : 'text-space-alert hover:bg-red-900/20'}`}
                                disabled={isDeleting}
                            >
                                <Trash2 size={14} className="mr-2" />
                                {isDeleting ? 'EXCLUINDO...' : isConfirmingDelete ? 'CONFIRMAR?' : 'EXCLUIR'}
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            FECHAR
                        </Button>
                    </div>
                </div>

            </Card>
        </div>
    );
};

export default PostViewModal;
