// =============================================================================
// AI Sales Routes — protected by JWT; minimum role: manager
// POST /api/v1/admin/ai-sales/chat       — text query → AI answer + data
// POST /api/v1/admin/ai-sales/transcribe — audio blob → English text
// =============================================================================

import { Router } from 'express';
import { z } from 'zod';
import { auth, validateBody } from '../../../shared/middleware';
import {
  handleChat,
  handleTranscribe,
  audioUpload,
} from '../controllers/ai-sales.controller';

const router = Router();

const chatSchema = z.object({
  query: z.string().min(1),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
});

router.post('/chat',       auth('manager'), validateBody(chatSchema), handleChat);
router.post('/transcribe', auth('manager'), audioUpload.single('audio'), handleTranscribe);

export const aiSalesRoutes = router;
