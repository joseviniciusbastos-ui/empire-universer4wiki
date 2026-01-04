import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, Dna } from 'lucide-react';
import { Card, Badge, Button } from '../ui/Shared';
import { RACES, Race } from '../../lib/racialData';
import RaceDetailsModal from '../modals/RaceDetailsModal';
import { useLanguage } from '../../contexts/LanguageContext';
import DOMPurify from 'isomorphic-dompurify';

const RacesView: React.FC = () => {
    const { language } = useLanguage();
    const [selectedRace, setSelectedRace] = useState<Race | null>(null);
    const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
    const [featuredRace, setFeaturedRace] = useState<Race | null>(null);

    // Initial setup: Random featured race
    useEffect(() => {
        const randomRace = RACES[Math.floor(Math.random() * RACES.length)];
        setFeaturedRace(randomRace);
    }, []);

    // Automated Slideshow Logic (Every 10s)
    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndices(prev => {
                const next = { ...prev };
                RACES.forEach(race => {
                    if (race.images && race.images.length > 1) {
                        // Pick a random index different from current one
                        let newIdx = Math.floor(Math.random() * race.images.length);
                        if (newIdx === prev[race.id]) {
                            newIdx = (newIdx + 1) % race.images.length;
                        }
                        next[race.id] = newIdx;
                    } else if (race.images?.length === 1) {
                        next[race.id] = 0;
                    }
                });
                return next;
            });
        }, 8000); // Slightly faster cycle for more dynamism

        return () => clearInterval(interval);
    }, []);

    const t = {
        pt: {
            title: 'PROTOCOLOS RACIAIS',
            subtitle: 'CATÁLOGO DE FORMAS DE VIDA GALÁTICAS',
            info: 'Selecione uma espécie para acessar o protocolo detalhado.',
            featured: 'ESPÉCIE EM DESTAQUE',
            access: 'ACESSAR DADOS',
            specimen: 'ESPÉCIME'
        },
        en: {
            title: 'RACIAL PROTOCOLS',
            subtitle: 'GALACTIC LIFEFORMS CATALOG',
            info: 'Select a species to access detailed protocols.',
            featured: 'FEATURED SPECIES',
            access: 'ACCESS DATA',
            specimen: 'SPECIMEN'
        }
    }[language === 'pt' ? 'pt' : 'en'];

    return (
        <div className="space-y-12 animate-fadeIn max-w-[1600px] mx-auto px-4 pb-20">
            {/* Hero Section */}
            {featuredRace && (
                <div className="relative w-full h-[500px] rounded-3xl overflow-hidden border border-space-steel/30 shadow-[0_0_50px_rgba(0,194,255,0.15)] group transition-all duration-700 hover:shadow-[0_0_80px_rgba(0,194,255,0.25)]">
                    {/* Background Blur */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl opacity-40 scale-110 transition-transform duration-[20s] ease-linear"
                        style={{ backgroundImage: `url(${featuredRace.demonstrationImage})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-space-black via-space-black/80 to-transparent" />

                    <div className="relative z-10 h-full flex flex-col md:flex-row items-center p-8 md:p-16 gap-12">
                        {/* Featured Content */}
                        <div className="flex-1 space-y-6 text-left">
                            <div className="flex items-center gap-3">
                                <Badge color="bg-space-neon/20 text-space-neon border-space-neon/50 animate-pulse">
                                    {t.featured}
                                </Badge>
                                <span className="text-space-muted font-mono text-xs tracking-[0.2em]">{featuredRace.id.toUpperCase()}</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-space-steel/50 uppercase tracking-tighter leading-none italic">
                                {featuredRace.name}
                            </h1>

                            <p className="max-w-xl text-space-muted text-lg font-light leading-relaxed line-clamp-3">
                                {featuredRace.summary}
                            </p>

                            <Button
                                onClick={() => setSelectedRace(featuredRace)}
                                className="mt-4 bg-space-neon hover:bg-space-neon/80 text-space-black font-bold uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(0,194,255,0.4)] hover:shadow-[0_0_40px_rgba(0,194,255,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 group/btn"
                            >
                                {t.access} <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        {/* Featured Image */}
                        <div className="w-full md:w-1/2 h-full relative perspective-1000 flex items-center justify-center">
                            <img
                                src={featuredRace.demonstrationImage}
                                alt={featuredRace.name}
                                className="max-h-[120%] object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] mask-image-gradient-b transition-transform duration-700 hover:scale-105"
                                style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* List Header */}
            <div className="flex items-end justify-between border-b border-space-steel pb-4 px-2">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
                        <Dna className="text-space-neon" /> {t.subtitle}
                    </h2>
                </div>
                <div className="hidden md:block text-space-muted font-mono text-xs tracking-widest">
                    SYSTEM_STATUS: ONLINE • {RACES.length} ENTRIES
                </div>
            </div>

            {/* Grid of Races */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {RACES.map(race => (
                    <div
                        key={race.id}
                        onClick={() => setSelectedRace(race)}
                        className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer border border-space-steel/20 bg-space-black transition-all duration-500 hover:border-space-neon hover:shadow-[0_0_30px_rgba(0,194,255,0.15)] hover:-translate-y-2"
                    >
                        {/* Background Image (Full Cover) */}
                        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                            <div className="absolute inset-0 bg-gradient-to-t from-space-black via-space-black/50 to-transparent z-10" />
                            <img
                                src={race.images && race.images.length > 0 ? race.images[imageIndices[race.id] || 0] : ''}
                                alt={race.name}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                            />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                            <div className="transform transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                <div className="flex justify-between items-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    <span className="text-space-neon font-mono text-xs tracking-widest">{t.specimen} {race.id.substring(0, 3).toUpperCase()}</span>
                                </div>

                                <h3 className="text-3xl font-display font-black text-white italic uppercase leading-none mb-2 drop-shadow-lg">
                                    {race.name}
                                </h3>

                                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                                    <p className="text-space-muted text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                        {race.summary}
                                    </p>
                                    <div className="flex items-center gap-2 text-space-neon text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity delay-300">
                                        View Data <ArrowRight size={12} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tech Overlay lines */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-space-neon to-transparent -translate-x-full group-hover:animate-scanline opacity-50" />
                    </div>
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
