import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  User as UserIcon, Mail, Calendar, FileText, Brain, Layers, Award,
  TrendingUp, Edit3, Check, X, Flame, BookOpen
} from 'lucide-react';

export default function Profile() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      setName(u?.full_name || '');
      const [n, q, f] = await Promise.all([
        base44.entities.Note.list('-created_date', 100),
        base44.entities.Quiz.list('-created_date', 100),
        base44.entities.Flashcard.list('-created_date', 100),
      ]);
      setNotes(n || []); setQuizzes(q || []); setFlashcards(f || []);
    })();
  }, []);

  const completed = quizzes.filter((q) => q.completed);
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, q) => s + (q.score / (q.total || 1)) * 100, 0) / completed.length)
    : 0;

  const saveName = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: name });
      setUser({ ...user, full_name: name });
      setEditing(false);
      toast({ title: 'Profile updated' });
    } catch (e) {
      toast({ title: 'Could not update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const achievements = [
    { icon: FileText, label: 'First Upload', earned: notes.length >= 1, color: 'from-violet-500 to-purple-600' },
    { icon: Brain, label: 'Quiz Master', earned: completed.length >= 5, color: 'from-indigo-500 to-blue-600' },
    { icon: Layers, label: 'Flashcard Pro', earned: flashcards.length >= 10, color: 'from-sky-500 to-cyan-600' },
    { icon: Flame, label: 'On Fire', earned: avgScore >= 80, color: 'from-amber-500 to-orange-600' },
    { icon: BookOpen, label: 'Scholar', earned: notes.length >= 10, color: 'from-emerald-500 to-teal-600' },
    { icon: Award, label: 'Perfectionist', earned: completed.some((q) => q.score === q.total), color: 'from-fuchsia-500 to-pink-600' },
  ];

  return (
    <div className="mesh-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden mb-6"
        >
          <div className="h-28 bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 relative">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-start justify-between flex-wrap gap-3">
              <div>
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="font-display text-2xl font-extrabold border-b-2 border-violet-400 bg-transparent focus:outline-none"
                    />
                    <button onClick={saveName} disabled={saving} className="p-1 rounded-lg hover:bg-emerald-50">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </button>
                    <button onClick={() => { setEditing(false); setName(user?.full_name || ''); }} className="p-1 rounded-lg hover:bg-red-50">
                      <X className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-extrabold">{user?.full_name || 'Student'}</h1>
                    <button onClick={() => setEditing(true)} className="p-1 rounded-lg hover:bg-slate-100">
                      <Edit3 className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" /> Joined {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'recently'}
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold capitalize">
                {user?.role || 'student'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Notes', value: notes.length, icon: FileText, color: 'from-violet-500 to-purple-600' },
            { label: 'Quizzes', value: completed.length, icon: Brain, color: 'from-indigo-500 to-blue-600' },
            { label: 'Flashcards', value: flashcards.length, icon: Layers, color: 'from-sky-500 to-cyan-600' },
            { label: 'Avg Score', value: `${avgScore}%`, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-slate-100"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                <s.icon className="w-4.5 h-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>
              <p className="text-xl font-display font-extrabold">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Achievements
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {achievements.map((a) => (
              <div
                key={a.label}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all ${
                  a.earned ? 'bg-white border-2 border-violet-100' : 'bg-slate-50 border-2 border-transparent opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  a.earned ? `bg-gradient-to-br ${a.color} shadow-md` : 'bg-slate-200'
                }`}>
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-slate-600 leading-tight">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
