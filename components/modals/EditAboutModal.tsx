import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button, Input, Card } from '../ui/Shared';
import { useToast } from '../../contexts/ToastContext';
import { X, Save, FileText } from 'lucide-react';

interface EditAboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTitle: string;
    currentContent: string;
    onSave: () => void;
}

export default function EditAboutModal({ isOpen, onClose, currentTitle, currentContent, onSave }: EditAboutModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState(currentTitle);
    const [content, setContent] = useState(currentContent);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setTitle(currentTitle);
        setContent(currentContent);
    }, [currentTitle, currentContent]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsLoading(true);

        try {
            // Update title
            const { error: titleError } = await supabase
                .from('site_settings')
                .update({ value: title, updated_at: new Date().toISOString() })
                .eq('key', 'about_title');

            if (titleError) throw titleError;

            // Update content
            const { error: contentError } = await supabase
                .from('site_settings')
                .update({ value: content, updated_at: new Date().toISOString() })
                .eq('key', 'about_content');

            if (contentError) throw contentError;

            showToast('Conteúdo atualizado com sucesso!', 'success');
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error saving about content:', error);
            showToast('Erro ao salvar: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl bg-space-black border-space-neon shadow-[0_0_30px_rgba(0,194,255,0.1)]">
                <div className="flex justify-between items-center mb-6 border-b border-space-steel pb-4">
                    <h2 className="text-xl font-display font-bold text-space-neon uppercase flex items-center gap-2">
                        <FileText size={20} /> Editar Sobre a Wiki
                    </h2>
                    <button onClick={onClose} className="text-space-muted hover:text-space-alert p-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-space-muted uppercase mb-2 block font-mono">Título</label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Título da seção..."
                            className="font-bold text-lg"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-space-muted uppercase mb-2 block font-mono">Descrição</label>
                        <textarea
                            className="w-full bg-black border border-space-steel px-4 py-3 text-space-text font-mono focus:border-space-neon focus:outline-none rounded-sm min-h-[150px] text-sm leading-relaxed"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Escreva sobre o que é esta Wiki..."
                        />
                        <p className="text-[10px] text-space-muted mt-1 font-mono">
                            Dica: Descreva o propósito da Wiki, o que os visitantes podem encontrar aqui, e como contribuir.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-space-steel">
                    <Button variant="ghost" onClick={onClose}>CANCELAR</Button>
                    <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                        <Save size={16} className="mr-2" />
                        {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
