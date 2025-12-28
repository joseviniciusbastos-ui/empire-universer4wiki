import React, { useState } from 'react';
import { Card, Button, Input } from '../ui/Shared';
import { Coins, Package, ArrowRightLeft } from 'lucide-react';

export const ResourceCalculator: React.FC = () => {
    const [ore, setOre] = useState(0);
    const [gas, setGas] = useState(0);
    const [crystals, setCrystals] = useState(0);

    const rates = {
        ore: 10,
        gas: 25,
        crystals: 50
    };

    const totalCredits = (ore * rates.ore) + (gas * rates.gas) + (crystals * rates.crystals);

    return (
        <Card title="Calculadora de Comércio Galáctico">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] text-space-muted font-mono uppercase">Minério (u)</label>
                        <Input
                            type="number"
                            value={ore}
                            onChange={(e) => setOre(Number(e.target.value))}
                            className="text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-space-muted font-mono uppercase">Gás (u)</label>
                        <Input
                            type="number"
                            value={gas}
                            onChange={(e) => setGas(Number(e.target.value))}
                            className="text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-space-muted font-mono uppercase">Cristais (u)</label>
                        <Input
                            type="number"
                            value={crystals}
                            onChange={(e) => setCrystals(Number(e.target.value))}
                            className="text-white"
                        />
                    </div>
                </div>

                <div className="p-4 bg-space-dark border border-space-steel rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-space-neon/10 rounded-full">
                            <Coins className="text-space-neon" size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-space-muted font-mono uppercase">Valor Total Estimado</p>
                            <p className="text-xl font-display font-bold text-white tracking-widest">
                                {totalCredits.toLocaleString()} <span className="text-space-neon text-xs">CR</span>
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setOre(0); setGas(0); setCrystals(0); }}>
                        LIMPAR
                    </Button>
                </div>

                <p className="text-[9px] text-space-muted font-mono italic">
                    * Taxas de câmbio baseadas nos valores oficiais da Federação Core.
                </p>
            </div>
        </Card>
    );
};
