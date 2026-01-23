import React from 'react';
import { Book, MessageSquare, Terminal as TerminalIcon, Wrench, LogOut, X, User as UserIcon, BookOpen, LogIn, Shield, AlertTriangle, Pin, PinOff, Cpu, Trophy, Rocket, Globe, Dna, Calculator } from 'lucide-react';
import { Button } from '../ui/Shared';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';
import { RANK_THRESHOLDS } from '../../constants';
import { useLanguage, Language } from '../../contexts/LanguageContext';

const STATIC_TEXT: Record<Language, any> = {
    pt: {
        nav: 'NAVEGAÇÃO',
        mission: 'CONTROLE DA MISSÃO',
        wiki: 'ENCYCLOPEDIA GALACTICA',
        logs: 'DATA LOGS',
        comms: 'REDE DE COMMS',
        engineering: 'ENGENHARIA',
        personal: 'PESSOAL',
        command: 'COMANDO',
        abort: 'ABORTAR SESSÃO',
        access: 'ACESSAR',
        feedback: 'FEEDBACK',
        lang: 'IDIOMA / LANG',
        tech: 'ÁRVORE TECH',
        achievements: 'CONQUISTAS',
        races: 'RAÇAS',
        ship_designer: 'ESTALEIRO',
        calc: 'FERRAMENTAS'
    },
    en: {
        nav: 'NAVIGATION',
        mission: 'MISSION CONTROL',
        wiki: 'GALACTIC ENCYCLOPEDIA',
        logs: 'DATA LOGS',
        comms: 'COMMS NETWORK',
        engineering: 'ENGINEERING',
        personal: 'PERSONAL',
        command: 'COMMAND',
        abort: 'ABORT SESSION',
        access: 'LOGIN',
        feedback: 'FEEDBACK',
        lang: 'LANGUAGE / LINGUE',
        tech: 'TECH TREE',
        achievements: 'ACHIEVEMENTS',
        races: 'RACES',
        ship_designer: 'SHIPYARD',
        calc: 'TOOLS'
    },
    fr: {
        nav: 'NAVIGATION',
        mission: 'CONTRÔLE MISSION',
        wiki: 'ENCYCLOPÉDIE GALACTIQUE',
        logs: 'JOURNAUX DE DONNÉES',
        comms: 'RÉSEAU DE COMMS',
        engineering: 'INGÉNIERIE',
        personal: 'PERSONNEL',
        command: 'COMMANDE',
        abort: 'ABANDONNER SESSION',
        access: 'ACCÉDER',
        feedback: 'RETOUR D\'INFO',
        lang: 'LANGUE / LANG',
        tech: 'ARBRE TECH',
        achievements: 'SUCCÈS',
        races: 'RACES',
        ship_designer: 'CHANTIER SPATIAL',
        calc: 'CALCULATEURS'
    }
};

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isPinned: boolean;
    setIsPinned: (isPinned: boolean) => void;
    view: string;
    setView: (view: string) => void;
    currentUser: User | null;
    onLoginClick: () => void;
    onFeedbackClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isPinned, setIsPinned, view, setView, currentUser, onLoginClick, onFeedbackClick }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { language, setLanguage } = useLanguage();
    const t = STATIC_TEXT[language];

    // On mobile, use isOpen. On desktop, use isHovered or isPinned for width.
    const isExpanded = isOpen || isHovered || isPinned;

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`transition-all duration-300 ease-in-out flex flex-col overflow-hidden border-r border-space-steel bg-space-dark z-50 flex-shrink-0
                ${isExpanded ? 'w-72' : 'w-20'} 
                ${isOpen ? 'translate-x-0 fixed inset-y-0 left-0' : 'fixed inset-y-0 left-0 -translate-x-full md:relative md:translate-x-0'}`}
        >
            <div className={`h-24 border-b border-space-steel flex items-center transition-all duration-300 ${isExpanded ? 'px-5 justify-between' : 'justify-center'}`}>
                <div className="flex items-center gap-3 min-w-max">
                    <div className="w-10 h-10 rounded-full bg-space-dark border border-space-neon/50 flex items-center justify-center animate-pulse-slow shadow-[0_0_15px_rgba(0,194,255,0.3)] flex-shrink-0">
                        <img src="/favicon.png" className="w-7 h-7 object-contain" alt="EU4 Icon" />
                    </div>
                    <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}>
                        <h1 className="font-display font-bold text-xl tracking-wider text-white leading-none">EU4</h1>
                        <span className="text-[10px] text-space-neon tracking-[0.2em]">SPACE WIKI</span>
                    </div>
                </div>

                {isExpanded && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPinned(!isPinned)}
                            className={`p-1.5 rounded border transition-colors ${isPinned ? 'bg-space-neon/20 border-space-neon text-space-neon' : 'border-space-steel text-space-muted hover:text-white'}`}
                            title={isPinned ? 'Desafixar Sidebar' : 'Fixar Sidebar'}
                        >
                            {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="md:hidden text-space-muted flex-shrink-0 p-1.5">
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            <nav className="flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="mb-6">
                    <p className={`text-[10px] text-space-muted font-mono mb-2 transition-opacity duration-300 ${isExpanded ? 'opacity-100 px-5 pl-8' : 'opacity-0'}`}>
                        {isExpanded ? 'NAVEGAÇÃO' : 'NAV'}
                    </p>
                    <div className="space-y-1">
                        {[
                            { id: 'home', icon: <BookOpen size={20} />, label: t.mission },
                            { id: 'wiki', icon: <Book size={20} />, label: t.wiki },
                            { id: 'articles', icon: <TerminalIcon size={20} />, label: t.logs },
                            { id: 'forum', icon: <MessageSquare size={20} />, label: t.comms },
                            { id: 'tech-tree', icon: <Cpu size={20} />, label: t.tech },
                            { id: 'races', icon: <Dna size={20} />, label: t.races },
                            { id: 'mining-calc', icon: <Calculator size={20} />, label: t.calc },
                            { id: 'achievements', icon: <Trophy size={20} />, label: t.achievements }
                        ].map((item) => (
                            <div key={item.id} className="relative">
                                {view === item.id && (
                                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-space-neon shadow-[0_0_10px_rgba(0,194,255,0.5)] z-10" />
                                )}
                                <Button
                                    variant="ghost"
                                    className={`w-full mb-1 flex items-center transition-all duration-300 border-none outline-none
                                        ${view === item.id ? 'bg-space-neon/5 text-space-neon' : 'text-space-muted hover:text-white'}
                                        ${isExpanded ? 'justify-start px-5' : 'justify-center px-0'}`}
                                    onClick={() => setView(item.id)}
                                    title={!isExpanded ? item.label : ''}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    <span className={`flex-1 text-left whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0 overflow-hidden'}`}>
                                        {item.label}
                                    </span>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-space-steel/30">
                    <p className={`text-[10px] text-space-muted font-mono mb-2 transition-opacity duration-300 ${isExpanded ? 'opacity-100 px-5 pl-8' : 'opacity-0'}`}>
                        {isExpanded ? 'PESSOAL' : 'PERS'}
                    </p>
                    {currentUser ? (
                        <div className="space-y-1">
                            <div className="relative">
                                {view === 'profile' && (
                                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-space-neon shadow-[0_0_10px_rgba(0,194,255,0.5)] z-10" />
                                )}
                                <Button
                                    variant="ghost"
                                    className={`w-full mb-1 flex items-center transition-all duration-300 border-none outline-none
                                        ${view === 'profile' ? 'bg-space-neon/5 text-space-neon' : 'text-space-muted hover:text-white'}
                                        ${isExpanded ? 'justify-start px-5' : 'justify-center px-0'}`}
                                    onClick={() => setView('profile')}
                                    title={!isExpanded ? `PERFIL: ${currentUser.username.toUpperCase()}` : ''}
                                >
                                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        <UserIcon size={20} />
                                    </div>
                                    <span className={`flex-1 text-left whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0 overflow-hidden'}`}>
                                        {currentUser.username.toUpperCase()}
                                    </span>
                                </Button>
                            </div>

                            {currentUser.role === 'ADMIN' && (
                                <div className="relative">
                                    {view === 'admin' && (
                                        <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-space-neon shadow-[0_0_10px_rgba(0,194,255,0.5)] z-10" />
                                    )}
                                    <Button
                                        variant="ghost"
                                        className={`w-full mb-1 flex items-center transition-all duration-300 border-none outline-none
                                            ${view === 'admin' ? 'bg-space-neon/5 text-space-neon' : 'text-space-muted hover:text-white'}
                                            ${isExpanded ? 'justify-start px-5' : 'justify-center px-0'}`}
                                        onClick={() => setView('admin')}
                                        title={!isExpanded ? 'COMANDO' : ''}
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            <Shield size={20} />
                                        </div>
                                        <span className={`flex-1 text-left transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0 overflow-hidden'}`}>
                                            COMANDO
                                        </span>
                                    </Button>
                                </div>
                            )}

                            <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 h-auto mt-2' : 'opacity-0 h-0 w-0'}`}>
                                <div className="px-5 py-2">
                                    <div className="bg-space-darker rounded border border-space-steel p-3">
                                        {(() => {
                                            const reputation = currentUser.reputation || 0;
                                            const currentRank = [...RANK_THRESHOLDS].reverse().find(r => reputation >= r.min) || RANK_THRESHOLDS[0];
                                            const nextRankIndex = RANK_THRESHOLDS.findIndex(r => r === currentRank) + 1;
                                            const nextRank = nextRankIndex < RANK_THRESHOLDS.length ? RANK_THRESHOLDS[nextRankIndex] : null;

                                            let progress = 100;
                                            let pointsToNext = 0;

                                            if (nextRank) {
                                                const range = nextRank.min - currentRank.min;
                                                const earned = reputation - currentRank.min;
                                                progress = Math.min(Math.max((earned / range) * 100, 5), 100);
                                                pointsToNext = nextRank.min - reputation;
                                            }

                                            return (
                                                <>
                                                    <div className="flex justify-between text-[10px] text-space-muted mb-1 font-mono uppercase">
                                                        <span>{currentRank.title}</span>
                                                        <span className={currentRank.color}>{reputation} PTS</span>
                                                    </div>
                                                    <div className="w-full bg-space-steel h-1.5 rounded-full overflow-hidden mb-2">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,194,255,0.3)] ${currentRank.color.replace('text-', 'bg-')}`}
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                    {nextRank ? (
                                                        <div className="flex justify-between text-[9px] text-space-muted font-mono italic">
                                                            <span>Próximo: {nextRank.title}</span>
                                                            <span className="text-space-neon">-{pointsToNext}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[9px] text-center text-yellow-500 font-mono italic uppercase">
                                                            PATENTE MÁXIMA ALCANÇADA
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 ${isExpanded ? 'px-5' : 'justify-center px-0'}`}
                                onClick={() => supabase.auth.signOut()}
                                title={!isExpanded ? 'SAIR' : ''}
                            >
                                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                    <LogOut size={20} />
                                </div>
                                <span className={`flex-1 text-left transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0'}`}>
                                    {t.abort}
                                </span>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            className={`w-full animate-pulse-slow flex items-center transition-all duration-300 ${isExpanded ? 'justify-start px-5' : 'justify-center px-0'}`}
                            onClick={onLoginClick}
                            title={!isExpanded ? 'ENTRAR' : ''}
                        >
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <LogIn size={20} />
                            </div>
                            <span className={`flex-1 text-left transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0'}`}>
                                {t.access}
                            </span>
                        </Button>
                    )}

                    <div className="mt-4 pt-4 border-t border-space-steel/30">
                        <p className={`text-[10px] text-space-muted font-mono mb-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100 px-5 pl-8' : 'opacity-0'}`}>
                            {isExpanded ? t.lang : 'LANG'}
                        </p>
                        <div className={`flex gap-2 transition-all duration-300 ${isExpanded ? 'px-5' : 'flex-col items-center gap-4'}`}>
                            {(['pt', 'en', 'fr'] as Language[]).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`w-8 h-8 rounded border flex items-center justify-center text-[10px] font-bold transition-all ${language === lang ? 'bg-space-neon border-space-neon text-black shadow-[0_0_10px_rgba(0,194,255,0.5)]' : 'bg-space-darker border-space-steel text-space-muted hover:border-space-neon/50'}`}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-space-steel/30">
                        <Button
                            variant="ghost"
                            className={`w-full flex items-center text-xs hover:text-white transition-all duration-300 ${isExpanded ? 'justify-start px-5' : 'justify-center px-0'}`}
                            onClick={onFeedbackClick}
                            title={!isExpanded ? 'FEEDBACK' : ''}
                        >
                            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={18} className="text-yellow-500" />
                            </div>
                            <span className={`flex-1 text-left transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0'}`}>
                                FEEDBACK
                            </span>
                        </Button>
                    </div>
                </div>
            </nav>


        </aside>
    );
};
