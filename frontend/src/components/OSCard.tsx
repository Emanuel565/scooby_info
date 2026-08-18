import React from 'react';
import { OrdemServico, UserRole } from '../types';
import { StatusBadge, PriorityBadge } from './Badge';
import { formatCurrency, getSLAInfo } from '../utils/formatters';
import { 
  Laptop, 
  Smartphone, 
  Monitor, 
  Gamepad2, 
  Printer,
  HelpCircle, 
  Clock, 
  User, 
  Eye, 
  UserPlus, 
  Wrench, 
  CheckCircle, 
  PhoneCall,
  Send,
  Check,
  XCircle
} from 'lucide-react';

interface OSCardProps {
  os: OrdemServico;
  currentUserRole: UserRole;
  onViewDetails: (os: OrdemServico) => void;
  onAssign?: (os: OrdemServico) => void;
  onBenchAction?: (os: OrdemServico) => void;
  onDeliver?: (os: OrdemServico) => void;
  onUpdateStatus?: (os: OrdemServico, novoStatus: string, obs?: string) => void;
}

export const OSCard: React.FC<OSCardProps> = ({
  os,
  currentUserRole,
  onViewDetails,
  onAssign,
  onBenchAction,
  onDeliver,
  onUpdateStatus
}) => {
  const sla = getSLAInfo(os.prazo_entrega, os.status);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'NOTEBOOK': return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'SMARTPHONE': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'IMPRESSORA': return <Printer className="w-4 h-4 text-amber-400" />;
      case 'PC_DESKTOP': return <Monitor className="w-4 h-4 text-indigo-400" />;
      case 'CONSOLE': return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const targetPhone = os.cliente_whatsapp || os.cliente_telefone || '';
  const cleanPhone = targetPhone.replace(/\D/g, '');
  const valorExibicao = os.valor_final || os.orcamento_valor || 0;

  // Mensagem pré-formatada para enviar o orçamento via WhatsApp
  const mensagemWhatsApp = encodeURIComponent(
    `Olá, *${os.cliente_nome}*! Tudo bem? Aqui é da assistência técnica Scooby.\n\n` +
    `Realizamos o diagnóstico do seu equipamento *${os.marca_modelo}* (OS: *${os.codigo_os}*).\n\n` +
    `📋 *Laudo Técnico:* ${os.laudo_tecnico || 'Diagnóstico concluído.'}\n` +
    `💰 *Valor Total do Orçamento:* ${formatCurrency(valorExibicao)}\n\n` +
    `Podemos aprovar o início do reparo? Aguardamos sua confirmação!`
  );

  const handleSendQuoteWhatsApp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/os/${os.id}/orcamento-enviado`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('scooby_token')}` }
      });
    } catch {}
  };

  const getHoraEnvio = (dataStr?: string) => {
    if (!dataStr) return '';
    try {
      const d = new Date(dataStr);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(os)}
      className="glass-card rounded-2xl p-4 flex flex-col justify-between group relative overflow-hidden cursor-pointer hover:border-brand-500/40 hover:shadow-glow-teal/20 transition-all duration-200"
    >
      {os.prioridade === 'URGENTE' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />
      )}

      <div className="space-y-2.5">
        {/* Linha 1: Código da OS + Prioridade + Status */}
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-brand-300 whitespace-nowrap">
              {os.codigo_os}
            </span>
            <PriorityBadge priority={os.prioridade} />
          </div>
          <div className="shrink-0">
            <StatusBadge status={os.status} size="sm" />
          </div>
        </div>

        {/* Linha 2: Equipamento e Modelo */}
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <div className="p-1 rounded-lg bg-white/5 border border-white/10 shrink-0">
            {getIcon(os.tipo_equipamento)}
          </div>
          <span className="truncate" title={os.marca_modelo}>{os.marca_modelo}</span>
        </div>

        {/* Linha 3: Resumo do Defeito */}
        <p className="text-xs text-slate-300 line-clamp-2 bg-black/30 p-2 rounded-xl border border-white/5 leading-relaxed">
          <span className="text-slate-400 font-medium">Defeito: </span>
          {os.defeito_relatado}
        </p>

        {/* Linha 4: Seção Especial para Aguardando Aprovação */}
        {os.status === 'AGUARDANDO_APROVACAO' && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/30 text-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">
                Orçamento Pronto
              </span>
              <span className="text-xs font-black text-emerald-400">
                {formatCurrency(valorExibicao)}
              </span>
            </div>

            {os.laudo_tecnico && (
              <p className="text-slate-200 line-clamp-2 text-[11px] italic">
                {os.laudo_tecnico}
              </p>
            )}

            {/* Aviso de Envio de Orçamento Registrado */}
            {os.orcamento_enviado_em ? (
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-[11px] text-emerald-300">
                <span className="flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enviado por {os.orcamento_enviado_por?.nome.split(' ')[0] || 'Atendente'}</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400">{getHoraEnvio(os.orcamento_enviado_em)}</span>
              </div>
            ) : (
              <div className="text-[10px] text-amber-400 font-medium italic">
                ⏳ Orçamento ainda não enviado ao cliente
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
              <a
                href={`https://wa.me/55${cleanPhone}?text=${mensagemWhatsApp}`}
                target="_blank"
                rel="noreferrer"
                onClick={handleSendQuoteWhatsApp}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Enviar orçamento no WhatsApp e registrar quem enviou"
              >
                <Send className="w-3 h-3" />
                <span>{os.orcamento_enviado_em ? 'Reenviar WhatsApp' : 'Enviar WhatsApp'}</span>
              </a>

              {onUpdateStatus && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateStatus(os, 'EM_ANDAMENTO', 'Orçamento APROVADO pelo cliente.')}
                    className="px-2 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Aprovar Orçamento"
                  >
                    <Check className="w-3 h-3" />
                    <span>Aprovou</span>
                  </button>
                  <button
                    onClick={() => onUpdateStatus(os, 'CANCELADO', 'Orçamento RECUSADO pelo cliente.')}
                    className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                    title="Recusar Orçamento"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Linha 5: Cliente e Telefone / WhatsApp */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
          <span className="truncate font-medium text-slate-200 max-w-[140px]" title={os.cliente_nome}>
            {os.cliente_nome}
          </span>
          {cleanPhone && (
            <a 
              href={`https://wa.me/55${cleanPhone}`} 
              target="_blank" 
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-mono shrink-0"
              title="Abrir WhatsApp"
            >
              <PhoneCall className="w-3 h-3" />
              {targetPhone}
            </a>
          )}
        </div>
      </div>

      {/* Rodapé do Card: SLA + Valor + Técnico + Ações */}
      <div className="mt-3 pt-2.5 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${sla.color}`}>
            <Clock className="w-3 h-3" />
            <span>{sla.label}</span>
          </div>

          <span className="font-extrabold text-white text-xs">
            {formatCurrency(valorExibicao)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[130px] text-[11px]">
              {os.tecnico ? os.tecnico.nome : <span className="text-amber-400 italic">Sem técnico</span>}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onViewDetails(os)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Ver Todas as Informações da OS"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {onAssign && (
              <button
                onClick={() => onAssign(os)}
                className="p-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 transition-colors cursor-pointer"
                title="Atribuir / Assumir OS"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            )}

            {(currentUserRole === 'TECNICO' || currentUserRole === 'TECNICO_CELULAR' || currentUserRole === 'ADMIN') && onBenchAction && (os.status === 'EM_ANDAMENTO' || os.status === 'AGUARDANDO_PECA' || os.status === 'TESTES') && (
              <button
                onClick={() => onBenchAction(os)}
                className="px-2 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                title="Abrir Painel de Bancada"
              >
                <Wrench className="w-3 h-3" />
                Bancada
              </button>
            )}

            {(currentUserRole === 'ATENDENTE' || currentUserRole === 'ADMIN' || currentUserRole === 'GERENTE' || currentUserRole === 'TECNICO_CELULAR') && os.status === 'CONCLUIDO' && onDeliver && (
              <button
                onClick={() => onDeliver(os)}
                className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="Entregar ao Cliente"
              >
                <CheckCircle className="w-3 h-3" />
                Entregar
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};