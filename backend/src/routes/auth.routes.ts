import { Router } from 'express';
import { 
  login, 
  me, 
  listUsers, 
  createUser, 
  updateUser,
  deleteUser, 
  resetUserPassword,
  getPublicUsers,
  downloadDatabaseBackup
} from '../controllers/auth.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Rotas públicas
router.post('/login', login);
router.get('/public-users', getPublicUsers);

// Rotas protegidas
router.use(authMiddleware);
router.get('/me', me);
router.get('/users', listUsers);
router.get('/backup', requireRole('ADMIN'), downloadDatabaseBackup);

// Apenas ADMINISTRADOR pode cadastrar, editar perfis e redefinir senhas
router.post('/users', requireRole('ADMIN'), createUser);
router.patch('/users/:id', requireRole('ADMIN'), updateUser);
router.patch('/users/:id/reset-password', requireRole('ADMIN'), resetUserPassword);
router.delete('/users/:id', requireRole('ADMIN'), deleteUser);

export default router;