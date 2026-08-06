// =============================================================================
// AI Sales Controller — thin HTTP layer; all logic stays in the service
// =============================================================================

import { Request, Response } from 'express';
import multer from 'multer';
import { chat, transcribeAudio } from '../services/ai-sales.service';
import { ok, badRequest, serverError } from '../../../lib/response';

function isOpenAIAuthError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { status?: number; code?: string; message?: string };
  return e.status === 401 || e.code === 'invalid_api_key' || Boolean(e.message?.includes('Incorrect API key'));
}

// ── Multer — accept audio in memory (max 25 MB — Whisper's limit) ─────────────

export const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4',
      'audio/ogg', 'audio/x-m4a'];
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    const allowedExts = ['webm', 'wav', 'mp3', 'mpeg', 'mp4', 'ogg', 'm4a'];
    if (allowed.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio type: ${file.mimetype}`));
    }
  },
});

// ── POST /api/v1/admin/ai-sales/chat ─────────────────────────────────────────

export async function handleChat(req: Request, res: Response) {
  const { query, history } = req.body as {
    query: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  };

  if (!query?.trim()) {
    return badRequest(res, 'query is required');
  }

  try {
    const result = await chat(query.trim(), history ?? []);
    return ok(res, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI query failed';
    console.error('[AI Sales] chat error:', err);
    // Surface config errors clearly; keep other errors generic
    if (message.includes('OPENAI_API_KEY')) {
      return badRequest(res, message);
    }
    if (isOpenAIAuthError(err)) {
      return badRequest(res, 'OpenAI API key is invalid or expired. Update OPENAI_API_KEY in backend/.env and restart the backend.');
    }
    return serverError(res, 'AI query failed. Check server logs.');
  }
}

// ── POST /api/v1/admin/ai-sales/transcribe ───────────────────────────────────

export async function handleTranscribe(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return badRequest(res, 'Audio file is required (field name: audio)');
  }

  try {
    const ext = file.originalname.split('.').pop() ?? 'webm';
    const filename = `recording.${ext}`;
    const text = await transcribeAudio(file.buffer, file.mimetype, filename);
    return ok(res, { text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    console.error('[AI Sales] transcribe error:', err);
    if (message.includes('OPENAI_API_KEY')) {
      return badRequest(res, message);
    }
    if (isOpenAIAuthError(err)) {
      return badRequest(res, 'OpenAI API key is invalid or expired. Update OPENAI_API_KEY in backend/.env and restart the backend.');
    }
    return serverError(res, 'Audio transcription failed. Check server logs.');
  }
}
