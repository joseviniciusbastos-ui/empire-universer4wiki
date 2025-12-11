
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button, Input, Card } from './Shared';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const { showToast } = useToast();
    const [isSignUp, setIsSignUp] = useState(false);
    // Login State
    const [loginInput, setLoginInput] = useState(''); // Can be username or email (legacy support)
    const [password, setPassword] = useState('');

    // SignUp State
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleAuth = async () => {
        setIsLoading(true);
        setError('');

        try {
            if (isSignUp) {
                // --- SIGN UP FLOW ---
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (authError) throw authError;

                if (authData.user) {
                    // Create Profile
                    // Note: ensure this matches your DB constraints (username unique)
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: authData.user.id,
                            username: username || email.split('@')[0],
                            role: 'USER',
                            avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=' + (username || email),
                            reputation: 0,
                            joined_at: new Date().toISOString()
                        });

                    if (profileError) {
                        console.error("Profile creation error:", profileError);
                        // If profile fails (e.g. duplicate username), we should ideally rollback auth or warn user.
                        // For now, alerting user.
                        if (profileError.code === '23505') { // Unique violation
                            throw new Error("Este nome de usuário já está em uso.");
                        }
                    }
                    alert("Cadastro realizado! Você já pode entrar.");
                    setIsSignUp(false); // Switch to login
                }
            } else {
                // --- SIGN IN FLOW (With Nickname) ---
                let targetEmail = loginInput;

                // Check if input looks like an email using regex
                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput);

                if (!isEmail) {
                    // It's a username! Resolve to email using RPC
                    const { data: emailFromRpc, error: rpcError } = await supabase
                        .rpc('get_email_by_username', { username_input: loginInput });

                    if (rpcError) {
                        console.error("RPC Error:", rpcError);
                        throw new Error("Erro ao validar usuário.");
                    }

                    if (!emailFromRpc) {
                        throw new Error("Usuário não encontrado.");
                    }
                    targetEmail = emailFromRpc;
                }

                // Proceed with Supabase Auth (Email + Password)
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: targetEmail,
                    password,
                });

                if (authError) throw authError;

                onLoginSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAuth();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-space-black border-space-neon shadow-[0_0_30px_rgba(0,194,255,0.1)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-display font-bold text-space-neon uppercase">
                        {isSignUp ? 'Nova Credencial' : 'Acesso ao Sistema'}
                    </h2>
                    <button onClick={onClose} className="text-space-muted hover:text-space-alert">
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-2 bg-red-500/20 border border-red-500 text-red-200 text-xs font-mono">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {isSignUp ? (
                        <>
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            <Input
                                placeholder="Nome de Usuário (Nick)"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </>
                    ) : (
                        <Input
                            placeholder="Nome de Usuário ou Email"
                            value={loginInput}
                            onChange={e => setLoginInput(e.target.value)}
                        />
                    )}

                    <Input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    <Button
                        variant="primary"
                        className="w-full justify-center"
                        onClick={handleAuth}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
                    </Button>

                    <div className="text-center">
                        <button
                            className="text-xs text-space-muted hover:text-space-neon underline font-mono"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Já possui conta? Entrar' : 'Não possui conta? Cadastrar'}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default LoginModal;
