
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeManuscriptImage = async (base64Image: string, mimeType: string, targetLanguage: string = 'English') => {
  try {
    const ai = getAiClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this manuscript image. Act as an expert paleographer and archivist. 
            Perform a high-fidelity OCR transcription of the text visible in the image.
            
            Extract or infer the following information:
            1. Title: A suitable academic title translated into ${targetLanguage}.
            2. Summary: A concise 2-sentence summary of the content or visual translated into ${targetLanguage}.
            3. Category: Choose from Philosophy, Science, Literature, History, Religion, Art. (MUST be in English).
            4. Language: The original language of the manuscript text (e.g., Sanskrit, Persian). (MUST be in English).
            5. Period: The estimated Historical Period (e.g., 15th Century). (MUST be in English).
            6. Transcription: Transcribe the text exactly as it appears in the original script. Preserve line structure if possible. If the script is non-standard or handwriting is difficult, use your knowledge of historical context to infer the text. If parts are illegible, indicate with [illegible] or describe the visual elements.
            7. OCR Confidence: Provide a confidence score from 0 to 100 indicating your certainty in the transcription accuracy based on image clarity and script legibility.
            8. Translation: Provide a fluent translation of the transcribed text into ${targetLanguage}.
            
            Return the result as a JSON object.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            category: { type: Type.STRING },
            language: { type: Type.STRING },
            period: { type: Type.STRING },
            transcription: { type: Type.STRING },
            ocrConfidence: { type: Type.NUMBER },
            translation: { type: Type.STRING },
          },
          required: ["title", "summary", "category", "language", "period", "transcription", "ocrConfidence", "translation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing manuscript:", error);
    throw error;
  }
};
