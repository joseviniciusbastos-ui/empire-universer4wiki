import React from 'react';
import { MiningCalculator } from '../tools/MiningCalculator';
import { Calculator } from 'lucide-react';

export const MiningCalculatorView: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <header className="mb-8 border-b border-space-steel pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-space-neon/10 rounded border border-space-neon/30">
                        <Calculator className="text-space-neon" size={24} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-wide">
                        CALCULADORA DE MINERAÇÃO
                    </h1>
                </div>
                <p className="text-space-muted font-mono text-sm max-w-2xl">
                    Estime o tempo exato para extração de recursos com base em seus bônus de logística, estratégia e eficiência de equipamentos.
                </p>
            </header>

            <MiningCalculator />
        </div>
    );
};
