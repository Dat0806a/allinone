import { Handler } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const handler: Handler = async (event, context) => {
  const fullPath = event.path.toLowerCase();
  const method = event.httpMethod;

  // AI Chat
  if ((fullPath.endsWith("/chat") || fullPath.endsWith("/api/chat")) && method === "POST") {
    try {
      const { message, history } = JSON.parse(event.body || "{}");
      if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        history: (history || []).map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.parts[0].text }],
        })),
        config: {
          systemInstruction: "Bạn là một trợ lý sức khỏe thông minh. Hãy trả lời ngắn gọn, hữu ích và thân thiện.",
        },
      });

      const result = await chat.sendMessage({ message });
      return {
        statusCode: 200,
        body: JSON.stringify({ text: result.text }),
      };
    } catch (e: any) {
      console.error("AI Chat Error:", e);
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
  }

  // Nutrition Analyze
  if ((fullPath.endsWith("/nutrition/analyze") || fullPath.endsWith("/api/nutrition/analyze")) && method === "POST") {
    try {
      const { query } = JSON.parse(event.body || "{}");
      if (!process.env.GEMINI_API_KEY) {
         // Minimal local fallback
         return {
           statusCode: 200,
           body: JSON.stringify({
             items: [{ name: query, portion: "1 phần", calories: 350, protein: 15, carbs: 45, fat: 10, notes: "Fallback" }],
             totalCalories: 350, totalProtein: 15, totalCarbs: 45, totalFat: 10
           })
         };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Phân tích món ăn và tính calo cho: "${query}"`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "Bạn là chuyên gia dinh dưỡng. Trả về JSON với cấu trúc { items: [{name, portion, calories, protein, carbs, fat, notes}], totalCalories, totalProtein, totalCarbs, totalFat }"
        }
      });

      return {
        statusCode: 200,
        body: response.text || "{}",
      };
    } catch (e: any) {
      console.error("Nutrition Error:", e);
      return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ 
      error: "Not Found", 
      debug: {
        path: event.path,
        fullPath: fullPath,
        method: method
      }
    }),
  };
};
