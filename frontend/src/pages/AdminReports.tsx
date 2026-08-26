import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Wrench, 
  Printer, 
  Download, 
  Laptop, 
  Smartphone, 
  Monitor, 
  Gamepad2, 
  HelpCircle,
  Clock,
  Layers,
  ArrowUpRight,
  UserCheck,
  ShoppingBag,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  Timer
} from 'lucide-react';

interface ItemVendidoResumo {
  nome: string;
  quantidade: number;
  faturamento: number;
  lucro: number;
}

interface DesempenhoAtendente {
  id: number;
  nome: string;
  cargo: string;
  totalVendas: number;
  faturamento: number;
  lucroLiquido: number;
  ticketMedio: number;
  itensLista: ItemVendidoResumo[];
  vendasRecentes: Array<{
    id: number;
    codigo_venda: string;
    cliente_nome: string;
    forma_pagamento: string;
    valor_total: number;
    lucro_total: number;
    totalItens: number;
    createdAt: string;
  }>;
}

interface DesempenhoTecnico {
  id: number;
  nome: string;
  cargo: string;
  totalOS: number;
  osEmAndamento: number;
  faturamento: number;
  lucroLiquido: number;
  tempoTotalSegundos: number;
  tempoMedioSegundos: number;
}

interface ReportData {
  periodo: {
    tipo: string;
    label: string;
    inicio: string;
    fim: string;
  };
  metricas: {
    totalCriadas: number;
    totalConcluidas: number;
    totalEntregues: number;
    totalCanceladas: number;
    totalEmAndamento: number;
    faturamentoTotal: number;
    custoTotalPecas: number;
    lucroLiquidoTotal: number;
    margemLucro: string;
    ticketMedio: number;
    taxaAprovacao: string;
    totalVendidoBalcao: number;
    lucroTotalVendasBalcao: number;
    quantidadeTotalVendasBalcao: number;
    faturamentoGeralConsolidado: number;
    lucroGeralConsolidado: number;
  };
  faturamentoPorEquipamento: Array<{
    tipo: string;
    label: string;
    total: number;
    faturamento: number;
    percentual: string;
  }>;
  desempenhoTecnicos: DesempenhoTecnico[];
  desempenhoAtendentes: DesempenhoAtendente[];
  vendasPeriodo: Array<{
    id: number;
    codigo_venda: string;
    cliente_nome: string;
    cliente_telefone?: string;
    forma_pagamento: string;
    valor_total: number;
    lucro_total: number;
    vendedor: string;
    totalItens: number;
    createdAt: string;
    itens: Array<{
      id: number;
      nome_produto: string;
      quantidade: number;
      preco_unitario: number;
      subtotal: number;
      condicao: string;
    }>;
  }>;
  ordensConcluidas: Array<{
    id: number;
    codigo_os: string;
    cliente_nome: string;
    cliente_telefone: string;
    tipo_equipamento: string;
    marca_modelo: string;
    valor_final: number;
    custo_pecas: number;
    lucro_liquido: number;
    tempo_bancada_segundos: number;
    status: string;
    tecnico: string;
    concluido_por: string;
    dataConclusao: string;
    dataCriacao: string;
  }>;
}

