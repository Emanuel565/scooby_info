import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ItemEstoque, CondicaoProduto } from '../types';
import { formatCurrency } from '../utils/formatters';
import * as XLSX from 'xlsx';
import { 
  Package, 
  Plus, 
  Search, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  HardDrive, 
  Cpu, 
  Smartphone, 
  BatteryCharging, 
  Cable, 
  Wrench, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  MinusCircle, 
  DownloadCloud, 
  Check, 
  X,
  Layers,
  FileSpreadsheet,
  Upload,
  Download,
  Laptop,
  Tag,
  ShieldCheck
} from 'lucide-react';

interface MetricasEstoque {
  totalProdutosCadastrados: number;
  totalUnidadesEstoque: number;
  custoTotalEstoque: number;
  valorTotalVendaEstoque: number;
  lucroPotencialEstoque: number;
  itensBaixoEstoque: number;
  totalNovos?: number;
  totalUsados?: number;
}

export const AdminEstoque: React.FC = () => {
  const { user } = useAuth();
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [metricas, setMetricas] = useState<MetricasEstoque | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
  const [condicaoFiltro, setCondicaoFiltro] = useState<'TODAS' | 'NOVO' | 'USADO'>('TODAS');

  // Modais de Criação / Edição
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemEstoque | null>(null);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('SSD');
  const [condicao, setCondicao] = useState<CondicaoProduto>('NOVO');
  const [quantidade, setQuantidade] = useState('5');
  const [estoqueMinimo, setEstoqueMinimo] = useState('2');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [garantiaMeses, setGarantiaMeses] = useState('3');
  const [detalhesCondicao, setDetalhesCondicao] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modal de Importação de Planilha Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importingFile, setImportingFile] = useState(false);
  const [importSummary, setImportSummary] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEstoque = async () => {
    setLoading(true);
    try {
      let url = `/api/estoque?categoria=${categoriaFiltro}&condicao=${condicaoFiltro}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      setItens(data.itens || []);
      setMetricas(data.metricas || null);
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstoque();
  }, [categoriaFiltro, condicaoFiltro]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEstoque();
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setNome('');
    setCategoria('SSD');
    setCondicao('NOVO');
    setQuantidade('5');
    setEstoqueMinimo('2');
    setPrecoCusto('');
    setPrecoVenda('');
    setCodigoBarras('');
    setNumeroSerie('');
    setGarantiaMeses('12');
    setDetalhesCondicao('');
    setLocalizacao('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item: ItemEstoque) => {
    setEditingItem(item);
    setNome(item.nome);
    setCategoria(item.categoria);
    setCondicao(item.condicao || 'NOVO');
    setQuantidade(String(item.quantidade));
    setEstoqueMinimo(String(item.estoque_minimo));
    setPrecoCusto(String(item.preco_custo));
    setPrecoVenda(String(item.preco_venda));
    setCodigoBarras(item.codigo_barras || '');
    setNumeroSerie(item.numero_serie || '');
    setGarantiaMeses(String(item.garantia_meses || 3));
    setDetalhesCondicao(item.detalhes_condicao || '');
    setLocalizacao(item.localizacao || '');
    setShowModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        nome: nome.trim(),
        categoria,
        condicao,
        quantidade: parseInt(quantidade) || 0,
        estoque_minimo: parseInt(estoqueMinimo) || 2,
        preco_custo: parseFloat(precoCusto) || 0,
        preco_venda: parseFloat(precoVenda) || 0,
        codigo_barras: codigoBarras.trim() || null,
        numero_serie: numeroSerie.trim() || null,
        garantia_meses: parseInt(garantiaMeses) || 3,
        detalhes_condicao: detalhesCondicao.trim() || null,
        localizacao: localizacao.trim() || null
      };

      const url = editingItem ? `/api/estoque/${editingItem.id}` : '/api/estoque';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar item');

      setShowModal(false);
      setFeedbackMsg(editingItem ? 'Item atualizado com sucesso!' : 'Novo item adicionado ao estoque!');
      setTimeout(() => setFeedbackMsg(null), 3000);
      fetchEstoque();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAjusteQtd = async (item: ItemEstoque, delta: number) => {
    try {
      const res = await fetch(`/api/estoque/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({ ajuste_quantidade: delta })
      });
      if (res.ok) {
        fetchEstoque();
      }
    } catch (err) {
      console.error('Erro ao ajustar quantidade:', err);
    }
  };

  const handleDeleteItem = async (item: ItemEstoque) => {
    if (!window.confirm(`Deseja realmente excluir "${item.nome}" do estoque?`)) return;

    try {
      const res = await fetch(`/api/estoque/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      if (res.ok) {
        setFeedbackMsg(`Item "${item.nome}" excluído do estoque.`);
        setTimeout(() => setFeedbackMsg(null), 3000);
        fetchEstoque();
      }
    } catch (err) {
      console.error('Erro ao deletar item:', err);
    }
  };

  // Processamento do Arquivo Excel Selecionado
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
        setImportRows(rows);
        setImportSummary(null);
      } catch (error) {
        alert('Erro ao ler a planilha. Certifique-se de que é um arquivo .xlsx, .xls ou .csv válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Envia os itens lidos para o backend
  const handleConfirmImport = async () => {
    if (importRows.length === 0) return;

    setImportingFile(true);
    try {
      const res = await fetch('/api/estoque/importar-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({ items: importRows })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao importar planilha');

      setImportSummary(data);
      setFeedbackMsg(data.message);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchEstoque();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setImportingFile(false);
    }
  };

  // Exportar Catálogo em Excel
  const handleExportExcel = async () => {
    try {
      const res = await fetch('/api/estoque/exportar-excel', {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Estoque_Scooby_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Erro ao baixar planilha do estoque.');
    }
  };

  const handleImportarPadroes = async () => {
    if (!window.confirm('Deseja importar o catálogo padrão de peças e notebooks usados mais frequentes?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/estoque/importar-padroes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      setFeedbackMsg(data.message);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchEstoque();
    } catch (err) {
      console.error('Erro ao importar padrões:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'NOTEBOOK': return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'SSD': return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'MEMORIA': return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'TELA': return <Smartphone className="w-4 h-4 text-teal-400" />;
      case 'BATERIA': return <BatteryCharging className="w-4 h-4 text-amber-400" />;
      case 'CONECTOR': return <Cable className="w-4 h-4 text-indigo-400" />;
      default: return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const categorias = [
    { id: 'TODAS', label: 'Todas as Categorias' },
    { id: 'NOTEBOOK', label: '💻 Notebooks' },
    { id: 'SSD', label: '💾 SSDs' },
    { id: 'MEMORIA', label: '🧠 Memórias RAM' },
    { id: 'PLACA_MAE', label: '🔌 Placas-mãe' },
    { id: 'PLACA_VIDEO', label: '🎮 Placas de Vídeo' },
    { id: 'TELA', label: '📱 Telas & Displays' },
    { id: 'BATERIA', label: '🔋 Baterias' },
    { id: 'CONECTOR', label: '🔌 Conectores & Cabos' },
    { id: 'INSUMO', label: '🧪 Insumos & Tintas' },
    { id: 'OUTRO', label: 'Outros' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-400" />
              Estoque: Produtos Novos, Usados & Peças
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold uppercase">
              Gerencial & PDV
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controle de inventário de notebooks seminovos, peças, acessórios e insumos com apuração de custos e lucros.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* Botão Exportar Excel */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Baixar planilha completa do estoque"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Excel</span>
          </button>

          {/* Botão Importar Excel */}
          <button
            onClick={() => { setShowImportModal(true); setImportRows([]); setImportSummary(null); }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-sky-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Importar planilha de produtos em massa"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            <span>Importar Excel / CSV</span>
          </button>

          {/* Botão Novo Item */}
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow-teal flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-slide-up">
          <Check className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Cards de Métricas de Estoque & Capital */}
      {metricas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Saldo em Estoque</span>
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{metricas.totalUnidadesEstoque} un</p>
              <p className="text-[11px] text-slate-400 mt-1">
                ✨ {metricas.totalNovos || 0} Novos • 🏷️ {metricas.totalUsados || 0} Usados
              </p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Capital Investido (Custo)</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-orange-400 font-mono">{formatCurrency(metricas.custoTotalEstoque)}</p>
              <p className="text-[11px] text-slate-400 mt-1">Custo total das peças e aparelhos</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Potencial de Venda (Bruto)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400 font-mono">{formatCurrency(metricas.valorTotalVendaEstoque)}</p>
              <p className="text-[11px] text-teal-300 mt-1 font-semibold">
                Lucro estimado: +{formatCurrency(metricas.lucroPotencialEstoque)}
              </p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Reposição Urgente</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${metricas.itensBaixoEstoque > 0 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-400 font-mono">{metricas.itensBaixoEstoque}</p>
              <p className="text-[11px] text-slate-400 mt-1">Itens no estoque mínimo ou zerados</p>
            </div>
          </div>

        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="glass-card rounded-3xl p-4 border-white/5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Abas Novos / Usados */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setCondicaoFiltro('TODAS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                condicaoFiltro === 'TODAS' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({itens.length})
            </button>
            <button
              type="button"
              onClick={() => setCondicaoFiltro('NOVO')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                condicaoFiltro === 'NOVO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ Novos
            </button>
            <button
              type="button"
              onClick={() => setCondicaoFiltro('USADO')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                condicaoFiltro === 'USADO' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏷️ Usados / Seminovos
            </button>
          </div>

          {/* Busca por Texto */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome, código, serial ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-brand-500 focus:outline-none"
            />
          </form>
        </div>

        {/* Tags de Categorias */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                categoriaFiltro === cat.id
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="glass-card rounded-3xl border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Produto & Categoria</th>
                <th className="py-3 px-3 text-center">Condição</th>
                <th className="py-3 px-3 text-center">Saldo</th>
                <th className="py-3 px-3">Custo Unit.</th>
                <th className="py-3 px-3">Venda Unit.</th>
                <th className="py-3 px-3">Margem / Lucro</th>
                <th className="py-3 px-3">Garantia / Local</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {itens.map((item) => {
                const isUsado = item.condicao === 'USADO' || item.condicao === 'SEMINOVO';
                const isBaixoEstoque = item.quantidade <= item.estoque_minimo;
                const margemItem = item.preco_venda - item.preco_custo;

                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                          {getCategoryIcon(item.categoria)}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{item.nome}</span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{item.categoria}</span>
                            {item.numero_serie && (
                              <span>• Serial: <strong className="text-slate-300 font-mono">{item.numero_serie}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                        isUsado 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {isUsado ? 'USADO' : 'NOVO'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-white/10">
                        <button
                          onClick={() => handleAjusteQtd(item, -1)}
                          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                          title="Diminuir 1"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                        <span className={`font-mono font-bold px-1 ${isBaixoEstoque ? 'text-rose-400 font-black' : 'text-white'}`}>
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => handleAjusteQtd(item, 1)}
                          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                          title="Adicionar 1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-orange-400 font-semibold">
                      {formatCurrency(item.preco_custo)}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {formatCurrency(item.preco_venda)}
                    </td>

                    <td className="py-3 px-3 font-mono text-teal-300 font-semibold">
                      +{formatCurrency(margemItem)}
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      <div>
                        <span>🛡️ {item.garantia_meses} meses</span>
                        {item.localizacao && (
                          <span className="block text-[10px] text-slate-500">📍 {item.localizacao}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {itens.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum produto cadastrado no momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro / Edição de Produto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl animate-slide-up space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-400" />
                {editingItem ? 'Editar Produto / Peça' : 'Cadastrar Novo Produto'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              
              {/* Condição: Novo ou Usado */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Condição do Produto *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCondicao('NOVO'); setGarantiaMeses('12'); }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      condicao === 'NOVO'
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-white/10'
                    }`}
                  >
                    ✨ Produto Novo (Lacrado)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCondicao('USADO'); setGarantiaMeses('3'); }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      condicao === 'USADO'
                        ? 'bg-amber-600/30 text-amber-300 border-amber-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-white/10'
                    }`}
                  >
                    🏷️ Produto Usado / Seminovo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome / Descrição do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Notebook Dell Latitude Core i5 8GB SSD 256GB ou SSD Kingston 480GB"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoria *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="NOTEBOOK">💻 Notebook</option>
                    <option value="PC_DESKTOP">🖥️ PC Desktop</option>
                    <option value="SSD">💾 SSD</option>
                    <option value="MEMORIA">🧠 Memória RAM</option>
                    <option value="PLACA_MAE">🔌 Placa-mãe</option>
                    <option value="PLACA_VIDEO">🎮 Placa de Vídeo</option>
                    <option value="TELA">📱 Tela / Display</option>
                    <option value="BATERIA">🔋 Bateria</option>
                    <option value="CARREGADOR">⚡ Carregador / Fonte</option>
                    <option value="CELULAR">📱 Smartphone</option>
                    <option value="INSUMO">🧪 Insumo / Tinta</option>
                    <option value="ACESSORIO">🎧 Acessório</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Localização (Gaveta / Vitrine)</label>
                  <input
                    type="text"
                    placeholder="Ex: Vitrine 1, Gaveta A2"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Estoque Mín.</label>
                  <input
                    type="number"
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preço Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precoCusto}
                    onChange={(e) => setPrecoCusto(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-orange-400 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-emerald-400 font-bold font-mono"
                  />
                </div>
              </div>

              {/* Campos Especiais para Usados e Rastreabilidade */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nº de Série / IMEI (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Serial do notebook ou componente"
                    value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Garantia (Meses)</label>
                  <input
                    type="number"
                    value={garantiaMeses}
                    onChange={(e) => setGarantiaMeses(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              {condicao === 'USADO' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Detalhes da Condição / Estado de Uso</label>
                  <input
                    type="text"
                    placeholder="Ex: Bateria com 88% de saúde, pequenas marcas na tampa, testado 100%"
                    value={detalhesCondicao}
                    onChange={(e) => setDetalhesCondicao(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-white/10 text-amber-200"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-glow-teal"
                >
                  {submitting ? 'Salvando...' : 'Salvar no Estoque'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal de Importação de Planilha Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl animate-slide-up space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Importar Catálogo de Produtos em Massa (Excel / CSV)
              </h3>
              <button 
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Selecione sua planilha de produtos (<code className="text-brand-300 font-mono">.xlsx</code>, <code className="text-brand-300 font-mono">.xls</code> ou <code className="text-brand-300 font-mono">.csv</code>). 
                O sistema reconhece automaticamente as colunas: <strong>Nome, Categoria, Condição (Novo/Usado), Quantidade, Preço Custo, Preço Venda e Localização</strong>.
              </p>

              {/* Área de Seleção do Arquivo */}
              <div className="p-6 border-2 border-dashed border-white/20 hover:border-emerald-500 rounded-2xl text-center bg-slate-950/60 transition-colors flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-emerald-400" />
                <label className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all shadow-md">
                  <span>Selecionar Planilha Excel</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-500">ou arraste e solte o arquivo aqui</span>
              </div>

              {/* Pré-visualização da Planilha */}
              {importRows.length > 0 && !importSummary && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-xs">
                      ✅ {importRows.length} produtos identificados na planilha:
                    </span>
                    <button
                      type="button"
                      disabled={importingFile}
                      onClick={handleConfirmImport}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-glow-teal transition-all cursor-pointer"
                    >
                      {importingFile ? 'Importando...' : 'Confirmar & Salvar no Banco'}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-black/40">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-950 text-slate-400 sticky top-0">
                        <tr>
                          <th className="p-2">Nome</th>
                          <th className="p-2">Categoria</th>
                          <th className="p-2">Qtd</th>
                          <th className="p-2">Custo</th>
                          <th className="p-2">Venda</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {importRows.slice(0, 15).map((r, i) => (
                          <tr key={i}>
                            <td className="p-2 font-semibold text-white">{r['Nome'] || r['NOME'] || r['Produto'] || 'Item'}</td>
                            <td className="p-2">{r['Categoria'] || r['CATEGORIA'] || 'OUTRO'}</td>
                            <td className="p-2 font-mono">{r['Quantidade'] || r['Qtd'] || 1}</td>
                            <td className="p-2 font-mono text-orange-400">R$ {r['Preço Custo'] || r['Custo'] || 0}</td>
                            <td className="p-2 font-mono text-emerald-400">R$ {r['Preço Venda'] || r['Venda'] || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Resumo pós-importação */}
              {importSummary && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <h4 className="font-bold text-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Importação Concluída com Sucesso!
                  </h4>
                  <p className="text-xs">
                    • <strong>{importSummary.criados}</strong> novos produtos cadastrados.<br />
                    • <strong>{importSummary.atualizados}</strong> produtos existentes atualizados.
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};