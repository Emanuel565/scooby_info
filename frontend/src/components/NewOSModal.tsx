import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, X, CheckSquare, Laptop, Smartphone, Monitor, Gamepad2, Printer, ShieldAlert, FileSearch, Calendar, Camera, Image, Trash2 } from 'lucide-react';

interface NewOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultEquipmentType?: string;
  autoAssignDirectly?: boolean;
}

export const NewOSModal: React.FC<NewOSModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultEquipmentType = 'NOTEBOOK',
  autoAssignDirectly = false
}) => {
  const { user } = useAuth();

  const [clienteNome, setClienteNome] = useState('');
  const [clienteWhatsapp, setClienteWhatsapp] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [clienteDocumento, setClienteDocumento] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');

  const [tipoEquipamento, setTipoEquipamento] = useState(defaultEquipmentType);
  const [marcaModelo, setMarcaModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [senhaAparelho, setSenhaAparelho] = useState('');
  const [acessorios, setAcessorios] = useState('');
  const [condicoesVisuais, setCondicoesVisuais] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotos(prev => [...prev, String(event.target?.result)]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const getPrazoPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(18, 0, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [isApenasOrcamento, setIsApenasOrcamento] = useState(false);
  const [defeitoRelatado, setDefeitoRelatado] = useState('');
  const [orcamentoValor, setOrcamentoValor] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [prazoEntrega, setPrazoEntrega] = useState(() => getPrazoPreset(3));

  // Migração Bling & Numeração Manual
  const [usarNumeroManual, setUsarNumeroManual] = useState(false);
  const [codigoOSManual, setCodigoOSManual] = useState('');
  const [dataHoraAbertura, setDataHoraAbertura] = useState(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  // Checklist de entrada geral
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    liga: true,
    tela_integra: true,
    carregador_incluso: false,
    testado_no_balcao: true,
    puxa_papel: true,
    cabecote_ok: true,
    toner_incluso: true,
    cabo_forca: true
  });

  const [autoAtribuir, setAutoAtribuir] = useState(autoAssignDirectly);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleOrcamento = (checked: boolean) => {
    setIsApenasOrcamento(checked);
    if (checked) {
      if (!defeitoRelatado || defeitoRelatado.trim() === '') {
        setDefeitoRelatado('Análise e diagnóstico em bancada para identificação de defeito e elaboração de orçamento.');
      }
      // Prazo automático de 3 dias para orçamento
      const data3Dias = new Date();
      data3Dias.setDate(data3Dias.getDate() + 3);
      data3Dias.setHours(18, 0, 0, 0);
      const isoLocal = new Date(data3Dias.getTime() - (data3Dias.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setPrazoEntrega(isoLocal);
      setOrcamentoValor('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNome || (!clienteWhatsapp && !clienteTelefone) || !marcaModelo) {
      setError('Por favor, preencha os campos obrigatórios (*)');
      return;
    }

    const defeitoFinal = defeitoRelatado && defeitoRelatado.trim() !== '' 
      ? defeitoRelatado 
      : 'Avaliação técnica e elaboração de orçamento.';

    const telefonePrincipal = clienteWhatsapp || clienteTelefone;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/os', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          codigo_os_manual: usarNumeroManual ? codigoOSManual.trim() : undefined,
          data_hora_abertura: usarNumeroManual ? dataHoraAbertura : undefined,
          cliente_nome: clienteNome,
          cliente_whatsapp: clienteWhatsapp || null,
          cliente_telefone: telefonePrincipal,
          cliente_documento: clienteDocumento,
          cliente_email: clienteEmail,
          tipo_equipamento: tipoEquipamento,
          marca_modelo: marcaModelo,
          numero_serie: numeroSerie,
          senha_aparelho: senhaAparelho,
          acessorios_inclusos: acessorios,
          condicoes_visuais: condicoesVisuais,
          defeito_relatado: defeitoFinal,
          orcamento_valor: orcamentoValor ? parseFloat(orcamentoValor) : 0,
          prioridade,
          prazo_entrega: prazoEntrega || null,
          checklist_entrada: checklist,
          fotos_equipamento: fotos,
          auto_atribuir_me: autoAtribuir
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar Ordem de Serviço');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Abertura de Ordem de Serviço (OS)</h2>
              <p className="text-xs text-slate-400">Recepção de equipamento e abertura de chamado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Opção Especial: Migração do Bling & Numeração Manual */}
          <div className={`p-4 rounded-2xl border transition-all ${
            usarNumeroManual 
              ? 'bg-amber-950/40 border-amber-500/50 shadow-md' 
              : 'bg-slate-950/40 border-white/5 hover:border-white/10'
          }`}>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={usarNumeroManual}
                onChange={(e) => setUsarNumeroManual(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-white/20"
              />
              <div>
                <span className="font-bold text-white text-xs block flex items-center gap-1.5">
                  <span>🔢 Digitar número e data/hora manualmente (Migração do Bling)</span>
                  {usarNumeroManual && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                      ATIVO
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-400">
                  Marque para importar OSs antigas do Bling mantendo o mesmo número e data/hora original de entrada.
                </span>
              </div>
            </label>

            {usarNumeroManual && (
              <div className="mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                <div>
                  <label className="block text-amber-300 font-bold mb-1">
                    Número / Código da OS no Bling *
                  </label>
                  <input
                    type="text"
                    required={usarNumeroManual}
                    placeholder="Ex: 70 ou 1245 ou OS-1245"
                    value={codigoOSManual}
                    onChange={(e) => setCodigoOSManual(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    As próximas OSs automáticas darão sequência contínua a partir deste número.
                  </span>
                </div>

                <div>
                  <label className="block text-amber-300 font-bold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Data & Hora de Entrada Original *</span>
                  </label>
                  <input
                    type="datetime-local"
                    required={usarNumeroManual}
                    value={dataHoraAbertura}
                    onChange={(e) => setDataHoraAbertura(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-white focus:border-amber-400 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Data/hora em que o chamado deu entrada no Bling no passado.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] pb-1 border-b border-white/5">
              1. Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Lima"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-emerald-400 font-semibold mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>WhatsApp Celular (Para Avisos e Orçamento) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="(11) 99999-9999"
                  value={clienteWhatsapp}
                  onChange={(e) => setClienteWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-white placeholder-slate-600 focus:border-emerald-400 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Telefone Fixo / Recado (Opcional)</label>
                <input
                  type="text"
                  placeholder="(11) 3333-3333"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">CPF / CNPJ (Opcional)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={clienteDocumento}
                  onChange={(e) => setClienteDocumento(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">E-mail (Opcional)</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dados do Aparelho */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] pb-1 border-b border-white/5">
              2. Dados do Equipamento
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'NOTEBOOK', label: 'Notebook', icon: Laptop },
                { id: 'SMARTPHONE', label: 'Smartphone', icon: Smartphone },
                { id: 'IMPRESSORA', label: 'Impressora', icon: Printer },
                { id: 'PC_DESKTOP', label: 'PC Desktop', icon: Monitor },
                { id: 'CONSOLE', label: 'Console', icon: Gamepad2 }
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setTipoEquipamento(item.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${tipoEquipamento === item.id ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-semibold shadow-glow-teal' : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/20'}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[11px] truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Marca e Modelo *</label>
                <input
                  type="text"
                  required
                  placeholder={tipoEquipamento === 'IMPRESSORA' ? "Ex: Epson EcoTank L3250 / HP Laser" : "Ex: Dell Inspiron 15 ou iPhone 14 Pro"}
                  value={marcaModelo}
                  onChange={(e) => setMarcaModelo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {tipoEquipamento === 'IMPRESSORA' ? 'Tipo de Impressão' : 'Senha de Desbloqueio'}
                </label>
                <input
                  type="text"
                  placeholder={tipoEquipamento === 'IMPRESSORA' ? "Ex: Tanque de Tinta, Laser, Térmica" : "PIN, Padrão ou Senha"}
                  value={senhaAparelho}
                  onChange={(e) => setSenhaAparelho(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nº de Série / Identificação</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Acessórios Inclusos</label>
                <input
                  type="text"
                  placeholder={tipoEquipamento === 'IMPRESSORA' ? "Ex: Cabo USB, Cabo de Força, Bandeja" : "Ex: Carregador, Cabo, Capa, Mochila"}
                  value={acessorios}
                  onChange={(e) => setAcessorios(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Condições Visuais / Avarias Pré-existentes</label>
              <input
                type="text"
                placeholder="Ex: Arranhões na carcaça, tela sem trincos, quina amassada..."
                value={condicoesVisuais}
                onChange={(e) => setCondicoesVisuais(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Fotos de Entrada / Evidências */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium flex items-center gap-1.5 text-xs">
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  <span>Fotos de Entrada do Equipamento (Opcional - {fotos.length})</span>
                </label>
                <label className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all">
                  <Camera className="w-3 h-3" />
                  <span>+ Tirar / Anexar Fotos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {fotos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {fotos.map((f, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-square bg-black/40">
                      <img src={f} alt={`Entrada ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(i)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-rose-950/90 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Defeito e Orçamento / Opção Orçamento Sem Defeito Definido */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <h3 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                3. Defeito e Orçamento
              </h3>

              {/* Botão de Análise / Orçamento 2 a 3 dias */}
              <label className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold cursor-pointer hover:bg-amber-500/25 transition-colors">
                <input
                  type="checkbox"
                  checked={isApenasOrcamento}
                  onChange={(e) => handleToggleOrcamento(e.target.checked)}
                  className="rounded border-amber-500 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <FileSearch className="w-3.5 h-3.5" />
                <span>Apenas Orçamento / Análise Técnica (2 a 3 dias)</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Defeito Relatado / Queixa do Cliente {isApenasOrcamento ? '(Preenchido automaticamente para análise)' : '*'}
              </label>
              <textarea
                rows={isApenasOrcamento ? 2 : 3}
                placeholder="Descreva o problema relatado pelo cliente..."
                value={defeitoRelatado}
                onChange={(e) => setDefeitoRelatado(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {isApenasOrcamento ? 'Orçamento Inicial (R$)' : 'Orçamento Estimado (R$)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={isApenasOrcamento ? 'Aguardando Laudo' : '0,00'}
                  value={orcamentoValor}
                  onChange={(e) => setOrcamentoValor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none font-semibold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Prioridade</label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="BAIXA">⚪ Baixa</option>
                  <option value="MEDIA">🔵 Média</option>
                  <option value="ALTA">🟠 Alta</option>
                  <option value="URGENTE">🔴 URGENTE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>Previsão de Entrega (SLA)</span>
                  <span className="text-[10px] text-teal-300 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                    Padrão: 3 dias
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={prazoEntrega}
                  onChange={(e) => setPrazoEntrega(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none text-xs"
                />
                <div className="flex items-center gap-1 mt-1.5 overflow-x-auto text-[10px] pb-0.5">
                  <button
                    type="button"
                    onClick={() => setPrazoEntrega(getPrazoPreset(1))}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/30 cursor-pointer whitespace-nowrap"
                    title="Definir prazo urgente para amanhã"
                  >
                    ⚡ 1 dia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrazoEntrega(getPrazoPreset(3))}
                    className="px-2 py-0.5 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold border border-teal-500/40 cursor-pointer whitespace-nowrap"
                    title="Definir prazo padrão da oficina (3 dias úteis)"
                  >
                    ⭐ 3 dias (Padrão)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrazoEntrega(getPrazoPreset(5))}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer whitespace-nowrap"
                    title="Definir prazo estendido de 5 dias"
                  >
                    🔧 5 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrazoEntrega(getPrazoPreset(7))}
                    className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer whitespace-nowrap"
                    title="Definir prazo de 1 semana para peça externa"
                  >
                    📦 7 dias
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Rápido de Recepção */}
          <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-white/5">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
              <CheckSquare className="w-3.5 h-3.5 text-brand-400" />
              Checklist de Entrada ({tipoEquipamento === 'IMPRESSORA' ? 'Específico para Impressoras' : 'Geral'})
            </h4>
            
            {tipoEquipamento === 'IMPRESSORA' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.liga ?? true}
                    onChange={(e) => setChecklist({ ...checklist, liga: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Liga / Inicializa</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.puxa_papel ?? true}
                    onChange={(e) => setChecklist({ ...checklist, puxa_papel: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Puxa Papel</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.cabecote_ok ?? false}
                    onChange={(e) => setChecklist({ ...checklist, cabecote_ok: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Cabeçote OK</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.toner_incluso ?? true}
                    onChange={(e) => setChecklist({ ...checklist, toner_incluso: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Toner / Tinta Presente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.cabo_forca ?? true}
                    onChange={(e) => setChecklist({ ...checklist, cabo_forca: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Cabo de Força Entregue</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.testado_no_balcao ?? true}
                    onChange={(e) => setChecklist({ ...checklist, testado_no_balcao: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Testado no Balcão</span>
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.liga ?? true}
                    onChange={(e) => setChecklist({ ...checklist, liga: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Aparelho Liga</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.tela_integra ?? true}
                    onChange={(e) => setChecklist({ ...checklist, tela_integra: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Tela Íntegra</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.carregador_incluso ?? false}
                    onChange={(e) => setChecklist({ ...checklist, carregador_incluso: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Carregador Entregue</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.testado_no_balcao ?? true}
                    onChange={(e) => setChecklist({ ...checklist, testado_no_balcao: e.target.checked })}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Testado com Cliente</span>
                </label>
              </div>
            )}
          </div>

          {/* Opção de Auto-atribuição */}
          {(user?.cargo === 'TECNICO_CELULAR' || user?.cargo === 'ADMIN' || user?.cargo === 'GERENTE') && (
            <div className="p-3 bg-brand-950/40 rounded-xl border border-brand-500/30 flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-300 text-xs">Direcionar para Minha Própria Bancada</p>
                <p className="text-[11px] text-slate-400">A OS sairá da Triagem e entrará direto em "Em Andamento"</p>
              </div>
              <input
                type="checkbox"
                checked={autoAtribuir}
                onChange={(e) => setAutoAtribuir(e.target.checked)}
                className="w-4 h-4 rounded border-brand-500 text-brand-500 focus:ring-0 cursor-pointer"
              />
            </div>
          )}

          {/* Rodapé */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white font-bold shadow-glow-teal flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Salvando OS...' : 'Gerar Ordem de Serviço'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};