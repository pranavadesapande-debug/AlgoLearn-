import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Bell, Moon, Globe, Shield, Download, Trash2,
  Palette, Volume2, Loader2, Check
} from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [language, setLanguage] = useState('English');
  const [autoQuiz, setAutoQuiz] = useState(true);
  const [clearing, setClearing] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
    toast({ title: `${!darkMode ? 'Dark' : 'Light'} mode enabled` });
  };

  const clearAllData = async () => {
    if (!confirm('This will permanently delete all your notes, quizzes, and flashcards. Continue?')) return;
    setClearing(true);
    try {
      await Promise.all([
        base44.entities.Note.deleteMany({}),
        base44.entities.Quiz.deleteMany({}),
        base44.entities.Flashcard.deleteMany({}),
        base44.entities.ChatSession.deleteMany({}),
      ]);
      toast({ title: 'All study data cleared' });
    } catch (e) {
      toast({ title: 'Could not clear data', variant: 'destructive' });
    } finally {
      setClearing(false);
    }
  };

  const sections = [
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { type: 'toggle', label: 'Dark mode', desc: 'Switch between light and dark themes', value: darkMode, onChange: toggleDark },
      ],
    },
    {
      title: 'AI Preferences',
      icon: SettingsIcon,
      items: [
        { type: 'toggle', label: 'Auto-generate quizzes', desc: 'Create a quiz automatically when you upload notes', value: autoQuiz, onChange: () => setAutoQuiz(!autoQuiz) },
        { type: 'select', label: 'Language', desc: 'AI response language', value: language,
          options: ['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic'],
          onChange: setLanguage },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { type: 'toggle', label: 'Push notifications', desc: 'Get notified about quiz results and progress', value: notifications, onChange: () => setNotifications(!notifications) },
        { type: 'toggle', label: 'Sound effects', desc: 'Play sounds for actions and results', value: sound, onChange: () => setSound(!sound) },
      ],
    },
  ];

  return (
    <div className="mesh-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold">Settings</h1>
          <p className="text-slate-500 mt-1">Customize your Algolearn experience.</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.08 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                  <section.icon className="w-4.5 h-4.5 text-violet-600" style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
                <h3 className="font-display font-bold">{section.title}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {section.items.map((item) => (
                  <div key={item.label} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    {item.type === 'toggle' ? (
                      <button
                        onClick={item.onChange}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${item.value ? 'bg-violet-600' : 'bg-slate-200'}`}
                      >
                        <motion.span
                          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                          animate={{ x: item.value ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    ) : (
                      <select
                        value={item.value} onChange={(e) => item.onChange(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                      >
                        {item.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Data management */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-red-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-red-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-red-500" style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>
              <h3 className="font-display font-bold text-red-600">Data & Privacy</h3>
            </div>
            <div className="divide-y divide-slate-50">
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Download className="w-4.5 h-4.5 text-slate-400" style={{ width: '1.125rem', height: '1.125rem' }} />
                  <div>
                    <p className="font-medium text-sm">Export my data</p>
                    <p className="text-xs text-slate-400 mt-0.5">Download all your notes and progress</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">Coming soon</span>
              </button>
              <button
                onClick={clearAllData} disabled={clearing}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {clearing ? <Loader2 className="w-4.5 h-4.5 text-red-500 animate-spin" style={{ width: '1.125rem', height: '1.125rem' }} /> : <Trash2 className="w-4.5 h-4.5 text-red-500" style={{ width: '1.125rem', height: '1.125rem' }} />}
                  <div>
                    <p className="font-medium text-sm text-red-600">Clear all study data</p>
                    <p className="text-xs text-slate-400 mt-0.5">Delete all notes, quizzes, and flashcards</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </div>

        <p className="text-center text-xs text-slate-300 mt-8">Algolearn v1.0 · Made with care for students</p>
      </div>
    </div>
  );
}
