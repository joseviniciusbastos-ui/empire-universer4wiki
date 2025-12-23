import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AchievementCard } from '../AchievementCard';
import { Trophy, Filter, Search, Award } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';

import { Achievement } from '../../types';

const STATIC_TEXT = {
    pt: {
        title: 'Sala das Conquistas',
        subtitle: 'Honrarias e Medalhas de Serviço',
        stats: 'Estatísticas de Carreira',
        unlocked: 'Desbloqueadas',
        total: 'Total de Medalhas',
        search: 'Pesquisar honraria...',
        noResults: 'Nenhuma medalha localizada nesta frequência.'
    },
    en: {
        title: 'Hall of Achievements',
        subtitle: 'Honors and Service Medals',
        stats: 'Career Statistics',
        unlocked: 'Unlocked',
        total: 'Total Medals',
        search: 'Search honor...',
        noResults: 'No medals located in this frequency.'
    },
    fr: {
        title: 'Salle des Succès',
        subtitle: 'Honneurs et Médailles de Service',
        stats: 'Statistiques de Carrière',
        unlocked: 'Débloqué',
        total: 'Total des Médailles',
        search: 'Rechercher honneur...',
        noResults: 'Aucune médaille localisée sur cette fréquence.'
    }
};

interface AchievementsViewProps {
    currentUser: User | null;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ currentUser }) => {
    const { language } = useLanguage();
    const t = STATIC_TEXT[language];
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAchievements();
    }, [currentUser]);

    const fetchAchievements = async () => {
        setIsLoading(true);

        // Fetch all achievements
        const { data: allAchievements, error: achievementsError } = await supabase
            .from('achievements')
            .select('*');

        if (achievementsError) {
            console.error('Error fetching achievements:', achievementsError);
            setIsLoading(false);
            return;
        }

        // Fetch user's achievements
        if (currentUser) {
            const { data: userEarned, error: userError } = await supabase
                .from('user_achievements')
                .select('*')
                .eq('user_id', currentUser.id);

            if (!userError && userEarned) {
                const combined = allAchievements.map(a => {
                    const earned = userEarned.find(u => u.achievement_id === a.id);
                    return {
                        return {
                            ...a,
                            earned_at: earned ? earned.earned_at : undefined,
                            is_pinned: earned ? earned.is_pinned : false
                        };
                    });
                setAchievements(combined);
            } else {
                setAchievements(allAchievements);
            }
        } else {
            setAchievements(allAchievements);
        }

        setIsLoading(false);
    };

    const filteredAchievements = achievements.filter(a => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'earned' && !!a.earned_at) ||
            (filter === 'locked' && !a.earned_at);

        const name = a.name[language] || a.name['en'] || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });


    const togglePin = async (achievementId: string) => {
        if (!currentUser) return;

        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement || !achievement.earned_at) return;

        const newPinnedState = !achievement.is_pinned;

        // Optimistic UI Update
        setAchievements(prev => prev.map(a =>
            a.id === achievementId ? { ...a, is_pinned: newPinnedState } : a
        ));

        // Call Supabase
        const { error } = await supabase
            .from('user_achievements')
            .update({ is_pinned: newPinnedState })
            .eq('user_id', currentUser.id)
            .eq('achievement_id', achievementId);

        if (error) {
            console.error('Error toggling pin:', error);
            // Revert changes if error
            setAchievements(prev => prev.map(a =>
                a.id === achievementId ? { ...a, is_pinned: !newPinnedState } : a
            ));
            alert(error.message); // Show trigger error (limit 5)
        }
    };

    const earnedCount = achievements.filter(a => !!a.earned_at).length;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-space-neon/10 border border-space-neon/20 rounded-xl">
                        <Trophy className="text-space-neon" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold uppercase text-white tracking-widest leading-none mb-1">
                            {t.title}
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-space-muted uppercase tracking-[0.2em]">
                            <span className="text-space-neon">RECORDS:</span> {t.subtitle}
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex gap-4">
                    <div className="px-5 py-2 bg-space-dark border border-space-steel/30 rounded-lg">
                        <p className="text-[10px] text-space-muted uppercase font-mono mb-1">{t.unlocked}</p>
                        <p className="text-xl font-display font-bold text-space-neon">{earnedCount}</p>
                    </div>
                    <div className="px-5 py-2 bg-space-dark border border-space-steel/30 rounded-lg">
                        <p className="text-[10px] text-space-muted uppercase font-mono mb-1">{t.total}</p>
                        <p className="text-xl font-display font-bold text-white">{achievements.length}</p>
                    </div>
                </div>
            </div>

            {/* Filter/Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-space-dark/20 border border-space-steel/20 rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-space-muted" size={16} />
                    <input
                        type="text"
                        placeholder={t.search}
                        className="w-full bg-space-black border border-space-steel/30 rounded-sm py-2 pl-10 pr-4 text-xs font-mono text-white focus:border-space-neon outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-[10px] font-mono border transition-all ${filter === 'all' ? 'bg-white border-white text-black' : 'border-space-steel text-space-muted hover:border-white'}`}
                    >
                        TODOS
                    </button>
                    <button
                        onClick={() => setFilter('earned')}
                        className={`px-4 py-2 text-[10px] font-mono border transition-all ${filter === 'earned' ? 'bg-space-neon border-space-neon text-black' : 'border-space-steel text-space-muted hover:border-space-neon'}`}
                    >
                        SÍNCRONIZADAS
                    </button>
                    <button
                        onClick={() => setFilter('locked')}
                        className={`px-4 py-2 text-[10px] font-mono border transition-all ${filter === 'locked' ? 'bg-red-900/20 border-red-500/50 text-red-500' : 'border-space-steel text-space-muted hover:border-red-500/50'}`}
                    >
                        BLOQUEADAS
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-32 bg-space-dark/20 animate-pulse rounded-xl border border-space-steel/20" />
                    ))}
                </div>
            ) : filteredAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                    {filteredAchievements.map(achievement => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            onTogglePin={togglePin}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center border mr-2 border-dashed border-space-steel/30 rounded-3xl">
                    <Award size={48} className="mx-auto text-space-muted mb-4 opacity-50" />
                    <p className="text-space-muted font-mono text-sm uppercase tracking-widest">{t.noResults}</p>
                </div>
            )}
        </div>
    );
};
