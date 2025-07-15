import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = (import.meta.env.GEMINI_API_KEY) as string;
const apiBaseUrl = (import.meta.env.API_BASE_URL)?.trim().replace(/\/$/, '');
const modelName = (import.meta.env.GEMINI_MODEL_NAME) as string || 'gemini-2.0-flash'; // 提供默认值
const systemInstruction = (import.meta.env.GEMINI_SYSTEM_INSTRUCTION) as string;

const genAI = apiBaseUrl
  ? new GoogleGenerativeAI(apiKey, { apiEndpoint: apiBaseUrl })
  : new GoogleGenerativeAI(apiKey);

interface ChatMessagePart {
  text: string;
  // ... 其他属性
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatMessagePart[];
}

export const startChatAndSendMessageStream = async (history: ChatMessage[], newMessage: string) => {
  const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemInstruction });

  const chat = model.startChat({
        history: history,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 65536,
    },
  });

  const result = await chat.sendMessageStream(newMessage);

  const encodedStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of result.stream) {
        const text = chunk.text();
        const encoded = encoder.encode(text);
        controller.enqueue(encoded);
      }
      controller.close();
    },
  });

  return encodedStream;
};
