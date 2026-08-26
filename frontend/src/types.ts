export type UserRole = 'ADMIN' | 'GERENTE' | 'ATENDENTE' | 'TECNICO' | 'TECNICO_CELULAR' | 'TRAINEE';

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
  fotos_equipamento?: string | string[];
  
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

export type CondicaoProduto = 'NOVO' | 'USADO' | 'SEMINOVO';

export interface ItemEstoque {
  id: number;
  nome: string;
  categoria: string;
  condicao: CondicaoProduto;
  quantidade: number;
  estoque_minimo: number;
  preco_custo: number;
  preco_venda: number;
  codigo_barras?: string;
  numero_serie?: string;
  garantia_meses: number;
  detalhes_condicao?: string;
  localizacao?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'OUTRO';

export interface ItemVenda {
  id?: number;
  venda_id?: number;
  estoque_item_id?: number;
  nome_produto: string;
  condicao: CondicaoProduto;
  numero_serie?: string;
  garantia_meses: number;
  quantidade: number;
  preco_custo: number;
  preco_unitario: number;
  subtotal: number;
  lucro_item: number;
}

export interface Venda {
  id: number;
  codigo_venda: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_documento?: string;
  forma_pagamento: FormaPagamento;
  valor_total: number;
  custo_total: number;
  lucro_total: number;
  desconto: number;
  troco_para?: number;
  troco_devolvido?: number;
  observacao?: string;
  vendedor_id: number;
  vendedor?: User;
  itens: ItemVenda[];
  createdAt: string;
  updatedAt: string;
}