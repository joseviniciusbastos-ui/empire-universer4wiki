import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { Card, Badge } from './ui/Shared';
import { ReactionButton } from './ui/ReactionButton';
import { Post, PostType, User } from '../types';

interface PostCardProps {
    post: Post;
    onClick: () => void;
    currentUser: User | null;
    onAuthorClick?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, currentUser, onAuthorClick }) => (
    <Card className="hover:border-space-muted transition-colors cursor-pointer group mb-4" onClick={onClick}>
        <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2">
                <Badge color={post.type === PostType.BLOG ? 'bg-space-neon text-black' : 'bg-space-steel'}>
                    {post.type}
                </Badge>
                <span className="text-[10px] text-space-neon/80 uppercase font-mono border border-space-steel px-1">{post.category}</span>
                {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] text-space-muted uppercase font-mono">#{tag}</span>
                ))}
            </div>
            <span className="text-[10px] text-space-muted font-mono">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        <h3 className="text-xl font-heading font-bold text-space-text group-hover:text-space-neon mb-2">
            {post.title}
        </h3>
        <p className="text-sm text-space-muted line-clamp-2 font-mono mb-4" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '') }} />
        <div className="flex justify-between items-center border-t border-space-steel pt-3">
            <div
                className="flex items-center gap-2 text-xs text-space-muted hover:text-white transition-colors cursor-pointer z-10"
                onClick={(e) => {
                    e.stopPropagation();
                    onAuthorClick && onAuthorClick(post.authorId);
                }}
            >
                <UserIcon size={12} /> {post.authorName}
            </div>
            <ReactionButton
                post={post}
                currentUser={currentUser}
                onReactionUpdate={() => { }} // List view typically refreshes or we need to lift state. 
            // For now, in list view we might want to just SHOW reactions or allow simple toggle.
            // Given complexity of lifting state for every card in a list, maybe make it read-only or functional?
            // Let's allow interaction, it will update local component state inside ReactionButton (optimistic) 
            // but won't persist across route changes unless we refresh list.
            />
            <div className="flex items-center gap-1 text-xs text-space-muted">
                <span>VIEWS: {post.views}</span>
            </div>
        </div>
    </Card>
);
