import React, { useState, useRef } from 'react';
import { Button, Card } from '../ui/Shared';
import { Search, ZoomIn, ZoomOut, Maximize2, Cpu, Info, Boxes, Zap, Shield, Target, Globe, Landmark, ShieldCheck, Crosshair, Factory, Radio, Landmark as Bank, ShieldAlert, Building2, Map } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const STATIC_TEXT = {
    pt: {
        title: 'Laboratório de Pesquisa',
        subtitle: 'Matriz de Desenvolvimento Galáctico',
        zoom: 'Ampliação',
        reset: 'Resetar Foco',
        search: 'Localizar Tecnologia...',
        nodes: 'Nódulos Ativos',
        locked: 'Bloqueado',
        unlocked: 'Concluído',
        requirements: 'Pesquisa necessária:',
        categories: {
            general: 'Edifícios Base',
            engine: 'Motores e Propulsão',
            cargo: 'Módulos de Carga',
            weapon: 'Armas e Mira',
            defense: 'Proteção e Blindagem',
            chassis: 'Estruturas de Nave',
            other: 'Extração e Exploração'
        }
    },
    en: {
        title: 'Research Laboratory',
        subtitle: 'Galactic Development Matrix',
        zoom: 'Magnification',
        reset: 'Reset Focus',
        search: 'Locate Tech...',
        nodes: 'Active Nodes',
        locked: 'Locked',
        unlocked: 'Completed',
        requirements: 'Research required:',
        categories: {
            general: 'Base Buildings',
            engine: 'Engines & Propulsion',
            cargo: 'Cargo Modules',
            weapon: 'Weapons & Aiming',
            defense: 'Protection & Armor',
            chassis: 'Ship Structures',
            other: 'Extraction & Exploration'
        }
    },
    fr: {
        title: 'Laboratoire de Recherche',
        subtitle: 'Matrice de Développement Galactique',
        zoom: 'Agrandissement',
        reset: 'Réinitialiser',
        search: 'Localiser Tecnologia...',
        nodes: 'Noeuds Actifs',
        locked: 'Verrouillé',
        unlocked: 'Terminé',
        requirements: 'Recherche requise:',
        categories: {
            general: 'Bâtiments de Base',
            engine: 'Moteurs et Propulsion',
            cargo: 'Modules de Cargaison',
            weapon: 'Armes et Visée',
            defense: 'Protection et Blindage',
            chassis: 'Structures de Vaisseau',
            other: 'Extraction et Exploration'
        }
    }
};

interface TechNode {
    id: string;
    x: number;
    y: number;
    category: 'cargo' | 'engine' | 'chassis' | 'general' | 'other' | 'weapon' | 'defense';
    pt: string;
    en: string;
    desc_pt: string;
    desc_en: string;
    requirements?: string[];
}

