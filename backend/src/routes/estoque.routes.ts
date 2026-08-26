import { Router } from 'express';
import { 
  listEstoque, 
  createEstoqueItem, 
  updateEstoqueItem, 
  deleteEstoqueItem, 
  importDefaultEstoqueItems,
  importarExcelEstoque,
  exportarExcelEstoque,
  listServicosBalcao,
  saveServicosBalcao
} from '../controllers/estoque.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// Todos os colaboradores logados podem consultar o estoque, serviços e exportar inventário
router.get('/', listEstoque);
router.get('/exportar-excel', exportarExcelEstoque);
router.get('/servicos-balcao', listServicosBalcao);

// Gerentes e Administradores podem salvar a tabela de preços de serviços rápidos
router.post('/servicos-balcao', requireRole('ADMIN', 'GERENTE'), saveServicosBalcao);

// Gerentes, Administradores e Atendentes podem cadastrar, alterar e importar planilhas
router.post('/importar-excel', requireRole('ADMIN', 'GERENTE', 'ATENDENTE'), importarExcelEstoque);
router.post('/importar-padroes', requireRole('ADMIN', 'GERENTE', 'ATENDENTE'), importDefaultEstoqueItems);
router.post('/', requireRole('ADMIN', 'GERENTE', 'ATENDENTE'), createEstoqueItem);
router.patch('/:id', requireRole('ADMIN', 'GERENTE', 'ATENDENTE'), updateEstoqueItem);
router.delete('/:id', requireRole('ADMIN', 'GERENTE'), deleteEstoqueItem);

export default router;