import React, { useState, useEffect } from 'react';
import { Button, Input } from './ui/Shared';
import { RichTextEditor } from './ui/RichTextEditor';
import { supabase } from '../lib/supabase';
import { Send, Trash2, MessageSquare, CornerDownRight } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PostType, User } from '../types';

interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    author_name: string;
    content: string;
    created_at: string;
    likes: number;
    parent_id: string | null;
}

interface CommentsProps {
    postId: string;
    currentUser: User | null;
}

const Comments: React.FC<CommentsProps> = ({ postId, currentUser }) => {
    const { showToast } = useToast();
    const { t } = useLanguage();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
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
            .order('created_at', { ascending: true }); // Order by oldest first for threads

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments(data || []);
        }
        setIsFetching(false);
    };

    const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
        e.preventDefault();
        const contentToPost = parentId ? replyContent : newComment;

        // Strip HTML tags to check if content is empty
        const cleanContent = contentToPost.replace(/<[^>]*>/g, '').trim();
        if (!cleanContent || !currentUser) return;

        setIsLoading(true);
        try {
            const commentData = {
                post_id: postId,
                author_id: currentUser.id,
                author_name: currentUser.username || currentUser.nickname || currentUser.email,
                content: contentToPost.trim(),
                parent_id: parentId
            };
            await supabase.from('comments').insert([commentData]);

            if (parentId) {
                setReplyingTo(null);
                setReplyContent('');
            } else {
                setNewComment('');
            }
            fetchComments();
            showToast('Comentário enviado!', 'success');
        } catch (error: any) {
            console.error('Error posting comment:', error);
            showToast('Erro ao postar comentário: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Excluir este comentário?')) return;

        try {
            await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);
            showToast('Comentário excluído', 'success');
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('Erro ao excluir comentário', 'error');
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

    // organize comments into a tree
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);
    const rootComments = comments.filter(c => !c.parent_id);
    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold text-space-neon flex items-center gap-2">
                Comentários <span className="text-sm text-space-muted font-mono bg-space-dark px-2 rounded-full border border-space-steel">{comments.length}</span>
            </h3>

            {/* Comment Form (Top Level) */}
            {currentUser ? (
                <form onSubmit={(e) => handleSubmit(e, null)} className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-space-steel overflow-hidden border-2 border-space-neon/30 flex-shrink-0">
                            <img
                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.username || currentUser.nickname || currentUser.email}`}
                                alt="avatar"
                            />
                        </div>
                        <div className="flex-1">
                            <RichTextEditor
                                value={newComment}
                                onChange={setNewComment}
                                placeholder={t.newComment + "..."}
                                className="w-full bg-space-dark/50"
                                minHeight="150px"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!newComment.replace(/<[^>]*>/g, '').trim() || isLoading}
                            size="sm"
                        >
                            <Send size={14} className="mr-2" />
                            {isLoading ? t.loading : t.comments}
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
            <div className="space-y-2">
                {isFetching ? (
                    <div className="text-center text-space-muted font-mono text-sm py-8">
                        Carregando comentários...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-space-muted font-mono text-sm py-8">
                        Seja o primeiro a comentar!
                    </div>
                ) : (
                    rootComments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            allComments={comments}
                            currentUser={currentUser}
                            onDelete={handleDelete}
                            onReplySubmit={handleSubmit}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Extracted Component
// Extracted Component
interface CommentItemProps {
    comment: Comment;
    allComments: Comment[];
    currentUser: any;
    depth?: number;
    onDelete: (id: string) => void;
    onReplySubmit: (e: React.FormEvent, parentId: string) => void;
    replyingTo: string | null;
    setReplyingTo: (id: string | null) => void;
    replyContent: string;
    setReplyContent: (s: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    allComments,
    currentUser,
    depth = 0,
    onDelete,
    onReplySubmit,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent
}) => {
    const { t, language, translateText } = useLanguage();
    const [translatedContent, setTranslatedContent] = useState(comment.content);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (language !== 'pt') {
            handleTranslation();
        } else {
            setTranslatedContent(comment.content);
        }
    }, [language, comment.content]);

    const handleTranslation = async () => {
        setIsTranslating(true);
        const translated = await translateText(comment.content, language);
        setTranslatedContent(translated);
        setIsTranslating(false);
    };
    const replies = allComments.filter(c => c.parent_id === comment.id);
    const isReplying = replyingTo === comment.id;

    const canDelete = () => {
        if (!currentUser) return false;
        return (
            currentUser.id === comment.author_id ||
            currentUser.role === 'ADMIN' ||
            currentUser.role === 'MODERATOR'
        );
    };

    return (
        <div className={`mt-4 ${depth > 0 ? 'ml-8 pl-4 border-l border-space-steel/30' : ''}`}>
            <div className="border border-space-steel/30 rounded-lg p-4 bg-space-dark/20 hover:border-space-steel transition-colors group">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-space-steel overflow-hidden flex-shrink-0">
                        <img
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author_name}`}
                            alt="avatar"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                                <span className="text-sm font-bold text-space-text mr-2">
                                    {comment.author_name}
                                </span>
                                <span className="text-xs text-space-muted font-mono">
                                    {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {currentUser && (
                                    <button
                                        onClick={() => {
                                            if (isReplying) {
                                                setReplyingTo(null);
                                                setReplyContent('');
                                            } else {
                                                setReplyingTo(comment.id);
                                                setReplyContent('');
                                            }
                                        }}
                                        className="text-space-neon hover:text-white transition-colors p-1"
                                        title="Responder"
                                    >
                                        <MessageSquare size={14} />
                                    </button>
                                )}
                                {canDelete() && (
                                    <button
                                        onClick={() => onDelete(comment.id)}
                                        className="text-space-alert hover:text-red-300 transition-colors p-1"
                                        title="Excluir"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div
                            className={`text-sm text-space-text leading-relaxed break-words prose prose-invert max-w-none ${isTranslating ? 'opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: translatedContent }}
                        />

                        {/* Reply Input */}
                        {isReplying && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                <form onSubmit={(e) => onReplySubmit(e, comment.id)} className="flex gap-2">
                                    <div className="flex-1">
                                        <RichTextEditor
                                            value={replyContent}
                                            onChange={setReplyContent}
                                            placeholder={`Respondendo a ${comment.author_name}...`}
                                            className="w-full text-xs"
                                            minHeight="100px"
                                        />
                                    </div>
                                    <Button type="submit" size="sm" variant="secondary" disabled={!replyContent.replace(/<[^>]*>/g, '').trim()}>
                                        <CornerDownRight size={14} />
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recursive Replies */}
            {replies.length > 0 && (
                <div className="space-y-2">
                    {replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            allComments={allComments}
                            currentUser={currentUser}
                            depth={depth + 1}
                            onDelete={onDelete}
                            onReplySubmit={onReplySubmit}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;
