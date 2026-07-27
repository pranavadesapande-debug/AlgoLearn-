import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadialBarChart, RadialBar,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import {
  FileText, Brain, Layers, MessageSquare, TrendingUp, Clock, Plus,
  ArrowRight, Flame, Trophy, BookOpen, Target, BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const [n, q, f] = await Promise.all([
          base44.entities.Note.list('-created_date', 50),
          base44.entities.Quiz.list('-created_date', 50),
          base44.entities.Flashcard.list('-created_date', 50),
        ]);
        setNotes(n || []);
        setQuizzes(q || []);
        setFlashcards(f || []);
      } catch (e) {
        toast({ title: 'Could not load dashboard', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completedQuizzes = quizzes.filter((q) => q.completed);
  const avgScore = completedQuizzes.length
    ? Math.round(completedQuizzes.reduce((s, q) => s + (q.score / (q.total || 1)) * 100, 0) / completedQuizzes.length)
    : 0;
  const reviewedCards = flashcards.filter((f) => f.reviewed).length;

  const subjectData = (() => {
    const map = {};
    notes.forEach((n) => { const s = n.subject || 'General'; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  const quizTrend = completedQuizzes.slice(-6).map((q, i) => ({
    name: `Q${i + 1}`,
    score: Math.round((q.score / (q.total || 1)) * 100),
  }));

  const COLORS = ['#7c3aed', '#6366f1', '#0ea5e9', '#a855f7', '#ec4899'];

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <AnimatedBackground />
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Notes Uploaded', value: notes.length, icon: FileText, color: 'from-violet-500 to-purple-600', to: '/upload' },
    { label: 'Quizzes Taken', value: completedQuizzes.length, icon: Brain, color: 'from-indigo-500 to-blue-600', to: '/quiz' },
    { label: 'Flashcards', value: flashcards.length, icon: Layers, color: 'from-sky-500 to-cyan-600', to: '/quiz' },
    { label: 'Avg Quiz Score', value: `${avgScore}%`, icon: TrendingUp, color: 'from-emerald-500 to-teal-600', to: '/quiz' },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground variant="dashboard" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <p className="text-sm text-slate-500">Welcome back,</p>
            <h1 className="font-display text-3xl font-extrabold">{user?.full_name || user?.email?.split('@')[0] || 'Student'}</h1>
          </div>
          <Link to="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" /> Upload new note
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={s.to} className="block bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-display font-extrabold">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Upload & Summarize', desc: 'Turn a PDF into study material', to: '/upload', color: 'from-violet-500 to-purple-600' },
            { icon: MessageSquare, label: 'Chat with Notes', desc: 'Ask questions about your material', to: '/chat', color: 'from-sky-500 to-cyan-600' },
            { icon: Brain, label: 'Take a Quiz', desc: 'Test your knowledge', to: '/quiz', color: 'from-emerald-500 to-teal-600' },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <a.icon className="w-5.5 h-5.5 text-white" style={{ width: '1.375rem', height: '1.375rem' }} />
              </div>
              <h3 className="font-display font-bold mb-1">{a.label}</h3>
              <p className="text-sm text-slate-500">{a.desc}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 mt-3">
                Open <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Quiz trend */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">Quiz Score Trend</h3>
              <TrendingUp className="w-5 h-5 text-slate-300" />
            </div>
            {quizTrend.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={quizTrend}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="score" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Take a quiz to see your trend" />
            )}
          </div>

          {/* Subject distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">Subjects</h3>
              <Target className="w-5 h-5 text-slate-300" />
            </div>
            {subjectData.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {subjectData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Upload notes to see subjects" />
            )}
          </div>
        </div>

        {/* Recent notes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Recent Notes</h3>
            <Link to="/upload" className="text-xs font-semibold text-violet-600 hover:underline">View all</Link>
          </div>
          {notes.length ? (
            <div className="space-y-2">
              {notes.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{n.title}</p>
                    <p className="text-xs text-slate-400">{n.subject || 'General'} · {n.status}</p>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(n.created_date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No notes yet. Upload your first PDF to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
        <BarChart3 className="w-6 h-6 text-slate-200" />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
