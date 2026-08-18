import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, ArrowRight, ShieldAlert, KeyRound, UserCheck, Shield } from 'lucide-react';
import { RoleBadge } from '../components/Badge';

interface PublicUser {
  id: number;
  nome: string;
  login: string;
  cargo: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, user } = useAuth();
  
  const [publicUsers, setPublicUsers] = useState<PublicUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/auth/public-users')
      .then(res => res.json())
      .then(data => {
        if (data.users && data.users.length > 0) {
          setPublicUsers(data.users);
          // Seleciona o primeiro por padrão
          setSelectedUser(data.users[0]);
          setLoginInput(data.users[0].login);
        }
      })
      .catch(() => {});
  }, []);

  // Redireciona automaticamente se já estiver autenticado
  if (isAuthenticated && user) {
    if (user.cargo === 'GERENTE' || user.cargo === 'ADMIN' || user.cargo === 'TECNICO_CELULAR') {
      return <Navigate to="/gerente" replace />;
    }
    if (user.cargo === 'ATENDENTE') {
      return <Navigate to="/atendente" replace />;
    }
    if (user.cargo === 'TECNICO') {
      return <Navigate to="/tecnico" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const getInitials = (name: string) => {
    if (!name) return 'SC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSelectUser = (u: PublicUser) => {
    setSelectedUser(u);
    setLoginInput(u.login);
    setSenhaInput('');
    setError(null);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetLogin = selectedUser ? selectedUser.login : loginInput.trim().toLowerCase();

    if (!targetLogin || !senhaInput) {
      setError('Por favor, informe a senha de acesso.');
      return;
    }

    setSubmitting(true);
    try {
      await login(targetLogin, senhaInput);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Senha incorreta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* Luz de fundo decorativa */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 space-y-6">
        
        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 p-0.5 shadow-glow-teal mb-1">
            <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
              <Wrench className="w-7 h-7 text-brand-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SCOOBY <span className="text-brand-400">OS</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Selecione seu nome e digite sua senha individual para entrar na sua estação de trabalho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Lado Esquerdo: Lista de Colaboradores (Acesso Rápido com Senha) */}
          <div className="md:col-span-7 glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Selecione seu Usuário</h2>
                </div>
                <span className="text-[11px] text-slate-400">{publicUsers.length} cadastrados</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {publicUsers.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer group ${
                        isSelected 
                          ? 'bg-gradient-to-r from-brand-950 to-slate-900 border-brand-500 shadow-glow-teal scale-[1.02]' 
                          : 'bg-slate-950/60 hover:bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-brand-500 text-white border-brand-400' 
                          : 'bg-white/5 text-slate-300 border-white/10 group-hover:text-brand-300 group-hover:border-brand-500/30'
                      }`}>
                        {getInitials(u.nome)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-bold block truncate transition-colors ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                          {u.nome}
                        </span>
                        <div className="mt-0.5">
                          <RoleBadge role={u.cargo as any} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              💡 Clique no seu nome para digitar sua senha ao lado
            </p>
          </div>

          {/* Lado Direito: Formulário de Digitação da Senha Individual */}
          <div className="md:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                <KeyRound className="w-4 h-4 text-brand-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Senha Individual</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {selectedUser ? (
                <div className="mb-4 p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                    {getInitials(selectedUser.nome)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{selectedUser.nome}</span>
                    <span className="text-[11px] text-brand-300 font-mono">@{selectedUser.login}</span>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-400">
                  Nenhum colaborador selecionado. Escolha um na lista ou digite o login abaixo.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {!selectedUser && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Login</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: juciane"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-xs focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Digite sua Senha:
                  </label>
                  <input
                    ref={passwordInputRef}
                    type="password"
                    required
                    autoFocus
                    placeholder="••••••"
                    value={senhaInput}
                    onChange={(e) => setSenhaInput(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-brand-500/40 text-white placeholder-slate-600 text-sm focus:border-brand-400 focus:outline-none font-bold tracking-widest text-center"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white font-bold text-xs shadow-glow-teal flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'Verificando senha...' : 'Entrar no Sistema'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500 text-center">
              Sistema protegido por criptografia • Scooby OS
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};