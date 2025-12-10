import React, { useState, useEffect } from 'react';
import { Button, Input } from './Shared';
import { supabase } from '../lib/supabase';
import { Send, Trash2 } from 'lucide-react';

interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    content: string;
    created_at: string;
    likes: number;
}

interface CommentsProps {
    postId: string;
    currentUser: any;
}

const Comments: React.FC<CommentsProps> = ({ postId, currentUser }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Fetch comments
    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        setIsFetching(true);
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data || []);
        }
        setIsFetching(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setIsLoading(true);
        const { error } = await supabase.from('comments').insert([
            {
                post_id: postId,
                author_id: currentUser.id,
                author_name: currentUser.nickname || currentUser.email,
                content: newComment.trim()
            }
        ]);

        if (error) {
            console.error('Error posting comment:', error);
            alert('Erro ao postar comentário: ' + error.message);
        } else {
            setNewComment('');
            fetchComments();
        }
        setIsLoading(false);
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Excluir este comentário?')) return;

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error('Error deleting comment:', error);
            alert('Erro ao excluir comentário');
        } else {
            fetchComments();
        }
    };

    const canDelete = (comment: Comment) => {
        if (!currentUser) return false;
        return (
            currentUser.id === comment.author_id ||
            currentUser.role === 'ADMIN' ||
            currentUser.role === 'MODERATOR'
        );
    };

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold text-space-neon">
                Comentários ({comments.length})
            </h3>

            {/* Comment Form */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-space-steel overflow-hidden border-2 border-space-neon/30 flex-shrink-0">
                            <img
                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.nickname || currentUser.email}`}
                                alt="avatar"
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Adicione um comentário..."
                                className="w-full"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!newComment.trim() || isLoading}
                            size="sm"
                        >
                            <Send size={14} className="mr-2" />
                            {isLoading ? 'Enviando...' : 'Comentar'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="border border-space-steel rounded-lg p-4 text-center">
                    <p className="text-space-muted font-mono text-sm">
                        Faça login para comentar
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {isFetching ? (
                    <div className="text-center text-space-muted font-mono text-sm py-8">
                        Carregando comentários...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-space-muted font-mono text-sm py-8">
                        Seja o primeiro a comentar!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="border border-space-steel/30 rounded-lg p-4 bg-space-dark/20 hover:border-space-steel transition-colors"
                        >
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-space-steel overflow-hidden flex-shrink-0">
                                    <img
                                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author_name}`}
                                        alt="avatar"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <p className="text-sm font-bold text-space-text">
                                                {comment.author_name}
                                            </p>
                                            <p className="text-xs text-space-muted font-mono">
                                                {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {canDelete(comment) && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-space-alert hover:text-red-300 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-space-text leading-relaxed break-words">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments;
