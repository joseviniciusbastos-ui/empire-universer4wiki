import React, { useState, useEffect } from 'react';
import { Calculator, Clock, Zap, Anchor, Crosshair, Box, TrendingUp, Cpu } from 'lucide-react';
import { Card, Input, Button, Badge } from '../ui/Shared';

export const MiningCalculator: React.FC = () => {
    // Inputs
    const [resources, setResources] = useState<number>(0);
    const [modules, setModules] = useState<number>(1);
    const [logistics, setLogistics] = useState<number>(0);
    const [strategy, setStrategy] = useState<number>(0); // -15 to +15
    const [skillLevel, setSkillLevel] = useState<number>(0); // 0 to 10 (I to X)
    const [asteroidEff, setAsteroidEff] = useState<number>(100);
    const [optimizerEff, setOptimizerEff] = useState<number>(100);
    const [extraModifier, setExtraModifier] = useState<number>(0); // New Modifier %

    // Results
    const [miningRate, setMiningRate] = useState<number>(0);
    const [timeResult, setTimeResult] = useState<string>("");

    // Calculation Logic
    useEffect(() => {
        const baseRate = 1000;

        // Logistics Bonus: 50 * log2(1 + points/100)
        // This returns a percentage value (e.g., 50 for 50%).
        const logisticsBonusPercent = 50 * Math.log2(1 + logistics / 100);

        // Strategy Bonus: -15 (+50%) to +15 (-50%)
        // Formula: (-Strategy / 15) * 0.50
        // e.g. -15 => -(-1) * 0.5 = 0.5 (+50%)
        const strategyBonusPercent = (-strategy / 15) * 0.5 * 100;

        // Skill Bonus: 1% per level
        const skillBonusPercent = skillLevel;

        // Skill Bonus: 1% per level
        const skillBonusPercent = skillLevel;

        const totalBonusMultiplier = 1 + (logisticsBonusPercent + strategyBonusPercent + skillBonusPercent) / 100;

        // Extra Modifier (Extension Module):
        // 1 + (Modifier / 100)
        // If 10% buff -> 1.1x
        // If -10% debuff -> 0.9x
        const extraModifierMult = 1 + (extraModifier / 100);

        // Multipliers
        const asteroidMult = asteroidEff / 100;
        const optimizerMult = optimizerEff / 100;

        // Final Rate Calculation
        // Rate = 1000 * (1 + SumBonuses) * Modules * AstEff * OptEff
        const ratePerModule = baseRate * totalBonusMultiplier;
        // Final Rate Calculation
        // Rate = 1000 * (1 + SumBonuses) * Modules * AstEff * OptEff * ExtraMod
        const ratePerModule = baseRate * totalBonusMultiplier;
        const totalRate = ratePerModule * modules * asteroidMult * optimizerMult * extraModifierMult;

        setMiningRate(totalRate);

        // Time Calculation
        if (totalRate > 0 && resources > 0) {
            const hours = resources / totalRate;

            const days = Math.floor(hours / 24);
            const remHours = Math.floor(hours % 24);
            const minutes = Math.floor((hours * 60) % 60);

            let timeString = "";
            if (days > 0) timeString += `${days}d `;
            if (remHours > 0 || days > 0) timeString += `${remHours}h `;
            timeString += `${minutes}m`;

            setTimeResult(timeString);
        } else {
            setTimeResult("0m");
        }

    }, [resources, modules, logistics, strategy, skillLevel, asteroidEff, optimizerEff, extraModifier]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- INPUTS SECTION --- */}
                <div className="space-y-6">
                    <Card title="PARÂMETROS DE MINERAÇÃO" className="h-full">
                        <div className="space-y-4 pt-2">
                            {/* Resources */}
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                                    <Box size={14} /> RECURSOS TOTAIS
                                </label>
                                <Input
                                    type="number"
                                    value={resources || ''}
                                    onChange={(e) => setResources(Number(e.target.value))}
                                    placeholder="Ex: 500000"
                                />
                            </div>

                            {/* Modules */}
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                                    <Cpu size={14} /> NÚMERO DE MÓDULOS
                                </label>
                                <Input
                                    type="number"
                                    value={modules || ''}
                                    onChange={(e) => setModules(Number(e.target.value))}
                                    min={1}
                                />
                            </div>

                            {/* Logistics */}
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                                    <Anchor size={14} /> PONTOS DE LOGÍSTICA
                                </label>
                                <Input
                                    type="number"
                                    value={logistics || ''}
                                    onChange={(e) => setLogistics(Number(e.target.value))}
                                    placeholder="0"
                                />
                            </div>

                            {/* Strategy Slider */}
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-xs font-mono text-space-muted">
                                    <span className="flex items-center gap-1 text-space-neon"><Zap size={14} /> MINERAÇÃO (+50%)</span>
                                    <span className="flex items-center gap-1 text-red-500">COMBATE (-50%) <Crosshair size={14} /></span>
                                </div>
                                <input
                                    type="range"
                                    min="-15"
                                    max="15"
                                    value={strategy}
                                    onChange={(e) => setStrategy(Number(e.target.value))}
                                    className="w-full h-2 bg-space-darker rounded-lg appearance-none cursor-pointer border border-space-steel accent-space-neon"
                                />
                                <div className="text-center font-mono text-sm text-white">
                                    Valor Atual: <span className={strategy < 0 ? 'text-space-neon' : strategy > 0 ? 'text-red-500' : 'text-white'}>{strategy}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* --- EFFICIENCY & SKILLS --- */}
                <div className="space-y-6">
                    <Card title="EFICIÊNCIA & HABILIDADES" className="h-full">
                        <div className="space-y-4 pt-2">
                            {/* Skill Level Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                                    <TrendingUp size={14} /> SKILL DA NAVE (NÍVEL {skillLevel})
                                </label>
                                <div className="flex flex-wrap gap-1">
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => setSkillLevel(lvl)}
                                            className={`w-8 h-8 text-xs font-mono border transition-all
                                                ${skillLevel === lvl
                                                    ? 'bg-space-neon text-black border-space-neon'
                                                    : 'bg-space-darker text-space-muted border-space-steel hover:border-space-neon'
                                                }`}
                                        >
                                            {lvl === 0 ? '-' : lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Asteroid Efficiency */}
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                                    <Box size={14} /> EFIC. ASTEROIDE (%)
                                </label>
                                <Input
                                    type="number"
                                    value={asteroidEff}
                                    onChange={(e) => setAsteroidEff(Number(e.target.value))}
                                />
                            </div>

                            {/* Optimizer Efficiency */}
                            <div className="space-y-1">
                                <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                                    <Zap size={14} /> EFIC. OTIMIZADOR (%)
                                </label>
                                <Input
                                    type="number"
                                    value={optimizerEff}
                                    onChange={(e) => setOptimizerEff(Number(e.target.value))}
                                />
                            </div>

                            {/* Extra Modifier */}
                            <div className="space-y-1 pt-2 border-t border-space-steel/30">
                                <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                                    <Zap size={14} /> MÓDULO EXTENSÃO (% MOD)
                                </label>
                                <div className="flex gap-4 items-center">
                                    <Input
                                        type="number"
                                        value={extraModifier}
                                        onChange={(e) => setExtraModifier(Number(e.target.value))}
                                        placeholder="0"
                                        className={extraModifier > 0 ? 'text-space-neon border-space-neon' : extraModifier < 0 ? 'text-red-500 border-red-500' : ''}
                                    />
                                </div>
                                <div className="text-[10px] font-mono text-space-muted opacity-60">
                                    Use valores positivos para Bônus e negativos para Penalidade/Debuff.
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- RESULTS SECTION --- */}
            <div className="mt-8">
                <div className="bg-space-dark border border-space-neon p-8 relative overflow-hidden group">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calculator size={120} />
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-space-muted font-mono text-sm tracking tracking-widest uppercase mb-1">Taxa de Mineração Total</h3>
                            <div className="text-3xl md:text-4xl font-display font-bold text-white flex items-baseline gap-2">
                                {Math.floor(miningRate).toLocaleString()}
                                <span className="text-lg text-space-steel font-mono">un/h</span>
                            </div>
                        </div>

                        <div className="text-right md:text-left">
                            <h3 className="text-space-neon font-mono text-sm tracking-widest uppercase mb-1 flex items-center gap-2 justify-end md:justify-start">
                                <Clock size={16} /> Tempo Estimado
                            </h3>
                            <div className="text-4xl md:text-5xl font-display font-bold text-space-neon drop-shadow-[0_0_10px_rgba(0,194,255,0.5)]">
                                {timeResult || "0m"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
