import React from 'react';
import { Card, Button } from '../ui/Shared';
import { X, Calendar, AlertTriangle, Info } from 'lucide-react';
import { BulletinItem } from '../../types';

interface BulletinViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bulletin: BulletinItem | null;
}

const BulletinViewModal: React.FC<BulletinViewModalProps> = ({ isOpen, onClose, bulletin }) => {
    if (!isOpen || !bulletin) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className={`w-full max-w-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${bulletin.type === 'alert' ? 'border-red-500 shadow-red-500/20' : 'border-space-neon shadow-space-neon/20'
                }`}>
                {/* Header */}
                <div className={`p-4 border-b flex justify-between items-start ${bulletin.type === 'alert' ? 'bg-red-500/10 border-red-500/30' : 'bg-space-neon/10 border-space-neon/30'
                    }`}>
                    <div className="flex gap-3">
                        <div className={`mt-1 p-2 rounded-full ${bulletin.type === 'alert' ? 'bg-red-500/20 text-red-500' : 'bg-space-neon/20 text-space-neon'
                            }`}>
                            {bulletin.type === 'alert' ? <AlertTriangle size={24} /> : <Info size={24} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${bulletin.type === 'alert' ? 'text-red-400 border-red-400/30' : 'text-blue-400 border-blue-400/30'
                                    }`}>
                                    {bulletin.type === 'alert' ? 'Alerta Oficial' : 'Comunicado'}
                                </span>
                                <span className="text-space-muted text-xs flex items-center gap-1 font-mono">
                                    <Calendar size={10} />
                                    {new Date(bulletin.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h2 className="text-xl font-display font-bold text-white leading-tight">
                                {bulletin.title}
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-space-muted hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-space-black flex-1">
                    <div
                        className="prose prose-invert prose-sm max-w-none font-mono text-space-muted/90 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: bulletin.content }}
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-space-dark/30 flex justify-end">
                    <Button variant="ghost" onClick={onClose} className="border border-white/10 hover:bg-white/5">
                        FECHAR COMUNICADO
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default BulletinViewModal;
