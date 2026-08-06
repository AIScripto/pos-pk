// =============================================================================
// AI Sales API client
// All business logic stays on the backend — we only send/receive here.
// =============================================================================

import { api } from './client';
import { API_URL } from '@/config/api';

const BASE_URL = API_URL;

export interface AiChartHint {
  type:  'bar' | 'line' | 'pie';
  xKey:  string;
  yKey:  string;
  label: string;
}

export interface AiToolResult {
  tool:  string;
  data:  unknown;
  chart: AiChartHint | null;
}

export interface AiChatResponse {
  answer:      string;
  toolResults: AiToolResult[];
}

export interface ChatMessage {
  role:    'user' | 'assistant';
  content: string;
}

// ── POST /admin/ai-sales/chat ─────────────────────────────────────────────────

export async function sendSalesQuery(
  query:   string,
  history: ChatMessage[] = [],
): Promise<AiChatResponse> {
  return api.post<AiChatResponse>('/admin/ai-sales/chat', { query, history });
}

// ── POST /admin/ai-sales/transcribe ──────────────────────────────────────────
// Sends raw audio blob; backend calls Whisper and returns English text.

export async function transcribeVoice(audioBlob: Blob): Promise<string> {
  const token = localStorage.getItem('pos-app-token');

  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const res = await fetch(`${BASE_URL}/admin/ai-sales/transcribe`, {
    method:  'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body:    formData,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Transcription failed (${res.status})`);
  }

  return (json?.data?.text ?? '') as string;
}
