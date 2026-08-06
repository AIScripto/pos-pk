import { Bot } from 'lucide-react';
import { AiAnswerText, ToolResultBlock } from './AssistantResponse';
import type { AssistantMessage } from './types';

export function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 dark:bg-blue-400 [animation-delay:300ms]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
        </div>
      </div>
    </div>
  );
}

export function MessageBubble({ msg }: { msg: AssistantMessage }) {
  const isUser = msg.role === 'user';
  const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`group flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {isUser ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
          <span className="text-[10px] font-extrabold text-white">YOU</span>
        </div>
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={`flex max-w-[88%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-3 shadow-md shadow-blue-500/20">
            <p className="text-sm leading-relaxed font-semibold text-white">{msg.content}</p>
          </div>
        ) : (
          <div className="w-full rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm text-slate-900 dark:text-slate-100">
            <AiAnswerText text={msg.content} />
            {msg.response?.toolResults.map((result, i) => (
              <ToolResultBlock key={i} result={result} />
            ))}
          </div>
        )}
        <span className="px-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">{time}</span>
      </div>
    </div>
  );
}
