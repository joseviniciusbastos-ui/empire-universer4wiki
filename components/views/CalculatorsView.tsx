import React, { useState } from 'react';
import { MiningCalculator } from '../tools/MiningCalculator';
import { ResearchCalculator } from '../tools/ResearchCalculator';
import { Calculator, Zap, Pickaxe } from 'lucide-react';
import { Button } from '../ui/Shared';

export const CalculatorsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'mining' | 'research'>('mining');

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in text-white">
            <header className="mb-8 border-b border-space-steel pb-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-space-neon/10 rounded border border-space-neon/30">
                        <Calculator className="text-space-neon" size={24} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-wide">
                        FERRAMENTAS & CALCULADORAS
                    </h1>
                </div>
                <p className="text-space-muted font-mono text-sm max-w-2xl">
                    Utilitários de planejamento estratégico para otimização de recursos e desenvolvimento.
                </p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <Button
                    variant={activeTab === 'mining' ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab('mining')}
                    icon={<Pickaxe size={16} />}
                >
                    MINERAÇÃO
                </Button>
                <Button
                    variant={activeTab === 'research' ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab('research')}
                    icon={<Zap size={16} />}
                >
                    PESQUISA
                </Button>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'mining' ? <MiningCalculator /> : <ResearchCalculator />}
            </div>
        </div>
    );
};
