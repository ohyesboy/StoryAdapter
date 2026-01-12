import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;

export const adaptText = async (
  originalTitle: string,
  originalContent: string,
  prompt: string
): Promise<{ title: string; content: string }> => {
  if (!apiKey) throw new Error("Gemini API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const fullPrompt = `
    ${prompt}
    
    ORIGINAL TITLE:
    ${originalTitle}
    
    ORIGINAL CONTENT:
    ${originalContent}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: fullPrompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ['title', 'content']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON", text);
    throw new Error("Invalid JSON response from Gemini");
  }
};

export const generateImageVariant = async (
  originalBase64: string,
  prompt: string
): Promise<string> => {
  if (!apiKey) throw new Error("Gemini API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  // Clean base64 string
  const base64Data = originalBase64.replace(/^data:image\/\w+;base64,/, "");
  const mimeType = originalBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        }
      ]
    },
    // No responseSchema for image models usually, but we want the image data
  });

  // gemini-2.5-flash-image generates an image in the response parts
  // We need to look for inlineData in parts
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No content generated");

  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data found in response");
};

export const generateSrtFromAudio = async (audioBase64: string): Promise<string> => {
  if (!apiKey) throw new Error("Gemini API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
  // Assuming mp3 or wav, but Gemini handles common formats
  const mimeType = 'audio/mp3'; // ElevenLabs default

  const prompt = `
    Listen to this audio file and generate an SRT (SubRip Subtitle) file content for it.
    Ensure the timestamps are accurate and the text matches the spoken audio.
    Output ONLY the SRT content.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        }
      ]
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate SRT");
  return text;
};
