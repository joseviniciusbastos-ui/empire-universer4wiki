import React from 'react';
import { X, Shield, Droplets, Thermometer, Magnet, Wind, Gauge, Cpu, Info } from 'lucide-react';
import { Card, Button, Badge } from '../ui/Shared';
import { Race } from '../../lib/racialData';
import DOMPurify from 'isomorphic-dompurify';

interface RaceDetailsModalProps {
    race: Race | null;
    isOpen: boolean;
    onClose: () => void;
}

const RaceDetailsModal: React.FC<RaceDetailsModalProps> = ({ race, isOpen, onClose }) => {
    if (!isOpen || !race) return null;

    const stats = [
        { id: 'agua', label: 'Água', icon: <Droplets size={16} />, value: race.stats.agua },
        { id: 'gravidade', label: 'Gravidade', icon: <Gauge size={16} />, value: race.stats.gravidade },
        { id: 'temperatura', label: 'Temperatura', icon: <Thermometer size={16} />, value: race.stats.temperatura },
        { id: 'magnetismo', label: 'Magnetismo', icon: <Magnet size={16} />, value: race.stats.magnetismo },
        { id: 'vento_solar', label: 'Vento Solar', icon: <Wind size={16} />, value: race.stats.vento_solar },
        { id: 'atmosfera', label: 'Atmosfera', icon: <Shield size={16} />, value: race.stats.atmosfera },
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl bg-space-black border-space-neon/50 shadow-[0_0_50px_rgba(0,194,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-space-steel pb-4 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-space-neon/30 flex items-center justify-center bg-space-neon/10">
                            <span className="text-xl font-display font-black text-space-neon">{race.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter italic">
                                {race.name}
                            </h2>
                            <span className="text-[10px] font-mono text-space-neon uppercase tracking-widest">{race.id} SPECIMEN</span>
                        </div>
                    </div>
                    <button
                        id="close-race-modal-top"
                        onClick={onClose}
                        className="text-space-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-8 pb-6">
                    {/* Summary */}
                    <section className="relative p-5 bg-white/[0.03] border border-space-steel/30 rounded-lg">
                        <div className="absolute -top-3 left-4 bg-space-black px-2 flex items-center gap-2">
                            <Info size={12} className="text-space-neon" />
                            <span className="text-[10px] font-mono text-space-muted uppercase tracking-widest">Resumo Biológico</span>
                        </div>
                        <div
                            className="text-sm text-space-text/90 leading-relaxed font-mono"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(race.summary) }}
                        />
                    </section>

                    {/* Stats Table */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-bold text-space-neon uppercase tracking-widest flex items-center gap-2 ml-1">
                            <Gauge size={14} /> ADAPTABILIDADE E BÔNUS
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {stats.map(stat => (
                                <div key={stat.id} className="p-3 bg-space-dark border border-space-steel/30 rounded-lg flex items-center justify-between group hover:border-space-neon/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-space-muted group-hover:text-space-neon transition-colors">
                                            {stat.icon}
                                        </div>
                                        <span className="text-xs font-mono text-space-muted uppercase">{stat.label}</span>
                                    </div>
                                    <div className="flex items-end flex-col">
                                        <span className="text-xs font-bold text-white font-mono">{stat.value.range}</span>
                                        <span className="text-[10px] font-black text-space-neon font-mono">{stat.value.bonus}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Racial Module */}
                    <section className="relative p-5 bg-space-neon/5 border border-space-neon/20 rounded-lg">
                        <div className="absolute -top-3 left-4 bg-space-black px-2 flex items-center gap-2">
                            <Cpu size={12} className="text-space-neon" />
                            <span className="text-[10px] font-mono text-space-neon uppercase tracking-widest font-bold">Módulo Racial</span>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-base font-display font-bold text-white uppercase italic">
                                {race.moduleName}
                            </h4>
                            <div
                                className="text-xs text-space-text/70 font-mono italic"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`"${race.moduleDesc}"`) }}
                            />
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10">
                            <Cpu size={64} className="text-space-neon" />
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-space-steel bg-space-dark/50 flex justify-end">
                    <Button
                        id="btn-close-race-protocol-bottom"
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                    >
                        Fechar Protocolo
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default RaceDetailsModal;
