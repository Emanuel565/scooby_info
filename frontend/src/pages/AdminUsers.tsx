import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { RoleBadge } from '../components/Badge';
import { 
  Users, 
  UserPlus, 
  Wrench, 
  Trash2, 
  ShieldCheck, 
  Phone, 
  X, 
  PlusCircle, 
  AlertCircle,
  KeyRound,
  Check,
  Edit,
  Laptop,
  Smartphone,
  Printer,
  Monitor,
  Gamepad2,
  Tablet
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State Novo / Editar Usuário
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState<UserRole>('TECNICO');
  const [telefone, setTelefone] = useState('');
  const [especialidades, setEspecialidades] = useState<string[]>(['NOTEBOOK']);
  
  // Form State Alterar Senha
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleEspecialidade = (esp: string) => {
    setEspecialidades(prev => 
      prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp]
    );
  };

  const getInitials = (name: string) => {
    if (!name) return 'CO';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenCreateModal = () => {
    setNome('');
    setLogin('');
    setSenha('');
    setTelefone('');
    setCargo('TECNICO');
    setEspecialidades(['NOTEBOOK']);
    setError(null);
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (u: User) => {
    setSelectedUser(u);
    setNome(u.nome);
    setLogin(u.login);
    setTelefone(u.telefone || '');
    setCargo(u.cargo);
    setEspecialidades(u.especialidades || []);
    setError(null);
    setShowEditModal(true);
  };

  const handleOpenPasswordModal = (u: User) => {
    setSelectedUser(u);
    setNovaSenha('');
    setConfirmaNovaSenha('');
    setError(null);
    setShowPasswordModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          nome: nome.trim(),
          login: login.trim().toLowerCase(),
          senha,
          cargo,
          telefone,
          especialidades: cargo === 'TECNICO' || cargo === 'TECNICO_CELULAR' || cargo === 'GERENTE' ? especialidades : []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar usuário');

      setSuccessMsg(data.message);
      setShowCreateModal(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/auth/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          nome: nome.trim(),
          login: login.trim().toLowerCase(),
          cargo,
          telefone,
          especialidades: cargo === 'TECNICO' || cargo === 'TECNICO_CELULAR' || cargo === 'GERENTE' ? especialidades : []
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar colaborador');

      setSuccessMsg(data.message);
      setShowEditModal(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (novaSenha !== confirmaNovaSenha) {
      setError('A confirmação de senha não confere com a nova senha digitada.');
      return;
    }

    if (novaSenha.length < 3) {
      setError('A senha deve ter pelo menos 3 caracteres.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/auth/users/${selectedUser.id}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({ novaSenha })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha');

      setSuccessMsg(data.message);
      setShowPasswordModal(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Tem certeza que deseja remover o colaborador "${user.nome}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao remover usuário');

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const especialidadesOpcoes = [
    { id: 'NOTEBOOK', label: 'Notebooks', icon: Laptop },
    { id: 'SMARTPHONE', label: 'Smartphones / Celulares', icon: Smartphone },
    { id: 'IMPRESSORA', label: 'Impressoras / Multifuncionais', icon: Printer },
    { id: 'PC_DESKTOP', label: 'PCs / Desktops Gamer', icon: Monitor },
    { id: 'CONSOLE', label: 'Consoles / Games', icon: Gamepad2 },
    { id: 'TABLET', label: 'Tablets / iPads', icon: Tablet }
  ];

  const handleDownloadBackup = async () => {
    try {
      const token = localStorage.getItem('scooby_token');
      const res = await fetch('/api/auth/backup', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao baixar backup');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scooby_backup_${new Date().toISOString().slice(0, 10)}.db`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Erro ao realizar backup');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header com Botões */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-400" />
            Gestão da Equipe & Administração
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre, edite perfis, redefina senhas e faça backup completo de segurança do sistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadBackup}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Baixar cópia de segurança do banco de dados SQLite (.db)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Fazer Backup (.db)</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow-teal flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Grid de Usuários Cadastrados */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Carregando equipe...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-white/5 relative group">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-teal-500 font-bold text-sm text-white flex items-center justify-center border border-brand-400/30 shadow-sm shrink-0">
                      {getInitials(u.nome)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{u.nome}</h3>
                      <p className="text-xs font-mono text-slate-400">@{u.login}</p>
                    </div>
                  </div>
                  <RoleBadge role={u.cargo} />
                </div>

                <div className="space-y-2 text-xs py-2 border-t border-white/5">
                  {u.telefone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.telefone}</span>
                    </div>
                  )}

                  {u.especialidades && u.especialidades.length > 0 && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                        Especialidades de Bancada:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {u.especialidades.map((esp, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Wrench className="w-3.5 h-3.5 text-brand-400" />
                  <span>OS Ativas: <strong>{u.os_ativas_count || 0}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(u)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-950/60 text-slate-300 hover:text-brand-300 border border-white/10 hover:border-brand-500/40 transition-colors cursor-pointer"
                    title="Editar Perfil / Cargo / Especialidades"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenPasswordModal(u)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/40 transition-colors cursor-pointer"
                    title="Alterar Senha do Colaborador"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteUser(u)}
                    className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remover Colaborador"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Cadastro de Novo Colaborador */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-slide-up space-y-4 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Cadastrar Novo Colaborador</h3>
                  <p className="text-[11px] text-slate-400">Preencha os dados e permissões</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome e Sobrenome *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva / Mariana Costa"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login de Acesso *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: carlos.silva"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Senha Inicial *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cargo / Função *</label>
                  <select
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none font-medium"
                  >
                    <option value="TECNICO">🔧 Técnico Geral (Note, PC, Impressora)</option>
                    <option value="TECNICO_CELULAR">📱 Técnico Celulares (Híbrido / Autonomia)</option>
                    <option value="TRAINEE">🎓 Técnico Trainee (Em Treinamento)</option>
                    <option value="ATENDENTE">📋 Atendente de Balcão / Recepção</option>
                    <option value="GERENTE">🛡️ Gerente de Triagem (Kanban)</option>
                    <option value="ADMIN">👑 Administrador Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {(cargo === 'TECNICO' || cargo === 'TECNICO_CELULAR' || cargo === 'TRAINEE' || cargo === 'GERENTE') && (
                <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <label className="block text-slate-300 font-semibold text-xs">
                    Especialidades de Bancada:
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {especialidadesOpcoes.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={especialidades.includes(item.id)}
                          onChange={() => handleToggleEspecialidade(item.id)}
                          className="rounded border-slate-700 text-brand-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[11px] truncate">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-glow-teal flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  {submitting ? 'Salvando...' : 'Salvar Colaborador'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 2: Editar Colaborador Já Criado */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-slide-up space-y-4 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Editar Perfil do Colaborador</h3>
                  <p className="text-[11px] text-slate-400">Altere o nome, login, função ou especialidades</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome e Sobrenome *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login de Acesso *</label>
                  <input
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cargo / Função *</label>
                  <select
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none font-medium"
                  >
                    <option value="TECNICO">🔧 Técnico Geral (Note, PC, Impressora)</option>
                    <option value="TECNICO_CELULAR">📱 Técnico Celulares (Híbrido / Autonomia)</option>
                    <option value="TRAINEE">🎓 Técnico Trainee (Em Treinamento)</option>
                    <option value="ATENDENTE">📋 Atendente de Balcão / Recepção</option>
                    <option value="GERENTE">🛡️ Gerente de Triagem (Kanban)</option>
                    <option value="ADMIN">👑 Administrador Geral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {(cargo === 'TECNICO' || cargo === 'TECNICO_CELULAR' || cargo === 'TRAINEE' || cargo === 'GERENTE') && (
                <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                  <label className="block text-slate-300 font-semibold text-xs">
                    Especialidades de Bancada:
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {especialidadesOpcoes.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={especialidades.includes(item.id)}
                          onChange={() => handleToggleEspecialidade(item.id)}
                          className="rounded border-slate-700 text-brand-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[11px] truncate">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-glow-teal flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal 3: Redefinir Senha */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-slide-up space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Redefinir Senha de Acesso</h3>
                  <p className="text-[11px] text-slate-400">Colaborador: <strong className="text-white">{selectedUser.nome}</strong></p>
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nova Senha *</label>
                <input
                  type="password"
                  required
                  placeholder="Digite a nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  required
                  placeholder="Repita a nova senha"
                  value={confirmaNovaSenha}
                  onChange={(e) => setConfirmaNovaSenha(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {submitting ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};