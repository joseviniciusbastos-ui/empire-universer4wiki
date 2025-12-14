import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Shared';

interface LoginRequiredViewProps {
    onLoginClick: () => void;
}

export const LoginRequiredView: React.FC<LoginRequiredViewProps> = ({ onLoginClick }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fadeIn">
            <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                <div className="relative bg-space-black p-6 rounded-full border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <Lock size={64} className="text-red-500" />
                </div>
            </div>

            <div className="space-y-2 max-w-md">
                <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
                    Acesso Restrito
                </h1>
                <p className="text-space-muted font-mono text-sm leading-relaxed">
                    Esta seção contém dados classificados da Frota Estelar.
                    <br />
                    Identificação requerida para prosseguir.
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button
                    variant="primary"
                    onClick={onLoginClick}
                    className="w-full justify-center py-4 bg-red-600 hover:bg-red-700 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                    <ShieldAlert size={18} className="mr-2" />
                    AUTENTICAR OFICIAL
                </Button>
            </div>

            <div className="text-[10px] text-space-muted/50 font-mono mt-8 border-t border-space-steel/20 pt-4">
                PROTOCOLO DE SEGURANÇA: AUTH-9281
            </div>
        </div>
    );
};
