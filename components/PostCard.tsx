import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { Card, Badge } from './ui/Shared';
import { Post, PostType } from '../types';

interface PostCardProps {
    post: Post;
    onClick: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => (
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
            <div className="flex items-center gap-2 text-xs text-space-muted">
                <UserIcon size={12} /> {post.authorName}
            </div>
            <div className="flex gap-4 text-xs font-mono">
                <span>CURTIDAS: {post.likes}</span>
                <span>VISUALIZAÇÕES: {post.views}</span>
            </div>
        </div>
    </Card>
);
