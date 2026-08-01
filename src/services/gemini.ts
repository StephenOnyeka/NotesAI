import { GoogleGenAI, Type } from '@google/genai';
import { getGeminiApiKey } from './mmkv';

export interface AICommandNote {
  title: string;
  contentHTML: string;
  colorTag?: string;
}

export interface AICommandTodo {
  title: string;
}

export interface AICommandResponse {
  action: 'create_note' | 'create_todos';
  summary: string;
  note?: AICommandNote;
  todos?: AICommandTodo[];
}

export function getActiveApiKey(): string | undefined {
  const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return getGeminiApiKey();
}

export async function processAICommand(
  userPrompt: string,
  activeTab: 'notes' | 'todo' = 'notes',
  overrideApiKey?: string
): Promise<AICommandResponse> {
  const apiKey = overrideApiKey || getActiveApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an intelligent assistant integrated into a Notes and To-Do mobile app.
Your task is to interpret user commands (either typed or spoken via voice) and format the result into a strict JSON object.

The user is currently viewing the "${activeTab}" tab.
- If the user asks to create a note OR is on the "notes" tab and gives a topic/summary/note request, set action to "create_note".
- If the user asks to create a to-do list / task list / checklist OR is on the "todo" tab and gives tasks to complete, set action to "create_todos".
- If user explicitly asks to "create a note..." while on todo tab, honor "create_note".
- If user explicitly asks to "create a to-do list..." while on notes tab, honor "create_todos".

For "create_note":
- Provide a clear, descriptive "title".
- Provide rich "contentHTML" formatted with HTML tags (e.g. <h2>Subheadings</h2>, <p>Paragraphs</p>, <ul><li>Bullet items</li></ul>).
- Optionally provide a "colorTag" hex color (such as "#6C63FF", "#4ECDC4", "#FFE66D", "#FF6B6B", "#96CEB4").

For "create_todos":
- Provide an array of "todos", where each item has a "title" string representing a clear actionable task.

Always provide a concise, friendly "summary" string explaining what you created.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: {
              type: Type.STRING,
              enum: ['create_note', 'create_todos'],
            },
            summary: { type: Type.STRING },
            note: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                contentHTML: { type: Type.STRING },
                colorTag: { type: Type.STRING },
              },
              required: ['title', 'contentHTML'],
            },
            todos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                },
                required: ['title'],
              },
            },
          },
          required: ['action', 'summary'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini AI');
    }

    return JSON.parse(text) as AICommandResponse;
  } catch (error: any) {
    if (error?.message?.includes('404') || error?.message?.includes('model')) {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
      const text = fallbackResponse.text;
      if (!text) throw new Error('Empty response from Gemini AI');
      return JSON.parse(text) as AICommandResponse;
    }
    throw error;
  }
}
