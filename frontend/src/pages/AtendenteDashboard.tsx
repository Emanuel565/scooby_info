import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { OrdemServico } from '../types';
import { OSCard } from '../components/OSCard';
import { NewOSModal } from '../components/NewOSModal';
import { OSDetailsModal } from '../components/OSDetailsModal';
import { PrintTicketModal } from '../components/PrintTicketModal';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Laptop, 
  AlertCircle,
  PackageCheck,
  Wrench
} from 'lucide-react';

export const AtendenteDashboard: React.FC = () => {
  const { user } = useAuth();
  const { refreshTrigger } = useSocket();

  const [osList, setOsList] = useState<OrdemServico[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [selectedTipo, setSelectedTipo] = useState('TODOS');
  const [selectedTecnico, setSelectedTecnico] = useState<string>('TODOS'); // TODOS, SEM_TECNICO, ou ID do técnico

  // Modais
  const [showNewOSModal, setShowNewOSModal] = useState(false);
  const [selectedOSDetails, setSelectedOSDetails] = useState<OrdemServico | null>(null);
  const [selectedOSPrint, setSelectedOSPrint] = useState<OrdemServico | null>(null);

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
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedStatus !== 'TODOS') params.append('status', selectedStatus);
      if (selectedTipo !== 'TODOS') params.append('tipo_equipamento', selectedTipo);
      if (selectedTecnico !== 'TODOS' && selectedTecnico !== 'SEM_TECNICO') {
        params.append('tecnico_id', selectedTecnico);
      }

      const res = await fetch(`/api/os?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (data.os) {
        let list = data.os;
        if (selectedTecnico === 'SEM_TECNICO') {
          list = list.filter((o: OrdemServico) => !o.tecnico_id);
        }
        setOsList(list);
      }
    } catch (e) {
      console.error('Erro ao buscar OS:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    fetchOS();
  }, [refreshTrigger, search, selectedStatus, selectedTipo, selectedTecnico]);

  const handleDeliver = async (os: OrdemServico) => {
    if (!window.confirm(`Confirmar entrega da OS ${os.codigo_os} para o cliente ${os.cliente_nome}?`)) return;

    try {
      const res = await fetch(`/api/os/${os.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          status: 'ENTREGUE',
          observacao: 'Aparelho entregue ao cliente e finalizado no balcão de atendimento.'
        })
      });

      if (res.ok) {
        fetchOS();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Métricas rápidas
  const totalTriagem = osList.filter(o => o.status === 'TRIAGEM').length;
  const totalEmAndamento = osList.filter(o => ['EM_ANDAMENTO', 'AGUARDANDO_PECA', 'TESTES'].includes(o.status)).length;
  const totalProntasEntrega = osList.filter(o => o.status === 'CONCLUIDO').length;

  return (
    <div className="space-y-6">
      
      {/* Header do Balcão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-brand-400" />
            Recepção & Abertura de Ordens de Serviço
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Atendimento ao cliente, abertura de chamados técnicos e entrega de aparelhos.
          </p>
        </div>

        <button
          onClick={() => setShowNewOSModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white font-bold text-xs shadow-glow-teal flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Nova Ordem de Serviço
        </button>
      </div>

      {/* Cards de Métricas do Balcão */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Aguardando Triagem</p>
            <p className="text-xl font-extrabold text-white">{totalTriagem} <span className="text-xs font-normal text-slate-400">aparelhos</span></p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Em Manutenção / Bancada</p>
            <p className="text-xl font-extrabold text-white">{totalEmAndamento} <span className="text-xs font-normal text-slate-400">em reparo</span></p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border-emerald-500/30 shadow-glow-teal">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-300 font-medium">Pronto para Retirada</p>
            <p className="text-xl font-extrabold text-emerald-400">{totalProntasEntrega} <span className="text-xs font-normal text-slate-400">aguardando cliente</span></p>
          </div>
        </div>
      </div>

      {/* Seletor Rápido de Filas de Trabalho por Técnico */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedTecnico('TODOS')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${selectedTecnico === 'TODOS' ? 'bg-brand-500 text-white shadow-glow-teal' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5'}`}
        >
          <span>🏢 Toda a Oficina</span>
        </button>

        {teamMembers.filter(m => ['TECNICO', 'TECNICO_CELULAR', 'TRAINEE', 'ADMIN', 'GERENTE'].includes(m.cargo)).map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTecnico(String(t.id))}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${selectedTecnico === String(t.id) ? 'bg-teal-500 text-white font-bold shadow-glow-teal' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5'}`}
          >
            <Wrench className="w-3.5 h-3.5 text-teal-400" />
            <span>Fila de {t.nome}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-white/80">
              {t.cargo === 'TECNICO_CELULAR' ? 'Celulares/Games' : t.cargo === 'TRAINEE' ? 'Trainee' : t.cargo}
            </span>
          </button>
        ))}

        <button
          onClick={() => setSelectedTecnico('SEM_TECNICO')}
          className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${selectedTecnico === 'SEM_TECNICO' ? 'bg-purple-600 text-white font-bold shadow-lg' : 'bg-slate-900/80 hover:bg-slate-800 text-purple-300 border border-purple-500/20'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>⏳ Aguardando Técnico</span>
        </button>
      </div>

      {/* Barra de Filtros & Busca */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone, OS ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="TRIAGEM">Triagem</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="AGUARDANDO_PECA">Aguardando Peça</option>
            <option value="TESTES">Em Testes</option>
            <option value="CONCLUIDO">Concluído (Pronto)</option>
            <option value="ENTREGUE">Entregue</option>
          </select>

          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="TODOS">Todos os Equipamentos</option>
            <option value="NOTEBOOK">Notebook</option>
            <option value="SMARTPHONE">Smartphone / Celular</option>
            <option value="PC_DESKTOP">PC Desktop</option>
            <option value="CONSOLE">Console</option>
          </select>
        </div>
      </div>

      {/* Grid de Cards de OS */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Carregando ordens de serviço...</div>
      ) : osList.length === 0 ? (
        <div className="glass-panel rounded-3xl py-16 px-4 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhuma Ordem de Serviço Encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Não há atendimentos correspondentes aos filtros aplicados. Clique no botão abaixo para abrir uma nova OS.
          </p>
          <button
            onClick={() => setShowNewOSModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs inline-flex items-center gap-2 mt-2"
          >
            <PlusCircle className="w-4 h-4" />
            Nova OS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {osList.map((os) => (
            <OSCard
              key={os.id}
              os={os}
              currentUserRole={user?.cargo || 'ATENDENTE'}
              onViewDetails={(selected) => setSelectedOSDetails(selected)}
              onDeliver={(selected) => handleDeliver(selected)}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <NewOSModal
        isOpen={showNewOSModal}
        onClose={() => setShowNewOSModal(false)}
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