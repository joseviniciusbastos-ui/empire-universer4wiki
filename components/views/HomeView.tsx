import React from 'react';
import { Card, Badge, Button } from '../ui/Shared';
import { Users, BookOpen, Clock, History, AlertTriangle, Star, Activity, ArrowRight, Zap, Edit3, Rocket } from 'lucide-react';
import { PostCard } from '../PostCard';
import { Post, User, BulletinItem } from '../../types';

interface HomeViewProps {
    stats: {
        wikiCount: number;
        logsCount: number;
        contributorsCount: number;
        lastUpdate: string;
    };
    recentPosts: Post[];
    isLoading: boolean;
    onNavigate: (view: string) => void;
    onPostClick: (post: Post) => void;
    aboutTitle?: string;
    aboutContent?: string;
    currentUser?: User | null;
    onEditAbout?: () => void;
    onAuthorClick?: (userId: string) => void;
    bulletins?: BulletinItem[];
    onEditBulletin?: () => void;
    onBulletinClick?: (item: BulletinItem) => void;
    readPosts?: Set<string>;
}

export const HomeView: React.FC<HomeViewProps> = ({
    stats, recentPosts, isLoading, onNavigate, onPostClick,
    aboutTitle, aboutContent, currentUser, onEditAbout, onAuthorClick,
    bulletins = [], onEditBulletin, onBulletinClick, readPosts
}) => {
    const isAdmin = currentUser?.role === 'ADMIN';

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Hero Stats - Holographic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Wiki Entries Card */}
                <div className="group relative bg-space-dark/40 border border-space-neon/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-space-neon hover:shadow-[0_0_20px_rgba(0,194,255,0.2)]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <BookOpen size={120} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-space-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-space-neon/70 font-mono text-xs tracking-widest uppercase">Entradas na Wiki</h3>
                            <Activity size={16} className="text-space-neon animate-pulse" />
                        </div>
                        <p className="text-5xl font-display font-bold text-white tracking-tight">{stats.wikiCount}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-space-muted">
                            <span className="text-space-neon">Enciclopédia Galáctica</span>
                        </div>
                    </div>
                </div>

                {/* Community Logs Card */}
                <div className="group relative bg-space-dark/40 border border-space-neon/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <History size={120} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-violet-400/70 font-mono text-xs tracking-widest uppercase">Logs da Comunidade</h3>
                            <Clock size={16} className="text-violet-400" />
                        </div>
                        <p className="text-5xl font-display font-bold text-white tracking-tight">{stats.logsCount}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-violet-300">
                            <span className="text-space-muted">Última atualização:</span>
                            <span>{stats.lastUpdate}</span>
                        </div>
                    </div>
                </div>

                {/* Contributors Card */}
                <div className="group relative bg-space-dark/40 border border-space-alert/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-space-alert hover:shadow-[0_0_20px_rgba(255,59,48,0.2)]">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity text-space-alert">
                        <Users size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-space-alert/70 font-mono text-xs tracking-widest uppercase">Contribuidores</h3>
                            <Star size={16} className="text-space-alert animate-pulse" />
                        </div>
                        <p className="text-5xl font-display font-bold text-space-alert tracking-tight">{stats.contributorsCount}</p>
                        <div className="mt-4 text-xs text-space-muted font-mono border-l-2 border-space-alert pl-2">
                            Oficiais ativos no sistema.<br />Rede de comunicação estável.
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Column: Recent Activity & Welcome */}
                <div className="lg:col-span-3 space-y-8">

                    {/* About Section - Editable by Admin */}
                    <div className="relative group">
                        <div className="bg-gradient-to-r from-space-neon/10 via-violet-500/10 to-space-alert/10 border border-space-neon/30 rounded-xl p-6 backdrop-blur-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-space-neon/20 rounded-lg border border-space-neon/30">
                                    <Rocket size={32} className="text-space-neon" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-2xl font-display font-bold text-white mb-2">
                                            {aboutTitle || 'Bem-vindo à Wiki EU4'}
                                        </h2>
                                        {isAdmin && onEditAbout && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onEditAbout}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-space-neon"
                                            >
                                                <Edit3 size={14} className="mr-1" /> EDITAR
                                            </Button>
                                        )}
                                    </div>
                                    <div
                                        className="text-space-muted font-mono text-sm leading-relaxed max-w-3xl prose prose-invert prose-sm max-w-none pr-2 custom-scrollbar"
                                        dangerouslySetInnerHTML={{ __html: aboutContent || 'Esta é a enciclopédia colaborativa dedicada ao universo de Empire Universe 4.' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-b border-space-steel/30 pb-2">
                        <h2 className="text-2xl font-display font-bold uppercase flex items-center gap-3 text-white">
                            <History className="text-space-neon" /> Transmissões Recentes
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => onNavigate('wiki')} className="text-xs hover:text-space-neon">
                            VER ARQUIVO COMPLETO <ArrowRight size={14} className="ml-1" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="h-40 flex items-center justify-center border border-space-steel/30 rounded-lg bg-space-dark/20">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-space-neon border-t-transparent animate-spin" />
                                    <span className="text-xs font-mono text-space-neon animate-pulse">DECODIFICANDO SINAL...</span>
                                </div>
                            </div>
                        ) : recentPosts.length > 0 ? (
                            recentPosts.slice(0, 5).map(post => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onClick={() => onPostClick(post)}
                                    currentUser={currentUser || null}
                                    onAuthorClick={onAuthorClick}
                                />
                            ))
                        ) : (
                            <div className="text-space-muted font-mono text-center py-10 border border-dashed border-space-steel rounded">SINAL PERDIDO. Nenhuma transmissão encontrada.</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Featured & Sidebar Stats */}
                <div className="space-y-6">

                    {/* Bulletin Board - Moved to top with enhancements */}
                    <div className="border border-space-steel/30 rounded-xl p-5 bg-gradient-to-br from-space-dark/50 to-transparent relative group">
                        {isAdmin && onEditBulletin && (
                            <button
                                onClick={onEditBulletin}
                                className="absolute top-2 right-2 p-2 bg-space-black/50 hover:bg-space-neon/20 rounded-full text-space-muted hover:text-space-neon transition-all opacity-0 group-hover:opacity-100"
                                title="Editar Boletim"
                            >
                                <Edit3 size={14} />
                            </button>
                        )}
                        <h3 className="font-display font-bold text-white uppercase text-sm mb-4 border-b border-space-steel/30 pb-2 flex justify-between">
                            <span>Boletim Oficial</span>
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        </h3>
                        <div className="space-y-3">
                            {bulletins.length === 0 ? (
                                <p className="text-xs text-space-muted font-mono italic">
                                    Nenhum comunicado oficial no momento.
                                </p>
                            ) : (
                                bulletins
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map(item => {
                                        const isNew = item.postId && !readPosts?.has(item.postId);
                                        const preview = item.content.replace(/<[^>]*>/g, '').slice(0, 80);
                                        const shouldTruncate = item.content.replace(/<[^>]*>/g, '').length > 80;

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => onBulletinClick?.(item)}
                                                className={`relative pl-4 border-l-2 group/item cursor-pointer hover:bg-space-dark/30 p-2 rounded-r transition-all ${item.type === 'alert' ? 'border-space-alert' : 'border-space-neon'
                                                    }`}
                                            >
                                                <div className={`absolute -left-[5px] top-2 w-2 h-2 rounded-full group-hover/item:scale-150 transition-transform ${item.type === 'alert' ? 'bg-space-alert' : 'bg-space-neon'
                                                    }`} />
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className={`font-bold text-xs text-white transition-colors ${item.type === 'alert' ? 'group-hover/item:text-space-alert' : 'group-hover/item:text-space-neon'
                                                                }`}>
                                                                {item.title}
                                                            </h4>
                                                            {isNew && (
                                                                <Badge className="bg-space-alert text-white text-[8px] px-1.5 py-0.5 animate-pulse">
                                                                    NEW
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-space-muted leading-relaxed line-clamp-2">
                                                            {preview}{shouldTruncate && '...'}
                                                        </p>
                                                    </div>
                                                    <ArrowRight
                                                        size={12}
                                                        className="text-space-muted group-hover/item:text-space-neon transition-colors flex-shrink-0 mt-1"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>

                    {/* Featured Member - Top Contributor */}
                    {(() => {
                        // Calculate top contributor
                        const authorCounts: { [key: string]: { name: string, count: number } } = {};
                        recentPosts.forEach(post => {
                            if (!authorCounts[post.authorId]) {
                                authorCounts[post.authorId] = { name: post.authorName, count: 0 };
                            }
                            authorCounts[post.authorId].count++;
                        });

                        const topContributor = Object.values(authorCounts)
                            .sort((a, b) => b.count - a.count)[0];

                        if (!topContributor) return (
                            <div className="relative p-1 rounded-xl bg-gradient-to-b from-space-neon via-transparent to-transparent">
                                <div className="bg-space-black/90 backdrop-blur-xl p-6 rounded-lg border border-space-steel/30 relative overflow-hidden">
                                    <h4 className="text-xs font-mono text-space-neon uppercase mb-4 tracking-widest text-center">Oficial em Destaque</h4>
                                    <p className="text-space-muted text-center text-sm font-mono">Nenhum contribuidor ativo</p>
                                </div>
                            </div>
                        );

                        return (
                            <div className="relative p-1 rounded-xl bg-gradient-to-b from-space-neon via-transparent to-transparent">
                                <div className="bg-space-black/90 backdrop-blur-xl p-6 rounded-lg border border-space-steel/30 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2">
                                        <Star size={16} className="text-yellow-400 animate-spin-slow" />
                                    </div>
                                    <h4 className="text-xs font-mono text-space-neon uppercase mb-4 tracking-widest text-center">Contribuidor Destacado</h4>

                                    <div className="flex flex-col items-center">
                                        <div className="w-24 h-24 rounded-full p-1 border-2 border-space-neon border-dashed mb-3 relative group cursor-pointer">
                                            <img
                                                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${topContributor.name}`}
                                                alt="User"
                                                className="w-full h-full rounded-full bg-space-steel object-cover grayscale group-hover:grayscale-0 transition-all"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-space-black p-1 rounded-full border border-space-neon">
                                                <Badge color="bg-yellow-500 text-black">{Math.min(topContributor.count * 5, 99)}</Badge>
                                            </div>
                                        </div>
                                        <p className="font-display font-bold text-lg text-white">{topContributor.name}</p>
                                        <p className="text-xs text-space-muted font-mono mb-4">Top Contribuidor</p>

                                        <div className="w-full grid grid-cols-2 gap-2 text-center">
                                            <div className="bg-space-dark p-2 rounded border border-space-steel/30">
                                                <p className="text-[10px] text-space-muted uppercase">Posts</p>
                                                <p className="font-mono text-white">{topContributor.count}</p>
                                            </div>
                                            <div className="bg-space-dark p-2 rounded border border-space-steel/30">
                                                <p className="text-[10px] text-space-muted uppercase">Rep</p>
                                                <p className="font-mono text-white">{topContributor.count * 10}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                </div>
            </div>
        </div >
    );
};
