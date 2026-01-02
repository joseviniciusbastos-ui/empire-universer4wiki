import React, { useState, useRef, useMemo } from 'react';
import { Button, Card, Badge } from '../ui/Shared';
import { Search, ZoomIn, ZoomOut, Maximize2, Cpu, Info, Boxes, Box, Zap, Shield, Target, Globe, Landmark, ShieldCheck, Crosshair, Factory, Radio, Landmark as Bank, ShieldAlert, Building2, Map, ArrowRight, CornerDownRight, History, Route, Printer, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { TECH_NODES, CATEGORY_UI, TechNode } from '../../lib/techData';
import { RACES } from '../../lib/racialData';
import DOMPurify from 'isomorphic-dompurify';

const STATIC_TEXT = {
    pt: {
        title: 'Árvore de Tecnologias',
        subtitle: 'Matriz de Desenvolvimento Galático',
        zoom: 'Ampliação',
        reset: 'Resetar Foco',
        search: 'Localizar Tecnologia...',
        search_placeholder: 'Buscar tecnologia...',
        nodes: 'Nódulos Ativos',
        locked: 'Bloqueado',
        unlocked: 'Concluído',
        requirements: 'Pesquisa necessária:',
        unlocks: 'Desbloqueia:',
        path: 'Caminho de Pesquisa',
        click_hint: 'CLIQUE PARA FIXAR/VISUALIZAR CAMINHO',
        prereq_chain: 'Requisitos Cumulativos',
        print_report: 'Gerar Relatório',
        technical_report: 'RELATÓRIO TÉCNICO DE PESQUISA',
        prerequisites: 'PRÉ-REQUISITOS',
        category: 'CATEGORIA',
        description: 'ESPECIFICAÇÕES TÉCNICAS',
        categories: {
            general: 'Edifícios Base',
            engine: 'Motores e Propulsão',
            cargo: 'Módulos de Carga',
            weapon: 'Armas e Mira',
            defense: 'Proteção e Blindagem',
            chassis: 'Estruturas de Nave',
            other: 'Extração e Exploração'
        },
        base_time: 'Tempo de Pesquisa'
    },
    en: {
        title: 'Technology Tree',
        subtitle: 'Galactic Development Matrix',
        zoom: 'Magnification',
        reset: 'Reset Focus',
        search: 'Locate Tech...',
        search_placeholder: 'Search technology...',
        nodes: 'Active Nodes',
        locked: 'Locked',
        unlocked: 'Completed',
        requirements: 'Research required:',
        unlocks: 'Unlocks:',
        path: 'Research Path',
        click_hint: 'CLICK TO PIN/VIEW PATH',
        prereq_chain: 'Cumulative Requirements',
        print_report: 'Generate Report',
        technical_report: 'TECHNICAL RESEARCH REPORT',
        prerequisites: 'PREREQUISITES',
        category: 'CATEGORY',
        description: 'TECHNICAL SPECIFICATIONS',
        categories: {
            general: 'Base Buildings',
            engine: 'Engines & Propulsion',
            cargo: 'Cargo Modules',
            weapon: 'Weapons & Aiming',
            defense: 'Protection & Armor',
            chassis: 'Ship Structures',
            other: 'Extraction & Exploration'
        },
        base_time: 'Research Time'
    }
};

export const TechTreeView: React.FC = () => {
    const { language } = useLanguage();
    const t = STATIC_TEXT[language] || STATIC_TEXT.en;
    const [scale, setScale] = useState(0.3);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState<TechNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<TechNode | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);

    // --- UX: Path Finding Logic ---
    const getPrerequisiteChain = (node: TechNode, chain = new Set<string>()): Set<string> => {
        if (!node.requirements) return chain;
        node.requirements.forEach(reqId => {
            if (!chain.has(reqId)) {
                chain.add(reqId);
                const reqNode = TECH_NODES.find(n => n.id === reqId);
                if (reqNode) getPrerequisiteChain(reqNode, chain);
            }
        });
        return chain;
    };

    const getUnlocks = (nodeId: string): TechNode[] => {
        return TECH_NODES.filter(n => n.requirements?.includes(nodeId));
    };

    const activeChain = useMemo(() => {
        return selectedNode ? getPrerequisiteChain(selectedNode) : new Set<string>();
    }, [selectedNode]);

    const activeUnlocks = useMemo(() => {
        return selectedNode ? getUnlocks(selectedNode.id) : [];
    }, [selectedNode]);

    // --- Interaction ---
    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newScale = Math.min(Math.max(scale + delta, 0.02), 2);
        setScale(newScale);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - dragStart.y });
        if ((e.target as HTMLElement) === containerRef.current) {
            setSelectedNode(null);
        }
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
        setScale(0.3);
        setPosition({ x: 50, y: 50 });
        setSelectedNode(null);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredNodes = TECH_NODES.filter(node => {
        const name = language === 'pt' ? node.pt : node.en;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const displayNode = selectedNode || hoveredNode;

    return (
        <div className="space-y-6 animate-fadeIn h-[calc(100vh-120px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-space-neon/10 border border-space-neon/20 rounded-xl shadow-[0_0_15px_rgba(0,194,255,0.1)]">
                        <Cpu className="text-space-neon animate-pulse-fast" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold uppercase text-white tracking-widest leading-none mb-1">
                            {t.title}
                        </h2>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-space-muted uppercase tracking-[0.2em]">
                            <span className="text-space-neon">MATRIX:</span> v4.2.0 • {TECH_NODES.length} NODES • {(scale * 100).toFixed(0)}% ZOOM
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-space-muted" size={14} />
                        <input
                            type="text"
                            placeholder={t.search}
                            className="bg-space-dark border border-space-steel rounded-sm py-2 pl-10 pr-4 text-[10px] font-mono focus:border-space-neon outline-none transition-all w-48"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="h-8 w-[1px] bg-space-steel/30 mx-1" />
                    <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(s + 0.1, 2))}><ZoomIn size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(s - 0.1, 0.02))}><ZoomOut size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={handlePrint} className="text-space-neon hover:bg-space-neon/10"><Printer size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={resetView} className="text-space-neon hover:bg-space-neon/10"><Maximize2 size={16} /></Button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* Viewport Card */}
                <Card className="flex-1 relative overflow-hidden bg-[#0a0a0a] border-space-steel/30 p-0 cursor-move"
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
                            backgroundImage: `radial-gradient(circle, #00c2ff 1.5px, transparent 1.5px)`,
                            backgroundSize: `${60 * scale}px ${60 * scale}px`,
                            backgroundPosition: `${position.x}px ${position.y}px`
                        }}
                    />

                    {/* Tech Tree Canvas */}
                    <div
                        className="absolute transition-transform duration-75 ease-out origin-top-left"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        }}
                    >
                        {/* Category Background Clusters */}
                        {[
                            { y: 100, x: 0, w: 2500, h: 300, label: t.categories.general, color: 'sky' },
                            { y: 400, x: 0, w: 2500, h: 200, label: t.categories.cargo, color: 'blue' },
                            { y: 600, x: 0, w: 2500, h: 400, label: t.categories.engine, color: 'lime' },
                            { y: 1000, x: 0, w: 2500, h: 700, label: t.categories.weapon, color: 'red' },
                            { y: 1700, x: 0, w: 2500, h: 500, label: t.categories.defense, color: 'purple' },
                            { y: 2200, x: 0, w: 3500, h: 600, label: t.categories.chassis, color: 'amber' },
                            { y: 2800, x: 0, w: 3500, h: 1000, label: t.categories.other, color: 'orange' },
                        ].map(cluster => (
                            <div key={cluster.label} className="absolute pointer-events-none" style={{ top: cluster.y - 100, left: 100, width: cluster.w, height: cluster.h }}>
                                <div className={`absolute inset-0 bg-${cluster.color}-400/[0.03] border-l-4 border-${cluster.color}-400/20 rounded-r-3xl`} />
                                <span className={`absolute left-6 top-6 text-4xl font-display font-black uppercase tracking-[0.6em] opacity-20 text-${cluster.color}-400 select-none`}>
                                    {cluster.label}
                                </span>
                            </div>
                        ))}

                        <svg className="absolute top-0 left-0 w-[8000px] h-[8000px] pointer-events-none overflow-visible">
                            <defs>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {TECH_NODES.map(node => (
                                node.requirements?.map(reqId => {
                                    const reqNode = TECH_NODES.find(n => n.id === reqId);
                                    if (!reqNode) return null;

                                    const isPath = selectedNode && (
                                        (activeChain.has(reqId) && (activeChain.has(node.id) || node.id === selectedNode.id))
                                    );

                                    const isRelevant = !selectedNode || isPath;
                                    const color = isPath ? '#00ffa3' : (CATEGORY_UI[node.category].border.split('-')[1] === 'red' ? '#ef4444' : '#00C2FF');

                                    return (
                                        <g key={`${node.id} -${reqId} `}>
                                            <line
                                                x1={reqNode.x} y1={reqNode.y}
                                                x2={node.x} y2={node.y}
                                                stroke={color}
                                                strokeWidth={isPath ? "4" : "2"}
                                                strokeDasharray={isPath ? "none" : "8,8"}
                                                opacity={isRelevant ? (isPath ? 1 : 0.2) : 0.05}
                                                style={{ filter: isPath ? 'url(#glow)' : 'none' }}
                                            />
                                            {isPath && (
                                                <circle r="4" fill="#00ffa3">
                                                    <animateMotion
                                                        path={`M ${reqNode.x} ${reqNode.y} L ${node.x} ${node.y} `}
                                                        dur="1.5s"
                                                        repeatCount="indefinite"
                                                    />
                                                </circle>
                                            )}
                                        </g>
                                    );
                                })
                            ))}
                        </svg>

                        {filteredNodes.map(node => {
                            const ui = CATEGORY_UI[node.category] || CATEGORY_UI.other;
                            const isHovered = hoveredNode?.id === node.id;
                            const isSelected = selectedNode?.id === node.id;
                            const isInPrereqChain = selectedNode && activeChain.has(node.id);
                            const isUnlock = selectedNode && activeUnlocks.some(n => n.id === node.id);
                            const isDimmed = selectedNode && !isSelected && !isInPrereqChain && !isUnlock;

                            return (
                                <div
                                    key={node.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedNode(isSelected ? null : node);
                                    }}
                                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-4 bg-space-dark/95 backdrop-blur-sm rounded-xl border transition-all duration-300 pointer-events-auto cursor-pointer
                                        ${isSelected ? `border-space-neon ring-4 ring-space-neon/20 z-20 scale-125 shadow-[0_0_50px_rgba(0,255,163,0.3)]` :
                                            isInPrereqChain ? `border-sky-400 ring-2 ring-sky-400/20 z-10 scale-100 shadow-[0_0_30px_rgba(0,194,255,0.2)]` :
                                                isUnlock ? `border-emerald-400 ring-2 ring-emerald-400/20 z-10 scale-100 shadow-[0_0_30px_rgba(0,255,163,0.1)]` :
                                                    isHovered ? `${ui.border} ring-4 ${ui.border.replace('border-', 'ring-')}/20 scale-110 shadow-[0_0_40px_rgba(0,194,255,0.4)] z-10` :
                                                        'border-space-steel/50'
                                        }
                                        ${isDimmed ? 'opacity-20 grayscale scale-90' : 'opacity-100'}
                                    `}
                                    style={{ left: node.x, top: node.y }}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg ${ui.bg} border ${ui.border} flex items-center justify-center shadow-inner`}>
                                            {React.cloneElement(ui.icon as React.ReactElement, { className: ui.color, size: 20 })}
                                        </div>
                                        <div className="min-w-[140px]">
                                            <h4 className="text-sm font-display font-bold text-white uppercase leading-tight tracking-wider">{language === 'pt' ? node.pt : node.en}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className={`text-[8px] font-mono uppercase tracking-tighter ${ui.color}`}>{t.categories[node.category]}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Interaction Labels */}
                                    {isSelected && <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-space-neon text-space-black px-2 py-0.5 rounded-full text-[7px] font-black tracking-widest whitespace-nowrap shadow-lg">TARGET</div>}
                                    {isInPrereqChain && <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-2 py-0.5 rounded-full text-[7px] font-black tracking-widest whitespace-nowrap shadow-lg">PREREQ</div>}
                                    {isUnlock && <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[7px] font-black tracking-widest whitespace-nowrap shadow-lg">UNLOCKS</div>}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Right Sidebar - Tech Details */}
                <div className="w-[420px] flex flex-col bg-space-black border border-space-steel/30 rounded-2xl overflow-hidden shadow-2xl animate-slideInRight">
                    <div className="relative p-6 h-full flex flex-col min-h-0">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-space-neon/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                        {displayNode ? (
                            <div className="relative flex flex-col h-full z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <Badge className={`${CATEGORY_UI[displayNode.category].bg} ${CATEGORY_UI[displayNode.category].color} border-${CATEGORY_UI[displayNode.category].color.split('-')[1]}-500/30 text-[9px] px-3 font-bold`}>
                                        {t.categories[displayNode.category].toUpperCase()}
                                    </Badge>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-space-dark rounded-full border border-space-steel">
                                        <Box size={10} className="text-space-neon" />
                                        <span className="text-[9px] font-mono text-space-muted tracking-tighter uppercase font-bold">SEG: {displayNode.id}</span>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-display font-black text-white leading-[0.9] mb-4 tracking-tighter uppercase italic drop-shadow-lg">
                                    {language === 'pt' ? displayNode.pt : displayNode.en}
                                </h3>

                                <div className="relative group mb-8">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-space-neon/20 to-transparent rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                                    <div className="relative p-5 bg-[#0d0d0d] border border-space-steel/30 rounded-lg">
                                        <div
                                            className="text-xs text-space-text/80 font-mono leading-relaxed first-letter:text-xl first-letter:font-bold first-letter:text-space-neon first-letter:mr-1"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(language === 'pt' ? displayNode.desc_pt : displayNode.desc_en)
                                            }}
                                        />
                                    </div>
                                </div>

                                {displayNode.id.includes('_racial') && (() => {
                                    const raceName = displayNode.desc_pt.split('Racial ')[1]?.split(' -')[0];
                                    const race = RACES.find(r => r.name.toLowerCase().includes(raceName?.toLowerCase() || ''));

                                    if (race && race.moduleImage) {
                                        return (
                                            <div className="mb-8 p-4 bg-space-neon/10 border border-space-neon/30 rounded-lg flex items-center gap-4 animate-fadeIn">
                                                <div className="w-16 h-16 rounded-lg bg-space-black border border-space-neon/30 p-1 flex-shrink-0">
                                                    <img src={race.moduleImage} alt={race.moduleName} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <span className="text-[8px] font-black text-space-neon uppercase tracking-widest block mb-1">Tecnologia Especializada</span>
                                                    <span className="text-xs font-bold text-white uppercase">{race.moduleName}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    <div className="p-4 bg-space-neon/5 border border-space-steel/30 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-space-neon/10 flex items-center justify-center border border-space-neon/30">
                                                <Clock size={16} className="text-space-neon" />
                                            </div>
                                            <span className="text-[10px] font-bold text-space-muted uppercase tracking-widest">{t.base_time}</span>
                                        </div>
                                        <span className="text-sm font-mono font-bold text-white bg-space-dark px-3 py-1 rounded border border-space-steel/30 shadow-inner">{displayNode.baseTime || '-'}</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2 mb-6">
                                    {/* Prerequisites Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-space-steel/30 pb-2">
                                            <h5 className="text-[10px] font-bold text-space-neon uppercase tracking-widest flex items-center gap-2">
                                                <History size={14} /> {t.requirements.toUpperCase()}
                                            </h5>
                                            {displayNode.requirements && (
                                                <span className="text-[9px] font-mono text-space-muted">{displayNode.requirements.length} REQ</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {displayNode.requirements?.map(reqId => {
                                                const req = TECH_NODES.find(n => n.id === reqId);
                                                return (
                                                    <div key={reqId} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-space-steel/20 rounded-lg group hover:bg-space-neon/5 hover:border-space-neon/30 transition-all cursor-help">
                                                        <div className={`w-8 h-8 rounded border flex items-center justify-center ${req ? CATEGORY_UI[req.category].bg : 'bg-space-dark'} ${req ? CATEGORY_UI[req.category].border : 'border-space-steel'}`}>
                                                            {req ? React.cloneElement(CATEGORY_UI[req.category].icon as React.ReactElement, { size: 14, className: CATEGORY_UI[req.category].color }) : <Cpu size={14} />}
                                                        </div>
                                                        <span className="text-[11px] font-mono text-white/90 font-bold tracking-tight">{req ? (language === 'pt' ? req.pt : req.en) : reqId}</span>
                                                    </div>
                                                );
                                            }) || <div className="py-4 text-center border-2 border-dashed border-space-steel/20 rounded-lg italic text-[10px] text-space-muted font-mono">Pesquisa de nível base.</div>}
                                        </div>
                                    </div>

                                    {/* Unlocks Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-space-steel/30 pb-2">
                                            <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                <CornerDownRight size={14} /> {t.unlocks.toUpperCase()}
                                            </h5>
                                            <span className="text-[9px] font-mono text-space-muted">{getUnlocks(displayNode.id).length} OP</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {getUnlocks(displayNode.id).map(unlock => (
                                                <Badge key={unlock.id} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono px-3 py-1">
                                                    {language === 'pt' ? unlock.pt : unlock.en}
                                                </Badge>
                                            ))}
                                            {getUnlocks(displayNode.id).length === 0 && (
                                                <div className="w-full py-4 text-center border-2 border-dashed border-space-steel/20 rounded-lg italic text-[10px] text-space-muted font-mono">Ponto final tecnológico alcançado.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <Button className="w-full py-4 bg-space-neon/10 hover:bg-space-neon/20 border-space-neon/30 text-space-neon text-[10px] font-black tracking-[0.25em] shadow-[0_0_20px_rgba(0,194,255,0.1)] transition-all" variant="outline" onClick={handlePrint}>
                                        <Printer size={16} className="mr-3" /> GERAR DOSSIÊ TÉCNICO
                                    </Button>
                                    <div className="flex items-center gap-2 justify-center py-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                                        <Target size={12} className="text-space-neon" />
                                        <span className="text-[8px] font-mono text-space-muted uppercase tracking-widest">Protocolo de Segurança EU4-v4.2</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-space-neon/10 rounded-full blur-2xl animate-pulse"></div>
                                    <Search size={64} className="text-space-steel opacity-20 relative z-10" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[11px] font-mono uppercase tracking-[0.4em] font-black text-space-steel border-b border-space-steel/20 pb-2">Terminal Offline</p>
                                    <p className="text-[9px] font-mono text-space-muted uppercase leading-relaxed max-w-[200px] mx-auto opacity-50">
                                        Selecione um nódulo na matriz para decodificar especificações técnicas.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PRINTABLE REPORT */}
            <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[9999]">
                <div className="border-b-8 border-black pb-6 mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black uppercase mb-2 tracking-tighter italic">Dossiê de Pesquisa & Desenvolvimento</h1>
                        <p className="font-mono text-sm font-bold tracking-widest text-gray-600">SETOR: {t.title.toUpperCase()} • {STATIC_TEXT[language]?.subtitle || STATIC_TEXT.en.subtitle}</p>
                    </div>
                    <div className="text-right font-mono text-[10px] text-gray-500">
                        GEN_STAMP: {new Date().toISOString()}<br />
                        CLEARANCE: TOP SECRET / LEVEL 5
                    </div>
                </div>

                {selectedNode ? (
                    <div className="space-y-12">
                        <div className="grid grid-cols-4 gap-8">
                            <div className="col-span-3">
                                <h2 className="text-[120px] font-black uppercase leading-none mb-6 tracking-tighter border-b-2 border-gray-100 pb-4">{language === 'pt' ? selectedNode.pt : selectedNode.en}</h2>
                                <p className="text-2xl font-serif italic border-l-[12px] border-black pl-8 py-6 bg-gray-50 leading-relaxed shadow-sm">
                                    {language === 'pt' ? selectedNode.desc_pt : selectedNode.desc_en}
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="p-4 border-2 border-black rounded text-center">
                                    <span className="block text-[10px] font-black uppercase tracking-widest mb-1">Status</span>
                                    <span className="text-2xl font-bold uppercase">CLASSIFICADO</span>
                                </div>
                                <div className="p-4 border border-gray-200 rounded">
                                    <span className="block text-[8px] font-bold uppercase tracking-widest mb-1 text-gray-400">Node ID</span>
                                    <span className="font-mono text-sm font-bold">{selectedNode.id}</span>
                                </div>
                                <div className="p-4 border border-gray-200 rounded">
                                    <span className="block text-[8px] font-bold uppercase tracking-widest mb-1 text-gray-400">Classificação</span>
                                    <span className="font-mono text-sm font-bold uppercase">{selectedNode.category}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-20">
                            <div>
                                <h3 className="text-2xl font-black border-b-4 border-black mb-6 uppercase tracking-widest italic">Genealogia de Pesquisa</h3>
                                <div className="space-y-4 font-mono">
                                    {Array.from(activeChain).reverse().map((reqId, i) => {
                                        const node = TECH_NODES.find(n => n.id === reqId);
                                        return (
                                            <div key={reqId} className="flex items-center gap-6 p-3 hover:bg-gray-50 transition-colors">
                                                <span className="text-gray-300 font-black text-xl w-8">[{String(i + 1).padStart(2, '0')}]</span>
                                                <div className="flex-1 border-b border-gray-100 pb-1">
                                                    <span className="font-black text-lg uppercase">{language === 'pt' ? node?.pt : node?.en}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="flex items-center gap-6 pt-6 mt-4 border-t-4 border-black bg-black text-white p-4">
                                        <span className="font-black text-xl w-8">[*]</span>
                                        <span className="font-black text-2xl uppercase underline decoration-4 underline-offset-8 decoration-gray-400">{language === 'pt' ? selectedNode.pt : selectedNode.en}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black border-b-4 border-black mb-6 uppercase tracking-widest italic">Impacto Operacional</h3>
                                <div className="space-y-4">
                                    {getUnlocks(selectedNode.id).map(unlock => (
                                        <div key={unlock.id} className="p-4 border-2 border-gray-100 flex items-center gap-6 hover:border-black transition-colors group">
                                            <div className="w-4 h-4 bg-black rounded-sm group-hover:rotate-45 transition-transform" />
                                            <div>
                                                <span className="block font-black text-xl uppercase leading-tight">{language === 'pt' ? unlock.pt : unlock.en}</span>
                                                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">DESBLOQUEIO TÉCNICO AUTORIZADO</span>
                                            </div>
                                        </div>
                                    ))}
                                    {getUnlocks(selectedNode.id).length === 0 && (
                                        <div className="p-12 text-center border-4 border-dotted border-gray-100 rounded-xl">
                                            <p className="text-xl font-bold uppercase italic text-gray-200">Terminal Tecnológico Local — Sem ramificações descendentes catalogadas.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 border-8 border-dotted border-gray-100 rounded-[60px]">
                        <Cpu size={120} className="text-gray-100 mb-8" />
                        <h2 className="text-4xl font-black uppercase text-gray-200 tracking-[0.5em] italic">Dossiê Vazio</h2>
                        <p className="text-gray-300 font-mono mt-4">SELECIONE UM NÓDULO NO TERMINAL PARA GERAR DOCUMENTAÇÃO</p>
                    </div>
                )}

                <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-[10px] font-mono font-bold border-t-2 border-black pt-6 uppercase tracking-widest">
                    <span>PROPRIEDADE DA INTELIGÊNCIA CENTRAL UNIVERSER4</span>
                    <span>PROTOCOLO DE SEGURANÇA: EPSILON-9</span>
                    <span>CÓPIA: 01/01</span>
                </div>
            </div>
        </div>
    );
};
