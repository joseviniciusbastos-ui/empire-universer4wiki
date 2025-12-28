import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button, Card, Badge, Input } from '../ui/Shared';
import { Rocket, Cpu, Settings, Box, Plus, Trash2, Edit2, Save, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface ShipyardManagerProps {
    ships: any[];
    modules: any[];
    policies: any[];
    onRefresh: () => void;
}

export const ShipyardManager: React.FC<ShipyardManagerProps> = ({ ships, modules, policies, onRefresh }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'ships' | 'modules' | 'policies'>('ships');
    const [isEditing, setIsEditing] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [shipForm, setShipForm] = useState({
        name: '',
        category: 'fighter',
        description: '',
        image_url: '',
        base_build_time: 300,
        hull: 100,
        shield: 50,
        speed: 100,
        cargo: 0,
        slots: '[{"type":"engine", "count": 1}, {"type":"weapon", "count": 2}]',
        metal: 1000,
        crystal: 500,
        deuterium: 100
    });

    const [moduleForm, setModuleForm] = useState({
        name: '',
        type: 'weapon',
        level: 1,
        description: '',
        image_url: '',
        stats: '{}',
        cost: '{"metal": 500, "crystal": 200}'
    });

    const [policyForm, setPolicyForm] = useState({
        name: '',
        type: 'government',
        description: '',
        modifiers: '{"build_time_pct": -0.1}',
        is_active: true
    });

    const resetForms = () => {
        setShipForm({
            name: '',
            category: 'fighter',
            description: '',
            image_url: '',
            base_build_time: 300,
            hull: 100,
            shield: 50,
            speed: 100,
            cargo: 0,
            slots: '[{"type":"engine", "count": 1}, {"type":"weapon", "count": 2}]',
            metal: 1000,
            crystal: 500,
            deuterium: 100
        });
        setModuleForm({
            name: '',
            type: 'weapon',
            level: 1,
            description: '',
            image_url: '',
            stats: '{}',
            cost: '{"metal": 500, "crystal": 200}'
        });
        setPolicyForm({
            name: '',
            type: 'government',
            description: '',
            modifiers: '{"build_time_pct": -0.1}',
            is_active: true
        });
        setIsEditing(null);
    };

    const handleEditItem = (item: any, type: 'ship' | 'module' | 'policy') => {
        setIsEditing(item);
        if (type === 'ship') {
            setShipForm({
                name: item.name,
                category: item.category,
                description: item.description || '',
                image_url: item.image_url || '',
                base_build_time: item.base_build_time,
                hull: item.base_stats.hull || 0,
                shield: item.base_stats.shield || 0,
                speed: item.base_stats.speed || 0,
                cargo: item.base_stats.cargo || 0,
                slots: JSON.stringify(item.slots_layout),
                metal: item.base_cost.metal || 0,
                crystal: item.base_cost.crystal || 0,
                deuterium: item.base_cost.deuterium || 0
            });
            setActiveTab('ships');
        } else if (type === 'module') {
            setModuleForm({
                name: item.name,
                type: item.type,
                level: item.level,
                description: item.description || '',
                image_url: item.image_url || '',
                stats: JSON.stringify(item.stats_modifier),
                cost: JSON.stringify(item.cost)
            });
            setActiveTab('modules');
        } else if (type === 'policy') {
            setPolicyForm({
                name: item.name,
                type: item.type,
                description: item.description || '',
                modifiers: JSON.stringify(item.modifiers),
                is_active: item.is_active
            });
            setActiveTab('policies');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const saveShip = async () => {
        setIsLoading(true);
        try {
            const data = {
                name: shipForm.name,
                category: shipForm.category,
                description: shipForm.description,
                image_url: shipForm.image_url,
                base_build_time: shipForm.base_build_time,
                base_stats: {
                    hull: shipForm.hull,
                    shield: shipForm.shield,
                    speed: shipForm.speed,
                    cargo: shipForm.cargo
                },
                base_cost: {
                    metal: shipForm.metal,
                    crystal: shipForm.crystal,
                    deuterium: shipForm.deuterium
                },
                slots_layout: JSON.parse(shipForm.slots)
            };

            if (isEditing) {
                const { error } = await supabase.from('ships').update(data).eq('id', isEditing.id);
                if (error) throw error;
                showToast("Nave atualizada com sucesso!", "success");
            } else {
                const { error } = await supabase.from('ships').insert([data]);
                if (error) throw error;
                showToast("Nave criada com sucesso!", "success");
            }
            resetForms();
            onRefresh();
        } catch (error: any) {
            showToast("Erro ao salvar nave: " + error.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const saveModule = async () => {
        setIsLoading(true);
        try {
            const data = {
                name: moduleForm.name,
                type: moduleForm.type,
                level: moduleForm.level,
                description: moduleForm.description,
                image_url: moduleForm.image_url,
                stats_modifier: JSON.parse(moduleForm.stats),
                cost: JSON.parse(moduleForm.cost)
            };

            if (isEditing) {
                const { error } = await supabase.from('ship_modules').update(data).eq('id', isEditing.id);
                if (error) throw error;
                showToast("Módulo atualizado com sucesso!", "success");
            } else {
                const { error } = await supabase.from('ship_modules').insert([data]);
                if (error) throw error;
                showToast("Módulo criado com sucesso!", "success");
            }
            resetForms();
            onRefresh();
        } catch (error: any) {
            showToast("Erro ao salvar módulo: " + error.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const savePolicy = async () => {
        setIsLoading(true);
        try {
            const data = {
                name: policyForm.name,
                type: policyForm.type,
                description: policyForm.description,
                modifiers: JSON.parse(policyForm.modifiers),
                is_active: policyForm.is_active
            };

            if (isEditing) {
                const { error } = await supabase.from('policies').update(data).eq('id', isEditing.id);
                if (error) throw error;
                showToast("Política atualizada com sucesso!", "success");
            } else {
                const { error } = await supabase.from('policies').insert([data]);
                if (error) throw error;
                showToast("Política criada com sucesso!", "success");
            }
            resetForms();
            onRefresh();
        } catch (error: any) {
            showToast("Erro ao salvar política: " + error.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteItem = async (table: string, id: string) => {
        if (!confirm("Confirmar exclusão permanente?")) return;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) {
            showToast("Item removido.", "info");
            onRefresh();
        } else {
            showToast("Erro ao remover: " + error.message, "error");
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Tabs Header */}
            <div className="flex border-b border-space-steel">
                <button
                    onClick={() => { setActiveTab('ships'); resetForms(); }}
                    className={`px-6 py-3 font-display font-bold text-sm tracking-widest transition-all border-b-2 ${activeTab === 'ships' ? 'border-space-neon text-space-neon' : 'border-transparent text-space-muted hover:text-white'}`}
                >
                    CHASSIS (NAVES)
                </button>
                <button
                    onClick={() => { setActiveTab('modules'); resetForms(); }}
                    className={`px-6 py-3 font-display font-bold text-sm tracking-widest transition-all border-b-2 ${activeTab === 'modules' ? 'border-space-neon text-space-neon' : 'border-transparent text-space-muted hover:text-white'}`}
                >
                    MÓDULOS
                </button>
                <button
                    onClick={() => { setActiveTab('policies'); resetForms(); }}
                    className={`px-6 py-3 font-display font-bold text-sm tracking-widest transition-all border-b-2 ${activeTab === 'policies' ? 'border-space-neon text-space-neon' : 'border-transparent text-space-muted hover:text-white'}`}
                >
                    REGRAS & POLÍTICAS
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'ships' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ship Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title={isEditing ? `EDITAR: ${isEditing.name}` : "ADICIONAR NOVO CHASSI"}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <label className="text-xs font-mono text-space-neon uppercase">Informações Básicas</label>
                                    <Input placeholder="Nome da Nave" value={shipForm.name} onChange={e => setShipForm({ ...shipForm, name: e.target.value })} />
                                    <select
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-sm"
                                        value={shipForm.category}
                                        onChange={e => setShipForm({ ...shipForm, category: e.target.value })}
                                    >
                                        <option value="fighter">Caça</option>
                                        <option value="corvette">Corveta</option>
                                        <option value="frigate">Fragata</option>
                                        <option value="destroyer">Destroyer</option>
                                        <option value="cruiser">Cruzador</option>
                                        <option value="battleship">Couraçado</option>
                                        <option value="capital">Capital</option>
                                        <option value="transport">Transporte</option>
                                        <option value="mining">Mineração</option>
                                    </select>
                                    <textarea
                                        placeholder="Descrição técnica"
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-sm h-24"
                                        value={shipForm.description}
                                        onChange={e => setShipForm({ ...shipForm, description: e.target.value })}
                                    />
                                    <Input placeholder="URL da Imagem" value={shipForm.image_url} onChange={e => setShipForm({ ...shipForm, image_url: e.target.value })} />
                                    {shipForm.image_url && (
                                        <div className="h-40 bg-black rounded border border-space-steel overflow-hidden flex items-center justify-center">
                                            <img src={shipForm.image_url} className="max-h-full object-contain" alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-mono text-space-neon uppercase">Atributos Base</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input type="number" placeholder="Hull" label="HULL" value={shipForm.hull} onChange={e => setShipForm({ ...shipForm, hull: parseInt(e.target.value) || 0 })} />
                                        <Input type="number" placeholder="Shield" label="SHIELD" value={shipForm.shield} onChange={e => setShipForm({ ...shipForm, shield: parseInt(e.target.value) || 0 })} />
                                        <Input type="number" placeholder="Speed" label="SPEED" value={shipForm.speed} onChange={e => setShipForm({ ...shipForm, speed: parseInt(e.target.value) || 0 })} />
                                        <Input type="number" placeholder="Cargo" label="CARGO" value={shipForm.cargo} onChange={e => setShipForm({ ...shipForm, cargo: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <Input type="number" placeholder="Build Time (s)" label="TEMPO DE CONST. (S)" value={shipForm.base_build_time} onChange={e => setShipForm({ ...shipForm, base_build_time: parseInt(e.target.value) || 0 })} />

                                    <label className="text-xs font-mono text-space-neon uppercase block mt-4">Custos de Produção</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input type="number" label="METAL" value={shipForm.metal} onChange={e => setShipForm({ ...shipForm, metal: parseInt(e.target.value) || 0 })} />
                                        <Input type="number" label="CRISTAL" value={shipForm.crystal} onChange={e => setShipForm({ ...shipForm, crystal: parseInt(e.target.value) || 0 })} />
                                        <Input type="number" label="DEUT" value={shipForm.deuterium} onChange={e => setShipForm({ ...shipForm, deuterium: parseInt(e.target.value) || 0 })} />
                                    </div>

                                    <label className="text-xs font-mono text-space-neon uppercase block mt-4">Slots Layout (JSON)</label>
                                    <textarea
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-[10px] font-mono h-20"
                                        value={shipForm.slots}
                                        onChange={e => setShipForm({ ...shipForm, slots: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <Button className="flex-1" variant="primary" onClick={saveShip} isLoading={isLoading}>
                                    <Save size={16} className="mr-2" /> {isEditing ? 'ATUALIZAR CHASSI' : 'CRIAR CHASSI'}
                                </Button>
                                {isEditing && <Button variant="ghost" onClick={resetForms}><X size={16} /></Button>}
                            </div>
                        </Card>
                    </div>

                    {/* Ship List */}
                    <div className="space-y-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                        <label className="text-[10px] font-mono text-space-muted uppercase tracking-widest px-2">Registros de Naves ({ships.length})</label>
                        {ships.map(ship => (
                            <div key={ship.id} className="bg-space-dark/40 border border-space-steel rounded p-3 group hover:border-space-neon transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-black rounded border border-space-steel flex-shrink-0 overflow-hidden">
                                        {ship.image_url ? <img src={ship.image_url} className="w-full h-full object-cover" /> : <Rocket size={20} className="text-space-muted opacity-20 m-auto" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-white text-sm truncate">{ship.name}</h4>
                                        <Badge className="text-[9px] py-0">{ship.category}</Badge>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditItem(ship, 'ship')} className="p-1.5 hover:text-space-neon"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('ships', ship.id)} className="p-1.5 hover:text-space-alert"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'modules' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Module Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title={isEditing ? `EDITAR: ${isEditing.name}` : "ADICIONAR NOVO MÓDULO"}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <Input placeholder="Nome do Módulo" value={moduleForm.name} onChange={e => setModuleForm({ ...moduleForm, name: e.target.value })} />
                                    <select
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-sm"
                                        value={moduleForm.type}
                                        onChange={e => setModuleForm({ ...moduleForm, type: e.target.value })}
                                    >
                                        <option value="engine">Motor / Propulsão</option>
                                        <option value="weapon">Arma / Ofensivo</option>
                                        <option value="shield">Escudo / Defesa</option>
                                        <option value="armor">Blindagem</option>
                                        <option value="cargo">Carga</option>
                                        <option value="mining">Mineração</option>
                                        <option value="special">Especial</option>
                                    </select>
                                    <Input type="number" label="TECH LEVEL / NÍVEL" value={moduleForm.level} onChange={e => setModuleForm({ ...moduleForm, level: parseInt(e.target.value) || 1 })} />
                                    <textarea
                                        placeholder="Efeito e descrição"
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-sm h-24"
                                        value={moduleForm.description}
                                        onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                                    />
                                    <Input placeholder="URL do ícone" value={moduleForm.image_url} onChange={e => setModuleForm({ ...moduleForm, image_url: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-mono text-space-neon uppercase block">Modificadores de Stats (JSON)</label>
                                    <textarea
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-[10px] font-mono h-32"
                                        value={moduleForm.stats}
                                        onChange={e => setModuleForm({ ...moduleForm, stats: e.target.value })}
                                        placeholder='{"speed_add": 50, "shield_pct": 0.1}'
                                    />
                                    <label className="text-xs font-mono text-space-neon uppercase block mt-2">Custo do Módulo (JSON)</label>
                                    <textarea
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-[10px] font-mono h-24"
                                        value={moduleForm.cost}
                                        onChange={e => setModuleForm({ ...moduleForm, cost: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <Button className="flex-1" variant="primary" onClick={saveModule} isLoading={isLoading}>
                                    <Save size={16} className="mr-2" /> {isEditing ? 'ATUALIZAR MÓDULO' : 'CRIAR MÓDULO'}
                                </Button>
                                {isEditing && <Button variant="ghost" onClick={resetForms}><X size={16} /></Button>}
                            </div>
                        </Card>
                    </div>

                    {/* Module List */}
                    <div className="space-y-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                        <label className="text-[10px] font-mono text-space-muted uppercase tracking-widest px-2">Arquivos de Módulos ({modules.length})</label>
                        {modules.map(mod => (
                            <div key={mod.id} className="bg-space-dark/40 border border-space-steel rounded p-3 group hover:border-space-neon transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-black rounded border border-space-steel flex items-center justify-center">
                                        {mod.image_url ? <img src={mod.image_url} className="w-full h-full object-cover" /> : <Cpu size={16} className="text-space-muted" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-white text-sm truncate">{mod.name}</h4>
                                        <Badge className="text-[9px] py-0">{mod.type}</Badge>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditItem(mod, 'module')} className="p-1.5 hover:text-space-neon"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('ship_modules', mod.id)} className="p-1.5 hover:text-space-alert"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'policies' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Policy Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card title={isEditing ? `EDITAR: ${isEditing.name}` : "GERENCIAR POLÍTICAS & BÔNUS"}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <Input placeholder="Nome da Política" value={policyForm.name} onChange={e => setPolicyForm({ ...policyForm, name: e.target.value })} />
                                    <select
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-sm"
                                        value={policyForm.type}
                                        onChange={e => setPolicyForm({ ...policyForm, type: e.target.value })}
                                    >
                                        <option value="government">Governo</option>
                                        <option value="empire">Império</option>
                                        <option value="event">Evento Global</option>
                                    </select>
                                    <textarea
                                        placeholder="Descrição do efeito"
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-sm h-24"
                                        value={policyForm.description}
                                        onChange={e => setPolicyForm({ ...policyForm, description: e.target.value })}
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={policyForm.is_active}
                                            onChange={e => setPolicyForm({ ...policyForm, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded border-space-steel bg-space-black text-space-neon focus:ring-0"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-mono text-white cursor-pointer select-none">POLÍTICA ATIVA</label>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-xs font-mono text-space-neon uppercase block">Modificadores (JSON)</label>
                                    <textarea
                                        className="w-full bg-space-black border border-space-steel rounded p-2 text-white text-[10px] font-mono h-32"
                                        value={policyForm.modifiers}
                                        onChange={e => setPolicyForm({ ...policyForm, modifiers: e.target.value })}
                                        placeholder='{"build_time_pct": -0.1, "resource_cost_pct": 0.05}'
                                    />
                                    <div className="bg-space-black/40 border border-space-steel/30 p-3 rounded">
                                        <h5 className="text-[10px] font-bold text-space-neon mb-2 uppercase">Dicas de Sintaxe</h5>
                                        <ul className="text-[9px] text-space-muted font-mono space-y-1">
                                            <li>• Use <span className="text-white">_pct</span> para percentuais (0.1 = +10%)</li>
                                            <li>• Ex: <span className="text-white">"build_time_pct": -0.2</span> (-20% tempo)</li>
                                            <li>• Ex: <span className="text-white">"attack_pct": 0.15</span> (+15% dano)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <Button className="flex-1" variant="primary" onClick={savePolicy} isLoading={isLoading}>
                                    <Save size={16} className="mr-2" /> {isEditing ? 'ATUALIZAR POLÍTICA' : 'CRIAR POLÍTICA'}
                                </Button>
                                {isEditing && <Button variant="ghost" onClick={resetForms}><X size={16} /></Button>}
                            </div>
                        </Card>
                    </div>

                    {/* Policy List */}
                    <div className="space-y-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
                        <label className="text-[10px] font-mono text-space-muted uppercase tracking-widest px-2">Políticas Ativas ({policies.length})</label>
                        {policies.map(pol => (
                            <div key={pol.id} className={`bg-space-dark/40 border ${pol.is_active ? 'border-space-steel' : 'border-space-alert/30'} rounded p-3 group hover:border-space-neon transition-all`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded border flex items-center justify-center ${pol.type === 'government' ? 'border-purple-500/30 bg-purple-900/20' : 'border-yellow-500/30 bg-yellow-900/20'}`}>
                                        <Settings size={16} className={pol.type === 'government' ? 'text-purple-400' : 'text-yellow-400'} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-white text-sm truncate">{pol.name}</h4>
                                            {!pol.is_active && <Badge className="bg-space-alert/20 text-space-alert border-space-alert/30 text-[8px] py-0">INATIVA</Badge>}
                                        </div>
                                        <Badge className="text-[9px] py-0">{pol.type}</Badge>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditItem(pol, 'policy' as any)} className="p-1.5 hover:text-space-neon"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteItem('policies', pol.id)} className="p-1.5 hover:text-space-alert"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
