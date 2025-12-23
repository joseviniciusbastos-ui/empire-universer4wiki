import React from 'react';
import { Card } from './ui/Shared';
import { Trophy, Lock, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Achievement {
    id: string;
    name: Record<string, string>;
    description: Record<string, string>;
    icon: string;
    category: string;
    requirement_type: string;
    requirement_value: number;
    earned_at?: string;
}

interface AchievementCardProps {
    achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
    const { language } = useLanguage();
    const isEarned = !!achievement.earned_at;

    const name = achievement.name[language] || achievement.name['en'] || 'Unknown';
    const description = achievement.description[language] || achievement.description['en'] || '';

    return (
        <Card
            className={`relative overflow-hidden transition-all duration-500 group
                ${isEarned
                    ? 'border-space-neon/50 bg-space-neon/5 shadow-[0_0_20px_rgba(0,194,255,0.1)]'
                    : 'border-space-steel/30 bg-space-dark/40 opacity-70 grayscale hover:grayscale-0 hover:opacity-100'
                }
            `}
        >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full blur-3xl transition-opacity
                ${isEarned ? 'bg-space-neon/20 opacity-100' : 'bg-space-muted/10 opacity-0 group-hover:opacity-100'}
            `} />

            <div className="relative z-10 flex gap-4 p-2">
                {/* Icon Section */}
                <div className={`w-16 h-16 rounded-xl border flex items-center justify-center transition-all duration-500
                    ${isEarned
                        ? 'bg-space-neon/10 border-space-neon shadow-[0_0_15px_rgba(0,194,255,0.3)] scale-110'
                        : 'bg-space-dark border-space-steel group-hover:border-space-neon/50'
                    }
                `}>
                    {isEarned ? (
                        <Trophy className="text-space-neon animate-bounce-slow" size={32} />
                    ) : (
                        <Lock className="text-space-muted group-hover:text-space-neon/50 transition-colors" size={28} />
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-mono text-space-muted uppercase tracking-widest">
                            {achievement.category}
                        </span>
                        {isEarned && (
                            <span className="flex items-center gap-1 text-[9px] font-mono text-space-neon animate-pulse">
                                <CheckCircle size={10} /> CONDOMÍNIO SINC.
                            </span>
                        )}
                    </div>

                    <h4 className={`text-sm font-display font-bold uppercase tracking-wider mb-1 transition-colors
                        ${isEarned ? 'text-white' : 'text-space-muted group-hover:text-white'}
                    `}>
                        {name}
                    </h4>

                    <p className="text-xs text-space-muted font-mono line-clamp-2 leading-relaxed italic opacity-80">
                        "{description}"
                    </p>

                    {/* Requirement Progress (Static for now) */}
                    <div className="mt-4 pt-3 border-t border-space-steel/10 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[9px] font-mono text-space-muted uppercase tracking-tighter">
                            <Info size={10} />
                            REQUISITO: {achievement.requirement_value} {achievement.requirement_type.replace('_', ' ')}
                        </div>
                        {isEarned && (
                            <span className="text-[9px] font-mono text-space-muted">
                                {new Date(achievement.earned_at!).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
