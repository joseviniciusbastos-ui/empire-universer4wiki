import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from '../ui/Shared';
import { X, Save, Plus, Trash, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { BulletinItem } from '../../types';
import { RichTextEditor } from '../ui/RichTextEditor';

interface EditBulletinModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBulletins: BulletinItem[];
    onSave: (bulletins: BulletinItem[]) => Promise<void>;
}

const EditBulletinModal: React.FC<EditBulletinModalProps> = ({ isOpen, onClose, currentBulletins, onSave }) => {
    const { showToast } = useToast();
    const [bulletins, setBulletins] = useState<BulletinItem[]>(currentBulletins || []);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Sync state with props when they change
    useEffect(() => {
        setBulletins(currentBulletins || []);
        if (currentBulletins && currentBulletins.length > 0 && !selectedId) {
            setSelectedId(currentBulletins[0].id);
        }
    }, [currentBulletins]);

    const handleAdd = () => {
        const newItem: BulletinItem = {
            id: Date.now().toString(),
            title: 'Novo Comunicado',
            content: '',
            type: 'info',
            createdAt: new Date().toISOString()
        };
        setBulletins([...bulletins, newItem]);
        setSelectedId(newItem.id);
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newBulletins = bulletins.filter(b => b.id !== id);
        setBulletins(newBulletins);
        if (selectedId === id) {
            setSelectedId(newBulletins.length > 0 ? newBulletins[0].id : null);
        }
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

    const selectedItem = bulletins.find(b => b.id === selectedId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-5xl bg-space-black border-lime-500 shadow-[0_0_50px_rgba(132,204,22,0.15)] flex flex-col h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-space-dark/20">
                    <h2 className="text-xl font-display font-bold text-lime-400 uppercase tracking-wider">EDITOR DE BOLETIM OFICIAL</h2>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>CANCELAR</Button>
                        <Button variant="primary" onClick={handleSave} disabled={isLoading} className="bg-lime-500 hover:bg-lime-600 text-black border-none font-bold">
                            <Save size={16} className="mr-2" />
                            {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                        </Button>
                    </div>
                </div>

                {/* Content - Split View */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Sidebar List */}
                    <div className="w-1/3 border-r border-white/10 flex flex-col bg-space-dark/10">
                        <div className="p-4 border-b border-white/5">
                            <Button variant="ghost" onClick={handleAdd} className="w-full border border-space-neon text-space-neon hover:bg-space-neon hover:text-black justify-center">
                                <Plus size={16} className="mr-2" /> NOVO ITEM
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {bulletins.length === 0 && (
                                <div className="text-center py-10 text-space-muted font-mono text-xs italic">
                                    Lista vazia.
                                </div>
                            )}
                            {bulletins.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`p-3 rounded cursor-pointer border transition-all group relative ${selectedId === item.id
                                        ? 'bg-lime-500/10 border-lime-500'
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.type === 'alert' ? 'text-red-400 border-red-400/30' : 'text-blue-400 border-blue-400/30'
                                            }`}>
                                            {item.type === 'alert' ? 'ALERTA' : 'INFO'}
                                        </div>
                                        <button
                                            onClick={(e) => handleRemove(item.id, e)}
                                            className="text-space-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                    <p className={`text-sm font-bold truncate ${selectedId === item.id ? 'text-white' : 'text-space-muted'}`}>
                                        {item.title || 'Sem título'}
                                    </p>
                                    <p className="text-[10px] text-space-muted truncate mt-1 opacity-60">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Editor Area */}
                    <div className="flex-1 flex flex-col bg-space-black relative">
                        {selectedItem ? (
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                <div className="p-6 space-y-4 overflow-y-auto flex-1">

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] uppercase text-space-muted font-mono">Título</label>
                                            <Input
                                                value={selectedItem.title}
                                                onChange={(e) => handleChange(selectedItem.id, 'title', e.target.value)}
                                                placeholder="Título do alerta ou notícia"
                                                className="font-bold text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase text-space-muted font-mono">Prioridade</label>
                                            <div className="flex rounded border border-white/10 overflow-hidden">
                                                <button
                                                    onClick={() => handleChange(selectedItem.id, 'type', 'info')}
                                                    className={`flex-1 p-2 text-xs font-mono flex items-center justify-center gap-2 transition-colors ${selectedItem.type === 'info'
                                                        ? 'bg-blue-500/20 text-blue-400 font-bold'
                                                        : 'hover:bg-white/5 text-space-muted'
                                                        }`}
                                                >
                                                    <Info size={12} /> INFO
                                                </button>
                                                <div className="w-[1px] bg-white/10" />
                                                <button
                                                    onClick={() => handleChange(selectedItem.id, 'type', 'alert')}
                                                    className={`flex-1 p-2 text-xs font-mono flex items-center justify-center gap-2 transition-colors ${selectedItem.type === 'alert'
                                                        ? 'bg-red-500/20 text-red-500 font-bold'
                                                        : 'hover:bg-white/5 text-space-muted'
                                                        }`}
                                                >
                                                    <AlertTriangle size={12} /> ALERTA
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-space-muted font-mono">
                                            Post ID (Opcional - Para tornar clicável)
                                        </label>
                                        <Input
                                            value={selectedItem.postId || ''}
                                            onChange={(e) => handleChange(selectedItem.id, 'postId', e.target.value)}
                                            placeholder="Digite o ID do post para vincular"
                                            className="font-mono text-sm"
                                        />
                                        <p className="text-[9px] text-space-muted/60 italic">
                                            💡 Vincule este bulletin a um post existente para que usuários possam clicar e visualizá-lo. Deixe vazio para apenas exibir informação.
                                        </p>
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-[400px]">
                                        <label className="text-[10px] uppercase text-space-muted font-mono mb-2">Conteúdo Detalhado</label>
                                        <RichTextEditor
                                            value={selectedItem.content}
                                            onChange={(val) => handleChange(selectedItem.id, 'content', val)}
                                            placeholder="Escreva os detalhes..."
                                            className="flex-1 h-full min-h-[300px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-space-muted opacity-50 p-10 text-center">
                                <div className="p-4 rounded-full bg-white/5 mb-4">
                                    <ChevronRight size={40} />
                                </div>
                                <p>Selecione um item à esquerda para editar<br />ou crie um novo comunicado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default EditBulletinModal;
