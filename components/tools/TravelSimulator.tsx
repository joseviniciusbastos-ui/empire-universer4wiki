import React, { useState } from 'react';
import { Card, Button, Input } from '../ui/Shared';
import { Rocket, Clock, MapPin } from 'lucide-react';

export const TravelSimulator: React.FC = () => {
    const [distance, setDistance] = useState(100);
    const [speed, setSpeed] = useState(5.0);
    const [booster, setBooster] = useState(1.0);

    const travelTime = distance / (speed * booster);
    const hours = Math.floor(travelTime);
    const minutes = Math.round((travelTime - hours) * 60);

    return (
        <Card title="Simulador de Navegação Estelar">
            <div className="space-y-4">
                <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-space-muted font-mono uppercase">Distância (Anos-Luz)</label>
                        <Input
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-space-muted font-mono uppercase">Velocidade Base (v)</label>
                        <Input
                            type="number"
                            step="0.1"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-space-muted font-mono uppercase">Multiplicador de Motor</label>
                        <select
                            className="bg-space-dark border border-space-steel rounded px-3 py-2 text-sm text-white outline-none focus:border-space-neon transition-colors"
                            value={booster}
                            onChange={(e) => setBooster(Number(e.target.value))}
                        >
                            <option value="1.0">Motor Padrão (1.0x)</option>
                            <option value="1.5">Dobra Nível 1 (1.5x)</option>
                            <option value="2.0">Dobra Nível 2 (2.0x)</option>
                            <option value="5.0">Salto Hiperespaço (5.00x)</option>
                        </select>
                    </div>
                </div>

                <div className="p-4 bg-space-black border border-space-steel border-l-4 border-l-space-blue rounded-lg flex items-center gap-4">
                    <div className="p-2 bg-space-blue/10 rounded-full">
                        <Clock className="text-space-blue" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-space-muted font-mono uppercase">Tempo Estimado de Chegada (ETA)</p>
                        <p className="text-2xl font-display font-bold text-white">
                            {hours}h {minutes}m
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