const TECH_NODES: TechNode[] = [
    // --- GENERAL / BASE BUILDINGS (Row Y=100 - Start) ---
    { id: 'shipbuilder', x: 200, y: 100, category: 'general', pt: 'Construtor de Naves', en: 'Shipbuilder', desc_pt: 'Desbloqueia a capacidade de construir naves básicas.', desc_en: 'Unlocks the ability to build basic ships.' },
    { id: 'factory', x: 450, y: 100, category: 'general', pt: 'Fábrica', en: 'Factory', desc_pt: 'Centro de produção para componentes e infraestrutura.', desc_en: 'Production center for components and infrastructure.' },
    { id: 'uni', x: 700, y: 100, category: 'general', pt: 'Universidade', en: 'University', desc_pt: 'Instituição de pesquisa para novos avanços tecnológicos.', desc_en: 'Research institution for new technological breakthroughs.' },
    { id: 'spaceport', x: 950, y: 100, category: 'general', pt: 'Espaçoporto', en: 'Spaceport', desc_pt: 'Hub logístico para tráfego de frotas e comércio.', desc_en: 'Logistical hub for fleet traffic and trade.' },
    { id: 'comms', x: 1200, y: 100, category: 'general', pt: 'Comunicações', en: 'Communications', desc_pt: 'Garante a coordenação de frotas e rede de espionagem.', desc_en: 'Ensures fleet coordination and spying network.' },
    { id: 'market', x: 1450, y: 100, category: 'general', pt: 'Mercado', en: 'Market', desc_pt: 'Plataforma para troca de recursos e mercadorias.', desc_en: 'Platform for trading resources and goods.' },
    { id: 'bunker', x: 1700, y: 100, category: 'general', pt: 'Bunker', en: 'Bunker', desc_pt: 'Proteção subterrânea para recursos e civis.', desc_en: 'Underground protection for resources and civilians.' },
    { id: 'gov', x: 1950, y: 100, category: 'general', pt: 'Governo', en: 'Government', desc_pt: 'Sede administrativa para políticas e leis imperiais.', desc_en: 'Administrative headquarters for imperial policies and laws.' },
    { id: 'mines', x: 450, y: 250, category: 'general', pt: 'Minas Planetárias', en: 'Planetary Mines', desc_pt: 'Aproveita recursos minerais enterrados.', desc_en: 'Harness buried mineral resources.' },
    { id: 'barracks', x: 950, y: 250, category: 'general', pt: 'Quartel', en: 'Barracks', desc_pt: 'Estabelece campos de treinamento militar.', desc_en: 'Establishes military training fields.' },

    // --- CARGO ROW (Row Y=400) ---
    { id: 'cargo_s', x: 200, y: 400, category: 'cargo', pt: 'Carga S', en: 'Cargo S', desc_pt: 'Módulo de carga básico.', desc_en: 'Basic cargo module.' },
    { id: 'cargo_m', x: 450, y: 400, category: 'cargo', pt: 'Carga M', en: 'Cargo M', desc_pt: 'Módulo de carga melhorado.', desc_en: 'Improved cargo module.', requirements: ['vaivem'] },
    { id: 'cargo_l', x: 700, y: 400, category: 'cargo', pt: 'Carga L', en: 'Cargo L', desc_pt: 'Módulo de carga grande.', desc_en: 'Large cargo module.', requirements: ['cargo_m'] },
    { id: 'cargo_xl', x: 950, y: 400, category: 'cargo', pt: 'Carga XL', en: 'Cargo XL', desc_pt: 'Módulo de carga extra-grande.', desc_en: 'Extra-large cargo module.', requirements: ['cargo_l'] },
    { id: 'cargo_xl230', x: 1200, y: 400, category: 'cargo', pt: 'Carga XL-230', en: 'Cargo XL-230', desc_pt: 'Otimizações de transporte.', desc_en: 'Transport optimizations.', requirements: ['cargo_xl'] },
    { id: 'cargo_xl270', x: 1450, y: 400, category: 'cargo', pt: 'Carga XL-270', en: 'Cargo XL-270', desc_pt: 'Capacidade de transporte massiva.', desc_en: 'Massive transport capacity.', requirements: ['cargo_xl230'] },
    { id: 'cargo_mini', x: 1700, y: 400, category: 'cargo', pt: 'Carga Mini', en: 'Mini Cargo', desc_pt: 'Tecnologia de miniaturização.', desc_en: 'Miniaturization technology.', requirements: ['cargo_xl270'] },
    { id: 'cargo_jumbo', x: 1950, y: 400, category: 'cargo', pt: 'Carga Jumbo', en: 'Jumbo Cargo', desc_pt: 'A maior carga disponível no game.', desc_en: 'Largest cargo available in game.', requirements: ['cargo_mini'] },

    // --- ENGINE ROW (Row Y=600-750) ---
    { id: 'gps1', x: 200, y: 600, category: 'engine', pt: 'GPS 1', en: 'Propulsion 1', desc_pt: 'Propulsão básica Deltan.', desc_en: 'Basic Deltan propulsion.' },
    { id: 'gps2', x: 450, y: 600, category: 'engine', pt: 'GPS 2', en: 'Propulsion 2', desc_pt: 'Motor aprimorado Deltan.', desc_en: 'Enhanced Deltan engine.', requirements: ['gps1'] },
    { id: 'gps3', x: 700, y: 600, category: 'engine', pt: 'GPS 3', en: 'Propulsion 3', desc_pt: 'Motor de nova geração.', desc_en: 'New generation engine.', requirements: ['gps2'] },
    { id: 'gps4', x: 950, y: 600, category: 'engine', pt: 'GPS 4', en: 'Propulsion 4', desc_pt: 'Potência e eficiência superiores.', desc_en: 'Superior power and efficiency.', requirements: ['gps3'] },
    { id: 'gps5', x: 1200, y: 600, category: 'engine', pt: 'GPS 5', en: 'Propulsion 5', desc_pt: 'Ápice da tecnologia propulsora.', desc_en: 'Pinnacle of propulsion tech.', requirements: ['gps4'] },
    { id: 'warp1', x: 450, y: 750, category: 'engine', pt: 'Warp 1', en: 'Warp 1', desc_pt: 'Distorção espacial básica.', desc_en: 'Basic space distortion.' },
    { id: 'cooling', x: 700, y: 750, category: 'engine', pt: 'Resfriamento Warp', en: 'Warp Cooling', desc_pt: 'Resfriamento avançado.', desc_en: 'Advanced cooling.', requirements: ['warp1'] },
    { id: 'distort_opt', x: 950, y: 750, category: 'engine', pt: 'Otimização de Distorção', en: 'Distortion Opt.', desc_pt: 'Redução de consumo.', desc_en: 'Consumption reduction.', requirements: ['cooling'] },
    { id: 'stable_multi', x: 1200, y: 750, category: 'engine', pt: 'Estabilização Multidim.', en: 'Multidim. Stability', desc_pt: 'Navegação dimensional.', desc_en: 'Dimensional navigation.', requirements: ['distort_opt'] },
    { id: 'warp5', x: 1450, y: 750, category: 'engine', pt: 'Warp 5', en: 'Warp 5', desc_pt: 'Motor warp definitivo.', desc_en: 'Ultimate warp engine.', requirements: ['stable_multi'] },
    { id: 'mini_warp', x: 1700, y: 750, category: 'engine', pt: 'Mini Warp', en: 'Mini Warp', desc_pt: 'Motor warp compacto.', desc_en: 'Compact warp engine.', requirements: ['warp5'] },
    { id: 'mw2', x: 1950, y: 750, category: 'engine', pt: 'MW2', en: 'MW2', desc_pt: 'Warp de segunda geração.', desc_en: 'Second-gen warp.', requirements: ['mini_warp'] },

    // --- WEAPON ROW (Row Y=1000-1300) ---
    { id: 'laser_l1', x: 200, y: 1000, category: 'weapon', pt: 'Laser L1', en: 'Laser L1', desc_pt: 'Arma laser básica.', desc_en: 'Basic laser weapon.', requirements: ['vaivem'] },
    { id: 'laser_l2', x: 450, y: 1000, category: 'weapon', pt: 'Laser L2', en: 'Laser L2', desc_pt: 'Laser aprimorado.', desc_en: 'Enhanced laser.', requirements: ['laser_l1', 'corveta'] },
    { id: 'laser_amp', x: 700, y: 1000, category: 'weapon', pt: 'Amplificador Laser', en: 'Laser Amp', desc_pt: 'Amplificação fotônica.', desc_en: 'Photonic amplification.', requirements: ['laser_l2', 'cruzador'] },
    { id: 'mini_laser', x: 950, y: 1000, category: 'weapon', pt: 'Mini Laser', en: 'Mini Laser', desc_pt: 'Frequência extrema de tiro.', desc_en: 'Extreme firing frequency.', requirements: ['laser_amp', 'inter_cruiser'] },
    { id: 'laser_jumbo', x: 1200, y: 1000, category: 'weapon', pt: 'Laser Jumbo', en: 'Jumbo Laser', desc_pt: 'O poder absoluto do feixe.', desc_en: 'Absolute beam power.', requirements: ['mini_laser', 'hades'] },
    { id: 'balista', x: 700, y: 1150, category: 'weapon', pt: 'Balista', en: 'Ballista', desc_pt: 'Lançador de foguetes.', desc_en: 'Rocket launcher.', requirements: ['laser_l2'] },
    { id: 'sniper', x: 950, y: 1150, category: 'weapon', pt: 'Sniper', en: 'Sniper', desc_pt: 'Lançador de precisão.', desc_en: 'Precision launcher.', requirements: ['balista'] },
    { id: 'vendetta', x: 1200, y: 1150, category: 'weapon', pt: 'Vendetta', en: 'Vendetta', desc_pt: 'Mísseis A123-D.', desc_en: 'A123-D missiles.', requirements: ['sniper'] },
    { id: 'mini_balista', x: 1450, y: 1150, category: 'weapon', pt: 'Mini Balista', en: 'Mini Ballista', desc_pt: 'Escala compacta, alto dano.', desc_en: 'Compact scale, high damage.', requirements: ['vendetta'] },
    { id: 'balista_jumbo', x: 1700, y: 1150, category: 'weapon', pt: 'Balista Jumbo', en: 'Jumbo Ballista', desc_pt: 'Ogivas de alto impacto.', desc_en: 'High impact warheads.', requirements: ['neutrinos', 'hades'] },
    { id: 'neutrinos', x: 1700, y: 1000, category: 'weapon', pt: 'Neutrinos', en: 'Neutrinos', desc_pt: 'Perfuração de escudos.', desc_en: 'Shield piercing.', requirements: ['mini_balista'] },
    { id: 'aim_sys1', x: 700, y: 1300, category: 'weapon', pt: 'Sistema de Mira I', en: 'Aiming System I', desc_pt: '+15% Dano Crítico.', desc_en: '+15% Critical Damage.', requirements: ['laser_l2'] },
    { id: 'aim_sys3', x: 1200, y: 1300, category: 'weapon', pt: 'Sistema de Mira III', en: 'Aiming System III', desc_pt: '+50% Dano Crítico.', desc_en: '+50% Critical Damage.', requirements: ['aim_sys1', 'inter_cruiser'] },
    { id: 'aim_comp1', x: 700, y: 1450, category: 'weapon', pt: 'Computador Mira I', en: 'Aim Computer I', desc_pt: '+3% Chance Crítica.', desc_en: '+3% Critical Chance.', requirements: ['laser_l2'] },
    { id: 'aim_comp3', x: 1200, y: 1450, category: 'weapon', pt: 'Computador Mira III', en: 'Aim Computer III', desc_pt: '+10% Chance Crítica.', desc_en: '+10% Critical Chance.', requirements: ['aim_comp1', 'hades'] },

    // --- DEFENSE ROW (Y=1700-1900) ---
    { id: 'armor_reinf', x: 200, y: 1700, category: 'defense', pt: 'Casco Reforçado', en: 'Reinforced Hull', desc_pt: 'Resistência estrutural.', desc_en: 'Structural resistance.' },
    { id: 'armor_plated', x: 450, y: 1700, category: 'defense', pt: 'Casco Blindado', en: 'Plated Hull', desc_pt: 'Blindagem pesada.', desc_en: 'Heavy armor.' },
    { id: 'shield_s1', x: 200, y: 1850, category: 'defense', pt: 'Escudo S1', en: 'Shield S1', desc_pt: 'Gerador básico.', desc_en: 'Basic generator.' },
    { id: 'shield_s3', x: 700, y: 1850, category: 'defense', pt: 'Escudo S3', en: 'Shield S3', desc_pt: 'Gerador avançado.', desc_en: 'Advanced generator.', requirements: ['shield_s1'] },
    { id: 'shield_mk5', x: 1200, y: 1850, category: 'defense', pt: 'Escudo Mk5', en: 'Shield Mk5', desc_pt: 'Eficiência máxima.', desc_en: 'Maximum efficiency.', requirements: ['shield_s3'] },
    { id: 'mini_shield', x: 1450, y: 1850, category: 'defense', pt: 'Escudo Mini', en: 'Mini Shield', desc_pt: 'Miniaturização tática.', desc_en: 'Tactical miniaturization.', requirements: ['shield_mk5'] },
    { id: 'jumbo_shield', x: 1700, y: 1850, category: 'defense', pt: 'Escudo Jumbo', en: 'Jumbo Shield', desc_pt: 'Escala capital.', desc_en: 'Capital scale.', requirements: ['mini_shield'] },
    { id: 'blindagem1', x: 700, y: 1700, category: 'defense', pt: 'Blindagem I', en: 'Armor I', desc_pt: '-10% Dano Crítico recebido.', desc_en: '-10% Critical Damage received.' },
    { id: 'armor3', x: 1200, y: 1700, category: 'defense', pt: 'Blindagem III', en: 'Armor III', desc_pt: '-35% Dano Crítico recebido.', desc_en: '-35% Critical Damage received.', requirements: ['blindagem1', 'inter_cruiser'] },

    // --- CHASSIS ROW (Y=2200-2400) ---
    { id: 'vaivem', x: 200, y: 2200, category: 'chassis', pt: 'Vaivém', en: 'Shuttle', desc_pt: 'Nave básica de início.', desc_en: 'Starting basic ship.' },
    { id: 'caca', x: 450, y: 2200, category: 'chassis', pt: 'Caça', en: 'Fighter', desc_pt: 'Combate leve.', desc_en: 'Light combat.', requirements: ['vaivem', 'warp1'] },
    { id: 'corveta', x: 700, y: 2200, category: 'chassis', pt: 'Corveta', en: 'Corvette', desc_pt: 'Equilibrada.', desc_en: 'Balanced.', requirements: ['caca'] },
    { id: 'fragata', x: 950, y: 2200, category: 'chassis', pt: 'Fragata', en: 'Frigate', desc_pt: 'Média e defensiva.', desc_en: 'Medium defensive.', requirements: ['corveta', 'cooling'] },
    { id: 'destruidor', x: 1200, y: 2200, category: 'chassis', pt: 'Destruidor', en: 'Destroyer', desc_pt: 'Pesada e destrutiva.', desc_en: 'Heavy destructive.', requirements: ['fragata', 'armor_plated'] },
    { id: 'cruzador', x: 1450, y: 2200, category: 'chassis', pt: 'Cruzador', en: 'Cruiser', desc_pt: 'Versátil de guerra.', desc_en: 'Versatile warship.', requirements: ['destruidor', 'shield_s3'] },
    { id: 'inter_cruiser', x: 1700, y: 2200, category: 'chassis', pt: 'Cruzador Intergaláctico', en: 'Intergalactic Cruiser', desc_pt: 'Exploração profunda.', desc_en: 'Deep exploration.', requirements: ['cruzador'] },
    { id: 'warrior', x: 2200, y: 2200, category: 'chassis', pt: 'Guerreiro', en: 'Warrior', desc_pt: 'Combate excepcional.', desc_en: 'Exceptional combat.', requirements: ['inter_cruiser'] },
    { id: 'titan', x: 2450, y: 2200, category: 'chassis', pt: 'Titã', en: 'Titan', desc_pt: 'Poder militar colossal.', desc_en: 'Colossal military power.', requirements: ['warrior'] },
    { id: 'hades', x: 2950, y: 2200, category: 'chassis', pt: 'Hades', en: 'Hades', desc_pt: ' Battleship aterrorizante.', desc_en: 'Terrifying battleship.', requirements: ['titan'] },
    { id: 'leviathan', x: 3200, y: 2200, category: 'chassis', pt: 'Leviatã', en: 'Leviathan', desc_pt: 'A maior nave projetada.', desc_en: 'Largest designed ship.', requirements: ['hades'] },

    // --- OTHER / EXTRACTION ROW (Y=2800-3500) ---
    { id: 'mining1', x: 200, y: 2800, category: 'other', pt: 'Técnicas I', en: 'Mining I', desc_pt: '+5% Produção.', desc_en: '+5% Production.' },
    { id: 'mining4', x: 950, y: 2800, category: 'other', pt: 'Técnicas IV', en: 'Mining IV', desc_pt: '+20% Produção.', desc_en: '+20% Production.', requirements: ['mining1'] },
    { id: 'nano_mining', x: 1450, y: 2800, category: 'other', pt: 'Mineração Nanotec', en: 'Nanotech Mining', desc_pt: '+40% Produção.', desc_en: '+40% Production.', requirements: ['mining4'] },
    { id: 'singularity_harvest', x: 1950, y: 2800, category: 'other', pt: 'Colheita Singularidade', en: 'Singularity Harvest', desc_pt: '+80% Produção.', desc_en: '+80% Production.', requirements: ['nano_mining'] },

    { id: 'ast_mk1', x: 200, y: 3000, category: 'other', pt: 'Extrator MK1', en: 'Extractor MK1', desc_pt: 'Extração de asteroides.', desc_en: 'Asteroid extraction.' },
    { id: 'ast_mk3', x: 700, y: 3000, category: 'other', pt: 'Extrator MK3', en: 'Extractor MK3', desc_pt: 'Eficiência energética.', desc_en: 'Energy efficiency.', requirements: ['ast_mk1'] },
    { id: 'extract_laser_jumbo_opt', x: 1200, y: 3000, category: 'other', pt: 'Extrator Jumbo', en: 'Jumbo Extractor', desc_pt: 'Alta escala Mintek.', desc_en: 'High scale Mintek.', requirements: ['ast_mk3'] },

    { id: 'colonization', x: 1450, y: 3200, category: 'other', pt: 'Colonização', en: 'Colonization', desc_pt: 'Estabelecer colônias.', desc_en: 'Establish colonies.', requirements: ['vaivem'] },
    { id: 'moonbase', x: 1700, y: 3200, category: 'other', pt: 'Base Lunar', en: 'Moon Base', desc_pt: '2º planeta (Lua).', desc_en: '2nd planet (Moon).', requirements: ['colonization'] },
    { id: 'interstellar_col', x: 2950, y: 3200, category: 'other', pt: 'Colonização Interestelar', en: 'Interstellar Col', desc_pt: 'Exoplanetas distantes.', desc_en: 'Distant exoplanets.', requirements: ['moonbase'] },
];

