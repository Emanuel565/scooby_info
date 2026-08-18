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
router.post('/', requireRole('ATENDENTE', 'GERENTE', 'ADMIN', 'TECNICO_CELULAR', 'TECNICO', 'TRAINEE'), createOS);
router.patch('/:id', requireRole('ADMIN', 'GERENTE', 'ATENDENTE', 'TECNICO_CELULAR', 'TECNICO', 'TRAINEE'), updateOS);
router.delete('/:id', requireRole('ADMIN', 'GERENTE', 'ATENDENTE'), deleteOS);
router.post('/:id/orcamento-enviado', requireRole('ATENDENTE', 'GERENTE', 'ADMIN', 'TECNICO_CELULAR', 'TECNICO', 'TRAINEE'), markOrcamentoEnviado);
router.patch('/:id/status', requireRole('TECNICO', 'TECNICO_CELULAR', 'TRAINEE', 'GERENTE', 'ADMIN', 'ATENDENTE'), updateOSStatus);
router.patch('/:id/atribuir', requireRole('GERENTE', 'ADMIN', 'TECNICO_CELULAR', 'TECNICO', 'TRAINEE'), assignTechnician);
router.patch('/:id/laudo', requireRole('TECNICO', 'TECNICO_CELULAR', 'TRAINEE', 'GERENTE', 'ADMIN'), updateLaudoAndParts);

export default router;