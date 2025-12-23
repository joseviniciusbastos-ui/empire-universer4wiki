import React, { useState, useRef } from 'react';
import { Button, Card } from '../ui/Shared';
import { Search, ZoomIn, ZoomOut, Maximize2, Cpu, Info, Boxes, Zap, Shield, Target, Globe, Landmark, ShieldCheck, Crosshair } from 'lucide-react';
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
        requirements: 'Pesquisa necessária:'
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
        requirements: 'Research required:'
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
        requirements: 'Recherche requise:'
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
    // --- CARGO ROW ---
    { id: 'cargo_s', x: 200, y: 150, category: 'cargo', pt: 'Carga S', en: 'Cargo S', desc_pt: 'Módulo de carga básico para transporte de bens e recursos.', desc_en: 'Basic cargo module for transporting goods and resources.' },
    { id: 'cargo_m', x: 450, y: 150, category: 'cargo', pt: 'Carga M', en: 'Cargo M', desc_pt: 'Módulo de carga melhorado com capacidade de transporte aprimorada.', desc_en: 'Improved cargo module with enhanced transport capacity.', requirements: ['vaivem'] },
    { id: 'cargo_l', x: 700, y: 150, category: 'cargo', pt: 'Carga L', en: 'Cargo L', desc_pt: 'Módulo de carga grande para transporte de cargas pesadas.', desc_en: 'Large cargo module for heavy load transport.', requirements: ['cargo_m'] },
    { id: 'cargo_xl', x: 950, y: 150, category: 'cargo', pt: 'Carga XL', en: 'Cargo XL', desc_pt: 'Módulo de carga extra-grande para operações de transporte massivo.', desc_en: 'Extra-large cargo module for massive transport operations.', requirements: ['cargo_l'] },
    { id: 'cargo_xl230', x: 1200, y: 150, category: 'cargo', pt: 'Carga XL-230', en: 'Cargo XL-230', desc_pt: 'Versão aprimorada do Cargo XL com otimizações de armazenamento.', desc_en: 'Enhanced version of Cargo XL with storage optimizations.', requirements: ['cargo_xl'] },
    { id: 'cargo_xl270', x: 1450, y: 150, category: 'cargo', pt: 'Carga XL-270', en: 'Cargo XL-270', desc_pt: 'Carga de altíssima capacidade com tecnologias de compressão.', desc_en: 'Very high capacity cargo with compression technologies.', requirements: ['cargo_xl230'] },
    { id: 'cargo_mini', x: 1700, y: 150, category: 'cargo', pt: 'Carga Mini', en: 'Mini Cargo', desc_pt: 'Tecnologia de miniaturização para armazenamento ultra-eficiente.', desc_en: 'Miniaturization technology for ultra-efficient storage.', requirements: ['cargo_xl270'] },
    { id: 'cargo_jumbo', x: 1950, y: 150, category: 'cargo', pt: 'Carga Jumbo', en: 'Jumbo Cargo', desc_pt: 'A maior carga disponível, capaz de transportar quantidades industriais.', desc_en: 'Largest cargo available, capable of transporting industrial quantities.', requirements: ['cargo_mini'] },

    // --- ENGINE ROW ---
    { id: 'gps1', x: 200, y: 400, category: 'engine', pt: 'GPS 1', en: 'Propulsion 1', desc_pt: 'Sistema de propulsão básico para viagens espaciais.', desc_en: 'Basic propulsion system for space travel.' },
    { id: 'gps2', x: 450, y: 400, category: 'engine', pt: 'GPS 2', en: 'Propulsion 2', desc_pt: 'Motor aprimorado por Deltan, mais potente e menos consumidor.', desc_en: 'Enhanced engine by Deltan, more powerful and efficient.', requirements: ['gps1'] },
    { id: 'gps3', x: 700, y: 400, category: 'engine', pt: 'GPS 3', en: 'Propulsion 3', desc_pt: 'Motor Deltan de nova geração, mais potente e econômico.', desc_en: 'Next-gen Deltan engine, more powerful and economical.', requirements: ['gps2'] },
    { id: 'gps4', x: 950, y: 400, category: 'engine', pt: 'GPS 4', en: 'Propulsion 4', desc_pt: 'Motor Deltan de nova geração, potente e eficiente.', desc_en: 'New generation Deltan engine, powerful and efficient.', requirements: ['gps3'] },
    { id: 'gps5', x: 1200, y: 400, category: 'engine', pt: 'GPS 5', en: 'Propulsion 5', desc_pt: 'O ápice da tecnologia de propulsão Deltan.', desc_en: 'The pinnacle of Deltan propulsion technology.', requirements: ['gps4'] },
    { id: 'warp1', x: 450, y: 550, category: 'engine', pt: 'Warp 1', en: 'Warp 1', desc_pt: 'Primeiro motor de distorção espacial permitindo viagem mais rápida que a luz.', desc_en: 'First space distortion engine allowing faster-than-light travel.' },
    { id: 'cooling', x: 700, y: 550, category: 'engine', pt: 'Resfriamento Warp Avançado', en: 'Advanced Warp Cooling', desc_pt: 'Sistema de resfriamento avançado permitindo viagens mais longas sem superaquecimento.', desc_en: 'Advanced cooling system allowing longer travels without overheating.', requirements: ['warp1'] },
    { id: 'distort_opt', x: 950, y: 550, category: 'engine', pt: 'Otimização de Distorção Espacial', en: 'Spatial Distortion Opt.', desc_pt: 'Distorção espacial otimizada reduzindo consumo e aumentando velocidade.', desc_en: 'Optimized spatial distortion reducing consumption and increasing speed.', requirements: ['cooling'] },
    { id: 'stable_multi', x: 1200, y: 550, category: 'engine', pt: 'Estabilização Multidimencional', en: 'Multidim. Stabilization', desc_pt: 'Sistema de estabilização avançado para navegar em condições espaciais difíceis.', desc_en: 'Advanced stabilization system to navigate in difficult space conditions.', requirements: ['distort_opt'] },
    { id: 'warp5', x: 1450, y: 550, category: 'engine', pt: 'Warp 5', en: 'Warp 5', desc_pt: 'Motor warp definitivo permitindo viagem mais rápida que a luz com eficiência incomparável.', desc_en: 'Ultimate warp engine allowing faster-than-light travel with incomparable efficiency.', requirements: ['stable_multi'] },
    { id: 'mini_warp', x: 1700, y: 550, category: 'engine', pt: 'Mini Warp', en: 'Mini Warp', desc_pt: 'Motor warp compacto e eficiente para viagem mais rápida que a luz.', desc_en: 'Compact and efficient warp engine for faster-than-light travel.', requirements: ['warp5'] },
    { id: 'mw2', x: 1950, y: 550, category: 'engine', pt: 'MW2', en: 'MW2', desc_pt: 'Mini Warp de segunda geração com eficiência aprimorada.', desc_en: 'Second generation Mini Warp with improved efficiency.', requirements: ['mini_warp'] },

    // --- WEAPON ROW ---
    { id: 'laser_l1', x: 200, y: 850, category: 'weapon', pt: 'Laser L1', en: 'Laser L1', desc_pt: 'Arma laser básica usando tecnologia fotônica.', desc_en: 'Basic laser weapon using photonic technology.', requirements: ['vaivem'] },
    { id: 'laser_l2', x: 450, y: 850, category: 'weapon', pt: 'Laser L2', en: 'Laser L2', desc_pt: 'Laser aprimorado com potência e precisão aumentadas.', desc_en: 'Enhanced laser with increased power and precision.', requirements: ['laser_l1', 'corveta'] },
    { id: 'laser_amp', x: 700, y: 850, category: 'weapon', pt: 'Amplificador de Feixe Laser', en: 'Laser Beam Amplifier', desc_pt: 'Tecnologia de amplificação permitindo lasers com taxa de disparo e precisão melhoradas.', desc_en: 'Amplification technology allowing lasers with improved fire rate and precision.', requirements: ['laser_l2', 'cruzador'] },
    { id: 'mini_laser', x: 950, y: 850, category: 'weapon', pt: 'Mini Laser', en: 'Mini Laser', desc_pt: 'Laser muito poderoso capaz de destruir naves em alta frequência, precisão comprometida.', desc_en: 'Very powerful laser capable of destroying ships in high frequency, compromised precision.', requirements: ['laser_amp', 'inter_cruiser'] },
    { id: 'laser_jumbo', x: 1200, y: 850, category: 'weapon', pt: 'Laser Jumbo', en: 'Jumbo Laser', desc_pt: 'Laser extremamente poderoso capaz de obliterar naves em alta frequência.', desc_en: 'Extremely powerful laser capable of obliterating ships in high frequency.', requirements: ['mini_laser', 'hades'] },
    { id: 'balista', x: 700, y: 750, category: 'weapon', pt: 'Balista', en: 'Ballista', desc_pt: 'Lançador de foguetes avançado para ataques de longo alcance.', desc_en: 'Advanced rocket launcher for long-range attacks.', requirements: ['laser_l2'] },
    { id: 'sniper', x: 950, y: 750, category: 'weapon', pt: 'Sniper', en: 'Sniper', desc_pt: 'Lançador de foguetes de precisão infligindo dano significativo ao casco.', desc_en: 'Precision rocket launcher inflicting significant hull damage.', requirements: ['balista'] },
    { id: 'vendetta', x: 1200, y: 750, category: 'weapon', pt: 'Vendetta', en: 'Vendetta', desc_pt: 'Lançador de foguetes otimizado disparando mísseis A123-D precisos.', desc_en: 'Optimized rocket launcher firing precise A123-D missiles.', requirements: ['sniper'] },
    { id: 'mini_balista', x: 1450, y: 750, category: 'weapon', pt: 'Mini Balista', en: 'Mini Ballista', desc_pt: 'Lançador de foguetes miniaturizado mas poderoso causando dano devastador ao casco.', desc_en: 'Miniaturized but powerful rocket launcher causing devastating hull damage.', requirements: ['vendetta'] },
    { id: 'balista_jumbo', x: 1700, y: 750, category: 'weapon', pt: 'Balista Jumbo', en: 'Jumbo Ballista', desc_pt: 'Lançador de foguetes de escala industrial com ogivas de alto impacto, capaz de disparar salvas de mísseis guiados.', desc_en: 'Industrial scale rocket launcher with high impact warheads, capable of firing guided missile salvos.', requirements: ['neutrinos', 'hades'] },
    { id: 'neutrinos', x: 1700, y: 850, category: 'weapon', pt: 'Neutrinos', en: 'Neutrinos', desc_pt: 'Arma de partículas avançada disparando feixes concentrados de neutrinos para perfurar escudos inimigos.', desc_en: 'Advanced particle weapon firing concentrated neutrino beams to pierce enemy shields.', requirements: ['mini_balista'] },
    { id: 'aim_sys1', x: 700, y: 950, category: 'weapon', pt: 'Sistema de Mira I', en: 'Aiming System I', desc_pt: 'Sistema de mira avançado aumentando dano crítico em 15%.', desc_en: 'Advanced aiming system increasing critical damage by 15%.', requirements: ['laser_l2'] },
    { id: 'aim_sys2', x: 950, y: 950, category: 'weapon', pt: 'Sistema de Mira II', en: 'Aiming System II', desc_pt: 'Sistema de mira aprimorado aumentando dano crítico em 30%.', desc_en: 'Enhanced aiming system increasing critical damage by 30%.', requirements: ['aim_sys1', 'cruzador'] },
    { id: 'aim_sys3', x: 1200, y: 950, category: 'weapon', pt: 'Sistema de Mira III', en: 'Aiming System III', desc_pt: 'Sistema de mira de elite aumentando dano crítico em 50%', desc_en: 'Elite aiming system increasing critical damage by 50%', requirements: ['aim_sys2', 'inter_cruiser'] },
    { id: 'aim_comp1', x: 700, y: 1050, category: 'weapon', pt: 'Computador de Mira I', en: 'Aiming Computer I', desc_pt: 'Computador tático aumentando chance de acerto crítico em 3%.', desc_en: 'Tactical computer increasing critical hit chance by 3%.', requirements: ['laser_l2'] },
    { id: 'aim_comp2', x: 950, y: 1050, category: 'weapon', pt: 'Computador de Mira II', en: 'Aiming Computer II', desc_pt: 'Computador avançado aumentando chance de acerto crítico em 6%.', desc_en: 'Advanced computer increasing critical hit chance by 6%.', requirements: ['aim_comp1', 'cruzador'] },
    { id: 'aim_comp3', x: 1200, y: 1050, category: 'weapon', pt: 'Computador de Mira III', en: 'Aiming Computer III', desc_pt: 'Computador de elite aumentando chance de acerto crítico em 10%', desc_en: 'Elite computer increasing critical hit chance by 10%', requirements: ['aim_comp2', 'hades'] },

    // --- DEFENSE ROW ---
    { id: 'armor_reinf', x: 200, y: 1250, category: 'defense', pt: 'Casco Reforçado', en: 'Reinforced Hull', desc_pt: 'Blindagem básica melhorando resistência estrutural da nave.', desc_en: 'Basic armor improving structural resistance of the ship.', requirements: ['vaivem'] },
    { id: 'armor_plated', x: 450, y: 1250, category: 'defense', pt: 'Casco Blindado', en: 'Plated Hull', desc_pt: 'Blindagem avançada resistente aos impactos mais violentos.', desc_en: 'Advanced armor resistant to the most violent impacts.', requirements: ['vaivem'] },
    { id: 'shield_s1', x: 200, y: 1400, category: 'defense', pt: 'Escudo S1', en: 'Shield S1', desc_pt: 'Gerador de escudo de energia de primeira geração.', desc_en: 'First-generation energy shield generator.', requirements: ['vaivem'] },
    { id: 'shield_s2', x: 450, y: 1400, category: 'defense', pt: 'Escudo S2', en: 'Shield S2', desc_pt: 'Escudo aprimorado com melhor eficiência energética.', desc_en: 'Enhanced shield with better energy efficiency.', requirements: ['shield_s1'] },
    { id: 'shield_s3', x: 700, y: 1400, category: 'defense', pt: 'Escudo S3', en: 'Shield S3', desc_pt: 'Escudo avançado oferecendo proteção aumentada.', desc_en: 'Advanced shield offering increased protection.', requirements: ['shield_s2'] },
    { id: 'shield_mk4', x: 950, y: 1400, category: 'defense', pt: 'Escudo Mk4', en: 'Shield Mk4', desc_pt: 'Geração superior de escudos com dissipação de energia otimizada.', desc_en: 'Superior generation of shields with optimized energy dissipation.', requirements: ['shield_s3'] },
    { id: 'shield_mk5', x: 1200, y: 1400, category: 'defense', pt: 'Escudo Mk5', en: 'Shield Mk5', desc_pt: 'Escudo de última geração com eficiência máxima.', desc_en: 'Latest generation shield with maximum efficiency.', requirements: ['shield_mk4'] },
    { id: 'mini_shield', x: 1450, y: 1400, category: 'defense', pt: 'Escudo Mini', en: 'Mini Shield', desc_pt: 'Tecnologia de miniaturização de escudos para redundância extrema.', desc_en: 'Shield miniaturization technology for extreme redundancy.', requirements: ['shield_mk5'] },
    { id: 'jumbo_shield', x: 1700, y: 1400, category: 'defense', pt: 'Escudo Jumbo', en: 'Jumbo Shield', desc_pt: 'Gerador de escudo de escala planetária para naves capitais.', desc_en: 'Planetary scale shield generator for capital ships.', requirements: ['mini_shield'] },
    { id: 'blindagem1', x: 700, y: 1250, category: 'defense', pt: 'Blindagem I', en: 'Armor I', desc_pt: 'Blindagem reforçada reduzindo dano crítico recebido em 10%.', desc_en: 'Reinforced armor reducing critical damage received by 10%.', requirements: ['laser_l2'] },
    { id: 'armor2', x: 950, y: 1250, category: 'defense', pt: 'Blindagem II', en: 'Armor II', desc_pt: 'Blindagem avançada reduzindo dano crítico recebido em 20%.', desc_en: 'Advanced armor reducing critical damage received by 20%.', requirements: ['blindagem1', 'cruzador'] },
    { id: 'armor3', x: 1200, y: 1250, category: 'defense', pt: 'Blindagem III', en: 'Armor III', desc_pt: 'Blindagem de elite reduzindo dano crítico recebido em 35%', desc_en: 'Elite armor reducing critical damage received by 35%', requirements: ['armor2', 'inter_cruiser'] },

    // --- CHASSIS ROW ---
    { id: 'vaivem', x: 200, y: 1700, category: 'chassis', pt: 'Vaivém', en: 'Shuttle', desc_pt: 'Pequena nave básica, ideal para iniciar exploração espacial.', desc_en: 'Small basic ship, ideal for starting space exploration.' },
    { id: 'caca', x: 450, y: 1700, category: 'chassis', pt: 'Caça', en: 'Fighter', desc_pt: 'Nave de combate leve, rápida e manobrável.', desc_en: 'Light combat ship, fast and maneuverable.', requirements: ['vaivem', 'warp1'] },
    { id: 'corveta', x: 700, y: 1700, category: 'chassis', pt: 'Corveta', en: 'Corvette', desc_pt: 'Nave versátil equilibrando velocidade e poder de fogo.', desc_en: 'Versatile ship balancing speed and firepower.', requirements: ['caca'] },
    { id: 'fragata', x: 950, y: 1700, category: 'chassis', pt: 'Fragata', en: 'Frigate', desc_pt: 'Nave de guerra média com boas capacidades defensivas.', desc_en: 'Medium warship with good defensive capabilities.', requirements: ['corveta', 'cooling'] },
    { id: 'destruidor', x: 1200, y: 1700, category: 'chassis', pt: 'Destruidor', en: 'Destroyer', desc_pt: 'Nave de combate pesada especializada em destruição.', desc_en: 'Heavy combat ship specialized in destruction.', requirements: ['fragata', 'armor_plated'] },
    { id: 'cruzador', x: 1450, y: 1700, category: 'chassis', pt: 'Cruzador', en: 'Cruiser', desc_pt: 'Grande nave de guerra versátil para missões prolongadas.', desc_en: 'Large versatile warship for prolonged missions.', requirements: ['destruidor', 'distort_opt', 'shield_s2', 'cargo_m'] },
    { id: 'inter_cruiser', x: 1700, y: 1700, category: 'chassis', pt: 'Cruzador Intergaláctico', en: 'Intergalactic Cruiser', desc_pt: 'Nave de longo alcance para exploração intergaláctica.', desc_en: 'Long-range ship for intergalactic exploration.', requirements: ['cruzador'] },
    { id: 'battle_cruiser', x: 1950, y: 1700, category: 'chassis', pt: 'Cruzador de Batalha', en: 'Battle Cruiser', desc_pt: 'Cruzador especialmente otimizado para batalhas espaciais.', desc_en: 'Cruiser especially optimized for space battles.', requirements: ['inter_cruiser'] },
    { id: 'interceptor', x: 1700, y: 1850, category: 'chassis', pt: 'Interceptor', en: 'Interceptor', desc_pt: 'Nave rápida projetada para interceptação inimiga.', desc_en: 'Fast ship designed for enemy interception.', requirements: ['cruzador'] },
    { id: 'warrior', x: 2200, y: 1700, category: 'chassis', pt: 'Guerreiro', en: 'Warrior', desc_pt: 'Nave de guerra formidável com capacidades de combate excepcionais.', desc_en: 'Formidable warship with exceptional combat capabilities.', requirements: ['battle_cruiser', 'destruidor'] },
    { id: 'explorer', x: 1450, y: 1850, category: 'chassis', pt: 'Explorador', en: 'Explorer', desc_pt: 'Nave de exploração de longo alcance equipada com sensores avançados.', desc_en: 'Long-range exploration ship equipped with advanced sensors.', requirements: ['vaivem'] },
    { id: 'minotaur', x: 2200, y: 1850, category: 'chassis', pt: 'Minotauro', en: 'Minotaur', desc_pt: 'Cruzador pesado projetado para resistência extrema.', desc_en: 'Heavy cruiser designed for extreme endurance.', requirements: ['warrior'] },
    { id: 'titan', x: 2450, y: 1700, category: 'chassis', pt: 'Titã', en: 'Titan', desc_pt: 'Nave colossal representando o ápice da tecnologia militar.', desc_en: 'Colossal ship representing the pinnacle of military technology.', requirements: ['minotaur'] },
    { id: 'behemoth', x: 2700, y: 1700, category: 'chassis', pt: 'Beemote', en: 'Behemoth', desc_pt: 'Beemote espacial com dimensões impressionantes.', desc_en: 'Space behemoth with impressive dimensions.', requirements: ['titan'] },
    { id: 'hades', x: 2950, y: 1700, category: 'chassis', pt: 'Hades', en: 'Hades', desc_pt: 'Encouraçado aterrorizante semeando destruição em seu rastro.', desc_en: 'Terrifying battleship sowing destruction in its wake.', requirements: ['behemoth'] },
    { id: 'leviathan', x: 3200, y: 1700, category: 'chassis', pt: 'Leviatã', en: 'Leviathan', desc_pt: 'A maior nave de guerra já projetada.', desc_en: 'The largest warship ever designed.', requirements: ['hades'] },
    { id: 'aurora_wing', x: 2450, y: 1850, category: 'chassis', pt: 'Asa Aurora', en: 'Aurora Wing', desc_pt: 'Nave elegante com tecnologias avançadas da Aurora Corporation.', desc_en: 'Elegant ship with advanced technologies from Aurora Corporation.', requirements: ['titan', 'explorer'] },
    { id: 'intergal_transp', x: 3450, y: 1700, category: 'chassis', pt: 'Transportador Intergaláctico', en: 'Intergalactic Transport', desc_pt: 'Nave de transporte massiva para viagens intergalácticas.', desc_en: 'Massive transport ship for intergalactic travel.', requirements: ['leviathan'] },
    { id: 'centaur', x: 2200, y: 2000, category: 'chassis', pt: 'Centauro', en: 'Centaur', desc_pt: 'Cruzador versátil focado em escolta e logística.', desc_en: 'Versatile cruiser focused on escort and logistics.', requirements: ['inter_cruiser'] },

    // --- GENERAL / STRUCTURES ---
    { id: 'shipbuilder', x: 200, y: 2200, category: 'general', pt: 'Desbloquear Construtor de Naves', en: 'Unlock Shipbuilder', desc_pt: 'Redescobrir os segredos de construção naval para reacender as chamas da exploração.', desc_en: 'Rediscover the secrets of shipbuilding to rekindle exploration.' },
    { id: 'mines', x: 450, y: 2200, category: 'general', pt: 'Desbloquear Minas Planetárias', en: 'Unlock Planetary Mines', desc_pt: 'Aproveitar recursos minerais enterrados para alimentar o crescimento do império.', desc_en: 'Harness buried mineral resources to fuel empire growth.' },
    { id: 'uni', x: 700, y: 2200, category: 'general', pt: 'Desbloquear Universidade', en: 'Unlock University', desc_pt: 'Reabrir universidades para iluminar o povo e avançar a civilização.', desc_en: 'Reopen universities to enlighten the people and advance civilization.' },
    { id: 'barracks', x: 950, y: 2200, category: 'general', pt: 'Desbloquear Quartel', en: 'Unlock Barracks', desc_pt: 'Redescobrir táticas militares e estabelecer campos de treinamento.', desc_en: 'Rediscover military tactics and establish training fields.' },

    { id: 'military_eff1', x: 200, y: 2400, category: 'general', pt: 'Eficiência Militar I', en: 'Military Efficiency I', desc_pt: 'Otimizar processos de recrutamento para reduzir custos de treinamento em 20%.', desc_en: 'Optimize recruitment processes to reduce training costs by 20%.', requirements: ['barracks'] },
    { id: 'military_eff2', x: 450, y: 2400, category: 'general', pt: 'Eficiência Militar II', en: 'Military Efficiency II', desc_pt: 'Aperfeiçoar métodos de treinamento para reduzir custos de treinamento em 35%.', desc_en: 'Perfect training methods to reduce training costs by 35%.', requirements: ['military_eff1'] },
    { id: 'mass_recruiting1', x: 700, y: 2400, category: 'general', pt: 'Recrutamento em Massa I', en: 'Mass Recruitment I', desc_pt: 'Programas de recrutamento intensivo permitindo 50% mais soldados por sessão.', desc_en: 'Intensive recruitment programs allowing 50% more soldiers per session.', requirements: ['barracks'] },
    { id: 'mass_recruiting2', x: 950, y: 2400, category: 'general', pt: 'Recrutamento em Massa II', en: 'Mass Recruitment II', desc_pt: 'Dominar o recrutamento em massa para dobrar a capacidade de treinamento.', desc_en: 'Master mass recruitment to double training capacity.', requirements: ['mass_recruiting1'] },
    { id: 'adv_logistics', x: 1200, y: 2400, category: 'general', pt: 'Logística Avançada', en: 'Advanced Logistics', desc_pt: 'Revolucionar a gestão logística para reduzir tempo de treinamento em 25%.', desc_en: 'Revolutionize logistics management to reduce training time by 25%.', requirements: ['barracks'] },

    { id: 'mining1', x: 200, y: 2600, category: 'general', pt: 'Técnicas de Mineração I', en: 'Mining Tech I', desc_pt: 'Melhorias básicas na eficiência de mineração. Aumenta produção em 5%.', desc_en: 'Basic mining efficiency improvements. Increases production by 5%.', requirements: ['mines'] },
    { id: 'mining2', x: 450, y: 2600, category: 'general', pt: 'Técnicas de Mineração II', en: 'Mining Tech II', desc_pt: 'Equipamento de perfuração avançado e sistemas de triagem automatizados. +10% produção.', desc_en: 'Advanced drilling equipment and automated sorting systems. +10% production.', requirements: ['mining1'] },
    { id: 'mining3', x: 700, y: 2600, category: 'general', pt: 'Técnicas de Mineração III', en: 'Mining Tech III', desc_pt: 'Tecnologia de perfuração a plasma e refinamento em nível molecular. +15% produção.', desc_en: 'Plasma drilling technology and molecular-level refinement. +15% production.', requirements: ['mining2'] },
    { id: 'mining4', x: 950, y: 2600, category: 'general', pt: 'Técnicas de Mineração IV', en: 'Mining Tech IV', desc_pt: 'Métodos de extração quântica para extração de recursos mais profunda. +20% produção.', desc_en: 'Quantum extraction methods for deeper resource extraction. +20% production.', requirements: ['mining3'] },
    { id: 'adv_mining_ops', x: 1200, y: 2600, category: 'general', pt: 'Operações de Mineração Avançadas', en: 'Advanced Mining Ops', desc_pt: 'Tecnologia revolucionária com drones de escavação controlados por IA. +30% produção.', desc_en: 'Revolutionary technology with AI-controlled excavation drones. +30% production.', requirements: ['mining4'] },
    { id: 'nano_mining', x: 1450, y: 2600, category: 'general', pt: 'Mineração Nanotecnológica', en: 'Nanotech Mining', desc_pt: 'Nanorrobôs extraindo recursos em nível molecular. +40% produção.', desc_en: 'Nanorobots extracting resources at molecular level. +40% production.', requirements: ['adv_mining_ops'] },
    { id: 'dim_mining', x: 1700, y: 2600, category: 'general', pt: 'Mineração Dimensional', en: 'Dimensional Mining', desc_pt: 'Extração de recursos de outras dimensões para bônus massivos.', desc_en: 'Resource extraction from other dimensions for massive bonuses.', requirements: ['nano_mining'] },
    { id: 'singularity_harvest', x: 1950, y: 2600, category: 'general', pt: 'Colheita de Singularidade', en: 'Singularity Harvest', desc_pt: 'Aproveitando micro-singularidades para eficiência extrema. +80% produção.', desc_en: 'Harnessing micro-singularities for extreme efficiency. +80% production.', requirements: ['dim_mining'] },
    { id: 'transcendent_domain', x: 2200, y: 2600, category: 'general', pt: 'Domínio Transcendente de Recursos', en: 'Transcendent Resource Domain', desc_pt: 'Tecnologia definitiva manipulando forças fundamentais. Dobra a produção (+100%).', desc_en: 'Ultimate technology manipulating fundamental forces. Doubles production (+100%).', requirements: ['singularity_harvest'] },

    // --- OTHER / UTILITY ---
    { id: 'scanner1', x: 200, y: 3000, category: 'other', pt: 'Scanner 1', en: 'Scanner 1', desc_pt: 'Scanner permitindo exploração da galáxia.', desc_en: 'Scanner allowing galaxy exploration.' },
    { id: 'spy_station', x: 450, y: 3000, category: 'other', pt: 'Estação de Espionagem', en: 'Spy Station', desc_pt: 'Módulo permitindo construção de uma estação de espionagem.', desc_en: 'Module allowing construction of a spy station.' },
    { id: 'camuflage', x: 700, y: 3000, category: 'other', pt: 'Camuflagem Óptica', en: 'Optical Camouflage', desc_pt: 'Camuflagem de primeira geração usando distorção óptica avançada.', desc_en: 'First-generation camouflage using advanced optical distortion.', requirements: ['corveta'] },
    { id: 'quantum_camu', x: 950, y: 3000, category: 'other', pt: 'Camuflagem Quântica', en: 'Quantum Camouflage', desc_pt: 'Segunda geração usando bloqueadores quânticos.', desc_en: 'Second generation using quantum blockers.', requirements: ['camuflage', 'inter_cruiser'] },
    { id: 'camu_nanofibers', x: 1200, y: 3000, category: 'other', pt: 'Nanofibras de Camuflagem', en: 'Camouflage Nanofibers', desc_pt: 'Terceira geração usando redes de nanofibras ópticas.', desc_en: 'Third generation using optical nanofiber networks.', requirements: ['quantum_camu', 'hades'] },
    { id: 'portal_tech', x: 1450, y: 3000, category: 'other', pt: 'Tecnologia Portal', en: 'Portal Technology', desc_pt: 'Tecnologia de manipulação espacial avançada permitindo criação de buracos de minhoca estáveis.', desc_en: 'Advanced spatial manipulation technology allowing the creation of stable wormholes.', requirements: ['spy_station', 'gps3'] },

    { id: 'ast_mk1', x: 200, y: 3150, category: 'other', pt: 'Laser de Extração MK1', en: 'Asteroid Laser MK1', desc_pt: 'Laser de última geração projetado para extrair recursos de asteroides.', desc_en: 'Latest generation laser designed to extract resources from asteroids.', requirements: ['vaivem'] },
    { id: 'ast_mk2', x: 450, y: 3150, category: 'other', pt: 'Laser de Extração MK2', en: 'Asteroid Laser MK2', desc_pt: 'Versão aprimorada do laser de extração com eficiência e alcance aumentados.', desc_en: 'Enhanced version of the extraction laser with increased efficiency and range.', requirements: ['ast_mk1'] },
    { id: 'ast_mk3', x: 700, y: 3150, category: 'other', pt: 'Laser de Extração MK3', en: 'Asteroid Laser MK3', desc_pt: 'Laser de extração definitivo combinando tecnologia avançada e eficiência energética.', desc_en: 'Ultimate extraction laser combining advanced tech and energy efficiency.', requirements: ['ast_mk2'] },
    { id: 'extract_laser_mini_opt', x: 950, y: 3150, category: 'other', pt: 'Laser de Extração Mini Otimizado', en: 'Mini Optimized Extraction Laser', desc_pt: 'Laser de extração miniaturizado com focalização quântica.', desc_en: 'Miniaturized extraction laser with quantum focusing.', requirements: ['ast_mk3'] },
    { id: 'extract_laser_jumbo_opt', x: 1200, y: 3150, category: 'other', pt: 'Laser de Extração Jumbo Otimizado', en: 'Jumbo Optimized Extraction Laser', desc_pt: 'Laser de extração massivo mas altamente eficiente da Mintek Corporation.', desc_en: 'Massive but highly efficient extraction laser from Mintek Corporation.', requirements: ['extract_laser_mini_opt'] },

    { id: 'coletor1', x: 950, y: 3300, category: 'other', pt: 'Coletor de Destroços', en: 'Debris Collector', desc_pt: 'Módulo permitindo coleta de destroços de detritos espaciais.', desc_en: 'Module allowing debris collection from space junk.', requirements: ['ast_mk2'] },
    { id: 'coletor2', x: 1200, y: 3300, category: 'other', pt: 'Coletor de Destroços 2', en: 'Debris Collector 2', desc_pt: 'Versão aprimorada do coletor de destroços com eficiência aumentada.', desc_en: 'Enhanced version of the debris collector with increased efficiency.', requirements: ['coletor1', 'gps3'] },
    { id: 'coletor3', x: 1450, y: 3300, category: 'other', pt: 'Coletor de Destroços 3', en: 'Debris Collector 3', desc_pt: 'Coletor de destroços de terceira geração com desempenho ótimo.', desc_en: 'Third generation debris collector with optimal performance.', requirements: ['coletor2', 'gps3'] },

    { id: 'troop_trans1', x: 200, y: 3450, category: 'other', pt: 'Transporte de Tropas Básico', en: 'Basic Troop Transport', desc_pt: 'Compartimentos de transporte seguros para desdobrar 50 soldados.', desc_en: 'Secure transport compartments to deploy 50 soldiers.', requirements: ['corveta'] },
    { id: 'troop_trans2', x: 450, y: 3450, category: 'other', pt: 'Transporte Avançado TT2', en: 'Advanced Transport TT2', desc_pt: 'Módulo de transporte aprimorado permitindo 150 soldados.', desc_en: 'Enhanced transport module allowing 150 soldiers.', requirements: ['destruidor', 'troop_trans1'] },
    { id: 'troop_trans3', x: 700, y: 3450, category: 'other', pt: 'Transporte Massivo TT3', en: 'Massive Transport TT3', desc_pt: 'Tecnologia de ponta para transportar até 300 soldados.', desc_en: 'Cutting-edge technology to transport up to 300 soldiers.', requirements: ['troop_trans2', 'inter_cruiser'] },
    { id: 'troop_trans4', x: 950, y: 3450, category: 'other', pt: 'Transporte Tático TT4', en: 'Tactical Transport TT4', desc_pt: 'Módulos ultra-seguros para 300 soldados com equipamento completo.', desc_en: 'Ultra-secure modules for 300 soldiers with full equipment.', requirements: ['troop_trans2'] },
    { id: 'troop_trans_mini', x: 1200, y: 3450, category: 'other', pt: 'Transporte de Tropas Mini', en: 'Mini Troop Transport', desc_pt: 'Transporte compacto de alta eficiência para desdobramentos rápidos.', desc_en: 'High-efficiency compact transport for rapid deployments.', requirements: ['troop_trans4', 'battle_cruiser'] },
    { id: 'troop_trans_jumbo', x: 1450, y: 3450, category: 'other', pt: 'Transporte de Tropas Jumbo', en: 'Jumbo Troop Transport', desc_pt: 'Transporte gigante para operações militares de larga escala.', desc_en: 'Giant transport for large-scale military operations.', requirements: ['troop_trans_mini', 'centaur'] },
    { id: 'troop_trans_titan', x: 1700, y: 3450, category: 'other', pt: 'Transporte de Tropas Titã', en: 'Titan Troop Transport', desc_pt: 'O maior transporte militar para invasões massivas.', desc_en: 'Largest military transport for massive invasions.', requirements: ['troop_trans_jumbo', 'leviathan'] },

    { id: 'mts1', x: 200, y: 3600, category: 'other', pt: 'Sistema de Transferência MTS-1', en: 'Module Transfer MTS-1', desc_pt: 'Tecnologia básica para transferir módulos entre frotas.', desc_en: 'Basic technology to transfer modules between fleets.', requirements: ['corveta'] },
    { id: 'mts2', x: 450, y: 3600, category: 'other', pt: 'Sistema de Transferência MTS-2', en: 'Module Transfer MTS-2', desc_pt: 'Transferência de módulos melhorada com estabilizadores quânticos.', desc_en: 'Improved module transfer with quantum stabilizers.', requirements: ['mts1', 'fragata'] },
    { id: 'mts3', x: 700, y: 3600, category: 'other', pt: 'Sistema de Transferência MTS-3', en: 'Module Transfer MTS-3', desc_pt: 'Transferência ultra-rápida usando pontes de Einstein-Rosen.', desc_en: 'Ultra-fast transfer using Einstein-Rosen bridges.', requirements: ['mts2'] },
    { id: 'module_trans_mini', x: 950, y: 3600, category: 'other', pt: 'Sistema de Transferência de Módulos Mini', en: 'Mini Module Transfer', desc_pt: 'Miniaturização extrema usando compressão dimensional.', desc_en: 'Extreme miniaturization using dimensional compression.', requirements: ['mts3', 'mini_shield'] },
    { id: 'module_trans_jumbo', x: 1200, y: 3600, category: 'other', pt: 'Sistema de Transferência de Módulos Jumbo', en: 'Jumbo Module Transfer', desc_pt: 'Sistema de escala industrial com classificação automatizada.', desc_en: 'Industrial scale system with automated sorting.', requirements: ['module_trans_mini', 'aurora_wing'] },

    { id: 'mo1', x: 700, y: 3750, category: 'other', pt: 'Otimizador de Mineração MO-1', en: 'Mining Optimizer MO-1', desc_pt: 'Tecnologia de otimização básica. Duração máx: 40 min, penalidade -40%.', desc_en: 'Basic optimization technology. Max duration: 40 min, penalty -40%.', requirements: ['ast_mk1'] },
    { id: 'mo2', x: 950, y: 3750, category: 'other', pt: 'Otimizador de Mineração MO-2', en: 'Mining Optimizer MO-2', desc_pt: 'Tecnologia de otimização melhorada. Duração máx: 90 min, penalidade -20%.', desc_en: 'Improved optimization technology. Max duration: 90 min, penalty -20%.', requirements: ['mo1'] },
    { id: 'mo3', x: 1200, y: 3750, category: 'other', pt: 'Otimizador de Mineração MO-3', en: 'Mining Optimizer MO-3', desc_pt: 'Tecnologia de otimização avançada. Sem limite de tempo, sem penalidade.', desc_en: 'Advanced optimization technology. No time limit, no penalty.', requirements: ['mo2', 'laser_l2'] },
    { id: 'mo_mini', x: 1450, y: 3750, category: 'other', pt: 'Mini Otimizador MO-Mini', en: 'Mini Optimizer MO-Mini', desc_pt: 'Tecnologia de otimização compacta. Sem limite, bônus de +5% na coleta.', desc_en: 'Compact optimization technology. No limit, +5% collection bonus.', requirements: ['mo3', 'laser_amp'] },
    { id: 'mo_jumbo', x: 1700, y: 3750, category: 'other', pt: 'Otimizador de Mineração Jumbo MO-Jumbo', en: 'Jumbo Mining Optimizer', desc_pt: 'Tecnologia de otimização de alta capacidade. Sem limite, bônus de +25% na coleta.', desc_en: 'High capacity optimization technology. No limit, +25% collection bonus.', requirements: ['mo_mini', 'mini_laser'] },

    { id: 'mars_colonization', x: 1200, y: 1850, category: 'other', pt: 'Colonização de Marte', en: 'Mars Colonization', desc_pt: 'Técnicas de terraformação para o planeta vermelho (3º planeta).', desc_en: 'Terraforming techniques for the red planet (3rd planet).', requirements: ['explorer'] },
    { id: 'colonization', x: 1450, y: 1850, category: 'other', pt: 'Tecnologia de Colonização', en: 'Colonization Tech', desc_pt: 'Tecnologia permitindo estabelecimento de colônias permanentes.', desc_en: 'Technology allowing the establishment of permanent colonies.', requirements: ['inter_cruiser'] },
    { id: 'moonbase', x: 1700, y: 1850, category: 'other', pt: 'Base Lunar', en: 'Moon Base', desc_pt: 'Permite colonizar um 2º planeta (a Lua).', desc_en: 'Allows colonizing a 2nd planet (the Moon).', requirements: ['colonization'] },
    { id: 'beyond_world', x: 1950, y: 1850, category: 'other', pt: 'Um Mundo Além', en: 'A World Beyond', desc_pt: 'Permite colonizar um 4º planeta (exoplaneta).', desc_en: 'Allows colonizing a 4th planet (exoplanet).', requirements: ['mars_colonization', 'hades'] },
    { id: 'jupiter_expansion', x: 2200, y: 1850, category: 'other', pt: 'Expansão de Júpiter', en: 'Jupiter Expansion', desc_pt: 'Permite colonizar um 5º planeta no sistema de Júpiter.', desc_en: 'Allows colonizing a 5th planet in the Jupiter system.', requirements: ['moonbase', 'balista_jumbo', 'laser_jumbo', 'aim_comp3', 'aim_sys3'] },
    { id: 'neptune_outpost', x: 2450, y: 1850, category: 'other', pt: 'Posto Avançado de Netuno', en: 'Neptune Outpost', desc_pt: 'Permite colonizar um 6º planeta no sistema de Netuno.', desc_en: 'Allows colonizing a 6th planet in the Neptune system.', requirements: ['moonbase', 'mw2'] },
    { id: 'uranus_settlement', x: 2700, y: 1850, category: 'other', pt: 'Assentamento de Urano', en: 'Uranus Settlement', desc_pt: 'Permite colonizar um 7º planeta no sistema de Urano.', desc_en: 'Allows colonizing a 7th planet in the Uranus system.', requirements: ['moonbase', 'cargo_jumbo'] },
    { id: 'interstellar_col', x: 2950, y: 1850, category: 'other', pt: 'Colonização Insterestelar', en: 'Interstellar Colonization', desc_pt: 'Permite colonizar um 8º planeta além do sistema solar.', desc_en: 'Allows colonizing an 8th planet beyond the solar system.', requirements: ['moonbase', 'jumbo_shield', 'armor3'] },
];

