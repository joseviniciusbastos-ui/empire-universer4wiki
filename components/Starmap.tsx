import React, { useState } from 'react';
import { StarSystem } from '../types';
import { useToast } from '../contexts/ToastContext';

// Placeholder for dynamic systems data
const DYNAMIC_SYSTEMS: StarSystem[] = []; 

const Starmap: React.FC = () => {
  const { showToast } = useToast();
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null);
  const [zoom, setZoom] = useState(1);

  // Theme color for JS/SVG usage (Matches Tailwind space-neon #00C2FF)
  const THEME_COLOR = '#00C2FF';

  return (
    <div className="w-full h-[600px] bg-space-black border border-space-steel relative overflow-hidden group">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="bg-space-dark border border-space-steel w-8 h-8 hover:bg-space-neon hover:text-black font-bold">+</button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="bg-space-dark border border-space-steel w-8 h-8 hover:bg-space-neon hover:text-black font-bold">-</button>
      </div>

      {/* Grid Background Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      ></div>

      {/* Map Surface */}
      <div className="w-full h-full flex items-center justify-center cursor-move active:cursor-grabbing">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connections */}
          {DYNAMIC_SYSTEMS.map(sys =>
            sys.connections.map(targetId => {
              const target = DYNAMIC_SYSTEMS.find(s => s.id === targetId);
              if (!target) return null;
              return (
                <line
                  key={`${sys.id}-${target.id}`}
                  x1={sys.x} y1={sys.y}
                  x2={target.x} y2={target.y}
                  stroke="#333"
                  strokeWidth="1"
                  opacity="0.5"
                />
              );
            })
          )}

          {/* Systems */}
          {DYNAMIC_SYSTEMS.map((sys) => {
            let color = '#FFF';
            let radius = 4;
            if (sys.type === 'star') { color = '#FFE082'; radius = 6; }
            if (sys.type === 'blackhole') { color = '#7E57C2'; radius = 8; }
            if (sys.type === 'nebula') { color = THEME_COLOR; radius = 5; }

            const isSelected = selectedSystem?.id === sys.id;

            return (
              <g
                key={sys.id}
                onClick={() => setSelectedSystem(sys)}
                className="cursor-pointer transition-opacity hover:opacity-100"
                style={{ opacity: isSelected ? 1 : 0.8 }}
              >
                {isSelected && (
                  <circle cx={sys.x} cy={sys.y} r={radius * 3} fill="transparent" stroke={THEME_COLOR} strokeWidth="1" opacity="0.5" className="animate-pulse" />
                )}
                <circle
                  cx={sys.x}
                  cy={sys.y}
                  r={radius}
                  fill={color}
                  filter="url(#glow)"
                />
                <text
                  x={sys.x}
                  y={sys.y + radius + 15}
                  fill={isSelected ? THEME_COLOR : '#888'}
                  fontSize="10"
                  fontFamily="Space Mono"
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                >
                  {sys.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info Panel */}
      {selectedSystem && (
        <div className="absolute bottom-4 left-4 bg-space-black/90 border border-space-neon p-4 w-64 backdrop-blur-md">
          <h3 className="font-heading text-lg text-space-neon uppercase">{selectedSystem.name}</h3>
          <div className="w-full h-[1px] bg-space-steel my-2"></div>
          <div className="text-xs text-space-muted font-mono space-y-1">
            <p>TIPO: <span className="text-white">{selectedSystem.type.toUpperCase()}</span></p>
            <p>COORDS: <span className="text-white">{selectedSystem.x}, {selectedSystem.y}</span></p>
            <p>CONEXÕES: <span className="text-white">{selectedSystem.connections.length}</span></p>
            <p className="mt-2 text-[10px] leading-tight text-gray-500">
              ALERTA: Níveis elevados de radiação detectados neste setor. Prossiga com cautela.
            </p>
          </div>
          <button
            className="mt-4 w-full bg-space-neon text-black font-bold text-xs py-2 hover:bg-white transition-colors uppercase tracking-wider"
            onClick={() => showToast(`Motor de dobra engajado para ${selectedSystem.name}`, 'info')}
          >
            Iniciar Dobra
          </button>
        </div>
      )}
      {DYNAMIC_SYSTEMS.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-space-muted font-mono text-sm">
          Nenhum sistema estelar mapeado.
        </div>
      )}
    </div>
  );
};

export default Starmap;