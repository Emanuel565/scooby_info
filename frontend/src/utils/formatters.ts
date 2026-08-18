export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val || 0);
};

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatTimeSeconds = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }
  return `${m}m ${s.toString().padStart(2, '0')}s`;
};

export const formatDuration = formatTimeSeconds;

export const getSLAInfo = (prazoStr?: string | null, status?: string) => {
  if (!prazoStr || status === 'CONCLUIDO' || status === 'ENTREGUE' || status === 'CANCELADO') {
    return {
      label: 'Sem prazo crítico',
      isOverdue: false,
      isUrgent: false,
      color: 'text-slate-400 border-slate-700 bg-slate-800/40'
    };
  }

  const now = new Date().getTime();
  const prazo = new Date(prazoStr).getTime();
  const diffMs = prazo - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    const overdueHours = Math.abs(diffHours);
    const label = overdueHours > 24 
      ? `Atrasado há ${Math.floor(overdueHours / 24)}d` 
      : `Atrasado há ${overdueHours}h`;
    return {
      label,
      isOverdue: true,
      isUrgent: true,
      color: 'text-rose-400 border-rose-500/40 bg-rose-950/40 animate-pulse'
    };
  }

  if (diffHours <= 24) {
    return {
      label: `Expira em ${diffHours}h`,
      isOverdue: false,
      isUrgent: true,
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/40'
    };
  }

  const days = Math.ceil(diffHours / 24);
  return {
    label: `Prazo: ${days} dia${days > 1 ? 's' : ''}`,
    isOverdue: false,
    isUrgent: false,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30'
  };
};

export const getEquipmentLabel = (type: string): string => {
  const map: Record<string, string> = {
    NOTEBOOK: 'Notebook',
    SMARTPHONE: 'Smartphone / Celular',
    PC_DESKTOP: 'Computador / PC Desktop',
    CONSOLE: 'Console / Videogame',
    IMPRESSORA: 'Impressora / Multifuncional',
    TABLET: 'Tablet / iPad',
    MONITOR: 'Monitor / TV',
    OUTRO: 'Outro Equipamento'
  };
  return map[type] || type;
};

export const getRoleLabel = (role: string): string => {
  const map: Record<string, string> = {
    ADMIN: '👑 Administrador',
    GERENTE: '🛡️ Gerente de Oficina',
    ATENDENTE: '💼 Atendente / Recepção',
    TECNICO: '🔧 Técnico Especialista',
    TECNICO_CELULAR: '📱 Técnico Celulares & Consoles',
    TRAINEE: '🎓 Técnico Trainee (Em Treinamento)'
  };
  return map[role] || role;
};