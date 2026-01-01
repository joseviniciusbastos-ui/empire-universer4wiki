import React from 'react';
import { Building2, Zap, Boxes, Crosshair, ShieldCheck, Target, Map } from 'lucide-react';

export interface TechNode {
    id: string;
    x: number;
    y: number;
    category: 'cargo' | 'engine' | 'chassis' | 'general' | 'other' | 'weapon' | 'defense';
    pt: string;
    en: string;
    desc_pt: string;
    desc_en: string;
    requirements?: string[];
    baseTime?: string;
}

export const TECH_NODES: TechNode[] = [
    // --- GENERAL / BASE (Row Y=100-250) ---
    { id: 'basic_unlocks', x: 200, y: 100, category: 'general', pt: 'Desbloqueios Básicos', en: 'Basic Unlocks', desc_pt: 'Minas, Quartel, Mercado, etc.', desc_en: 'Mines, Barracks, Market, etc.', baseTime: '-' },
    { id: 'mil_eff1', x: 450, y: 100, category: 'general', pt: 'Eficiência Militar I', en: 'Military Efficiency I', desc_pt: 'Desbloquear Quartel.', desc_en: 'Unlock Barracks.', requirements: ['barracks'], baseTime: '-' },
    { id: 'mine_tech1', x: 700, y: 100, category: 'general', pt: 'Técnica de Mineração I', en: 'Mining Tech I', desc_pt: 'Desbloquear Minas Planetárias.', desc_en: 'Unlock Planetary Mines.', requirements: ['mines'], baseTime: '-' },
    { id: 'mine_tech_multi', x: 950, y: 100, category: 'general', pt: 'Técnica de Mineração II/III/IV', en: 'Mining Tech II/III/IV', desc_pt: 'Nível anterior.', desc_en: 'Previous level.', baseTime: '-' },
    { id: 'mass_rec1', x: 1200, y: 100, category: 'general', pt: 'Recrutamento em Massa I', en: 'Mass Recruitment I', desc_pt: 'Desbloquear Quartel.', desc_en: 'Unlock Barracks.', requirements: ['barracks'], baseTime: '12h' },
    { id: 'mil_eff2', x: 1450, y: 100, category: 'general', pt: 'Eficiência Militar II', en: 'Military Efficiency II', desc_pt: 'Eficiência Militar I.', desc_en: 'Military Efficiency I.', requirements: ['mil_eff1'], baseTime: '1d' },
    { id: 'adv_logistics', x: 1700, y: 100, category: 'general', pt: 'Logística Avançada', en: 'Advanced Logistics', desc_pt: 'Desbloquear Quartel.', desc_en: 'Unlock Barracks.', requirements: ['barracks'], baseTime: '2d' },
    { id: 'adv_mining_ops', x: 1950, y: 100, category: 'general', pt: 'Operações de Mineração Adv.', en: 'Adv. Mining Ops', desc_pt: 'Técnica IV / CP nv 5.', desc_en: 'Tech IV / CP lvl 5.', requirements: ['mine_tech_multi'], baseTime: '3d' },
    { id: 'mass_rec2', x: 1200, y: 250, category: 'general', pt: 'Recrutamento em Massa II', en: 'Mass Recruitment II', desc_pt: 'Recrutamento em Massa I.', desc_en: 'Mass Recruitment I.', requirements: ['mass_rec1'], baseTime: '1d 12h' },
    { id: 'nano_mining', x: 450, y: 250, category: 'general', pt: 'Mineração Nanotec.', en: 'Nanotech Mining', desc_pt: 'Operações Avançadas.', desc_en: 'Advanced Operations.', requirements: ['adv_mining_ops'], baseTime: '7d' },
    { id: 'grav_extraction', x: 700, y: 250, category: 'general', pt: 'Extração Gravitacional', en: 'Grav. Extraction', desc_pt: 'Nanotec / CP nv 7.', desc_en: 'Nanotech / CP lvl 7.', requirements: ['nano_mining'], baseTime: '10d' },
    { id: 'dim_mining', x: 950, y: 250, category: 'general', pt: 'Mineração Dimensional', en: 'Dim. Mining', desc_pt: 'Gravitacional / CP nv 8.', desc_en: 'Gravitational / CP lvl 8.', requirements: ['grav_extraction'], baseTime: '12d' },
    { id: 'singularity_harvest', x: 1200, y: 250, category: 'general', pt: 'Colheita Singularidade', en: 'Singularity Harvest', desc_pt: 'Dimensional / CP nv 9.', desc_en: 'Dimensional / CP lvl 9.', requirements: ['dim_mining'], baseTime: '15d' },
    { id: 'transcendent_domain', x: 1450, y: 250, category: 'general', pt: 'Domínio Transcendente', en: 'Transcendent Domain', desc_pt: 'Singularidade / CP nv 10.', desc_en: 'Singularity / CP lvl 10.', requirements: ['singularity_harvest'], baseTime: '20d' },

    // --- CARGO ROW (Y=400) ---
    { id: 'cargo_s', x: 200, y: 400, category: 'cargo', pt: 'Cargo S', en: 'Cargo S', desc_pt: 'Módulo de carga básico.', desc_en: 'Basic cargo module.', baseTime: '-' },
    { id: 'cargo_m', x: 450, y: 400, category: 'cargo', pt: 'Cargo M', en: 'Cargo M', desc_pt: 'Vaivém.', desc_en: 'Shuttle.', requirements: ['vaivem'], baseTime: '-' },
    { id: 'cargo_l', x: 700, y: 400, category: 'cargo', pt: 'Cargo L', en: 'Cargo L', desc_pt: 'Cargo M.', desc_en: 'Cargo M.', requirements: ['cargo_m'], baseTime: '-' },
    { id: 'cargo_xl', x: 950, y: 400, category: 'cargo', pt: 'Cargo XL', en: 'Cargo XL', desc_pt: 'Cargo L.', desc_en: 'Cargo L.', requirements: ['cargo_l'], baseTime: '-' },
    { id: 'cargo_xl230', x: 1200, y: 400, category: 'cargo', pt: 'Cargo XL-230', en: 'Cargo XL-230', desc_pt: 'Cargo XL.', desc_en: 'Cargo XL.', requirements: ['cargo_xl'], baseTime: '5d' },
    { id: 'cargo_xl270', x: 1450, y: 400, category: 'cargo', pt: 'Cargo XL-270', en: 'Cargo XL-270', desc_pt: 'Cargo XL-230.', desc_en: 'Cargo XL-230.', requirements: ['cargo_xl230'], baseTime: '7d' },
    { id: 'cargo_mini', x: 1700, y: 400, category: 'cargo', pt: 'Carga Mini', en: 'Mini Cargo', desc_pt: 'Cargo XL-270 / CP LVL 8.', desc_en: 'Cargo XL-270 / CP LVL 8.', requirements: ['cargo_xl270'], baseTime: '12d' },
    { id: 'cargo_mini_racial', x: 1950, y: 400, category: 'cargo', pt: 'Mini Carga Aprimorada', en: 'Enhanced Mini Cargo', desc_pt: 'Racial Xyrrh - CP nvl 9.', desc_en: 'Xyrrh Racial - CP lvl 9.', requirements: ['cargo_mini'], baseTime: '20d' },
    { id: 'cargo_jumbo', x: 2200, y: 400, category: 'cargo', pt: 'Carga Jumbo', en: 'Jumbo Cargo', desc_pt: 'Carga Mini / CP LVL 9.', desc_en: 'Mini Cargo / CP LVL 9.', requirements: ['cargo_mini'], baseTime: '22d' },

    // --- ENGINE ROW (Y=600-750) ---
    { id: 'gps1', x: 200, y: 600, category: 'engine', pt: 'GPS1', en: 'GPS1', desc_pt: 'Posicionamento básico.', desc_en: 'Basic positioning.', baseTime: '-' },
    { id: 'gps2', x: 450, y: 600, category: 'engine', pt: 'GPS2', en: 'GPS2', desc_pt: 'GPS1.', desc_en: 'GPS1.', requirements: ['gps1'], baseTime: '23h 28m 41s' },
    { id: 'warp1', x: 200, y: 750, category: 'engine', pt: 'Warp 1', en: 'Warp 1', desc_pt: 'Distorção básica.', desc_en: 'Basic distortion.', baseTime: '-' },
    { id: 'cooling', x: 450, y: 750, category: 'engine', pt: 'Resfriamento Warp Adv.', en: 'Adv. Warp Cooling', desc_pt: 'Warp1.', desc_en: 'Warp1.', requirements: ['warp1'], baseTime: '-' },
    { id: 'distort_opt', x: 700, y: 750, category: 'engine', pt: 'Otimização Distorção', en: 'Distortion Opt.', desc_pt: 'Resfriamento Adv.', desc_en: 'Adv. Cooling.', requirements: ['cooling'], baseTime: '3d 1h 2m' },
    { id: 'gps3', x: 700, y: 600, category: 'engine', pt: 'GPS 3', en: 'GPS 3', desc_pt: 'GPS 2 / CP nv 5.', desc_en: 'GPS 2 / CP lvl 5.', requirements: ['gps2'], baseTime: '3d 20h' },
    { id: 'gps4', x: 950, y: 600, category: 'engine', pt: 'GPS 4', en: 'GPS 4', desc_pt: 'GPS 3 / CP nv 7.', desc_en: 'GPS 3 / CP lvl 7.', requirements: ['gps3'], baseTime: '7d 12h' },
    { id: 'stable_multi', x: 950, y: 750, category: 'engine', pt: 'Estabilização Multidim.', en: 'Multidim. Stability', desc_pt: 'Otimização Distorção.', desc_en: 'Distortion Opt.', requirements: ['distort_opt'], baseTime: '10d' },
    { id: 'gps5', x: 1200, y: 600, category: 'engine', pt: 'GPS 5', en: 'GPS 5', desc_pt: 'GPS 4 / CP nv 7.', desc_en: 'GPS 4 / CP lvl 7.', requirements: ['gps4'], baseTime: '15d' },
    { id: 'warp5', x: 1200, y: 750, category: 'engine', pt: 'Warp 5', en: 'Warp 5', desc_pt: 'Estabilização / CP nv 6.', desc_en: 'Stability / CP lvl 6.', requirements: ['stable_multi'], baseTime: '16d' },
    { id: 'mini_warp', x: 1450, y: 750, category: 'engine', pt: 'Mini Warp', en: 'Mini Warp', desc_pt: 'Warp 5 / CP nv 8.', desc_en: 'Warp 5 / CP lvl 8.', requirements: ['warp5'], baseTime: '21d' },
    { id: 'mini_warp_racial', x: 1700, y: 750, category: 'engine', pt: 'Mini Warp Aprimorado', en: 'Enhanced Mini Warp', desc_pt: 'Racial Terrano - CP nv 9.', desc_en: 'Terran Racial - CP lvl 9.', requirements: ['mini_warp'], baseTime: '20d' },
    { id: 'mw2', x: 1950, y: 750, category: 'engine', pt: 'MW2', en: 'MW2', desc_pt: 'Mini Warp / CP nv 8.', desc_en: 'Mini Warp / CP lvl 8.', requirements: ['mini_warp'], baseTime: '27d' },


    // --- WEAPON ROW (Y=1000-1300) ---
    { id: 'laser_l1', x: 200, y: 1000, category: 'weapon', pt: 'Laser L1', en: 'Laser L1', desc_pt: 'Vaivém.', desc_en: 'Shuttle.', requirements: ['vaivem'], baseTime: '-' },
    { id: 'laser_l2', x: 450, y: 1000, category: 'weapon', pt: 'Laser L2', en: 'Laser L2', desc_pt: 'Laser L1 / Corveta.', desc_en: 'Laser L1 / Corvette.', requirements: ['laser_l1', 'corveta'], baseTime: '-' },
    { id: 'balista', x: 700, y: 1000, category: 'weapon', pt: 'Balista', en: 'Ballista', desc_pt: 'Laser L2.', desc_en: 'Laser L2.', requirements: ['laser_l2'], baseTime: '2d' },
    { id: 'aim_sys1', x: 700, y: 1150, category: 'weapon', pt: 'Sistema de Mira I', en: 'Aiming System I', desc_pt: 'Laser L2.', desc_en: 'Laser L2.', requirements: ['laser_l2'], baseTime: '2d' },
    { id: 'aim_comp1', x: 700, y: 1300, category: 'weapon', pt: 'Computador Mira I', en: 'Aim Computer I', desc_pt: 'Laser L2.', desc_en: 'Laser L2.', requirements: ['laser_l2'], baseTime: '3d' },
    { id: 'aim_sys2', x: 950, y: 1150, category: 'weapon', pt: 'Sistema de Mira II', en: 'Aiming System II', desc_pt: 'Mira I / Cruzador.', desc_en: 'Aim I / Cruiser.', requirements: ['aim_sys1', 'cruzador'], baseTime: '5d' },
    { id: 'laser_amp', x: 950, y: 1000, category: 'weapon', pt: 'Amplificador Laser', en: 'Laser Amp', desc_pt: 'Laser L2 / Cruzador.', desc_en: 'Laser L2 / Cruiser.', requirements: ['laser_l2', 'cruzador'], baseTime: '6d' },
    { id: 'sniper', x: 950, y: 1300, category: 'weapon', pt: 'Sniper', en: 'Sniper', desc_pt: 'Balista.', desc_en: 'Ballista.', requirements: ['balista'], baseTime: '7d' },
    { id: 'vendetta', x: 1200, y: 1300, category: 'weapon', pt: 'Vendetta', en: 'Vendetta', desc_pt: 'Sniper.', desc_en: 'Sniper.', requirements: ['sniper'], baseTime: '10d' },
    { id: 'aim_comp2', x: 1200, y: 1150, category: 'weapon', pt: 'Computador Mira II', en: 'Aim Computer II', desc_pt: 'Mira I / Cruzador.', desc_en: 'Aim I / Cruiser.', requirements: ['aim_comp1', 'cruzador'], baseTime: '10d' },
    { id: 'mini_laser', x: 1450, y: 1000, category: 'weapon', pt: 'Mini Laser', en: 'Mini Laser', desc_pt: 'Amplificador / Cruz. Intergal. / CP lv 8.', desc_en: 'Amp / Inter. Cruiser / CP lvl 8.', requirements: ['laser_amp', 'inter_cruiser'], baseTime: '15d' },
    { id: 'mini_laser_racial', x: 1700, y: 1000, category: 'weapon', pt: 'Mini Laser Aprimorado', en: 'Enhanced Mini Laser', desc_pt: 'Racial Lithars - CP nv 9.', desc_en: 'Lithars Racial - CP lvl 9.', requirements: ['mini_laser'], baseTime: '20d' },
    { id: 'mini_balista', x: 1450, y: 1150, category: 'weapon', pt: 'Mini Balista', en: 'Mini Ballista', desc_pt: 'Vendetta / CP lv 8.', desc_en: 'Vendetta / CP lvl 8.', requirements: ['vendetta'], baseTime: '18d' },
    { id: 'mini_balista_racial', x: 1700, y: 1150, category: 'weapon', pt: 'Mini Balista Aprimorada', en: 'Enhanced Mini Ballista', desc_pt: 'Racial Aerials - CP nv 9.', desc_en: 'Aerials Racial - CP lvl 9.', requirements: ['mini_balista'], baseTime: '20d' },
    { id: 'aim_sys3', x: 1450, y: 1300, category: 'weapon', pt: 'Sistema de Mira III', en: 'Aiming System III', desc_pt: 'Mira II / Cruz. Intergal. / CP lv 7.', desc_en: 'Aim II / Inter. Cruiser / CP lvl 7.', requirements: ['aim_sys2', 'inter_cruiser'], baseTime: '18d' },
    { id: 'neutrinos', x: 1700, y: 1300, category: 'weapon', pt: 'Neutrinos', en: 'Neutrinos', desc_pt: 'Mini Balista / CP lv 8.', desc_en: 'Mini Ballista / CP lvl 8.', requirements: ['mini_balista'], baseTime: '21d' },
    { id: 'laser_jumbo', x: 1950, y: 1000, category: 'weapon', pt: 'Laser Jumbo', en: 'Jumbo Laser', desc_pt: 'Mini Laser / Hades / CP lv 9.', desc_en: 'Mini Laser / Hades / CP lvl 9.', requirements: ['mini_laser', 'hades'], baseTime: '24d' },
    { id: 'balista_jumbo', x: 1950, y: 1150, category: 'weapon', pt: 'Balista Jumbo', en: 'Jumbo Ballista', desc_pt: 'Mini Balista / Hades / CP lv 9.', desc_en: 'Mini Ballista / Hades / CP lvl 9.', requirements: ['mini_balista', 'hades'], baseTime: '24d' },
    { id: 'aim_comp3', x: 1700, y: 1450, category: 'weapon', pt: 'Computador Mira III', en: 'Aim Computer III', desc_pt: 'Mira II / Hades / CP lv 7.', desc_en: 'Aim II / Hades / CP lvl 7.', requirements: ['aim_comp2', 'hades'], baseTime: '25d' },

    // --- DEFENSE ROW (Y=1700-1900) ---
    { id: 'armor_reinf', x: 200, y: 1700, category: 'defense', pt: 'Casco Reforçado', en: 'Reinforced Hull', desc_pt: 'Vaivém.', desc_en: 'Shuttle.', requirements: ['vaivem'], baseTime: '-' },
    { id: 'shield_s1', x: 450, y: 1700, category: 'defense', pt: 'Escudo S1', en: 'Shield S1', desc_pt: 'Vaivém.', desc_en: 'Shuttle.', requirements: ['vaivem'], baseTime: '1d' },
    { id: 'blindagem1', x: 700, y: 1700, category: 'defense', pt: 'Blindagem I', en: 'Armor I', desc_pt: 'Laser L2.', desc_en: 'Laser L2.', requirements: ['laser_l2'], baseTime: '2d' },
    { id: 'armor_plated', x: 950, y: 1700, category: 'defense', pt: 'Casco Blindado', en: 'Plated Hull', desc_pt: 'Vaivém.', desc_en: 'Shuttle.', requirements: ['vaivem'], baseTime: '6d' },
    { id: 'shield_s2', x: 1200, y: 1700, category: 'defense', pt: 'Escudo S2', en: 'Shield S2', desc_pt: 'Escudo S1.', desc_en: 'Shield S1.', requirements: ['shield_s1'], baseTime: '4d' },
    { id: 'shield_s3', x: 1450, y: 1700, category: 'defense', pt: 'Escudo S3', en: 'Shield S3', desc_pt: 'Escudo S2.', desc_en: 'Shield S2.', requirements: ['shield_s2'], baseTime: '7d' },
    { id: 'blindagem2', x: 1700, y: 1700, category: 'defense', pt: 'Blindagem II', en: 'Armor II', desc_pt: 'Blindagem I / Cruzador.', desc_en: 'Armor I / Cruiser.', requirements: ['blindagem1', 'cruzador'], baseTime: '9d' },
    { id: 'shield_mk4', x: 1700, y: 1850, category: 'defense', pt: 'Escudo MK4', en: 'Shield MK4', desc_pt: 'Escudo S3.', desc_en: 'Shield S3.', requirements: ['shield_s3'], baseTime: '12d' },
    { id: 'shield_mk5', x: 1950, y: 1850, category: 'defense', pt: 'Escudo MK5', en: 'Shield MK5', desc_pt: 'Escudo MK4.', desc_en: 'Shield MK4.', requirements: ['shield_mk4'], baseTime: '19d' },
    { id: 'blindagem3', x: 1950, y: 1700, category: 'defense', pt: 'Blindagem III', en: 'Armor III', desc_pt: 'Blindagem II / Cruz. Intergal. / CP LVL 7.', desc_en: 'Armor II / Inter. Cruiser / CP LVL 7.', requirements: ['blindagem2', 'inter_cruiser'], baseTime: '21d' },
    { id: 'mini_shield', x: 2200, y: 1850, category: 'defense', pt: 'Escudo Mini', en: 'Mini Shield', desc_pt: 'Escudo MK5 / CP LVL 8.', desc_en: 'Shield MK5 / CP LVL 8.', requirements: ['shield_mk5'], baseTime: '23d' },
    { id: 'mini_shield_racial', x: 2450, y: 1850, category: 'defense', pt: 'Mini Escudo Aprimorado', en: 'Enhanced Mini Shield', desc_pt: 'Racial Mecalitas - CP nv 9.', desc_en: 'Mecalitas Racial - CP lvl 9.', requirements: ['mini_shield'], baseTime: '20d' },
    { id: 'jumbo_shield', x: 2700, y: 1850, category: 'defense', pt: 'Escudo Jumbo', en: 'Jumbo Shield', desc_pt: 'Escudo Mini / CP LVL 9.', desc_en: 'Mini Shield / CP LVL 9.', requirements: ['mini_shield'], baseTime: '28d' },


    // --- CHASSIS ROW (Y=2200-2400) ---
    { id: 'vaivem', x: 200, y: 2200, category: 'chassis', pt: 'Vaivém', en: 'Shuttle', desc_pt: 'Início.', desc_en: 'Starting.', baseTime: '-' },
    { id: 'caca', x: 450, y: 2200, category: 'chassis', pt: 'Caça', en: 'Fighter', desc_pt: 'Vaivém / Warp1.', desc_en: 'Shuttle / Warp1.', requirements: ['vaivem', 'warp1'], baseTime: '-' },
    { id: 'corveta', x: 700, y: 2200, category: 'chassis', pt: 'Corveta', en: 'Corvette', desc_pt: 'Caça.', desc_en: 'Fighter.', requirements: ['caca'], baseTime: '-' },
    { id: 'fragata', x: 950, y: 2200, category: 'chassis', pt: 'Fragata', en: 'Frigate', desc_pt: 'Corveta / Resfriamento Warp Adv.', desc_en: 'Corvette / Adv. Warp Cooling.', requirements: ['corveta', 'cooling'], baseTime: '-' },
    { id: 'inter_cruiser', x: 1200, y: 2200, category: 'chassis', pt: 'Cruzador Intergaláctico', en: 'Inter. Cruiser', desc_pt: 'Corveta.', desc_en: 'Corvette.', requirements: ['corveta'], baseTime: '-' },
    { id: 'battle_cruiser', x: 1450, y: 2200, category: 'chassis', pt: 'Cruzador de Batalha', en: 'Battle Cruiser', desc_pt: 'Intergaláctico / CP nv 5.', desc_en: 'Intergalactic / CP lvl 5.', requirements: ['inter_cruiser'], baseTime: '3d 12h' },
    { id: 'destruidor', x: 950, y: 2350, category: 'chassis', pt: 'Destruidor', en: 'Destroyer', desc_pt: 'Fragata / Casco Blindado.', desc_en: 'Frigate / Plated Hull.', requirements: ['fragata', 'armor_plated'], baseTime: '3d' },
    { id: 'cruzador', x: 1200, y: 2350, category: 'chassis', pt: 'Cruzador', en: 'Cruiser', desc_pt: 'Destruidor / Otimiz. Distorção / Escudo S2 / Cargo M.', desc_en: 'Destroyer / Distortion Opt / Shield S2 / Cargo M.', requirements: ['destruidor', 'distort_opt', 'shield_s2', 'cargo_m'], baseTime: '5d' },
    { id: 'interceptor', x: 1450, y: 2350, category: 'chassis', pt: 'Interceptor', en: 'Interceptor', desc_pt: 'Cruzador.', desc_en: 'Cruiser.', requirements: ['cruzador'], baseTime: '5d' },
    { id: 'warrior', x: 1700, y: 2200, category: 'chassis', pt: 'Guerreiro', en: 'Warrior', desc_pt: 'Cruz. Batalha / Destruidor.', desc_en: 'Battle Cruiser / Destroyer.', requirements: ['battle_cruiser', 'destruidor'], baseTime: '5d' },
    { id: 'explorer', x: 1700, y: 2350, category: 'chassis', pt: 'Explorador', en: 'Explorer', desc_pt: 'Centauro / CP lvl 8.', desc_en: 'Centaur / CP lvl 8.', requirements: ['centaur'], baseTime: '5d' },
    { id: 'centaur', x: 1950, y: 2200, category: 'chassis', pt: 'Centauro', en: 'Centaur', desc_pt: 'Guerreiro / Cruzador.', desc_en: 'Warrior / Cruiser.', requirements: ['warrior', 'cruzador'], baseTime: '10d' },
    { id: 'minotaur', x: 2200, y: 2200, category: 'chassis', pt: 'Minotauro', en: 'Minotaur', desc_pt: 'Centauro.', desc_en: 'Centaur.', requirements: ['centaur'], baseTime: '12d' },
    { id: 'titan', x: 2450, y: 2200, category: 'chassis', pt: 'Titã', en: 'Titan', desc_pt: 'Minotauro / CP lv 7.', desc_en: 'Minotaur / CP lvl 7.', requirements: ['minotaur'], baseTime: '15d' },
    { id: 'behemoth', x: 2700, y: 2200, category: 'chassis', pt: 'Beemote', en: 'Behemoth', desc_pt: 'Titã / CP lv 7.', desc_en: 'Titan / CP lvl 7.', requirements: ['titan'], baseTime: '16d' },
    { id: 'aurora_wing', x: 2450, y: 2350, category: 'chassis', pt: 'Asa Aurora', en: 'Aurora Wing', desc_pt: 'Titã / Explorador / CP lv 7.', desc_en: 'Titan / Explorer / CP lvl 7.', requirements: ['titan', 'explorer'], baseTime: '18d' },
    { id: 'hades', x: 2950, y: 2200, category: 'chassis', pt: 'Hades', en: 'Hades', desc_pt: 'Beemote / CP lv 8.', desc_en: 'Behemoth / CP lvl 8.', requirements: ['behemoth'], baseTime: '18d' },
    { id: 'inter_transporter', x: 2950, y: 2350, category: 'chassis', pt: 'Transp. Intergaláctico', en: 'Inter. Transporter', desc_pt: 'Leviatã / CP nv 10.', desc_en: 'Leviathan / CP lvl 10.', requirements: ['leviathan'], baseTime: '18d' },
    { id: 'leviathan', x: 3200, y: 2200, category: 'chassis', pt: 'Leviatã', en: 'Leviathan', desc_pt: 'Hades / CP nv 9.', desc_en: 'Hades / CP lvl 9.', requirements: ['hades'], baseTime: '21d' },

    // --- OTHER / UTILITY (Y=2800-3500) ---
    { id: 'ast_mk1', x: 200, y: 2800, category: 'other', pt: 'Laser Extrator MK1', en: 'Extractor MK1', desc_pt: 'Vaivém.', desc_en: 'Shuttle.', requirements: ['vaivem'], baseTime: '-' },
    { id: 'ast_mk2', x: 450, y: 2800, category: 'other', pt: 'Laser Extrator MK2', en: 'Extractor MK2', desc_pt: 'Laser MK1.', desc_en: 'Laser MK1.', requirements: ['ast_mk1'], baseTime: '1d 8h' },
    { id: 'debris1', x: 700, y: 2800, category: 'other', pt: 'Coletor Destroços', en: 'Debris Collector', desc_pt: 'Laser MK2.', desc_en: 'Laser MK2.', requirements: ['ast_mk2'], baseTime: '12h' },
    { id: 'mo1', x: 200, y: 2950, category: 'other', pt: 'Otimizador MO-1', en: 'Optimizer MO-1', desc_pt: 'Laser MK1.', desc_en: 'Laser MK1.', requirements: ['ast_mk1'], baseTime: '-' },
    { id: 'mo2', x: 450, y: 2950, category: 'other', pt: 'Otimizador MO-2', en: 'Optimizer MO-2', desc_pt: 'MO-1.', desc_en: 'MO-1.', requirements: ['mo1'], baseTime: '1d 12h' },
    { id: 'mo3', x: 700, y: 2950, category: 'other', pt: 'Otimizador MO-3', en: 'Optimizer MO-3', desc_pt: 'MO-2 / Laser L2.', desc_en: 'MO-2 / Laser L2.', requirements: ['mo2', 'laser_l2'], baseTime: '4d' },
    { id: 'cloak_opt', x: 950, y: 2800, category: 'other', pt: 'Camuflagem Óptica', en: 'Optical Cloak', desc_pt: 'Corveta.', desc_en: 'Corvette.', requirements: ['corveta'], baseTime: '3d' },
    { id: 'moonbase', x: 950, y: 2950, category: 'other', pt: 'Base Lunar', en: 'Moon Base', desc_pt: 'Expansão inicial.', desc_en: 'Initial expansion.', baseTime: '-' },
    { id: 'mts1', x: 1200, y: 2800, category: 'other', pt: 'MTS-1', en: 'MTS-1', desc_pt: 'Corveta.', desc_en: 'Corvette.', requirements: ['corveta'], baseTime: '-' },
    { id: 'tt1', x: 1200, y: 2950, category: 'other', pt: 'Transp. Tropas Básico', en: 'Basic Troop Trans.', desc_pt: 'Corveta.', desc_en: 'Corvette.', requirements: ['corveta'], baseTime: '12h' },
    { id: 'scanner1', x: 1450, y: 2800, category: 'other', pt: 'Scanner 1', en: 'Scanner 1', desc_pt: 'Sistemas de radar.', desc_en: 'Radar systems.', baseTime: '2d' },
    { id: 'mts2', x: 1450, y: 2950, category: 'other', pt: 'MTS-2', en: 'MTS-2', desc_pt: 'MTS-1 / Fragata.', desc_en: 'MTS-1 / Frigate.', requirements: ['mts1', 'fragata'], baseTime: '3d' },
    { id: 'ast_mk3', x: 1700, y: 2800, category: 'other', pt: 'Laser Extrator MK3', en: 'Extractor MK3', desc_pt: 'Laser MK2 / CP nv 6.', desc_en: 'Laser MK2 / CP lvl 6.', requirements: ['ast_mk2'], baseTime: '-' },
    { id: 'spy_station', x: 1700, y: 2950, category: 'other', pt: 'Estação Espionagem', en: 'Spy Station', desc_pt: 'Vigilância remota.', desc_en: 'Remote surveillance.', baseTime: '8d' },
    { id: 'cloak_quant', x: 1950, y: 2800, category: 'other', pt: 'Camuflagem Quântica', en: 'Quantum Cloak', desc_pt: 'Óptica / Cruz. Intergal.', desc_en: 'Optical / Inter. Cruiser.', requirements: ['cloak_opt', 'inter_cruiser'], baseTime: '-' },
    { id: 'colonization', x: 1950, y: 2950, category: 'other', pt: 'Tec. Colonização', en: 'Colonization Tech', desc_pt: 'Cruzador Intergaláctico.', desc_en: 'Intergalactic Cruiser.', requirements: ['inter_cruiser'], baseTime: '-' },
    { id: 'tt2', x: 2200, y: 2800, category: 'other', pt: 'TT2', en: 'TT2', desc_pt: 'TT Básico / Destruidor.', desc_en: 'Basic TT / Destroyer.', requirements: ['tt1', 'destruidor'], baseTime: '1d 18h' },
    { id: 'tt3', x: 2450, y: 2800, category: 'other', pt: 'TT3', en: 'TT3', desc_pt: 'TT2 / Cruzador.', desc_en: 'TT2 / Cruiser.', requirements: ['tt2', 'cruzador'], baseTime: '3d' },
    { id: 'debris2', x: 700, y: 3100, category: 'other', pt: 'Coletor Destroços 2', en: 'Debris Collector 2', desc_pt: 'Coletor / GPS3.', desc_en: 'Collector / GPS3.', requirements: ['debris1', 'gps3'], baseTime: '3d 12h' },
    { id: 'tt4', x: 2200, y: 2950, category: 'other', pt: 'TT4', en: 'TT4', desc_pt: 'TT2 / Interceptor.', desc_en: 'TT2 / Interceptor.', requirements: ['tt2', 'interceptor'], baseTime: '-' },
    { id: 'tt5', x: 2450, y: 2950, category: 'other', pt: 'TT5', en: 'TT5', desc_pt: 'TT3 / GPS4.', desc_en: 'TT3 / GPS4.', requirements: ['tt3', 'gps4'], baseTime: '-' },
    { id: 'mo_mini', x: 950, y: 3100, category: 'other', pt: 'MO-Mini', en: 'MO-Mini', desc_pt: 'MO-3 / Amp Laser / CP nv 8.', desc_en: 'MO-3 / Laser Amp / CP lvl 8.', requirements: ['mo3', 'laser_amp'], baseTime: '-' },
    { id: 'debris3', x: 700, y: 3250, category: 'other', pt: 'Coletor Destroços 3', en: 'Debris Collector 3', desc_pt: 'Coletor 2 / GPS3 / CP nv 7.', desc_en: 'Collector 2 / GPS3 / CP lvl 7.', requirements: ['debris2', 'gps3'], baseTime: '-' },
    { id: 'mts3', x: 1200, y: 3100, category: 'other', pt: 'MTS-3', en: 'MTS-3', desc_pt: 'MTS-2 / Cruz. Batalha.', desc_en: 'MTS-2 / Battle Cruiser.', requirements: ['mts2', 'battle_cruiser'], baseTime: '-' },
    { id: 'mini_debris', x: 1200, y: 3250, category: 'other', pt: 'Mini Coletor', en: 'Mini Collector', desc_pt: 'Coletor 3 / CP LVL 8.', desc_en: 'Collector 3 / CP LVL 8.', requirements: ['debris3'], baseTime: '-' },
    { id: 'mini_debris_racial', x: 1450, y: 3250, category: 'other', pt: 'Mini Coletor Aprimorado', en: 'Enhanced Mini Collector', desc_pt: 'Racial Abissais - CP nv 9.', desc_en: 'Abyssals Racial - CP lvl 9.', requirements: ['mini_debris'], baseTime: '20d' },
    { id: 'mini_ast_laser', x: 450, y: 3100, category: 'other', pt: 'Laser Extrator Mini', en: 'Mini Extractor Laser', desc_pt: 'Laser MK3 / CP LVL 8.', desc_en: 'Laser MK3 / CP LVL 8.', requirements: ['ast_mk3'], baseTime: '-' },
    { id: 'mini_ast_laser_racial', x: 450, y: 3250, category: 'other', pt: 'Mini Extrator Aprimorado', en: 'Enhanced Mini Extractor', desc_pt: 'Racial Nemorix - CP nv 9.', desc_en: 'Nemorix Racial - CP lvl 9.', requirements: ['mini_ast_laser'], baseTime: '20d' },
    { id: 'mars_col', x: 2700, y: 2950, category: 'other', pt: 'Colonização Marte', en: 'Mars Colonization', desc_pt: 'Base Lunar / Centauro.', desc_en: 'Moon Base / Centaur.', requirements: ['moonbase', 'centaur'], baseTime: '-' },
    { id: 'tt_mini', x: 2200, y: 3100, category: 'other', pt: 'TT Mini', en: 'Mini TT', desc_pt: 'TT4 / Cruz. Batalha / CP LVL 8.', desc_en: 'TT4 / Battle Cruiser / CP LVL 8.', requirements: ['tt4', 'battle_cruiser'], baseTime: '-' },
    { id: 'tt_mini_racial', x: 2200, y: 3250, category: 'other', pt: 'TT Mini Aprimorado', en: 'Enhanced Mini TT', desc_pt: 'Racial Silvae - CP nv 9.', desc_en: 'Silvae Racial - CP lvl 9.', requirements: ['tt_mini'], baseTime: '20d' },
    { id: 'mo_jumbo', x: 950, y: 3250, category: 'other', pt: 'MO-Jumbo', en: 'MO-Jumbo', desc_pt: 'MO-Mini / Mini Laser / CP LVL 9.', desc_en: 'MO-Mini / Mini Laser / CP LVL 9.', requirements: ['mo_mini', 'mini_laser'], baseTime: '-' },
    { id: 'mts_mini', x: 1450, y: 3100, category: 'other', pt: 'MTS-Mini', en: 'MTS-Mini', desc_pt: 'MTS-3 / Escudo Mini / CP LVL 8.', desc_en: 'MTS-3 / Mini Shield / CP LVL 8.', requirements: ['mts3', 'mini_shield'], baseTime: '-' },
    { id: 'portal', x: 1700, y: 3100, category: 'other', pt: 'Tec. Portal', en: 'Portal Tech', desc_pt: 'Espionagem / GPS3.', desc_en: 'Spying / GPS3.', requirements: ['spy_station', 'gps3'], baseTime: '-' },
    { id: 'cloak_nano', x: 1950, y: 3100, category: 'other', pt: 'Nanofibras Camuflagem', en: 'Nano Cloak', desc_pt: 'Quântica / Hades / CP LVL 7.', desc_en: 'Quantum / Hades / CP LVL 7.', requirements: ['cloak_quant', 'hades'], baseTime: '-' },
    { id: 'tt_jumbo', x: 2450, y: 3100, category: 'other', pt: 'TT Jumbo', en: 'Jumbo TT', desc_pt: 'Mini / Centauro / CP LVL 9.', desc_en: 'Mini / Centaur / CP LVL 9.', requirements: ['tt_mini', 'centaur'], baseTime: '-' },
    { id: 'debris_jumbo', x: 1450, y: 3250, category: 'other', pt: 'Coletor Jumbo', en: 'Jumbo Collector', desc_pt: 'Mini Coletor / CP LVL 9.', desc_en: 'Mini Collector / CP LVL 9.', requirements: ['mini_debris'], baseTime: '-' },
    { id: 'ast_jumbo', x: 450, y: 3400, category: 'other', pt: 'Extrator Jumbo', en: 'Jumbo Extractor', desc_pt: 'Mini Otimizada / CP LVL 9.', desc_en: 'Mini Optimized / CP LVL 9.', requirements: ['mini_ast_laser'], baseTime: '-' },
    { id: 'beyond', x: 2700, y: 3100, category: 'other', pt: 'Um Mundo Além', en: 'A World Beyond', desc_pt: 'Marte / Hades / CP LVL 9.', desc_en: 'Mars / Hades / CP LVL 9.', requirements: ['mars_col', 'hades'], baseTime: '-' },
    { id: 'jupiter', x: 2950, y: 3100, category: 'other', pt: 'Expansão Júpiter', en: 'Jupiter Expansion', desc_pt: 'Base Lunar / Jumbo Atk / CP LVL 9.', desc_en: 'Moon Base / Jumbo Atk / CP LVL 9.', requirements: ['moonbase', 'balista_jumbo', 'laser_jumbo', 'aim_comp3', 'aim_sys3'], baseTime: '-' },
    { id: 'neptune', x: 3200, y: 3100, category: 'other', pt: 'Posto Netuno', en: 'Neptune Outpost', desc_pt: 'Base Lunar / MW2 / CP LVL 9.', desc_en: 'Moon Base / MW2 / CP LVL 9.', requirements: ['moonbase', 'mw2'], baseTime: '-' },
    { id: 'uranus', x: 2950, y: 3250, category: 'other', pt: 'Assento Urano', en: 'Uranus Settlement', desc_pt: 'Base Lunar / Carga Jumbo / CP LVL 9.', desc_en: 'Moon Base / Jumbo Cargo / CP LVL 9.', requirements: ['moonbase', 'cargo_jumbo'], baseTime: '-' },
    { id: 'interstellar', x: 3200, y: 3250, category: 'other', pt: 'Coloniz. Interestelar', en: 'Interstellar Col.', desc_pt: 'Base Lunar / Jumbo Def / CP LVL 9.', desc_en: 'Moon Base / Jumbo Def / CP LVL 9.', requirements: ['moonbase', 'jumbo_shield', 'blindagem3'], baseTime: '-' },
    { id: 'mts_jumbo', x: 1450, y: 3400, category: 'other', pt: 'MTS Jumbo', en: 'Jumbo MTS', desc_pt: 'Mini / Asa Aurora / CP LVL 9.', desc_en: 'Mini / Aurora Wing / CP LVL 9.', requirements: ['mts_mini', 'aurora_wing'], baseTime: '-' },
    { id: 'tt_titan', x: 3450, y: 3100, category: 'other', pt: 'TT Titã', en: 'Titan TT', desc_pt: 'Jumbo / Leviatã / CP LVL 10.', desc_en: 'Jumbo / Leviathan / CP LVL 10.', requirements: ['tt_jumbo', 'leviathan'], baseTime: '-' },

];

export const CATEGORY_UI = {
    general: { color: 'text-sky-400', border: 'border-sky-400', bg: 'bg-sky-400/10', icon: <Building2 size={16} /> },
    engine: { color: 'text-lime-400', border: 'border-lime-400', bg: 'bg-lime-400/10', icon: <Zap size={16} /> },
    cargo: { color: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400/10', icon: <Boxes size={16} /> },
    weapon: { color: 'text-red-400', border: 'border-red-400', bg: 'bg-red-400/10', icon: <Crosshair size={16} /> },
    defense: { color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10', icon: <ShieldCheck size={16} /> },
    chassis: { color: 'text-amber-500', border: 'border-amber-500', bg: 'bg-amber-500/10', icon: <Target size={16} /> },
    other: { color: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400/10', icon: <Map size={16} /> },
};
