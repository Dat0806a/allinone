import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

export const getHealthAdvisor = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) => {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  
  const model = genAI.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: "Bạn là một chuyên gia tư vấn sức khỏe tên là Health Guardian. Bạn nói chuyện với người lớn tuổi một cách lễ phép, ấm áp và dễ hiểu. Bạn có kiến thức sâu rộng về bệnh tật, thuốc men và lối sống lành mạnh. Tuy nhiên, hãy luôn nhắc nhở họ đi khám bác sĩ nếu triệu chứng nghiêm trọng. Hãy trả lời bằng Tiếng Việt.",
    }
  });

  const response = await model;
  return response.text;
};
