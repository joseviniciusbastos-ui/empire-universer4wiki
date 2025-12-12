import React from 'react';
import { Wrench } from 'lucide-react';
import { Button, Badge } from '../ui/Shared';
import { User } from '../../types';

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
                                    <span className="text-[10px] font-bold text-space-neon">LVL {currentUser.reputation > 100 ? '99' : '1'}</span>
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
                                <div className="flex justify-center md:justify-start">
                                    <Badge color="bg-space-neon text-black font-bold tracking-widest">{currentUser.role}</Badge>
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
                </div>

            </div>
        </div>
    );
};
