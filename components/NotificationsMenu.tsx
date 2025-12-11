import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Check } from 'lucide-react';

import { User } from '../types';

interface Notification {
    id: string;
    message: string;
    link?: string;
    read: boolean;
    created_at: string;
    type: string;
}

interface NotificationsMenuProps {
    currentUser: User | null;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({ currentUser }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();

            // Real-time subscription
            const subscription = supabase
                .channel('notifications')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${currentUser.id}`
                }, (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [currentUser]);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        }
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.read) markAsRead(n.id);
        setIsOpen(false);
        // Navigation logic here if needed (e.g. using a router or passed prop)
        // For now we just close the menu. If link exists, we could window.location or similar.
        if (n.link) {
            // Basic client side routing hack or window location
            // If our app uses state based routing, we might need to pass a callback
            // But for now, let's assume simple interaction
        }
    };

    return (
        <div className="relative">
            <button
                className="p-2 text-space-muted hover:text-white transition-colors relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} className={unreadCount > 0 ? "text-space-neon animate-pulse" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-space-alert rounded-full border border-space-black"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-space-black border border-space-steel rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-space-steel bg-space-dark/50 flex justify-between items-center">
                        <h4 className="text-xs font-mono text-space-neon uppercase tracking-widest">Notificações</h4>
                        {unreadCount > 0 && (
                            <span className="text-[10px] bg-space-alert text-white px-1.5 rounded">{unreadCount} NOVAS</span>
                        )}
                    </div>

                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-space-steel">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-space-muted font-mono text-xs">
                                Nenhuma notificação recebida.
                            </div>
                        ) : (
                            <ul>
                                {notifications.map(n => (
                                    <li
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-3 border-b border-space-steel/20 hover:bg-space-dark/30 cursor-pointer transition-colors ${!n.read ? 'bg-space-neon/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-space-neon' : 'bg-transparent'}`} />
                                            <div>
                                                <p className={`text-sm ${!n.read ? 'text-white font-bold' : 'text-space-muted'}`}>
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-space-muted font-mono mt-1">
                                                    {new Date(n.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
};

export default NotificationsMenu;
