import React, { useState } from 'react';
import { MiningCalculator } from '../tools/MiningCalculator';
import { Calculator, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Shared';

export const MiningCalculatorView: React.FC = () => {
    const [showTutorial, setShowTutorial] = useState(false);

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <header className="mb-8 border-b border-space-steel pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-space-neon/10 rounded border border-space-neon/30">
                            <Calculator className="text-space-neon" size={24} />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-white tracking-wide">
                            CALCULADORA DE MINERAÇÃO
                        </h1>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowTutorial(!showTutorial)}
                        icon={showTutorial ? <ChevronUp /> : <Info />}
                    >
                        {showTutorial ? 'OCULTAR GUIA' : 'COMO USAR'}
                    </Button>
                </div>
                <p className="text-space-muted font-mono text-sm max-w-2xl">
                    Estime o tempo exato para extração de recursos com base em seus bônus de logística, estratégia e eficiência de equipamentos.
                </p>
            </header>

            {showTutorial && (
                <div className="mb-8 bg-space-darker border border-space-steel p-6 rounded-lg animate-slide-down">
                    <h2 className="text-space-neon font-mono font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Info size={16} /> Guia Rápido
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-space-text">
                        <div className="space-y-3">
                            <p><strong className="text-white">1. Recursos Totais:</strong> Insira a quantidade total de minério no asteroide.</p>
                            <p><strong className="text-white">2. Módulos:</strong> Quantidade de módulos de mineração em sua nave/frota.</p>
                            <p><strong className="text-white">3. Logística:</strong> Seus pontos totais na skill de Logística (aumenta % logarítmica).</p>
                        </div>
                        <div className="space-y-3">
                            <p><strong className="text-white">4. Estratégia Planetária:</strong> Ajuste o slider conforme sua configuração planetária (-15 a +15). Valores negativos focam em Mineração (+50% bônus).</p>
                            <p><strong className="text-white">5. Skill da Nave:</strong> Selecione o nível do módulo (I a X) para bônus extra.</p>
                            <p><strong className="text-white">6. Eficiência:</strong> Ajuste as porcentagens do asteroide e do otimizador de minério.</p>
                        </div>
                    </div>
                </div>
            )}

            <MiningCalculator />
        </div>
    );
};
