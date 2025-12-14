import React from 'react';
import { Book, MessageSquare, Terminal as TerminalIcon, Wrench, LogOut, X, User as UserIcon, BookOpen, LogIn, Shield } from 'lucide-react';
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
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, view, setView, currentUser, onLoginClick }) => {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-space-dark border-r border-space-steel transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}
        >
            <div className="p-6 border-b border-space-steel flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-space-neon flex items-center justify-center animate-pulse-slow shadow-[0_0_15px_rgba(0,194,255,0.5)]">
                        <TerminalIcon className="text-black" size={20} />
                    </div>
                    <div>
                        <h1 className="font-display font-bold text-xl tracking-wider text-white leading-none">EU4</h1>
                        <span className="text-[10px] text-space-neon tracking-[0.2em]">SPACE WIKI</span>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="md:hidden text-space-muted">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="mb-6">
                    <p className="text-xs text-space-muted font-mono mb-2 px-2">NAVEGAÇÃO</p>
                    <Button variant={view === 'home' ? 'primary' : 'ghost'} className="w-full justify-start mb-1 flex items-center" onClick={() => setView('home')}>
                        <BookOpen size={18} className="mr-3 flex-shrink-0" /> <span className="flex-1 text-left">CONTROLE DA MISSÃO</span>
                    </Button>
                    <Button variant={view === 'wiki' ? 'primary' : 'ghost'} className="w-full justify-start mb-1 flex items-center" onClick={() => setView('wiki')}>
                        <Book size={18} className="mr-3 flex-shrink-0" /> <span className="flex-1 text-left">ENCYCLOPEDIA GALACTICA</span>
                    </Button>
                    <Button variant={view === 'articles' ? 'primary' : 'ghost'} className="w-full justify-start mb-1 flex items-center" onClick={() => setView('articles')}>
                        <TerminalIcon size={18} className="mr-3 flex-shrink-0" /> <span className="flex-1 text-left">DATA LOGS</span>
                    </Button>
                    <Button variant={view === 'forum' ? 'primary' : 'ghost'} className="w-full justify-start mb-1 flex items-center" onClick={() => setView('forum')}>
                        <MessageSquare size={18} className="mr-3 flex-shrink-0" /> <span className="flex-1 text-left">REDE DE COMMS</span>
                    </Button>
                    <Button variant={view === 'tools' ? 'primary' : 'ghost'} className="w-full justify-start mb-1 flex items-center" onClick={() => setView('tools')}>
                        <Wrench size={18} className="mr-3 flex-shrink-0" /> <span className="flex-1 text-left">ENGENHARIA</span>
                    </Button>
                </div>

                <div>
                    <p className="text-xs text-space-muted font-mono mb-2 px-2">PESSOAL</p>
                    {currentUser ? (
                        <>
                            <Button variant={view === 'profile' ? 'primary' : 'ghost'} className="w-full justify-start mb-1 flex items-center" onClick={() => setView('profile')}>
                                <UserIcon size={18} className="mr-3 flex-shrink-0" /> <span className="flex-1 text-left">PERFIL: {currentUser.username.toUpperCase()}</span>
                            </Button>

                            {currentUser.role === 'ADMIN' && (
                                <Button variant={view === 'admin' ? 'primary' : 'ghost'} className="w-full justify-start mb-1 text-space-neon flex items-center" onClick={() => setView('admin')}>
                                    <Shield size={18} className="mr-3 flex-shrink-0" /> <span className="flex-1 text-left">COMANDO</span>
                                </Button>
                            )}
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
                            <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => supabase.auth.signOut()}>
                                <LogOut size={18} className="mr-3" /> ABORTAR SESSÃO
                            </Button>
                        </>
                    ) : (
                        <Button variant="primary" className="w-full justify-start animate-pulse-slow flex items-center" onClick={onLoginClick}>
                            <LogIn size={18} className="mr-3 flex-shrink-0" /> <span className="flex-1 text-left">ACESSAR SISTEMA</span>
                        </Button>
                    )}
                </div>
            </nav>

            <div className="p-4 border-t border-space-steel">
                <div className="bg-space-darker rounded p-3 border border-space-steel/50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs text-space-neon font-mono">SISTEMAS OPERANTES</span>
                    </div>
                    <p className="text-[10px] text-space-muted font-mono">v2.4.0-stable build 8921</p>
                </div>
            </div>
        </aside>
    );
};
