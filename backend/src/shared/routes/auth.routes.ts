import { Router }          from 'express';
import rateLimit          from 'express-rate-limit';
import { auth }           from '../middleware/auth.middleware';
import { validateBody }   from '../middleware/validation.middleware';
import { AuthController } from '../controllers/auth.controller';
import { LoginSchema, PinLoginSchema, ManagerApprovalSchema } from '../schemas';

const router = Router();

const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: { message: 'Too many login attempts, please try again after 15 minutes.' } },
});

router.post('/login',            authLimiter, validateBody(LoginSchema),           AuthController.login);
router.post('/pin',              authLimiter, validateBody(PinLoginSchema),        AuthController.pinLogin);
router.post('/manager-approval', authLimiter, auth(), validateBody(ManagerApprovalSchema), AuthController.managerApproval);
router.post('/logout',           AuthController.logout);
router.get('/branches',          AuthController.getBranches);
router.get('/terminals',         AuthController.getTerminals);
router.get('/me',   auth(),      AuthController.me);
router.post('/hash-password',    auth('org_admin'), AuthController.hashPassword);
// Verify current user's PIN (lock-screen unlock) — requires active session
router.post('/verify-pin',       auth(), AuthController.verifyPin);

export default router;
