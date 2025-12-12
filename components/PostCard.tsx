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

// Helper function to extract cover image URL from HTML content
const extractCoverImage = (htmlContent: string): string | null => {
    const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : null;
};

// Helper function to remove first image from content (to avoid duplication in preview)
const removeFirstImage = (htmlContent: string): string => {
    return htmlContent.replace(/<img[^>]*>/, '');
};

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, currentUser, onAuthorClick }) => {
    const coverImageUrl = extractCoverImage(post.content);
    const contentWithoutCover = removeFirstImage(post.content);

    return (
        <Card className="hover:border-space-muted transition-colors cursor-pointer group mb-4" onClick={onClick}>
            <div className="flex gap-4">
                {/* Cover Image Section - Left Side */}
                {coverImageUrl && (
                    <div className="flex-shrink-0 w-40 h-40 overflow-hidden rounded-md relative group/img">
                        <img
                            src={coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                    </div>
                )}

                {/* Content Section - Right Side */}
                <div className="flex-1 min-w-0">
                    {/* Badges and Date */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 flex-wrap">
                            <Badge color={post.type === PostType.BLOG ? 'bg-space-neon text-black' : 'bg-space-steel'}>
                                {post.type}
                            </Badge>
                            <span className="text-[10px] text-space-neon/80 uppercase font-mono border border-space-steel px-1">{post.category}</span>
                            {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] text-space-muted uppercase font-mono">#{tag}</span>
                            ))}
                        </div>
                        <span className="text-[10px] text-space-muted font-mono whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-heading font-bold text-space-text group-hover:text-space-neon mb-2 line-clamp-2">
                        {post.title}
                    </h3>

                    {/* Content Preview */}
                    <p className="text-sm text-space-muted line-clamp-2 font-mono mb-4" dangerouslySetInnerHTML={{ __html: contentWithoutCover.replace(/<[^>]*>?/gm, '') }} />

                    {/* Footer */}
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
                        <div onClick={(e) => e.stopPropagation()}>
                            <ReactionButton
                                post={post}
                                currentUser={currentUser}
                                onReactionUpdate={() => { }}
                            />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-space-muted">
                            <span>VIEWS: {post.views}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
