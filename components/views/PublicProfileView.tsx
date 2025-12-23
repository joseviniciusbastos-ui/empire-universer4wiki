import React, { useEffect, useState } from 'react';
import { Button, Badge } from '../ui/Shared';
import { ReputationBadge } from '../ui/ReputationBadge';
import { User, Post, PostType } from '../../types';
import { supabase } from '../../lib/supabase';
import { PostCard } from '../PostCard';
import { PinnedAchievements } from '../PinnedAchievements';

interface PublicProfileViewProps {
    userId: string;
    onClose: () => void;
    onPostClick: (post: Post) => void;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ userId, onClose, onPostClick }) => {
    const [profile, setProfile] = useState<any>(null); // Using any temporarily as User type might differ from DB
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                // Fetch User Profile
                // Note: user_profiles table is "users" in public schema? Check types.ts or Supabase usage.
                // Fetch User Profile
                const { data: userData, error: userError } = await supabase
                    .from('profiles') // Fixed table name
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (userError) throw userError;

                // Fetch User Posts
                const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('author_id', userId)
                    .order('created_at', { ascending: false });

                if (postsError) throw postsError;

                // Transform posts
                const mappedPosts: Post[] = (postsData || []).map((dbPost: any) => ({
                    id: dbPost.id.toString(),
                    type: dbPost.type,
                    title: dbPost.title,
                    content: dbPost.content,
                    category: dbPost.category,
                    authorId: dbPost.author_id,
                    authorName: dbPost.author_name,
                    authorReputation: userData.reputation, // Pass author reputation
                    slug: dbPost.slug,
                    tags: dbPost.tags || [],
                    likes: dbPost.likes,
                    views: dbPost.views,
                    createdAt: dbPost.created_at,
                    updatedAt: dbPost.updated_at
                }));

                // Transform user data to match UI needs
                setProfile({
                    id: userData.id,
                    username: userData.username,
                    avatarUrl: userData.avatar_url,
                    role: userData.role,
                    bio: userData.bio,
                    title: userData.title,
                    joinedAt: userData.created_at,
                    reputation: userData.reputation
                });
                setPosts(mappedPosts);

            } catch (error) {
                console.error("Error fetching public profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) fetchProfileData();
    }, [userId]);

    if (isLoading) {
        return <div className="text-center py-20 text-space-neon animate-pulse font-mono">ENCONTRANDO REGISTRO...</div>;
    }

    if (!profile) {
        return <div className="text-center py-20 text-space-alert font-mono">REGISTRO NÃO ENCONTRADO.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={onClose}>← VOLTAR</Button>
            </div>

            <div className="bg-space-dark/50 border border-space-neon/30 rounded-xl overflow-hidden p-6 relative">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-space-neon p-1 bg-black/50 overflow-hidden shadow-[0_0_30px_rgba(0,194,255,0.3)]">
                                <img src={profile.avatarUrl} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-3 pt-2">
                        <div>
                            <h2 className="text-4xl font-display font-bold text-white tracking-wide mb-2">{profile.username}</h2>
                            <div className="flex gap-2 items-center">
                                <Badge color="bg-space-neon text-black font-bold tracking-widest">{profile.role}</Badge>
                                <ReputationBadge reputation={profile.reputation} size="md" />
                            </div>
                        </div>
                        <p className="font-mono text-space-muted text-sm italic leading-relaxed max-w-2xl border-l-2 border-space-steel pl-4">
                            "{profile.bio || 'Sem dados biográficos.'}"
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-row md:flex-col gap-4 text-right">
                        <div>
                            <p className="text-[10px] text-space-muted uppercase tracking-widest">Reputação</p>
                            <p className="font-mono text-space-neon text-xl font-bold">{profile.reputation}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-space-muted uppercase tracking-widest">Entrou em</p>
                            <p className="font-mono text-white text-sm">{new Date(profile.joinedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>

            import {PinnedAchievements} from '../PinnedAchievements';

            // ... existing imports

            // ... inside component
            {/* Pinned Achievements */}
            <div className="pb-6 border-b border-space-steel/30">
                <PinnedAchievements userId={profile.id} />
            </div>

            {/* User Posts */}
            <div>
                <h3 className="text-xl font-display font-bold uppercase text-white mb-6 border-b border-space-steel pb-2">Arquivo de Transmissões ({posts.length})</h3>
                <div className="space-y-4">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onClick={() => onPostClick(post)}
                                currentUser={null} // Read-only view in profile usually? Or pass currentUser if needed
                            />
                        ))
                    ) : (
                        <div className="text-space-muted font-mono italic">Nenhuma transmissão encontrada.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
