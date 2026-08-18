export type UserRole = 'ADMIN' | 'GERENTE' | 'ATENDENTE' | 'TECNICO' | 'TECNICO_CELULAR';

export type EquipmentType = 
  | 'NOTEBOOK' 
  | 'SMARTPHONE' 
  | 'IMPRESSORA'
  | 'PC_DESKTOP' 
  | 'CONSOLE' 
  | 'TABLET' 
  | 'MONITOR' 
  | 'OUTRO';

export type OSStatus = 
  | 'TRIAGEM' 
  | 'EM_ANDAMENTO' 
  | 'AGUARDANDO_PECA' 
  | 'AGUARDANDO_APROVACAO'
  | 'TESTES' 
  | 'CONCLUIDO' 
  | 'ENTREGUE' 
  | 'CANCELADO';

export type OSPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface User {
  id: number;
  nome: string;
  login: string;
  cargo: UserRole;
  especialidades?: string[];
  avatar?: string;
  status: 'ONLINE' | 'OFFLINE' | 'OCUPADO';
  telefone?: string;
  os_ativas_count?: number;
}

export interface PecaItem {
  id?: number;
  nome: string;
  quantidade: number;
  preco: number;
  preco_custo?: number;
  preco_venda?: number;
}

export interface LogHistorico {
  id: number;
  os_id: number;
  usuario_id: number;
  acao: string;
  descricao: string;
  status_anterior?: string;
  status_novo?: string;
  createdAt: string;
  usuario?: {
    id: number;
    nome: string;
    cargo: UserRole;
    avatar?: string;
  };
}

export interface OrdemServico {
  id: number;
  codigo_os: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_whatsapp?: string;
  cliente_documento?: string;
  cliente_email?: string;
  
  tipo_equipamento: EquipmentType;
  marca_modelo: string;
  numero_serie?: string;
  senha_aparelho?: string;
  acessorios_inclusos?: string;
  condicoes_visuais?: string;
  
  defeito_relatado: string;
  laudo_tecnico?: string;
  pecas_utilizadas?: string | PecaItem[];
  checklist_entrada?: string | Record<string, boolean>;
  checklist_saida?: string | Record<string, boolean>;
  
  orcamento_valor: number;
  valor_final: number;
  custo_pecas?: number;
  lucro_liquido?: number;
  
  orcamento_enviado_em?: string;
  orcamento_enviado_por_id?: number;
  orcamento_enviado_por?: User;
  
  status: OSStatus;
  prioridade: OSPriority;
  prazo_entrega?: string;
  tempo_bancada_segundos: number;
  
  tecnico_id?: number;
  tecnico?: User;
  
  criado_por_id: number;
  criado_por?: User;

  concluido_por_id?: number;
  concluido_por?: User;
  
  logs?: LogHistorico[];
  
  createdAt: string;
  updatedAt: string;
  concluidoEm?: string;
  entregueEm?: string;
}

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: 'NOVA_OS' | 'ATRIBUICAO' | 'STATUS_CHANGE' | 'ALERTA' | 'INFO';
  os_id?: number;
  lida: boolean;
  createdAt: string;
}