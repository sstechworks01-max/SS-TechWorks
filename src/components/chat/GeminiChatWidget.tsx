import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  Copy,
  Check,
  Bot,
  User,
  ExternalLink,
  MessageCircle,
  WhatsAppIcon,
} from '../common/IconHelper';
import { companyInfo } from '../../data/companyData';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: `Hello! I'm the **SS TECHWORKS AI Solution Architect**.\n\nI can help you explore technical solutions for your business:
• **Web Platforms**: Scalable React, TypeScript & full-stack web applications
• **Android Apps**: Native & cross-platform mobile apps built for performance
• **Custom Software**: Tailored business tools, CRM/ERP backends & APIs
• **AI Integrations**: Gemini models, automation workflows & media synthesis
• **Project Estimation**: Timelines, tech stack recommendations & budgets

How can I help engineer your next digital solution? You can also connect directly with our engineering team on **WhatsApp at ${companyInfo.whatsappFormatted}**.`,
    timestamp: 'Just now',
  },
];

const QUICK_PROMPTS = [
  { label: '🚀 MVP Development Quote', prompt: 'What is the typical timeline and process for building a minimum viable product (MVP)?' },
  { label: '📱 Android App Engineering', prompt: 'Tell me about SS TECHWORKS capabilities for Android and mobile application development.' },
  { label: '🤖 Custom AI Integrations', prompt: 'How can SS TECHWORKS integrate Google Gemini or AI features into an existing business workflow?' },
  { label: '💬 Chat on WhatsApp', prompt: 'WHATSAPP_ACTION' },
];

export const GeminiChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('sstechworks_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('sstechworks_chat_history', JSON.stringify(messages));
    } catch {
      // Ignore
    }
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    sessionStorage.removeItem('sstechworks_chat_history');
  };

  const openWhatsApp = (customText?: string) => {
    const text = customText || `Hi SS TECHWORKS, I would like to discuss a project.`;
    const url = `https://wa.me/91${companyInfo.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    if (text === 'WHATSAPP_ACTION') {
      openWhatsApp();
      return;
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for the server-side Gemini 3.8 Flash route
      const formattedHistory = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedHistory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'I am ready to help you plan your digital solution.';

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I ran into a temporary connection issue. Please feel free to reach out directly to our engineering team on WhatsApp at **${companyInfo.whatsappFormatted}** or email us at **${companyInfo.email}** for immediate assistance!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Widget Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Floating WhatsApp Quick Link */}
        <a
          href={companyInfo.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/30 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          title={`Chat with SS TECHWORKS on WhatsApp: ${companyInfo.whatsappFormatted}`}
          aria-label="Direct WhatsApp Contact"
        >
          <WhatsAppIcon className="w-5 h-5 text-white fill-current" />
          <span className="hidden sm:inline text-xs font-semibold tracking-wide">
            WhatsApp
          </span>
          <span className="hidden md:inline text-[11px] opacity-90 font-mono">
            7697916086
          </span>
        </a>

        {/* Gemini Chatbot Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-900/30 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={isOpen ? 'Close Gemini AI Assistant' : 'Open Gemini AI Assistant'}
          aria-expanded={isOpen}
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-blue-700 animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide">
            {isOpen ? 'Close Chat' : 'Gemini AI Chat'}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-blue-200 hidden sm:inline" />
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="SS TECHWORKS Gemini AI Consultant"
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/30 overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
                <Sparkles className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-tight text-white">SS TECHWORKS AI</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Online · Technical Consultant</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Restart Conversation"
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Restart Conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Minimize Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick WhatsApp Bar inside the Chat */}
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 shrink-0">
            <div className="flex items-center gap-2">
              <WhatsAppIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current shrink-0" />
              <span className="font-medium text-[11px] sm:text-xs">
                Need immediate human reply?
              </span>
            </div>
            <a
              href={companyInfo.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              <span>+91 7697916086</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50 dark:bg-[#07090e]/50">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[84%] space-y-1 ${isAssistant ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap break-words ${
                        isAssistant
                          ? 'bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 shadow-xs'
                          : 'bg-blue-600 text-white rounded-br-xs'
                      }`}
                    >
                      {m.content}
                    </div>

                    <div
                      className={`flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 px-1 ${
                        isAssistant ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {isAssistant && (
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                          title="Copy message"
                          aria-label="Copy message"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="ml-1 text-[11px] font-medium">Formulating solution...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (if chat is short or empty) */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Suggested Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item.prompt === 'WHATSAPP_ACTION') {
                        openWhatsApp();
                      } else {
                        sendMessage(item.prompt);
                      }
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-[#151c2d] hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 transition-colors text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-[#0b0f19] border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about apps, websites, AI, or quotes..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#07090e] border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white disabled:text-slate-500 transition-colors shrink-0 shadow-sm shadow-blue-600/20"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
              <span>Powered by Gemini 3.8 Flash</span>
              <button
                onClick={() => openWhatsApp()}
                className="hover:text-emerald-500 transition-colors flex items-center gap-1"
              >
                <WhatsAppIcon className="w-2.5 h-2.5 fill-current" />
                <span>Direct WhatsApp: 7697916086</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
