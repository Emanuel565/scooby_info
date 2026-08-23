import { Router } from 'express';
import { createVenda, listVendas, getVendaById } from '../controllers/venda.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// Todos os colaboradores logados podem acessar o PDV e realizar vendas
router.post('/', createVenda);
router.get('/', listVendas);
router.get('/:id', getVendaById);

export default router;
