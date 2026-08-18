import { Router } from 'express';
import { 
  listOS, 
  getOSById, 
  createOS, 
  updateOS,
  deleteOS,
  updateOSStatus, 
  assignTechnician, 
  updateLaudoAndParts,
  markOrcamentoEnviado
} from '../controllers/os.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Todas as rotas de OS exigem autenticação
router.use(authMiddleware);

router.get('/', listOS);
router.get('/:id', getOSById);
router.post('/', requireRole('ATENDENTE', 'GERENTE', 'ADMIN', 'TECNICO_CELULAR'), createOS);
router.patch('/:id', requireRole('ADMIN', 'GERENTE', 'ATENDENTE', 'TECNICO_CELULAR'), updateOS);
router.delete('/:id', requireRole('ADMIN'), deleteOS);
router.post('/:id/orcamento-enviado', requireRole('ATENDENTE', 'GERENTE', 'ADMIN', 'TECNICO_CELULAR', 'TECNICO'), markOrcamentoEnviado);
router.patch('/:id/status', requireRole('TECNICO', 'TECNICO_CELULAR', 'GERENTE', 'ADMIN', 'ATENDENTE'), updateOSStatus);
router.patch('/:id/atribuir', requireRole('GERENTE', 'ADMIN', 'TECNICO_CELULAR', 'TECNICO'), assignTechnician);
router.patch('/:id/laudo', requireRole('TECNICO', 'TECNICO_CELULAR', 'GERENTE', 'ADMIN'), updateLaudoAndParts);

export default router;