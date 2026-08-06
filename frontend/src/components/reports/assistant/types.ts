import type { AiChatResponse } from '@/lib/api/ai-sales.api';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  response?: AiChatResponse;
}
