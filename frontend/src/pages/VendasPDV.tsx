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

interface QuickService {
  id: number;
  nome: string;
  preco: number;
  custo: number;
  categoria: string;
  icone: string;
  descricao: string;
  badge: string;
}

const SERVICOS_EXPRESSOS: QuickService[] = [
  {
    id: -1,
    nome: 'Impressão Preto & Branco (A4)',
    preco: 1.00,
    custo: 0.10,
    categoria: 'SERVICO_BALCAO',
    icone: '📄',
    descricao: 'Xerox ou impressão monocromática por folha',
    badge: 'R$ 1,00 / pág'
  },
  {
    id: -2,
    nome: 'Impressão Colorida (A4 Gráfica)',
    preco: 2.50,
    custo: 0.35,
    categoria: 'SERVICO_BALCAO',
    icone: '🎨',
    descricao: 'Impressão de imagens ou texto colorido em alta resolução',
    badge: 'R$ 2,50 / pág'
  },
  {
    id: -3,
    nome: 'Elaboração e Impressão de Currículo',
    preco: 20.00,
    custo: 0.50,
    categoria: 'SERVICO_BALCAO',
    icone: '📝',
    descricao: 'Digitação, formatação profissional e 2 vias impressas',
    badge: 'R$ 20,00'
  },
  {
    id: -4,
    nome: 'Montagem & Edição de Fotos / Imagens',
    preco: 15.00,
    custo: 0.00,
    categoria: 'SERVICO_BALCAO',
    icone: '🖼️',
    descricao: 'Foto 3x4, restauração, recorte, ajuste de imagem ou arte',
    badge: 'R$ 15,00'
  },
  {
    id: -5,
    nome: 'Digitalização / Scanner de Documentos',
    preco: 3.00,
    custo: 0.00,
    categoria: 'SERVICO_BALCAO',
    icone: '📂',
    descricao: 'Escaneamento em PDF e envio por WhatsApp ou E-mail',
    badge: 'R$ 3,00 / doc'
  },
  {
    id: -6,
    nome: 'Aplicação de Película (Mão de Obra)',
    preco: 10.00,
    custo: 0.00,
    categoria: 'SERVICO_BALCAO',
    icone: '🛡️',
    descricao: 'Instalação profissional alinhada sem bolhas',
    badge: 'R$ 10,00'
  },
  {
    id: -7,
    nome: 'Backup de Arquivos em Pen Drive',
    preco: 20.00,
    custo: 0.00,
    categoria: 'SERVICO_BALCAO',
    icone: '💾',
    descricao: 'Cópia e organização de fotos, documentos e arquivos',
    badge: 'R$ 20,00'
  },
  {
    id: -8,
    nome: 'Limpeza & Desoxidação de Conector',
    preco: 35.00,
    custo: 0.00,
    categoria: 'SERVICO_BALCAO',
    icone: '🧹',
    descricao: 'Higienização de conector de carga e fones',
    badge: 'R$ 35,00'
  }
];

