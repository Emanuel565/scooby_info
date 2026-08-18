import React, { useState, useEffect } from 'react';
import { OrdemServico, User } from '../types';
import { UserPlus, X, Award, CheckCircle2 } from 'lucide-react';

interface AssignTechnicianModalProps {
  os: OrdemServico | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({ os, onClose, onSuccess }) => {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<number | null>(null);
  const [prioridade, setPrioridade] = useState<string>('MEDIA');
  const [prazo, setPrazo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (os) {
      setSelectedTechId(os.tecnico_id || null);
      setPrioridade(os.prioridade || 'MEDIA');
      if (os.prazo_entrega) {
        const d = new Date(os.prazo_entrega);
        setPrazo(d.toISOString().slice(0, 16));
      }
    }

    fetch('/api/auth/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          const techs = data.users.filter((u: User) => u.cargo === 'TECNICO' || u.cargo === 'TECNICO_CELULAR' || u.cargo === 'TRAINEE');
          setTechnicians(techs);
        }
      })
      .catch(() => {});
  }, [os]);

  if (!os) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) {
      setError('Selecione um técnico responsável.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/os/${os.id}/atribuir`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          tecnico_id: selectedTechId,
          prioridade,
          prazo_entrega: prazo || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atribuir técnico');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-slide-up">
        
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Direcionar OS para Técnico</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
          <p><span className="font-bold text-white">{os.codigo_os}:</span> {os.marca_modelo} ({os.cliente_nome})</p>
          <p className="text-slate-400 mt-1"><span className="font-medium text-slate-300">Defeito:</span> {os.defeito_relatado}</p>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Selecione o Técnico da Bancada:
            </label>
            <div className="space-y-2">
              {technicians.map((tech) => {
                const matchesSpecialty = tech.especialidades?.includes(os.tipo_equipamento);
                const isSelected = selectedTechId === tech.id;

                const initials = tech.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                return (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'bg-brand-500/20 border-brand-500 shadow-glow-teal' : 'bg-slate-950/40 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500/30 to-indigo-600/30 border border-brand-500/40 flex items-center justify-center font-black text-xs text-brand-300 shadow-inner">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white">{tech.nome}</p>
                          {matchesSpecialty && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                              <Award className="w-3 h-3" /> Especialista
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Carga atual: <span className="font-semibold text-brand-300">{tech.os_ativas_count || 0} OS em andamento</span>
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-brand-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Definir Prioridade:
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-brand-500 focus:outline-none"
              >
                <option value="BAIXA">⚪ Baixa</option>
                <option value="MEDIA">🔵 Média</option>
                <option value="ALTA">🟠 Alta</option>
                <option value="URGENTE">🔴 URGENTE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prazo de Entrega:
              </label>
              <input
                type="datetime-local"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-glow-teal flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Confirmar Atribuição'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};