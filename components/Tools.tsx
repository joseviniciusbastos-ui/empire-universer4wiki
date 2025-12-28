import React, { useState } from 'react';
import { Hammer, Lock, Activity, ChevronRight, LayoutGrid } from 'lucide-react';
import { Card, Badge, Button } from './ui/Shared';
import { ToolModule } from '../types';
import { ResourceCalculator } from './tools/ResourceCalculator';
import { TravelSimulator } from './tools/TravelSimulator';

const Tools: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'grid' | 'calculator' | 'travel'>('grid');

  const DYNAMIC_TOOLS: ToolModule[] = [
    {
      id: 'calculator',
      name: 'Calculadora de Materiais',
      status: 'active',
      description: 'Conversor de minérios e recursos em créditos galácticos.'
    },
    {
      id: 'travel',
      name: 'Simulador de Viagem',
      status: 'active',
      description: 'Cálculo de tempo de viagem entre sistemas e consumo energético.'
    },
    {
      id: 'combat',
      name: 'Simulador de Combate',
      status: 'construction',
      description: 'Previsão de baixas e chance de vitória baseado em poder de frota.'
    }
  ];

  if (activeModule === 'calculator') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveModule('grid')} className="mb-4">
          <LayoutGrid size={14} className="mr-2" /> VOLTAR AO PAINEL
        </Button>
        <ResourceCalculator />
      </div>
    );
  }

  if (activeModule === 'travel') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveModule('grid')} className="mb-4">
          <LayoutGrid size={14} className="mr-2" /> VOLTAR AO PAINEL
        </Button>
        <TravelSimulator />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-l-4 border-space-neon pl-4 bg-space-neon/5 py-4 pr-4 rounded-r flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-space-neon uppercase">Laboratório de Engenharia</h2>
          <p className="text-sm font-mono text-space-muted transition-all">Sistemas de apoio logístico e estratégico ativos.</p>
        </div>
        <Activity className="text-space-neon animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DYNAMIC_TOOLS.map(tool => (
          <Card key={tool.id} className={`group relative overflow-hidden ${tool.status === 'locked' ? 'opacity-50' : 'hover:border-space-neon'} transition-all duration-300`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-space-black border border-space-steel rounded-full group-hover:border-space-neon transition-colors">
                {tool.status === 'active' && <Activity size={20} className="text-space-neon" />}
                {tool.status === 'construction' && <Hammer size={20} className="text-yellow-500" />}
                {tool.status === 'locked' && <Lock size={20} className="text-space-alert" />}
              </div>
              <Badge color={
                tool.status === 'active' ? 'bg-space-neon/20 text-space-neon border border-space-neon/30' :
                  tool.status === 'construction' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                    'bg-space-alert/20 text-space-alert border border-space-alert/30'
              }>
                {tool.status === 'active' ? 'OPERACIONAL' : tool.status === 'construction' ? 'EM DESENV.' : 'BLOQUEADO'}
              </Badge>
            </div>

            <h3 className="text-lg font-bold font-heading mb-2 text-white group-hover:text-space-neon transition-colors">{tool.name}</h3>
            <p className="text-xs font-mono text-space-muted mb-6 h-10 leading-relaxed">{tool.description}</p>

            <Button
              size="sm"
              variant={tool.status === 'active' ? 'secondary' : 'ghost'}
              className="w-full"
              disabled={tool.status !== 'active'}
              onClick={() => setActiveModule(tool.id as any)}
            >
              {tool.status === 'active' ? (
                <span className="flex items-center">ACESSAR MÓDULO <ChevronRight size={14} className="ml-1" /></span>
              ) : 'INATIVO'}
            </Button>

            {tool.status === 'construction' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
                <div className="absolute top-0 left-0 w-[200%] h-full -translate-x-1/2 -rotate-45"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #EAB308 10px, #EAB308 20px)'
                  }}
                ></div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-12 p-8 border border-dashed border-space-steel text-center rounded-lg bg-space-black/50 hover:bg-space-dark/50 transition-colors">
        <h3 className="text-space-muted font-heading text-lg mb-2">SOLICITAÇÃO DE RECURSOS</h3>
        <p className="text-xs font-mono text-space-muted max-w-md mx-auto mb-4">
          Tem uma ideia para uma nova ferramenta ou calculadora? Envie uma requisição para a equipe de engenharia central.
        </p>
        <Button variant="ghost" size="sm">ENVIAR FEEDBACK</Button>
      </div>
    </div>
  );
};

export default Tools;