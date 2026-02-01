import React, { useState, useEffect } from 'react';
import { Rocket, Shield, Zap, Crosshair, Save, RotateCcw, Box, ShieldAlert, X, Trash2, Settings, Plus, Cpu } from 'lucide-react';
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
    const [viewMode, setViewMode] = useState<'designer' | 'hangar' | 'admin-ships' | 'admin-modules' | 'admin-policies' | 'admin-component-types'>('designer');
    const [slots, setSlots] = useState<any[]>([]);
    const [designName, setDesignName] = useState("");
    const [currentStats, setCurrentStats] = useState<any>({});
    const [totalCost, setTotalCost] = useState<any>({});
    const [activePolicies, setActivePolicies] = useState<any[]>([]);
    const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [policyModifiers, setPolicyModifiers] = useState<any>({});
    const [showWelcome, setShowWelcome] = useState(true);

    // Admin Enhancement State
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterType, setFilterType] = useState<string>("all");

    // SHIP TEMPLATES
    const SHIP_TEMPLATES = {
        fighter: {
            name: "Caça Interceptor",
            category: "fighter",
            description: "Caça leve e ágil, ideal para patrulhas e combate rápido.",
            base_stats: { hull: 150, shield: 75, speed: 200, cargo: 10, energy_production: 100, energy_consumption: 0 },
            slots_layout: [{ type: "engine", count: 1 }, { type: "weapon", count: 2 }, { type: "shield", count: 1 }],
            base_cost: { metal: 2000, crystal: 1000, deuterium: 200 },
            base_build_time: 300
        },
        corvette: {
            name: "Corveta de Patrulha",
            category: "corvette",
            description: "Nave de patrulha balanceada com boa versatilidade.",
            base_stats: { hull: 300, shield: 150, speed: 150, cargo: 50, energy_production: 150, energy_consumption: 0 },
            slots_layout: [{ type: "engine", count: 1 }, { type: "weapon", count: 3 }, { type: "shield", count: 2 }, { type: "armor", count: 1 }],
            base_cost: { metal: 5000, crystal: 2500, deuterium: 500 },
            base_build_time: 600
        },
        frigate: {
            name: "Fragata de Combate",
            category: "frigate",
            description: "Nave de combate média com múltiplos sistemas.",
            base_stats: { hull: 600, shield: 300, speed: 120, cargo: 100, energy_production: 200, energy_consumption: 0 },
            slots_layout: [{ type: "engine", count: 2 }, { type: "weapon", count: 4 }, { type: "shield", count: 2 }, { type: "armor", count: 2 }],
            base_cost: { metal: 10000, crystal: 5000, deuterium: 1000 },
            base_build_time: 1200
        },
        cruiser: {
            name: "Cruzador Pesado",
            category: "cruiser",
            description: "Cruzador de grande porte com alta capacidade de combate.",
            base_stats: { hull: 1200, shield: 600, speed: 90, cargo: 200, energy_production: 300, energy_consumption: 0 },
            slots_layout: [{ type: "engine", count: 2 }, { type: "weapon", count: 6 }, { type: "shield", count: 3 }, { type: "armor", count: 3 }],
            base_cost: { metal: 25000, crystal: 12500, deuterium: 2500 },
            base_build_time: 2400
        },
        transport: {
            name: "Transporte de Carga",
            category: "transport",
            description: "Nave especializada em transporte de recursos.",
            base_stats: { hull: 400, shield: 100, speed: 80, cargo: 1000, energy_production: 120, energy_consumption: 0 },
            slots_layout: [{ type: "engine", count: 1 }, { type: "cargo", count: 4 }, { type: "shield", count: 1 }],
            base_cost: { metal: 8000, crystal: 4000, deuterium: 800 },
            base_build_time: 900
        },
        mining: {
            name: "Nave de Mineração",
            category: "mining",
            description: "Nave equipada para extração eficiente de recursos.",
            base_stats: { hull: 350, shield: 120, speed: 70, cargo: 500, energy_production: 150, energy_consumption: 0 },
            slots_layout: [{ type: "engine", count: 1 }, { type: "mining", count: 3 }, { type: "cargo", count: 2 }, { type: "shield", count: 1 }],
            base_cost: { metal: 12000, crystal: 6000, deuterium: 1200 },
            base_build_time: 1500
        }
    };

    // MODULE TEMPLATES
    const MODULE_TEMPLATES = {
        engine_basic: { name: "Propulsor Iônico Mk-I", type: "engine", description: "Motor de propulsão básico.", level: 1, stats_modifier: { speed: 50, energy_consumption: 20 }, cost: { metal: 500, crystal: 300, deuterium: 50 } },
        engine_advanced: { name: "Propulsor Iônico Mk-II", type: "engine", description: "Motor de propulsão avançado.", level: 3, stats_modifier: { speed: 100, energy_consumption: 35 }, cost: { metal: 1500, crystal: 900, deuterium: 150 } },
        engine_elite: { name: "Propulsor Quântico", type: "engine", description: "Motor de última geração.", level: 5, stats_modifier: { speed: 200, energy_consumption: 50 }, cost: { metal: 5000, crystal: 3000, deuterium: 500 } },
        weapon_laser: { name: "Canhão Laser Mk-I", type: "weapon", description: "Arma laser básica.", level: 1, stats_modifier: { attack: 25, energy_consumption: 15 }, cost: { metal: 800, crystal: 400, deuterium: 100 } },
        weapon_plasma: { name: "Canhão de Plasma", type: "weapon", description: "Arma de plasma avançada.", level: 3, stats_modifier: { attack: 60, energy_consumption: 30 }, cost: { metal: 2500, crystal: 1500, deuterium: 300 } },
        weapon_railgun: { name: "Railgun Magnético", type: "weapon", description: "Arma cinética de alto poder.", level: 5, stats_modifier: { attack: 120, energy_consumption: 45 }, cost: { metal: 6000, crystal: 3500, deuterium: 700 } },
        shield_light: { name: "Escudo Deflector Leve", type: "shield", description: "Proteção energética básica.", level: 1, stats_modifier: { shield: 50, energy_consumption: 10 }, cost: { metal: 600, crystal: 500, deuterium: 80 } },
        shield_medium: { name: "Escudo Deflector Médio", type: "shield", description: "Proteção energética moderada.", level: 3, stats_modifier: { shield: 120, energy_consumption: 20 }, cost: { metal: 1800, crystal: 1500, deuterium: 240 } },
        shield_heavy: { name: "Escudo Deflector Pesado", type: "shield", description: "Proteção energética máxima.", level: 5, stats_modifier: { shield: 250, energy_consumption: 35 }, cost: { metal: 5000, crystal: 4000, deuterium: 600 } },
        armor_reactive: { name: "Blindagem Reativa", type: "armor", description: "Proteção física adaptativa.", level: 2, stats_modifier: { hull: 100 }, cost: { metal: 1200, crystal: 400, deuterium: 0 } },
        armor_composite: { name: "Blindagem Composta", type: "armor", description: "Proteção multicamada avançada.", level: 4, stats_modifier: { hull: 250 }, cost: { metal: 3500, crystal: 1200, deuterium: 0 } },
        cargo_bay: { name: "Compartimento de Carga", type: "cargo", description: "Expansão de capacidade de carga.", level: 1, stats_modifier: { cargo: 200 }, cost: { metal: 1000, crystal: 200, deuterium: 0 } },
        mining_drill: { name: "Broca de Mineração", type: "mining", description: "Equipamento de extração de recursos.", level: 2, stats_modifier: { mining_efficiency: 1.5 }, cost: { metal: 2000, crystal: 1000, deuterium: 300 } }
    };

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
        if (viewMode === 'admin-ships') {
            fetchInitialData(); // Refresh ships list
        }
        if (viewMode === 'admin-modules') {
            fetchInitialData(); // Refresh modules list
        }
        if (viewMode === 'admin-policies') {
            fetchInitialData(); // Refresh policies list
        }
        if (viewMode === 'admin-component-types') {
            fetchInitialData(); // Refresh component types
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

    // --- TEMPLATE & CLONE FUNCTIONS ---
    const applyShipTemplate = (templateKey: keyof typeof SHIP_TEMPLATES, formRef: any) => {
        const template = SHIP_TEMPLATES[templateKey];
        if (formRef.current) {
            formRef.current.name.value = template.name;
            formRef.current.description.value = template.description;
            formRef.current.category.value = template.category;
            formRef.current.base_stats.value = JSON.stringify(template.base_stats, null, 2);
            formRef.current.slots_layout.value = JSON.stringify(template.slots_layout, null, 2);
            formRef.current.base_cost.value = JSON.stringify(template.base_cost, null, 2);
            formRef.current.base_build_time.value = template.base_build_time;
        }
        showToast(`Template "${template.name}" aplicado!`, "success");
    };

    const applyModuleTemplate = (templateKey: keyof typeof MODULE_TEMPLATES, formRef: any) => {
        const template = MODULE_TEMPLATES[templateKey];
        if (formRef.current) {
            formRef.current.name.value = template.name;
            formRef.current.type.value = template.type;
            formRef.current.description.value = template.description;
            formRef.current.level.value = template.level;
            formRef.current.stats_modifier.value = JSON.stringify(template.stats_modifier, null, 2);
            formRef.current.cost.value = JSON.stringify(template.cost, null, 2);
        }
        showToast(`Template "${template.name}" aplicado!`, "success");
    };

    const cloneShip = (ship: any, formRef: any) => {
        if (formRef.current) {
            formRef.current.name.value = ship.name + " (Cópia)";
            formRef.current.description.value = ship.description;
            formRef.current.category.value = ship.category;
            formRef.current.image_url.value = ship.image_url || "";
            formRef.current.base_stats.value = JSON.stringify(ship.base_stats, null, 2);
            formRef.current.slots_layout.value = JSON.stringify(ship.slots_layout, null, 2);
            formRef.current.base_cost.value = JSON.stringify(ship.base_cost, null, 2);
            formRef.current.base_build_time.value = ship.base_build_time;
        }
        showToast("Nave clonada! Ajuste o nome e salve.", "info");
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cloneModule = (module: any, formRef: any) => {
        if (formRef.current) {
            formRef.current.name.value = module.name + " (Cópia)";
            formRef.current.type.value = module.type;
            formRef.current.description.value = module.description;
            formRef.current.level.value = module.level;
            formRef.current.stats_modifier.value = JSON.stringify(module.stats_modifier, null, 2);
            formRef.current.cost.value = JSON.stringify(module.cost, null, 2);
            formRef.current.image_url.value = module.image_url || "";
        }
        showToast("Módulo clonado! Ajuste o nome e salve.", "info");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- FILTER FUNCTIONS ---
    const getFilteredShips = () => {
        return ships.filter(ship => {
            const matchesSearch = ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ship.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === "all" || ship.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    };

    const getFilteredModules = () => {
        return modules.filter(module => {
            const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                module.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === "all" || module.type === filterType;
            return matchesSearch && matchesType;
        });
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
                        <>
                            <div className="h-6 w-px bg-space-steel/50 mx-1"></div>
                            <Button
                                variant={viewMode === 'admin-ships' ? 'primary' : 'ghost'}
                                onClick={() => { setViewMode('admin-ships'); setSelectedShip(null); }}
                                icon={<Rocket size={14} />}
                                size="sm"
                            >
                                NAVES
                            </Button>
                            <Button
                                variant={viewMode === 'admin-modules' ? 'primary' : 'ghost'}
                                onClick={() => { setViewMode('admin-modules'); setSelectedShip(null); }}
                                icon={<Cpu size={14} />}
                                size="sm"
                            >
                                MÓDULOS
                            </Button>
                            <Button
                                variant={viewMode === 'admin-policies' ? 'primary' : 'ghost'}
                                onClick={() => { setViewMode('admin-policies'); setSelectedShip(null); }}
                                icon={<Settings size={14} />}
                                size="sm"
                            >
                                POLÍTICAS
                            </Button>
                            <Button
                                variant={viewMode === 'admin-component-types' ? 'primary' : 'ghost'}
                                onClick={() => { setViewMode('admin-component-types'); setSelectedShip(null); }}
                                icon={<Box size={14} />}
                                size="sm"
                            >
                                TIPOS
                            </Button>
                        </>
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
            ) : viewMode === 'admin-ships' ? (() => {
                /* ADMIN: SHIPS MANAGEMENT */
                const shipFormRef = React.useRef<any>(null);
                const filteredShips = getFilteredShips();

                return (
                    <div className="space-y-6">
                        {/* TEMPLATES SECTION */}
                        <Card title="🚀 Templates Rápidos de Naves">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                {Object.entries(SHIP_TEMPLATES).map(([key, template]) => (
                                    <Button
                                        key={key}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => applyShipTemplate(key as keyof typeof SHIP_TEMPLATES, shipFormRef)}
                                        className="flex flex-col items-center gap-1 h-auto py-3"
                                    >
                                        <Rocket size={20} className="text-space-neon" />
                                        <span className="text-[10px] text-center">{template.name}</span>
                                        <Badge className="text-[8px] mt-1">{template.category}</Badge>
                                    </Button>
                                ))}
                            </div>
                        </Card>

                        {/* CREATE FORM */}
                        <Card title="Adicionar Nova Nave">
                            <form ref={shipFormRef} onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as any;
                                try {
                                    const data = {
                                        name: form.name.value,
                                        description: form.description.value,
                                        category: form.category.value,
                                        image_url: form.image_url.value,
                                        base_stats: JSON.parse(form.base_stats.value || '{}'),
                                        slots_layout: JSON.parse(form.slots_layout.value || '[]'),
                                        base_cost: JSON.parse(form.base_cost.value || '{}'),
                                        base_build_time: parseInt(form.base_build_time.value)
                                    };

                                    // Validation
                                    if (!data.base_stats.hull || data.base_stats.hull <= 0) {
                                        showToast("Hull deve ser maior que 0", "error");
                                        return;
                                    }
                                    if (!data.slots_layout || data.slots_layout.length === 0) {
                                        showToast("Nave deve ter pelo menos 1 slot", "error");
                                        return;
                                    }

                                    createItem('ships', data, fetchInitialData);
                                    form.reset();
                                } catch (err: any) {
                                    showToast("Erro no JSON: " + err.message, "error");
                                }
                            }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input name="name" placeholder="Nome da Nave" required />
                                <select name="category" className="bg-space-black border border-space-steel rounded p-2 text-white">
                                    <option value="fighter">Caça (Fighter)</option>
                                    <option value="corvette">Corveta</option>
                                    <option value="frigate">Fragata</option>
                                    <option value="destroyer">Destroyer</option>
                                    <option value="cruiser">Cruzador</option>
                                    <option value="battleship">Couraçado</option>
                                    <option value="capital">Capital</option>
                                    <option value="transport">Transporte</option>
                                    <option value="mining">Mineração</option>
                                </select>
                                <Input name="image_url" placeholder="URL da Imagem" />
                                <Input name="base_build_time" type="number" placeholder="Tempo de Construção (segundos)" required />
                                <div className="col-span-2">
                                    <Input name="description" placeholder="Descrição" />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs text-space-neon mb-1 block">Stats Base (JSON)</label>
                                    <textarea
                                        name="base_stats"
                                        className="w-full bg-space-black border border-space-steel rounded p-2 font-mono text-xs h-24"
                                        defaultValue='{"hull": 100, "shield": 50, "speed": 100, "cargo": 0, "energy_production": 100, "energy_consumption": 0}'
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs text-space-neon mb-1 block">Slots Layout (JSON)</label>
                                    <textarea
                                        name="slots_layout"
                                        className="w-full bg-space-black border border-space-steel rounded p-2 font-mono text-xs h-24"
                                        defaultValue='[{"type":"engine", "count": 1}, {"type":"weapon", "count": 2}]'
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-space-neon mb-1 block">Custo Base (JSON)</label>
                                    <textarea
                                        name="base_cost"
                                        className="w-full bg-space-black border border-space-steel rounded p-2 font-mono text-xs h-16"
                                        defaultValue='{"metal": 1000, "crystal": 500, "deuterium": 100}'
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Button type="submit" variant="primary" className="w-full">CRIAR NAVE</Button>
                                </div>
                            </form>
                        </Card>

                        {/* SEARCH AND FILTERS */}
                        <div className="flex gap-4 items-center bg-space-dark/30 p-4 rounded-lg border border-space-steel">
                            <Input
                                placeholder="🔍 Buscar naves..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="bg-space-black border border-space-steel rounded p-2 text-white text-sm"
                            >
                                <option value="all">Todas Categorias</option>
                                <option value="fighter">Caça</option>
                                <option value="corvette">Corveta</option>
                                <option value="frigate">Fragata</option>
                                <option value="cruiser">Cruzador</option>
                                <option value="transport">Transporte</option>
                                <option value="mining">Mineração</option>
                            </select>
                            <Badge className="bg-space-neon/20 text-space-neon">
                                {filteredShips.length} naves
                            </Badge>
                        </div>

                        {/* SHIPS LIST */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredShips.map(ship => (
                                <div key={ship.id} className="border border-space-steel bg-space-dark/50 p-4 rounded relative group hover:border-space-neon transition-all">
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => cloneShip(ship, shipFormRef)}
                                            className="p-1.5 text-space-neon hover:bg-space-neon/20 rounded"
                                            title="Clonar"
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <button
                                            onClick={() => deleteItem('ships', ship.id, fetchInitialData)}
                                            className="p-1.5 text-space-alert hover:bg-space-alert/20 rounded"
                                            title="Deletar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-space-black rounded border border-space-steel overflow-hidden flex items-center justify-center">
                                            {ship.image_url ? <img src={ship.image_url} className="w-full h-full object-cover" /> : <Rocket size={20} className="text-space-muted" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white">{ship.name}</h4>
                                            <Badge>{ship.category}</Badge>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-space-muted mb-2 line-clamp-2">{ship.description}</p>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-space-muted">
                                        {Object.entries(ship.base_stats).slice(0, 4).map(([k, v]) => (
                                            <div key={k}>{k.toUpperCase()}: <span className="text-white">{String(v)}</span></div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-[10px] text-space-neon">
                                        {ship.slots_layout.length} slots
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })() : viewMode === 'admin-modules' ? (() => {
                /* ADMIN: MODULES MANAGEMENT */
                const moduleFormRef = React.useRef<any>(null);
                const filteredModules = getFilteredModules();

                return (
                    <div className="space-y-6">
                        {/* TEMPLATES SECTION */}
                        <Card title="⚙️ Templates Rápidos de Módulos">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {Object.entries(MODULE_TEMPLATES).slice(0, 12).map(([key, template]) => (
                                    <Button
                                        key={key}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => applyModuleTemplate(key as keyof typeof MODULE_TEMPLATES, moduleFormRef)}
                                        className="flex flex-col items-center gap-1 h-auto py-3"
                                    >
                                        <Cpu size={16} className="text-space-neon" />
                                        <span className="text-[9px] text-center line-clamp-2">{template.name}</span>
                                        <Badge className="text-[7px] mt-1">Lvl {template.level}</Badge>
                                    </Button>
                                ))}
                            </div>
                        </Card>

                        {/* CREATE FORM */}
                        <Card title="Adicionar Novo Módulo">
                            <form ref={moduleFormRef} onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as any;
                                try {
                                    const data = {
                                        name: form.name.value,
                                        type: form.type.value,
                                        description: form.description.value,
                                        level: parseInt(form.level.value),
                                        stats_modifier: JSON.parse(form.stats_modifier.value || '{}'),
                                        cost: JSON.parse(form.cost.value || '{}'),
                                        image_url: form.image_url.value
                                    };

                                    // Validation
                                    if (data.level < 1) {
                                        showToast("Nível deve ser pelo menos 1", "error");
                                        return;
                                    }

                                    createItem('ship_modules', data, fetchInitialData);
                                    form.reset();
                                } catch (err: any) {
                                    showToast("Erro no JSON: " + err.message, "error");
                                }
                            }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input name="name" placeholder="Nome do Módulo" required />
                                <select name="type" className="bg-space-black border border-space-steel rounded p-2 text-white">
                                    <option value="engine">Motor</option>
                                    <option value="weapon">Arma</option>
                                    <option value="shield">Escudo</option>
                                    <option value="armor">Blindagem</option>
                                    <option value="cargo">Carga</option>
                                    <option value="mining">Mineração</option>
                                    <option value="special">Especial</option>
                                </select>
                                <Input name="level" type="number" placeholder="Nível / Tech Level" defaultValue="1" />
                                <Input name="image_url" placeholder="URL da Imagem Ícone" />
                                <div className="col-span-2">
                                    <Input name="description" placeholder="Descrição" />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs text-space-neon mb-1 block">Modificadores (JSON)</label>
                                    <textarea
                                        name="stats_modifier"
                                        className="w-full bg-space-black border border-space-steel rounded p-2 font-mono text-xs h-24"
                                        defaultValue='{"speed": 50, "energy_consumption": 20}'
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs text-space-neon mb-1 block">Custo (JSON)</label>
                                    <textarea
                                        name="cost"
                                        className="w-full bg-space-black border border-space-steel rounded p-2 font-mono text-xs h-24"
                                        defaultValue='{"metal": 500, "crystal": 300, "deuterium": 50}'
                                    />
                                </div>

                                <div className="col-span-2">
                                    <Button type="submit" variant="primary" className="w-full">CRIAR MÓDULO</Button>
                                </div>
                            </form>
                        </Card>

                        {/* SEARCH AND FILTERS */}
                        <div className="flex gap-4 items-center bg-space-dark/30 p-4 rounded-lg border border-space-steel">
                            <Input
                                placeholder="🔍 Buscar módulos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                            />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="bg-space-black border border-space-steel rounded p-2 text-white text-sm"
                            >
                                <option value="all">Todos Tipos</option>
                                <option value="engine">Motor</option>
                                <option value="weapon">Arma</option>
                                <option value="shield">Escudo</option>
                                <option value="armor">Blindagem</option>
                                <option value="cargo">Carga</option>
                                <option value="mining">Mineração</option>
                                <option value="special">Especial</option>
                            </select>
                            <Badge className="bg-space-neon/20 text-space-neon">
                                {filteredModules.length} módulos
                            </Badge>
                        </div>

                        {/* MODULES LIST */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredModules.map(mod => (
                                <div key={mod.id} className="border border-space-steel bg-space-dark/50 p-3 rounded relative group flex flex-col gap-2 hover:border-space-neon transition-all">
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => cloneModule(mod, moduleFormRef)}
                                            className="p-1 text-space-neon hover:bg-space-neon/20 rounded"
                                            title="Clonar"
                                        >
                                            <Plus size={12} />
                                        </button>
                                        <button
                                            onClick={() => deleteItem('ship_modules', mod.id, fetchInitialData)}
                                            className="p-1 text-space-alert hover:bg-space-alert/20 rounded"
                                            title="Deletar"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge color="bg-blue-900/50 text-blue-300">{mod.type}</Badge>
                                        <Badge className="text-[8px]">Lvl {mod.level}</Badge>
                                    </div>
                                    <span className="font-bold text-white text-sm">{mod.name}</span>
                                    <p className="text-[10px] text-space-muted line-clamp-2">{mod.description}</p>
                                    <div className="text-[9px] font-mono bg-space-black p-1 rounded">
                                        {JSON.stringify(mod.stats_modifier).slice(0, 40)}...
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })() : viewMode === 'admin-policies' ? (
                /* ADMIN: POLICIES MANAGEMENT */
                <div className="space-y-6">
                    <Card title="Gerenciar Políticas & Bônus">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as any;
                            const data = {
                                name: form.name.value,
                                type: form.type.value,
                                description: form.description.value,
                                modifiers: JSON.parse(form.modifiers.value || '{}'),
                                is_active: true
                            };
                            createItem('policies', data, fetchInitialData);
                            form.reset();
                        }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="name" placeholder="Nome da Política" required />
                            <select name="type" className="bg-space-black border border-space-steel rounded p-2 text-white">
                                <option value="government">Governo</option>
                                <option value="empire">Império</option>
                                <option value="event">Evento Global</option>
                            </select>
                            <div className="col-span-2">
                                <Input name="description" placeholder="Descrição do efeito" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-space-neon mb-1 block">Modificadores (JSON)</label>
                                <textarea name="modifiers" className="w-full bg-space-black border border-space-steel rounded p-2 font-mono text-xs h-24" placeholder='{"build_time_pct": -0.1, "resource_cost_pct": 0.05}' defaultValue='{"build_time_pct": -0.1}' />
                                <span className="text-[10px] text-space-muted">Use sufixo _pct para percentuais (0.1 = +10%)</span>
                            </div>
                            <Button type="submit" variant="primary" className="col-span-2">CRIAR POLÍTICA</Button>
                        </form>
                    </Card>

                    <div className="space-y-2">
                        {activePolicies.map(pol => (
                            <div key={pol.id} className="flex justify-between items-center bg-space-dark/30 border border-space-steel p-3 rounded">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-white">{pol.name}</h4>
                                        <Badge color={pol.type === 'government' ? 'bg-purple-900/50 text-purple-300' : 'bg-yellow-900/50 text-yellow-300'}>{pol.type}</Badge>
                                    </div>
                                    <p className="text-xs text-space-muted">{pol.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-xs text-space-neon">{JSON.stringify(pol.modifiers)}</span>
                                    <button onClick={() => deleteItem('policies', pol.id, fetchInitialData)} className="text-space-alert hover:bg-space-alert/20 p-1 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : viewMode === 'admin-component-types' ? (
                /* ADMIN: COMPONENT TYPES INFO */
                <div className="space-y-6">
                    <Card title="Tipos de Componentes Disponíveis">
                        <div className="bg-space-dark/30 border border-space-neon/30 p-4 rounded-lg mb-4">
                            <h4 className="text-space-neon font-display font-bold mb-2 flex items-center gap-2">
                                <Box size={20} />
                                Gerenciamento de Tipos de Componentes
                            </h4>
                            <p className="text-sm text-space-muted mb-3">
                                Os tipos de componentes definem as categorias de módulos que podem ser equipados nas naves.
                                Cada tipo tem características específicas e slots dedicados.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { type: 'engine', label: 'Motor', icon: '🚀', description: 'Sistemas de propulsão e velocidade', color: 'bg-blue-900/50 text-blue-300 border-blue-500/30' },
                                { type: 'weapon', label: 'Arma', icon: '⚔️', description: 'Sistemas ofensivos e armamentos', color: 'bg-red-900/50 text-red-300 border-red-500/30' },
                                { type: 'shield', label: 'Escudo', icon: '🛡️', description: 'Sistemas de proteção energética', color: 'bg-cyan-900/50 text-cyan-300 border-cyan-500/30' },
                                { type: 'armor', label: 'Blindagem', icon: '🔰', description: 'Proteção física e estrutural', color: 'bg-gray-700/50 text-gray-300 border-gray-500/30' },
                                { type: 'cargo', label: 'Carga', icon: '📦', description: 'Compartimentos de armazenamento', color: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30' },
                                { type: 'mining', label: 'Mineração', icon: '⛏️', description: 'Equipamentos de extração de recursos', color: 'bg-orange-900/50 text-orange-300 border-orange-500/30' },
                                { type: 'special', label: 'Especial', icon: '✨', description: 'Módulos únicos e experimentais', color: 'bg-purple-900/50 text-purple-300 border-purple-500/30' }
                            ].map(componentType => {
                                const moduleCount = modules.filter(m => m.type === componentType.type).length;
                                return (
                                    <div key={componentType.type} className={`border ${componentType.color} p-4 rounded-lg`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-2xl">{componentType.icon}</div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white font-display">{componentType.label}</h4>
                                                <Badge className="text-[10px] mt-1">{componentType.type.toUpperCase()}</Badge>
                                            </div>
                                        </div>
                                        <p className="text-xs text-space-muted mb-3">{componentType.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-space-muted">Módulos:</span>
                                            <span className="font-bold text-white font-mono">{moduleCount}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card title="Estatísticas por Tipo">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-space-steel">
                                        <th className="text-left py-2 px-3 text-space-neon font-display">Tipo</th>
                                        <th className="text-center py-2 px-3 text-space-neon font-display">Total Módulos</th>
                                        <th className="text-center py-2 px-3 text-space-neon font-display">Nível Médio</th>
                                        <th className="text-left py-2 px-3 text-space-neon font-display">Naves Compatíveis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['engine', 'weapon', 'shield', 'armor', 'cargo', 'mining', 'special'].map(type => {
                                        const typeModules = modules.filter(m => m.type === type);
                                        const avgLevel = typeModules.length > 0
                                            ? (typeModules.reduce((sum, m) => sum + (m.level || 1), 0) / typeModules.length).toFixed(1)
                                            : '0';
                                        const compatibleShips = ships.filter(s =>
                                            s.slots_layout.some((slot: any) => slot.type === type)
                                        ).length;

                                        return (
                                            <tr key={type} className="border-b border-space-steel/30 hover:bg-space-white/5">
                                                <td className="py-2 px-3">
                                                    <Badge className="bg-space-steel/50">{type}</Badge>
                                                </td>
                                                <td className="text-center py-2 px-3 font-mono text-white">{typeModules.length}</td>
                                                <td className="text-center py-2 px-3 font-mono text-white">{avgLevel}</td>
                                                <td className="py-2 px-3 font-mono text-space-muted">{compatibleShips} naves</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
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
            )}
        </div >
    );
}