export const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<string>('semanal');
  const [abaRelatorio, setAbaRelatorio] = useState<'GERAL' | 'TECNICOS' | 'ATENDENTES'>('GERAL');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [atendenteExpandido, setAtendenteExpandido] = useState<number | null>(null);

  const fetchReports = async (tipoPeriodo: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/reports?periodo=${tipoPeriodo}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(periodo);
  }, [periodo]);

  const handlePrint = () => {
    window.print();
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`;
    }
    return `${minutes} min`;
  };

  const getEquipmentIcon = (tipo: string) => {
    switch (tipo) {
      case 'NOTEBOOK': return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'SMARTPHONE': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'IMPRESSORA': return <Printer className="w-4 h-4 text-amber-400" />;
      case 'PC_DESKTOP': return <Monitor className="w-4 h-4 text-indigo-400" />;
      case 'CONSOLE': return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:space-y-4">
      
      {/* Header Não Imprimível */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-brand-400" />
              Relatórios Gerenciais & Financeiros
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold uppercase tracking-wider">
              Área Administrativa
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Faturamento consolidado, produtividade de técnicos com tempo de bancada e relatório detalhado de vendas por atendente.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="Imprimir Relatório Oficial ou Salvar em PDF"
          >
            <Printer className="w-4 h-4 text-brand-400" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Seletor de Período e Abas (Não Imprimível) */}
      <div className="space-y-3 print:hidden">
        
        {/* Períodos */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setPeriodo('diario')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'diario' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>📅 Hoje (Diário)</span>
          </button>

          <button
            onClick={() => setPeriodo('semanal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'semanal' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>📅 Esta Semana (7 dias)</span>
          </button>

          <button
            onClick={() => setPeriodo('mensal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'mensal' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>📅 Este Mês</span>
          </button>

          <button
            onClick={() => setPeriodo('mes_anterior')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'mes_anterior' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>📅 Mês Anterior</span>
          </button>

          <button
            onClick={() => setPeriodo('geral')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'geral' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>📅 Histórico Completo</span>
          </button>
        </div>

        {/* Abas de Seção */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setAbaRelatorio('GERAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              abaRelatorio === 'GERAL' 
                ? 'bg-slate-800 text-white border border-brand-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-brand-400" />
            <span>Visão Geral Consolidada</span>
          </button>

          <button
            onClick={() => setAbaRelatorio('TECNICOS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              abaRelatorio === 'TECNICOS' 
                ? 'bg-slate-800 text-white border border-emerald-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>Técnicos & Tempo de Bancada</span>
          </button>

          <button
            onClick={() => setAbaRelatorio('ATENDENTES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              abaRelatorio === 'ATENDENTES' 
                ? 'bg-slate-800 text-white border border-purple-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>Atendentes & Vendas de Balcão</span>
          </button>
        </div>

      </div>

      {/* Cabeçalho Oficial Exclusivo para Impressão */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4 text-slate-900">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider">SCOOBY INFORMÁTICA & ASSISTÊNCIA TÉCNICA</h1>
            <p className="text-xs text-slate-600">Relatório Administrativo & Fechamento Financeiro • Tel: (41) 3565-2008</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">{data?.periodo.label}</p>
            <p className="text-slate-600">Emitido por: {user?.nome} em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-3" />
          Calculando métricas financeiras, vendas e tempo de bancada...
        </div>
      ) : data ? (
        <div className="space-y-6 print:space-y-4">
          
          {/* Tag de Período Atual */}
          <div className="flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Exibindo dados para:</span>
              <span className="text-xs font-extrabold text-brand-300 px-3 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30">
                {data.periodo.label}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              <strong>{data.ordensConcluidas.length}</strong> OSs concluídas • <strong>{data.metricas.quantidadeTotalVendasBalcao || 0}</strong> vendas de balcão
            </span>
          </div>

          {/* Cards de Métricas Consolidadas (OS + Vendas Balcão) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            
            {/* Card 1: Faturamento Total Consolidado */}
            <div className="glass-card rounded-3xl p-5 border-white/10 flex flex-col justify-between print:border print:border-slate-300 print:bg-white print:text-black shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 print:text-slate-700">Faturamento Total (Geral)</span>
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center print:hidden">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tight print:text-black">
                  {formatCurrency(data.metricas.faturamentoGeralConsolidado || data.metricas.faturamentoTotal)}
                </p>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between print:text-slate-600">
                  <span>OS: {formatCurrency(data.metricas.faturamentoTotal)}</span>
                  <span>Balcão: {formatCurrency(data.metricas.totalVendidoBalcao || 0)}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Lucro Líquido Real Consolidado */}
            <div className="glass-card rounded-3xl p-5 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-slate-900 flex flex-col justify-between print:border print:border-slate-300 print:bg-white print:text-black shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 print:text-slate-700">Lucro Líquido Real</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center print:hidden">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400 tracking-tight print:text-black">
                  {formatCurrency(data.metricas.lucroGeralConsolidado || data.metricas.lucroLiquidoTotal)}
                </p>
                <p className="text-[11px] text-emerald-300/80 font-bold mt-1 print:text-slate-600">
                  Lucro OS: {formatCurrency(data.metricas.lucroLiquidoTotal)} • Balcão: {formatCurrency(data.metricas.lucroTotalVendasBalcao || 0)}
                </p>
              </div>
            </div>

            {/* Card 3: Vendas Balcão (Atendentes) */}
            <div className="glass-card rounded-3xl p-5 border-purple-500/30 flex flex-col justify-between print:border print:border-slate-300 print:bg-white print:text-black shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-300 print:text-slate-700">Vendas Balcão & Serviços</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center print:hidden">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-purple-300 tracking-tight print:text-black">
                  {formatCurrency(data.metricas.totalVendidoBalcao || 0)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 print:text-slate-600">
                  {data.metricas.quantidadeTotalVendasBalcao || 0} vendas realizadas
                </p>
              </div>
            </div>

            {/* Card 4: Custo Peças / Insumos */}
            <div className="glass-card rounded-3xl p-5 border-orange-500/30 flex flex-col justify-between print:border print:border-slate-300 print:bg-white print:text-black shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-orange-300 print:text-slate-700">(-) Custo Total Peças</span>
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center print:hidden">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-orange-400 tracking-tight print:text-black">
                  {formatCurrency(data.metricas.custoTotalPecas || 0)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 print:text-slate-600">
                  Peças aplicadas em bancada
                </p>
              </div>
            </div>

          </div>

          {/* SEÇÃO 1: PRODUTIVIDADE E TEMPO DE BANCADA DOS TÉCNICOS */}
          {(abaRelatorio === 'GERAL' || abaRelatorio === 'TECNICOS') && (
            <div className="glass-card rounded-3xl p-6 border-white/5 space-y-4 print:border print:border-slate-300 print:bg-white print:text-black shadow-xl">
              <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-3 gap-2 print:border-slate-200">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm print:text-black">
                      Produtividade dos Técnicos & Tempo de Bancada
                    </h3>
                    <p className="text-[11px] text-slate-400 print:text-slate-600">
                      Total produzido, faturamento gerado, tempo total acumulado e tempo médio por conserto
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 print:text-slate-600">
                  Equipe Técnica
                </span>
              </div>

              {data.desempenhoTecnicos.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Nenhum técnico cadastrado no sistema.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {data.desempenhoTecnicos.map((tech) => (
                    <div key={tech.id} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between gap-3 hover:border-emerald-500/40 transition-all print:border print:border-slate-200 print:bg-white shadow-sm">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-white text-xs print:text-black">{tech.nome}</p>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-slate-400 border border-white/10">
                            {tech.cargo === 'ADMIN' ? '👑 Admin' : tech.cargo === 'GERENTE' ? '⭐ Gerente' : '🔧 Técnico'}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-[11px]">
                          <div className="flex justify-between text-slate-400">
                            <span>OS Concluídas:</span>
                            <strong className="text-emerald-400 font-mono">{tech.totalOS}</strong>
                          </div>
                          {tech.osEmAndamento > 0 && (
                            <div className="flex justify-between text-amber-400">
                              <span>Em Bancada Hoje:</span>
                              <strong className="font-mono">{tech.osEmAndamento}</strong>
                            </div>
                          )}
                          <div className="flex justify-between text-slate-400">
                            <span>Tempo Total:</span>
                            <strong className="text-sky-300 font-mono">{formatDuration(tech.tempoTotalSegundos)}</strong>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Tempo Médio / OS:</span>
                            <strong className="text-sky-300 font-mono">{formatDuration(tech.tempoMedioSegundos)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Faturamento</span>
                          <span className="font-black text-emerald-400 text-sm font-mono print:text-black">
                            {formatCurrency(tech.faturamento)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Lucro Gerado</span>
                          <span className="font-bold text-teal-300 text-xs font-mono">
                            +{formatCurrency(tech.lucroLiquido)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEÇÃO 2: RELATÓRIO COMPLETO DE VENDAS POR ATENDENTE (QUANTO VENDEU E O QUE VENDEU) */}
          {(abaRelatorio === 'GERAL' || abaRelatorio === 'ATENDENTES') && (
            <div className="glass-card rounded-3xl p-6 border-purple-500/30 space-y-4 print:border print:border-slate-300 print:bg-white print:text-black shadow-xl">
              <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-3 gap-2 print:border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="font-bold text-white text-sm print:text-black">
                      Relatório de Vendas por Atendente & Itens Vendidos
                    </h3>
                    <p className="text-[11px] text-slate-400 print:text-slate-600">
                      Volume de vendas balcão, lucro apurado e detalhamento completo de quais produtos e serviços cada atendente vendeu
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/30">
                  Total Balcão: {formatCurrency(data.metricas.totalVendidoBalcao || 0)}
                </span>
              </div>

              {(!data.desempenhoAtendentes || data.desempenhoAtendentes.length === 0) ? (
                <p className="text-xs text-slate-500 text-center py-6">Nenhuma venda registrada por atendente no período.</p>
              ) : (
                <div className="space-y-4">
                  {data.desempenhoAtendentes.map((atendente) => {
                    const isExpanded = atendenteExpandido === atendente.id;

                    return (
                      <div key={atendente.id} className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-purple-500/40 transition-all print:border print:border-slate-200 print:bg-white space-y-3">
                        
                        {/* Header Atendente */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 font-bold text-sm flex items-center justify-center border border-purple-500/30 shadow-sm">
                              {atendente.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm print:text-black">{atendente.nome}</h4>
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30">
                                  {atendente.cargo}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                <strong className="text-purple-300 font-mono">{atendente.totalVendas}</strong> vendas realizadas • Ticket Médio: <strong className="font-mono text-slate-200">{formatCurrency(atendente.ticketMedio)}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 block">Total Vendido</span>
                              <span className="font-black text-purple-300 text-base font-mono">
                                {formatCurrency(atendente.faturamento)}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-semibold block">
                                Lucro: +{formatCurrency(atendente.lucroLiquido)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setAtendenteExpandido(isExpanded ? null : atendente.id)}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-white/5"
                            >
                              <span>{isExpanded ? 'Ocultar Itens' : 'Ver O Que Vendeu'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Detalhamento dos Itens Vendidos por Este Atendente */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-white/10 space-y-3 animate-fade-in">
                            <h5 className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-brand-400" />
                              Produtos & Serviços Vendidos por {atendente.nome} ({atendente.itensLista.length} itens distintos):
                            </h5>

                            {atendente.itensLista.length === 0 ? (
                              <p className="text-slate-500 text-xs italic">Nenhum item vendido no período.</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/10 text-slate-400">
                                      <th className="py-2 px-3 font-semibold">Produto / Serviço</th>
                                      <th className="py-2 px-3 font-semibold text-center">Quantidade Vendida</th>
                                      <th className="py-2 px-3 font-semibold text-right">Faturamento Total</th>
                                      <th className="py-2 px-3 font-semibold text-right">Lucro Real</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {atendente.itensLista.map((it, idx) => (
                                      <tr key={idx} className="hover:bg-white/5">
                                        <td className="py-2 px-3 text-white font-medium">
                                          {it.nome}
                                        </td>
                                        <td className="py-2 px-3 text-center font-bold text-brand-300 font-mono">
                                          {it.quantidade} un
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-slate-200">
                                          {formatCurrency(it.faturamento)}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                                          +{formatCurrency(it.lucro)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TABELA DETALHADA DE ORDENS DE SERVIÇO FINALIZADAS (COM TEMPO DE BANCADA) */}
          {(abaRelatorio === 'GERAL' || abaRelatorio === 'TECNICOS') && (
            <div className="glass-card rounded-3xl p-6 border-white/5 space-y-4 print:border print:border-slate-300 print:bg-white print:text-black shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 print:border-slate-200">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 print:text-black">
                  <Layers className="w-4 h-4 text-brand-400" />
                  Extrato Detalhado de Ordens Finalizadas ({data.ordensConcluidas.length})
                </h3>
              </div>

              {data.ordensConcluidas.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Nenhuma OS finalizada no período selecionado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 print:border-slate-300 print:text-slate-700">
                        <th className="py-2.5 px-3 font-semibold">Código OS</th>
                        <th className="py-2.5 px-3 font-semibold">Cliente</th>
                        <th className="py-2.5 px-3 font-semibold">Equipamento</th>
                        <th className="py-2.5 px-3 font-semibold">Técnico</th>
                        <th className="py-2.5 px-3 font-semibold text-center">⏱️ Tempo Bancada</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Custo Peças</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Total OS</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Lucro Real</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 print:divide-slate-200">
                      {data.ordensConcluidas.map((os: any) => (
                        <tr key={os.id} className="hover:bg-white/5 print:hover:bg-transparent">
                          <td className="py-2.5 px-3 font-mono font-bold text-brand-300 print:text-black">
                            {os.codigo_os}
                          </td>
                          <td className="py-2.5 px-3 text-white font-medium print:text-black">
                            {os.cliente_nome}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 print:text-slate-700">
                            {os.marca_modelo}
                          </td>
                          <td className="py-2.5 px-3 print:text-slate-900">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white font-semibold text-[11px] print:border-slate-300 print:bg-transparent print:text-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              {os.tecnico}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-sky-300 font-bold">
                            {formatDuration(os.tempo_bancada_segundos || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-orange-400 print:text-slate-800">
                            {formatCurrency(os.custo_pecas || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-white print:text-black">
                            {formatCurrency(os.valor_final)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-400 print:text-black">
                            +{formatCurrency(os.lucro_liquido || (os.valor_final - (os.custo_pecas || 0)))}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 print:text-slate-600 font-mono text-[11px]">
                            {formatDate(os.dataConclusao)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-white/10 font-bold print:border-slate-400">
                        <td colSpan={5} className="py-3 px-3 text-right text-slate-300 uppercase tracking-wider text-xs print:text-black">
                          Totais do Período (OS):
                        </td>
                        <td className="py-3 px-3 text-right text-orange-400 font-bold text-xs print:text-slate-800">
                          {formatCurrency((data.metricas as any).custoTotalPecas || 0)}
                        </td>
                        <td className="py-3 px-3 text-right text-white font-black text-xs print:text-black">
                          {formatCurrency(data.metricas.faturamentoTotal)}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-black text-sm print:text-black">
                          +{formatCurrency((data.metricas as any).lucroLiquidoTotal || data.metricas.faturamentoTotal)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Rodapé Oficial para Impressão */}
          <div className="hidden print:block pt-8 text-xs text-slate-700 border-t border-slate-300 mt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-bold">Scooby OS - Sistema de Gestão Técnica & Balcão</p>
                <p>Relatório emitido para conferência administrativa e contábil.</p>
              </div>
              <div className="text-center w-48 border-t border-slate-900 pt-1">
                <p className="font-semibold">Assinatura do Responsável</p>
              </div>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};