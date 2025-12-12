import React, { useState } from 'react';
import { Button, Input, Card } from '../ui/Shared';
import { RichTextEditor } from '../ui/RichTextEditor';
import { X, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface EditWelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTitle: string;
    initialContent: string;
    onSave: (title: string, content: string) => Promise<void>;
}

const EditWelcomeModal: React.FC<EditWelcomeModalProps> = ({ isOpen, onClose, initialTitle, initialContent, onSave }) => {
    const { showToast } = useToast();
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSave(title, content);
            showToast('Seção de boas-vindas atualizada!', 'success');
            onClose();
        } catch (error: any) {
            console.error("Error saving welcome section:", error);
            showToast('Erro ao salvar: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl bg-space-black border-space-neon shadow-[0_0_50px_rgba(0,194,255,0.15)] flex flex-col h-[85vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-space-steel pb-4">
                    <h2 className="text-2xl font-display font-bold text-space-neon uppercase">EDITOR DE BOAS-VINDAS</h2>
                    <button onClick={onClose} className="text-space-muted hover:text-white p-2">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <div>
                        <label className="text-xs font-mono text-space-muted mb-1 block uppercase">Título da Seção</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Bem-vindo à Wiki EU4"
                            className="font-bold text-lg"
                        />
                    </div>

                    <div className="flex flex-col flex-1 min-h-[400px]">
                        <label className="text-xs font-mono text-space-muted mb-1 block uppercase">Conteúdo</label>
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escreva a mensagem de boas-vindas..."
                            className="flex-1"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-space-steel pt-4 mt-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>CANCELAR</Button>
                    <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                        <Save size={16} className="mr-2" />
                        {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default EditWelcomeModal;
