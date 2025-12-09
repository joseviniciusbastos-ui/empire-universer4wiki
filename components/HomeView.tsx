import React from 'react';
import { Card, Badge, Button } from './Shared';
import { Users, BookOpen, Clock, History, AlertTriangle, Star, Activity, ArrowRight, Zap } from 'lucide-react';
import { Post } from '../types';

interface HomeViewProps {
    stats: {
        population: string;
        todayGrowth: number;
        archiveEntries: number;
        lastUpdate: string;
        serverStatus: string;
    };
    recentPosts: Post[];
    isLoading: boolean;
    onNavigate: (view: any) => void;
    onPostClick: (post: Post) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ stats, recentPosts, isLoading, onNavigate, onPostClick }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Hero Stats - Holographic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Population Card */}
                <div className="group relative bg-space-dark/40 border border-space-neon/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-space-neon hover:shadow-[0_0_20px_rgba(0,194,255,0.2)]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <Users size={120} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-space-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-space-neon/70 font-mono text-xs tracking-widest uppercase">População Total</h3>
                            <Activity size={16} className="text-space-neon animate-pulse" />
                        </div>
                        <p className="text-5xl font-display font-bold text-white tracking-tight">{stats.population}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-green-400">
                            <span className="px-1.5 py-0.5 bg-green-900/30 border border-green-500/30 rounded">+{stats.todayGrowth}</span>
                            <span className="text-space-muted">novos colonos hoje</span>
                        </div>
                    </div>
                </div>

                {/* Database Card */}
                <div className="group relative bg-space-dark/40 border border-space-neon/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <BookOpen size={120} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-violet-400/70 font-mono text-xs tracking-widest uppercase">Arquivos de Dados</h3>
                            <Zap size={16} className="text-violet-400" />
                        </div>
                        <p className="text-5xl font-display font-bold text-white tracking-tight">{stats.archiveEntries}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-violet-300">
                            <Clock size={12} />
                            <span className="text-space-muted">Atualizado há:</span>
                            <span>{stats.lastUpdate}</span>
                        </div>
                    </div>
                </div>

                {/* Server Status Card */}
                <div className="group relative bg-space-dark/40 border border-space-alert/30 p-6 overflow-hidden rounded-xl backdrop-blur-sm transition-all hover:border-space-alert hover:shadow-[0_0_20px_rgba(255,59,48,0.2)]">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity text-space-alert">
                        <AlertTriangle size={120} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-space-alert/70 font-mono text-xs tracking-widest uppercase">Integridade do Sistema</h3>
                            <div className="w-2 h-2 rounded-full bg-space-alert animate-ping" />
                        </div>
                        <p className="text-5xl font-display font-bold text-space-alert tracking-tight">{stats.serverStatus}</p>
                        <div className="mt-4 text-xs text-space-muted font-mono border-l-2 border-space-alert pl-2">
                            Tempestade de íons detectada no Setor 9.<br />Comunicações instáveis.
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Column: Recent Activity */}
                <div className="lg:col-span-3 space-y-6">
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
                                <div
                                    key={post.id}
                                    onClick={() => onPostClick(post)}
                                    className="group flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-space-steel/20 bg-space-dark/20 hover:bg-space-neon/5 hover:border-space-neon/50 transition-all cursor-pointer"
                                >
                                    {/* Placeholder for future post image */}
                                    <div className="w-full md:w-48 h-32 rounded bg-space-black border border-space-steel/30 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all">
                                        <img
                                            src={`https://source.unsplash.com/random/400x300?space,${post.category}`}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
                                            alt="Cover"
                                            onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500&auto=format&fit=crop&q=60')}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <span className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-space-neon text-black rounded-sm uppercase">
                                            {post.type}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-mono text-space-neon border border-space-neon/30 px-1 rounded">{post.category}</span>
                                                <span className="text-[10px] text-space-muted">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                            <h3 className="text-xl font-display font-bold text-white group-hover:text-space-neon transition-colors mb-2 line-clamp-1">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-space-muted font-mono line-clamp-2" dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]*>?/gm, '') }} />
                                        </div>

                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-space-steel/10">
                                            <div className="flex items-center gap-2 text-xs text-space-muted/70">
                                                <div className="w-4 h-4 rounded-full bg-space-steel overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorName}`} alt="avatar" />
                                                </div>
                                                {post.authorName}
                                            </div>
                                            <div className="flex gap-3 text-[10px] font-mono text-space-muted">
                                                <span>CORE: {post.likes}</span>
                                                <span>VIEW: {post.views}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-space-muted font-mono text-center py-10 border border-dashed border-space-steel rounded">SINAL PERDIDO. Nenhuma transmissão encontrada.</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Featured & Sidebar Stats */}
                <div className="space-y-6">

                    {/* Featured Member - Now 'Officer on Deck' */}
                    <div className="relative p-1 rounded-xl bg-gradient-to-b from-space-neon via-transparent to-transparent">
                        <div className="bg-space-black/90 backdrop-blur-xl p-6 rounded-lg border border-space-steel/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2">
                                <Star size={16} className="text-yellow-400 animate-spin-slow" />
                            </div>
                            <h4 className="text-xs font-mono text-space-neon uppercase mb-4 tracking-widest text-center">Oficial em Destaque</h4>

                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full p-1 border-2 border-space-neon border-dashed mb-3 relative group cursor-pointer">
                                    <img
                                        src="https://api.dicebear.com/7.x/identicon/svg?seed=CommanderX"
                                        alt="User"
                                        className="w-full h-full rounded-full bg-space-steel object-cover grayscale group-hover:grayscale-0 transition-all"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-space-black p-1 rounded-full border border-space-neon">
                                        <Badge color="bg-yellow-500 text-black">99</Badge>
                                    </div>
                                </div>
                                <p className="font-display font-bold text-lg text-white">CommanderX</p>
                                <p className="text-xs text-space-muted font-mono mb-4">Almirante da Frota</p>

                                <div className="w-full grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-space-dark p-2 rounded border border-space-steel/30">
                                        <p className="text-[10px] text-space-muted uppercase">Posts</p>
                                        <p className="font-mono text-white">1,204</p>
                                    </div>
                                    <div className="bg-space-dark p-2 rounded border border-space-steel/30">
                                        <p className="text-[10px] text-space-muted uppercase">Rep</p>
                                        <p className="font-mono text-white">50K</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bulletin Board - Styled */}
                    <div className="border border-space-steel/30 rounded-xl p-5 bg-gradient-to-br from-space-dark/50 to-transparent">
                        <h3 className="font-display font-bold text-white uppercase text-sm mb-4 border-b border-space-steel/30 pb-2 flex justify-between">
                            <span>Boletim Oficial</span>
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        </h3>
                        <div className="space-y-4">
                            <div className="relative pl-4 border-l-2 border-space-neon group cursor-pointer">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-space-neon group-hover:scale-150 transition-transform" />
                                <h4 className="font-bold text-xs text-white group-hover:text-space-neon transition-colors">Atualização v2.4</h4>
                                <p className="text-[10px] text-space-muted mt-1 leading-relaxed">Novos módulos de engenharia adicionados ao wiki. Verifique a compatibilidade.</p>
                            </div>
                            <div className="relative pl-4 border-l-2 border-space-alert group cursor-pointer">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-space-alert group-hover:scale-150 transition-transform" />
                                <h4 className="font-bold text-xs text-white group-hover:text-space-alert transition-colors">Alerta de Tempestade Solar</h4>
                                <p className="text-[10px] text-space-muted mt-1 leading-relaxed">Interferência nas comunicações esperada no setor 7. Protocolo Gama ativo.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
