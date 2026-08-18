import { Router } from 'express';
import { 
  listMessages, 
  sendMessage, 
  markAsRead, 
  listTeamMembers 
} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/membros', listTeamMembers);
router.get('/mensagens', listMessages);
router.post('/mensagens', sendMessage);
router.patch('/marcar-lida', markAsRead);

export default router;
