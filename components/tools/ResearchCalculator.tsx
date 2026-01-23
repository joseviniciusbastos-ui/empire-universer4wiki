import React, { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle, MonitorPlay } from 'lucide-react';
import { Card, Input, Button } from '../ui/Shared';

export const ResearchCalculator: React.FC = () => {
    const [baseTimeHours, setBaseTimeHours] = useState<number>(0);
    const [modifier, setModifier] = useState<number>(0); // Percentage
    const [finalTime, setFinalTime] = useState<string>("");
    const [finalTimeHours, setFinalTimeHours] = useState<number>(0);

    useEffect(() => {
        if (baseTimeHours > 0) {
            // Logic: Research Speed = 100% + Modifier%
            // Time = BaseTime / (Speed/100)
            // Example: Base 10h. Modifier +100% (Speed 200%). Time = 10 / 2 = 5h.
            // Example: Base 10h. Modifier -50% (Speed 50%). Time = 10 / 0.5 = 20h.

            // Limit minimum speed to avoid division by zero or negative time
            // Minimum effective speed: 1% (100x time) to prevent infinity
            const effectiveSpeedPercent = Math.max(1, 100 + modifier);
            const speedMultiplier = effectiveSpeedPercent / 100;

            const resultHours = baseTimeHours / speedMultiplier;
            setFinalTimeHours(resultHours);

            const days = Math.floor(resultHours / 24);
            const remHours = Math.floor(resultHours % 24);
            const minutes = Math.floor((resultHours * 60) % 60);

            let timeString = "";
            if (days > 0) timeString += `${days}d `;
            if (remHours > 0 || days > 0) timeString += `${remHours}h `;
            timeString += `${minutes}m`;

            setFinalTime(timeString);
        } else {
            setFinalTime("0m");
            setFinalTimeHours(0);
        }
    }, [baseTimeHours, modifier]);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card title="PARÂMETROS DE PESQUISA">
                <div className="space-y-6 pt-2">
                    {/* Base Time */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                            <Clock size={14} /> TEMPO BASE (HORAS)
                        </label>
                        <Input
                            type="number"
                            value={baseTimeHours || ''}
                            onChange={(e) => setBaseTimeHours(Number(e.target.value))}
                            placeholder="Ex: 10"
                        />
                    </div>

                    {/* Modifier */}
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-space-muted flex items-center gap-2">
                            <Zap size={14} /> BÔNUS / PENALIDADE (%)
                        </label>
                        <div className="flex gap-4 items-center">
                            <Input
                                type="number"
                                value={modifier}
                                onChange={(e) => setModifier(Number(e.target.value))}
                                placeholder="0"
                                className={modifier > 0 ? 'text-space-neon border-space-neon' : modifier < 0 ? 'text-red-500 border-red-500' : ''}
                            />
                            <div className="text-xs font-mono text-space-muted whitespace-nowrap">
                                Positive = Mais Rápido<br />
                                Negative = Mais Lento
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Result */}
            <div className="bg-space-dark border border-space-steel p-6 relative overflow-hidden flex items-center justify-between">
                <div>
                    <h3 className="text-space-muted font-mono text-sm tracking-widest uppercase mb-1">Tempo Final</h3>
                    <div className={`text-4xl font-display font-bold ${modifier > 0 ? 'text-space-neon' : modifier < 0 ? 'text-red-500' : 'text-white'}`}>
                        {finalTime || "0h"}
                    </div>
                </div>
                {baseTimeHours > 0 && Math.abs(modifier) > 0 && (
                    <div className="text-right">
                        <div className="text-xs font-mono text-space-muted uppercase">Diferença</div>
                        <div className={`text-xl font-bold font-mono ${modifier > 0 ? 'text-space-neon' : 'text-red-500'}`}>
                            {modifier > 0 ? '-' : '+'}{Math.abs(baseTimeHours - finalTimeHours).toFixed(1)}h
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-space-neon/5 border border-space-neon/20 rounded text-xs font-mono text-space-muted flex gap-2">
                <AlertTriangle size={14} className="text-space-neon flex-shrink-0" />
                <span>
                    Nota: O cálculo assume que o bônus/penalidade é aplicado sobre a VELOCIDADE de pesquisa base (Standard Game Logic).
                    <br />Fórmula: T_final = T_base / (1 + Bônus%)
                </span>
            </div>
        </div>
    );
};
