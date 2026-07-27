import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { generateNoteSummary, generateFlashcards, generateQuiz } from '@/lib/aiService';
import {
  Upload, FileText, Sparkles, CheckCircle, Loader2, X, ListChecks,
  Brain, Layers, Network, Image as ImageIcon, Download
} from 'lucide-react';

const STAGES = [
  { id: 'upload', label: 'Uploading PDF', icon: Upload },
  { id: 'summary', label: 'Generating summary', icon: FileText },
  { id: 'flashcards', label: 'Creating flashcards', icon: Layers },
  { id: 'quiz', label: 'Building quiz', icon: Brain },
  { id: 'done', label: 'Ready', icon: CheckCircle },
];

export default function UploadNotes() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [subject, setSubject] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
    } else {
      toast({ title: 'Please upload a PDF file', variant: 'destructive' });
    }
  }, [toast]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const processNote = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);
    try {
      setStage(0);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const title = file.name.replace(/\.pdf$/i, '');

      // Create note record
      let note = await base44.entities.Note.create({
        title, file_url, file_name: file.name,
        subject: subject || 'General', status: 'processing',
      });

      setStage(1);
      const summaryData = await generateNoteSummary(file_url, title);

      note = await base44.entities.Note.update(note.id, {
        summary: summaryData.summary,
        key_points: summaryData.key_points,
        diagram_description: summaryData.diagram_description,
        image_references: summaryData.image_references,
        status: 'ready',
      });

      setStage(2);
      const cards = await generateFlashcards(summaryData.summary, title);
      if (cards.length) {
        await base44.entities.Flashcard.bulkCreate(
          cards.map((c) => ({
            ...c, note_id: note.id, subject: subject || 'General', difficulty: 'medium', reviewed: false,
          }))
        );
      }

      setStage(3);
      const questions = await generateQuiz(summaryData.summary, title);
      let quiz = null;
      if (questions.length) {
        quiz = await base44.entities.Quiz.create({
          note_id: note.id, title: `${title} Quiz`, subject: subject || 'General',
          questions, score: 0, total: questions.length, completed: false,
        });
      }

      setStage(4);
      setResult({ note, flashcards: cards, quiz });
      toast({ title: 'Notes processed successfully!', description: `${cards.length} flashcards and ${questions.length} quiz questions generated.` });
    } catch (e) {
      toast({ title: 'Processing failed', description: e.message || 'Please try again', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setStage(-1);
    setSubject('');
  };

  return (
    <div className="mesh-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold">Upload Notes</h1>
          <p className="text-slate-500 mt-1">Drop a PDF and Algolearn turns it into a full study kit.</p>
        </div>

        {!result && (
          <>
            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !processing && inputRef.current?.click()}
              className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
                dragOver ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'
              } ${processing ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                ref={inputRef} type="file" accept="application/pdf" className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-violet-500" />
                  </div>
                  <p className="font-semibold">Drop your PDF here</p>
                  <p className="text-sm text-slate-400">or click to browse — max 25MB</p>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Subject (optional)</label>
              <input
                value={subject} onChange={(e) => setSubject(e.target.value)} disabled={processing}
                placeholder="e.g. Biology, Calculus, History..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
              />
            </div>

            {/* Process button */}
            <button
              onClick={processNote} disabled={!file || processing}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Sparkles className="w-4 h-4" /> Generate study kit</>}
            </button>

            {/* Progress stages */}
            <AnimatePresence>
              {processing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-8 bg-white rounded-2xl p-6 border border-slate-100"
                >
                  <div className="space-y-3">
                    {STAGES.map((s, i) => {
                      const state = i < stage ? 'done' : i === stage ? 'active' : 'pending';
                      return (
                        <div key={s.id} className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            state === 'done' ? 'bg-emerald-100 text-emerald-600' :
                            state === 'active' ? 'bg-violet-100 text-violet-600' : 'bg-slate-50 text-slate-300'
                          }`}>
                            {state === 'active' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                             state === 'done' ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                          </div>
                          <span className={`text-sm font-medium ${state === 'pending' ? 'text-slate-400' : 'text-slate-700'}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Result */}
        {result && (
          <ResultView result={result} onReset={reset} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

function ResultView({ result, onReset, navigate }) {
  const { note, flashcards, quiz } = result;
  const [tab, setTab] = useState('summary');
  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'keypoints', label: 'Key Points', icon: ListChecks },
    { id: 'flashcards', label: `Flashcards (${flashcards.length})`, icon: Layers },
    { id: 'diagram', label: 'Diagram', icon: Network },
    { id: 'images', label: 'Images', icon: ImageIcon },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm text-emerald-900">Your study kit is ready!</p>
          <p className="text-xs text-emerald-700">{flashcards.length} flashcards · {quiz?.questions?.length || 0} quiz questions generated</p>
        </div>
        <button onClick={onReset} className="text-sm text-emerald-700 font-medium hover:underline">Upload another</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.id ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 min-h-[300px]">
        {tab === 'summary' && (
          <div className="prose prose-sm max-w-none">
            <h2 className="font-display font-bold text-lg mb-3">{note.title}</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{note.summary}</p>
          </div>
        )}
        {tab === 'keypoints' && (
          <ul className="space-y-3">
            {note.key_points?.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-sm text-slate-600 pt-0.5">{p}</span>
              </li>
            ))}
          </ul>
        )}
        {tab === 'flashcards' && <FlashcardList cards={flashcards} />}
        {tab === 'diagram' && <DiagramView description={note.diagram_description} title={note.title} />}
        {tab === 'images' && <ImageReferences queries={note.image_references} />}
      </div>

      {quiz && (
        <button
          onClick={() => navigate('/quiz')}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all"
        >
          <Brain className="w-4 h-4" /> Take the quiz for this note
        </button>
      )}
    </motion.div>
  );
}

function FlashcardList({ cards }) {
  const [flipped, setFlipped] = useState(null);
  if (!cards.length) return <p className="text-sm text-slate-400">No flashcards generated.</p>;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {cards.map((c, i) => (
        <button
          key={i} onClick={() => setFlipped(flipped === i ? null : i)}
          className="text-left p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all min-h-[120px] flex flex-col"
        >
          <p className="text-xs font-semibold text-violet-500 mb-2">{flipped === i ? 'ANSWER' : 'QUESTION'}</p>
          <p className="text-sm text-slate-700">{flipped === i ? c.back : c.front}</p>
          <p className="text-xs text-slate-300 mt-auto pt-2">Tap to flip</p>
        </button>
      ))}
    </div>
  );
}

function DiagramView({ description, title }) {
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `An educational concept diagram illustrating: ${description || title}. Clean, modern infographic style with labeled boxes, arrows, and a violet/indigo color scheme on white background.`,
      });
      setImg(res.url);
    } catch (e) {
      setImg(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">{description || 'No diagram description available.'}</p>
      {img ? (
        <img src={img} alt="Concept diagram" className="w-full rounded-xl border border-slate-200" />
      ) : (
        <button onClick={generate} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-50 text-violet-700 font-medium text-sm hover:bg-violet-100 transition-all">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Network className="w-4 h-4" />}
          {loading ? 'Generating diagram...' : 'Generate diagram image'}
        </button>
      )}
    </div>
  );
}

function ImageReferences({ queries }) {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState({});
  if (!queries?.length) return <p className="text-sm text-slate-400">No image references available.</p>;
  const gen = async (q) => {
    setLoading((p) => ({ ...p, [q]: true }));
    try {
      const res = await base44.integrations.Core.GenerateImage({ prompt: q });
      setImages((p) => ({ ...p, [q]: res.url }));
    } finally {
      setLoading((p) => ({ ...p, [q]: false }));
    }
  };
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {queries.map((q, i) => (
        <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
          {images[q] ? (
            <img src={images[q]} alt={q} className="w-full h-40 object-cover" />
          ) : (
            <button onClick={() => gen(q)} disabled={loading[q]}
              className="w-full h-40 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-50 transition-colors">
              {loading[q] ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
              <span className="text-xs px-3 text-center">{q}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
