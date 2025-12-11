import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { User } from '../../types';
import Terminal from '../Terminal';

interface MainLayoutProps {
    children: React.ReactNode;
    view: string;
    setView: (view: string) => void;
    currentUser: User | null;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onLoginClick: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    view,
    setView,
    currentUser,
    searchQuery,
    setSearchQuery,
    onLoginClick
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-space-black text-space-text font-sans selection:bg-space-neon selection:text-black flex flex-col md:flex-row">
            {/* Terminal Overlay */}
            <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />

            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                view={view}
                setView={setView}
                currentUser={currentUser}
                onLoginClick={onLoginClick}
            />

            <main className="flex-1 flex flex-col min-h-screen relative">
                <Header
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onToggleTerminal={() => setIsTerminalOpen(true)}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    currentUser={currentUser}
                />

                {/* View Content */}
                <div className="flex-1 p-6 pb-32">
                    {children}
                </div>
            </main>
        </div>
    );
};
