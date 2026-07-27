import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { chatWithNotes } from '@/lib/aiService';
import {
  Send, MessageSquare, Sparkles, Loader2, FileText, Plus, Trash2, Bot, User as UserIcon, Paperclip
} from 'lucide-react';

export default function Chat() {
  const { toast } = useToast();
  const [notes, setNotes] = useState([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const n = await base44.entities.Note.filter({ status: 'ready' }, '-created_date', 50);
        setNotes(n || []);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const toggleNote = (id) => {
    setSelectedNoteIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setSending(true);
    try {
      const selectedNotes = notes.filter((n) => selectedNoteIds.includes(n.id));
      const reply = await chatWithNotes(userMsg.content, selectedNotes, newMessages);
      setMessages((p) => [...p, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }]);
    } catch (e) {
      toast({ title: 'Could not get a response', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => setMessages([]);

  const suggestions = [
    'Summarize the main concepts from my notes',
    'Create 3 practice questions I should be able to answer',
    'Explain the hardest topic in simple terms',
    'What are the key terms I should memorize?',
  ];

  return (
    <div className="mesh-bg min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold">AI Chat</h1>
            <p className="text-xs text-slate-400">Powered by RAG — uses your uploaded notes as context</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Context bar */}
      <div className="px-6 py-3 bg-violet-50/50 border-b border-violet-100 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-violet-700 flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" /> Context:
        </span>
        {selectedNoteIds.length === 0 ? (
          <span className="text-xs text-slate-400">No notes selected — answering from general knowledge</span>
        ) : (
          notes.filter((n) => selectedNoteIds.includes(n.id)).map((n) => (
            <span key={n.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-violet-200 text-xs font-medium text-violet-700">
              <FileText className="w-3 h-3" /> {n.title.slice(0, 20)}{n.title.length > 20 ? '...' : ''}
              <button onClick={() => toggleNote(n.id)} className="hover:text-violet-900"><Plus className="w-3 h-3 rotate-45" /></button>
            </span>
          ))
        )}
        <button onClick={() => setShowNotes(!showNotes)} className="ml-auto text-xs font-semibold text-violet-600 hover:underline">
          {showNotes ? 'Hide' : 'Select notes'}
        </button>
      </div>

      {/* Notes selector */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-slate-100 bg-white"
          >
            <div className="px-6 py-3 max-h-48 overflow-y-auto">
              {notes.length ? (
                <div className="space-y-1">
                  {notes.map((n) => (
                    <button
                      key={n.id} onClick={() => toggleNote(n.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        selectedNoteIds.includes(n.id) ? 'bg-violet-50 border border-violet-200' : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <FileText className={`w-4 h-4 ${selectedNoteIds.includes(n.id) ? 'text-violet-600' : 'text-slate-400'}`} />
                      <span className="text-sm flex-1 truncate">{n.title}</span>
                      {selectedNoteIds.includes(n.id) && <Sparkles className="w-3.5 h-3.5 text-violet-500" />}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No notes uploaded yet. Upload a PDF first to enable RAG chat.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/25">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display font-bold text-xl mb-2">Ask me anything</h2>
              <p className="text-sm text-slate-400 mb-6">Select notes above for context-specific answers, or ask a general question.</p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => setInput(s)}
                    className="text-left text-sm p-3 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user' ? 'bg-slate-200' : 'bg-gradient-to-br from-sky-500 to-cyan-600'
                  }`}>
                    {m.role === 'user' ? <UserIcon className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    m.role === 'user' ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white border border-slate-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-xl border-t border-slate-100">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about your notes..."
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
          />
          <button
            onClick={send} disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
