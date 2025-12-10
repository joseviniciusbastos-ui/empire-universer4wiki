import React, { useState, useRef, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { PostType, User } from '../../types';
import { Button, Input, Card } from '../ui/Shared';
import { X, Maximize2, Minimize2, Image as ImageIcon, UploadCloud, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import 'react-quill/dist/quill.snow.css';
import '../../quill-theme.css';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postType: PostType;
    currentUser: User | null;
    onPostCreated: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, postType, currentUser, onPostCreated }) => {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [ReactQuill, setReactQuill] = useState<any>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasDraft, setHasDraft] = useState(false);
    const quillRef = useRef<any>(null);

    // Dynamic import for React Quill and ImageResize module
    useEffect(() => {
        const loadQuill = async () => {
            const quillModule = await import('react-quill');
            const Quill = quillModule.default.Quill;

            // Register image resize module
            try {
                const ImageResize = (await import('quill-image-resize-module-react')).default;
                Quill.register('modules/imageResize', ImageResize);
            } catch (e) {
                console.error('Failed to load image resize module:', e);
            }

            setReactQuill(() => quillModule.default);
        };

        loadQuill();
    }, []);

    // Custom: Cover Image State
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

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

    // Load draft when modal opens
    useEffect(() => {
        if (isOpen) {
            const hasSavedDraft = loadDraft();
            setHasDraft(hasSavedDraft);
        }
    }, [isOpen, postType]);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            saveDraft();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [isOpen, title, category, content, tags]);

    // Save draft before closing (if user presses X)
    const handleClose = () => {
        saveDraft();
        onClose();
    };

    // Handle image upload from paste or drag
    const handleImageUpload = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop() || 'png';
            const fileName = `${Math.random()}_${Date.now()}.${fileExt}`;
            const filePath = `content-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    // Custom image handler for Quill
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                const url = await handleImageUpload(file);
                if (url && quillRef.current) {
                    const editor = quillRef.current.getEditor();
                    const range = editor.getSelection(true);
                    editor.insertEmbed(range.index, 'image', url);
                    editor.setSelection(range.index + 1);
                }
            }
        };
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

            // 3. Insert Post 
            // Content is already HTML from Quill, we prepend the cover image if it exists
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

            // Clear draft after successful post
            localStorage.removeItem(getDraftKey());

            showToast("Post criado com sucesso!", 'success');
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
                            NOVA TRANSMISSÃO <span className="text-sm text-space-muted font-mono bg-space-dark px-2 py-0.5 rounded border border-space-steel">{postType}</span>
                        </h2>
                        <p className="text-[10px] text-space-muted font-mono tracking-widest">CANAL SEGURO // CRIPTOGRAFIA ATIVADA</p>
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
                            <Input
                                placeholder="Ex: Oficial, Guia..."
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            />
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
                            onChange={handleFileChange}
                        />
                        <label htmlFor="cover-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 w-full h-full">
                            {coverPreview ? (
                                <div className="relative w-full h-40">
                                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover rounded border border-space-neon/50" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-mono text-xs flex items-center gap-2"><ImageIcon size={16} /> Alterar Capa</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud size={32} className="text-space-muted group-hover:text-space-neon" />
                                    <p className="text-xs text-space-muted font-mono">Arraste ou clique para adicionar CAPA DA TRANSMISSÃO</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Rich Text Editor */}
                    <div
                        className="flex-1 flex flex-col min-h-[300px]"
                        onDrop={async (e) => {
                            e.preventDefault();
                            const files = e.dataTransfer.files;
                            if (files && files.length > 0) {
                                for (let i = 0; i < files.length; i++) {
                                    const file = files[i];
                                    if (file.type.startsWith('image/')) {
                                        const url = await handleImageUpload(file);
                                        if (url && quillRef.current) {
                                            const editor = quillRef.current.getEditor();
                                            const range = editor.getSelection(true) || { index: editor.getLength() };
                                            editor.insertEmbed(range.index, 'image', url);
                                            editor.setSelection(range.index + 1);
                                        }
                                    }
                                }
                            }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onPaste={async (e) => {
                            const clipboardItems = e.clipboardData.items;
                            // Loop through items properly
                            for (let i = 0; i < clipboardItems.length; i++) {
                                const item = clipboardItems[i];
                                if (item.type.startsWith('image/')) {
                                    e.preventDefault(); // Prevent default base64 paste
                                    const file = item.getAsFile();
                                    if (file) {
                                        const url = await handleImageUpload(file);
                                        if (url && quillRef.current) {
                                            const editor = quillRef.current.getEditor();
                                            const range = editor.getSelection(true) || { index: editor.getLength() };
                                            editor.insertEmbed(range.index, 'image', url);
                                            editor.setSelection(range.index + 1);
                                        }
                                    }
                                }
                            }
                        }}
                    >
                        <label className="text-xs font-mono text-space-muted mb-1 block uppercase flex justify-between">
                            <span>Conteúdo Principal</span>
                            <span className="text-[10px] text-space-neon flex items-center gap-1">✓ DRAG & DROP SUPPORTED</span>
                        </label>

                        {ReactQuill ? (
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                className="flex-1 quill-editor"
                                modules={React.useMemo(() => ({
                                    toolbar: {
                                        container: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['blockquote', 'code-block'],
                                            [{ 'color': [] }, { 'background': [] }],
                                            ['link', 'image'],
                                            ['clean']
                                        ],
                                        handlers: {
                                            image: imageHandler
                                        }
                                    },
                                    imageResize: {
                                        parchment: ReactQuill.Quill.import('parchment'),
                                        modules: ['Resize', 'DisplaySize']
                                    }
                                }), [])}
                                placeholder="Escreva sua transmissão aqui... Arraste imagens diretamente para o editor."
                            />
                        ) : (
                            <div className="flex-1 bg-space-darker/50 border border-space-steel rounded p-4 flex items-center justify-center">
                                <span className="text-space-muted font-mono text-sm">Carregando editor...</span>
                            </div>
                        )}
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
                <div className="border-t border-space-steel pt-4 mt-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>CANCELAR</Button>
                    <Button variant="primary" onClick={handleCreatePost} disabled={isLoading}>
                        {isLoading ? 'TRANSMITINDO...' : 'ENVIAR TRANSMISSÃO'}
                    </Button>
                </div>

            </Card>
        </div>
    );
};

export default CreatePostModal;
