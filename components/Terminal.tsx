import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  currentUser: User;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, onNavigate, currentUser }) => {
  const [history, setHistory] = useState<string[]>(['Bem-vindo ao Terminal EU4-OS. Digite "ajuda" para comandos.']);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const args = cmd.trim().split(' ');
    const command = args[0].toLowerCase();
    
    let response = '';

    switch (command) {
      case 'ajuda':
      case 'help':
        response = `
  COMANDOS DISPONÍVEIS:
  ---------------------
  ajuda / help  : Mostra esta mensagem
  limpar        : Limpa o histórico do terminal
  quemsou       : Exibe informações do usuário atual
  ir [pagina]   : Navegar para (home, wiki, forum, starmap)
  data          : Timestamp Estelar
  sair          : Fechar terminal
        `;
        break;
      case 'limpar':
      case 'clear':
        setHistory([]);
        return;
      case 'quemsou':
      case 'whoami':
        response = `USUÁRIO: ${currentUser.username} | CARGO: ${currentUser.role} | REP: ${currentUser.reputation}`;
        break;
      case 'data':
      case 'date':
        response = `DATA ESTELAR: ${new Date().toISOString()}`;
        break;
      case 'ir':
      case 'goto':
        if (args[1]) {
          const target = args[1].toLowerCase();
          const mapTarget: Record<string, string> = {
            'home': 'home', 'inicio': 'home',
            'wiki': 'wiki',
            'forum': 'forum', 'fórum': 'forum',
            'starmap': 'starmap', 'mapa': 'starmap',
            'perfil': 'profile', 'profile': 'profile'
          };

          if (mapTarget[target]) {
            response = `NAVEGANDO PARA O SETOR: ${target.toUpperCase()}...`;
            setTimeout(() => onNavigate(mapTarget[target]), 800);
          } else {
            response = `ERRO: SETOR '${target}' NÃO ENCONTRADO.`;
          }
        } else {
          response = 'ERRO: DESTINO NÃO ESPECIFICADO.';
        }
        break;
      case 'sair':
      case 'exit':
        onClose();
        return;
      default:
        response = `ERRO: Comando '${command}' não reconhecido.`;
    }

    setHistory(prev => [...prev, `> ${cmd}`, response]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-space-black border border-space-steel shadow-2xl font-mono text-sm relative">
        {/* Header */}
        <div className="bg-space-steel text-space-text px-4 py-1 flex justify-between items-center select-none">
          <span className="font-bold text-xs tracking-widest">TERMINAL // NÍVEL_ACESSO_{currentUser.role}</span>
          <button onClick={onClose} className="hover:text-space-alert">X</button>
        </div>
        
        {/* Output Area */}
        <div 
          ref={terminalRef}
          className="h-96 overflow-y-auto p-4 text-space-neon space-y-1"
        >
          {history.map((line, i) => (
            <pre key={i} className="whitespace-pre-wrap">{line}</pre>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-space-steel flex items-center bg-space-dark">
          <span className="text-space-alert mr-2">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-space-text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Digite um comando..."
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;