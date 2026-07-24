'use client';

// ============================================================
// MediVision AI – AI Assistant Page
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import {
  DEMO_CHAT_MESSAGES, QUICK_ACTIONS, SUPPORTED_LANGUAGES,
  DEMO_AI_RESPONSES,
} from '@/lib/constants/demo-data';
import type { ChatMessage, SupportedLanguage } from '@/lib/types';
import { generateId } from '@/lib/utils';

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_CHAT_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: generateId(), role: 'user', content: text,
      timestamp: new Date().toISOString(), language,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const lower = text.toLowerCase().trim();
    let response = DEMO_AI_RESPONSES.default;

    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you|hlo|hii)$/i.test(lower) || lower === 'hi' || lower === 'hello') {
      response = DEMO_AI_RESPONSES.greeting;
    } else if (lower.includes('asthma') || lower.includes('breath') || lower.includes('wheez') || lower.includes('lung') || lower.includes('inhaler') || lower.includes('cough')) {
      response = DEMO_AI_RESPONSES.asthma;
    } else if (lower.includes('psoriasis') || lower.includes('skin') || lower.includes('rash') || lower.includes('eczema') || lower.includes('report') || lower.includes('explain')) {
      response = DEMO_AI_RESPONSES.psoriasis;
    } else if (lower.includes('diet') || lower.includes('food') || lower.includes('eat') || lower.includes('nutrition') || lower.includes('vitamin')) {
      response = DEMO_AI_RESPONSES.diet;
    } else if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('clinic') || lower.includes('nearby') || lower.includes('appointment')) {
      response = DEMO_AI_RESPONSES.hospital;
    } else if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('pain') || lower.includes('chest pain') || lower.includes('faint')) {
      response = DEMO_AI_RESPONSES.emergency;
    } else if (lower.includes('thank') || lower.includes('thanks') || lower.includes('thx')) {
      response = DEMO_AI_RESPONSES.thanks;
    }

    const aiMsg: ChatMessage = {
      id: generateId(), role: 'assistant', content: response,
      timestamp: new Date().toISOString(), language,
    };
    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === language)!;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100dvh-64px-72px)] lg:h-[calc(100dvh-64px)] max-w-2xl mx-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-base"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>🤖</div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>MediVision Assistant</p>
              <p className="text-xs text-emerald-500 font-medium">● Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                aria-expanded={showLangPicker}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showLangPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-10 z-50 rounded-2xl overflow-hidden shadow-xl min-w-[160px]"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setShowLangPicker(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--border-subtle)]"
                        style={{ color: l.code === language ? 'var(--primary)' : 'var(--text-primary)', fontWeight: l.code === language ? 600 : 400 }}
                      >
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.nativeName}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Voice toggle */}
            <button
              onClick={() => setVoiceOutput(!voiceOutput)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--border-subtle)', color: voiceOutput ? 'var(--primary)' : 'var(--text-muted)' }}
              aria-label={voiceOutput ? 'Disable voice output' : 'Enable voice output'}
            >
              {voiceOutput ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b overflow-x-auto" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex gap-2 w-max">
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.id}
                onClick={() => qa.prompt && sendMessage(qa.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--border-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
              >
                <span>{qa.icon}</span> {qa.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx < 3 ? 0 : 0.1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>🤖</div>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                <p className="text-[10px] mt-1 opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>🤖</div>
                <div className="chat-bubble-assistant flex items-center gap-1.5 py-3 px-4">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.div key={i} className="w-2 h-2 rounded-full"
                      style={{ background: 'var(--text-muted)' }}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-subtle)', background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur)' }}>
          <div className="flex items-center gap-2">
            {/* Voice button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRecording(!isRecording)}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: isRecording ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'var(--border-subtle)',
                color: isRecording ? 'white' : 'var(--text-secondary)',
                boxShadow: isRecording ? '0 0 16px rgba(239,68,68,0.4)' : 'none',
              }}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div key={i} className="waveform-bar"
                      style={{ height: 12, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </motion.button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about your health..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none min-h-[44px]"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              aria-label="Chat input"
            />

            {/* Send */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: input.trim() ? 'linear-gradient(135deg,#0ea5e9,#06b6d4)' : 'var(--border-subtle)',
                color: input.trim() ? 'white' : 'var(--text-muted)',
                boxShadow: input.trim() ? '0 2px 12px rgba(14,165,233,0.4)' : 'none',
              }}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
