import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { OrdemServico } from '../types';
import { OSCard } from '../components/OSCard';
import { TechnicianBenchModal } from '../components/TechnicianBenchModal';
import { OSDetailsModal } from '../components/OSDetailsModal';
import { PrintTicketModal } from '../components/PrintTicketModal';
import { AssignTechnicianModal } from '../components/AssignTechnicianModal';
import { Wrench, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const TecnicoBancada: React.FC = () => {
  const { user } = useAuth();
  const { refreshTrigger } = useSocket();

  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedTecnicoFilter, setSelectedTecnicoFilter] = useState<string>('MEU'); // MEU, TODOS, ou ID
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('ATIVAS');

  // Modais
  const [benchOS, setBenchOS] = useState<OrdemServico | null>(null);
  const [selectedOSDetails, setSelectedOSDetails] = useState<OrdemServico | null>(null);
  const [selectedOSPrint, setSelectedOSPrint] = useState<OrdemServico | null>(null);
  const [selectedOSAssign, setSelectedOSAssign] = useState<OrdemServico | null>(null);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/chat/membros', {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (res.ok) setTeamMembers(data.usuarios || []);
    } catch {}
  };

  const fetchOS = async () => {
    try {
      const res = await fetch('/api/os', {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (data.os) {
        setOsList(data.os);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    fetchOS();
  }, [refreshTrigger]);

  // Filtragem inteligente da bancada por técnico e status
  const filteredOS = osList.filter(o => {
    // Filtro por técnico
    if (selectedTecnicoFilter === 'MEU' && user?.cargo === 'TECNICO') {
      if (o.tecnico_id !== user.id) return false;
    } else if (selectedTecnicoFilter !== 'TODOS' && selectedTecnicoFilter !== 'MEU') {
      if (o.tecnico_id !== Number(selectedTecnicoFilter)) return false;
    }

    if (selectedFilter === 'ATIVAS') return ['EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES', 'AGUARDANDO_APROVACAO'].includes(o.status);
    if (selectedFilter === 'ESPERA') return o.status === 'AGUARDANDO_APROVACAO';
    if (selectedFilter === 'CONCLUIDAS') return o.status === 'CONCLUIDO' || o.status === 'ENTREGUE';
    if (selectedFilter === 'URGENTES') return o.prioridade === 'URGENTE' && o.status !== 'CONCLUIDO';
    return true;
  });

  const totalAtivas = osList.filter(o => ['EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES', 'AGUARDANDO_APROVACAO'].includes(o.status)).length;
  const totalEspera = osList.filter(o => o.status === 'AGUARDANDO_APROVACAO').length;
  const totalUrgentes = osList.filter(o => o.prioridade === 'URGENTE' && o.status !== 'CONCLUIDO').length;
  const totalConcluidas = osList.filter(o => o.status === 'CONCLUIDO' || o.status === 'ENTREGUE').length;

  const handleUpdateStatus = async (os: OrdemServico, novoStatus: string, obs?: string) => {
    try {
      const res = await fetch(`/api/os/${os.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          status: novoStatus,
          observacao: obs || `Status alterado na bancada pelo técnico para ${novoStatus}.`
        })
      });
      if (res.ok) fetchOS();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-brand-400" />
            {user?.cargo === 'TECNICO' ? 'Minha Bancada de Manutenção' : 'Bancada Técnica de Manutenção'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fila de ordens de serviço atribuídas para manutenção e testes de bancada.
          </p>
        </div>

        {/* Abas Rápidas de Filtro */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-white/10 self-start sm:self-auto text-xs">
          <button
            onClick={() => setSelectedFilter('ATIVAS')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${selectedFilter === 'ATIVAS' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Todas na Bancada ({totalAtivas})
          </button>
          <button
            onClick={() => setSelectedFilter('ESPERA')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1 ${selectedFilter === 'ESPERA' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-orange-300'}`}
          >
            <span>⏳ Aguardando Cliente</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">{totalEspera}</span>
          </button>
          <button
            onClick={() => setSelectedFilter('URGENTES')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${selectedFilter === 'URGENTES' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Urgentes ({totalUrgentes})
          </button>
          <button
            onClick={() => setSelectedFilter('CONCLUIDAS')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${selectedFilter === 'CONCLUIDAS' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Finalizadas ({totalConcluidas})
          </button>
        </div>
      </div>

      {/* Seletor de Bancada para Gestores e Admins */}
      {(user?.cargo === 'ADMIN' || user?.cargo === 'GERENTE') && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Filtrar por Técnico:</span>
          <button
            onClick={() => setSelectedTecnicoFilter('TODOS')}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${selectedTecnicoFilter === 'TODOS' ? 'bg-brand-500 text-white shadow-glow-teal' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5'}`}
          >
            <span>🏢 Todas as Bancadas</span>
          </button>
          {teamMembers.filter(m => ['TECNICO', 'TECNICO_CELULAR', 'ADMIN'].includes(m.cargo)).map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTecnicoFilter(String(t.id))}
              className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${selectedTecnicoFilter === String(t.id) ? 'bg-teal-500 text-white font-bold shadow-glow-teal' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5'}`}
            >
              <Wrench className="w-3 h-3 text-teal-400" />
              <span>Bancada de {t.nome}</span>
            </button>
          ))}
        </div>
      )}

      {/* Grid de OS da Bancada */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Carregando sua bancada...</div>
      ) : filteredOS.length === 0 ? (
        <div className="glass-panel rounded-3xl py-16 px-4 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-white">Nenhuma OS nesta etapa</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Você não possui ordens de serviço pendentes neste filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOS.map((os) => (
            <OSCard
              key={os.id}
              os={os}
              currentUserRole="TECNICO"
              onViewDetails={(selected) => setSelectedOSDetails(selected)}
              onAssign={(selected) => setSelectedOSAssign(selected)}
              onBenchAction={(selected) => setBenchOS(selected)}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <AssignTechnicianModal
        os={selectedOSAssign}
        onClose={() => setSelectedOSAssign(null)}
        onSuccess={() => fetchOS()}
      />

      <TechnicianBenchModal
        os={benchOS}
        onClose={() => setBenchOS(null)}
        onSuccess={() => fetchOS()}
      />

      <OSDetailsModal
        os={selectedOSDetails}
        onClose={() => setSelectedOSDetails(null)}
        onOpenPrint={(osToPrint) => {
          setSelectedOSDetails(null);
          setSelectedOSPrint(osToPrint);
        }}
      />

      <PrintTicketModal
        os={selectedOSPrint}
        onClose={() => setSelectedOSPrint(null)}
      />

    </div>
  );
};