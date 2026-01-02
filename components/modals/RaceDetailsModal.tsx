import React, { useState } from 'react';
import { X, Shield, Droplets, Thermometer, Magnet, Wind, Gauge, Cpu, Info, Maximize2 } from 'lucide-react';
import { Card, Button, Badge } from '../ui/Shared';
import { Race } from '../../lib/racialData';
import DOMPurify from 'isomorphic-dompurify';

interface RaceDetailsModalProps {
    race: Race | null;
    isOpen: boolean;
    onClose: () => void;
}

const RaceDetailsModal: React.FC<RaceDetailsModalProps> = ({ race, isOpen, onClose }) => {
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Update activeImage when race changes
    React.useEffect(() => {
        if (race && race.images && race.images.length > 0) {
            setActiveImage(race.images[0]);
        } else if (race?.demonstrationImage) {
            setActiveImage(race.demonstrationImage);
        } else {
            setActiveImage(null);
        }
    }, [race]);

    if (!isOpen || !race) return null;

    const stats = [
        { id: 'agua', label: 'Água', icon: <Droplets size={16} />, value: race.stats.agua },
        { id: 'gravidade', label: 'Gravidade', icon: <Gauge size={16} />, value: race.stats.gravidade },
        { id: 'temperatura', label: 'Temperatura', icon: <Thermometer size={16} />, value: race.stats.temperatura },
        { id: 'magnetismo', label: 'Magnetismo', icon: <Magnet size={16} />, value: race.stats.magnetismo },
        { id: 'vento_solar', label: 'Vento Solar', icon: <Wind size={16} />, value: race.stats.vento_solar },
        { id: 'atmosfera', label: 'Atmosfera', icon: <Shield size={16} />, value: race.stats.atmosfera },
    ];

    const currentDisplayImage = activeImage || race.demonstrationImage;

    return (
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <Card className="w-full max-w-2xl bg-space-black border-space-neon/50 shadow-[0_0_50px_rgba(0,194,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-space-steel pb-4 px-4 pt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl border border-space-neon/30 flex items-center justify-center bg-space-neon/10 overflow-hidden relative shadow-[0_0_15px_rgba(0,194,255,0.1)]">
                                {race.images && race.images.length > 0 ? (
                                    <img
                                        src={race.images[0]}
                                        alt={race.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-display font-black text-space-neon">{race.name.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tighter italic">
                                    {race.name}
                                </h2>
                                <span className="text-[10px] font-mono text-space-neon uppercase tracking-widest">{race.id} SPECIMEN</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-space-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 space-y-8 pb-6">
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

                        {/* Avatar Showcase */}
                        {currentDisplayImage && (
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold text-space-neon uppercase tracking-widest flex items-center gap-2 ml-1">
                                    <Maximize2 size={14} /> DEMONSTRAÇÃO DE AVATARES
                                </h3>

                                <div className="space-y-4">
                                    {/* Main Image */}
                                    <div
                                        className="group relative cursor-zoom-in rounded-xl border border-space-steel/30 overflow-hidden bg-space-dark/50 transition-all hover:border-space-neon/50"
                                        onClick={() => setIsExpanded(true)}
                                    >
                                        <img
                                            src={currentDisplayImage}
                                            alt="Avatar Showcase"
                                            className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-space-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <span className="text-[10px] font-mono text-white/70 uppercase tracking-widest flex items-center gap-2">
                                                <Maximize2 size={12} /> Clique para expandir visualização
                                            </span>
                                        </div>
                                    </div>

                                    {/* Thumbnails */}
                                    {race.images && race.images.length > 1 && (
                                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                            {race.images.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImage(img)}
                                                    className={`aspect-square rounded-lg border overflow-hidden transition-all ${activeImage === img ? 'border-space-neon ring-2 ring-space-neon/30' : 'border-space-steel/30 hover:border-space-neon/50'
                                                        }`}
                                                >
                                                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

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
                        <section className="relative p-5 bg-space-neon/5 border border-space-neon/20 rounded-lg overflow-hidden group/module">
                            <div className="absolute -top-3 left-4 bg-space-black px-2 flex items-center gap-2">
                                <Cpu size={12} className="text-space-neon" />
                                <span className="text-[10px] font-mono text-space-neon uppercase tracking-widest font-bold">Módulo Racial</span>
                            </div>

                            <div className="flex items-start gap-4">
                                {race.moduleImage && (
                                    <div className="w-20 h-20 rounded-lg bg-space-black border border-space-neon/30 p-1 flex-shrink-0 relative z-10 overflow-hidden shadow-[0_0_15px_rgba(0,194,255,0.1)] group-hover/module:border-space-neon/60 transition-colors">
                                        <img src={race.moduleImage} alt={race.moduleName} className="w-full h-full object-cover group-hover/module:scale-110 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="space-y-2 relative z-10">
                                    <h4 className="text-base font-display font-bold text-white uppercase italic">
                                        {race.moduleName}
                                    </h4>
                                    <div
                                        className="text-xs text-space-text/70 font-mono italic"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`"${race.moduleDesc}"`) }}
                                    />
                                </div>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10 blur-sm group-hover/module:blur-none transition-all duration-700">
                                <Cpu size={64} className="text-space-neon" />
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-space-steel bg-space-dark/50 flex justify-end">
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                        >
                            Fechar Protocolo
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Expanded Image Overlay */}
            {isExpanded && race.demonstrationImage && (
                <div
                    className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out animate-in zoom-in duration-300"
                    onClick={() => setIsExpanded(false)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        onClick={() => setIsExpanded(false)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={race.demonstrationImage}
                        alt="Avatar Showcase Full"
                        className="max-w-full max-h-full rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
                    />
                </div>
            )}
        </>
    );
};

export default RaceDetailsModal;
