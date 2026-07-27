import { base44 } from '@/api/base44Client';

/**
 * Generate a structured summary + key points + diagram description from an uploaded PDF.
 */
export async function generateNoteSummary(fileUrl, title) {
  const prompt = `You are an expert academic study assistant. Analyze the provided document "${title}" and produce a comprehensive study summary.

Return JSON with:
- summary: a clear 3-5 paragraph summary of the main ideas
- key_points: an array of 6-10 key bullet points (concise)
- diagram_description: a description of a useful diagram or concept map that visualizes the core relationships in this material (we will render it as an image later)
- image_references: an array of 3-5 image search query strings that would help visualize concepts in this material

Be specific to the document content. Do not make up information not present.`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    file_urls: [fileUrl],
    response_json_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        key_points: { type: 'array', items: { type: 'string' } },
        diagram_description: { type: 'string' },
        image_references: { type: 'array', items: { type: 'string' } },
      },
      required: ['summary', 'key_points', 'diagram_description', 'image_references'],
    },
  });
  return res;
}

/**
 * Generate flashcards from a note's summary.
 */
export async function generateFlashcards(summary, title) {
  const prompt = `Based on this study material titled "${title}", create 8 high-quality flashcards for active recall.

Summary:
${summary}

Return JSON: { "flashcards": [ { "front": "question or prompt", "back": "concise answer" } ] }
Make fronts clear and backs concise (1-2 sentences).`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        flashcards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              front: { type: 'string' },
              back: { type: 'string' },
            },
            required: ['front', 'back'],
          },
        },
      },
      required: ['flashcards'],
    },
  });
  return res.flashcards || [];
}

/**
 * Generate a quiz from a note's summary.
 */
export async function generateQuiz(summary, title) {
  const prompt = `Based on this study material titled "${title}", create a 5-question multiple-choice quiz to test understanding.

Summary:
${summary}

Return JSON: { "questions": [ { "question": "...", "options": ["a","b","c","d"], "correct_index": 0, "explanation": "why the answer is correct" } ] }
Each question has exactly 4 options. correct_index is 0-3. Include a short explanation.`;

  const res = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              correct_index: { type: 'number' },
              explanation: { type: 'string' },
            },
            required: ['question', 'options', 'correct_index', 'explanation'],
          },
        },
      },
      required: ['questions'],
    },
  });
  return res.questions || [];
}

/**
 * RAG-style chat: answer a question using the user's uploaded notes as context.
 */
export async function chatWithNotes(message, noteContexts, history) {
  const contextBlock = noteContexts.length
    ? `\n\n--- UPLOADED NOTES CONTEXT (use this as your primary source of truth) ---\n` +
      noteContexts.map((n, i) => `[Note ${i + 1}: ${n.title}]\n${n.summary || n.content || '(no summary)'}`).join('\n\n')
    : '\n(No notes uploaded yet — answer generally but encourage uploading notes for context-specific answers.)';

  const historyBlock = history.length
    ? '\n--- CONVERSATION SO FAR ---\n' +
      history.slice(-8).map((m) => `${m.role}: ${m.content}`).join('\n')
    : '';

  const prompt = `You are Algolearn, a friendly AI study assistant integrated into a student's learning platform.${contextBlock}${historyBlock}

Student's question: ${message}

Answer clearly and concisely. When you reference information from the uploaded notes, mention which note it came from. If the answer isn't in the notes, say so and answer from general knowledge. Use simple formatting.`;

  const payload = {
    prompt,
  };
  if (noteContexts.some((n) => n.file_url)) {
    payload.file_urls = noteContexts.map((n) => n.file_url).filter(Boolean);
  }

  const res = await base44.integrations.Core.InvokeLLM(payload);
  return res;
}
