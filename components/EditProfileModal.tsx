import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button, Input, Card } from './Shared';
import { X, UploadCloud, User, Lock, Mail } from 'lucide-react';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    onUpdate: () => void;
}

export default function EditProfileModal({ isOpen, onClose, currentUser, onUpdate }: EditProfileModalProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); // Only for request
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !currentUser) return null;

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ bio, avatar_url: avatarUrl })
            .eq('id', currentUser.id);

        setIsLoading(false);
        if (error) {
            alert("Erro ao atualizar perfil: " + error.message);
        } else {
            alert("Perfil atualizado!");
            onUpdate();
            onClose();
        }
    };

    const handleUpdatePassword = async () => {
        if (!password) return;
        setIsLoading(true);
        const { error } = await supabase.auth.updateUser({ password: password });
        setIsLoading(false);
        if (error) alert("Erro: " + error.message);
        else {
            alert("Senha alterada com sucesso!");
            setPassword('');
        }
    };

    const handleUpdateEmail = async () => {
        if (!email) return;
        setIsLoading(true);
        const { error } = await supabase.auth.updateUser({ email: email });
        setIsLoading(false);
        if (error) alert("Erro: " + error.message);
        else {
            alert("Email de confirmação enviado para " + email);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg bg-space-black border-space-neon shadow-[0_0_30px_rgba(0,194,255,0.1)]">
                <div className="flex justify-between items-center mb-6 border-b border-space-steel pb-4">
                    <h2 className="text-xl font-display font-bold text-space-neon uppercase">EDITAR PERFIL</h2>
                    <button onClick={onClose} className="text-space-muted hover:text-white"><X size={24} /></button>
                </div>

                <div className="flex gap-4 mb-6">
                    <Button variant={activeTab === 'profile' ? 'primary' : 'ghost'} onClick={() => setActiveTab('profile')} size="sm">
                        <User size={16} className="mr-2" /> DADOS PÚBLICOS
                    </Button>
                    <Button variant={activeTab === 'account' ? 'primary' : 'ghost'} onClick={() => setActiveTab('account')} size="sm">
                        <Lock size={16} className="mr-2" /> CONTA & SEGURANÇA
                    </Button>
                </div>

                <div className="space-y-4">
                    {activeTab === 'profile' ? (
                        <>
                            <div>
                                <label className="text-xs text-space-muted uppercase mb-2 block">Avatar URL</label>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 rounded border border-space-steel overflow-hidden">
                                        <img src={avatarUrl} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150'} />
                                    </div>
                                    <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-space-muted uppercase mb-2 block">Biografia</label>
                                <textarea
                                    className="w-full bg-black border border-space-steel px-4 py-2 text-space-text font-mono focus:border-space-neon focus:outline-none rounded-sm h-32"
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    placeholder="Escreva sobre suas missões..."
                                />
                            </div>
                            <Button onClick={handleUpdateProfile} disabled={isLoading} className="w-full">
                                {isLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                            </Button>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
