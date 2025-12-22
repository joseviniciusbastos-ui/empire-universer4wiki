import React, { useState, useRef } from 'react';
import { Button, Input, Card } from '../ui/Shared';
import { X, UploadCloud, Image as ImageIcon, Trash2, Send, AlertTriangle, MessageSquare, Lightbulb } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { User } from '../../types';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, currentUser }) => {
    const { showToast } = useToast();
    const [type, setType] = useState<'BUG' | 'SUGGESTION' | 'MESSAGE' | 'OTHER'>('BUG');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) {
            showToast("Máximo de 5 imagens por relato.", "error");
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async () => {
        if (!title || !content || !currentUser) {
            showToast("Preencha título e descrição.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const uploadedImageUrls: string[] = [];

            // 1. Upload Images
            for (const image of images) {
                const fileExt = image.name.split('.').pop();
                const fileName = `${Math.random()}_${Date.now()}.${fileExt}`;
                const filePath = `reports/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, image);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('images').getPublicUrl(filePath);
                uploadedImageUrls.push(data.publicUrl);
            }

            // 2. Save Report
            const { error } = await supabase
                .from('user_reports')
                .insert({
                    user_id: currentUser.id,
                    type,
                    title,
                    content,
                    images: uploadedImageUrls,
                    status: 'OPEN'
                });

            if (error) throw error;

            showToast("Relato enviado com sucesso! Nosso setor de inteligência irá analisar.", "success");

            try {
                await supabase.from('notifications').insert({
                    user_id: '775f47ef-75f9-4c8d-88bb-0a7ffa1143c5', // Assuming a main admin ID or broadcast
                    type: 'SYSTEM',
                    message: `Novo ${type}: ${title} enviado por ${currentUser.username}`,
                    read: false
                });
            } catch (e) {
                console.error("Error creating admin notification:", e);
            }

            resetForm();
            onClose();
        } catch (error: any) {
            console.error("Error submitting feedback:", error);
            showToast("Erro ao enviar: " + error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setImages([]);
        setPreviews([]);
        setType('BUG');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl bg-space-black border-space-neon shadow-[0_0_50px_rgba(0,194,255,0.2)] flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-space-steel pb-4">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-space-neon uppercase flex items-center gap-2">
                            <MessageSquare className="text-space-neon" /> Feedback & Report
                        </h2>
                        <p className="text-[10px] text-space-muted font-mono tracking-widest uppercase">Canal Direto de Comunicação com o Comando Central</p>
                    </div>
                    <button onClick={onClose} className="text-space-muted hover:text-space-alert transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">

                    {/* Report Type Selection */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { value: 'BUG', label: 'BUG', icon: AlertTriangle, color: 'text-red-500' },
                            { value: 'SUGGESTION', label: 'SUGESTÃO', icon: Lightbulb, color: 'text-yellow-400' },
                            { value: 'MESSAGE', label: 'MENSAGEM', icon: MessageSquare, color: 'text-space-neon' },
                            { value: 'OTHER', label: 'OUTRO', icon: MessageSquare, color: 'text-space-muted' }
                        ].map(item => (
                            <button
                                key={item.value}
                                onClick={() => setType(item.value as any)}
                                className={`flex flex-col items-center justify-center p-3 rounded border transition-all ${type === item.value
                                    ? 'bg-space-neon/10 border-space-neon text-white shadow-[0_0_10px_rgba(0,194,255,0.2)]'
                                    : 'bg-space-dark border-space-steel text-space-muted hover:border-space-steel/50'}`}
                            >
                                <item.icon size={20} className={type === item.value ? item.color : 'text-space-muted'} />
                                <span className="text-[10px] font-mono mt-2 uppercase font-bold">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-mono text-space-muted mb-2 block uppercase tracking-widest">Título do Relato</label>
                            <Input
                                placeholder="Seja conciso e claro..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="bg-space-dark/50 border-space-steel focus:border-space-neon transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-mono text-space-muted mb-2 block uppercase tracking-widest">Descrição Detalhada</label>
                            <textarea
                                placeholder="Descreva o que aconteceu ou sua ideia com o máximo de detalhes possível..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                className="w-full bg-space-dark/50 border border-space-steel rounded-md p-3 text-sm text-white focus:border-space-neon focus:ring-1 focus:ring-space-neon outline-none min-h-[150px] font-mono transition-all"
                            />
                        </div>

                        {/* Image Upload Area */}
                        <div>
                            <label className="text-xs font-mono text-space-muted mb-2 block uppercase tracking-widest">Anexos de Imagem ({images.length}/5)</label>

                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {previews.map((preview, idx) => (
                                    <div key={idx} className="relative aspect-square rounded border border-space-neon/30 overflow-hidden group">
                                        <img src={preview} alt="Attachment" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute inset-0 bg-red-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded border border-dashed border-space-steel bg-space-dark/30 flex flex-col items-center justify-center hover:border-space-neon hover:bg-space-neon/5 transition-all group"
                                    >
                                        <UploadCloud size={24} className="text-space-muted group-hover:text-space-neon" />
                                        <span className="text-[8px] font-mono text-space-muted mt-1 uppercase">Upload</span>
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-space-steel flex items-center justify-between">
                    <p className="text-[9px] text-space-muted font-mono max-w-[60%] italic">
                        PROTOCOL_SECURITY: Seu relato será registrado com ID único e analisado em até 48 ciclos galácticos.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>CANCELAR</Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="shadow-[0_0_15px_rgba(0,194,255,0.3)]"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ENVIANDO...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send size={16} /> ENVIAR RELATO
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default FeedbackModal;
