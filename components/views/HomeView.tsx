import React from 'react';
import { Card, Badge, Button } from '../ui/Shared';
import { Users, BookOpen, Clock, History, AlertTriangle, Star, Activity, ArrowRight, Zap, Edit3, Rocket, Trophy, Cpu } from 'lucide-react';
import { PostCard } from '../PostCard';
import { Post, User, BulletinItem } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

const STATIC_TEXT = {
    pt: {
        featured: 'Contribuidor de Destaque',
        transmissions: 'TRANSMISSÕES',
        official: 'Oficial de Campo',
        wikiEntries: 'Entradas na Wiki',
        encyclopedia: 'Enciclopédia Galáctica',
        online: 'Pessoas Online na Wiki',
        activeUsers: 'Usuários ativos nas últimas 24h.',
        networkSignal: 'Sinal de rede estável.',
        welcome: 'Bem-vindo à Wiki EU4',
        defaultAbout: 'Esta é a enciclopédia colaborativa dedicada ao universo de Empire Universe 4.',
        edit: 'EDITAR',
        recentTransmissions: 'Transmissões Recentes',
        viewArchive: 'VER ARQUIVO COMPLETO',
        decoding: 'DECODIFICANDO SINAL...',
        signalLost: 'SINAL PERDIDO. Nenhuma transmissão encontrada.',
        bulletin: 'Boletim Oficial',
        noBulletins: 'Nenhum comunicado oficial no momento.',
        archive: 'Arquivo de Transmissões',
        error: 'SEM DADOS',
        achievementsTitle: 'Centro de Conquistas',
        achievementsDesc: 'Veja suas medalhas e progresso na rede.',
        checkMedals: 'VER MEDALHAS'
    },
    en: {
        featured: 'Featured Contributor',
        transmissions: 'TRANSMISSIONS',
        official: 'Field Officer',
        wikiEntries: 'Wiki Entries',
        encyclopedia: 'Galactic Encyclopedia',
        online: 'Users Online',
        activeUsers: 'Active users in the last 24h.',
        networkSignal: 'Stable network signal.',
        welcome: 'Welcome to Wiki EU4',
        defaultAbout: 'This is the collaborative encyclopedia dedicated to the Empire Universe 4 universe.',
        edit: 'EDIT',
        recentTransmissions: 'Recent Transmissions',
        viewArchive: 'VIEW FULL ARCHIVE',
        decoding: 'DECODING SIGNAL...',
        signalLost: 'SIGNAL LOST. No transmissions found.',
        bulletin: 'Official Bulletin',
        noBulletins: 'No official announcements at this time.',
        archive: 'Transmission Archive',
        error: 'NO DATA',
        achievementsTitle: 'Achievement Hub',
        achievementsDesc: 'View your medals and network progress.',
        checkMedals: 'VIEW MEDALS'
    },
    fr: {
        featured: 'Contributeur en Vedette',
        transmissions: 'TRANSMISSIONS',
        official: 'Officier de Terrain',
        wikiEntries: 'Entrées Wiki',
        encyclopedia: 'Encyclopédie Galactique',
        online: 'Personnes en Ligne',
        activeUsers: 'Utilisateurs actifs ces dernières 24h.',
        networkSignal: 'Signal réseau stable.',
        welcome: 'Bienvenue sur Wiki EU4',
        defaultAbout: 'Ceci est l\'encyclopédie collaborative dédiée à l\'univers de Empire Universe 4.',
        edit: 'MODIFIER',
        recentTransmissions: 'Transmissions Récentes',
        viewArchive: 'VOIR L\'ARCHIVE COMPLÈTE',
        decoding: 'DÉCODAGE DU SIGNAL...',
        signalLost: 'SIGNAL PERDU. Aucune transmission trouvée.',
        bulletin: 'Bulletin Officiel',
        noBulletins: 'Aucun communiqué officiel pour oument.',
        archive: 'Archive des Transmissions',
        error: 'PAS DE DONNÉES',
        achievementsTitle: 'Centre des Succès',
        achievementsDesc: 'Voir vos médailles et votre progression.',
        checkMedals: 'VOIR MÉDAILLES'
    }
};

