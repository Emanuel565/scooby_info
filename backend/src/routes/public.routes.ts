import { Router } from 'express';
import { getPublicOSByCode } from '../controllers/public.controller.js';

const router = Router();

// Rota 100% pública para consulta do cliente via QR Code ou link
router.get('/os/:codigo', getPublicOSByCode);

export default router;