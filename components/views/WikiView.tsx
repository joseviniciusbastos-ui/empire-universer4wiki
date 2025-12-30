import React, { useMemo, useState } from 'react';
import { Button, Card, Badge, ContributorAvatars } from '../ui/Shared';
import { WikiGridCard } from '../WikiGridCard';
import { Post, PostType, User } from '../../types';
import { Database, FolderOpen, Star, Search, Menu, X, Filter, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const STATIC_TEXT = {
    pt: {
        encyclopedia: 'Encyclopedia',
        galactica: 'Galactica',
        status: 'Status: Sincronizado com Nucleo Central',
        categories: 'Categorias',
        newEntry: 'Nova Entrada',
        featured: 'DESTAQUE RECENTE',
        author: 'Autor',
        transmission: 'Transmissão',
        searchPlaceholder: 'PESQUISAR NA BASE DE DADOS...',
        filteringBy: 'Filtrando por:',
        noResults: 'Nenhum Registro Localizado',
        noResultsDesc: 'A base de dados não retornou resultados para esta consulta. Tente limpar os filtros de busca.',
        resetSensors: 'Reiniciar Sensores de Busca',
        directories: 'Diretórios',
        classification: 'Classificação Galáctica',
        index: 'INDEX GLOBAL',
        quote: '"O conhecimento é o único recurso que aumenta quando é compartilhado."'
    },
    en: {
        encyclopedia: 'Encyclopedia',
        galactica: 'Galactica',
        status: 'Status: Synced with Central Core',
        categories: 'Categories',
        newEntry: 'New Entry',
        featured: 'RECENT FEATURED',
        author: 'Author',
        transmission: 'Transmission',
        searchPlaceholder: 'SEARCH DATABASE...',
        filteringBy: 'Filtering by:',
        noResults: 'No Records Located',
        noResultsDesc: 'The database returned no results for this query. Try clearing search filters.',
        resetSensors: 'Reset Search Sensors',
        directories: 'Directories',
        classification: 'Galactic Classification',
        index: 'GLOBAL INDEX',
        quote: '"Knowledge is the only resource that increases when shared."'
    },
    fr: {
        encyclopedia: 'Encyclopédie',
        galactica: 'Galactique',
        status: 'Statut: Synchronisé avec le Noyau Central',
        categories: 'Catégories',
        newEntry: 'Nouvelle Entrée',
        featured: 'VEDETTE RÉCENTE',
        author: 'Auteur',
        transmission: 'Transmission',
        searchPlaceholder: 'RECHERCHER DANS LA BASE DE DONNÉES...',
        filteringBy: 'Filtrage par :',
        noResults: 'Aucun Enregistrement Localisé',
        noResultsDesc: 'La base de données n\'a retourné aucun résultat pour cette requête. Essayez d\'effacer les filtres de recherche.',
        resetSensors: 'Réinitialiser les Capteurs de Recherche',
        directories: 'Répertoires',
        classification: 'Classification Galactique',
        index: 'INDEX GLOBAL',
        quote: '"La connaissance est la seule ressource qui augmente lorsqu\'elle est partagée."'
    }
};

interface WikiViewProps {
    posts: Post[];
    categories: string[];
    onCategoryClick: (category: string) => void;
    activeCategory?: string;
    onCreateClick: () => void;
    onPostClick: (post: Post) => void;
    currentUser: User | null;
    onAuthorClick: (userId: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const WikiView: React.FC<WikiViewProps> = ({
    posts, categories, onCategoryClick, activeCategory = 'all',
    onCreateClick, onPostClick, currentUser, onAuthorClick,
    searchQuery, onSearchChange
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { language } = useLanguage();
    const t = STATIC_TEXT[language];

    // Filter only WIKI posts
    const wikiPosts = useMemo(() => {
        let filtered = posts.filter(p => p.type === PostType.WIKI);

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.content.toLowerCase().includes(query) ||
                p.tags.some(t => t.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [posts, searchQuery]);

    // Rule: Featured is the LATEST post
    const featuredPost = useMemo(() => {
        if (wikiPosts.length === 0) return null;
        return [...wikiPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    }, [wikiPosts]);

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-space-neon/10 border border-space-neon/20 rounded-xl">
                        <Database className="text-space-neon" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold uppercase text-white tracking-widest leading-none mb-1">
                            {t.encyclopedia}<span className="text-space-neon">{t.galactica}</span>
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-space-muted uppercase">
                            <span className="text-space-neon">Status:</span> {t.status}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setIsDrawerOpen(true)}
                        className="border border-space-steel/30 px-4 flex items-center gap-2 hover:border-space-neon/50 text-xs font-mono uppercase"
                    >
                        <Filter size={14} /> {t.categories}
                    </Button>
                    <Button variant="primary" onClick={onCreateClick} className="shadow-[0_0_20px_rgba(0,194,255,0.2)] text-xs font-mono uppercase tracking-widest px-6">
                        {t.newEntry}
                    </Button>
                </div>
            </div>

            {/* Wiki Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                {[
                    { label: 'Páginas Ativas', value: wikiPosts.length, icon: <Database size={14} className="text-space-neon" /> },
                    { label: 'Contribuidores', value: new Set(wikiPosts.map(p => p.authorId)).size, icon: <Star size={14} className="text-yellow-500" /> },
                    { label: 'Categorias', value: categories.length, icon: <FolderOpen size={14} className="text-blue-400" /> },
                    { label: 'Status Base', value: 'ESTÁVEL', icon: <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-space-dark/30 border border-space-steel/10 rounded-lg p-3 flex flex-col gap-1 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-[9px] font-mono text-space-muted uppercase tracking-widest">
                            {stat.icon} {stat.label}
                        </div>
                        <div className="text-lg font-display font-bold text-white leading-none">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>


            {/* Featured Post (Latest) */}
            {
                featuredPost && activeCategory === 'all' && !searchQuery && (
                    <div
                        className="group relative w-full h-[300px] border border-space-steel/30 rounded-2xl overflow-hidden cursor-pointer hover:border-space-neon/50 transition-all duration-500"
                        onClick={() => onPostClick(featuredPost)}
                    >
                        {/* Background Visuals */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src={featuredPost.content.match(/<img[^>]+src="([^">]+)"/)?.[1] || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"}
                                alt="Featured"
                                className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-space-black via-space-black/80 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-space-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Badge */}
                        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                            <Badge className="bg-space-neon text-black font-bold text-[10px] px-3 py-1 ring-4 ring-space-neon/10">{t.featured}</Badge>
                            <span className="text-space-neon/70 font-mono text-xs uppercase tracking-[0.2em] bg-space-black/80 px-2 py-1 rounded backdrop-blur-sm border border-space-neon/20">
                                {featuredPost.category}
                            </span>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8 z-10 max-w-2xl">
                            <h3 className="text-4xl font-display font-bold text-white group-hover:text-space-neon transition-colors mb-3 leading-tight">
                                {featuredPost.title}
                            </h3>
                            <div
                                className="text-space-muted font-mono text-sm line-clamp-2 mb-6 opacity-80 group-hover:opacity-100 transition-opacity"
                                dangerouslySetInnerHTML={{ __html: featuredPost.content.replace(/<[^>]+>/g, '') }}
                            />
                            <div className="flex items-center gap-6 text-[10px] font-mono text-space-steel uppercase tracking-widest">
                                <div className="flex items-center gap-3">
                                    <ContributorAvatars
                                        authorId={featuredPost.authorId}
                                        authorName={featuredPost.authorName}
                                        lastEditedBy={featuredPost.lastEditedBy}
                                        lastEditedByName={featuredPost.lastEditedByName}
                                        size="md"
                                    />
                                    <span className="flex items-center gap-2">
                                        <span className="text-space-neon opacity-50">{t.author}:</span> {featuredPost.authorName}
                                        {featuredPost.lastEditedBy && featuredPost.lastEditedBy !== featuredPost.authorId && (
                                            <span className="text-space-neon/50"> + {featuredPost.lastEditedByName}</span>
                                        )}
                                    </span>
                                </div>
                                <span className="flex items-center gap-2">
                                    <span className="text-space-neon opacity-50">{t.transmission}:</span> {new Date(featuredPost.createdAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                                </span>
                            </div>
                        </div>

                        <div className="absolute right-12 bottom-12 z-10 hidden lg:block opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                            <div className="w-12 h-12 rounded-full border border-space-neon flex items-center justify-center text-space-neon">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Search Bar Area */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-space-muted group-focus-within:text-space-neon transition-colors" size={18} />
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-space-dark/40 border border-space-steel/20 rounded-xl py-4 pl-12 pr-4 text-sm font-mono text-white focus:outline-none focus:border-space-neon/50 focus:bg-space-dark/60 transition-all placeholder:text-space-muted/50"
                />
            </div>

            {/* Category Breadcrumb/Status if filtering */}
            <div className="flex items-center gap-3 py-2">
                <span className="text-[10px] font-mono text-space-muted uppercase tracking-widest">{t.filteringBy}</span>
                <Badge
                    className="bg-space-neon/10 border border-space-neon text-space-neon px-3 py-1 flex items-center gap-2 cursor-pointer hover:bg-space-neon/20 transition-colors"
                    onClick={() => onCategoryClick('all')}
                >
                    {activeCategory.toUpperCase()} <X size={12} />
                </Badge>
            </div>

            {/* Post Grid Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wikiPosts.length > 0 ? (
                    wikiPosts.map(post => (
                        <WikiGridCard
                            key={post.id}
                            post={post}
                            onClick={() => onPostClick(post)}
                            currentUser={currentUser}
                        />
                    ))
                ) : (
                    <div className="col-span-full border border-dashed border-space-steel/30 rounded-3xl p-16 text-center bg-space-dark/10">
                        <div className="w-20 h-20 bg-space-steel/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Database size={40} className="text-space-steel opacity-40" />
                        </div>
                        <p className="text-space-neon font-display text-xl uppercase tracking-widest mb-2">{t.noResults}</p>
                        <p className="text-space-muted font-mono text-xs max-w-sm mx-auto leading-relaxed">
                            {t.noResultsDesc}
                        </p>
                        <Button
                            variant="ghost"
                            className="mt-8 text-xs font-mono uppercase text-space-neon"
                            onClick={() => { onSearchChange(''); onCategoryClick('all'); }}
                        >
                            {t.resetSensors}
                        </Button>
                    </div>
                )}
            </div>

            {/* Category Drawer Overlay */}
            {
                isDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div className="absolute inset-0 bg-space-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)} />
                        <div className="relative w-full max-w-md bg-space-dark border-l border-space-neon/30 h-full p-8 shadow-2xl animate-slideLeft">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wider">{t.directories}</h3>
                                    <p className="text-[10px] font-mono text-space-neon uppercase tracking-[0.2em] mt-1">{t.classification}</p>
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="p-3 hover:bg-space-steel/10 rounded-full text-space-muted hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => { onCategoryClick('all'); setIsDrawerOpen(false); }}
                                    className={`w-full group flex items-center justify-between p-5 rounded-xl border transition-all duration-300 ${activeCategory === 'all' ? 'bg-space-neon/10 border-space-neon text-space-neon' : 'bg-space-dark border-space-steel/20 text-space-muted hover:border-space-steel/50 hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Database size={20} className={activeCategory === 'all' ? 'text-space-neon' : 'text-space-steel'} />
                                        <span className="font-display font-bold text-sm tracking-widest">{t.index}</span>
                                    </div>
                                    <ChevronRight size={16} className={`transition-transform duration-300 ${activeCategory === 'all' ? 'translate-x-1' : 'opacity-0'}`} />
                                </button>

                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { onCategoryClick(cat); setIsDrawerOpen(false); }}
                                        className={`w-full group flex items-center justify-between p-5 rounded-xl border transition-all duration-300 ${activeCategory === cat ? 'bg-space-neon/10 border-space-neon text-space-neon' : 'bg-space-dark border-space-steel/20 text-space-muted hover:border-space-steel/50 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <FolderOpen size={20} className={activeCategory === cat ? 'text-space-neon' : 'text-space-steel'} />
                                            <span className="font-display font-bold text-sm tracking-widest uppercase">{cat}</span>
                                        </div>
                                        <ChevronRight size={16} className={`transition-transform duration-300 ${activeCategory === cat ? 'translate-x-1' : 'opacity-0'}`} />
                                    </button>
                                ))}
                            </div>

                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="bg-space-black/50 border border-space-steel/20 rounded-xl p-6">
                                    <p className="text-[10px] font-mono text-space-muted italic leading-relaxed">
                                        {t.quote}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};