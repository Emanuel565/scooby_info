import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ItemEstoque, Venda, FormaPagamento } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PrintVendaModal } from '../components/PrintVendaModal';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  CreditCard, 
  Zap, 
  Send, 
  CheckCircle, 
  Barcode, 
  Tag, 
  User, 
  Phone, 
  FileText, 
  History, 
  RefreshCw, 
  Sparkles,
  Layers,
  Laptop,
  HardDrive,
  Cpu,
  Smartphone,
  Printer
} from 'lucide-react';

interface CartItem extends ItemEstoque {
  cartQuantity: number;
}

export const VendasPDV: React.FC = () => {
  const { user } = useAuth();

  const [produtos, setProdutos] = useState<ItemEstoque[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroCondicao, setFiltroCondicao] = useState<'TODAS' | 'NOVO' | 'USADO'>('TODAS');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');

  // Carrinho
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('DINHEIRO');
  const [desconto, setDesconto] = useState<string>('0');
  const [trocoPara, setTrocoPara] = useState<string>('');

  // Cliente
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteDocumento, setClienteDocumento] = useState('');
  const [observacao, setObservacao] = useState('');

  // Finalização e Recibo
  const [finalizing, setFinalizing] = useState(false);
  const [vendaConcluida, setVendaConcluida] = useState<Venda | null>(null);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Histórico de Vendas
  const [viewHistory, setViewHistory] = useState(false);
  const [historicoVendas, setHistoricoVendas] = useState<Venda[]>([]);
  const [resumoVendas, setResumoVendas] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Carrega produtos do estoque
  const fetchProdutos = async () => {
    setLoadingProdutos(true);
    try {
      const res = await fetch('/api/estoque', {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (res.ok && data.itens) {
        setProdutos(data.itens);
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setLoadingProdutos(false);
    }
  };

  // Carrega histórico de vendas
  const fetchHistoricoVendas = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/vendas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
      const data = await res.json();
      if (res.ok && data.vendas) {
        setHistoricoVendas(data.vendas);
        setResumoVendas(data.resumo);
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    if (viewHistory) {
      fetchHistoricoVendas();
    }
  }, [viewHistory]);

  // Manipulação do Carrinho
  const handleAddToCart = (produto: ItemEstoque) => {
    if (produto.quantidade <= 0) {
      alert(`O produto "${produto.nome}" está sem estoque no momento!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === produto.id);
      if (existing) {
        if (existing.cartQuantity >= produto.quantidade) {
          alert(`Estoque máximo atingido para "${produto.nome}" (${produto.quantidade} unidades).`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === produto.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...produto, cartQuantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.id === id) {
            const newQtd = item.cartQuantity + delta;
            if (newQtd > item.quantidade) {
              alert(`Limite de estoque: apenas ${item.quantidade} unidades disponíveis.`);
              return item;
            }
            return { ...item, cartQuantity: newQtd };
          }
          return item;
        })
        .filter(item => item.cartQuantity > 0);
    });
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setDesconto('0');
    setTrocoPara('');
    setClienteNome('');
    setClienteTelefone('');
    setClienteDocumento('');
    setObservacao('');
    setErroMsg(null);
  };

  // Cálculos do Carrinho
  const subtotalCart = cart.reduce((acc, item) => acc + (item.preco_venda * item.cartQuantity), 0);
  const totalCustoCart = cart.reduce((acc, item) => acc + (item.preco_custo * item.cartQuantity), 0);
  const valorDesconto = Math.min(subtotalCart, parseFloat(desconto) || 0);
  const totalPagar = Math.max(0, subtotalCart - valorDesconto);
  const trocoParaNum = parseFloat(trocoPara) || 0;
  const trocoDevolver = (formaPagamento === 'DINHEIRO' && trocoParaNum > totalPagar) ? (trocoParaNum - totalPagar) : 0;

  // Filtragem dos Produtos
  const filteredProdutos = produtos.filter(p => {
    const matchSearch = !searchQuery || 
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.codigo_barras && p.codigo_barras.includes(searchQuery)) ||
      (p.numero_serie && p.numero_serie.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCondicao = filtroCondicao === 'TODAS' || 
      (filtroCondicao === 'USADO' && (p.condicao === 'USADO' || p.condicao === 'SEMINOVO')) ||
      (filtroCondicao === 'NOVO' && p.condicao === 'NOVO');

    const matchCategoria = filtroCategoria === 'TODAS' || p.categoria === filtroCategoria;

    return matchSearch && matchCondicao && matchCategoria;
  });

  // Finalização da Venda
  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      setErroMsg('Adicione pelo menos 1 produto ao carrinho antes de finalizar a venda.');
      return;
    }

    setFinalizing(true);
    setErroMsg(null);

    try {
      const payload = {
        cliente_nome: clienteNome.trim() || 'Cliente Balcão',
        cliente_telefone: clienteTelefone.trim() || null,
        cliente_documento: clienteDocumento.trim() || null,
        forma_pagamento: formaPagamento,
        desconto: valorDesconto,
        troco_para: trocoParaNum > 0 ? trocoParaNum : null,
        observacao: observacao.trim() || null,
        itens: cart.map(item => ({
          estoque_item_id: item.id,
          nome: item.nome,
          condicao: item.condicao,
          numero_serie: item.numero_serie,
          garantia_meses: item.garantia_meses,
          quantidade: item.cartQuantity,
          preco_unitario: item.preco_venda,
          preco_custo: item.preco_custo
        }))
      };

      const res = await fetch('/api/vendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao finalizar a venda.');
      }

      setVendaConcluida(data.venda);
      handleClearCart();
      fetchProdutos(); // Atualiza estoque em tela
    } catch (err: any) {
      setErroMsg(err.message);
    } finally {
      setFinalizing(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'NOTEBOOK': return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'SSD': return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'MEMORIA': return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'CELULAR': return <Smartphone className="w-4 h-4 text-teal-400" />;
      default: return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-fade-in">
      
      {/* Topo do PDV */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              Ponto de Venda Balcão (PDV)
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Caixa Aberto
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Venda rápida de produtos novos, usados e seminovos com baixa de estoque imediata
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewHistory(!viewHistory)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewHistory 
                ? 'bg-brand-500 text-white shadow-glow-teal' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{viewHistory ? 'Voltar ao PDV' : 'Histórico de Vendas'}</span>
          </button>
        </div>
      </div>

      {viewHistory ? (
        /* HISTÓRICO DE VENDAS BALCÃO */
        <div className="space-y-4 animate-fade-in">
          {resumoVendas && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Total de Vendas</span>
                <p className="text-xl font-black text-white mt-1">{resumoVendas.totalVendas}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-[11px] text-emerald-300 font-semibold uppercase block">Faturamento Balcão</span>
                <p className="text-xl font-black text-emerald-400 mt-1">{formatCurrency(resumoVendas.totalVendido)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-500/30">
                <span className="text-[11px] text-brand-300 font-semibold uppercase block">Lucro Real Balcão</span>
                <p className="text-xl font-black text-brand-400 mt-1">+{formatCurrency(resumoVendas.lucroTotal)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Ticket Médio</span>
                <p className="text-xl font-black text-white mt-1">{formatCurrency(resumoVendas.ticketMedio)}</p>
              </div>
            </div>
          )}

          <div className="glass-card rounded-3xl p-5 border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-sm">Vendas Realizadas Recentemente</h3>
              <button 
                type="button"
                onClick={fetchHistoricoVendas}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {historicoVendas.length > 0 ? (
              <div className="divide-y divide-white/5 space-y-2">
                {historicoVendas.map(v => (
                  <div key={v.id} className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded-lg border border-brand-500/30">
                          {v.codigo_venda}
                        </span>
                        <span className="font-bold text-white">{v.cliente_nome}</span>
                        <span className="text-[10px] text-slate-500">• {formatDate(v.createdAt)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 space-x-2">
                        <span>Vendedor: <strong className="text-slate-300">{v.vendedor?.nome}</strong></span>
                        <span>•</span>
                        <span>Pagto: <strong className="text-emerald-400">{v.forma_pagamento}</strong></span>
                        <span>•</span>
                        <span>Itens: <strong>{v.itens.length}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400 block">{formatCurrency(v.valor_total)}</span>
                        {user?.cargo === 'ADMIN' && (
                          <span className="text-[10px] text-teal-300 font-semibold">Lucro: +{formatCurrency(v.lucro_total)}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setVendaConcluida(v)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Recibo</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs text-center py-6">Nenhuma venda registrada ainda.</p>
            )}
          </div>
        </div>
      ) : (
        /* TELA PRINCIPAL DO PDV (CATÁLOGO + CARRINHO) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* COLUNA ESQUERDA: CATÁLOGO DE PRODUTOS (7 COLUNAS) */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Barra de Busca e Filtros */}
            <div className="glass-card rounded-2xl p-3 border-white/10 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar produto por nome, código de barras, serial ou categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Filtros de Condição (Novos / Usados) e Categorias */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                
                {/* Abas Novos / Usados */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-white/5 text-xs">
                  <button
                    type="button"
                    onClick={() => setFiltroCondicao('TODAS')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filtroCondicao === 'TODAS' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroCondicao('NOVO')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filtroCondicao === 'NOVO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ✨ Novos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroCondicao('USADO')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filtroCondicao === 'USADO' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🏷️ Usados / Seminovos
                  </button>
                </div>

                {/* Dropdown de Categorias */}
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 text-xs focus:border-brand-500 focus:outline-none"
                >
                  <option value="TODAS">Todas as Categorias</option>
                  <option value="NOTEBOOK">💻 Notebooks</option>
                  <option value="SSD">💾 SSDs</option>
                  <option value="MEMORIA">🧠 Memórias RAM</option>
                  <option value="PLACA_MAE">🔌 Placas-mãe</option>
                  <option value="PLACA_VIDEO">🎮 Placas de Vídeo</option>
                  <option value="TELA">📱 Telas & Displays</option>
                  <option value="BATERIA">🔋 Baterias</option>
                  <option value="CARREGADOR">⚡ Carregadores & Fontes</option>
                  <option value="CELULAR">📱 Smartphones</option>
                  <option value="INSUMO">🧪 Insumos & Tintas</option>
                  <option value="ACESSORIO">🎧 Acessórios</option>
                </select>
              </div>
            </div>

            {/* Grid de Produtos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[68vh] overflow-y-auto pr-1">
              {filteredProdutos.map(p => {
                const isUsado = p.condicao === 'USADO' || p.condicao === 'SEMINOVO';
                const semEstoque = p.quantidade <= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => !semEstoque && handleAddToCart(p)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                      semEstoque 
                        ? 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed'
                        : isUsado
                        ? 'bg-gradient-to-br from-amber-950/20 to-slate-900/60 border-amber-500/30 hover:border-amber-400 hover:shadow-lg'
                        : 'bg-slate-900/60 border-white/10 hover:border-brand-500/50 hover:shadow-lg'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          {getCategoryIcon(p.categoria)}
                          {p.categoria}
                        </span>
                        <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md border ${
                          isUsado 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {isUsado ? 'USADO / SEMINOVO' : 'NOVO'}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-xs leading-snug group-hover:text-brand-300 transition-colors">
                        {p.nome}
                      </h4>

                      {p.detalhes_condicao && (
                        <p className="text-[10px] text-amber-200/80 italic mt-0.5 line-clamp-1">
                          {p.detalhes_condicao}
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Estoque: <strong className={semEstoque ? 'text-rose-400' : 'text-slate-200'}>{p.quantidade} un</strong>
                        </span>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {formatCurrency(p.preco_venda)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={semEstoque}
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          semEstoque
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-brand-500 hover:bg-brand-400 text-white shadow-sm'
                        }`}
                        title="Adicionar ao Carrinho"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProdutos.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-500 text-xs rounded-2xl border border-dashed border-white/10">
                  Nenhum produto encontrado com os filtros selecionados.
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: CARRINHO & FECHAMENTO (5 COLUNAS) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="glass-card rounded-3xl p-5 border-white/10 space-y-4 flex flex-col justify-between shadow-2xl">
              
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    Carrinho ({cart.reduce((a, b) => a + b.cartQuantity, 0)} itens)
                  </h3>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Lista de Itens no Carrinho */}
                <div className="divide-y divide-white/5 max-h-[30vh] overflow-y-auto space-y-2 py-2 pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="pt-2 flex items-center justify-between text-xs gap-2">
                      <div className="flex-1">
                        <span className="font-bold text-white line-clamp-1">{item.nome}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{item.condicao === 'USADO' ? '🏷️ Usado' : '✨ Novo'}</span>
                          <span>•</span>
                          <span>Unit: {formatCurrency(item.preco_venda)}</span>
                        </div>
                      </div>

                      {/* Controle de Quantidade */}
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-white px-1.5 font-mono">{item.cartQuantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-emerald-400 font-mono block">
                          {formatCurrency(item.preco_venda * item.cartQuantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-slate-500 hover:text-rose-400 mt-0.5 p-0.5"
                          title="Remover Item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <p className="text-slate-500 text-xs text-center py-6">
                      O carrinho está vazio. Clique nos produtos para adicionar à venda.
                    </p>
                  )}
                </div>
              </div>

              {/* Dados do Cliente & Pagamento */}
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                
                {/* Formas de Pagamento */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Forma de Pagamento:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'DINHEIRO', label: '💵 Dinheiro' },
                      { id: 'PIX', label: '⚡ PIX' },
                      { id: 'CARTAO_DEBITO', label: '💳 Débito' },
                      { id: 'CARTAO_CREDITO', label: '💳 Crédito' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormaPagamento(f.id as FormaPagamento)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          formaPagamento === f.id
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-white/5'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dinheiro: Troco */}
                {formaPagamento === 'DINHEIRO' && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Recebido (R$):</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Troco para..."
                      value={trocoPara}
                      onChange={(e) => setTrocoPara(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg bg-black border border-white/10 text-right text-xs font-mono text-white focus:border-brand-500 focus:outline-none"
                    />
                    {trocoDevolver > 0 && (
                      <span className="text-[11px] font-bold text-amber-300">
                        Troco: {formatCurrency(trocoDevolver)}
                      </span>
                    )}
                  </div>
                )}

                {/* Desconto */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">Desconto (R$):</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={desconto}
                    onChange={(e) => setDesconto(e.target.value)}
                    className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-right text-xs font-mono text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Dados do Cliente (Opcional) */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Cliente (opcional)"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-xs focus:border-brand-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp (opcional)"
                    value={clienteTelefone}
                    onChange={(e) => setClienteTelefone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Total da Venda */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-navy-950 to-slate-950 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">TOTAL DA VENDA</span>
                    <span className="text-[11px] text-slate-400">Vendedor: {user?.nome}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                      {formatCurrency(totalPagar)}
                    </span>
                  </div>
                </div>

                {erroMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs text-center font-semibold">
                    {erroMsg}
                  </div>
                )}

                {/* Botão de Fechar Venda */}
                <button
                  type="button"
                  disabled={finalizing || cart.length === 0}
                  onClick={handleFinalizeSale}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-glow-teal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>{finalizing ? 'Finalizando Venda...' : 'Finalizar Venda & Imprimir'}</span>
                </button>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* Modal de Impressão de Comprovante de Venda */}
      {vendaConcluida && (
        <PrintVendaModal
          venda={vendaConcluida}
          onClose={() => setVendaConcluida(null)}
        />
      )}

    </div>
  );
};
