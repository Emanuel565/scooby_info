import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  DollarSign
} from 'lucide-react';

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

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(os.tempo_bancada_segundos || 0);

  const [laudo, setLaudo] = useState(os.laudo_tecnico || '');
  const [orcamentoMaoDeObra, setOrcamentoMaoDeObra] = useState<string>(
    os.orcamento_valor ? os.orcamento_valor.toString() : '0'
  );

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
  const totalPecasVenda = pecas.reduce((acc, p) => acc + ((p.preco_venda || p.preco || 0) * (p.quantidade || 1)), 0);
  const totalPecasCusto = pecas.reduce((acc, p) => acc + ((p.preco_custo || 0) * (p.quantidade || 1)), 0);
  const maoDeObra = parseFloat(orcamentoMaoDeObra) || 0;
  const valorTotalFinal = totalPecasVenda + maoDeObra;
  const lucroTotalOS = Math.max(0, valorTotalFinal - totalPecasCusto);
  const margemLucro = valorTotalFinal > 0 ? ((lucroTotalOS / valorTotalFinal) * 100).toFixed(1) : '100';

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
          orcamento_valor: maoDeObra,
          valor_final: valorTotalFinal,
          tempo_bancada_segundos: seconds,
          checklist_saida: checklistSaida
        })
      });

      if (!res.ok) throw new Error('Erro ao salvar laudo');

      if (statusDestino && statusDestino !== os.status) {
        await fetch(`/api/os/${os.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
          },
          body: JSON.stringify({ status: statusDestino })
        });
      }

      if (onRefresh) onRefresh();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-scale-in">
        
        {/* Header com Cronômetro e Código */}
        <div className="flex flex-wrap items-center justify-between p-5 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base px-3 py-1 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300">
              {os.codigo_os}
            </span>
            <div>
              <h3 className="font-bold text-white text-sm">{os.marca_modelo}</h3>
              <p className="text-[11px] text-slate-400">Cliente: {os.cliente_nome} • {os.cliente_whatsapp || os.cliente_telefone}</p>
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
              placeholder="Ex: Identificado curto-circuito no circuito de alimentação primária (linha de 19V). Necessária substituição dos mosfets de entrada e limpeza química da placa..."
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
                'Reset de Almofadas e Limpeza de Bicos de Impressão',
                'Troca de Cabeçote / Tracionador de Papel'
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

          {/* Peças e Integração com Estoque */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-brand-400" />
                Peças Utilizadas & Componentes do Estoque
              </h4>
              <span className="text-[11px] text-slate-400">Puxe direto do estoque ou digite manualmente</span>
            </div>

            {/* Seletor Rápido do Catálogo */}
            {catalogoEstoque.length > 0 && (
              <div className="p-2.5 rounded-xl bg-navy-950 border border-white/10 flex items-center gap-2">
                <span className="text-slate-400 text-[11px] shrink-0">Puxar do Estoque:</span>
                <select
                  value={selectedEstoqueId}
                  onChange={(e) => handleSelectEstoque(e.target.value)}
                  className="w-full bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- Selecione uma peça cadastrada no estoque (SSD, Memória, Tela...) --</option>
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
                placeholder="Nome da Peça (ex: SSD 240GB Kingston)"
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
                placeholder="Custo (R$)"
                value={novaPecaPrecoCusto}
                onChange={(e) => setNovaPecaPrecoCusto(e.target.value)}
                className="col-span-2 px-2 py-2 rounded-xl bg-navy-950 border border-orange-500/30 text-orange-400 placeholder-slate-600 focus:border-orange-400 focus:outline-none text-center"
                title="Preço de custo pago na peça"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Venda (R$)"
                value={novaPecaPrecoVenda}
                onChange={(e) => setNovaPecaPrecoVenda(e.target.value)}
                className="col-span-2 px-2 py-2 rounded-xl bg-navy-950 border border-emerald-500/30 text-emerald-400 placeholder-slate-600 focus:border-emerald-400 focus:outline-none text-center"
                title="Preço de venda cobrado no orçamento"
              />
              <button
                type="button"
                onClick={handleAddPeca}
                className="col-span-1 p-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors cursor-pointer"
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
                          <span>Lucro da Peça: <strong className="text-teal-300">+{formatCurrency(lucroUnit * p.quantidade)}</strong></span>
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

          {/* PAINEL DE APURAÇÃO FINANCEIRA & LUCRO DA OS (O CORAÇÃO DO CÁLCULO) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-navy-950 to-slate-950 border-2 border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Composição do Orçamento & Lucro da OS
              </span>
              <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                Margem: {margemLucro}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              
              {/* Mão de Obra */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Mão de Obra (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={orcamentoMaoDeObra}
                  onChange={(e) => setOrcamentoMaoDeObra(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-bold focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Total Peças Venda */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="block text-slate-400 text-[10px] uppercase">Peças (Venda)</span>
                <p className="font-bold text-white text-sm mt-0.5">{formatCurrency(totalPecasVenda)}</p>
              </div>

              {/* Custo Total das Peças */}
              <div className="p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/20 text-center">
                <span className="block text-orange-300 text-[10px] uppercase">(-) Custo Peças</span>
                <p className="font-bold text-orange-400 text-sm mt-0.5">{formatCurrency(totalPecasCusto)}</p>
              </div>

              {/* Lucro Líquido da OS */}
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center">
                <span className="block text-emerald-300 text-[10px] uppercase font-bold">(=) Lucro Líquido OS</span>
                <p className="font-black text-emerald-400 text-base mt-0.5">+{formatCurrency(lucroTotalOS)}</p>
              </div>

            </div>

            {/* Linha Final de Total Cobrado do Cliente */}
            <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-white/10 text-xs">
              <span className="font-bold text-slate-300">Total a Cobrar do Cliente (Peças + Mão de Obra):</span>
              <span className="font-black text-white text-base">{formatCurrency(valorTotalFinal)}</span>
            </div>

          </div>

          {/* Checklist de Saída */}
          <div className="space-y-2 p-3 bg-slate-950/50 rounded-xl border border-white/5">
            <h4 className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-brand-400" />
              Checklist de Testes & Garantia de Bancada
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              {Object.entries(checklistSaida).map(([key, val]) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => setChecklistSaida({ ...checklistSaida, [key]: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-navy-950/80 rounded-b-3xl">
          
          <button
            type="button"
            onClick={() => handleSaveLaudoOnly(os.status)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Apenas Salvar Dados
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveLaudoOnly('AGUARDANDO_APROVACAO')}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              title="Coloca a OS no status Aguardando Aprovação para o balcão contatar o cliente"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar para Aprovação do Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveLaudoOnly('CONCLUIDO')}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs shadow-glow-teal flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Concluir Reparo (Pronto para Retirada)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};