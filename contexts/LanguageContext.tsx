import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';

export type Language = 'pt' | 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    translatePost: (post: Post) => Promise<{ title: string; content: string }>;
    isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('app_language');
        return (stored as Language) || 'pt';
    });
    const [isTranslating, setIsTranslating] = useState(false);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);
    };

    const translateText = async (text: string, targetLang: string) => {
        if (!text || targetLang === 'pt') return text;

        // Split text into chunks to avoid URL length limits (approx 2000 chars)
        const chunks: string[] = [];
        const maxLength = 1000;
        let currentPos = 0;
        while (currentPos < text.length) {
            chunks.push(text.slice(currentPos, currentPos + maxLength));
            currentPos += maxLength;
        }

        try {
            const translatedChunks = await Promise.all(
                chunks.map(async (chunk) => {
                    const response = await fetch(
                        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`
                    );
                    if (!response.ok) throw new Error('Translation API failed');
                    const data = await response.json();
                    return data[0].map((item: any) => item[0] || '').join('');
                })
            );
            return translatedChunks.join('');
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    };

    const translatePost = async (post: Post): Promise<{ title: string; content: string }> => {
        if (language === 'pt') return { title: post.title, content: post.content };

        // Check cache
        if (post.translations && post.translations[language]) {
            return post.translations[language];
        }

        setIsTranslating(true);
        try {
            const translatedTitle = await translateText(post.title, language);
            const translatedContent = await translateText(post.content, language);

            const translation = { title: translatedTitle, content: translatedContent };

            // Update database cache (optional, don't block if RLS fails)
            const newTranslations = { ...(post.translations || {}), [language]: translation };
            supabase
                .from('posts')
                .update({ translations: newTranslations })
                .eq('id', post.id)
                .then(({ error }) => {
                    if (error) console.warn('Could not cache translation (likely RLS):', error.message);
                });

            return translation;
        } catch (error) {
            console.error('Error translating post:', error);
            return { title: post.title, content: post.content };
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, translatePost, isTranslating }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new LanguageContextError('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

class LanguageContextError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LanguageContextError';
    }
}