interface HomeViewProps {
    stats: {
        wikiCount: number;
        logsCount: number;
        contributorsCount: number;
        onlineCount: number;
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
    const { language, translatePost } = useLanguage();
    const t = STATIC_TEXT[language];

    const [translatedAbout, setTranslatedAbout] = React.useState({ title: '', content: '' });
    const [translatedBulletins, setTranslatedBulletins] = React.useState<BulletinItem[]>([]);

    // Translate About Section
    React.useEffect(() => {
        if (language === 'pt') {
            setTranslatedAbout({
                title: aboutTitle || t.welcome,
                content: aboutContent || t.defaultAbout
            });
        } else {
            // Reusing translatePost logic by creating a dummy post object
            const dummyPost: Post = {
                id: 'welcome_section',
                title: aboutTitle || STATIC_TEXT.pt.welcome,
                content: aboutContent || STATIC_TEXT.pt.defaultAbout,
                type: 'WIKI' as any,
                category: '',
                authorId: '',
                authorName: '',
                slug: 'welcome',
                tags: [],
                likes: 0,
                createdAt: '',
                displayOrder: 0
            };
            translatePost(dummyPost).then(data => {
                setTranslatedAbout(data);
            });
        }
    }, [language, aboutTitle, aboutContent]);

    // Translate Bulletins
    React.useEffect(() => {
        if (language === 'pt') {
            setTranslatedBulletins(bulletins);
        } else {
            const translateAllBulletins = async () => {
                const translated = await Promise.all(bulletins.map(async b => {
                    const dummy: Post = {
                        id: `bulletin_${b.id}`,
                        title: b.title,
                        content: b.content,
                        type: 'WIKI' as any,
                        category: '',
                        authorId: '',
                        authorName: '',
                        slug: '',
                        tags: [],
                        likes: 0,
                        createdAt: '',
                        displayOrder: 0
                    };
                    const data = await translatePost(dummy);
                    return { ...b, title: data.title, content: data.content };
                }));
                setTranslatedBulletins(translated);
            };
            translateAllBulletins();
        }
    }, [language, bulletins]);

    // Calculate top contributor for the hero card
    const authorCounts: { [key: string]: { name: string, count: number } } = {};
    recentPosts.forEach(post => {
        if (!authorCounts[post.authorId]) {
            authorCounts[post.authorId] = { name: post.authorName, count: 0 };
        }
        authorCounts[post.authorId].count++;
    });

    const topContributor = Object.values(authorCounts)
        .sort((a, b) => b.count - a.count)[0];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Hero Stats - Holographic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Featured Contributor Card */}
                <div
                    onClick={() => topContributor && onAuthorClick?.(Object.keys(authorCounts).find(id => authorCounts[id].name === topContributor.name)!)}
                    className="group relative bg-space-dark/40 border border-violet-500/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] cursor-pointer"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Star size={120} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-violet-400/70 font-mono text-xs tracking-widest uppercase">{t.featured}</h3>
                            <Star size={16} className="text-violet-400 animate-pulse" />
                        </div>
                        {topContributor ? (
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-violet-500/50 p-0.5">
                                    <img
                                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${topContributor.name}`}
                                        className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all"
                                        alt={topContributor.name}
                                    />
                                </div>
                                <div>
                                    <p className="text-2xl font-display font-bold text-white tracking-tight">{topContributor.name}</p>
                                    <p className="text-[10px] font-mono text-violet-300 uppercase">{topContributor.count} {t.transmissions}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-2xl font-display font-bold text-white/50 tracking-tight">SEM DADOS</p>
                        )}
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-violet-300">
                            <span className="text-space-neon">{t.official}</span>
                        </div>
                    </div>
                </div>

                {/* Wiki Entries Card */}
                <div className="group relative bg-space-dark/40 border border-space-neon/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-space-neon hover:shadow-[0_0_20px_rgba(0,194,255,0.2)]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <BookOpen size={120} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-space-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-space-neon/70 font-mono text-xs tracking-widest uppercase">{t.wikiEntries}</h3>
                            <Activity size={16} className="text-space-neon animate-pulse" />
                        </div>
                        <p className="text-5xl font-display font-bold text-white tracking-tight">{stats.wikiCount}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-space-muted">
                            <span className="text-space-neon">{t.encyclopedia}</span>
                        </div>
                    </div>
                </div>

                {/* Online People Card - REPLACED Contribuidores */}
                <div className="group relative bg-space-dark/40 border border-space-alert/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-space-alert hover:shadow-[0_0_20px_rgba(255,59,48,0.2)]">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity text-space-alert">
                        <Users size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-space-alert/70 font-mono text-xs tracking-widest uppercase">{t.online}</h3>
                            <Users size={16} className="text-space-alert animate-pulse" />
                        </div>
                        <p className="text-5xl font-display font-bold text-white tracking-tight">{stats.onlineCount}</p>
                        <div className="mt-4 text-xs text-space-muted font-mono border-l-2 border-space-alert pl-2">
                            {t.activeUsers}<br />{t.networkSignal}
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
                                            {translatedAbout.title}
                                        </h2>
                                        {isAdmin && onEditAbout && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onEditAbout}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-space-neon"
                                            >
                                                <Edit3 size={14} className="mr-1" /> {t.edit}
                                            </Button>
                                        )}
                                    </div>
                                    <div
                                        className="text-space-muted font-mono text-sm leading-relaxed max-w-3xl prose prose-invert prose-sm max-w-none pr-2 custom-scrollbar"
                                        dangerouslySetInnerHTML={{ __html: translatedAbout.content }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end border-b border-space-steel/30 pb-2">
                        <h2 className="text-2xl font-display font-bold uppercase flex items-center gap-3 text-white">
                            <History className="text-space-neon" /> {t.recentTransmissions}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={() => onNavigate('wiki')} className="text-xs hover:text-space-neon">
                            {t.viewArchive} <ArrowRight size={14} className="ml-1" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="h-40 flex items-center justify-center border border-space-steel/30 rounded-lg bg-space-dark/20">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full border-2 border-space-neon border-t-transparent animate-spin" />
                                    <span className="text-xs font-mono text-space-neon animate-pulse">{t.decoding}</span>
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
                            <div className="text-space-muted font-mono text-center py-10 border border-dashed border-space-steel rounded">{t.signalLost}</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Featured & Sidebar Stats */}
                <div className="space-y-6">

                    {/* Bulletin Board - Moved to top with enhancements */}
                    <div className="border border-space-steel/30 rounded-xl p-5 bg-gradient-to-br from-space-dark/50 to-transparent relative group">
                        {isAdmin && onEditBulletin && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditBulletin(); }}
                                className="absolute top-2 right-2 z-50 p-2 bg-space-black/50 hover:bg-space-neon/20 rounded-full text-space-muted hover:text-space-neon transition-all opacity-0 group-hover:opacity-100"
                                title="Editar Boletim"
                            >
                                <Edit3 size={14} />
                            </button>
                        )}
                        <h3 className="font-display font-bold text-white uppercase text-sm mb-4 border-b border-space-steel/30 pb-2 flex justify-between">
                            <span>{t.bulletin}</span>
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        </h3>
                        <div className="space-y-4">
                            {translatedBulletins.length === 0 ? (
                                <p className="text-xs text-space-muted font-mono italic">
                                    {t.noBulletins}
                                </p>
                            ) : (() => {
                                const sorted = [...translatedBulletins].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                                const featured = sorted.slice(0, 3);
                                const archive = sorted.slice(3);

                                return (
                                    <>
                                        {/* Featured Bulletins */}
                                        <div className="space-y-3">
                                            {featured.map(item => {
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
                                            })}
                                        </div>

                                        {/* Archive Section - Scrollable */}
                                        {archive.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-space-steel/20">
                                                <h4 className="text-[10px] font-mono text-space-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <History size={10} /> {t.archive}
                                                </h4>
                                                <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                                    {archive.map(item => (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => onBulletinClick?.(item)}
                                                            className="group/archive flex items-center justify-between p-2 rounded border border-transparent hover:border-space-steel/30 hover:bg-space-dark/20 cursor-pointer transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'alert' ? 'bg-space-alert' : 'bg-white/20 group-hover/archive:bg-space-neon'}`} />
                                                                <p className="text-[10px] text-space-muted group-hover/archive:text-white transition-colors truncate max-w-[150px]">
                                                                    {item.title}
                                                                </p>
                                                            </div>
                                                            <span className="text-[8px] font-mono text-space-muted opacity-0 group-hover/archive:opacity-100 transition-opacity">
                                                                {new Date(item.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Achievements/Tech Tree Quick Link Widget */}
                    <div className="bg-space-dark/60 border border-space-neon/20 rounded-xl p-5 relative overflow-hidden group/ach">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/ach:opacity-20 transition-all scale-150 rotate-12">
                            <Trophy size={80} className="text-space-neon" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xs font-mono text-space-neon uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Trophy size={14} /> {t.achievementsTitle}
                            </h3>
                            <p className="text-[11px] text-space-muted font-mono mb-4">
                                {t.achievementsDesc}
                            </p>
                            <div className="space-y-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="w-full text-[10px] py-1.5"
                                    onClick={() => onNavigate('achievements')}
                                >
                                    {t.checkMedals}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tech Tree Shortcut */}
                    <div
                        onClick={() => onNavigate('tech-tree')}
                        className="bg-space-dark/40 border border-space-steel/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-space-neon hover:bg-space-neon/5 transition-all group"
                    >
                        <div className="w-10 h-10 rounded border border-space-steel flex items-center justify-center group-hover:border-space-neon transition-colors">
                            <Cpu size={20} className="text-space-muted group-hover:text-space-neon" />
                        </div>
                        <div>
                            <p className="text-[10px] font-mono text-space-muted uppercase tracking-tighter group-hover:text-space-neon transition-colors">Acessar Matriz</p>
                            <p className="text-xs font-display font-bold text-white uppercase">Árvore Tecnológica</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
