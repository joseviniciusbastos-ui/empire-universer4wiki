import React from 'react';
import { Book, MessageSquare, Terminal as TerminalIcon, Wrench, LogOut, X, User as UserIcon, BookOpen, LogIn, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Shared';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    view: string;
    setView: (view: string) => void;
    currentUser: User | null;
    onLoginClick: () => void;
    onFeedbackClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, view, setView, currentUser, onLoginClick, onFeedbackClick }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    // On mobile, use isOpen. On desktop, use isHovered for width.
    const isExpanded = isOpen || isHovered;

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`fixed inset-y-0 left-0 z-50 bg-space-dark border-r border-space-steel transition-all duration-300 ease-in-out flex flex-col overflow-hidden
                ${isExpanded ? 'w-64' : 'w-20'} 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
        >
            <div className={`p-6 border-b border-space-steel flex items-center transition-all duration-300 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
                <div className="flex items-center gap-3 min-w-max">
                    <div className="w-10 h-10 rounded-full bg-space-neon flex items-center justify-center animate-pulse-slow shadow-[0_0_15px_rgba(0,194,255,0.5)] flex-shrink-0">
                        <TerminalIcon className="text-black" size={20} />
                    </div>
                    <div className={`transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}>
                        <h1 className="font-display font-bold text-xl tracking-wider text-white leading-none">EU4</h1>
                        <span className="text-[10px] text-space-neon tracking-[0.2em]">SPACE WIKI</span>
                    </div>
                </div>
                {isExpanded && (
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-space-muted flex-shrink-0">
                        <X size={20} />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="mb-6">
                    <p className={`text-xs text-space-muted font-mono mb-4 px-2 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        {isExpanded ? 'NAVEGAÇÃO' : 'NAV'}
                    </p>
                    <div className="space-y-1">
                        {[
                            { id: 'home', icon: <BookOpen size={20} />, label: 'CONTROLE DA MISSÃO' },
                            { id: 'wiki', icon: <Book size={20} />, label: 'ENCYCLOPEDIA GALACTICA' },
                            { id: 'articles', icon: <TerminalIcon size={20} />, label: 'DATA LOGS' },
                            { id: 'forum', icon: <MessageSquare size={20} />, label: 'REDE DE COMMS' },
                            { id: 'tools', icon: <Wrench size={20} />, label: 'ENGENHARIA' }
                        ].map((item) => (
                            <Button
                                key={item.id}
                                variant={view === item.id ? 'primary' : 'ghost'}
                                className={`w-full mb-1 flex items-center transition-all duration-300 ${isExpanded ? 'justify-start px-4' : 'justify-center px-0'}`}
                                onClick={() => setView(item.id)}
                                title={!isExpanded ? item.label : ''}
                            >
                                <div className={`flex-shrink-0 ${isExpanded ? 'mr-3' : 'mr-0'}`}>
                                    {item.icon}
                                </div>
                                <span className={`flex-1 text-left whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                    {item.label}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-space-steel/30">
                    <p className={`text-xs text-space-muted font-mono mb-4 px-2 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                        {isExpanded ? 'PESSOAL' : 'PERS'}
                    </p>
                    {currentUser ? (
                        <div className="space-y-1">
                            <Button
                                variant={view === 'profile' ? 'primary' : 'ghost'}
                                className={`w-full mb-1 flex items-center transition-all duration-300 ${isExpanded ? 'justify-start px-4' : 'justify-center px-0'}`}
                                onClick={() => setView('profile')}
                                title={!isExpanded ? `PERFIL: ${currentUser.username.toUpperCase()}` : ''}
                            >
                                <UserIcon size={20} className={`${isExpanded ? 'mr-3' : 'mr-0'} flex-shrink-0`} />
                                <span className={`flex-1 text-left whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                    {currentUser.username.toUpperCase()}
                                </span>
                            </Button>

                            {currentUser.role === 'ADMIN' && (
                                <Button
                                    variant={view === 'admin' ? 'primary' : 'ghost'}
                                    className={`w-full mb-1 text-space-neon flex items-center transition-all duration-300 ${isExpanded ? 'justify-start px-4' : 'justify-center px-0'}`}
                                    onClick={() => setView('admin')}
                                    title={!isExpanded ? 'COMANDO' : ''}
                                >
                                    <Shield size={20} className={`${isExpanded ? 'mr-3' : 'mr-0'} flex-shrink-0`} />
                                    <span className={`flex-1 text-left transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                        COMANDO
                                    </span>
                                </Button>
                            )}

                            <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 h-auto mt-2' : 'opacity-0 h-0 w-0'}`}>
                                <div className="px-2 py-2">
                                    <div className="bg-space-darker rounded border border-space-steel p-3">
                                        <div className="flex justify-between text-xs text-space-muted mb-1">
                                            <span>REPUTAÇÃO</span>
                                            <span className="text-space-neon font-bold uppercase">{currentUser.rank || 'Civil'}</span>
                                        </div>
                                        <div className="w-full bg-space-steel h-1 rounded-full overflow-hidden">
                                            <div className="bg-space-neon h-full w-[45%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300 ${isExpanded ? 'px-4' : 'justify-center px-0'}`}
                                onClick={() => supabase.auth.signOut()}
                                title={!isExpanded ? 'SAIR' : ''}
                            >
                                <LogOut size={20} className={`${isExpanded ? 'mr-3' : 'mr-0'} flex-shrink-0`} />
                                <span className={`flex-1 text-left transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                    ABORTAR SESSÃO
                                </span>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="primary"
                            className={`w-full animate-pulse-slow flex items-center transition-all duration-300 ${isExpanded ? 'justify-start px-4' : 'justify-center px-0'}`}
                            onClick={onLoginClick}
                            title={!isExpanded ? 'ENTRAR' : ''}
                        >
                            <LogIn size={20} className={`${isExpanded ? 'mr-3' : 'mr-0'} flex-shrink-0`} />
                            <span className={`flex-1 text-left transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                ACESSAR
                            </span>
                        </Button>
                    )}

                    <div className="mt-4 pt-4 border-t border-space-steel/30">
                        <Button
                            variant="ghost"
                            className={`w-full flex items-center text-xs hover:text-white transition-all duration-300 ${isExpanded ? 'justify-start px-4' : 'justify-center px-0'}`}
                            onClick={onFeedbackClick}
                            title={!isExpanded ? 'FEEDBACK' : ''}
                        >
                            <AlertTriangle size={18} className={`${isExpanded ? 'mr-3' : 'mr-0'} text-yellow-500 flex-shrink-0`} />
                            <span className={`flex-1 text-left transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                FEEDBACK
                            </span>
                        </Button>
                    </div>
                </div>
            </nav>

            <div className={`p-4 border-t border-space-steel transition-all duration-300 ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 p-0 hidden'}`}>
                <div className="bg-space-darker rounded p-3 border border-space-steel/50 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] text-space-neon font-mono uppercase">Online</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
