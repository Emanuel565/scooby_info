import React, { useState } from 'react';
import { OrdemServico, PecaItem, EquipmentType, OSPriority, OSStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from './Badge';
import { formatCurrency, formatDate, formatTimeSeconds, getEquipmentLabel } from '../utils/formatters';
import { 
  X, 
  Printer, 
  Clock, 
  History, 
  FileText, 
  Wrench, 
  PhoneCall, 
  Laptop, 
  Smartphone, 
  Monitor, 
  Gamepad2, 
  HelpCircle,
  Send,
  Edit3,
  Trash2,
  Save,
  Check
} from 'lucide-react';

interface OSDetailsModalProps {
  os: OrdemServico | null;
  onClose: () => void;
  onOpenPrint: (os: OrdemServico) => void;
  onRefresh?: () => void;
}

export const OSDetailsModal: React.FC<OSDetailsModalProps> = ({ os, onClose, onOpenPrint, onRefresh }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'geral' | 'laudo' | 'historico'>('geral');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Estados de Edição
  const [editNome, setEditNome] = useState(os?.cliente_nome || '');
  const [editTelefone, setEditTelefone] = useState(os?.cliente_telefone || '');
  const [editWhatsapp, setEditWhatsapp] = useState(os?.cliente_whatsapp || '');
  const [editDocumento, setEditDocumento] = useState(os?.cliente_documento || '');
  const [editModelo, setEditModelo] = useState(os?.marca_modelo || '');
  const [editTipo, setEditTipo] = useState<EquipmentType>(os?.tipo_equipamento || 'NOTEBOOK');
  const [editSerie, setEditSerie] = useState(os?.numero_serie || '');
  const [editSenha, setEditSenha] = useState(os?.senha_aparelho || '');
  const [editAcessorios, setEditAcessorios] = useState(os?.acessorios_inclusos || '');
  const [editCondicoes, setEditCondicoes] = useState(os?.condicoes_visuais || '');
  const [editDefeito, setEditDefeito] = useState(os?.defeito_relatado || '');
  const [editPrioridade, setEditPrioridade] = useState<OSPriority>(os?.prioridade || 'MEDIA');
  const [editStatus, setEditStatus] = useState<OSStatus>(os?.status || 'TRIAGEM');
  const [editMaoDeObra, setEditMaoDeObra] = useState<string>(String(os?.orcamento_valor || '0'));
  const [editValorFinal, setEditValorFinal] = useState<string>(String(os?.valor_final || os?.orcamento_valor || '0'));

  if (!os) return null;

  const isAdmin = user?.cargo === 'ADMIN';
  const isManagerOrAdmin = user?.cargo === 'ADMIN' || user?.cargo === 'GERENTE';

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

  let pecasList: PecaItem[] = [];
  try {
    pecasList = typeof os.pecas_utilizadas === 'string' ? JSON.parse(os.pecas_utilizadas || '[]') : os.pecas_utilizadas || [];
  } catch {}

  const targetPhone = os.cliente_whatsapp || os.cliente_telefone || '';
  const cleanPhone = targetPhone.replace(/\D/g, '');
  const valorExibicao = os.valor_final || os.orcamento_valor || 0;

  // Mensagens pré-formatadas para WhatsApp
  const msgOrcamento = encodeURIComponent(
    `Olá, *${os.cliente_nome}*! Tudo bem? Aqui é da assistência técnica Scooby.\n\n` +
    `Realizamos o diagnóstico do seu equipamento *${os.marca_modelo}* (OS: *${os.codigo_os}*).\n\n` +
    (os.laudo_tecnico ? `📋 *Laudo Técnico:* ${os.laudo_tecnico}\n` : '') +
    `💰 *Valor Total do Orçamento:* ${formatCurrency(valorExibicao)}\n\n` +
    `Podemos aprovar o início do reparo? Aguardamos sua confirmação!`
  );

  const msgPronto = encodeURIComponent(
    `Olá, *${os.cliente_nome}*! 🎉 Ótima notícia da assistência técnica Scooby!\n\n` +
    `O seu equipamento *${os.marca_modelo}* (OS: *${os.codigo_os}*) está *PRONTO PARA RETIRADA*!\n\n` +
    `💰 *Valor a Pagar:* ${formatCurrency(valorExibicao)}\n` +
    `🏢 *Local:* Scooby Assistência Técnica\n` +
    `📱 *WhatsApp:* (41) 3565-2008\n\n` +
    `Aguardamos você para retirar o seu aparelho!`
  );

  const msgAguardandoPeca = encodeURIComponent(
    `Olá, *${os.cliente_nome}*! Aqui é da assistência técnica Scooby.\n\n` +
    `Informamos que o seu equipamento *${os.marca_modelo}* (OS: *${os.codigo_os}*) está em nossa bancada aguardando a chegada da peça solicitada para conclusão do reparo.\n\n` +
    `Assim que a peça chegar e for instalada, avisaremos você imediatamente!`
  );

  const msgTestes = encodeURIComponent(
    `Olá, *${os.cliente_nome}*! Tudo bem? Aqui é da assistência técnica Scooby.\n\n` +
    `O reparo do seu equipamento *${os.marca_modelo}* (OS: *${os.codigo_os}*) foi finalizado e ele está agora na fase final de testes de qualidade e estresse!\n\n` +
    `Em breve avisaremos para retirada.`
  );

  const handleSendWhatsApp = async () => {
    try {
      await fetch(`/api/os/${os.id}/orcamento-enviado`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
    } catch {}
  };

  const handleStartEdit = () => {
    setEditNome(os.cliente_nome);
    setEditTelefone(os.cliente_telefone);
    setEditWhatsapp(os.cliente_whatsapp || '');
    setEditDocumento(os.cliente_documento || '');
    setEditModelo(os.marca_modelo);
    setEditTipo(os.tipo_equipamento);
    setEditSerie(os.numero_serie || '');
    setEditSenha(os.senha_aparelho || '');
    setEditAcessorios(os.acessorios_inclusos || '');
    setEditCondicoes(os.condicoes_visuais || '');
    setEditDefeito(os.defeito_relatado);
    setEditPrioridade(os.prioridade);
    setEditStatus(os.status);
    setEditMaoDeObra(String(os.orcamento_valor || '0'));
    setEditValorFinal(String(os.valor_final || os.orcamento_valor || '0'));
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/os/${os.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('scooby_token')}`
        },
        body: JSON.stringify({
          cliente_nome: editNome.trim(),
          cliente_telefone: editTelefone.trim(),
          cliente_whatsapp: editWhatsapp.trim() || editTelefone.trim(),
          cliente_documento: editDocumento.trim() || null,
          marca_modelo: editModelo.trim(),
          tipo_equipamento: editTipo,
          numero_serie: editSerie.trim() || null,
          senha_aparelho: editSenha.trim() || null,
          acessorios_inclusos: editAcessorios.trim() || null,
          condicoes_visuais: editCondicoes.trim() || null,
          defeito_relatado: editDefeito.trim(),
          prioridade: editPrioridade,
          status: editStatus,
          orcamento_valor: parseFloat(editMaoDeObra) || 0,
          valor_final: parseFloat(editValorFinal) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar alterações');

      setFeedbackMsg('Ordem de Serviço atualizada com sucesso!');
      setIsEditing(false);
      if (onRefresh) onRefresh();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOS = async () => {
    if (!window.confirm(`⚠️ TEM CERTEZA que deseja EXCLUIR DEFINITIVAMENTE a OS ${os.codigo_os} (${os.marca_modelo})?\n\nEsta ação apagará todo o histórico e não poderá ser desfeita.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/os/${os.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir OS');

      alert(`✅ ${data.message}`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300">
              {os.codigo_os}
            </span>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                {getEquipmentIcon(os.tipo_equipamento)}
                {os.marca_modelo}
              </h3>
              <p className="text-xs text-slate-400">Cliente: <strong className="text-white">{os.cliente_nome}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão de Edição (Admin / Gerente) */}
            {isManagerOrAdmin && !isEditing && (
              <button
                onClick={handleStartEdit}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Editar dados cadastrais, cliente, defeito ou valores"
              >
                <Edit3 className="w-3.5 h-3.5 text-brand-400" />
                <span>Editar OS</span>
              </button>
            )}

            {/* Botão de Exclusão (Admin) */}
            {isAdmin && !isEditing && (
              <button
                onClick={handleDeleteOS}
                disabled={deleting}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Excluir permanentemente esta Ordem de Serviço"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            )}

            <button
              onClick={() => onOpenPrint(os)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Imprimir Comprovante A4"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 px-5">
            <Check className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* MODO DE EDIÇÃO DA OS */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-400" />
                Editar Dados da Ordem de Serviço {os.codigo_os}
              </span>
              <span className="text-[11px] text-amber-400 font-semibold">Modo de Edição Administrativa</span>
            </div>

            {/* Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={editTelefone}
                  onChange={(e) => setEditTelefone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">CPF / Documento</label>
                <input
                  type="text"
                  value={editDocumento}
                  onChange={(e) => setEditDocumento(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Aparelho */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tipo de Equipamento *</label>
                <select
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value as EquipmentType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none cursor-pointer"
                >
                  <option value="NOTEBOOK">Notebook</option>
                  <option value="SMARTPHONE">Smartphone / Celular</option>
                  <option value="PC_DESKTOP">Computador / PC Desktop</option>
                  <option value="CONSOLE">Console / Videogame</option>
                  <option value="IMPRESSORA">Impressora / Multifuncional</option>
                  <option value="TABLET">Tablet / iPad</option>
                  <option value="MONITOR">Monitor / TV</option>
                  <option value="OUTRO">Outro Equipamento</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Marca / Modelo *</label>
                <input
                  type="text"
                  required
                  value={editModelo}
                  onChange={(e) => setEditModelo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Nº de Série / IMEI</label>
                <input
                  type="text"
                  value={editSerie}
                  onChange={(e) => setEditSerie(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Senha e Acessórios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Senha do Aparelho / Padrão</label>
                <input
                  type="text"
                  value={editSenha}
                  onChange={(e) => setEditSenha(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Acessórios Deixados</label>
                <input
                  type="text"
                  value={editAcessorios}
                  onChange={(e) => setEditAcessorios(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Condições Visuais / Avarias</label>
                <input
                  type="text"
                  value={editCondicoes}
                  onChange={(e) => setEditCondicoes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Defeito */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Defeito Relatado pelo Cliente *</label>
              <textarea
                rows={2}
                required
                value={editDefeito}
                onChange={(e) => setEditDefeito(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Status, Prioridade e Valores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-white/5">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Status da OS</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as OSStatus)}
                  className="w-full px-2.5 py-2 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none cursor-pointer text-xs"
                >
                  <option value="TRIAGEM">TRIAGEM</option>
                  <option value="EM_ANDAMENTO">EM ANDAMENTO</option>
                  <option value="AGUARDANDO_PECA">AGUARDANDO PEÇA</option>
                  <option value="AGUARDANDO_APROVACAO">AGUARDANDO APROVAÇÃO</option>
                  <option value="TESTES">TESTES FINAIS</option>
                  <option value="CONCLUIDO">CONCLUÍDO (PRONTO)</option>
                  <option value="ENTREGUE">ENTREGUE</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Prioridade</label>
                <select
                  value={editPrioridade}
                  onChange={(e) => setEditPrioridade(e.target.value as OSPriority)}
                  className="w-full px-2.5 py-2 rounded-xl bg-navy-950 border border-white/10 text-white focus:outline-none cursor-pointer text-xs"
                >
                  <option value="BAIXA">BAIXA</option>
                  <option value="MEDIA">MÉDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="URGENTE">URGENTE</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mão de Obra (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editMaoDeObra}
                  onChange={(e) => setEditMaoDeObra(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-navy-950 border border-white/10 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-emerald-400 block mb-1">Total da OS (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editValorFinal}
                  onChange={(e) => setEditValorFinal(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-navy-950 border border-emerald-500/30 text-emerald-400 font-bold font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-glow-teal flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* MODO DE VISUALIZAÇÃO PADRÃO */
          <>
            {/* Abas e Status */}
            <div className="flex flex-wrap items-center justify-between px-6 pt-4 border-b border-white/10 gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('geral')}
                  className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${activeTab === 'geral' ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  <FileText className="w-4 h-4" />
                  Informações Gerais
                </button>
                <button
                  onClick={() => setActiveTab('laudo')}
                  className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${activeTab === 'laudo' ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  <Wrench className="w-4 h-4" />
                  Laudo & Peças ({pecasList.length})
                </button>
                <button
                  onClick={() => setActiveTab('historico')}
                  className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${activeTab === 'historico' ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  <History className="w-4 h-4" />
                  Histórico ({os.logs ? os.logs.length : 0})
                </button>
              </div>

              <div className="flex items-center gap-2 pb-3">
                <PriorityBadge priority={os.prioridade} />
                <StatusBadge status={os.status} />
              </div>
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* WhatsApp Quick Actions */}
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    WhatsApp do Cliente: <strong>{targetPhone}</strong>
                  </span>
                  {os.orcamento_enviado_em && (
                    <span className="text-[10px] text-slate-400">
                      Último envio: {formatDate(os.orcamento_enviado_em)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                  <a
                    href={`https://wa.me/55${cleanPhone}?text=${msgOrcamento}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleSendWhatsApp}
                    className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10.5px] flex items-center justify-center gap-1 transition-all shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>📋 Enviar Orçamento</span>
                  </a>

                  <a
                    href={`https://wa.me/55${cleanPhone}?text=${msgPronto}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-[10.5px] flex items-center justify-center gap-1 transition-all shadow-sm"
                  >
                    <Send className="w-3 h-3" />
                    <span>🎉 Avisar: Pronto!</span>
                  </a>

                  <a
                    href={`https://wa.me/55${cleanPhone}?text=${msgAguardandoPeca}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[10.5px] flex items-center justify-center gap-1 transition-all border border-white/10"
                  >
                    <Send className="w-3 h-3" />
                    <span>⏳ Avisar: Peça</span>
                  </a>

                  <a
                    href={`https://wa.me/55${cleanPhone}?text=${msgTestes}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[10.5px] flex items-center justify-center gap-1 transition-all border border-white/10"
                  >
                    <Send className="w-3 h-3" />
                    <span>🧪 Avisar: Testes</span>
                  </a>
                </div>
              </div>

              {activeTab === 'geral' && (
                <div className="space-y-4">
                  
                  {/* Dados do Aparelho */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Identificação do Equipamento</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Categoria</span>
                        <span className="font-bold text-white">{getEquipmentLabel(os.tipo_equipamento)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Marca / Modelo</span>
                        <span className="font-bold text-white">{os.marca_modelo}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Nº de Série / IMEI</span>
                        <span className="font-mono text-slate-300">{os.numero_serie || 'Não informado'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Senha do Aparelho</span>
                        <span className="font-mono font-bold text-brand-300">{os.senha_aparelho || 'Sem senha'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Acessórios Deixados</span>
                        <span className="text-slate-300">{os.acessorios_inclusos || 'Nenhum acessório'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Condições Visuais / Avarias</span>
                        <span className="text-slate-300 italic">{os.condicoes_visuais || 'Nenhuma avaria visível informada'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Defeito Relatado */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-1">Defeito Relatado pelo Cliente</h4>
                    <p className="text-slate-200 bg-black/40 p-3 rounded-lg border border-white/5 leading-relaxed">
                      {os.defeito_relatado}
                    </p>
                  </div>

                  {/* SLA e Valores */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-slate-400 block text-[11px]">Técnico Responsável</span>
                      <p className="font-bold text-white mt-0.5">
                        {os.tecnico ? os.tecnico.nome : <span className="text-amber-400">Aguardando Atribuição</span>}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-slate-400 block text-[11px]">Prazo de Entrega (SLA)</span>
                      <p className="font-bold text-white mt-0.5">{formatDate(os.prazo_entrega)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-slate-400 block text-[11px]">Custo das Peças</span>
                      <p className="font-bold text-orange-400 mt-0.5">{formatCurrency(os.custo_pecas || 0)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                      <span className="text-emerald-300 block text-[11px] font-semibold">Valor Total da OS</span>
                      <p className="font-black text-emerald-400 text-sm mt-0.5">{formatCurrency(os.valor_final || os.orcamento_valor)}</p>
                    </div>
                  </div>

                </div>
              )}

              {activeTab === 'laudo' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">Diagnóstico / Laudo Técnico</h4>
                    <p className="text-slate-200 bg-black/40 p-3 rounded-lg border border-white/5 whitespace-pre-line leading-relaxed">
                      {os.laudo_tecnico || 'Nenhum laudo técnico preenchido até o momento.'}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      Tempo trabalhado na bancada: <span className="font-bold text-white">{formatTimeSeconds(os.tempo_bancada_segundos || 0)}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Peças Substituídas / Insumos</h4>
                    {pecasList.length === 0 ? (
                      <p className="text-slate-500 italic">Nenhuma peça registrada nesta OS.</p>
                    ) : (
                      <div className="space-y-2">
                        {pecasList.map((p, i) => (
                          <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-black/30 border border-white/5 text-xs">
                            <span className="text-white font-medium">{p.quantidade}x {p.nome}</span>
                            <span className="font-bold text-emerald-400">{formatCurrency((p.preco_venda || p.preco) * p.quantidade)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'historico' && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">Linha do Tempo de Modificações</h4>
                  {(!os.logs || os.logs.length === 0) ? (
                    <p className="text-slate-500 italic">Nenhum registro de log encontrado.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {os.logs.map((log) => (
                        <div key={log.id} className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                            <History className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-white text-xs">
                                {log.usuario ? log.usuario.nome : 'Sistema'}
                              </span>
                              <span className="text-[10px] text-slate-500">{formatDate(log.createdAt)}</span>
                            </div>
                            <p className="text-slate-300 text-xs mt-0.5">{log.descricao}</p>
                            {log.status_anterior && log.status_novo && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">{log.status_anterior}</span>
                                <span>→</span>
                                <span className="px-1.5 py-0.5 rounded bg-brand-950 border border-brand-500/40 text-brand-300 font-semibold">{log.status_novo}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};