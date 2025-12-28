import React, { useState, useEffect } from 'react';
import { Rocket, Shield, Zap, Crosshair, Save, RotateCcw, Box, ShieldAlert, X, Trash2, Settings, Plus, Cpu, Printer, FileText, Layout } from 'lucide-react';
import { ShipyardManager } from '../admin/ShipyardManager';
import { Button, Card, Badge, Input } from '../ui/Shared';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';

interface ShipDesignerViewProps {
    currentUser: any;
}

export function ShipDesignerView({ currentUser }: ShipDesignerViewProps) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Data State
    const [ships, setShips] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [selectedShip, setSelectedShip] = useState<any | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        // Fetch ships
        const { data: shipsData } = await supabase.from('ships').select('*').order('name');
        if (shipsData) setShips(shipsData);

        // Fetch modules
        const { data: modulesData } = await supabase.from('ship_modules').select('*');
        if (modulesData) setModules(modulesData);

        // Fetch active policies
        const { data: policiesData } = await supabase.from('policies').select('*').eq('is_active', true);
        if (policiesData) setActivePolicies(policiesData);

        setIsLoading(false);
    };

    // --- DESIGNER STATE ---
    const [viewMode, setViewMode] = useState<'designer' | 'hangar' | 'admin'>('designer');
    const [slots, setSlots] = useState<any[]>([]);
    const [designName, setDesignName] = useState("");
    const [currentStats, setCurrentStats] = useState<any>({});
    const [totalCost, setTotalCost] = useState<any>({});
    const [activePolicies, setActivePolicies] = useState<any[]>([]);
    const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [policyModifiers, setPolicyModifiers] = useState<any>({});
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        if (selectedShip) {
            // Initialize slots based on ship layout
            setSlots(selectedShip.slots_layout.map((layout: any, index: number) => ({
                id: index,
                type: layout.type,
                count: layout.count,
                module: null // Currently equipped module
            })));
            setDesignName(`${selectedShip.name} MK-I`);
            setViewMode('designer'); // Switch to designer when ship is selected
        }
    }, [selectedShip]);

    useEffect(() => {
        if (selectedShip) {
            calculateStats();
        }
    }, [slots, selectedShip, activePolicies]);

    useEffect(() => {
        if (viewMode === 'hangar') {
            fetchSavedDesigns();
        }
        if (viewMode === 'admin') {
            fetchInitialData();
        }
    }, [viewMode]);

    const fetchSavedDesigns = async () => {
        const { data } = await supabase.from('saved_designs')
            .select('*, ships(name, image_url)')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        if (data) setSavedDesigns(data);
    };

    const calculateStats = () => {
        if (!selectedShip) return;

        let stats = { ...selectedShip.base_stats };
        let cost = { ...selectedShip.base_cost };
        let currentWarnings: string[] = [];
        let modifiersLog: any = {};

        // 1. Add Module Stats
        slots.forEach(slot => {
            if (slot.module) {
                const mod = slot.module;
                if (mod.stats_modifier) {
                    Object.entries(mod.stats_modifier).forEach(([key, value]: [string, any]) => {
                        stats[key] = (stats[key] || 0) + value;
                    });
                }
                if (mod.cost) {
                    Object.entries(mod.cost).forEach(([key, value]: [string, any]) => {
                        cost[key] = (cost[key] || 0) + value;
                    });
                }
            }
        });

        // 2. Apply Policy Modifiers
        activePolicies.forEach(policy => {
            if (policy.modifiers) {
                Object.entries(policy.modifiers).forEach(([key, value]: [string, any]) => {
                    // Check if it's a percentage modifier (e.g., build_time_pct)
                    if (key.endsWith('_pct')) {
                        const targetStat = key.replace('_pct', '');
                        if (cost[targetStat] !== undefined) {
                            const modVal = cost[targetStat] * value;
                            cost[targetStat] += modVal;
                            modifiersLog[policy.name] = (modifiersLog[policy.name] || []).concat(`${targetStat}: ${(value * 100).toFixed(0)}%`);
                        } else if (stats[targetStat] !== undefined) {
                            const modVal = stats[targetStat] * value;
                            stats[targetStat] += modVal;
                            modifiersLog[policy.name] = (modifiersLog[policy.name] || []).concat(`${targetStat}: ${(value * 100).toFixed(0)}%`);
                        }
                    }
                    // Direct value addition could be handled here too if needed
                });
            }
        });

        // Validation limits
        if (stats.energy_consumption > stats.energy_production) {
            currentWarnings.push("ENERGIA INSUFICIENTE");
        }

        setCurrentStats(stats);
        setTotalCost(cost);
        setWarnings(currentWarnings);
        setPolicyModifiers(modifiersLog);
    };

    const handleEquipModule = (slotId: number, module: any) => {
        setSlots(prev => prev.map(s => {
            if (s.id === slotId) {
                return { ...s, module: module };
            }
            return s;
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSaveDesign = async () => {
        if (!designName.trim()) {
            showToast("Defina um nome para o design.", "error");
            return;
        }

        const modulesConfig = slots.map(s => ({
            slot_id: s.id,
            module_id: s.module?.id || null
        }));

        const { error } = await supabase.from('saved_designs').insert([{
            user_id: currentUser.id,
            ship_id: selectedShip.id,
            name: designName,
            modules_config: modulesConfig,
            total_stats: currentStats,
            is_public: false
        }]);

        if (error) {
            showToast("Erro ao salvar: " + error.message, "error");
        } else {
            showToast("Design salvo com sucesso!", "success");
            setViewMode('hangar'); // Switch to hangar
            setSelectedShip(null);
        }
    };

    const handleLoadDesign = async (design: any) => {
        // Find original ship
        const ship = ships.find(s => s.id === design.ship_id);
        if (!ship) {
            showToast("Chassi de nave obsoleto/removido.", "error");
            return;
        }

        setSelectedShip(ship);
        setDesignName(design.name);

        // Reconstruct slots
        // Need to map saved 'modules_config' back to updated slots state
        // This assumes ships slots_layout hasn't changed.
        // A more robust system would verify slot_id integrity.

        const loadedLayout = design.modules_config;
        const newSlots = ship.slots_layout.map((layout: any, index: number) => {
            const savedSlot = loadedLayout.find((s: any) => s.slot_id === index); // Assuming index mapping
            const module = savedSlot?.module_id ? modules.find(m => m.id === savedSlot.module_id) : null;

            return {
                id: index,
                type: layout.type,
                count: layout.count,
                module: module
            };
        });

        setSlots(newSlots);
        setViewMode('designer');
    };

    const handleTogglePublic = async (design: any) => {
        const newValue = !design.is_public;
        const { error } = await supabase.from('saved_designs')
            .update({ is_public: newValue })
            .eq('id', design.id);

        if (!error) {
            setSavedDesigns(prev => prev.map(d => d.id === design.id ? { ...d, is_public: newValue } : d));
            showToast(newValue ? "Design publicado na rede!" : "Design tornado privado.", "success");
        }
    };

    const handleDeleteDesign = async (id: string) => {
        if (!confirm("Deletar este projeto?")) return;
        const { error } = await supabase.from('saved_designs').delete().eq('id', id);
        if (!error) {
            setSavedDesigns(prev => prev.filter(d => d.id !== id));
            showToast("Projeto deletado.", "success");
        }
    };

    // --- ADMIN CRUD FUNCTIONS ---
    const createItem = async (table: string, data: any, refresh: () => void) => {
        const { error } = await supabase.from(table).insert([data]);
        if (!error) {
            showToast("Item criado com sucesso!", "success");
            refresh();
        } else {
            showToast("Erro: " + error.message, "error");
        }
    };

    const deleteItem = async (table: string, id: string, refresh: () => void) => {
        if (!confirm("Tem certeza?")) return;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) {
            showToast("Item removido.", "success");
            refresh();
        } else {
            showToast("Erro: " + error.message, "error");
        }
    };

    // Helper for JSON inputs
    const JsonInput = ({ value, onChange, placeholder }: { value: any, onChange: (v: any) => void, placeholder?: string }) => {
        const [text, setText] = useState(JSON.stringify(value, null, 2));
        const [valid, setValid] = useState(true);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newVal = e.target.value;
            setText(newVal);
            try {
                const parsed = JSON.parse(newVal);
                setValid(true);
                onChange(parsed);
            } catch (err) {
                setValid(false);
            }
        };

        return (
            <div className="flex flex-col">
                <textarea
                    className={`bg-space-black border ${valid ? 'border-space-steel' : 'border-space-alert'} rounded p-2 font-mono text-xs h-32 w-full`}
                    value={text}
                    onChange={handleChange}
                    placeholder={placeholder || "{}"}
                />
                {!valid && <span className="text-[10px] text-space-alert">JSON Inválido</span>}
            </div>
        );
    };

    const renderWelcome = () => (
        <div className="bg-space-dark border border-space-neon p-6 rounded-xl mb-6 flex items-start gap-4 relative">
            <div className="bg-space-neon/10 p-4 rounded-full border border-space-neon/30">
                <Rocket size={32} className="text-space-neon" />
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-white mb-2">Bem-vindo ao Estaleiro Virtual</h3>
                <p className="text-sm text-space-muted mb-4 font-mono leading-relaxed">
                    Comandante, esta interface permite projetar as naves que comporão nossa frota.
                    <br />1. Selecione um <strong>Chassi</strong> base.
                    <br />2. Equipe <strong>Módulos</strong> nos hardpoints disponíveis.
                    <br />3. Visualize estatísticas e custos em tempo real.
                </p>
                <Button size="sm" variant="secondary" onClick={() => setShowWelcome(false)}>ENTENDIDO</Button>
            </div>
            <button onClick={() => setShowWelcome(false)} className="absolute top-2 right-2 text-space-muted hover:text-white">
                <X size={16} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in relative z-10 w-full max-w-7xl mx-auto p-4">
            <div className="flex justify-between items-center border-b border-space-steel pb-4">
                <div>
                    <h2 className="text-3xl font-display font-bold uppercase flex items-center gap-3 text-white">
                        <Rocket className="text-space-neon" /> Estaleiro Virtual
                    </h2>
                    <p className="text-space-muted font-mono text-sm mt-1">
                        Projete e configure suas naves para a frota.
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button variant={viewMode === 'designer' ? 'primary' : 'ghost'} onClick={() => { setViewMode('designer'); setSelectedShip(null); }}>PROJETISTA</Button>
                    <Button variant={viewMode === 'hangar' ? 'primary' : 'ghost'} onClick={() => { setViewMode('hangar'); setSelectedShip(null); }}>MEU HANGAR</Button>

                    {currentUser?.role === 'ADMIN' && (
                        <Button
                            variant={viewMode === 'admin' ? 'primary' : 'ghost'}
                            onClick={() => { setViewMode('admin'); setSelectedShip(null); }}
                            icon={<Settings size={14} />}
                            size="sm"
                        >
                            GERENCIAR ESTALEIRO
                        </Button>
                    )}
                </div>

                {selectedShip && viewMode === 'designer' && (
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-xs text-space-muted font-mono uppercase">Custo Total</div>
                            <div className="flex gap-3 text-xs font-mono">
                                <span className="text-white">METAL: {Math.floor(totalCost.metal || 0)}</span>
                                <span className="text-blue-300">CRISTAL: {Math.floor(totalCost.crystal || 0)}</span>
                                <span className="text-green-300">DEUTÉRIO: {Math.floor(totalCost.deuterium || 0)}</span>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={handlePrint} icon={<Printer size={16} />} title="Imprimir Esquematica">EXPORTAR</Button>
                        <Button variant="primary" onClick={handleSaveDesign} icon={<Save size={16} />}>SALVAR FIT</Button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin text-space-neon"><Rocket size={32} /></div>
                    <span className="ml-3 text-space-mono text-space-muted">Carregando esquemáticas...</span>
                </div>
            ) : viewMode === 'hangar' ? (
                /* HANGAR VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedDesigns.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-space-muted opacity-50">
                            <Rocket size={48} className="mx-auto mb-2" />
                            Nenhum projeto salvo.
                        </div>
                    ) : (
                        savedDesigns.map(design => (
                            <div key={design.id} className="bg-space-dark border border-space-steel p-4 rounded-xl group hover:border-space-neon transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-black rounded border border-space-steel flex items-center justify-center overflow-hidden">
                                            {design.ships?.image_url ? <img src={design.ships.image_url} className="w-full h-full object-cover" /> : <Rocket size={16} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white font-display">{design.name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-space-muted">{design.ships?.name} Class</span>
                                                {design.is_public ? (
                                                    <Badge className="bg-green-900/50 text-green-300 border-green-500/30 text-[9px] py-0">PÚBLICO</Badge>
                                                ) : (
                                                    <Badge className="bg-space-steel/30 text-space-muted border-space-steel/30 text-[9px] py-0">PRIVADO</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDeleteDesign(design.id)} className="p-1.5 text-space-alert hover:bg-space-alert/20 rounded"><X size={14} /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-4 text-space-muted">
                                    <div>SPEED: <span className="text-white">{design.total_stats.speed}</span></div>
                                    <div>ATTACK: <span className="text-red-300">{design.total_stats.attack || 0}</span></div>
                                    <div>SHIELD: <span className="text-blue-300">{design.total_stats.shield}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <Button className="flex-1" variant="secondary" onClick={() => handleLoadDesign(design)}>CARREGAR</Button>
                                    <Button
                                        className="flex-shrink-0"
                                        variant="ghost"
                                        onClick={() => handleTogglePublic(design)}
                                        title={design.is_public ? "Tornar Privado" : "Tornar Público"}
                                    >
                                        {design.is_public ? <Shield size={16} className="text-green-400" /> : <ShieldAlert size={16} className="text-space-muted" />}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : !selectedShip ? (
                /* SHIP SELECTION SCREEN */
                <>
                    {showWelcome && renderWelcome()}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ships.map(ship => (
                            <div key={ship.id}
                                onClick={() => setSelectedShip(ship)}
                                className="group relative bg-space-dark/60 border border-space-steel hover:border-space-neon rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                                <div className="h-48 bg-black/50 relative">
                                    {ship.image_url ? (
                                        <img src={ship.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-space-muted">
                                            <Rocket size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-space-black/80 backdrop-blur border border-space-steel">{ship.category}</Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-white font-display mb-1 group-hover:text-space-neon transition-colors">{ship.name}</h3>
                                    <p className="text-xs text-space-muted mb-4 h-10 overflow-hidden">{ship.description}</p>

                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                        <div className="flex justify-between items-center bg-space-black/30 p-1.5 rounded">
                                            <span className="text-space-muted">HULL</span>
                                            <span className="text-white">{ship.base_stats.hull}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-space-black/30 p-1.5 rounded">
                                            <span className="text-space-muted">SHIELD</span>
                                            <span className="text-white font-bold text-blue-300">{ship.base_stats.shield}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-space-black/30 p-1.5 rounded col-span-2">
                                            <div className="flex items-center gap-1 text-space-muted"><Box size={12} /> SLOTS</div>
                                            <span className="text-space-neon">{ship.slots_layout.length} HARDPOINTS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {ships.length === 0 && (
                            <div className="col-span-full text-center py-12 text-space-muted border border-dashed border-space-steel rounded-xl">
                                <p>Nenhum chassi de nave disponível. Contate o administrador.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : viewMode === 'admin' ? (
                <ShipyardManager
                    ships={ships}
                    modules={modules}
                    policies={activePolicies}
                    onRefresh={fetchInitialData}
                />
            ) : (
                /* DESIGNER INTERFACE */
                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
                    {/* LEFT COLUMN: VISUALS & SLOTS */}
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={() => setSelectedShip(null)} icon={<RotateCcw size={16} />}>VOLTAR</Button>
                            <Input
                                value={designName}
                                onChange={(e) => setDesignName(e.target.value)}
                                className="flex-1 bg-transparent border-0 border-b border-space-steel text-xl font-display font-bold text-white focus:border-space-neon px-0 rounded-none h-10"
                                placeholder="NOME DO DESIGN"
                            />
                        </div>

                        <div className="bg-space-black/40 border border-space-steel rounded-xl p-6 relative min-h-[300px] flex items-center justify-center">
                            {/* Central Ship Image */}
                            {selectedShip.image_url ? (
                                <img src={selectedShip.image_url} className="max-h-[250px] object-contain drop-shadow-[0_0_15px_rgba(0,255,157,0.2)]" />
                            ) : (
                                <Rocket size={96} className="text-space-steel/20" />
                            )}

                            {/* Policy Indicators */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {activePolicies.map(pol => (
                                    <Badge key={pol.id} className="bg-purple-900/50 text-purple-200 border border-purple-500/30">
                                        {pol.name} Active
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm text-space-neon font-display uppercase border-b border-space-steel/30 pb-1">Hardpoints & Modules</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {slots.map(slot => (
                                    <div key={slot.id} className="bg-space-dark/50 border border-space-steel p-3 rounded group hover:border-space-neon/50 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-space-steel">{slot.type}</Badge>
                                                <span className="text-xs text-space-muted font-mono">SLOT #{slot.id + 1}</span>
                                            </div>
                                            {slot.module && (
                                                <button onClick={() => handleEquipModule(slot.id, null)} className="text-space-alert hover:text-red-400 p-1"><X size={14} /></button>
                                            )}
                                        </div>

                                        {!slot.module ? (
                                            <select
                                                className="w-full bg-space-black border border-space-steel rounded p-2 text-xs text-white focus:border-space-neon outline-none cursor-pointer"
                                                onChange={(e) => {
                                                    const modId = e.target.value;
                                                    const mod = modules.find(m => m.id === modId);
                                                    handleEquipModule(slot.id, mod);
                                                }}
                                                value=""
                                            >
                                                <option value="" disabled>Selecionar Módulo...</option>
                                                {modules.filter(m => m.type === slot.type).map(m => (
                                                    <option key={m.id} value={m.id}>{m.name} (Lvl {m.level})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-3 p-2 bg-space-black/40 rounded border border-space-neon/30 cursor-pointer hover:bg-space-white/5" onClick={() => handleEquipModule(slot.id, null)}>
                                                {slot.module.image_url ? <img src={slot.module.image_url} className="w-8 h-8 rounded bg-black" /> : <Box size={20} className="text-space-neon" />}
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="font-bold text-white text-sm truncate">{slot.module.name}</div>
                                                    <div className="text-[10px] text-space-muted truncate">{JSON.stringify(slot.module.stats_modifier).slice(0, 30)}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: STATS */}
                    <div className="w-full lg:w-80 space-y-4">
                        <Card className="border-space-neon/50">
                            <div className="space-y-4">
                                {/* Warnings */}
                                {warnings.length > 0 && (
                                    <div className="bg-space-alert/20 border border-space-alert p-3 rounded text-space-alert text-xs font-mono mb-4">
                                        <strong className="block mb-1 flex items-center gap-2"><ShieldAlert size={14} /> ALERTAS DO SISTEMA</strong>
                                        <ul className="list-disc list-inside">
                                            {warnings.map((w, i) => <li key={i}>{w}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {/* Policy Modifiers Display */}
                                {Object.keys(policyModifiers).length > 0 && (
                                    <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded text-purple-200 text-xs font-mono mb-4">
                                        <strong className="block mb-1">BÔNUS ATIVOS</strong>
                                        {Object.entries(policyModifiers).map(([policyName, mods]: [string, any]) => (
                                            <div key={policyName} className="mb-1">
                                                <span className="font-bold">{policyName}</span>: {mods.join(', ')}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {Object.entries(currentStats).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center border-b border-space-steel/20 pb-1">
                                        <span className="text-xs text-space-muted uppercase font-mono">{key.replace('_', ' ')}</span>
                                        <span className="text-sm font-bold text-white font-mono">{String(Math.floor(value as number))}</span>
                                    </div>
                                ))}

                                <div className="pt-4 mt-4 border-t border-space-steel">
                                    <h4 className="text-xs text-space-neon font-display uppercase mb-2">Resumo de Recursos</h4>
                                    {Object.entries(totalCost).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="text-xs text-space-muted uppercase font-mono">{key}</span>
                                            <span className="text-xs text-white font-mono">{String(Math.floor(value as number))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )
            }
        </div >
    );
}
