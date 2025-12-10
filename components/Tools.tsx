import React from 'react';
import { Hammer, Lock, Activity } from 'lucide-react';
import { MOCK_TOOLS } from '../constants';
import { Card, Badge, Button } from './ui/Shared';

const Tools: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-l-4 border-space-neon pl-4 bg-space-neon/5 py-4 pr-4 rounded-r flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading font-bold text-space-neon">ÁREA DE ENGENHARIA</h2>
          <p className="text-sm font-mono text-space-muted">Ferramentas experimentais e módulos em desenvolvimento.</p>
        </div>
        <Activity className="text-space-neon animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TOOLS.map(tool => (
          <Card key={tool.id} className={`group ${tool.status === 'locked' ? 'opacity-50' : 'hover:border-space-neon'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-space-black border border-space-steel rounded-full">
                {tool.status === 'active' && <Activity size={20} className="text-space-neon" />}
                {tool.status === 'construction' && <Hammer size={20} className="text-yellow-500" />}
                {tool.status === 'locked' && <Lock size={20} className="text-space-alert" />}
              </div>
              <Badge color={
                tool.status === 'active' ? 'bg-space-neon text-black' :
                  tool.status === 'construction' ? 'bg-yellow-500 text-black' :
                    'bg-space-alert text-black'
              }>
                {tool.status === 'active' ? 'OPERACIONAL' : tool.status === 'construction' ? 'EM OBRAS' : 'BLOQUEADO'}
              </Badge>
            </div>

            <h3 className="text-lg font-bold font-heading mb-2">{tool.name}</h3>
            <p className="text-xs font-mono text-space-muted mb-6 h-10">{tool.description}</p>

            <Button
              size="sm"
              variant={tool.status === 'active' ? 'secondary' : 'ghost'}
              className="w-full"
              disabled={tool.status !== 'active'}
            >
              {tool.status === 'active' ? 'ACESSAR MÓDULO' : 'INDISPONÍVEL'}
            </Button>

            {/* Construction Tape Effect for Construction items */}
            {tool.status === 'construction' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
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

      <div className="mt-12 p-8 border border-dashed border-space-steel text-center rounded-lg bg-space-black/50">
        <h3 className="text-space-muted font-heading text-lg mb-2">SOLICITAÇÃO DE RECURSOS</h3>
        <p className="text-xs font-mono text-space-muted max-w-md mx-auto mb-4">
          Tem uma ideia para uma nova ferramenta ou calculadora? Envie uma requisição para a equipe de engenharia central.
        </p>
        <Button variant="ghost">ENVIAR FEEDBACK</Button>
      </div>
    </div>
  );
};

export default Tools;