const CATEGORY_UI = {
    general: { color: 'text-sky-400', border: 'border-sky-400', bg: 'bg-sky-400/10', icon: <Building2 size={16} /> },
    engine: { color: 'text-lime-400', border: 'border-lime-400', bg: 'bg-lime-400/10', icon: <Zap size={16} /> },
    cargo: { color: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400/10', icon: <Boxes size={16} /> },
    weapon: { color: 'text-red-400', border: 'border-red-400', bg: 'bg-red-400/10', icon: <Crosshair size={16} /> },
    defense: { color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10', icon: <ShieldCheck size={16} /> },
    chassis: { color: 'text-amber-500', border: 'border-amber-500', bg: 'bg-amber-500/10', icon: <Target size={16} /> },
    other: { color: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400/10', icon: <Map size={16} /> },
};

export const TechTreeView: React.FC = () => {
    const { language } = useLanguage();
    const t = STATIC_TEXT[language];
    const [scale, setScale] = useState(0.3);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState<TechNode | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newScale = Math.min(Math.max(scale + delta, 0.02), 2);
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
        setScale(0.3);
        setPosition({ x: 50, y: 50 });
    };

    const filteredNodes = TECH_NODES.filter(node => {
        const name = language === 'pt' ? node.pt : node.en;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

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
                            <span className="text-space-neon">SYNC:</span> POST ARVORE TECNOLOGIA
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
                        backgroundSize: `${50 * scale}px ${50 * scale}px`,
                        backgroundPosition: `${position.x}px ${position.y}px`
                    }}
                />

                {/* Tech Content Container */}
                <div
                    className="absolute transition-transform duration-75 ease-out origin-top-left"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    }}
                >
                    {/* Category Background Clusters */}
                    {[
                        { y: 100, h: 300, label: t.categories.general, color: 'sky' },
                        { y: 400, h: 100, label: t.categories.cargo, color: 'blue' },
                        { y: 600, h: 300, label: t.categories.engine, color: 'lime' },
                        { y: 1000, h: 600, label: t.categories.weapon, color: 'red' },
                        { y: 1700, h: 300, label: t.categories.defense, color: 'purple' },
                        { y: 2100, h: 500, label: t.categories.chassis, color: 'amber' },
                        { y: 2700, h: 800, label: t.categories.other, color: 'orange' },
                    ].map(cluster => (
                        <div key={cluster.label} className="absolute left-[100px] right-[-4000px] pointer-events-none" style={{ top: cluster.y - 80, height: cluster.h }}>
                            <div className={`absolute inset-0 bg-${cluster.color}-400/5 border-l-4 border-${cluster.color}-400/40 rounded-r-3xl`} />
                            <span className={`absolute left-4 top-4 text-2xl font-display font-black uppercase tracking-[0.4em] opacity-40 text-${cluster.color}-400`}>
                                {cluster.label}
                            </span>
                        </div>
                    ))}

                    {/* SVG Connections */}
                    <svg className="absolute top-0 left-0 w-[8000px] h-[8000px] pointer-events-none overflow-visible">
                        {TECH_NODES.map(node => (
                            node.requirements?.map(reqId => {
                                const reqNode = TECH_NODES.find(n => n.id === reqId);
                                if (!reqNode) return null;
                                return (
                                    <line
                                        key={`${node.id}-${reqId}`}
                                        x1={reqNode.x} y1={reqNode.y}
                                        x2={node.x} y2={node.y}
                                        stroke={CATEGORY_UI[node.category].color.includes('red') ? '#ef4444' : '#00c2ff'}
                                        strokeWidth="3"
                                        strokeDasharray="10,10"
                                        opacity="0.2"
                                        className="animate-pulse"
                                    />
                                );
                            })
                        ))}
                    </svg>

                    {/* Nodes */}
                    {filteredNodes.map(node => {
                        const ui = CATEGORY_UI[node.category] || CATEGORY_UI.other;
                        const isHovered = hoveredNode?.id === node.id;

                        return (
                            <div
                                key={node.id}
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-4 bg-space-dark/95 backdrop-blur-sm rounded-xl border transition-all duration-300 pointer-events-auto cursor-pointer
                                    ${isHovered ? `${ui.border} ring-4 ${ui.border.replace('border-', 'ring-')}/20 scale-110 shadow-[0_0_40px_rgba(0,194,255,0.5)]` : 'border-space-steel/50'}
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
                            </div>
                        );
                    })}
                </div>

                {/* HUD Overlay */}
                <div className="absolute bottom-6 left-6 p-6 bg-space-dark/95 backdrop-blur-2xl border border-space-steel/30 rounded-2xl w-full max-w-[360px] pointer-events-none animate-slideUp shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-space-neon/5 opacity-30" />
                    {hoveredNode ? (
                        <div className="relative space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Info size={14} className="text-space-neon" />
                                    <span className="text-[10px] font-mono text-space-neon uppercase tracking-widest">PROTOCOLO DE DECODIFICAÇÃO</span>
                                </div>
                                <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${CATEGORY_UI[hoveredNode.category].color.replace('text-', 'border-').replace('text-', 'bg-')}/10 ${CATEGORY_UI[hoveredNode.category].color}`}>
                                    {hoveredNode.category.toUpperCase()}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-tighter">
                                    {language === 'pt' ? hoveredNode.pt : hoveredNode.en}
                                </h3>
                                <p className="text-xs text-space-muted font-mono leading-relaxed opacity-90 border-l-2 border-space-neon/30 pl-3">
                                    {language === 'pt' ? hoveredNode.desc_pt : hoveredNode.desc_en}
                                </p>
                            </div>

                            {hoveredNode.requirements && (
                                <div className="pt-4 border-t border-space-steel/20">
                                    <p className="text-[9px] font-mono text-space-muted uppercase mb-3 flex items-center gap-2">
                                        <Target size={10} className="text-space-neon" />
                                        {t.requirements}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {hoveredNode.requirements.map(reqId => {
                                            const req = TECH_NODES.find(n => n.id === reqId);
                                            return (
                                                <span key={reqId} className="px-3 py-1.5 bg-space-black border border-space-steel/40 rounded-md text-[10px] font-mono text-white shadow-sm">
                                                    {req ? (language === 'pt' ? req.pt : req.en) : reqId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative py-10 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full border border-space-neon/20 flex items-center justify-center mx-auto bg-space-neon/5 animate-pulse">
                                <Search size={24} className="text-space-neon opacity-50" />
                            </div>
                            <p className="text-[10px] font-mono text-space-muted uppercase tracking-[0.3em] font-bold">
                                AGUARDANDO SELEÇÃO DE NÓDULO...
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigator Info */}
                <div className="absolute bottom-6 right-6 px-4 py-3 bg-space-dark/90 backdrop-blur-md border border-space-steel/30 rounded-xl font-mono text-[10px] text-space-muted flex items-center gap-6 shadow-xl">
                    <div className="flex gap-3 border-r border-space-steel/30 pr-6">
                        <span className="text-space-neon font-bold">COORD:</span>
                        <span>X {position.x.toFixed(0)}</span>
                        <span>Y {position.y.toFixed(0)}</span>
                    </div>
                    <div>
                        <span className="text-space-neon font-bold">PROGRES:</span> {TECH_NODES.length} NODES
                    </div>
                    <div>
                        <span className="text-space-neon font-bold">ZOOM:</span> {(scale * 100).toFixed(0)}%
                    </div>
                </div>
            </Card>
        </div>
    );
};
