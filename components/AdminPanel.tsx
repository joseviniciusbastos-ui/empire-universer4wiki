import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button, Card, Badge, Input } from './ui/Shared';
import {
    Users, Settings, Save, Trash2, Shield, ShieldAlert,
    CheckCircle, X, ChevronUp, ChevronDown, FileText, MessageSquare, Search
} from 'lucide-react';
import { PostType, User } from '../types';
import { useToast } from '../contexts/ToastContext';
import { CacheManager } from '../lib/cache';

interface AdminPanelProps {
    currentUser: User | null;
}

const CATEGORY_KEYS = {
    [PostType.WIKI]: 'categories_wiki',
    [PostType.BLOG]: 'categories_blog',
    [PostType.THREAD]: 'categories_thread',
    [PostType.ARTICLE]: 'categories_article',
};

const POST_TYPE_LABELS = {
    [PostType.WIKI]: 'ENCYCLOPEDIA',
    [PostType.BLOG]: 'BLOG',
    [PostType.THREAD]: 'FORUM',
    [PostType.ARTICLE]: 'DATA LOGS',
};

export default function AdminPanel({ currentUser }: AdminPanelProps) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'publications' | 'trash' | 'feedback'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [deletedPosts, setDeletedPosts] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [pubSearch, setPubSearch] = useState('');
    const [pubFilter, setPubFilter] = useState<'all' | PostType>('all');

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'settings') fetchSettings();
        if (activeTab === 'publications') {
            fetchSettings(); // Needed for categories grouping
            fetchPosts();
        }
        if (activeTab === 'trash') fetchDeletedPosts();
        if (activeTab === 'feedback') fetchReports();
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
            CacheManager.clearPosts(); // Categories changed, clear cache
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
            CacheManager.clearPosts();
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
        const finalTargetOrder = currentOrder === targetOrder
            ? (direction === 'up' ? targetOrder + 1 : targetOrder - 1)
            : currentOrder;

        setLoadingAction(currentPost.id);

        const updatedPosts = [...posts];
        const idx1 = updatedPosts.findIndex(p => p.id === currentPost.id);
        const idx2 = updatedPosts.findIndex(p => p.id === targetPost.id);
        updatedPosts[idx1].display_order = finalCurrentOrder;
        updatedPosts[idx2].display_order = finalTargetOrder;
        setPosts(updatedPosts);

        // Optimization: Run updates in parallel
        const results = await Promise.all([
            supabase.from('posts').update({ display_order: finalCurrentOrder }).eq('id', currentPost.id),
            supabase.from('posts').update({ display_order: finalTargetOrder }).eq('id', targetPost.id)
        ]);

        const hasError = results.some(r => r.error);
        if (hasError) {
            showToast("Sincronização falhou parcialemente. Atualizando...", "warning");
            fetchPosts();
        } else {
            CacheManager.clearPosts();
        }

        setLoadingAction(null);
    };

    // --- FEEDBACK MANAGEMENT ---
    const fetchReports = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('user_reports')
            .select('*, profiles:user_id(username, avatar_url)')
            .order('created_at', { ascending: false });

        if (data) setReports(data);
        setIsLoading(false);
    };

    const updateReportStatus = async (reportId: number, newStatus: string) => {
        setLoadingAction(reportId.toString());
        const { error } = await supabase
            .from('user_reports')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', reportId);

        if (!error) {
            setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
            showToast(`Status atualizado para ${newStatus}`, "success");
        } else {
            showToast("Erro ao atualizar status: " + error.message, "error");
        }
        setLoadingAction(null);
    };

    // --- TRASH MANAGEMENT ---
    const fetchDeletedPosts = async () => {
        setIsLoading(true);

        // Lazy auto-cleanup: Delete posts older than 30 days
        await supabase
            .from('posts')
            .delete()
            .lt('deleted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });

        if (data) setDeletedPosts(data);
        setIsLoading(false);
    };

    const restorePost = async (postId: string) => {
        setLoadingAction(postId);
        const { error } = await supabase
            .from('posts')
            .update({ deleted_at: null })
            .eq('id', postId);

        if (!error) {
            showToast("Publicação restaurada com sucesso.", "success");
            setDeletedPosts(deletedPosts.filter(p => p.id !== postId));
            CacheManager.clearPosts();
        } else {
            showToast("Erro ao restaurar: " + error.message, "error");
        }
        setLoadingAction(null);
    };

    const permanentDeletePost = async (postId: string) => {
        if (!confirm("TEM CERTEZA? Esta ação é irreversível e apagará o post permanentemente do banco de dados.")) return;

        setLoadingAction(postId);
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (!error) {
            showToast("Publicação excluída permanentemente.", "success");
            setDeletedPosts(deletedPosts.filter(p => p.id !== postId));
        } else {
            showToast("Erro ao excluir: " + error.message, "error");
        }
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
                    <Button variant={activeTab === 'trash' ? 'primary' : 'ghost'} onClick={() => setActiveTab('trash')} icon={<Trash2 size={16} />} className="text-space-alert">LIXEIRA</Button>
                    <Button variant={activeTab === 'feedback' ? 'primary' : 'ghost'} onClick={() => setActiveTab('feedback')} icon={<MessageSquare size={16} />} className="text-space-neon">FEEDBACKS</Button>
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
                <div className="space-y-6 animate-fade-in text-white/90">
                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 bg-space-dark/30 p-4 rounded-xl border border-space-steel/20 sticky top-16 z-20 backdrop-blur-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-space-muted" size={16} />
                            <input
                                type="text"
                                placeholder="PESQUISAR POR TÍTULO, AUTOR OU CONTEÚDO..."
                                className="w-full bg-space-black border border-space-steel/30 rounded px-10 py-2 text-sm font-mono text-white focus:border-space-neon outline-none transition-all"
                                value={pubSearch}
                                onChange={(e) => setPubSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-space-black border border-space-steel/30 rounded px-3 py-2 text-sm font-mono text-white focus:border-space-neon outline-none"
                            value={pubFilter}
                            onChange={(e) => setPubFilter(e.target.value as any)}
                        >
                            <option value="all">TODOS OS TIPOS</option>
                            {Object.values(PostType).map(t => (
                                <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>
                            ))}
                        </select>
                    </div>

                    {(Object.keys(CATEGORY_KEYS) as PostType[])
                        .filter(type => pubFilter === 'all' || pubFilter === type)
                        .map(type => {
                            let typePosts = posts.filter(p => p.type === type);

                            if (pubSearch) {
                                const query = pubSearch.toLowerCase();
                                typePosts = typePosts.filter(p =>
                                    p.title.toLowerCase().includes(query) ||
                                    p.author_name.toLowerCase().includes(query) ||
                                    p.content?.toLowerCase().includes(query)
                                );
                            }

                            const dbKey = CATEGORY_KEYS[type];
                            const typeCategories = categories[dbKey] || [];

                            if (typePosts.length === 0) return null;

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
                                                                        <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>
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

            {activeTab === 'trash' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-space-alert/10 border border-space-alert/30 p-4 rounded mb-6">
                        <p className="text-xs text-space-alert font-mono uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert size={14} /> Protocolo de Retenção de Dados: 30 Dias
                        </p>
                        <p className="text-[10px] text-space-muted font-mono mt-1">
                            Arquivos nesta área serão removidos permanentemente após 30 dias do registro de exclusão.
                        </p>
                    </div>

                    {isLoading ? <p className="text-mono text-space-muted">Escaneando setores de dados...</p> : (
                        deletedPosts.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-space-steel rounded">
                                <Trash2 size={48} className="mx-auto text-space-steel mb-4 opacity-50" />
                                <p className="text-space-muted font-mono">Lixeira vazia. Nenhum dado descartado encontrado.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {deletedPosts.map(post => (
                                    <div key={post.id} className="flex justify-between items-center p-4 bg-space-dark/50 border border-space-alert/20 rounded hover:border-space-alert/50 transition-colors">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <Badge color="bg-space-steel">{post.type}</Badge>
                                                <span className="text-sm font-bold text-white">{post.title}</span>
                                            </div>
                                            <span className="text-[10px] text-space-muted font-mono mt-1">
                                                DELETADO EM: {new Date(post.deleted_at).toLocaleString('pt-BR')} • POR: {post.author_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => restorePost(post.id)}
                                                disabled={loadingAction === post.id}
                                                icon={<CheckCircle size={14} />}
                                            >
                                                RESTAURAR
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-space-alert hover:bg-space-alert/20"
                                                onClick={() => permanentDeletePost(post.id)}
                                                disabled={loadingAction === post.id}
                                                icon={<Trash2 size={14} />}
                                            >
                                                EXCLUIR
                                            </Button>
                                            {loadingAction === post.id && <div className="w-4 h-4 rounded-full border-2 border-space-alert border-t-transparent animate-spin ml-2"></div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="space-y-4 animate-fade-in">
                    {isLoading ? <p className="text-mono text-space-muted">Coletando relatórios de campo...</p> : (
                        reports.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-space-steel rounded">
                                <MessageSquare size={48} className="mx-auto text-space-steel mb-4 opacity-50" />
                                <p className="text-space-muted font-mono">Nenhum feedback registrado.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reports.map(report => (
                                    <Card key={report.id} className="border-space-steel/50">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge color={report.type === 'BUG' ? 'bg-red-900/40 text-red-500 border border-red-500/50' : 'bg-space-dark border border-space-steel'}>
                                                        {report.type}
                                                    </Badge>
                                                    <h4 className="font-bold text-white uppercase">{report.title}</h4>
                                                    <Badge color={report.status === 'RESOLVED' ? 'bg-green-600/20 text-green-500' : 'bg-yellow-600/20 text-yellow-500'}>
                                                        {report.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-space-muted font-mono whitespace-pre-wrap mb-4">{report.content}</p>

                                                {report.images && report.images.length > 0 && (
                                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                                        {report.images.map((img: string, i: number) => (
                                                            <img key={i} src={img} className="h-24 w-24 object-cover rounded border border-space-steel hover:border-space-neon cursor-zoom-in" onClick={() => window.open(img, '_blank')} />
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 text-[10px] text-space-muted font-mono">
                                                    <img src={report.profiles?.avatar_url} className="w-4 h-4 rounded-full" />
                                                    <span>{report.profiles?.username} • {new Date(report.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <select
                                                    className="bg-space-dark border border-space-steel rounded px-2 py-1 text-xs font-mono text-white"
                                                    value={report.status}
                                                    onChange={(e) => updateReportStatus(report.id, e.target.value)}
                                                    disabled={loadingAction === report.id.toString()}
                                                >
                                                    <option value="OPEN">ABERTO</option>
                                                    <option value="IN_PROGRESS">EM ANÁLISE</option>
                                                    <option value="RESOLVED">RESOLVIDO</option>
                                                    <option value="CLOSED">ARQUIVADO</option>
                                                </select>
                                                {loadingAction === report.id.toString() && <div className="w-4 h-4 rounded-full border-2 border-space-neon border-t-transparent animate-spin mx-auto"></div>}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
