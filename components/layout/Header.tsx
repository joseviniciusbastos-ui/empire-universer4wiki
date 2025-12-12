import React from 'react';
import { Search, Menu, Terminal as TerminalIcon } from 'lucide-react';
import NotificationsMenu from '../NotificationsMenu';
import { User } from '../../types';

interface HeaderProps {
    onToggleSidebar: () => void;
    onToggleTerminal: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleTerminal, searchQuery, setSearchQuery, currentUser }) => {
    return (
        <header className="h-16 border-b border-space-steel bg-space-dark/80 backdrop-blur-md flex justify-between items-center px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4 md:hidden">
                <button onClick={onToggleSidebar} className="text-space-neon">
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex-1 max-w-xl mx-4 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-space-muted group-focus-within:text-space-neon transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar na base de dados..."
                        className="w-full bg-space-black border border-space-steel rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-space-neon focus:shadow-[0_0_10px_rgba(0,194,255,0.2)] transition-all placeholder:text-space-muted/50 font-mono"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    className="p-2 text-space-neon hover:bg-space-neon/10 rounded transition-colors"
                    onClick={onToggleTerminal}
                    title="Abrir Terminal"
                >
                    <TerminalIcon size={20} />
                </button>

                <NotificationsMenu currentUser={currentUser} />

                {currentUser && (
                    <div className="w-8 h-8 rounded border border-space-neon overflow-hidden">
                        <img src={currentUser.avatarUrl} alt="User" />
                    </div>
                )}
            </div>
        </header>
    );
};
