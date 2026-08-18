import React, { useState, useEffect, useCallback } from 'react';
import { OrdemServico, OSStatus } from '../types';
import { OSCard } from '../components/OSCard';
import { AssignTechnicianModal } from '../components/AssignTechnicianModal';
import { OSDetailsModal } from '../components/OSDetailsModal';
import { PrintTicketModal } from '../components/PrintTicketModal';
import { TechnicianBenchModal } from '../components/TechnicianBenchModal';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Wrench, 
  Clock, 
  DollarSign, 
  Search,
  CheckCircle,
  Hourglass,
  FileCheck
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const GerenteKanban: React.FC = () => {
  const { user } = useAuth();
  const { refreshTrigger } = useSocket();

  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('TODAS');
  const [filtroEquipamento, setFiltroEquipamento] = useState('TODOS');

  // Modais
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isBenchModalOpen, setIsBenchModalOpen] = useState(false);

  const fetchKanbanData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filtroPrioridade !== 'TODAS') params.append('prioridade', filtroPrioridade);
      if (filtroEquipamento !== 'TODOS') params.append('tipo_equipamento', filtroEquipamento);

      const [resOS, resStats] = await Promise.all([
        fetch(`/api/os?${params.toString()}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
        }),
        fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
        })
      ]);

      const dataOS = await resOS.json();
      const dataStats = await resStats.json();

      if (dataOS.os) setOsList(dataOS.os);
      if (dataStats) setStats(dataStats);
    } catch (err) {
      console.error('Erro ao carregar dados do Kanban:', err);
    }
  }, [search, filtroPrioridade, filtroEquipamento]);

  useEffect(() => {
    fetchKanbanData();
  }, [fetchKanbanData, refreshTrigger]);

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
          observacao: obs || `Status alterado no painel Kanban para ${novoStatus}.`
        })
      });
      if (res.ok) fetchKanbanData();
    } catch (err) {
      console.error(err);
    }
  };

  const kanbanColumns: { id: OSStatus; title: string; color: string; border: string; icon: any }[] = [
    {
      id: 'TRIAGEM',
      title: 'Triagem & Entrada',
      color: 'bg-indigo-500/10 text-indigo-300',
      border: 'border-indigo-500/30',
      icon: Clock
    },
    {
      id: 'EM_ANDAMENTO',
      title: 'Bancada / Em Reparo',
      color: 'bg-blue-500/10 text-blue-300',
      border: 'border-blue-500/30',
      icon: Wrench
    },
    {
      id: 'AGUARDANDO_APROVACAO',
      title: 'Aguardando Aprovação',
      color: 'bg-orange-500/15 text-orange-300',
      border: 'border-orange-500/40',
      icon: FileCheck
    },
    {
      id: 'AGUARDANDO_PECA',
      title: 'Aguardando Peça',
      color: 'bg-amber-500/10 text-amber-300',
      border: 'border-amber-500/30',
      icon: Hourglass
    },
    {
      id: 'TESTES',
      title: 'Testes de Qualidade',
      color: 'bg-purple-500/10 text-purple-300',
      border: 'border-purple-500/30',
      icon: CheckCircle
    },
    {
      id: 'CONCLUIDO',
      title: 'Pronto p/ Retirada',
      color: 'bg-emerald-500/10 text-emerald-300',
      border: 'border-emerald-500/30',
      icon: CheckCircle
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner de Métricas em Tempo Real */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ordens Ativas</p>
              <p className="text-2xl font-black text-white mt-1">{stats.totalOSAtivas}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Aguardando Aprovação</p>
              <p className="text-2xl font-black text-orange-400 mt-1">
                {osList.filter(o => o.status === 'AGUARDANDO_APROVACAO').length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SLA Crítico / Vencidas</p>
              <p className="text-2xl font-black text-rose-400 mt-1">{stats.sla.vencidas + stats.sla.urgentesHoje}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Faturamento Concluído</p>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {formatCurrency(stats.faturamento?.totalConcluido || 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="glass-panel rounded-2xl p-3.5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Buscar por código, cliente, telefone ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none text-xs"
          >
            <option value="TODAS">Todas as Prioridades</option>
            <option value="URGENTE">🔴 Urgentes</option>
            <option value="ALTA">🟠 Altas</option>
            <option value="MEDIA">🔵 Médias</option>
            <option value="BAIXA">⚪ Baixas</option>
          </select>

          <select
            value={filtroEquipamento}
            onChange={(e) => setFiltroEquipamento(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none text-xs"
          >
            <option value="TODOS">Todos Equipamentos</option>
            <option value="NOTEBOOK">Notebooks</option>
            <option value="SMARTPHONE">Smartphones</option>
            <option value="IMPRESSORA">Impressoras</option>
            <option value="PC_DESKTOP">PC Desktop</option>
            <option value="CONSOLE">Consoles</option>
          </select>
        </div>
      </div>

      {/* Quadro Kanban com Colunas Espaçosas */}
      <div className="flex items-start gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {kanbanColumns.map((col) => {
          const colOS = osList.filter(o => o.status === col.id);
          const ColIcon = col.icon;

          return (
            <div key={col.id} className="w-[330px] shrink-0 bg-slate-950/60 rounded-3xl p-4 border border-white/5 space-y-3 flex flex-col shadow-lg">
              
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl ${col.color} border ${col.border} flex items-center justify-center shadow-sm`}>
                    <ColIcon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-xs">{col.title}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                  {colOS.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
                {colOS.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-white/5 rounded-2xl">
                    Nenhuma OS nesta etapa
                  </div>
                ) : (
                  colOS.map((os) => (
                    <OSCard
                      key={os.id}
                      os={os}
                      currentUserRole={user?.cargo || 'GERENTE'}
                      onViewDetails={(item) => {
                        setSelectedOS(item);
                        setIsDetailsModalOpen(true);
                      }}
                      onAssign={(item) => {
                        setSelectedOS(item);
                        setIsAssignModalOpen(true);
                      }}
                      onBenchAction={(item) => {
                        setSelectedOS(item);
                        setIsBenchModalOpen(true);
                      }}
                      onDeliver={(item) => {
                        handleUpdateStatus(item, 'ENTREGUE', 'Equipamento retirado e entregue ao cliente.');
                      }}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Modais Integrados */}
      {isAssignModalOpen && selectedOS && (
        <AssignTechnicianModal
          os={selectedOS}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => {
            setIsAssignModalOpen(false);
            fetchKanbanData();
          }}
        />
      )}

      {isDetailsModalOpen && selectedOS && (
        <OSDetailsModal
          os={selectedOS}
          onClose={() => setIsDetailsModalOpen(false)}
          onOpenPrint={(item) => {
            setSelectedOS(item);
            setIsPrintModalOpen(true);
          }}
        />
      )}

      {isPrintModalOpen && selectedOS && (
        <PrintTicketModal
          os={selectedOS}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {isBenchModalOpen && selectedOS && (
        <TechnicianBenchModal
          os={selectedOS}
          onClose={() => setIsBenchModalOpen(false)}
          onSuccess={() => {
            setIsBenchModalOpen(false);
            fetchKanbanData();
          }}
        />
      )}

    </div>
  );
};