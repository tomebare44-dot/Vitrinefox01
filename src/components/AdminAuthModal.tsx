import React, { useState } from 'react';
import { X, Lock, Key, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../services/api.ts';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, informe a senha de acesso.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.login(password);
      setPassword('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Verifique a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Discreet Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm transition-opacity"
      />

      <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3 text-orange-500">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            Acesso Administrativo
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Área restrita de gestão da VitrineFox. Digite sua credencial para continuar.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Senha de Segurança
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Digite a senha do painel..."
                autoFocus
                className="w-full bg-neutral-950 text-white text-sm rounded-xl pl-10 pr-10 py-3 border border-neutral-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition outline-none"
              />
              <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-50 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Validando...</span>
              </>
            ) : (
              <span>Entrar no Painel</span>
            )}
          </button>
        </form>

        <p className="text-[11px] text-neutral-400 text-center mt-4">
          Todas as ações administrativas são auditadas e protegidas por criptografia.
        </p>
      </div>
    </div>
  );
};
