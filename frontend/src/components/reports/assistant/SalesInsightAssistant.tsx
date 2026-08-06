import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Mic, MicOff, RotateCcw, Send } from 'lucide-react';
import {
  sendSalesQuery,
  transcribeVoice,
  type ChatMessage,
} from '@/lib/api/ai-sales.api';
import { MessageBubble, TypingIndicator } from './ChatPrimitives';
import { SuggestionPanel } from './SuggestionPanel';
import type { AssistantMessage } from './types';

export function SalesInsightAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, loading, scrollToBottom]);

  const buildHistory = useCallback((): ChatMessage[] => (
    messages.slice(-10).map(m => ({
      role: m.role,
      content: m.role === 'user' ? m.content : (m.response?.answer ?? m.content),
    }))
  ), [messages]);

  const sendQuery = useCallback(async (query: string) => {
    if (!query.trim() || loading) return;

    setError(null);
    const userMsg: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendSalesQuery(query.trim(), buildHistory());
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        response,
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
    }
  }, [buildHistory, loading]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm',
      });

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 1000) return;

        setTranscribing(true);
        try {
          const text = await transcribeVoice(blob);
          if (text.trim()) await sendQuery(text.trim());
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Transcription failed');
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start(250);
      mediaRef.current = recorder;
      setRecording(true);
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  }, [sendQuery]);

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
  }, []);

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input);
    }
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <SuggestionPanel onSelect={sendQuery} disabled={loading || transcribing} />

      <div ref={chatContainerRef} className="min-h-0 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-8 py-6 pos-scrollbar">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col space-y-6">
          {messages.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw className="h-3 w-3" /> Clear chat
              </button>
            </div>
          )}

          {isEmpty && (
            <div className="flex h-full flex-col items-center justify-center space-y-3 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm">
                <Bot className="h-7 w-7" />
              </div>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">Your insight assistant is ready</p>
              <p className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                Pick a category above, tap a suggestion, or type your own question below.
              </p>
            </div>
          )}

          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}

          {(loading || transcribing) && (
            <TypingIndicator label={transcribing ? 'Transcribing your voice...' : 'Querying live sales data...'} />
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/40 px-4 py-3">
              <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/60 px-2.5 py-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20">
            <button
              onClick={() => recording ? stopRecording() : startRecording()}
              disabled={loading || transcribing}
              className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all ${recording ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white'} disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {recording && <span className="absolute inset-0 animate-ping rounded-xl bg-red-500 opacity-25" />}
              {recording ? <MicOff className="relative z-10 h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                recording ? 'Recording... tap to stop' :
                transcribing ? 'Transcribing audio...' :
                'Ask about sales, revenue, products, customers...'
              }
              disabled={loading || recording || transcribing}
              className="flex-1 bg-transparent px-1 py-1 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:cursor-not-allowed"
            />

            <button
              onClick={() => sendQuery(input)}
              disabled={!input.trim() || loading || recording || transcribing}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Enter</span> to send &nbsp;·&nbsp;
            <span className="font-semibold text-slate-600 dark:text-slate-400">Mic</span> for voice in any language &nbsp;·&nbsp;
            Data queried live from your POS database
          </p>
        </div>
      </div>
    </div>
  );
}
