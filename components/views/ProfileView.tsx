import React from 'react';
import { Wrench } from 'lucide-react';
import { Button, Badge } from '../ui/Shared';
import { ReputationBadge } from '../ui/ReputationBadge';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';
import { RANK_THRESHOLDS } from '../../constants';

interface ProfileViewProps {
    currentUser: User | null;
    onEditProfile: () => void;
    onLoginClick: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onEditProfile, onLoginClick }) => {
    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <h2 className="text-2xl font-bold text-space-neon">ACESSO RESTRITO</h2>
                <p className="text-space-muted">Faça login para visualizar seu perfil.</p>
                <Button onClick={onLoginClick}>LOGIN</Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex gap-6 items-start relative">

                {/* Profile Card */}
                <div className="w-full bg-space-dark/50 border border-space-neon/30 rounded-xl overflow-hidden p-6 relative">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                        {/* Avatar Column */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-full border-4 border-space-neon p-1 bg-black/50 overflow-hidden shadow-[0_0_30px_rgba(0,194,255,0.3)]">
                                    <img src={currentUser.avatarUrl} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                                <div className="absolute bottom-2 right-2 bg-space-black border border-space-neon rounded-full px-2 py-0.5 shadow-lg">
                                    <ReputationBadge reputation={currentUser.reputation} size="sm" showTitle={false} />
                                </div>
                            </div>

                            <Button size="sm" variant="secondary" className="w-full" onClick={onEditProfile}>
                                <Wrench size={14} className="mr-2" /> EDITAR PERFIL
                            </Button>
                        </div>

                        {/* Info Column */}
                        <div className="flex-1 text-center md:text-left space-y-4 pt-2">
                            <div>
                                <h2 className="text-5xl font-display font-bold text-white tracking-wide mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{currentUser.username}</h2>
                                <div className="flex justify-center md:justify-start gap-2 items-center">
                                    <Badge color="bg-space-neon text-black font-bold tracking-widest">{currentUser.role}</Badge>
                                    <ReputationBadge reputation={currentUser.reputation} size="md" />
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-space-steel hidden md:block"></div>
                                <p className="font-mono text-space-muted text-sm md:pl-4 italic leading-relaxed max-w-2xl">
                                    "{currentUser.bio || 'Sem dados biográficos registrados no arquivo. O silêncio é o som do espaço.'}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 bg-space-black/40 rounded-lg p-6 border border-space-steel/20 backdrop-blur-sm">
                        <div className="text-center group cursor-default">
                            <p className="text-[10px] text-space-muted uppercase tracking-widest group-hover:text-space-neon transition-colors">Entrou em</p>
                            <p className="font-mono text-white text-sm">{new Date(currentUser.joinedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="text-center group cursor-default">
                            <p className="text-[10px] text-space-muted uppercase tracking-widest group-hover:text-space-neon transition-colors">Reputação</p>
                            <p className="font-mono text-space-neon text-xl font-bold">{currentUser.reputation}</p>
                        </div>
                        <div className="text-center group cursor-default">
                            <p className="text-[10px] text-space-muted uppercase tracking-widest group-hover:text-space-neon transition-colors">Missões</p>
                            <p className="font-mono text-white text-xl">0</p>
                        </div>
                        <div className="text-center group cursor-default">
                            <p className="text-[10px] text-space-muted uppercase tracking-widest group-hover:text-space-neon transition-colors">ID do Agente</p>
                            <p className="font-mono text-space-muted text-xs">{currentUser.id.split('-')[0]}</p>
                        </div>
                    </div>

                    {/* Detailed Reputation Progress Bar */}
                    <div className="mt-8 bg-space-darker/50 rounded-lg p-6 border border-space-steel/30 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-space-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {(() => {
                            const reputation = currentUser.reputation || 0;
                            const currentRank = [...RANK_THRESHOLDS].reverse().find(r => reputation >= r.min) || RANK_THRESHOLDS[0];
                            const nextRankIndex = RANK_THRESHOLDS.findIndex(r => r === currentRank) + 1;
                            const nextRank = nextRankIndex < RANK_THRESHOLDS.length ? RANK_THRESHOLDS[nextRankIndex] : null;

                            let progress = 100;
                            let pointsToNext = 0;

                            if (nextRank) {
                                const range = nextRank.min - currentRank.min;
                                const earned = reputation - currentRank.min;
                                progress = Math.min(Math.max((earned / range) * 100, 2), 100);
                                pointsToNext = nextRank.min - reputation;
                            }

                            return (
                                <div className="relative z-10">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[10px] text-space-muted font-mono uppercase tracking-[0.2em] mb-1">Status de Progressão</p>
                                            <h4 className={`text-2xl font-display font-bold uppercase tracking-tight ${currentRank.color}`}>
                                                {currentRank.title}
                                            </h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-space-muted font-mono uppercase mb-1">Pontuação Total</p>
                                            <p className="text-2xl font-mono font-bold text-white">{reputation} <span className="text-xs text-space-muted font-normal">PTS</span></p>
                                        </div>
                                    </div>

                                    <div className="relative h-4 bg-space-black rounded-full border border-space-steel/30 p-1 mb-4 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_15px_rgba(0,194,255,0.4)] ${currentRank.color.replace('text-', 'bg-')}`}
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-space-black/40 p-3 rounded border border-space-steel/20">
                                        {nextRank ? (
                                            <>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-space-muted font-mono uppercase">Próximo Nível</span>
                                                    <span className="text-xs font-bold text-white uppercase">{nextRank.title}</span>
                                                </div>
                                                <div className="text-right flex flex-col">
                                                    <span className="text-[9px] text-space-muted font-mono uppercase">Necessário para avançar</span>
                                                    <span className="text-xs font-bold text-space-neon font-mono">+{pointsToNext} PTS</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full text-center py-1">
                                                <span className="text-xs font-bold text-yellow-500 font-display tracking-widest animate-pulse">
                                                    COMMANDER-IN-CHIEF: NÍVEL MÁXIMO ATINGIDO
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

            </div>
        </div>
    );
};
