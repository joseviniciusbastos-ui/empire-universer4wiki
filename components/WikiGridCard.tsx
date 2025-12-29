import React from 'react';
import { Post, User } from '../types';
import { Card, Badge } from './ui/Shared';
import { Clock, Eye, MessageSquare, ArrowUpRight, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { RANK_THRESHOLDS } from '../constants';

interface WikiGridCardProps {
    post: Post;
    onClick: () => void;
    currentUser: User | null;
}

export const WikiGridCard: React.FC<WikiGridCardProps> = ({ post, onClick, currentUser }) => {
    const { language, translatePost } = useLanguage();
    const [translatedTitle, setTranslatedTitle] = React.useState(post.title);
    const [translatedSnippet, setTranslatedSnippet] = React.useState('');

    // Try to find an image in the content or use a placeholder
    const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
    const coverImage = imgMatch ? imgMatch[1] : `https://api.dicebear.com/7.x/identicon/svg?seed=${post.title}`;

    React.useEffect(() => {
        if (language === 'pt') {
            setTranslatedTitle(post.title);
            setTranslatedSnippet(post.content.replace(/<[^>]*>?/gm, '').slice(0, 100));
        } else if (post.translations && post.translations[language]) {
            setTranslatedTitle(post.translations[language].title);
            setTranslatedSnippet(post.translations[language].content.replace(/<[^>]*>?/gm, '').slice(0, 100));
        } else {
            translatePost(post).then(data => {
                setTranslatedTitle(data.title);
                setTranslatedSnippet(data.content.replace(/<[^>]*>?/gm, '').slice(0, 100));
            });
        }
    }, [language, post]);

    return (
        <Card
            onClick={onClick}
            className="group relative flex flex-col h-full bg-space-dark/40 border-space-steel/30 hover:border-space-neon/50 transition-all duration-500 overflow-hidden cursor-pointer hover:translate-y-[-4px] hover:shadow-[0_10px_30px_-10px_rgba(0,194,255,0.2)]"
        >
            {/* Thumbnail Overlay */}
            <div className="relative h-40 overflow-hidden border-b border-space-steel/20">
                <img
                    src={coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                <div className="absolute top-3 left-3">
                    <Badge className="bg-space-black/60 backdrop-blur-md border border-space-neon/30 text-space-neon text-[10px] uppercase font-mono tracking-tighter">
                        {post.category}
                    </Badge>
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ArrowUpRight className="text-space-neon" size={18} />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-display font-bold text-white group-hover:text-space-neon transition-colors mb-2 line-clamp-2 leading-tight">
                    {translatedTitle}
                </h4>

                <p className="text-xs text-space-muted font-mono leading-relaxed line-clamp-3 mb-4 flex-1">
                    {translatedSnippet}...
                </p>

                {/* Contributors */}
                <div className="flex items-center justify-between pt-3 border-t border-space-steel/10">
                    <div className="flex items-center -space-x-2">
                        {/* Author */}
                        <div
                            className="relative group/author"
                            title={`Autor: ${post.authorName}`}
                        >
                            <div className="w-6 h-6 rounded-full bg-space-dark border border-space-steel flex items-center justify-center text-[10px] text-space-muted overflow-hidden relative z-20 hover:border-space-neon transition-colors">
                                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorName}`} alt="avatar" />
                            </div>
                        </div>

                        {/* Last Editor (if different) */}
                        {post.lastEditedBy && post.lastEditedBy !== post.authorId && (
                            <div
                                className="relative group/editor"
                                title={`Editado por: ${post.lastEditedByName}`}
                            >
                                <div className="w-6 h-6 rounded-full bg-space-dark border border-space-neon/30 flex items-center justify-center text-[10px] text-space-muted overflow-hidden relative z-10 hover:z-30 hover:border-space-neon transition-all">
                                    <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.lastEditedByName}`} alt="avatar" />
                                </div>
                            </div>
                        )}

                        <span className="text-[9px] font-mono text-space-muted ml-4 opacity-70">
                            {post.authorName} {post.lastEditedBy && post.lastEditedBy !== post.authorId && '+1'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-space-muted">
                        <span className="flex items-center gap-1">
                            <Eye size={10} /> {post.views}
                        </span>
                        <span className="flex items-center gap-1 text-space-neon">
                            <Clock size={10} /> {new Date(post.createdAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Glowing Border Accent */}
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-space-neon group-hover:w-full transition-all duration-500" />
        </Card>
    );
};
