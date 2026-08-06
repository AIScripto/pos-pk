import { Router } from 'express';
import { upload, uploadImage } from '../controllers/upload.controller';
import { auth } from '../../../shared/middleware/auth.middleware';

const router = Router();

// POST /admin/uploads/image/:module  — e.g. /admin/uploads/image/products
// Image uploads affect managed catalog/admin content, so keep them behind admin auth.
router.post('/image/:module', auth('org_admin'), upload.single('image'), uploadImage);

export default router;
