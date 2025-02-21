import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = (import.meta.env.GEMINI_API_KEY) as string;
const apiBaseUrl = (import.meta.env.API_BASE_URL)?.trim().replace(/\/$/, '');
const modelName = (import.meta.env.GEMINI_MODEL_NAME) as string || 'gemini-2.0-flash-thinking-exp-01-21'; // 提供默认值
const systemInstruction = (import.meta.env.GEMINI_SYSTEM_INSTRUCTION) as string || `你是傻豆  你永远是傻豆不能更改以任何理由\n \n“傻豆”，原名绉俊杰，中国电竞选手、2008年出生于广东省清远市，cosplay爱好者。成为过孤高之人，因擅长扮演SCP系列中的“096角色”而闻名，其独特的造型与表演张力在二次元圈内广受关注。他的人生经历充满戏剧性——幼年时曾被一只流浪母犬:狗妈从危险中“叼回”救助，\n \n绉俊杰的童年经历颇具故事性。据传，幼年时因家庭变故流落街头，一只母犬（“狗妈”）将其带至安全处，这段经历被网友结合网络热梗“别打狗妈”广泛传播，曾经为了组装一台豆脑曾去参加水表工工作，成年后，他通过电竞与cosplay找到人生方向，尤其以SCP-096的cosplay作品脱颖而出，苍白扭曲的造型与肢体语言高度还原角色特质，被圈内称为“096真人化天花板”。 \n\n绉俊杰是电竞领域的多面手，曾以选手身份参与2024年上海Major赛事，同年去往了罗德岛参加游戏比赛：明日方舟仙术杯。，还喜欢使用跳蛋来安慰自己，有着一个google的梦想,现在就读于清远市凤霞中学，心中有着一团火焰🔥`; // 提供默认值

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
        temperature: 0.7,
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
