import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatCurrency, formatDate, getEquipmentLabel } from '../utils/formatters';
import { 
  Wrench, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PhoneCall, 
  Send, 
  Laptop, 
  Smartphone, 
  Printer, 
  Monitor, 
  Gamepad2, 
  HelpCircle,
  ShieldCheck,
  Check,
  Camera,
  Image,
  Eye,
  X
} from 'lucide-react';

export const PublicOSLookup: React.FC = () => {
  const { codigo } = useParams<{ codigo?: string }>();
  const [searchInput, setSearchInput] = useState<string>(codigo || '');
  const [osData, setOsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);

  const fetchOS = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/os/${encodeURIComponent(codeToSearch.trim().toUpperCase())}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Ordem de serviço não encontrada.');
      }
      setOsData(json.os);
    } catch (err: any) {
      setOsData(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (codigo) {
      setSearchInput(codigo);
      fetchOS(codigo);
    }
  }, [codigo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOS(searchInput);
  };

  const getEquipmentIcon = (tipo: string) => {
    switch (tipo) {
      case 'NOTEBOOK': return <Laptop className="w-6 h-6 text-sky-400" />;
      case 'SMARTPHONE': return <Smartphone className="w-6 h-6 text-emerald-400" />;
      case 'IMPRESSORA': return <Printer className="w-6 h-6 text-amber-400" />;
      case 'PC_DESKTOP': return <Monitor className="w-6 h-6 text-indigo-400" />;
      case 'CONSOLE': return <Gamepad2 className="w-6 h-6 text-purple-400" />;
      default: return <HelpCircle className="w-6 h-6 text-slate-400" />;
    }
  };

  const steps = [
    { id: 'TRIAGEM', label: 'Entrada & Triagem', desc: 'Aparelho recebido no balcão' },
    { id: 'EM_ANDAMENTO', label: 'Diagnóstico & Reparo', desc: 'Em manutenção na bancada técnica' },
    { id: 'TESTES', label: 'Testes de Qualidade', desc: 'Validação de funcionamento e estresse' },
    { id: 'CONCLUIDO', label: 'Pronto p/ Retirada', desc: 'Reparo finalizado com sucesso!' },
    { id: 'ENTREGUE', label: 'Entregue ao Cliente', desc: 'Retirado com garantia legal' }
  ];

  const getStepStatus = (stepId: string, currentStatus: string) => {
    const order = ['TRIAGEM', 'EM_ANDAMENTO', 'TESTES', 'CONCLUIDO', 'ENTREGUE'];
    const currentIndex = order.indexOf(currentStatus === 'AGUARDANDO_PECA' || currentStatus === 'AGUARDANDO_APROVACAO' ? 'EM_ANDAMENTO' : currentStatus);
    const stepIndex = order.indexOf(stepId);

    if (currentStatus === 'CANCELADO') return 'cancelado';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const whatsappLoja = '554135652008';
  const mensagemWhatsApp = osData ? encodeURIComponent(
    `Olá, Scooby Assistência! Gostaria de informações sobre o meu aparelho *${osData.marca_modelo}* (OS: *${osData.codigo_os}*).`
  ) : '';

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      
      {/* Topo Público */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md px-4 py-4 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 p-0.5 shadow-glow-teal flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Wrench className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                SCOOBY <span className="text-brand-400 text-xs px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">OS</span>
              </span>
              <p className="text-[11px] text-slate-400">Consulta Online de Conserto</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${whatsappLoja}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
            title="Falar no WhatsApp da Scooby"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">(41) 3565-2008</span>
          </a>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 space-y-6 flex-1">
        
        {/* Formulário de Busca por Código */}
        <div className="glass-card rounded-3xl p-6 border-white/10 space-y-3 text-center">
          <h2 className="text-xl font-black text-white tracking-tight">
            Acompanhe o Status do seu Aparelho
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Digite o código da sua Ordem de Serviço impresso no comprovante (ex: <strong className="text-brand-300">OS-2026-0001</strong>) para ver o andamento em tempo real.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md mx-auto pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Código da OS (ex: OS-2026-0001)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-brand-500 focus:outline-none uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow-teal transition-all cursor-pointer shrink-0"
            >
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-center gap-2 max-w-md mx-auto animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Detalhes da OS Consultada */}
        {osData && (
          <div className="space-y-6 animate-slide-up">
            
            {/* Aviso de Pronto para Retirada com Grande Destaque */}
            {osData.status === 'CONCLUIDO' && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-emerald-950/90 border-2 border-emerald-500 shadow-glow-teal text-center space-y-2 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h3 className="text-xl font-black text-white">🎉 SEU APARELHO ESTÁ PRONTO!</h3>
                <p className="text-xs text-emerald-200 max-w-md mx-auto">
                  O conserto foi finalizado com sucesso e os testes foram aprovados. Você já pode retirar o seu equipamento na nossa loja!
                </p>
                {osData.valor_final > 0 && (
                  <p className="text-sm font-extrabold text-white pt-1">
                    Valor Total a Pagar na Retirada: <span className="text-emerald-400 text-base">{formatCurrency(osData.valor_final)}</span>
                  </p>
                )}
              </div>
            )}

            {/* Aviso de Aguardando Aprovação */}
            {osData.status === 'AGUARDANDO_APROVACAO' && (
              <div className="p-5 rounded-3xl bg-orange-950/70 border-2 border-orange-500/60 text-center space-y-2">
                <h3 className="text-base font-black text-orange-300 uppercase tracking-wide">
                  ⏳ Diagnóstico Concluído - Aguardando sua Aprovação
                </h3>
                <p className="text-xs text-slate-200 max-w-md mx-auto">
                  Nossa equipe técnica realizou o diagnóstico e o orçamento está pronto. Entre em contato pelo WhatsApp para aprovar o início do reparo.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-300">Valor do Orçamento: </span>
                  <span className="text-lg font-black text-emerald-400">{formatCurrency(osData.valor_final || osData.orcamento_valor)}</span>
                </div>
              </div>
            )}

            {/* Card com Resumo do Equipamento */}
            <div className="glass-card rounded-3xl p-6 border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                    {getEquipmentIcon(osData.tipo_equipamento)}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                      {getEquipmentLabel(osData.tipo_equipamento)}
                    </span>
                    <h3 className="text-lg font-black text-white">{osData.marca_modelo}</h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm px-3 py-1 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-300">
                    {osData.codigo_os}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Entrada em {formatDate(osData.createdAt)}</p>
                </div>
              </div>

              {/* Linha do Tempo de Andamento */}
              <div className="py-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-6 text-center">
                  Linha do Tempo do Conserto
                </h4>

                <div className="space-y-4">
                  {steps.map((step, idx) => {
                    const statusState = getStepStatus(step.id, osData.status);
                    const isCompleted = statusState === 'completed';
                    const isCurrent = statusState === 'current';

                    return (
                      <div key={step.id} className="flex items-start gap-4 relative">
                        {/* Linha conectora */}
                        {idx < steps.length - 1 && (
                          <div 
                            className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px transition-colors ${isCompleted ? 'bg-emerald-500' : 'bg-white/10'}`} 
                          />
                        )}

                        {/* Ícone do Nó */}
                        <div 
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all z-10 ${
                            isCompleted 
                              ? 'bg-emerald-500 text-white shadow-md' 
                              : isCurrent 
                              ? 'bg-brand-500 text-white shadow-glow-teal animate-pulse ring-4 ring-brand-500/20' 
                              : 'bg-slate-900 text-slate-500 border border-white/10'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                        </div>

                        {/* Texto da Etapa */}
                        <div className="pt-1 flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-bold ${isCurrent ? 'text-brand-300 text-sm' : isCompleted ? 'text-white' : 'text-slate-500'}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-bold animate-pulse">
                                Status Atual
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informações Complementares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400 text-[11px] block font-medium">Defeito Registrado:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{osData.defeito_relatado}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col justify-between">
                  <span className="text-slate-400 text-[11px] block font-medium">Garantia Legal:</span>
                  <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> 90 dias sobre peças e serviços
                  </p>
                </div>
              </div>

              {/* Galeria de Fotos e Evidências do Equipamento */}
              {(() => {
                let fotosList: string[] = [];
                try {
                  fotosList = typeof osData.fotos_equipamento === 'string' ? JSON.parse(osData.fotos_equipamento || '[]') : osData.fotos_equipamento || [];
                } catch {
                  fotosList = [];
                }

                if (fotosList.length === 0) return null;

                return (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-sky-400" />
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                        Fotos & Evidências do Equipamento ({fotosList.length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {fotosList.map((f, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedFoto(f)}
                          className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square bg-black/40 cursor-pointer"
                        >
                          <img src={f} alt={`Evidência ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="p-1.5 rounded-lg bg-black/60 text-white text-[10px] font-bold flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" /> Ampliar
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Botão de Contato Direto */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${whatsappLoja}?text=${mensagemWhatsApp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Dúvidas? Fale conosco no WhatsApp da Loja ((41) 3565-2008)</span>
                </a>
              </div>

            </div>

          </div>
        )}

        {/* Modal Lightbox de Foto Ampliada */}
        {selectedFoto && (
          <div 
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedFoto(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
              <img 
                src={selectedFoto} 
                alt="Foto do Equipamento Ampliada" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl" 
              />
              <button
                type="button"
                onClick={() => setSelectedFoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Rodapé */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        <p>SCOOBY INFORMÁTICA & ASSISTÊNCIA TÉCNICA • WhatsApp: (41) 3565-2008</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Sistema Scooby OS • Acompanhamento em Tempo Real</p>
      </footer>

    </div>
  );
};