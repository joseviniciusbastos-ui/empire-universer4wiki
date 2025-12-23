import React, { useState, useRef } from 'react';
import { Button, Card } from '../ui/Shared';
import { Search, ZoomIn, ZoomOut, Maximize2, Cpu, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const STATIC_TEXT = {
    pt: {
        title: 'Árvore Tecnológica',
        subtitle: 'Matriz de Progresso Científico',
        zoom: 'Ampliação',
        reset: 'Resetar Foco',
        search: 'Localizar Tecnologia...',
        nodes: 'Nódulos Ativos',
        locked: 'Bloqueado',
        unlocked: 'Síncronizado'
    },
    en: {
        title: 'Technology Tree',
        subtitle: 'Scientific Progress Matrix',
        zoom: 'Magnification',
        reset: 'Reset Focus',
        search: 'Locate Tech...',
        nodes: 'Active Nodes',
        locked: 'Locked',
        unlocked: 'Synced'
    },
    fr: {
        title: 'Arbre Technologique',
        subtitle: 'Matrice de Progrès Scientifique',
        zoom: 'Agrandissement',
        reset: 'Réinitialiser',
        search: 'Localiser Technologie...',
        nodes: 'Noeuds Actifs',
        locked: 'Verrouillé',
        unlocked: 'Synchronisé'
    }
};

const TECH_NODES = [
    { id: 'fusion', x: 250, y: 150, title: 'Fusão a Fio', pt: 'Fusão a Fio', en: 'Core Fusion', desc: 'Geração de energia estável para propulsão interestelar.' },
    { id: 'shields', x: 450, y: 300, title: 'Escudos Sinc.', pt: 'Escudos Sinc.', en: 'Sync Shields', desc: 'Matriz de defesa contra micro-impactos e radiação.' },
    { id: 'warp', x: 700, y: 200, title: 'Motor de Dobra', pt: 'Motor de Dobra', en: 'Warp Drive', desc: 'Manipulação do espaço-tempo para viagens FTL.' },
];

export const TechTreeView: React.FC = () => {
    const { language } = useLanguage();
    const t = STATIC_TEXT[language];
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.min(Math.max(scale + delta, 0.5), 3);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const resetView = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div className="space-y-6 animate-fadeIn h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-space-neon/10 border border-space-neon/20 rounded-xl">
                        <Cpu className="text-space-neon" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold uppercase text-white tracking-widest leading-none mb-1">
                            {t.title}
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-space-muted uppercase tracking-[0.2em]">
                            <span className="text-space-neon">MATRIX:</span> {t.subtitle}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-half -translate-y-half text-space-muted" size={14} />
                        <input
                            type="text"
                            placeholder={t.search}
                            className="bg-space-dark border border-space-steel rounded-sm py-2 pl-10 pr-4 text-[10px] font-mono focus:border-space-neon outline-none transition-all w-48"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="h-8 w-[1px] bg-space-steel/30 mx-1" />
                    <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(s + 0.2, 3))}><ZoomIn size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}><ZoomOut size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={resetView} className="text-space-neon"><Maximize2 size={16} /></Button>
                </div>
            </div>

            {/* Viewport Card */}
            <Card className="flex-1 relative overflow-hidden bg-space-black border-space-steel/30 p-0 cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                ref={containerRef}
            >
                {/* Background Grid */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle, #00c2ff 1px, transparent 1px)`,
                        backgroundSize: `${30 * scale}px ${30 * scale}px`,
                        backgroundPosition: `${position.x}px ${position.y}px`
                    }}
                />

                {/* Tech Content Container */}
                <div
                    className="absolute w-full h-full transition-transform duration-75 ease-out origin-center"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    }}
                >
                    {/* Placeholder for the large Tech Tree Image */}
                    <div className="absolute top-0 left-0 w-[2000px] h-[2000px] flex items-center justify-center border border-space-steel/10 bg-space-dark/20 text-space-steel/20 select-none">
                        {/* Imagine a huge image here */}
                        <img
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                            className="w-full h-full object-cover opacity-20 pointer-events-none"
                            alt="Tech Background"
                        />
                        <span className="absolute font-display text-9xl opacity-10 uppercase">TECH MATRIX ALPHA</span>
                    </div>

                    {/* SVG Hotspots/Lines implementation could go here */}
                    <svg className="absolute top-0 left-0 w-[2000px] h-[2000px] pointer-events-none overflow-visible">
                        {/* Example connecting lines */}
                        <line x1="250" y1="150" x2="450" y2="300" stroke="#00c2ff" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                        <line x1="450" y1="300" x2="700" y2="200" stroke="#00c2ff" strokeWidth="2" strokeDasharray="5,5" />
                    </svg>

                    {/* Nodes */}
                    {TECH_NODES.map(node => (
                        <div
                            key={node.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-4 bg-space-dark rounded-lg border transition-all duration-300 pointer-events-auto cursor-pointer
                                ${hoveredNode?.id === node.id ? 'border-space-neon ring-4 ring-space-neon/20 scale-110 shadow-[0_0_30px_rgba(0,194,255,0.4)]' : 'border-space-steel'}
                            `}
                            style={{ left: node.x, top: node.y }}
                            onMouseEnter={() => setHoveredNode(node)}
                            onMouseLeave={() => setHoveredNode(null)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-space-neon/20 flex items-center justify-center">
                                    <Cpu size={16} className="text-space-neon" />
                                </div>
                                <div className="min-w-[120px]">
                                    <h4 className="text-xs font-display font-bold text-white uppercase">{language === 'pt' ? node.pt : node.en}</h4>
                                    <span className="text-[9px] text-space-muted font-mono uppercase tracking-tighter">PROTOCOLO: {node.id.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* HUD Overlay */}
                <div className="absolute bottom-6 left-6 p-4 bg-space-dark/80 backdrop-blur-md border border-space-steel/30 rounded-xl max-w-sm pointer-events-none animate-slideUp">
                    {hoveredNode ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Info size={14} className="text-space-neon" />
                                <span className="text-[10px] font-mono text-space-neon uppercase tracking-widest">DADOS DE PESQUISA</span>
                            </div>
                            <h3 className="text-lg font-display font-bold text-white">{language === 'pt' ? hoveredNode.pt : hoveredNode.en}</h3>
                            <p className="text-xs text-space-muted font-mono leading-relaxed">{hoveredNode.desc}</p>
                            <div className="flex gap-2 pt-2">
                                <span className="text-[9px] font-mono px-2 py-0.5 border border-space-neon text-space-neon bg-space-neon/10">{t.unlocked}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-[10px] font-mono text-space-muted uppercase tracking-widest text-center py-4">
                            SELECIONE UM NÓDULO PARA DETALHES
                        </div>
                    )}
                </div>

                {/* Zoom Indicator Overlay */}
                <div className="absolute top-6 right-6 px-3 py-1 bg-space-dark/80 border border-space-steel/30 rounded font-mono text-[10px] text-space-muted">
                    MAG: {(scale * 100).toFixed(0)}%
                </div>
            </Card>
        </div>
    );
};
