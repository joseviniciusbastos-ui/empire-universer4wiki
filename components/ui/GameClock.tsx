import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface GameClockProps {
    className?: string;
    showIcon?: boolean;
}

export const GameClock: React.FC<GameClockProps> = ({ className = '', showIcon = true }) => {
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const parisTime = now.toLocaleTimeString('pt-BR', {
                timeZone: 'Europe/Paris',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            setTime(parisTime);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex items-center gap-2 font-mono text-space-neon tracking-wider ${className}`}>
            {showIcon && <Clock size={14} className="animate-pulse" />}
            <div className="flex flex-col leading-none">
                <span className="text-[10px] text-space-muted uppercase tracking-[0.2em] mb-0.5">Game Time</span>
                <span className="text-sm font-bold shadow-neon">{time}</span>
            </div>
        </div>
    );
};
