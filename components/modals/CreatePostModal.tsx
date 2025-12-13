import React, { useState, useRef, useEffect } from 'react';
import { RichTextEditor } from '../ui/RichTextEditor';
import { Post, PostType, User } from '../../types';
import { Button, Input, Card } from '../ui/Shared';
import { X, Maximize2, Minimize2, Image as ImageIcon, UploadCloud, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { ImageCropper } from '../ui/ImageCropper';
import 'react-quill/dist/quill.snow.css';
import '../../quill-theme.css';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postType: PostType;
    currentUser: User | null;
    initialData?: Post; // Optional prop for editing
    onPostCreated: () => void;
    availableCategories: string[];
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, postType, currentUser, onPostCreated, initialData, availableCategories }) => {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(availableCategories[0] || '');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasDraft, setHasDraft] = useState(false);

    // Custom: Cover Image State
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // Crop states
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    // Draft management
    const getDraftKey = () => `draft_${postType}_${currentUser?.id || 'guest'}`;

    const saveDraft = () => {
        if (!title && !content && tags.length === 0) return; // Don't save empty drafts

        const draft = {
            title,
            category,
            content,
            tags,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(getDraftKey(), JSON.stringify(draft));
        setLastSaved(new Date());
    };

    const loadDraft = () => {
        const draftStr = localStorage.getItem(getDraftKey());
        if (!draftStr) return false;

        try {
            const draft = JSON.parse(draftStr);
            const draftAge = Date.now() - new Date(draft.timestamp).getTime();
            const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

            if (draftAge > SEVEN_DAYS) {
                localStorage.removeItem(getDraftKey());
                return false;
            }

            setTitle(draft.title || '');
            setCategory(draft.category || '');
            setContent(draft.content || '');
            setTags(draft.tags || []);
            setLastSaved(new Date(draft.timestamp));
            return true;
        } catch (e) {
            console.error('Error loading draft:', e);
            return false;
        }
    };

    const discardDraft = () => {
        if (confirm('Descartar rascunho? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem(getDraftKey());
            setTitle('');
            setCategory('');
            setContent('');
            setTags([]);
            setCoverImage(null);
            setCoverPreview(null);
            setLastSaved(null);
            setHasDraft(false);
        }
    };

    // Load draft OR initial data AND reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Editing mode - load post data
                setTitle(initialData.title);
                setCategory(initialData.category);
                setContent(initialData.content);
                setTags(initialData.tags);
                // Note: Editing existing cover image is complex as we need to support URL vs File. 
                // For now, we don't prepopulate the file input for existing remote images, 
                // but we could show the existing one if we handled it in state. 
                // (Assuming current implementation doesn't support viewing/deleting existing remote cover in this precise flow yet, relying on content embedded image).
            } else {
                const hasSavedDraft = loadDraft();
                setHasDraft(hasSavedDraft);

                // CRITICAL FIX: If no draft was found, we MUST reset the state
                // because the component stays mounted (returns null) and retains old state.
                if (!hasSavedDraft) {
                    setTitle('');
                    // Keep availableCategories[0] or empty
                    setCategory(availableCategories[0] || '');
                    setContent('');
                    setTags([]);
                    setCoverImage(null);
                    setCoverPreview(null);
                    setLastSaved(null);
                }
            }
        } else {
            // Optional: Reset on close to be safe, but mostly handled on open.
        }
    }, [isOpen, postType, initialData]);

    // Auto-save every 30 seconds (only if NOT editing an existing post, to avoid overwriting drafts with published data logic maybe? Or separate key?)
    // For now, disable auto-save drafts on Edit Mode to keep it simple
    useEffect(() => {
        if (!isOpen || initialData) return;

        const interval = setInterval(() => {
            saveDraft();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [isOpen, title, category, content, tags, initialData]);

    // Handle cover image selection
    const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const croppedFile = new File([croppedBlob], 'cover.jpg', { type: 'image/jpeg' });
        setCoverImage(croppedFile);
        const previewUrl = URL.createObjectURL(croppedBlob);
        setCoverPreview(previewUrl);
        setIsCropping(false);
        setImageToCrop(null);
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setImageToCrop(null);
    };

    const handleRemoveCoverImage = () => {
        setCoverImage(null);
        setCoverPreview(null);
    };

    // Save draft before closing (if user presses X)
    const handleClose = () => {
        saveDraft();
        onClose();
    };

    if (!isOpen) return null;

    const handleCreatePost = async () => {
        if (!title || !content || !currentUser) {
            alert("Preencha título e conteúdo.");
            return;
        }

        setIsLoading(true);

        try {
            let coverUrl = null;

            // 1. Upload Cover Image if exists
            if (coverImage) {
                const fileExt = coverImage.name.split('.').pop();
                const fileName = `${Math.random()}_${Date.now()}.${fileExt}`;
                const filePath = `covers/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(filePath, coverImage);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('images').getPublicUrl(filePath);
                coverUrl = data.publicUrl;
            }

            // 2. Prepare slug
            const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4);

            if (initialData) {
                // UPDATE EXISTING POST
                let finalContent = content;
                // If uploading new cover, prepend it. If not, keep content as is (assuming old cover is part of content HTML)
                if (coverUrl) {
                    finalContent = `<img src="${coverUrl}" alt="Cover" class="w-full h-64 object-cover rounded-md mb-6" />` + finalContent;
                }

                const { error } = await supabase
                    .from('posts')
                    .update({
                        title,
                        content: finalContent,
                        category: category || 'Geral',
                        tags: tags,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', initialData.id);

                if (error) throw error;
                showToast("Post atualizado com sucesso!", 'success');

            } else {
                // CREATE NEW POST
                let finalContent = content;
                if (coverUrl) {
                    finalContent = `<img src="${coverUrl}" alt="Cover" class="w-full h-64 object-cover rounded-md mb-6" />` + finalContent;
                }

                const { error } = await supabase
                    .from('posts')
                    .insert({
                        type: postType,
                        title,
                        content: finalContent,
                        category: category || 'Geral',
                        author_id: currentUser.id,
                        author_name: currentUser.username,
                        slug,
                        tags: tags,
                        created_at: new Date().toISOString()
                    });

                if (error) throw error;
                showToast("Post criado com sucesso!", 'success');
            }



            // Clear draft after successful post (only for new posts)
            if (!initialData) {
                localStorage.removeItem(getDraftKey());
            }

            onPostCreated();
            onClose();
            // Reset form
            setTitle('');
            setContent('');
            setTags([]);
            setCategory('');
            setCoverImage(null);
            setCoverPreview(null);
            setLastSaved(null);

        } catch (error: any) {
            console.error("Error creating post:", error);
            showToast("Erro ao criar post: " + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = (t: string) => {
        if (t && !tags.includes(t)) setTags([...tags, t]);
        setNewTag('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className={`w-full bg-space-black border-space-neon shadow-[0_0_50px_rgba(0,194,255,0.15)] flex flex-col transition-all duration-300 ${isExpanded ? 'h-[95vh] max-w-[95vw]' : 'h-[85vh] max-w-4xl'}`}>

                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b border-space-steel pb-4 sticky top-0 bg-space-black z-10">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-space-neon uppercase flex items-center gap-2">
                            {initialData ? 'EDITAR TRANSMISSÃO' : 'NOVA TRANSMISSÃO'} <span className="text-sm text-space-muted font-mono bg-space-dark px-2 py-0.5 rounded border border-space-steel">{postType}</span>
                        </h2>
                        <p className="text-[10px] text-space-muted font-mono tracking-widest">{initialData ? 'ATUALIZANDO DADOS DO ARQUIVO...' : 'CANAL SEGURO // CRIPTOGRAFIA ATIVADA'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-space-muted hover:text-white p-2">
                            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button onClick={onClose} className="text-space-muted hover:text-space-alert p-2">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">

                    {/* Title & Category Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="text-xs font-mono text-space-muted mb-1 block uppercase">Categoria</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-space-dark border border-space-steel text-white rounded px-3 py-2 text-sm focus:border-space-neon focus:ring-1 focus:ring-space-neon outline-none"
                            >
                                <option value="" disabled>Selecione...</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                {/* Fallback for existing posts with categories not in list */}
                                {initialData && !availableCategories.includes(initialData.category) && (
                                    <option value={initialData.category}>{initialData.category}</option>
                                )}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-mono text-space-muted mb-1 block uppercase">Título / Assunto</label>
                            <Input
                                placeholder="Digite o título..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="font-bold text-lg"
                            />
                        </div>
                    </div>

                    {/* Cover Image Upload (New) */}
                    <div className="border border-dashed border-space-steel rounded-lg p-4 bg-space-dark/20 text-center hover:bg-space-dark/40 transition-colors relative group">
                        <input
                            type="file"
                            id="cover-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverImageSelect}
                        />

                        {coverPreview ? (
                            <div className="relative w-full h-40 group">
                                <img src={coverPreview} alt="Preview" className="w-full h-full object-cover rounded border border-space-neon/50" />

                                {/* Overlay for actions */}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-4">
                                    <label htmlFor="cover-upload" className="text-white font-mono text-xs flex items-center gap-2 cursor-pointer hover:text-space-neon transition-colors p-2 rounded hover:bg-white/10">
                                        <ImageIcon size={16} /> Alterar
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoverImage}
                                        className="text-white hover:text-red-500 font-mono text-xs flex items-center gap-2 p-2 rounded hover:bg-white/10 transition-colors z-20"
                                    >
                                        <Trash2 size={16} /> Remover
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 w-full h-full">
                                <UploadCloud size={32} className="text-space-muted group-hover:text-space-neon" />
                                <p className="text-xs text-space-muted font-mono">Arraste ou clique para adicionar CAPA DA TRANSMISSÃO</p>
                            </label>
                        )}
                    </div>

                    {/* Rich Text Editor */}
                    <div className="flex-1 flex flex-col min-h-[300px]">
                        <label className="text-xs font-mono text-space-muted mb-1 block uppercase flex justify-between">
                            <span>Conteúdo Principal</span>
                            <span className="text-[10px] text-space-neon flex items-center gap-1">✓ DRAG & DROP SUPPORTED</span>
                        </label>

                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escreva sua transmissão aqui... Arraste imagens diretamente para o editor."
                            className="flex-1"
                        />
                    </div>

                    {/* Tags Section */}
                    <div>
                        <label className="text-xs font-mono text-space-muted mb-1 block uppercase">TAGS DO SISTEMA</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {tags.map(tag => (
                                <span key={tag} className="bg-space-neon text-black px-2 py-1 rounded text-xs font-bold font-mono uppercase flex items-center gap-1">
                                    #{tag}
                                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-white"><X size={12} /></button>
                                </span>
                            ))}
                            {tags.length === 0 && <span className="text-space-muted text-xs italic">Nenhuma tag selecionada.</span>}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Criar nova tag (ex: tutorial, naves)"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddTag(newTag)}
                            />
                            <Button variant="secondary" size="sm" onClick={() => handleAddTag(newTag)}>ADD</Button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="border-t border-space-steel pt-4 mt-4 flex justify-between gap-3">
                    <div>
                        {(title || content || tags.length > 0 || coverImage) && (
                            <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={discardDraft}>
                                <Trash2 size={16} className="mr-2" /> Descartar
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={handleClose}>SALVAR RASCUNHO & SAIR</Button>
                        <Button variant="primary" onClick={handleCreatePost} disabled={isLoading}>
                            {isLoading ? 'TRANSMITINDO...' : (initialData ? 'ATUALIZAR DADOS' : 'ENVIAR TRANSMISSÃO')}
                        </Button>
                    </div>
                </div>

            </Card>

            {/* Image Cropper Modal */}
            {isCropping && imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
};

export default CreatePostModal;
