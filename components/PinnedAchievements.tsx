import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AchievementCard } from './AchievementCard';
import { Trophy, Star } from 'lucide-react';
import { Achievement } from '../types';

interface PinnedAchievementsProps {
    userId: string;
}

export const PinnedAchievements: React.FC<PinnedAchievementsProps> = ({ userId }) => {
    const [pinnedAchievements, setPinnedAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPinned = async () => {
            setIsLoading(true);
            // 1. Fetch pinned user_achievements
            const { data: pinnedData, error: pinnedError } = await supabase
                .from('user_achievements')
                .select('achievement_id, earned_at')
                .eq('user_id', userId)
                .eq('is_pinned', true);

            if (pinnedError || !pinnedData || pinnedData.length === 0) {
                setPinnedAchievements([]);
                setIsLoading(false);
                return;
            }

            // 2. Fetch details for those achievements
            const achievementIds = pinnedData.map(p => p.achievement_id);
            const { data: achievementsData, error: achievementsError } = await supabase
                .from('achievements')
                .select('*')
                .in('id', achievementIds);

            if (achievementsError) {
                console.error('Error fetching pinned achievement details:', achievementsError);
                setIsLoading(false);
                return;
            }

            // 3. Combine data
            const combined = achievementsData.map(a => ({
                ...a,
                earned_at: pinnedData.find(p => p.achievement_id === a.id)?.earned_at,
                is_pinned: true
            }));

            setPinnedAchievements(combined);
            setIsLoading(false);
        };

        if (userId) {
            fetchPinned();
        }
    }, [userId]);

    if (isLoading) return null;
    if (pinnedAchievements.length === 0) return null;

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
                <Star className="text-space-neon" size={20} />
                <h3 className="text-xl font-display font-bold uppercase text-white tracking-wide">
                    Destaques de Serviço
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedAchievements.map(achievement => (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                    // No onTogglePin here, read-only view in profile
                    />
                ))}
            </div>
        </div>
    );
};