const CATEGORY_UI = {
    cargo: { color: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400/10', icon: <Boxes size={16} /> },
    engine: { color: 'text-pink-400', border: 'border-pink-400', bg: 'bg-pink-400/10', icon: <Zap size={16} /> },
    chassis: { color: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400/10', icon: <Target size={16} /> },
    weapon: { color: 'text-red-400', border: 'border-red-400', bg: 'bg-red-400/10', icon: <Crosshair size={16} /> },
    defense: { color: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400/10', icon: <ShieldCheck size={16} /> },
    general: { color: 'text-green-400', border: 'border-green-400', bg: 'bg-green-400/10', icon: <Globe size={16} /> },
    other: { color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10', icon: <Landmark size={16} /> },
};

export const TechTreeView: React.FC = () => {
    const { language } = useLanguage();
    const t = STATIC_TEXT[language];
    const [scale, setScale] = useState(0.25);
    const [position, setPosition] = useState({ x: 100, y: 50 });
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
        setScale(0.25);
        setPosition({ x: 100, y: 50 });
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
                            <span className="text-space-neon">MATRIX:</span> {t.subtitle}
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
                                        stroke="#00c2ff"
                                        strokeWidth="2"
                                        strokeDasharray="8,8"
                                        opacity="0.1"
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
                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-4 bg-space-dark rounded-xl border transition-all duration-300 pointer-events-auto cursor-pointer
                                    ${isHovered ? `${ui.border} ring-4 ${ui.border.replace('border-', 'ring-')}/20 scale-110 shadow-[0_0_30px_rgba(0,194,255,0.4)]` : 'border-space-steel/50'}
                                `}
                                style={{ left: node.x, top: node.y }}
                                onMouseEnter={() => setHoveredNode(node)}
                                onMouseLeave={() => setHoveredNode(null)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg ${ui.bg} border ${ui.border} flex items-center justify-center`}>
                                        {React.cloneElement(ui.icon as React.ReactElement, { className: ui.color })}
                                    </div>
                                    <div className="min-w-[140px]">
                                        <h4 className="text-sm font-display font-bold text-white uppercase leading-tight">{language === 'pt' ? node.pt : node.en}</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text-[8px] font-mono uppercase tracking-tighter ${ui.color}`}>{node.category}</span>
                                            <div className="w-1 h-1 rounded-full bg-space-steel/50" />
                                            <span className="text-[8px] text-space-muted font-mono uppercase tracking-tighter">ID: {node.id.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* HUD Overlay */}
                <div className="absolute bottom-6 left-6 p-5 bg-space-dark/95 backdrop-blur-xl border border-space-steel/30 rounded-2xl w-full max-w-[320px] pointer-events-none animate-slideUp shadow-2xl">
                    {hoveredNode ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Info size={14} className="text-space-neon" />
                                    <span className="text-[10px] font-mono text-space-neon uppercase tracking-widest">PROTOCOLO DE PESQUISA</span>
                                </div>
                                <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${CATEGORY_UI[hoveredNode.category].color.replace('text-', 'border-').replace('text-', 'bg-')}/10 ${CATEGORY_UI[hoveredNode.category].color}`}>
                                    {hoveredNode.category.toUpperCase()}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-display font-bold text-white mb-1">
                                    {language === 'pt' ? hoveredNode.pt : hoveredNode.en}
                                </h3>
                                <p className="text-xs text-space-muted font-mono leading-relaxed opacity-80">
                                    {language === 'pt' ? hoveredNode.desc_pt : hoveredNode.desc_en}
                                </p>
                            </div>

                            {hoveredNode.requirements && (
                                <div className="pt-3 border-t border-space-steel/20">
                                    <p className="text-[9px] font-mono text-space-muted uppercase mb-2">{t.requirements}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {hoveredNode.requirements.map(reqId => {
                                            const req = TECH_NODES.find(n => n.id === reqId);
                                            return (
                                                <span key={reqId} className="px-2 py-1 bg-space-black border border-space-steel/30 rounded text-[9px] font-mono text-white">
                                                    {req ? (language === 'pt' ? req.pt : req.en) : reqId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center space-y-3">
                            <div className="w-10 h-10 rounded-full border border-space-steel/30 flex items-center justify-center mx-auto opacity-30">
                                <Search size={20} className="text-space-muted" />
                            </div>
                            <p className="text-[10px] font-mono text-space-muted uppercase tracking-[0.2em]">
                                SELECIONE UM NÓDULO PARA DECODIFICAÇÃO
                            </p>
                        </div>
                    )}
                </div>

                {/* Legend Overlay */}
                <div className="absolute top-6 left-6 p-4 bg-space-dark/70 backdrop-blur-md border border-space-steel/30 rounded-xl space-y-2">
                    {Object.entries(CATEGORY_UI).map(([key, ui]) => (
                        <div key={key} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${ui.color.replace('text-', 'bg-')}`} />
                            <span className="text-[9px] font-mono text-space-muted uppercase tracking-wider">{key}</span>
                        </div>
                    ))}
                </div>

                {/* Navigator Info */}
                <div className="absolute bottom-6 right-6 px-3 py-2 bg-space-dark/80 border border-space-steel/30 rounded-lg font-mono text-[10px] text-space-muted flex items-center gap-4">
                    <div className="flex gap-2 border-r border-space-steel/30 pr-4">
                        <span className="text-space-neon">X:</span> {position.x.toFixed(0)}
                        <span className="text-space-neon ml-1">Y:</span> {position.y.toFixed(0)}
                    </div>
                    <div>
                        <span className="text-space-neon">MAG:</span> {(scale * 100).toFixed(0)}%
                    </div>
                    <div>
                        <span className="text-space-neon">NODES:</span> {TECH_NODES.length}
                    </div>
                </div>
            </Card>
        </div>
    );
};
