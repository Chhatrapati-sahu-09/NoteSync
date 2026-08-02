// server/controllers/aiController.js

const callGemini = async (prompt, mimeType = 'text/plain') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (mimeType === 'application/json') {
      payload.generationConfig = {
        responseMimeType: 'application/json',
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected Gemini API response structure');
    }
  } catch (error) {
    console.error('Gemini API Fetch failed:', error);
    throw error;
  }
};

// Generates local mock summary from note items
const generateMockSummary = (notes, videoTitle) => {
  if (!notes || notes.length === 0) {
    return `### NoteSync AI Executive Summary\n\nNo lecture notes have been captured for this video yet. Please add notes with timestamps to generate an AI summary.`;
  }

  const bulletPoints = notes.map(n => `* **[${n.formattedTime}] ${n.title}:** ${n.content.substring(0, 100)}${n.content.length > 100 ? '...' : ''}`).join('\n');
  const actionItems = notes
    .filter(n => n.category === 'Code Snippet' || n.category === 'Question')
    .map(n => `* [ ] Review code pattern: "${n.title}" at timestamp ${n.formattedTime}`)
    .join('\n') || '* [ ] Review key concepts and timestamps recorded in this lecture.';

  return `### NoteSync AI Executive Summary\n\n**Video:** ${videoTitle}\n\n#### 📌 Key Takeaways & Core Concepts\n${bulletPoints}\n\n#### ✅ Action Items & Follow-ups\n${actionItems}\n\n*(Note: Running in local heuristic mode. Set GEMINI_API_KEY in server/.env for advanced AI generation)*`;
};

// Generates local mock flashcards from note items
const generateMockFlashcards = (notes) => {
  if (!notes || notes.length === 0) {
    return [
      {
        id: 'fc-1',
        question: 'What is NoteSync?',
        answer: 'NoteSync is a Notion-inspired workspace for synchronized video note-taking, featuring canvas screenshots and AI generation.',
        category: 'NoteSync Basics'
      },
      {
        id: 'fc-2',
        question: 'How do you create a quick timestamped note in NoteSync?',
        answer: 'Pressing the "N" keyboard shortcut immediately grabs the current video timestamp, opens a new note card, and focuses the title input.',
        category: 'Keyboard Shortcuts'
      }
    ];
  }

  const cards = notes.map((n, idx) => ({
    id: `fc-${Date.now()}-${idx}`,
    question: `What is the core concept behind "${n.title}" discussed at ${n.formattedTime}?`,
    answer: n.content || 'Refer to the timestamped note for full details.',
    category: n.category || 'General'
  }));

  // Ensure we have at least 2 cards
  if (cards.length < 2) {
    cards.push({
      id: `fc-default`,
      question: 'How do you navigate to a specific timestamp in the video?',
      answer: 'By clicking the timestamp badge or the screenshot thumbnail in any note card.',
      category: 'Navigation'
    });
  }

  return cards;
};

// Generates local concept explanation
const generateMockExplanation = (concept) => {
  return `### 💡 NoteSync Concept Explainer: "${concept}"\n\nHere is a simple, plain-English breakdown of this topic:\n\n1. **Core Idea:** Every concept can be simplified. When you study this, think of it as a modular block in a system.\n2. **Practical Analogy:** Imagine putting pieces of a puzzle together. Each component has a specific shape and matches only with its target counterpart.\n3. **Key Takeaway:** Focus on how this integrates with the rest of the workspace.\n\n*(Note: Running in local heuristic mode. Set GEMINI_API_KEY in server/.env for advanced AI explanations)*`;
};

exports.getSummary = async (req, res) => {
  const { notes, videoTitle } = req.body;
  
  if (!notes) {
    return res.status(400).json({ message: 'No notes provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful local fallback
    const summary = generateMockSummary(notes, videoTitle || 'Active Video');
    return res.json({ summary });
  }

  try {
    const notesText = notes.map(n => `[${n.formattedTime}] (Category: ${n.category}) ${n.title}: ${n.content}`).join('\n\n');
    const prompt = `You are NoteSync AI, an expert educational assistant. Below are raw notes taken by a user during a video lecture titled "${videoTitle || 'Active Video'}". 
    Create a highly professional, structured Executive Summary in Markdown format.
    The summary must include:
    - A 📌 Key Takeaways & Core Concepts section highlighting the major points discussed in the notes.
    - A ✅ Action Items & Follow-ups section with concrete checkboxes representing review tasks or coding assignments based on the questions or code snippets in the notes.
    Keep it concise, actionable, and formatted nicely.

    Raw Notes:
    ${notesText}`;

    const summary = await callGemini(prompt);
    res.json({ summary });
  } catch (error) {
    console.error('AI Summary generation failed, falling back:', error);
    const summary = generateMockSummary(notes, videoTitle || 'Active Video');
    res.json({ summary, fallback: true });
  }
};

exports.getFlashcards = async (req, res) => {
  const { notes } = req.body;

  if (!notes || notes.length === 0) {
    return res.json({ flashcards: generateMockFlashcards(notes) });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful local fallback
    return res.json({ flashcards: generateMockFlashcards(notes) });
  }

  try {
    const notesText = notes.map(n => `(Category: ${n.category}) ${n.title}: ${n.content}`).join('\n');
    const prompt = `You are NoteSync AI, a memory helper. Based on the following raw student notes from a lecture, generate a list of exactly 3 to 5 interactive study flashcards.
    Each flashcard must contain a question, a clear answer, and a short category.
    You must output a raw JSON array matching this exact schema:
    [
      {
        "id": "fc-1",
        "question": "What is ...?",
        "answer": "...",
        "category": "..."
      }
    ]
    Do not output any markdown formatting, headers, or text outside the JSON array. Output valid JSON only.

    Raw Notes:
    ${notesText}`;

    const resultText = await callGemini(prompt, 'application/json');
    let flashcards = JSON.parse(resultText);
    
    // Auto-generate ids if missing
    flashcards = flashcards.map((c, i) => ({
      id: c.id || `fc-${Date.now()}-${i}`,
      question: c.question,
      answer: c.answer,
      category: c.category || 'General'
    }));

    res.json({ flashcards });
  } catch (error) {
    console.error('AI Flashcard generation failed, falling back:', error);
    res.json({ flashcards: generateMockFlashcards(notes), fallback: true });
  }
};

exports.explainConcept = async (req, res) => {
  const { concept } = req.body;

  if (!concept) {
    return res.status(400).json({ message: 'Concept parameter is missing' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful local fallback
    const explanation = generateMockExplanation(concept);
    return res.json({ explanation });
  }

  try {
    const prompt = `You are NoteSync AI, an elite technical tutor. Explain the following concept: "${concept}" in a clear, friendly, and visual plain-English format, using the Feynman Technique (explain it like I am 12).
    Format the response using Markdown.
    Use headings, bullet points, and a simple real-world analogy. Keep the explanation under 250 words.`;

    const explanation = await callGemini(prompt);
    res.json({ explanation });
  } catch (error) {
    console.error('AI Concept explanation failed, falling back:', error);
    const explanation = generateMockExplanation(concept);
    res.json({ explanation, fallback: true });
  }
};
