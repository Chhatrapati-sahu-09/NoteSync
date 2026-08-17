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



exports.getSummary = async (req, res) => {
  const { notes, videoTitle } = req.body;
  
  if (!notes) {
    return res.status(400).json({ message: 'No notes provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
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
    console.error('AI Summary generation failed:', error);
    res.status(500).json({ message: 'AI Summary generation failed' });
  }
};

exports.getFlashcards = async (req, res) => {
  const { notes } = req.body;

  if (!notes || notes.length === 0) {
    return res.status(400).json({ message: 'No notes provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
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
    console.error('AI Flashcard generation failed:', error);
    res.status(500).json({ message: 'AI Flashcard generation failed' });
  }
};

exports.explainConcept = async (req, res) => {
  const { concept } = req.body;

  if (!concept) {
    return res.status(400).json({ message: 'Concept parameter is missing' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const prompt = `You are NoteSync AI, an elite technical tutor. Explain the following concept: "${concept}" in a clear, friendly, and visual plain-English format, using the Feynman Technique (explain it like I am 12).
    Format the response using Markdown.
    Use headings, bullet points, and a simple real-world analogy. Keep the explanation under 250 words.`;

    const explanation = await callGemini(prompt);
    res.json({ explanation });
  } catch (error) {
    console.error('AI Concept explanation failed:', error);
    res.status(500).json({ message: 'AI Concept explanation failed' });
  }
};
