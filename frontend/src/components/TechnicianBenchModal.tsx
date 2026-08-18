import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { OrdemServico, PecaItem } from '../types';
import { formatCurrency, formatDuration } from '../utils/formatters';
import { 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Send, 
  Clock, 
  FileCheck, 
  CheckSquare, 
  X,
  Package,
  DollarSign,
  Wrench,
  Sparkles,
  Layers
} from 'lucide-react';

interface ServicoItem {
  id: string;
  nome: string;
  valor: number;
}

interface TechnicianBenchModalProps {
  os: OrdemServico | null;
  isOpen?: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onSuccess?: () => void;
}

export const TechnicianBenchModal: React.FC<TechnicianBenchModalProps> = ({
  os,
  isOpen = true,
  onClose,
  onRefresh,
  onSuccess
}) => {
  if (!os || isOpen === false) return null;

  const { user } = useAuth();
  const isAdmin = user?.cargo === 'ADMIN';

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(os.tempo_bancada_segundos || 0);

  const [laudo, setLaudo] = useState(os.laudo_tecnico || '');
  
  // Serviços de Mão de Obra e Procedimentos
  const [servicos, setServicos] = useState<ServicoItem[]>([
    { id: '1', nome: 'Mão de Obra / Diagnóstico Técnico', valor: os.orcamento_valor || 0 }
  ]);
  const [novoServicoNome, setNovoServicoNome] = useState('');
  const [novoServicoValor, setNovoServicoValor] = useState('');

  let initialPecas: PecaItem[] = [];
  try {
    initialPecas = typeof os.pecas_utilizadas === 'string' ? JSON.parse(os.pecas_utilizadas || '[]') : os.pecas_utilizadas || [];
  } catch {
    initialPecas = [];
  }

  const [pecas, setPecas] = useState<PecaItem[]>(initialPecas);
  const [catalogoEstoque, setCatalogoEstoque] = useState<any[]>([]);
  const [selectedEstoqueId, setSelectedEstoqueId] = useState<string>('');

  const [novaPecaNome, setNovaPecaNome] = useState('');
  const [novaPecaPrecoVenda, setNovaPecaPrecoVenda] = useState('');
  const [novaPecaPrecoCusto, setNovaPecaPrecoCusto] = useState('');
  const [novaPecaQtd, setNovaPecaQtd] = useState('1');

  const [checklistSaida, setChecklistSaida] = useState<Record<string, boolean>>({
    defeito_resolvido: true,
    limpeza_interna: true,
    testes_estresse_ok: true,
    lacre_garantia_aplicado: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega itens do estoque para o dropdown
  useEffect(() => {
    fetch('/api/estoque', {
      headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.itens) setCatalogoEstoque(data.itens);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Cálculos Financeiros em Tempo Real
  const totalMaoDeObra = servicos.reduce((acc, s) => acc + (s.valor || 0), 0);
  const totalPecasVenda = pecas.reduce((acc, p) => acc + ((p.preco_venda || p.preco || 0) * (p.quantidade || 1)), 0);
  const totalPecasCusto = pecas.reduce((acc, p) => acc + ((p.preco_custo || 0) * (p.quantidade || 1)), 0);
  const valorTotalFinal = totalMaoDeObra + totalPecasVenda;
  const lucroTotalOS = Math.max(0, valorTotalFinal - totalPecasCusto);
  const margemLucro = valorTotalFinal > 0 ? ((lucroTotalOS / valorTotalFinal) * 100).toFixed(1) : '100';

  // Inserção de Serviços / Mão de Obra
  const handleAddServico = () => {
    if (!novoServicoNome.trim() || !novoServicoValor) return;
    const val = parseFloat(novoServicoValor) || 0;
    setServicos([
      ...servicos,
      {
        id: Date.now().toString(),
        nome: novoServicoNome.trim(),
        valor: val
      }
    ]);
    setNovoServicoNome('');
    setNovoServicoValor('');
  };

  const handleAddPresetServico = (nome: string, valorSugerido: number) => {
    setServicos([
      ...servicos,
      {
        id: Date.now().toString(),
        nome,
        valor: valorSugerido
      }
    ]);
  };

  const handleRemoveServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id));
  };

  const handleUpdateServicoValor = (id: string, novoValorStr: string) => {
    const val = parseFloat(novoValorStr) || 0;
    setServicos(servicos.map(s => s.id === id ? { ...s, valor: val } : s));
  };

  // Inserção de Peças do Estoque / Avulsas
  const handleSelectEstoque = (itemIdStr: string) => {
    setSelectedEstoqueId(itemIdStr);
    if (!itemIdStr) return;

    const item = catalogoEstoque.find(i => String(i.id) === itemIdStr);
    if (item) {
      setNovaPecaNome(item.nome);
      setNovaPecaPrecoVenda(String(item.preco_venda));
      setNovaPecaPrecoCusto(String(item.preco_custo));
      setNovaPecaQtd('1');
    }
  };

  const handleAddPeca = () => {
    if (!novaPecaNome || !novaPecaPrecoVenda) return;
    
    const vVenda = parseFloat(novaPecaPrecoVenda) || 0;
    const vCusto = parseFloat(novaPecaPrecoCusto) || 0;
    const qtd = parseInt(novaPecaQtd) || 1;

    setPecas([
      ...pecas,
      {
        id: selectedEstoqueId ? parseInt(selectedEstoqueId) : undefined,
        nome: novaPecaNome.trim(),
        quantidade: qtd,
        preco: vVenda,
        preco_venda: vVenda,
        preco_custo: vCusto
      }
    ]);

    setSelectedEstoqueId('');
    setNovaPecaNome('');
    setNovaPecaPrecoVenda('');
    setNovaPecaPrecoCusto('');
    setNovaPecaQtd('1');
  };

  const handleRemovePeca = (index: number) => {
    setPecas(pecas.filter((_, i) => i !== index));
  };

  const handleSaveLaudoOnly = async (statusDestino?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/os/${os.id}/laudo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          laudo_tecnico: laudo,
          pecas_utilizadas: pecas,
          orcamento_valor: totalMaoDeObra,
          valor_final: valorTotalFinal,
          tempo_bancada_segundos: seconds,
          checklist_saida: checklistSaida
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar laudo.');
      }

      if (statusDestino) {
        await fetch(`/api/os/${os.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
          },
          body: JSON.stringify({
            status: statusDestino,
            observacao: `Laudo e orçamento técnico atualizados. Status movido para ${statusDestino}.`
          })
        });
      }

      if (onRefresh) onRefresh();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm px-3 py-1 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300">
              {os.codigo_os}
            </span>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand-400" />
                Bancada Técnica: {os.marca_modelo}
              </h3>
              <p className="text-xs text-slate-400">Cliente: <strong className="text-white">{os.cliente_nome}</strong> ({os.cliente_whatsapp || os.cliente_telefone})</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cronômetro de Bancada */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-white/10">
              <Clock className="w-4 h-4 text-brand-400" />
              <span className="font-mono font-bold text-xs text-white">
                {formatDuration(seconds)}
              </span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isTimerRunning 
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                }`}
                title={isTimerRunning ? 'Pausar Cronômetro' : 'Iniciar Cronômetro'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300">
              {error}
            </div>
          )}

          {/* Queixa do Cliente */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Queixa / Defeito Relatado pelo Cliente:
            </span>
            <p className="text-slate-200 font-medium">{os.defeito_relatado}</p>
            {os.condicoes_visuais && (
              <p className="text-[11px] text-slate-400 italic mt-1">Avarias pré-existentes: {os.condicoes_visuais}</p>
            )}
          </div>

          {/* Diagnóstico e Laudo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-brand-400" />
                Diagnóstico & Laudo Técnico do Especialista
              </label>
              <span className="text-[11px] text-slate-400">Descreva o defeito diagnosticado e a solução necessária</span>
            </div>
            <textarea
              rows={3}
              placeholder="Ex: Identificado curto-circuito no circuito de alimentação primária (linha de 19V). Realizada substituição dos mosfets e limpeza térmica..."
              value={laudo}
              onChange={(e) => setLaudo(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none text-xs leading-relaxed"
            />

            {/* Sugestões Rápidas de Laudo */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-semibold self-center mr-1">Inserir Rápido:</span>
              {[
                'Troca de Display / Tela Frontal',
                'Substituição de Conector de Carga',
                'Desoxidação e Banho Químico em Ultrassom',
                'Troca de Bateria com Calibração',
                'Limpeza Interna e Troca de Pasta Térmica',
                'Formatação e Reinstalação de Sistema',
                'Reballing / Reparo em Placa Mãe',
                'Substituição de Porta HDMI SMD'
              ].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setLaudo(prev => prev ? `${prev}. ${sug}` : sug)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-white/10 text-[10px] transition-colors cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* MÃO DE OBRA & SERVIÇOS TÉCNICOS (COM TOTAL AUTONOMIA PARA O TÉCNICO) */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-brand-500/30">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-brand-400" />
                Mão de Obra & Serviços Técnicos Executados
              </h4>
              <span className="text-[11px] text-brand-300 font-bold">
                Total Serviços: {formatCurrency(totalMaoDeObra)}
              </span>
            </div>

            {/* Sugestões Rápidas de Serviços com Valores */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Atalhos de Serviços:</span>
              {[
                { nome: 'Troca de Conector de Carga', val: 90 },
                { nome: 'Desoxidação / Banho Químico', val: 120 },
                { nome: 'Limpeza Preventiva + Pasta Térmica', val: 120 },
                { nome: 'Formatação + Windows & Drivers', val: 100 },
                { nome: 'Reparo / Solda em Placa Mãe', val: 250 },
                { nome: 'Troca de Porta HDMI Console', val: 200 }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPresetServico(preset.nome, preset.val)}
                  className="px-2.5 py-1 rounded-xl bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-[10.5px] font-medium transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{preset.nome}</span>
                  <strong className="text-white">({formatCurrency(preset.val)})</strong>
                </button>
              ))}
            </div>

            {/* Input para Adição Livre de Qualquer Serviço */}
            <div className="grid grid-cols-12 gap-2 items-center pt-1">
              <input
                type="text"
                placeholder="Nome do Serviço / Mão de Obra (Ex: Troca de carcaça, Reballing...)"
                value={novoServicoNome}
                onChange={(e) => setNovoServicoNome(e.target.value)}
                className="col-span-8 px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor R$"
                value={novoServicoValor}
                onChange={(e) => setNovoServicoValor(e.target.value)}
                className="col-span-3 px-3 py-2 rounded-xl bg-navy-950 border border-brand-500/40 text-emerald-400 font-bold placeholder-slate-600 focus:outline-none text-center"
              />
              <button
                type="button"
                onClick={handleAddServico}
                className="col-span-1 p-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-glow-teal"
                title="Adicionar Serviço"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Serviços Adicionados */}
            <div className="space-y-1.5 pt-1">
              {servicos.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <span className="font-semibold text-white">{s.nome}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">Valor:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={s.valor}
                      onChange={(e) => handleUpdateServicoValor(s.id, e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg bg-navy-950 border border-emerald-500/30 text-emerald-400 font-bold text-right text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveServico(s.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      title="Remover Serviço"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PEÇAS & COMPONENTES DO ESTOQUE */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-teal-400" />
                Peças Utilizadas & Componentes do Estoque
              </h4>
              <span className="text-[11px] text-slate-400">Puxe do estoque ou adicione avulsa</span>
            </div>

            {/* Seletor Rápido do Catálogo */}
            {catalogoEstoque.length > 0 && (
              <div className="p-2.5 rounded-xl bg-navy-950 border border-white/10 flex items-center gap-2">
                <span className="text-slate-400 text-[11px] shrink-0">Estoque:</span>
                <select
                  value={selectedEstoqueId}
                  onChange={(e) => handleSelectEstoque(e.target.value)}
                  className="w-full bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- Selecione uma peça cadastrada (SSD, Memória, Tela...) --</option>
                  {catalogoEstoque.map(item => (
                    <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                      [{item.categoria}] {item.nome} • Venda: {formatCurrency(item.preco_venda)} (Custo: {formatCurrency(item.preco_custo)}) • {item.quantidade} un em estoque
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Formulário de Adição de Peça */}
            <div className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                placeholder="Nome da Peça (ex: Tela OLED iPhone 13)"
                value={novaPecaNome}
                onChange={(e) => setNovaPecaNome(e.target.value)}
                className="col-span-5 px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
              />
              <input
                type="number"
                min="1"
                placeholder="Qtd"
                value={novaPecaQtd}
                onChange={(e) => setNovaPecaQtd(e.target.value)}
                className="col-span-2 px-2 py-2 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none text-center"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Custo R$"
                value={novaPecaPrecoCusto}
                onChange={(e) => setNovaPecaPrecoCusto(e.target.value)}
                className="col-span-2 px-2 py-2 rounded-xl bg-navy-950 border border-orange-500/30 text-orange-400 placeholder-slate-600 focus:border-orange-400 focus:outline-none text-center font-semibold"
                title="Preço de custo pago na peça"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Venda R$"
                value={novaPecaPrecoVenda}
                onChange={(e) => setNovaPecaPrecoVenda(e.target.value)}
                className="col-span-2 px-2 py-2 rounded-xl bg-navy-950 border border-emerald-500/30 text-emerald-400 placeholder-slate-600 focus:border-emerald-400 focus:outline-none text-center font-bold"
                title="Preço de venda cobrado no orçamento"
              />
              <button
                type="button"
                onClick={handleAddPeca}
                className="col-span-1 p-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Adicionar Peça"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Peças Adicionadas */}
            {pecas.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {pecas.map((p, i) => {
                  const custoUnit = p.preco_custo || 0;
                  const vendaUnit = p.preco_venda || p.preco || 0;
                  const lucroUnit = Math.max(0, vendaUnit - custoUnit);

                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <div>
                        <span className="font-bold text-white">{p.quantidade}x {p.nome}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5 space-x-2">
                          <span>Venda: <strong className="text-emerald-400">{formatCurrency(vendaUnit * p.quantidade)}</strong></span>
                          <span>Custo: <strong className="text-orange-400">{formatCurrency(custoUnit * p.quantidade)}</strong></span>
                          <span>Lucro Peça: <strong className="text-teal-300">+{formatCurrency(lucroUnit * p.quantidade)}</strong></span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePeca(i)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Remover Peça"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PAINEL DE APURAÇÃO FINANCEIRA & TOTAL DO CLIENTE */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-navy-950 to-slate-950 border-2 border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                {isAdmin ? 'Resumo Financeiro & Lucro da OS (Gestão)' : 'Composição do Orçamento'}
              </span>
              {isAdmin && (
                <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  Margem de Lucro: {margemLucro}%
                </span>
              )}
            </div>

            <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-4' : 'sm:grid-cols-2'} gap-3 items-center`}>
              
              {/* Total Serviços */}
              <div className="p-2.5 rounded-xl bg-brand-950/40 border border-brand-500/20 text-center">
                <span className="block text-brand-300 text-[10px] uppercase font-semibold">Total Serviços</span>
                <p className="font-black text-brand-400 text-sm mt-0.5">{formatCurrency(totalMaoDeObra)}</p>
              </div>

              {/* Total Peças Venda */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="block text-slate-400 text-[10px] uppercase">Peças (Venda)</span>
                <p className="font-bold text-white text-sm mt-0.5">{formatCurrency(totalPecasVenda)}</p>
              </div>

              {/* Métricas Internas de Custo e Lucro apenas para ADMIN */}
              {isAdmin && (
                <>
                  {/* Custo Total das Peças */}
                  <div className="p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/20 text-center">
                    <span className="block text-orange-300 text-[10px] uppercase">(-) Custo Peças</span>
                    <p className="font-bold text-orange-400 text-sm mt-0.5">{formatCurrency(totalPecasCusto)}</p>
                  </div>

                  {/* Lucro Líquido da OS */}
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center">
                    <span className="block text-emerald-300 text-[10px] uppercase font-bold">(=) Lucro Líquido</span>
                    <p className="font-black text-emerald-400 text-base mt-0.5">+{formatCurrency(lucroTotalOS)}</p>
                  </div>
                </>
              )}

            </div>

            {/* Total Cobrado do Cliente */}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">
                VALOR TOTAL DA OS: <strong className="text-white font-mono">{formatCurrency(totalMaoDeObra)} (Serviços) + {formatCurrency(totalPecasVenda)} (Peças)</strong>
              </span>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total a Pagar pelo Cliente:</span>
                <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                  {formatCurrency(valorTotalFinal)}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist de Saída & Qualidade */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-teal-400" />
              Checklist de Testes & Controle de Qualidade
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={checklistSaida.defeito_resolvido}
                  onChange={(e) => setChecklistSaida({ ...checklistSaida, defeito_resolvido: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-0"
                />
                <span>Defeito Resolvido</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={checklistSaida.limpeza_interna}
                  onChange={(e) => setChecklistSaida({ ...checklistSaida, limpeza_interna: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-0"
                />
                <span>Limpeza Interna Feita</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={checklistSaida.testes_estresse_ok}
                  onChange={(e) => setChecklistSaida({ ...checklistSaida, testes_estresse_ok: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-0"
                />
                <span>Testes de Estresse OK</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={checklistSaida.lacre_garantia_aplicado}
                  onChange={(e) => setChecklistSaida({ ...checklistSaida, lacre_garantia_aplicado: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-0"
                />
                <span>Lacre de Garantia OK</span>
              </label>
            </div>
          </div>

        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="p-5 border-t border-white/10 bg-navy-950 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer text-xs"
          >
            Cancelar / Fechar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveLaudoOnly()}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer text-xs"
            >
              💾 Salvar Laudo & Valores
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveLaudoOnly('AGUARDANDO_APROVACAO')}
              className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar para Aprovação</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveLaudoOnly('TESTES')}
              className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>🧪 Mover para Testes</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveLaudoOnly('CONCLUIDO')}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold transition-all cursor-pointer text-xs flex items-center gap-2 shadow-glow-teal"
            >
              <CheckCircle className="w-4 h-4" />
              <span>✅ Finalizar / Pronto</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};