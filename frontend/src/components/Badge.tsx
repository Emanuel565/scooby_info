import React from 'react';
import { OSStatus, OSPriority, UserRole } from '../types';

export const StatusBadge: React.FC<{ status: OSStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const configs: Record<OSStatus, { label: string; bg: string; text: string; border: string }> = {
    TRIAGEM: {
      label: 'Triagem',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30'
    },
    EM_ANDAMENTO: {
      label: 'Em Andamento',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    },
    AGUARDANDO_PECA: {
      label: 'Aguard. Peça',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    AGUARDANDO_APROVACAO: {
      label: size === 'sm' ? 'Aguard. Aprovação' : 'Aguardando Aprovação',
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/40'
    },
    TESTES: {
      label: 'Em Testes',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30'
    },
    CONCLUIDO: {
      label: 'Pronto / Concluído',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    ENTREGUE: {
      label: 'Entregue',
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30'
    },
    CANCELADO: {
      label: 'Cancelado',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30'
    }
  };

  const c = configs[status] || configs.TRIAGEM;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap shrink-0 leading-none ${c.bg} ${c.text} ${c.border} ${padding}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current shrink-0" />
      {c.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: OSPriority }> = ({ priority }) => {
  const configs: Record<OSPriority, { label: string; style: string }> = {
    BAIXA: { label: 'Baixa', style: 'text-slate-400 border-slate-700 bg-slate-800/40' },
    MEDIA: { label: 'Média', style: 'text-sky-400 border-sky-500/30 bg-sky-950/40' },
    ALTA: { label: 'Alta', style: 'text-amber-400 border-amber-500/30 bg-amber-950/40 font-semibold' },
    URGENTE: { label: 'URGENTE', style: 'text-rose-400 border-rose-500/50 bg-rose-950/60 font-bold animate-pulse' }
  };

  const c = configs[priority] || configs.MEDIA;

  return (
    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 leading-none ${c.style}`}>
      {c.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const configs: Record<UserRole, { label: string; style: string }> = {
    ADMIN: { label: 'Administrador', style: 'bg-brand-500/20 text-brand-300 border-brand-500/40' },
    GERENTE: { label: 'Gerente', style: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    ATENDENTE: { label: 'Atendente Balcão', style: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
    TECNICO: { label: 'Técnico Geral', style: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    TECNICO_CELULAR: { label: 'Técnico Celular (Híbrido)', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
  };

  const c = configs[role] || configs.TECNICO;

  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${c.style}`}>
      {c.label}
    </span>
  );
};