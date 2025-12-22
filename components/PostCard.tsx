import React from 'react';
import { User as UserIcon, Eye, Heart } from 'lucide-react';
import { Card, Badge } from './ui/Shared';
import { ReactionButton } from './ui/ReactionButton';
import { ReputationBadge } from './ui/ReputationBadge';
import { Post, PostType, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

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
    return htmlContent.replace(/<img[^]*>/, '');
};

const POST_TYPE_LABELS: Record<PostType, string> = {
    [PostType.WIKI]: 'ENCYCLOPEDIA',
    [PostType.BLOG]: 'BLOG',
    [PostType.THREAD]: 'FORUM',
    [PostType.ARTICLE]: 'DATA LOGS',
};

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, currentUser, onAuthorClick }) => {
    const { language, translatePost } = useLanguage();
    const [translatedTitle, setTranslatedTitle] = React.useState(post.title);
    const [translatedSnippet, setTranslatedSnippet] = React.useState('');
    const coverImageUrl = extractCoverImage(post.content);
    const contentWithoutCover = removeFirstImage(post.content);

    React.useEffect(() => {
        if (language === 'pt') {
            setTranslatedTitle(post.title);
            setTranslatedSnippet(contentWithoutCover.replace(/<[^>]*>?/gm, '').slice(0, 150));
        } else if (post.translations && post.translations[language]) {
            setTranslatedTitle(post.translations[language].title);
            setTranslatedSnippet(post.translations[language].content.replace(/<[^>]*>?/gm, '').slice(0, 150));
        } else {
            // Background translation for snippet
            translatePost(post).then(data => {
                setTranslatedTitle(data.title);
                setTranslatedSnippet(data.content.replace(/<[^>]*>?/gm, '').slice(0, 150));
            });
        }
    }, [language, post, contentWithoutCover]);

    // Special layout for Data Logs (ARTICLE)
    if (post.type === PostType.ARTICLE) {
        return (
            <Card className="hover:border-space-neon/50 bg-space-dark/20 transition-all cursor-pointer group mb-4 border-space-steel/20" onClick={onClick}>
                <div className="flex gap-6 items-start">
                    {/* Compact Image for Data Log */}
                    {coverImageUrl && (
                        <div className="flex-shrink-0 w-32 h-32 overflow-hidden rounded-lg border border-space-steel/30 relative group/img mt-1">
                            <img
                                src={coverImageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-space-neon/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex gap-2 items-center">
                                <span className="text-[9px] font-mono text-space-neon border border-space-neon/20 bg-space-neon/5 px-2 py-0.5 rounded uppercase tracking-tighter">DATA LOG</span>
                                <span className="text-[10px] text-space-muted font-mono uppercase">/ {post.category}</span>
                            </div>
                            <span className="text-[9px] text-space-muted font-mono">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>

                        <h3 className="text-lg font-display font-bold text-white group-hover:text-space-neon mb-2 line-clamp-1 transition-colors">
                            {translatedTitle}
                        </h3>

                        <p className="text-xs text-space-muted line-clamp-2 font-mono mb-4 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                            {translatedSnippet}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-space-steel/10">
                            <div
                                className="flex items-center gap-2 text-[10px] text-space-muted hover:text-white transition-colors cursor-pointer z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAuthorClick && onAuthorClick(post.authorId);
                                }}
                            >
                                <span className="text-space-neon">BY:</span> {post.authorName}
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-mono text-space-muted">
                                <span className="flex items-center gap-1"><Eye size={10} /> {post.views}</span>
                                <span className="flex items-center gap-1"><Heart size={10} /> {post.likes}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    // Default layout for Forum (THREAD) and others
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
                            <Badge color={post.type === PostType.ARTICLE ? 'bg-space-neon text-black' : 'bg-space-steel'}>
                                {POST_TYPE_LABELS[post.type]}
                            </Badge>
                            <span className="text-[10px] text-space-neon/80 uppercase font-mono border border-space-steel px-1">{post.category}</span>
                            {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] text-space-muted uppercase font-mono">#{tag}</span>
                            ))}
                        </div>
                        <span className="text-[10px] text-space-muted font-mono whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-heading font-bold text-space-text group-hover:text-space-neon mb-2 line-clamp-2">
                        {translatedTitle}
                    </h3>

                    {/* Content Preview */}
                    <p className="text-sm text-space-muted line-clamp-2 font-mono mb-4">
                        {translatedSnippet}
                    </p>

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
                            <div className="ml-1">
                                <ReputationBadge reputation={post.authorReputation || 0} size="sm" showTitle={false} />
                            </div>
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
