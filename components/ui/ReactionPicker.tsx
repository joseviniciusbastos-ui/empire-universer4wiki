import React from 'react';
import { ThumbsUp, Rocket, Brain, Star, AlertTriangle } from 'lucide-react';
import { ReactionType } from '../../types';

interface ReactionPickerProps {
    onSelect: (type: ReactionType) => void;
    currentReaction?: ReactionType;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, currentReaction }) => {
    const reactions: { type: ReactionType; icon: React.ReactNode; label: string; color: string }[] = [
        { type: 'LIKE', icon: <ThumbsUp size={18} />, label: 'Câmbio', color: 'text-blue-400' },
        { type: 'ROCKET', icon: <Rocket size={18} />, label: 'Impulso', color: 'text-orange-500' },
        { type: 'INTEL', icon: <Brain size={18} />, label: 'Intel', color: 'text-purple-400' },
        { type: 'STAR', icon: <Star size={18} />, label: 'Honra', color: 'text-yellow-400' },
        { type: 'WARNING', icon: <AlertTriangle size={18} />, label: 'Alerta', color: 'text-red-500' },
    ];

    return (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-black/90 backdrop-blur-xl border border-space-neon/30 rounded-full shadow-[0_0_20px_rgba(0,194,255,0.3)] flex gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
            {reactions.map((r) => (
                <button
                    key={r.type}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(r.type);
                    }}
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-125 hover:bg-white/10 relative group ${currentReaction === r.type ? 'bg-white/20 ring-1 ring-white/50' : ''}`}
                    title={r.label}
                >
                    <span className={`transition-colors ${r.color}`}>
                        {r.icon}
                    </span>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-space-steel">
                        {r.label}
                    </span>
                </button>
            ))}
        </div>
    );
};