export const VendasPDV: React.FC = () => {
  const { user } = useAuth();

  const [produtos, setProdutos] = useState<ItemEstoque[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroCondicao, setFiltroCondicao] = useState<'TODAS' | 'NOVO' | 'USADO'>('TODAS');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [secaoAtiva, setSecaoAtiva] = useState<'SERVICOS' | 'ACESSORIOS' | 'PRODUTOS' | 'TODOS'>('TODOS');

  // Modal de Item/Serviço Avulso de Balcão
  const [showAvulsoModal, setShowAvulsoModal] = useState(false);
  const [avulsoNome, setAvulsoNome] = useState('');
  const [avulsoPreco, setAvulsoPreco] = useState('');
  const [avulsoCusto, setAvulsoCusto] = useState('0');
  const [avulsoQtd, setAvulsoQtd] = useState('1');
  const [avulsoTipo, setAvulsoTipo] = useState<'SERVICO' | 'PRODUTO'>('SERVICO');

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

  // Manipulação do Carrinho (Com suporte a Serviços e Produtos)
  const handleAddToCart = (produto: ItemEstoque) => {
    const isServico = produto.categoria === 'SERVICO_BALCAO' || produto.id < 0;

    if (!isServico && produto.quantidade <= 0) {
      alert(`O produto "${produto.nome}" está sem estoque no momento!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === produto.id);
      if (existing) {
        if (!isServico && existing.cartQuantity >= produto.quantidade) {
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

  // Adicionar Serviço Expresso de 1 Clique
  const handleAddQuickService = (servico: QuickService) => {
    const fakeItem: ItemEstoque = {
      id: servico.id,
      nome: servico.nome,
      categoria: servico.categoria,
      condicao: 'NOVO',
      quantidade: 99999,
      estoque_minimo: 0,
      preco_custo: servico.custo,
      preco_venda: servico.preco,
      garantia_meses: 0
    };
    handleAddToCart(fakeItem);
  };

  // Adicionar Item Avulso de Balcão
  const handleAddAvulso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avulsoNome.trim() || !avulsoPreco) {
      alert('Informe o nome e o preço do item/serviço.');
      return;
    }

    const precoVenda = parseFloat(avulsoPreco) || 0;
    const precoCusto = parseFloat(avulsoCusto) || 0;
    const qtd = parseInt(avulsoQtd) || 1;

    const avulsoItem: CartItem = {
      id: -(Date.now()), // ID negativo único para itens avulsos
      nome: avulsoNome.trim(),
      categoria: avulsoTipo === 'SERVICO' ? 'SERVICO_BALCAO' : 'ACESSORIO',
      condicao: 'NOVO',
      quantidade: 99999,
      estoque_minimo: 0,
      preco_custo: precoCusto,
      preco_venda: precoVenda,
      garantia_meses: avulsoTipo === 'SERVICO' ? 0 : 3,
      cartQuantity: qtd
    };

    setCart(prev => [...prev, avulsoItem]);
    setShowAvulsoModal(false);
    setAvulsoNome('');
    setAvulsoPreco('');
    setAvulsoCusto('0');
    setAvulsoQtd('1');
  };

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.id === id) {
            const isServico = item.categoria === 'SERVICO_BALCAO' || item.id < 0;
            const newQtd = item.cartQuantity + delta;
            if (!isServico && newQtd > item.quantidade) {
              alert(`Limite de estoque: apenas ${item.quantidade} unidades disponíveis.`);
              return item;
            }
            return { ...item, cartQuantity: Math.max(0, newQtd) };
          }
          return item;
        })
        .filter(item => item.cartQuantity > 0);
    });
  };

  const handleSetExactQuantity = (id: number, exactQtd: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.id === id) {
            const isServico = item.categoria === 'SERVICO_BALCAO' || item.id < 0;
            if (!isServico && exactQtd > item.quantidade) {
              alert(`Limite de estoque: apenas ${item.quantidade} unidades disponíveis.`);
              return item;
            }
            return { ...item, cartQuantity: Math.max(1, exactQtd) };
          }
          return item;
        });
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
      case 'SERVICO_BALCAO': return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'ACESSORIO': return <Tag className="w-4 h-4 text-purple-400" />;
      case 'NOTEBOOK': return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'SSD': return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'MEMORIA': return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'CELULAR': return <Smartphone className="w-4 h-4 text-teal-400" />;
      case 'INSUMO': return <Printer className="w-4 h-4 text-rose-400" />;
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
              Vendas de peças, acessórios, notebooks e serviços rápidos de balcão (impressão, currículo, imagens)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Item Avulso de Balcão */}
          <button
            type="button"
            onClick={() => setShowAvulsoModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Lançar qualquer serviço ou produto digitando o valor na hora"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ Item / Serviço Avulso</span>
          </button>

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
          
          {/* COLUNA ESQUERDA: SERVIÇOS EXPRESSOS + CATÁLOGO (7 COLUNAS) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* PAINEL EXPRESSO DE SERVIÇOS DE BALCÃO (1 CLIQUE) */}
            <div className="glass-card rounded-3xl p-4 border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Serviços Rápidos de Balcão & Gráfica (1 Clique)</span>
                </h3>
                <span className="text-[10px] text-amber-200/80 font-medium">Estoque Livre</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SERVICOS_EXPRESSOS.map(servico => (
                  <button
                    key={servico.id}
                    type="button"
                    onClick={() => handleAddQuickService(servico)}
                    className="p-2.5 rounded-2xl bg-slate-950/80 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/50 transition-all text-left flex flex-col justify-between group cursor-pointer hover:scale-[1.02] shadow-sm"
                  >
                    <div>
                      <span className="text-lg block mb-1">{servico.icone}</span>
                      <h4 className="font-bold text-white text-[11px] leading-tight group-hover:text-amber-300 transition-colors">
                        {servico.nome}
                      </h4>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-400 font-mono">
                        {servico.badge}
                      </span>
                      <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                        +
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="glass-card rounded-2xl p-3 border-white/10 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar peças, cabos, fontes, mouses, celulares ou serviços..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Filtros de Condição (Novos / Usados) e Categorias */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                
                {/* Abas Rápidas */}
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-950 border border-white/5 text-xs">
                  <button
                    type="button"
                    onClick={() => { setFiltroCondicao('TODAS'); setFiltroCategoria('TODAS'); }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filtroCondicao === 'TODAS' && filtroCategoria === 'TODAS' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFiltroCategoria('ACESSORIO'); }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filtroCategoria === 'ACESSORIO' ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    🎧 Acessórios
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroCondicao('NOVO')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      filtroCondicao === 'NOVO' && filtroCategoria !== 'ACESSORIO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
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
                    🏷️ Usados
                  </button>
                </div>

                {/* Dropdown de Categorias */}
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 text-xs focus:border-brand-500 focus:outline-none"
                >
                  <option value="TODAS">Todas as Categorias</option>
                  <option value="ACESSORIO">🎧 Acessórios (Cabos, Fones, Carregadores)</option>
                  <option value="SERVICO_BALCAO">⚡ Serviços de Balcão & Gráfica</option>
                  <option value="NOTEBOOK">💻 Notebooks</option>
                  <option value="SSD">💾 SSDs</option>
                  <option value="MEMORIA">🧠 Memórias RAM</option>
                  <option value="PLACA_MAE">🔌 Placas-mãe</option>
                  <option value="PLACA_VIDEO">🎮 Placas de Vídeo</option>
                  <option value="TELA">📱 Telas & Displays</option>
                  <option value="BATERIA">🔋 Baterias</option>
                  <option value="INSUMO">🧪 Insumos & Papelaria</option>
                </select>
              </div>
            </div>

            {/* Grid de Produtos Cadastrados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {filteredProdutos.map(p => {
                const isUsado = p.condicao === 'USADO' || p.condicao === 'SEMINOVO';
                const isServico = p.categoria === 'SERVICO_BALCAO';
                const semEstoque = !isServico && p.quantidade <= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => !semEstoque && handleAddToCart(p)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                      semEstoque 
                        ? 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed'
                        : isServico
                        ? 'bg-gradient-to-br from-amber-950/20 to-slate-900 border-amber-500/40 hover:border-amber-400 hover:shadow-lg'
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
                          isServico
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : isUsado 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {isServico ? '⚡ SERVIÇO' : isUsado ? 'USADO' : 'NOVO'}
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
                          {isServico ? (
                            <strong className="text-amber-400 font-mono">Disponível Imediato</strong>
                          ) : (
                            <>Estoque: <strong className={semEstoque ? 'text-rose-400' : 'text-slate-200'}>{p.quantidade} un</strong></>
                          )}
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
                  Nenhum produto encontrado. Clique em <strong>"+ Item / Serviço Avulso"</strong> no topo para lançar uma venda personalizada.
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
                <div className="divide-y divide-white/5 max-h-[32vh] overflow-y-auto space-y-2 py-2 pr-1">
                  {cart.map(item => {
                    const isServico = item.categoria === 'SERVICO_BALCAO' || item.id < 0;

                    return (
                      <div key={item.id} className="pt-2 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <span className="font-bold text-white line-clamp-1">{item.nome}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className={isServico ? 'text-amber-300 font-bold' : item.condicao === 'USADO' ? 'text-amber-400' : 'text-emerald-400'}>
                                {isServico ? '⚡ Serviço Balcão' : item.condicao === 'USADO' ? '🏷️ Usado' : '✨ Novo'}
                              </span>
                              <span>•</span>
                              <span>Unit: {formatCurrency(item.preco_venda)}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-emerald-400 font-mono block">
                              {formatCurrency(item.preco_venda * item.cartQuantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.id)}
                              className="text-slate-500 hover:text-rose-400 mt-0.5 p-0.5 cursor-pointer"
                              title="Remover Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Linha de Controle de Quantidade e Multiplicadores */}
                        <div className="flex items-center justify-between gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-black text-white px-2 font-mono text-sm">{item.cartQuantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Atalhos Rápidos para Impressão e Serviços (+1, +5, +10) */}
                          <div className="flex items-center gap-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 5)}
                              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-brand-500/20 text-slate-300 font-mono cursor-pointer"
                            >
                              +5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 10)}
                              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-brand-500/20 text-slate-300 font-mono cursor-pointer"
                            >
                              +10
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 20)}
                              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-brand-500/20 text-slate-300 font-mono cursor-pointer"
                            >
                              +20
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {cart.length === 0 && (
                    <p className="text-slate-500 text-xs text-center py-6">
                      O carrinho está vazio. Clique nos serviços rápidos ou produtos para iniciar a venda.
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

      {/* Modal de Item / Serviço Avulso de Balcão */}
      {showAvulsoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-slide-up space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Lançar Item / Serviço Avulso
              </h3>
              <button 
                type="button"
                onClick={() => setShowAvulsoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAvulso} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo de Lançamento:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAvulsoTipo('SERVICO')}
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      avulsoTipo === 'SERVICO' 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm' 
                        : 'bg-slate-950 text-slate-400 border-white/5'
                    }`}
                  >
                    ⚡ Serviço / Gráfica
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvulsoTipo('PRODUTO')}
                    className={`p-2 rounded-xl font-bold border transition-all ${
                      avulsoTipo === 'PRODUTO' 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm' 
                        : 'bg-slate-950 text-slate-400 border-white/5'
                    }`}
                  >
                    🎧 Produto / Acessório
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descrição do Item / Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Xerox RG frente e verso, Capa Anti-Impacto, etc."
                  value={avulsoNome}
                  onChange={(e) => setAvulsoNome(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={avulsoPreco}
                    onChange={(e) => setAvulsoPreco(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={avulsoQtd}
                    onChange={(e) => setAvulsoQtd(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono font-bold focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAvulsoModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-amber cursor-pointer"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </form>
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
