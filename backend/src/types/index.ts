import { Request } from 'express';

export type UserRole = 'ADMIN' | 'GERENTE' | 'ATENDENTE' | 'TECNICO' | 'TECNICO_CELULAR';

export type OSStatus = 
  | 'TRIAGEM' 
  | 'EM_ANDAMENTO' 
  | 'AGUARDANDO_PECA' 
  | 'TESTES' 
  | 'CONCLUIDO' 
  | 'ENTREGUE' 
  | 'CANCELADO';

export type OSPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface UserTokenPayload {
  id: number;
  nome: string;
  login: string;
  cargo: UserRole;
  especialidades: string[];
}

export interface AuthRequest extends Request {
  user?: UserTokenPayload;
}
