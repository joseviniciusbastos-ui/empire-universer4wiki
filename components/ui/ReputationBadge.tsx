import React from 'react';
import { Shield, Award, Star, Zap, Crown } from 'lucide-react';
import { RANK_THRESHOLDS } from '../../constants';
import { Badge } from './Shared';

interface ReputationBadgeProps {
    reputation: number;
    showTitle?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({ reputation, showTitle = true, size = 'md' }) => {
    // Determine Rank
    const rank = [...RANK_THRESHOLDS].reverse().find(r => reputation >= r.min) || RANK_THRESHOLDS[0];

    // Icon Map
    const getIcon = () => {
        const props = { size: size === 'sm' ? 12 : size === 'md' ? 16 : 24, className: rank.color };

        if (rank.title.includes('Almirante')) return <Crown {...props} />;
        if (rank.title.includes('Capitão') || rank.title.includes('Comodoro')) return <Zap {...props} />;
        if (rank.title.includes('Comandante')) return <Star {...props} />;
        if (rank.title.includes('Oficial') || rank.title.includes('Alferes') || rank.title.includes('Tenente')) return <Award {...props} />;
        return <Shield {...props} />;
    };

    return (
        <div className={`flex items-center gap-2 ${size === 'lg' ? 'p-2 bg-space-dark/50 border border-space-steel/30 rounded-lg' : ''}`} title={`Reputação: ${reputation}`}>
            {getIcon()}
            {showTitle && (
                <div className="flex flex-col">
                    <span className={`font-display font-bold uppercase ${rank.color} ${size === 'lg' ? 'text-lg' : 'text-xs'}`}>
                        {rank.title}
                    </span>
                    {size === 'lg' && (
                        <span className="text-[10px] text-space-muted font-mono">{reputation} PTS</span>
                    )}
                </div>
            )}
        </div>
    );
};
