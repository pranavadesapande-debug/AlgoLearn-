import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  Brain, Loader2, CheckCircle, XCircle, Trophy, RotateCcw, ChevronRight, ListChecks, Layers
} from 'lucide-react';

export default function Quiz() {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const q = await base44.entities.Quiz.list('-created_date', 50);
        setQuizzes(q || []);
      } catch (e) {
        toast({ title: 'Could not load quizzes', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (active) {
    return <QuizPlayer quiz={active} onExit={() => setActive(null)} toast={toast} onUpdate={setActive} />;
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold">Quiz</h1>
          <p className="text-slate-500 mt-1">Test your knowledge with AI-generated quizzes from your notes.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="font-display font-bold text-lg mb-1">No quizzes yet</h3>
            <p className="text-sm text-slate-400">Upload a PDF to auto-generate your first quiz.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {quizzes.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  {q.completed && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      {Math.round((q.score / (q.total || 1)) * 100)}%
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold mb-1">{q.title}</h3>
                <p className="text-xs text-slate-400 mb-4">{q.subject || 'General'} · {q.questions?.length || 0} questions</p>
                <button
                  onClick={() => setActive(q)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-violet-50 hover:text-violet-700 text-slate-600 font-medium text-sm transition-all"
                >
                  {q.completed ? 'Retake quiz' : 'Start quiz'} <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuizPlayer({ quiz, onExit, toast, onUpdate }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const question = quiz.questions[current];
  const total = quiz.questions.length;

  const selectAnswer = (idx) => {
    setAnswers({ ...answers, [current]: idx });
  };

  const next = () => {
    if (current < total - 1) setCurrent(current + 1);
    else finish();
  };

  const finish = async () => {
    const score = quiz.questions.reduce((s, q, i) => s + (answers[i] === q.correct_index ? 1 : 0), 0);
    try {
      const updated = await base44.entities.Quiz.update(quiz.id, { score, total, completed: true });
      onUpdate(updated);
      toast({ title: `Quiz complete! Score: ${score}/${total}` });
    } catch (e) {
      toast({ title: 'Saved locally', description: 'Could not save score to server' });
    }
    setShowResult(true);
  };

  if (showResult) {
    const score = quiz.questions.reduce((s, q, i) => s + (answers[i] === q.correct_index ? 1 : 0), 0);
    const pct = Math.round((score / total) * 100);
    return (
      <div className="mesh-bg min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 max-w-md w-full text-center shadow-xl"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            pct >= 70 ? 'bg-emerald-100' : pct >= 40 ? 'bg-amber-100' : 'bg-red-100'
          }`}>
            <Trophy className={`w-10 h-10 ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'}`} />
          </div>
          <h2 className="font-display text-3xl font-extrabold mb-1">{pct}%</h2>
          <p className="text-slate-500 mb-6">You scored {score} out of {total}</p>
          <div className="space-y-2 text-left mb-6 max-h-48 overflow-y-auto">
            {quiz.questions.map((q, i) => {
              const correct = answers[i] === q.correct_index;
              return (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {correct ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                  <span className="text-slate-600">{q.question}</span>
                </div>
              );
            })}
          </div>
          <button onClick={onExit} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold">
            Back to quizzes
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onExit} className="text-sm text-slate-400 hover:text-slate-600">← Exit</button>
          <span className="text-sm font-medium text-slate-500">Question {current + 1} of {total}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
            animate={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-white rounded-2xl p-6 border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">Q{current + 1}</span>
              <span className="text-xs text-slate-400">{quiz.subject || 'General'}</span>
            </div>
            <h2 className="font-display font-bold text-lg mb-5">{question.question}</h2>
            <div className="space-y-2">
              {question.options.map((opt, i) => {
                const selected = answers[current] === i;
                return (
                  <button
                    key={i} onClick={() => selectAnswer(i)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      selected ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                               : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`inline-flex w-6 h-6 rounded-md items-center justify-center text-xs mr-3 ${
                      selected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={next} disabled={answers[current] === undefined}
          className="mt-6 w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {current < total - 1 ? 'Next question' : 'Finish quiz'}
        </button>
      </div>
    </div>
  );
}
