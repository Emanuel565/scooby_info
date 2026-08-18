import { Router } from 'express';
import { getDashboardStats, getAdminReports } from '../controllers/dashboard.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/stats', requireRole('GERENTE', 'ADMIN', 'ATENDENTE', 'TECNICO_CELULAR'), getDashboardStats);
router.get('/reports', requireRole('ADMIN'), getAdminReports);

export default router;