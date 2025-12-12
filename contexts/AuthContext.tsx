import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (userId: string | undefined, sessionEmail?: string) => {
        if (!userId) {
            setCurrentUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                // Map DB Profile to Frontend
                setCurrentUser({
                    id: data.id,
                    username: data.username,
                    role: data.role,
                    avatarUrl: data.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + data.username,
                    reputation: data.reputation,
                    bio: data.bio,
                    joinedAt: data.joined_at
                });
            } else {
                // Self-Healing
                console.warn("Profile missing for user. Attempting self-healing...");
                const defaultUsername = sessionEmail?.split('@')[0] || `user_${userId.slice(0, 8)}`;

                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        username: defaultUsername,
                        role: 'USER',
                        avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=' + defaultUsername,
                        reputation: 0,
                        joined_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (newProfile) {
                    setCurrentUser({
                        id: newProfile.id,
                        username: newProfile.username,
                        role: newProfile.role,
                        avatarUrl: newProfile.avatar_url,
                        reputation: newProfile.reputation,
                        bio: newProfile.bio,
                        joinedAt: newProfile.joined_at
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Initial Session Check
        supabase.auth.getSession().then(({ data: { session } }) => {
            fetchProfile(session?.user?.id, session?.user?.email);
        });

        // Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            fetchProfile(session?.user?.id, session?.user?.email);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    const refreshProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchProfile(session.user.id, session.user.email);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, isLoading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
