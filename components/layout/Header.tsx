import React from 'react';
import { Search, Menu, Terminal as TerminalIcon } from 'lucide-react';
import NotificationsMenu from '../NotificationsMenu';
import { User } from '../../types';

interface HeaderProps {
    onToggleSidebar: () => void;
    onToggleTerminal: () => void;
    currentUser: User | null;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleTerminal, currentUser }) => {
    return (
        <header className="h-16 border-b border-space-steel bg-space-dark/80 backdrop-blur-md flex justify-between items-center px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4 md:hidden">
                <button onClick={onToggleSidebar} className="text-space-neon">
                    <Menu size={24} />
                </button>
            </div>

            <div className="flex-1" /> {/* Spacer */}

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
