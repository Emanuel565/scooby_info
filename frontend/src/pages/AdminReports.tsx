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
  UserCheck
} from 'lucide-react';

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
    ticketMedio: number;
    taxaAprovacao: string;
  };
  faturamentoPorEquipamento: Array<{
    tipo: string;
    label: string;
    total: number;
    faturamento: number;
    percentual: string;
  }>;
  desempenhoTecnicos: Array<{
    id: number;
    nome: string;
    cargo: string;
    totalOS: number;
    faturamento: number;
    tempoTotalSegundos: number;
  }>;
  ordensConcluidas: Array<{
    id: number;
    codigo_os: string;
    cliente_nome: string;
    cliente_telefone: string;
    tipo_equipamento: string;
    marca_modelo: string;
    valor_final: number;
    status: string;
    tecnico: string;
    dataConclusao: string;
    dataCriacao: string;
  }>;
}

export const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<string>('semanal');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ReportData | null>(null);

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
            Acompanhe o faturamento semanal e mensal, ordens concluídas e desempenho técnico da equipe.
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

      {/* Seletor de Período (Não Imprimível) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 print:hidden">
        <button
          onClick={() => setPeriodo('diario')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'diario' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>📅 Relatório Diário (Hoje)</span>
        </button>

        <button
          onClick={() => setPeriodo('semanal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'semanal' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>📅 Esta Semana (7 dias)</span>
        </button>

        <button
          onClick={() => setPeriodo('mensal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'mensal' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>📅 Relatório Mensal (Este Mês)</span>
        </button>

        <button
          onClick={() => setPeriodo('mes_anterior')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'mes_anterior' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>📅 Mês Anterior</span>
        </button>

        <button
          onClick={() => setPeriodo('geral')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${periodo === 'geral' ? 'bg-brand-500 text-white shadow-glow-teal' : 'text-slate-400 hover:text-white'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>📅 Histórico Completo</span>
        </button>
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
          Calculando métricas financeiras e gerando relatório...
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
              Total de <strong>{data.ordensConcluidas.length}</strong> ordens finalizadas no período
            </span>
          </div>

          {/* 4 Cards de Métricas Principais com Foco em Lucro Real */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            
            {/* Card 1: Faturamento */}
            <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between print:border print:border-slate-300 print:bg-white print:text-black">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 print:text-slate-700">Faturamento Bruto</span>
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center print:hidden">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tight print:text-black">
                  {formatCurrency(data.metricas.faturamentoTotal)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 print:text-slate-600">
                  {data.metricas.totalConcluidas} serviços finalizados
                </p>
              </div>
            </div>

            {/* Card 2: Custo das Peças */}
            <div className="glass-card rounded-3xl p-5 border-orange-500/30 flex flex-col justify-between print:border print:border-slate-300 print:bg-white print:text-black">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 print:text-slate-700">(-) Custo das Peças</span>
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center print:hidden">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-orange-400 tracking-tight print:text-black">
                  {formatCurrency((data.metricas as any).custoTotalPecas || 0)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 print:text-slate-600">
                  Peças e componentes utilizados
                </p>
              </div>
            </div>

            {/* Card 3: Lucro Líquido Realizado */}
            <div className="glass-card rounded-3xl p-5 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-slate-900 flex flex-col justify-between print:border print:border-slate-300 print:bg-white print:text-black">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 print:text-slate-700">(=) Lucro Líquido Real</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center print:hidden">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400 tracking-tight print:text-black">
                  {formatCurrency((data.metricas as any).lucroLiquidoTotal || data.metricas.faturamentoTotal)}
                </p>
                <p className="text-[11px] text-emerald-300/80 font-bold mt-1 print:text-slate-600">
                  Margem: {(data.metricas as any).margemLucro || '100'}% do faturamento
                </p>
              </div>
            </div>

            {/* Card 4: Ticket Médio */}
            <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between print:border print:border-slate-300 print:bg-white print:text-black">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 print:text-slate-700">Ticket Médio / OS</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center print:hidden">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white tracking-tight print:text-black">
                  {formatCurrency(data.metricas.ticketMedio)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 print:text-slate-600">
                  {data.metricas.totalEntregues} entregues ao cliente
                </p>
              </div>
            </div>

          </div>

          {/* Seções de Detalhamento em 2 Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            
            {/* Bloco 1: Faturamento por Categoria de Equipamento */}
            <div className="glass-card rounded-3xl p-6 border-white/5 space-y-4 print:border print:border-slate-300 print:bg-white print:text-black">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 print:border-slate-200">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 print:text-black">
                  <Laptop className="w-4 h-4 text-brand-400" />
                  Faturamento por Categoria de Equipamento
                </h3>
                <span className="text-xs text-slate-400 print:text-slate-600">Participação</span>
              </div>

              {data.faturamentoPorEquipamento.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Nenhum serviço finalizado nesta categoria no período.</p>
              ) : (
                <div className="space-y-3">
                  {data.faturamentoPorEquipamento.map((item) => (
                    <div key={item.tipo} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium text-white print:text-black">
                          {getEquipmentIcon(item.tipo)}
                          <span>{item.label} ({item.total} OS)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400 print:text-black">{formatCurrency(item.faturamento)}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono print:border-slate-300 print:text-slate-700">
                            {item.percentual}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-white/5 print:bg-slate-200">
                        <div 
                          className="bg-gradient-to-r from-brand-500 to-teal-400 h-full rounded-full print:bg-slate-800" 
                          style={{ width: `${Math.max(Number(item.percentual), 3)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bloco 2: Desempenho e Produtividade dos Técnicos */}
            <div className="glass-card rounded-3xl p-6 border-white/5 space-y-4 print:border print:border-slate-300 print:bg-white print:text-black">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 print:border-slate-200">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 print:text-black">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Produtividade e Produção por Técnico
                </h3>
                <span className="text-xs text-slate-400 print:text-slate-600">Total Produzido</span>
              </div>

              {data.desempenhoTecnicos.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Nenhum técnico cadastrado no sistema.</p>
              ) : (
                <div className="space-y-3">
                  {data.desempenhoTecnicos.map((tech: any) => (
                    <div key={tech.id} className="p-3.5 rounded-2xl bg-slate-950/40 border border-white/5 flex flex-wrap items-center justify-between gap-3 hover:border-brand-500/30 transition-all print:border print:border-slate-200 print:bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 font-bold text-xs flex items-center justify-center border border-brand-500/30 print:border-slate-400 print:text-black shadow-sm">
                          {tech.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-xs print:text-black">{tech.nome}</p>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-white/5 text-slate-400 border border-white/10">
                              {tech.cargo === 'ADMIN' ? '👑 Admin' : tech.cargo === 'GERENTE' ? '⭐ Gerente' : '🔧 Técnico'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                            <strong className="text-emerald-400 font-mono">{tech.totalOS}</strong> OSs concluídas
                            {tech.osEmAndamento > 0 && (
                              <span className="text-amber-400 font-mono ml-1.5">• {tech.osEmAndamento} em bancada</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-400 text-sm font-mono print:text-black">
                          {formatCurrency(tech.faturamento)}
                        </p>
                        <p className="text-[10px] text-teal-300 font-semibold print:text-slate-600">
                          {tech.totalOS > 0 ? `Lucro: +${formatCurrency(tech.lucroLiquido || tech.faturamento)}` : 'Sem faturamento no período'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Tabela Detalhada de Ordens de Serviço Finalizadas */}
          <div className="glass-card rounded-3xl p-6 border-white/5 space-y-4 print:border print:border-slate-300 print:bg-white print:text-black">
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
                      <td colSpan={4} className="py-3 px-3 text-right text-slate-300 uppercase tracking-wider text-xs print:text-black">
                        Totais do Período:
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

          {/* Rodapé Oficial para Impressão */}
          <div className="hidden print:block pt-8 text-xs text-slate-700 border-t border-slate-300 mt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="font-bold">Scooby OS - Sistema de Gestão Técnica</p>
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