import { Router } from 'express';
import { 
  listEstoque, 
  createEstoqueItem, 
  updateEstoqueItem, 
  deleteEstoqueItem, 
  importDefaultEstoqueItems 
} from '../controllers/estoque.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// Todos os colaboradores logados podem consultar o estoque
router.get('/', listEstoque);

// Apenas Gerentes e Administradores podem cadastrar, alterar e excluir itens
router.post('/', requireRole('ADMIN', 'GERENTE'), createEstoqueItem);
router.patch('/:id', requireRole('ADMIN', 'GERENTE'), updateEstoqueItem);
router.delete('/:id', requireRole('ADMIN', 'GERENTE'), deleteEstoqueItem);
router.post('/importar-padroes', requireRole('ADMIN', 'GERENTE'), importDefaultEstoqueItems);

export default router;