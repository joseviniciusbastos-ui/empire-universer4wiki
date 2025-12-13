import React, { useRef, useEffect, useState, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { supabase } from '../../lib/supabase';
import 'react-quill/dist/quill.snow.css';
import '../../quill-theme.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = "Escreva aqui...",
    className = "",
    minHeight = "300px"
}) => {
    const quillRef = useRef<any>(null);
    const [ReactQuillComponent, setReactQuillComponent] = useState<any>(null);

    // Dynamic import for React Quill and ImageResize module
    useEffect(() => {
        const loadQuill = async () => {
            const quillModule = await import('react-quill');
            const Quill = quillModule.default.Quill;

            // Register image resize module
            try {
                // Check if already registered to avoid warning
                if (!(Quill as any).imports['modules/imageResize']) {
                    const ImageResize = (await import('quill-image-resize-module-react')).default;
                    Quill.register('modules/imageResize', ImageResize);
                }
            } catch (e) {
                console.error('Failed to load image resize module:', e);
            }

            setReactQuillComponent(() => quillModule.default);
        };

        loadQuill();
    }, []);

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
                    const range = editor.getSelection(true) || { index: editor.getLength() };
                    editor.insertEmbed(range.index, 'image', url);
                    editor.setSelection(range.index + 1);
                }
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        imageResize: {
            parchment: ReactQuillComponent?.Quill?.import('parchment'),
            modules: ['Resize', 'DisplaySize']
        },
        keyboard: {
            bindings: {
                imageBackspace: {
                    key: 8, // Backspace
                    collapsed: false,
                    format: ['image'],
                    handler: function (range: any) {
                        if (this.quill) {
                            // Clear selection first to trigger 'blur' on the image
                            this.quill.setSelection(null);

                            // Remove hacks from DOM
                            const overlays = document.querySelectorAll('[class*="image-resize"]');
                            overlays.forEach(el => el.remove());

                            // Wait for next tick to ensure event listeners don't fire on a dead element
                            setTimeout(() => {
                                if (this.quill) {
                                    this.quill.deleteText(range.index, range.length);
                                }
                            }, 50);
                        }
                    }
                },
                imageDelete: {
                    key: 46, // Delete
                    collapsed: false,
                    format: ['image'],
                    handler: function (range: any) {
                        if (this.quill) {
                            this.quill.setSelection(null);

                            const overlays = document.querySelectorAll('[class*="image-resize"]');
                            overlays.forEach(el => el.remove());

                            setTimeout(() => {
                                if (this.quill) {
                                    this.quill.deleteText(range.index, range.length);
                                }
                            }, 50);
                        }
                    }
                }
            }
        }
    }), [ReactQuillComponent]);

    const handlePaste = async (e: React.ClipboardEvent) => {
        const clipboardItems = e.clipboardData.items;
        for (let i = 0; i < clipboardItems.length; i++) {
            const item = clipboardItems[i];
            if (item.type.startsWith('image/')) {
                e.preventDefault();
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
    };

    const handleDrop = async (e: React.DragEvent) => {
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
    };

    if (!ReactQuillComponent) {
        return (
            <div className={`flex items-center justify-center bg-space-darker/50 border border-space-steel rounded p-4 ${className}`} style={{ minHeight }}>
                <span className="text-space-muted font-mono text-sm">Carregando editor...</span>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col ${className}`}
            style={{ minHeight }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onPaste={handlePaste}
        >
            <ReactQuillComponent
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                className="flex-1 quill-editor"
                modules={modules}
                placeholder={placeholder}
            />
        </div>
    );
};
