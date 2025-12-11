import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button, Input, Card } from './Shared';
import { useToast } from '../contexts/ToastContext';
import { X, UploadCloud, User as UserIcon, Lock, Mail, Save, Camera } from 'lucide-react';
import { User } from '../types';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
    onUpdate: () => void;
}

export default function EditProfileModal({ isOpen, onClose, currentUser, onUpdate }: EditProfileModalProps) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); // Only for request
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpdateProfile = async () => {
        if (!currentUser) return;
        setIsLoading(true);

        const { error } = await supabase
            .from('profiles')
            .update({
                bio,
                avatar_url: avatarUrl
            })
            .eq('id', currentUser.id);

        if (error) {
            showToast("Erro ao atualizar perfil: " + error.message, 'error');
        } else {
            showToast("Perfil atualizado!", 'success');
            onUpdate();
            onClose();
        }
        setIsLoading(false);
    };

    const handleUpdatePassword = async () => {
        if (!password) return;
        setIsLoading(true);
        const { error } = await supabase.auth.updateUser({ password: password });
        setIsLoading(false);
        if (error) {
            showToast("Erro: " + error.message, 'error');
            return;
        }
        showToast("Senha alterada com sucesso!", 'success');
        setPassword('');
    };

    const handleUpdateEmail = async () => {
        if (!email) return;
        setIsLoading(true);
        const { error } = await supabase.auth.updateUser({ email: email });
        setIsLoading(false);
        if (error) {
            showToast("Erro: " + error.message, 'error');
            return;
        }
        showToast("Email de confirmação enviado para " + email, 'info');
        setEmail('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl bg-space-black border-space-neon shadow-[0_0_30px_rgba(0,194,255,0.1)] flex flex-col md:flex-row overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-space-steel bg-space-dark/20 p-4">
                    <h3 className="text-sm font-display font-bold text-space-neon uppercase mb-6 flex items-center gap-2">
                        <UserIcon size={16} /> Editar Perfil
                    </h3>
                    <div className="flex md:flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 text-left px-3 py-2 rounded text-xs font-mono transition-colors ${activeTab === 'profile' ? 'bg-space-neon text-black font-bold' : 'text-space-muted hover:text-white hover:bg-space-dark'}`}
                        >
                            PERFIL PÚBLICO
                        </button>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`flex-1 text-left px-3 py-2 rounded text-xs font-mono transition-colors ${activeTab === 'account' ? 'bg-space-neon text-black font-bold' : 'text-space-muted hover:text-white hover:bg-space-dark'}`}
                        >
                            CONTA & SEGURANÇA
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[80vh]">
                    {activeTab === 'profile' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-space-muted uppercase mb-2 block">Avatar URL</label>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 rounded border border-space-steel overflow-hidden flex-shrink-0">
                                        <img src={avatarUrl} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150'} alt="Avatar" />
                                    </div>
                                    <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." className="flex-1" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-space-muted uppercase mb-2 block">Biografia</label>
                                <textarea
                                    className="w-full bg-black border border-space-steel px-4 py-2 text-space-text font-mono focus:border-space-neon focus:outline-none rounded-sm h-32 text-sm"
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    placeholder="Escreva sobre suas missões..."
                                />
                            </div>
                            <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full" variant="primary">
                                {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 border border-space-steel/30 rounded bg-space-dark/20">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Lock size={16} className="text-space-neon" /> Alterar Senha</h4>
                                <div className="space-y-2">
                                    <Input type="password" placeholder="Nova Senha" value={password} onChange={e => setPassword(e.target.value)} />
                                    <Button size="sm" variant="secondary" onClick={handleUpdatePassword} disabled={!password || isLoading}>ATUALIZAR SENHA</Button>
                                </div>
                            </div>

                            <div className="p-4 border border-space-steel/30 rounded bg-space-dark/20">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Mail size={16} className="text-space-neon" /> Alterar Email</h4>
                                <div className="space-y-2">
                                    <Input placeholder="Novo Email" value={email} onChange={e => setEmail(e.target.value)} />
                                    <Button size="sm" variant="secondary" onClick={handleUpdateEmail} disabled={!email || isLoading}>ENVIAR CONFIRMAÇÃO</Button>
                                    <p className="text-[10px] text-space-muted">O email só será alterado após confirmação na caixa de entrada.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
