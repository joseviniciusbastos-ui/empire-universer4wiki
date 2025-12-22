import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button, Card, Badge, Input } from './ui/Shared';
import {
    Users, Settings, Save, Trash2, Shield, ShieldAlert,
    CheckCircle, X, ChevronUp, ChevronDown, FileText
} from 'lucide-react';
import { PostType, User } from '../types';
import { useToast } from '../contexts/ToastContext';

interface AdminPanelProps {
    currentUser: User | null;
}

const CATEGORY_KEYS = {
    [PostType.WIKI]: 'categories_wiki',
    [PostType.BLOG]: 'categories_blog',
    [PostType.THREAD]: 'categories_thread',
    [PostType.ARTICLE]: 'categories_article',
};

export default function AdminPanel({ currentUser }: AdminPanelProps) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'publications'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'settings') fetchSettings();
        if (activeTab === 'publications') fetchPosts();
    }, [activeTab]);

    // --- USERS MANAGEMENT ---
    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('joined_at', { ascending: false });

        if (data) setUsers(data);
        setIsLoading(false);
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        setLoadingAction(userId);
        const { error } = await supabase.rpc('set_user_role', {
            target_user_id: userId,
            new_role: newRole
        });

        if (!error) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            showToast("Função atualizada com sucesso.", "success");
        } else {
            console.error(error);
            showToast("Erro ao atualizar: " + error.message, "error");
        }
        setLoadingAction(null);
    };

    // --- SETTINGS MANAGEMENT ---
    const fetchSettings = async () => {
        setIsLoading(true);
        const { data } = await supabase.from('app_settings').select('*');
        if (data) {
            const loadedCats: any = {};
            data.forEach(item => {
                loadedCats[item.key] = item.value;
            });
            setCategories(loadedCats);
        }
        setIsLoading(false);
    };

    const updateCategory = async (key: string, newValues: string[]) => {
        setLoadingAction(key);
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key, value: newValues });

        if (!error) {
            setCategories({ ...categories, [key]: newValues });
        }
        setLoadingAction(null);
    };

    const handleAddCategory = (key: string, currentValue: string[]) => {
        const newCat = prompt("Nome da nova categoria:");
        if (newCat && !currentValue.includes(newCat)) {
            updateCategory(key, [...currentValue, newCat]);
        }
    };

    const handleRemoveCategory = (key: string, currentValue: string[], catToRemove: string) => {
        if (confirm(`Remover categoria "${catToRemove}"?`)) {
            updateCategory(key, currentValue.filter(c => c !== catToRemove));
        }
    };

    const moveCategory = async (key: string, currentValue: string[], index: number, direction: 'up' | 'down') => {
        const newValues = [...currentValue];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newValues.length) return;

        [newValues[index], newValues[newIndex]] = [newValues[newIndex], newValues[index]];
        updateCategory(key, newValues);
    };

    // --- PUBLICATIONS MANAGEMENT ---
    const fetchPosts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('type', { ascending: true })
            .order('category', { ascending: true })
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (data) setPosts(data);
        setIsLoading(false);
    };

    const updatePostOrder = async (postId: string, newOrder: number) => {
        const { error } = await supabase
            .from('posts')
            .update({ display_order: newOrder })
            .eq('id', postId);

        if (error) {
            showToast("Erro ao atualizar ordem: " + error.message, "error");
        }
    };

    const updatePostType = async (postId: string, newType: PostType) => {
        setLoadingAction(postId);
        // Reset category to the first one of the new type or empty if none
        const newTypeKey = CATEGORY_KEYS[newType];
        const newTypeCats = categories[newTypeKey] || [];
        const newCategory = newTypeCats.length > 0 ? newTypeCats[0] : '';

        const { error } = await supabase
            .from('posts')
            .update({
                type: newType,
                category: newCategory
            })
            .eq('id', postId);

        if (!error) {
            showToast("Tipo de publicação alterado e categoria resetada.", "success");
            fetchPosts(); // Refresh to move the post to the right section
        } else {
            showToast("Erro ao atualizar tipo: " + error.message, "error");
        }
        setLoadingAction(null);
    };

    const movePost = async (postsInCategory: any[], index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= postsInCategory.length) return;

        const currentPost = postsInCategory[index];
        const targetPost = postsInCategory[newIndex];

        const currentOrder = currentPost.display_order || 0;
        const targetOrder = targetPost.display_order || 0;

        const finalCurrentOrder = targetOrder;
        const finalTargetOrder = currentOrder === targetOrder ? targetOrder + 1 : currentOrder;

        setLoadingAction(currentPost.id);

        const updatedPosts = [...posts];
        const idx1 = updatedPosts.findIndex(p => p.id === currentPost.id);
        const idx2 = updatedPosts.findIndex(p => p.id === targetPost.id);
        updatedPosts[idx1].display_order = finalCurrentOrder;
        updatedPosts[idx2].display_order = finalTargetOrder;
        setPosts(updatedPosts);

        await Promise.all([
            updatePostOrder(currentPost.id, finalCurrentOrder),
            updatePostOrder(targetPost.id, finalTargetOrder)
        ]);

        fetchPosts();
        setLoadingAction(null);
    };


    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border mr-2 border-space-alert bg-space-alert/10 rounded">
                <ShieldAlert size={48} className="text-space-alert mb-4" />
                <h2 className="text-2xl font-display font-bold text-white">ACESSO NEGADO</h2>
                <p className="text-space-muted font-mono mt-2">Nível de credencial insuficiente.<br />Contate o Comando Central.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-10">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-display font-bold uppercase flex items-center gap-3">
                    <Shield className="text-space-neon" /> Painel Administrativo
                </h2>
                <div className="flex gap-2">
                    <Button variant={activeTab === 'users' ? 'primary' : 'ghost'} onClick={() => setActiveTab('users')} icon={<Users size={16} />}>USUÁRIOS</Button>
                    <Button variant={activeTab === 'publications' ? 'primary' : 'ghost'} onClick={() => setActiveTab('publications')} icon={<FileText size={16} />}>PUBLICAÇÕES</Button>
                    <Button variant={activeTab === 'settings' ? 'primary' : 'ghost'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />}>CATEGORIAS</Button>
                </div>
            </div>

            {activeTab === 'users' && (
                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? <p className="text-mono text-space-muted">Carregando dados biométricos...</p> : (
                        users.map(user => (
                            <Card key={user.id} className="flex justify-between items-center p-4 hover:border-space-neon transition-colors">
                                <div className="flex items-center gap-4">
                                    <img src={user.avatar_url} className="w-12 h-12 rounded border border-space-steel" />
                                    <div>
                                        <h4 className="font-bold text-white font-display">{user.username}</h4>
                                        <p className="text-xs text-space-muted font-mono">{user.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] text-space-muted uppercase">Nível de Acesso</span>
                                        <div className="flex gap-2 items-center">
                                            <select
                                                className="bg-space-dark border border-space-steel rounded px-2 py-1 text-xs font-mono text-white focus:border-space-neon outline-none"
                                                defaultValue={user.role}
                                                id={`role-select-${user.id}`}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="MODERATOR">MODERATOR</option>
                                                <option value="CREATOR">CREATOR</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => {
                                                    const select = document.getElementById(`role-select-${user.id}`) as HTMLSelectElement;
                                                    const newRole = select.value;
                                                    if (newRole !== user.role) {
                                                        if (confirm(`ATENÇÃO: Você está prestes a alterar o nível de acesso de ${user.username} para ${newRole}.\n\nIsso pode conceder privilégios administrativos e alterar a reputação base.\n\nConfirma a operação?`)) {
                                                            updateUserRole(user.id, newRole);
                                                        }
                                                    }
                                                }}
                                                disabled={loadingAction === user.id}
                                                className="h-6 px-2"
                                            >
                                                <Save size={12} />
                                            </Button>
                                        </div>
                                    </div>
                                    {loadingAction === user.id && <div className="w-4 h-4 rounded-full border-2 border-space-neon border-t-transparent animate-spin"></div>}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(Object.keys(CATEGORY_KEYS) as PostType[]).map(type => {
                        const dbKey = CATEGORY_KEYS[type];
                        const currentCats = categories[dbKey] || [];

                        return (
                            <Card key={type} title={`CATEGORIAS: ${type}`}>
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-2">
                                        {currentCats.map((cat, index) => (
                                            <div key={cat} className="flex items-center justify-between p-2 bg-space-dark border border-space-steel rounded hover:border-space-neon group transition-colors">
                                                <span className="text-xs font-mono text-white">{cat}</span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => moveCategory(dbKey, currentCats, index, 'up')}
                                                        disabled={index === 0}
                                                        className="p-1 hover:text-space-neon disabled:opacity-30 disabled:hover:text-space-muted transition-colors"
                                                    >
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => moveCategory(dbKey, currentCats, index, 'down')}
                                                        disabled={index === currentCats.length - 1}
                                                        className="p-1 hover:text-space-neon disabled:opacity-30 disabled:hover:text-space-muted transition-colors"
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveCategory(dbKey, currentCats, cat)}
                                                        className="p-1 text-space-muted hover:text-space-alert ml-2 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => handleAddCategory(dbKey, currentCats)} icon={<CheckCircle size={14} />}>
                                        ADICIONAR CATEGORIA
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {activeTab === 'publications' && (
                <div className="space-y-8 animate-fade-in">
                    {(Object.keys(CATEGORY_KEYS) as PostType[]).map(type => {
                        const typePosts = posts.filter(p => p.type === type);
                        const dbKey = CATEGORY_KEYS[type];
                        const typeCategories = categories[dbKey] || [];

                        return (
                            <div key={type} className="space-y-4">
                                <h3 className="text-xl font-display font-bold text-space-neon border-b border-space-steel/30 pb-2">{type}</h3>
                                {typeCategories.map(cat => {
                                    const catPosts = typePosts.filter(p => p.category === cat)
                                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

                                    if (catPosts.length === 0) return null;

                                    return (
                                        <div key={cat} className="ml-4 space-y-2">
                                            <h4 className="text-sm font-mono text-space-muted uppercase tracking-wider">{cat}</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {catPosts.map((post, index) => (
                                                    <div key={post.id} className="flex justify-between items-center p-3 bg-space-dark/50 border border-space-steel rounded hover:border-space-neon transition-colors">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-white">{post.title}</span>
                                                            <span className="text-[10px] text-space-muted font-mono">{post.author_name} • {new Date(post.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mr-4">
                                                            <span className="text-[10px] text-space-muted uppercase font-mono">Tipo:</span>
                                                            <select
                                                                className="bg-space-dark border border-space-steel rounded px-2 py-1 text-[10px] font-mono text-white focus:border-space-neon outline-none"
                                                                value={post.type}
                                                                onChange={(e) => {
                                                                    const newType = e.target.value as PostType;
                                                                    if (confirm(`Alterar tipo para ${newType}? A categoria será resetada.`)) {
                                                                        updatePostType(post.id, newType);
                                                                    }
                                                                }}
                                                                disabled={loadingAction === post.id}
                                                            >
                                                                {Object.values(PostType).map(t => (
                                                                    <option key={t} value={t}>{t}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <button
                                                                onClick={() => movePost(catPosts, index, 'up')}
                                                                disabled={index === 0 || loadingAction === post.id}
                                                                className="p-1 hover:text-space-neon disabled:opacity-30 transition-colors"
                                                            >
                                                                <ChevronUp size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => movePost(catPosts, index, 'down')}
                                                                disabled={index === catPosts.length - 1 || loadingAction === post.id}
                                                                className="p-1 hover:text-space-neon disabled:opacity-30 transition-colors"
                                                            >
                                                                <ChevronDown size={16} />
                                                            </button>
                                                        </div>
                                                        {loadingAction === post.id && <div className="w-4 h-4 rounded-full border-2 border-space-neon border-t-transparent animate-spin ml-2"></div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
