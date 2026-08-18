import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { RoleBadge } from './Badge';
import { 
  Wrench, 
  Bell, 
  LogOut, 
  Users, 
  LayoutDashboard, 
  Smartphone, 
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Copy,
  Check,
  Monitor,
  BarChart3,
  Package,
  X,
  MessageSquare
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface NavbarProps {
  onOpenChat?: () => void;
  unreadChatCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat, unreadChatCount }) => {
  const { user, logout } = useAuth();
  const { isConnected, notifications, unreadCount, markNotificationsAsRead } = useSocket();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => setNetworkInfo(data))
      .catch(() => {});
  }, [user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    if (!name) return 'SC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 p-0.5 shadow-glow-teal flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center group-hover:bg-brand-950 transition-colors">
                <Wrench className="w-5 h-5 text-brand-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  SCOOBY <span className="text-brand-400 text-xs px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">OS</span>
                </span>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 animate-ping'}`} title={isConnected ? 'Servidor Conectado em Tempo Real' : 'Desconectado'} />
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Gestão de Assistência Técnica</p>
            </div>
          </Link>

          {/* Navegação por Cargo */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            {(user.cargo === 'ADMIN' || user.cargo === 'GERENTE' || user.cargo === 'TECNICO_CELULAR') && (
              <Link
                to="/gerente"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${location.pathname === '/gerente' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Painel Triagem (Kanban)
              </Link>
            )}

            {(user.cargo === 'ADMIN' || user.cargo === 'ATENDENTE' || user.cargo === 'GERENTE' || user.cargo === 'TECNICO_CELULAR') && (
              <Link
                to="/atendente"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${location.pathname === '/atendente' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Recepção & Balcão
              </Link>
            )}

            {(user.cargo === 'ADMIN' || user.cargo === 'TECNICO' || user.cargo === 'GERENTE' || user.cargo === 'TECNICO_CELULAR') && (
              <Link
                to="/tecnico"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${location.pathname === '/tecnico' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Minha Bancada
              </Link>
            )}

            {(user.cargo === 'ADMIN' || user.cargo === 'TECNICO_CELULAR' || user.cargo === 'GERENTE') && (
              <Link
                to="/celular-hibrido"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${location.pathname === '/celular-hibrido' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Módulo Celulares
              </Link>
            )}

            {(user.cargo === 'ADMIN' || user.cargo === 'GERENTE') && (
              <Link
                to="/admin/estoque"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${location.pathname === '/admin/estoque' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <Package className="w-3.5 h-3.5" />
                Estoque & Peças
              </Link>
            )}

            {user.cargo === 'ADMIN' && (
              <Link
                to="/admin/relatorios"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${location.pathname === '/admin/relatorios' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Faturamento & Relatórios
              </Link>
            )}

            {user.cargo === 'ADMIN' && (
              <Link
                to="/admin/usuarios"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${location.pathname === '/admin/usuarios' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <Users className="w-3.5 h-3.5" />
                Equipe & Cadastros
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          
          {/* Botão de Chat da Equipe & Interfone */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 rounded-xl text-xs font-semibold text-brand-300 transition-all shadow-sm cursor-pointer relative"
            title="Abrir Chat Interno e Interfone da Equipe"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline">Chat & Voz</span>
            {unreadChatCount && unreadChatCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 text-navy-950 rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm">
                {unreadChatCount}
              </span>
            ) : null}
          </button>

          {/* Botão de Rede Local */}
          <button
            onClick={() => setShowNetworkModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-xl text-xs font-semibold text-emerald-300 transition-all shadow-sm cursor-pointer"
            title="Ver link de acesso para outros computadores da rede"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Rede Local</span>
          </button>

          {/* Central de Avisos */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsAsRead();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-navy-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy-900 border border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-slide-up">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-brand-400" />
                    Central de Avisos em Tempo Real
                  </span>
                  <span className="text-[10px] text-slate-400">{notifications.length} avisos</span>
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Nenhum alerta recente no momento.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-xs transition-colors ${n.tipo === 'ALERTA' ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' : n.tipo === 'ATRIBUICAO' ? 'bg-teal-950/40 border-teal-500/30 text-teal-200' : 'bg-slate-800/60 border-white/5 text-slate-200'}`}
                      >
                        <div className="flex items-start gap-2">
                          {n.tipo === 'ALERTA' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-xs text-white">{n.titulo}</p>
                            <p className="text-[11px] text-slate-300 mt-0.5">{n.mensagem}</p>
                            <span className="text-[9px] text-slate-500 mt-1 block">{formatDate(n.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Perfil Logado sem foto (Apenas Iniciais e Nome/Sobrenome) */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 font-bold text-xs text-white flex items-center justify-center border border-brand-400/40 shadow-sm shrink-0">
              {getInitials(user.nome)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user.nome}</p>
              <div className="mt-0.5">
                <RoleBadge role={user.cargo} />
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Modal de Rede Local */}
      {showNetworkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl p-6 animate-slide-up space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Conectar outros Computadores na Rede</h3>
                  <p className="text-[11px] text-slate-400">Compartilhe o sistema na mesma rede Wi-Fi ou Cabo</p>
                </div>
              </div>
              <button
                onClick={() => setShowNetworkModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                O Scooby OS está configurado como <strong>Servidor Central</strong>. Qualquer computador conectado na rede pode acessar:
              </p>

              {networkInfo && (
                <div className="space-y-2">
                  <label className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block">
                    Endereço de Acesso na Rede Local:
                  </label>
                  
                  <div className="p-3 bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-400 truncate">
                      {networkInfo.serverUrl || `http://${window.location.hostname}:3001`}
                    </span>
                    <button
                      onClick={() => copyToClipboard(networkInfo.serverUrl || `http://${window.location.hostname}:3001`)}
                      className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado!' : 'Copiar Link'}
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2.5">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-brand-400" />
                  Como usar em outros computadores (Balcão, Bancada, Gerência):
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] pl-1">
                  <li>No outro computador, abra o <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>.</li>
                  <li>Cole o link copiado acima e pressione Enter.</li>
                  <li>Faça login com seu nome de usuário e senha.</li>
                  <li>Clique no ícone "Instalar Aplicativo" na barra de navegação para rodar como app nativo.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowNetworkModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Entendi / Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};