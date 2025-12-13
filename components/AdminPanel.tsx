import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button, Card, Badge, Input } from './ui/Shared';
import { Users, Settings, Save, Trash2, Shield, ShieldAlert, CheckCircle, X } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [categories, setCategories] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'settings') fetchSettings();
    }, [activeTab]);

    // --- USERS MANAGEMENT ---
    const fetchUsers = async () => {
        setIsLoading(true);
        // Note: Fetching ALL profiles. In a real app, integrate pagination.
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('joined_at', { ascending: false });

        if (data) setUsers(data);
        setIsLoading(false);
    };

    const updateUserRole = async (userId: string, newRole: string) => {
        setLoadingAction(userId);
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (!error) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } else {
            alert("Erro ao atualizar: " + error.message);
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
                    <Button variant={activeTab === 'settings' ? 'primary' : 'ghost'} onClick={() => setActiveTab('settings')} icon={<Settings size={16} />}>CONFIGURAÇÕES</Button>
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
                                    <div className="flex flex-wrap gap-2">
                                        {currentCats.map(cat => (
                                            <span key={cat} className="px-2 py-1 bg-space-dark border border-space-steel rounded text-xs font-mono flex items-center gap-2 group hover:border-space-alert transition-colors">
                                                {cat}
                                                <button onClick={() => handleRemoveCategory(dbKey, currentCats, cat)} className="text-space-muted hover:text-space-alert"><X size={12} /></button>
                                            </span>
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
        </div>
    );
}
