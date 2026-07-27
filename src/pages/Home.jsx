import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';
import {
  GraduationCap, FileText, Brain, MessageSquare, BarChart3, Sparkles,
  ArrowRight, Upload, Zap, Shield, Layers, BookOpen
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'PDF Summaries',
    desc: 'Upload any PDF and get instant, structured summaries with key points extracted automatically.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Brain,
    title: 'Smart Quizzes',
    desc: 'AI-generated quizzes tailored to your notes. Test yourself and track improvement over time.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    icon: Layers,
    title: 'Flashcards',
    desc: 'Auto-generated flashcards from your study material. Spaced repetition built for retention.',
    color: 'from-sky-500 to-cyan-600',
  },
  {
    icon: MessageSquare,
    title: 'RAG-Powered Chat',
    desc: 'Chat with your notes in real-time. Our AI answers using your uploaded documents as context.',
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracker',
    desc: 'Visualize your study activity, quiz scores, and knowledge growth with beautiful charts.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: BookOpen,
    title: 'Diagrams & Images',
    desc: 'AI-generated diagrams and image references to make complex concepts click instantly.',
    color: 'from-amber-500 to-orange-600',
  },
];

const steps = [
  { num: '01', title: 'Upload your notes', desc: 'Drop in any PDF — lecture slides, textbooks, research papers.' },
  { num: '02', title: 'AI processes everything', desc: 'Summaries, flashcards, and quizzes generated in seconds.' },
  { num: '03', title: 'Study & chat in real-time', desc: 'Ask questions, take quizzes, and track your growth.' },
];

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="w-3.5 h-3.5 absolute -top-0.5 -right-0.5 text-sky-400" />
            </div>
            <span className="font-display font-extrabold text-xl">Algolearn</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2">
              Sign in
            </Link>
            <Link to="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl px-5 py-2.5 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-xs font-semibold mb-6"
        >
          <Zap className="w-3.5 h-3.5" /> Powered by RAG — your notes, in real-time
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight"
        >
          Study smarter with<br />
          <span className="gradient-text">your own AI tutor</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          Upload your PDFs and Algolearn turns them into summaries, flashcards,
          quizzes, and a real-time chat assistant that actually understands your material.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register" className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transition-all">
            Start learning free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">
            <MessageSquare className="w-4 h-4" /> See it in action
          </Link>
        </motion.div>

        {/* Floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="gradient-border rounded-2xl p-2 shadow-2xl shadow-violet-500/10">
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="ml-3 text-xs text-slate-400 font-medium">algolearn.app/dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-4 p-6 text-left">
                <div className="col-span-1 space-y-3">
                  {['Summary', 'Flashcards', 'Quiz', 'Chat'].map((t, i) => (
                    <div key={t} className={`p-3 rounded-lg text-xs font-medium ${i === 0 ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-slate-50 text-slate-500'}`}>
                      {t}
                    </div>
                  ))}
                </div>
                <div className="col-span-2 space-y-3">
                  <div className="h-3 bg-slate-100 rounded-full w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-3 bg-slate-100 rounded-full w-5/6"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-violet-500" />
                    </div>
                    <div className="flex-1 h-20 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-sky-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            Everything you need to <span className="gradient-text">master any subject</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg">One platform. Six powerful AI tools. Built for students.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative bg-white rounded-2xl p-7 border border-slate-100 hover:border-transparent hover:shadow-2xl hover:shadow-violet-500/10 transition-all overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[hsl(var(--sidebar-background))] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Three steps to your AI tutor
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-display font-extrabold text-white/10 mb-4">{s.num}</div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{s.title}</h3>
                <p className="text-white/50 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/register" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-violet-700 font-semibold hover:bg-white/90 transition-all">
              Create your account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-violet-600" />
            <span className="font-display font-bold">Algolearn</span>
            <span className="text-sm text-slate-400 ml-2">© 2026. Built for students.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Secure</span>
            <span className="flex items-center gap-1.5"><Upload className="w-4 h-4" /> Cloud sync</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> AI-native</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
