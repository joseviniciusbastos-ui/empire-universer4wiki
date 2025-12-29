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
    onLoginClick: () => void;
    onFeedbackClick: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    view,
    setView,
    currentUser,
    onLoginClick,
    onFeedbackClick
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSidebarPinned, setIsSidebarPinned] = React.useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-space-black text-space-text font-sans selection:bg-space-neon selection:text-black flex flex-col md:flex-row relative overflow-hidden">
            {/* Background Stars */}
            <div className="stars-container">
                <div id="stars"></div>
                <div id="stars2"></div>
                <div id="stars3"></div>
            </div>

            {/* Terminal Overlay */}
            <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />

            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isPinned={isSidebarPinned}
                setIsPinned={setIsSidebarPinned}
                view={view}
                setView={setView}
                currentUser={currentUser}
                onLoginClick={onLoginClick}
                onFeedbackClick={onFeedbackClick}
            />

            <main className="flex-1 flex flex-col min-h-screen relative min-w-0 overflow-hidden">
                <Header
                    onToggleSidebar={() => {
                        if (window.innerWidth >= 768) {
                            setIsSidebarPinned(!isSidebarPinned);
                        } else {
                            setIsSidebarOpen(!isSidebarOpen);
                        }
                    }}
                    onToggleTerminal={() => setIsTerminalOpen(true)}
                    currentUser={currentUser}
                    setView={setView}
                />

                {/* View Content */}
                <div className="flex-1 p-6 pb-32">
                    {children}
                </div>
            </main>
        </div>
    );
};
