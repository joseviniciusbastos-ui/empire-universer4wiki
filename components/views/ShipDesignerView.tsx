import React, { useState, useEffect } from 'react';
import { Rocket, Shield, Zap, Crosshair, Save, RotateCcw, Box, ShieldAlert, X } from 'lucide-react';
// --- MANUAL POLICY STATE ---
const [userPolicies, setUserPolicies] = useState({
    metal_cost_pct: 0,
    crystal_cost_pct: 0,
    deuterium_cost_pct: 0,
    build_time_pct: 0,
    speed_pct: 0,
    attack_pct: 0,
    shield_pct: 0
});
const [showPolicyInput, setShowPolicyInput] = useState(false);

// --- ADMIN STATE ---
const [adminView, setAdminView] = useState<'ships' | 'modules' | 'policies' | null>(null);

// --- WELCOME MODAL STATE ---
const [showWelcome, setShowWelcome] = useState(true);

useEffect(() => {
    if (selectedShip) {
        calculateStats();
    }
}, [slots, selectedShip, activePolicies, userPolicies]);

// ... existing load/save logic ...

const calculateStats = () => {
    if (!selectedShip) return;

    let stats = { ...selectedShip.base_stats };
    let cost = { ...selectedShip.base_cost };
    let currentWarnings: string[] = [];
    let modifiersLog: any = {};

    // 1. Add Module Stats (Existing Logic)
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

    // 2. Apply Global Policies (Existing Logic)
    activePolicies.forEach(policy => {
        if (policy.modifiers) {
            Object.entries(policy.modifiers).forEach(([key, value]: [string, any]) => {
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
            });
        }
    });

    // 3. Apply User Manual Policies
    Object.entries(userPolicies).forEach(([key, value]) => {
        if (value === 0) return;
        // value is integer percentage (e.g. 10 for 10%)
        const pct = value / 100;
        const targetStat = key.replace('_pct', '').replace('_cost', ''); // simplificacao

        // Mapeamento manual para garantir integridade
        if (key === 'metal_cost_pct') cost.metal += cost.metal * pct;
        if (key === 'crystal_cost_pct') cost.crystal += cost.crystal * pct;
        if (key === 'deuterium_cost_pct') cost.deuterium += cost.deuterium * pct;

        // Stats
        if (stats[targetStat] !== undefined) {
            stats[targetStat] += stats[targetStat] * pct;
        } else if (key === 'speed_pct' && stats.speed) stats.speed += stats.speed * pct;
        else if (key === 'shield_pct' && stats.shield) stats.shield += stats.shield * pct;
        else if (key === 'attack_pct' && stats.attack) stats.attack += stats.attack * pct; // assuming attack exists

        modifiersLog['MANUAL'] = (modifiersLog['MANUAL'] || []).concat(`${key}: ${value}%`);
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

// ... Admin Logic Ported ...
const createItem = async (table: string, data: any, refresh: () => void) => {
    const { error } = await supabase.from(table).insert([data]);
    if (!error) { showToast("Criado!", "success"); refresh(); }
    else { showToast("Erro: " + error.message, "error"); }
};
const deleteItem = async (table: string, id: string, refresh: () => void) => {
    if (!confirm("Confirmar exclusão?")) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) { showToast("Deletado.", "success"); refresh(); }
    else { showToast("Erro: " + error.message, "error"); }
};

const renderWelcome = () => (
    <div className="bg-space-dark border border-space-neon p-6 rounded-xl mb-6 flex items-start gap-4 relative">
        <div className="bg-space-neon/10 p-4 rounded-full border border-space-neon/30">
            <Rocket size={32} className="text-space-neon" />
        </div>
        <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-white mb-2">Bem-vindo ao Estaleiro Imperial</h3>
            <p className="text-sm text-space-muted mb-4 font-mono leading-relaxed">
                Comandante, esta interface permite projetar as naves que comporão nossa frota.
                <br />1. Selecione um <strong>Chassi</strong> base.
                <br />2. Equipe <strong>Módulos</strong> nos hardpoints disponíveis.
                <br />3. Ajuste suas <strong>Tecnologias</strong> manualmente para ver os custos reais.
            </p>
            <Button size="sm" variant="secondary" onClick={() => setShowWelcome(false)}>ENTENDIDO, DISPENSAR INTRODUÇÃO</Button>
        </div>
        <button onClick={() => setShowWelcome(false)} className="absolute top-2 right-2 text-space-muted hover:text-white"><X size={16} /></button>
    </div>
);

const renderAdminTools = () => (
    <div className="bg-space-black/50 border border-space-alert/30 p-4 rounded-xl mt-8">
        <div className="flex items-center gap-2 mb-4 border-b border-space-steel/30 pb-2">
            <ShieldAlert className="text-space-alert" size={20} />
            <h3 className="text-space-alert font-bold font-display uppercase">Comando de Engenharia (Admin)</h3>
        </div>
        <div className="flex gap-2 mb-4">
            <Button size="sm" variant={adminView === 'ships' ? 'primary' : 'ghost'} onClick={() => setAdminView('ships')}>NAVES</Button>
            <Button size="sm" variant={adminView === 'modules' ? 'primary' : 'ghost'} onClick={() => setAdminView('modules')}>MÓDULOS</Button>
            <Button size="sm" variant={adminView === 'policies' ? 'primary' : 'ghost'} onClick={() => setAdminView('policies')}>POLÍTICAS</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdminView(null)}>FECHAR</Button>
        </div>

        {/* Simple Render for Admin Forms (Simplified for brevity, reusing concepts) */}
        {adminView === 'ships' && (
            <div className="space-y-4">
                <p className="text-xs text-space-muted mb-2">Adicionar novo chassi ao banco de dados.</p>
                <form onSubmit={(e: any) => {
                    e.preventDefault();
                    createItem('ships', {
                        name: e.target.name.value,
                        category: 'fighter', // simplified default
                        base_stats: JSON.parse(e.target.base_stats.value),
                        slots_layout: JSON.parse(e.target.slots_layout.value),
                        base_cost: JSON.parse(e.target.base_cost.value),
                        base_build_time: 100
                    }, fetchInitialData);
                    e.target.reset();
                }} className="grid gap-2">
                    <Input name="name" placeholder="Nome da Nave" required />
                    <textarea name="base_stats" className="bg-space-black border border-space-steel text-xs p-2 h-20" placeholder='Stats JSON: {"hull": 100}' defaultValue='{"hull": 100, "shield": 50, "speed": 100}' />
                    <textarea name="slots_layout" className="bg-space-black border border-space-steel text-xs p-2 h-20" placeholder='Layout JSON' defaultValue='[{"type":"weapon", "count": 1}]' />
                    <textarea name="base_cost" className="bg-space-black border border-space-steel text-xs p-2 h-20" placeholder='Cost JSON' defaultValue='{"metal": 1000}' />
                    <Button type="submit" variant="secondary">CRIAR NAVE (SIMPLIFICADO)</Button>
                </form>
            </div>
        )}
        {adminView === 'modules' && (
            <div className="space-y-4">
                <p className="text-xs text-space-muted mb-2">Adicionar novo módulo.</p>
                <form onSubmit={(e: any) => {
                    e.preventDefault();
                    createItem('ship_modules', {
                        name: e.target.name.value,
                        type: e.target.type.value,
                        stats_modifier: JSON.parse(e.target.stats_modifier.value),
                        cost: JSON.parse(e.target.cost.value),
                        level: 1
                    }, fetchInitialData);
                    e.target.reset();
                }} className="grid gap-2">
                    <Input name="name" placeholder="Nome do Módulo" required />
                    <select name="type" className="bg-space-black border border-space-steel p-2 text-xs text-white">
                        <option value="weapon">Arma</option>
                        <option value="shield">Escudo</option>
                        <option value="engine">Motor</option>
                    </select>
                    <textarea name="stats_modifier" className="bg-space-black border border-space-steel text-xs p-2 h-20" placeholder='Stats JSON' defaultValue='{"attack": 10}' />
                    <textarea name="cost" className="bg-space-black border border-space-steel text-xs p-2 h-20" placeholder='Cost JSON' defaultValue='{"metal": 500}' />
                    <Button type="submit" variant="secondary">CRIAR MÓDULO</Button>
                </form>
            </div>
        )}
        {/* List cleanup for Admin */}
        {adminView && (
            <div className="mt-4 border-t border-space-steel/30 pt-4">
                <h4 className="text-xs font-bold text-white mb-2 uppercase">Itens Existentes ({adminView})</h4>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {(adminView === 'ships' ? ships : adminView === 'modules' ? modules : activePolicies).map((item: any) => (
                        <div key={item.id} className="flex justify-between bg-space-dark p-2 rounded text-xs">
                            <span>{item.name}</span>
                            <button onClick={() => deleteItem(adminView === 'modules' ? 'ship_modules' : adminView!, item.id, fetchInitialData)} className="text-red-500"><Trash2 size={12} /></button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

return (
    <div className="space-y-6 animate-fade-in relative z-10 w-full max-w-7xl mx-auto p-4">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-space-steel pb-4">
            <div>
                <h2 className="text-3xl font-display font-bold uppercase flex items-center gap-3 text-white">
                    <Rocket className="text-space-neon" /> Estaleiro Virtual
                </h2>
            </div>

            <div className="flex gap-2">
                <Button variant={viewMode === 'designer' ? 'primary' : 'ghost'} onClick={() => { setViewMode('designer'); setSelectedShip(null); }}>PROJETISTA</Button>
                <Button variant={viewMode === 'hangar' ? 'primary' : 'ghost'} onClick={() => { setViewMode('hangar'); setSelectedShip(null); }}>MEU HANGAR</Button>
            </div>

            {selectedShip && viewMode === 'designer' && (
                <div className="flex gap-4">
                    {/* Stats Summary Top Right */}
                    <div className="text-right hidden md:block">
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

        {/* WELCOME MESSAGE */}
        {showWelcome && viewMode === 'designer' && !selectedShip && renderWelcome()}

        {isLoading ? (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin text-space-neon"><Rocket size={32} /></div>
                <span className="ml-3 text-space-mono text-space-muted">Carregando esquemáticas...</span>
            </div>
        ) : viewMode === 'hangar' ? (
            /* HANGAR VIEW (Existing) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDesigns.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-space-muted opacity-50">
                        <Rocket size={48} className="mx-auto mb-2" />
                        Nenhum projeto salvo.
                    </div>
                ) : (
                    savedDesigns.map(design => (
                        <div key={design.id} className="bg-space-dark border border-space-steel p-4 rounded-xl group hover:border-space-neon transition-all">
                            {/* ... Hangar Card Content (Same as before) ... */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ... Existing Ship Map ... */}
                    {ships.map(ship => (
                        <div key={ship.id}
                            onClick={() => setSelectedShip(ship)}
                            className="group relative bg-space-dark/60 border border-space-steel hover:border-space-neon rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                            {/* ... Ship Card ... */}
                            <div className="h-48 bg-black/50 relative">
                                {ship.image_url ? (
                                    <img src={ship.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-space-muted"><Rocket size={48} /></div>
                                )}
                                <div className="absolute top-2 right-2"><Badge className="bg-space-black/80">{ship.category}</Badge></div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-white font-display mb-1">{ship.name}</h3>
                                <p className="text-xs text-space-muted mb-4 h-10 overflow-hidden">{ship.description}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                    <div className="flex justify-between bg-space-black/30 p-1.5 rounded"><span className="text-space-muted">HULL</span><span className="text-white">{ship.base_stats.hull}</span></div>
                                    <div className="flex justify-between bg-space-black/30 p-1.5 rounded"><span className="text-space-muted">SHIELD</span><span className="text-blue-300">{ship.base_stats.shield}</span></div>
                                    <div className="col-span-2 flex justify-between bg-space-black/30 p-1.5 rounded"><span className="text-space-neon">{ship.slots_layout.length} HARDPOINTS</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ADMIN TOOLS (Only visible if Admin) */}
                {currentUser?.role === 'ADMIN' && renderAdminTools()}
            </>
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

                {/* RIGHT COLUMN: STATS & POLICIES */}
                <div className="w-full lg:w-80 space-y-4">
                    <Card className="border-space-neon/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-display font-bold text-white">Análise</h3>
                            <button onClick={() => setShowPolicyInput(!showPolicyInput)} className="text-[10px] text-space-neon hover:underline">
                                {showPolicyInput ? 'OCULTAR TECH' : 'AJUSTAR TECH'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Warnings */}
                            {warnings.length > 0 && (
                                <div className="bg-space-alert/20 border border-space-alert p-3 rounded text-space-alert text-xs font-mono mb-4">
                                    <strong className="block mb-1 flex items-center gap-2"><ShieldAlert size={14} /> ALERTAS DO SISTEMA</strong>
                                    <ul className="list-disc list-inside">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                                </div>
                            )}

                            {/* MANUAL POLICY INPUTS */}
                            {showPolicyInput && (
                                <div className="bg-space-black/50 p-3 rounded border border-space-steel animate-fade-in">
                                    <p className="text-[10px] text-space-muted mb-2 uppercase">Ajuste seus bônus (%)</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(userPolicies).map(([key, val]) => (
                                            <div key={key}>
                                                <label className="text-[9px] text-space-muted block">{key.replace('_pct', '').replace('_', ' ')}</label>
                                                <input
                                                    type="number"
                                                    value={val}
                                                    onChange={(e) => setUserPolicies({ ...userPolicies, [key]: Number(e.target.value) })}
                                                    className="w-full bg-space-dark border border-space-steel rounded px-1 text-xs text-right text-white"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STATS LIST */}
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
    </div>
);
}
