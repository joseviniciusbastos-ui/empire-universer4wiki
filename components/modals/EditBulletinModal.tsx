import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge } from '../ui/Shared';
import { X, Save, Plus, Trash, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { BulletinItem } from '../../types';

interface EditBulletinModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBulletins: BulletinItem[];
    onSave: (bulletins: BulletinItem[]) => Promise<void>;
}

const EditBulletinModal: React.FC<EditBulletinModalProps> = ({ isOpen, onClose, currentBulletins, onSave }) => {
    const { showToast } = useToast();
    const [bulletins, setBulletins] = useState<BulletinItem[]>(currentBulletins || []);
    const [isLoading, setIsLoading] = useState(false);

    // Sync state with props when they change
    useEffect(() => {
        setBulletins(currentBulletins || []);
    }, [currentBulletins]);

    const handleAdd = () => {
        const newItem: BulletinItem = {
            id: Date.now().toString(),
            title: '',
            content: '',
            type: 'info',
            createdAt: new Date().toISOString()
        };
        setBulletins([...bulletins, newItem]);
    };

    const handleRemove = (id: string) => {
        setBulletins(bulletins.filter(b => b.id !== id));
    };

    const handleChange = (id: string, field: keyof BulletinItem, value: string) => {
        setBulletins(bulletins.map(b =>
            b.id === id ? { ...b, [field]: value } : b
        ));
    };

    const handleSave = async () => {
        // Validation
        if (bulletins.some(b => !b.title || !b.content)) {
            showToast('Preencha título e conteúdo de todos os itens.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            await onSave(bulletins);
            showToast('Boletim oficial atualizado!', 'success');
            onClose();
        } catch (error: any) {
            console.error("Error saving bulletins:", error);
            showToast('Erro ao salvar: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl bg-space-black border-lime-500 shadow-[0_0_50px_rgba(132,204,22,0.15)] flex flex-col h-[85vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-display font-bold text-lime-400 uppercase">EDITOR DE BOLETIM OFICIAL</h2>
                    <button onClick={onClose} className="text-space-muted hover:text-white p-2">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={handleAdd} className="border border-space-neon text-space-neon hover:bg-space-neon hover:text-black">
                            <Plus size={16} className="mr-2" /> ADICIONAR ITEM
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {bulletins.length === 0 && (
                            <div className="text-center py-10 text-space-muted font-mono border border-dashed border-white/20 rounded">
                                Nenhum item no boletim. Adicione um novo item acima.
                            </div>
                        )}
                        {bulletins.map((item, index) => (
                            <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-lg relative group">
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 p-2 rounded opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash size={16} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-space-muted">Título</label>
                                        <Input
                                            value={item.title}
                                            onChange={(e) => handleChange(item.id, 'title', e.target.value)}
                                            placeholder="Título do alerta ou notícia"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-space-muted">Tipo</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleChange(item.id, 'type', 'info')}
                                                className={`flex-1 p-2 rounded border text-sm font-mono flex items-center justify-center gap-2 transition-all ${item.type === 'info'
                                                        ? 'bg-space-neon/20 border-space-neon text-space-neon'
                                                        : 'bg-transparent border-white/20 text-space-muted hover:border-white/50'
                                                    }`}
                                            >
                                                <Info size={14} /> INFO
                                            </button>
                                            <button
                                                onClick={() => handleChange(item.id, 'type', 'alert')}
                                                className={`flex-1 p-2 rounded border text-sm font-mono flex items-center justify-center gap-2 transition-all ${item.type === 'alert'
                                                        ? 'bg-red-500/20 border-red-500 text-red-500'
                                                        : 'bg-transparent border-white/20 text-space-muted hover:border-white/50'
                                                    }`}
                                            >
                                                <AlertTriangle size={14} /> ALERTA
                                            </button>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] uppercase text-space-muted">Conteúdo</label>
                                        <textarea
                                            value={item.content}
                                            onChange={(e) => handleChange(item.id, 'content', e.target.value)}
                                            placeholder="Descrição detalhada..."
                                            className="w-full bg-space-black border border-space-steel rounded p-2 text-white focus:outline-none focus:border-space-neon h-20 resize-none font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 pt-4 mt-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>CANCELAR</Button>
                    <Button variant="primary" onClick={handleSave} disabled={isLoading} className="bg-lime-500 hover:bg-lime-600 text-black border-none">
                        <Save size={16} className="mr-2" />
                        {isLoading ? 'SALVANDO...' : 'SALVAR BOLETIM'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default EditBulletinModal;
