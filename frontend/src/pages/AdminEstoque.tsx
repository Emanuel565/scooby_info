import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
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
  Layers
} from 'lucide-react';

interface ItemEstoque {
  id: number;
  nome: string;
  categoria: string;
  quantidade: number;
  estoque_minimo: number;
  preco_custo: number;
  preco_venda: number;
  codigo_barras?: string;
  localizacao?: string;
  updatedAt: string;
}

interface MetricasEstoque {
  totalProdutosCadastrados: number;
  totalUnidadesEstoque: number;
  custoTotalEstoque: number;
  valorTotalVendaEstoque: number;
  lucroPotencialEstoque: number;
  itensBaixoEstoque: number;
}

export const AdminEstoque: React.FC = () => {
  const { user } = useAuth();
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [metricas, setMetricas] = useState<MetricasEstoque | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

  // Modais
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemEstoque | null>(null);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('SSD');
  const [quantidade, setQuantidade] = useState('5');
  const [estoqueMinimo, setEstoqueMinimo] = useState('2');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchEstoque = async () => {
    setLoading(true);
    try {
      let url = `/api/estoque?categoria=${categoriaFiltro}`;
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
  }, [categoriaFiltro]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEstoque();
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setNome('');
    setCategoria('SSD');
    setQuantidade('5');
    setEstoqueMinimo('2');
    setPrecoCusto('');
    setPrecoVenda('');
    setLocalizacao('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item: ItemEstoque) => {
    setEditingItem(item);
    setNome(item.nome);
    setCategoria(item.categoria);
    setQuantidade(String(item.quantidade));
    setEstoqueMinimo(String(item.estoque_minimo));
    setPrecoCusto(String(item.preco_custo));
    setPrecoVenda(String(item.preco_venda));
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
        quantidade: parseInt(quantidade) || 0,
        estoque_minimo: parseInt(estoqueMinimo) || 2,
        preco_custo: parseFloat(precoCusto) || 0,
        preco_venda: parseFloat(precoVenda) || 0,
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

  const handleImportarPadroes = async () => {
    if (!window.confirm('Deseja importar o catálogo padrão de peças mais usadas (SSDs, Memórias, Telas, Insumos)?')) return;

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
      case 'SSD': return <HardDrive className="w-4 h-4 text-sky-400" />;
      case 'MEMORIA': return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'TELA': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'BATERIA': return <BatteryCharging className="w-4 h-4 text-amber-400" />;
      case 'CONECTOR': return <Cable className="w-4 h-4 text-teal-400" />;
      default: return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const categorias = [
    { id: 'TODAS', label: 'Todas as Peças' },
    { id: 'SSD', label: 'SSDs' },
    { id: 'MEMORIA', label: 'Memórias RAM' },
    { id: 'TELA', label: 'Telas & Displays' },
    { id: 'BATERIA', label: 'Baterias' },
    { id: 'CONECTOR', label: 'Conectores & Cabos' },
    { id: 'INSUMO', label: 'Insumos & Tintas' },
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
              Controle de Estoque, Peças & Custo
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold uppercase">
              Gerencial
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre peças com preço de custo e venda para compor os orçamentos e apurar o lucro real de cada OS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleImportarPadroes}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-brand-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Cadastra automaticamente SSDs, Memórias, Telas e Insumos frequentes"
          >
            <DownloadCloud className="w-4 h-4 text-brand-400" />
            <span>Importar Mais Usados</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow-teal flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Item no Estoque</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-slide-up">
          <Check className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 4 Cards de Métricas de Estoque & Capital */}
      {metricas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Quantidade em Estoque */}
          <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Saldo em Estoque</span>
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">
                {metricas.totalUnidadesEstoque} <span className="text-xs font-normal text-slate-400">unidades</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {metricas.totalProdutosCadastrados} modelos cadastrados
              </p>
            </div>
          </div>

          {/* Card 2: Custo Total Investido */}
          <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Custo Total Investido</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-orange-400 tracking-tight">
                {formatCurrency(metricas.custoTotalEstoque)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Capital imobilizado em peças
              </p>
            </div>
          </div>

          {/* Card 3: Valor de Venda Projetado */}
          <div className="glass-card rounded-3xl p-5 border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Valor Projetado de Venda</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400 tracking-tight">
                {formatCurrency(metricas.valorTotalVendaEstoque)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Faturamento bruto potencial
              </p>
            </div>
          </div>

          {/* Card 4: Lucro Potencial do Estoque */}
          <div className="glass-card rounded-3xl p-5 border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Lucro Potencial</span>
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-teal-300 tracking-tight">
                {formatCurrency(metricas.lucroPotencialEstoque)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {metricas.itensBaixoEstoque > 0 ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {metricas.itensBaixoEstoque} itens em estoque baixo
                  </span>
                ) : (
                  'Nível de estoque equilibrado'
                )}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Barra de Filtros & Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Categorias */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoriaFiltro === cat.id
                  ? 'bg-brand-500 text-white shadow-glow-teal'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Campo de Busca */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, categoria, local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-brand-500 focus:outline-none"
          />
        </form>

      </div>

      {/* Tabela de Itens */}
      <div className="glass-card rounded-3xl p-6 border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-400" />
            Catálogo de Itens Cadastrados ({itens.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-3" />
            Carregando catálogo de estoque...
          </div>
        ) : itens.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <Package className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
            <p>Nenhum item encontrado no estoque.</p>
            <button
              onClick={handleImportarPadroes}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow-teal transition-all"
            >
              📥 Importar Itens Mais Usados Agora
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-3 px-3 font-semibold">Peça / Produto</th>
                  <th className="py-3 px-3 font-semibold">Categoria</th>
                  <th className="py-3 px-3 font-semibold text-center">Quantidade</th>
                  <th className="py-3 px-3 font-semibold text-right">Preço de Custo</th>
                  <th className="py-3 px-3 font-semibold text-right">Preço de Venda</th>
                  <th className="py-3 px-3 font-semibold text-right">Lucro Unitário</th>
                  <th className="py-3 px-3 font-semibold">Localização</th>
                  <th className="py-3 px-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {itens.map((item) => {
                  const lucroUnitario = item.preco_venda - item.preco_custo;
                  const isBaixo = item.quantidade <= item.estoque_minimo;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                            {getCategoryIcon(item.categoria)}
                          </div>
                          <span>{item.nome}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
                          {item.categoria}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleAjusteQtd(item, -1)}
                            disabled={item.quantidade <= 0}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Subtrair 1 unidade"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>

                          <span className={`font-mono font-black text-sm px-2 py-0.5 rounded-md ${
                            isBaixo 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {item.quantidade} un
                          </span>

                          <button
                            onClick={() => handleAjusteQtd(item, 1)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                            title="Adicionar 1 unidade"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-orange-400">
                        {formatCurrency(item.preco_custo)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatCurrency(item.preco_venda)}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-emerald-400">
                        +{formatCurrency(lucroUnitario)}
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {item.localizacao || '—'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-500/20 text-slate-400 hover:text-brand-300 transition-colors cursor-pointer"
                            title="Editar Dados da Peça"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Excluir Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição de Item */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-400" />
                {editingItem ? 'Editar Peça / Produto' : 'Cadastrar Nova Peça no Estoque'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              
              {/* Nome */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nome da Peça / Modelo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SSD 240GB Kingston SATA III"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Categoria e Localização */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Categoria *</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none cursor-pointer"
                  >
                    <option value="SSD">SSD</option>
                    <option value="MEMORIA">Memória RAM</option>
                    <option value="TELA">Tela / Display</option>
                    <option value="BATERIA">Bateria</option>
                    <option value="CONECTOR">Conector / Cabo</option>
                    <option value="INSUMO">Insumo / Pasta Térmica</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Local na Loja / Gaveta</label>
                  <input
                    type="text"
                    placeholder="Ex: Armário A1, Gaveta 2"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quantidade e Estoque Mínimo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Quantidade em Estoque</label>
                  <input
                    type="number"
                    min="0"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="1"
                    value={estoqueMinimo}
                    onChange={(e) => setEstoqueMinimo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Preço de Custo e Preço de Venda */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-white/5">
                <div>
                  <label className="font-semibold text-orange-400 block mb-1">Preço de Custo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 150.00"
                    value={precoCusto}
                    onChange={(e) => setPrecoCusto(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-mono focus:border-orange-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Valor pago pelo item</span>
                </div>

                <div>
                  <label className="font-semibold text-emerald-400 block mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 300.00"
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-mono focus:border-emerald-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Cobrado no orçamento</span>
                </div>
              </div>

              {/* Exemplo de Lucro Unitário */}
              {precoCusto && precoVenda && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="text-emerald-200">Lucro Bruto por Unidade:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {formatCurrency(Math.max(0, parseFloat(precoVenda) - parseFloat(precoCusto)))}
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-glow-teal transition-all cursor-pointer"
                >
                  {submitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Cadastrar no Estoque'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};