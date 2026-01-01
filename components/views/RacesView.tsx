import React, { useState } from 'react';
import { Globe, ArrowRight, Dna } from 'lucide-react';
import { Card, Badge, Button } from '../ui/Shared';
import { RACES, Race } from '../../lib/racialData';
import RaceDetailsModal from '../modals/RaceDetailsModal';
import { useLanguage } from '../../contexts/LanguageContext';
import DOMPurify from 'isomorphic-dompurify';

const RacesView: React.FC = () => {
    const { language } = useLanguage();
    const [selectedRace, setSelectedRace] = useState<Race | null>(null);

    const t = {
        pt: {
            title: 'PROTOCOLOS RACIAIS',
            subtitle: 'Catálogo de Formas de Vida Galáticas',
            info: 'Selecione uma espécie para acessar o protocolo detalhado de adaptabilidade e bônus tecnológicos.',
            specimen: 'espécime'
        },
        en: {
            title: 'RACIAL PROTOCOLS',
            subtitle: 'Galactic Lifeforms Catalog',
            info: 'Select a species to access detailed adaptability protocols and technological bonuses.',
            specimen: 'specimen'
        }
    }[language === 'pt' ? 'pt' : 'en'];

    return (
        <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-space-steel pb-8">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-space-neon/10 border border-space-neon/30 rounded-2xl shadow-[0_0_20px_rgba(0,194,255,0.1)]">
                        <Dna className="text-space-neon animate-pulse-fast" size={40} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-display font-black uppercase text-white tracking-widest leading-tight italic">
                            {t.title}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-mono text-space-muted uppercase tracking-[0.3em]">
                            <span className="text-space-neon">XENO-DATABASE:</span> v2.0.5 • {RACES.length} SPECIES DETECTED
                        </div>
                    </div>
                </div>
                <div className="max-w-md text-right hidden md:block">
                    <p className="text-xs font-mono text-space-muted leading-relaxed uppercase italic">
                        {t.info}
                    </p>
                </div>
            </div>

            {/* Grid of Races */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {RACES.map(race => (
                    <Card
                        key={race.id}
                        id={`race-card-${race.id}`}
                        onClick={() => setSelectedRace(race)}
                        className="group relative cursor-pointer overflow-hidden transition-all duration-500 hover:border-space-neon/50 hover:shadow-[0_0_30px_rgba(0,194,255,0.1)] flex flex-col h-full"
                    >
                        {/* Interactive glow effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-space-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-xl border border-space-steel/50 flex items-center justify-center bg-space-black shadow-inner group-hover:border-space-neon transition-colors duration-500">
                                    <span className="text-3xl font-display font-black text-white group-hover:text-space-neon transition-colors">
                                        {race.name.charAt(0)}
                                    </span>
                                </div>
                                <Badge color="bg-space-dark border border-space-steel/30 text-space-muted group-hover:text-space-neon transition-colors">
                                    {race.id.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="space-y-4 flex-1">
                                <h3 className="text-xl font-display font-bold text-white uppercase tracking-tighter italic group-hover:translate-x-1 transition-transform">
                                    {race.name}
                                </h3>
                                <div
                                    className="text-[11px] font-mono text-space-muted leading-relaxed opacity-70 line-clamp-4 italic"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(race.summary) }}
                                />
                            </div>

                            <div className="mt-8 pt-4 border-t border-space-steel/20 flex items-center justify-between group-hover:border-space-neon/20 transition-colors">
                                <span className="text-[10px] font-mono text-space-muted uppercase tracking-widest">
                                    DNA {t.specimen}
                                </span>
                                <div className="flex items-center gap-2 text-space-neon font-bold text-[10px] items-center">
                                    PROTOCOL <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Background pattern */}
                        <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                            <Globe size={120} />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal */}
            <RaceDetailsModal
                race={selectedRace}
                isOpen={!!selectedRace}
                onClose={() => setSelectedRace(null)}
            />
        </div>
    );
};

export default RacesView;
