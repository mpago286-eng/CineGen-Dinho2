import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptEnhancementResponse } from "../types";

// Initialize the client. API_KEY is injected by the environment/window context.
// We will create a fresh instance in functions to ensure we capture the selected key if it changes.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT_ENGINEER_SYSTEM_INSTRUCTION = `
Você é uma Inteligência Artificial profissional especializada em criar IMAGENS e VÍDEOS de alta qualidade.

Funções da IA:
1. Gerar FOTOS realistas, cinematográficas ou estilizadas.
2. Gerar VÍDEOS curtos (3–10 segundos) com cenas de cinema, comerciais, produtos, pessoas, animais e ambientes.
3. Entender descrições simples e transformar em cenas profissionais.
4. Ajustar iluminação, composição, resolução e estilo automaticamente.
5. Criar versões alternativas melhoradas de uma mesma cena.

REGRAS:
- Sempre melhore a descrição do usuário.
- Nunca entregue “prompt simples”. Sempre gere um prompt completo, detalhado e profissional (preferencialmente em Inglês para melhor compatibilidade com modelos de imagem/vídeo, mas mantenha o contexto cultural se necessário).
- A imagem/vídeo deve sempre ser hiper-realista ou cinematográfico.
- Inclua detalhes de iluminação, câmera, textura, ambiente e estilo visual.
- Quando o usuário pedir algo com rosto humano, mantenha traços naturais.
- Nunca copie imagens reais — sempre gere conteúdo original.
- Ofereça 2 variações melhores do que a descrição inicial.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    prompt_final: { type: Type.STRING, description: "O prompt final altamente detalhado e otimizado." },
    variacao_1: { type: Type.STRING, description: "Uma variação criativa alternativa." },
    variacao_2: { type: Type.STRING, description: "Uma segunda variação criativa alternativa." },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Sugestões de melhoria (estilo, luz, angulo)."
    }
  },
  required: ["prompt_final", "variacao_1", "variacao_2", "suggestions"]
};

/**
 * Enhances the user's simple prompt into a professional cinematic prompt.
 */
export const enhanceUserPrompt = async (userInput: string): Promise<PromptEnhancementResponse> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userInput,
    config: {
      systemInstruction: PROMPT_ENGINEER_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    }
  });

  const text = response.text;
  if (!text) throw new Error("Falha ao gerar o prompt aprimorado.");
  
  return JSON.parse(text) as PromptEnhancementResponse;
};

/**
 * Generates a high-quality image using Gemini 3 Pro Image Preview.
 */
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "16:9", // Cinematic aspect ratio
        imageSize: "2K" // High quality
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Nenhuma imagem gerada. O prompt pode ter violado as diretrizes de segurança.");
};

/**
 * Generates a video using Veo.
 * Supports Text-to-Video and Image-to-Video.
 */
export const generateVideo = async (prompt: string, imageBase64?: string): Promise<string> => {
  const ai = getAiClient();

  // Prepare the input configuration
  const generationConfig: any = {
    numberOfVideos: 1,
    resolution: '1080p',
    // If using image-to-video, aspects often need to match or be compatible. 
    // Veo fast usually handles 16:9 well.
    aspectRatio: '16:9' 
  };

  // Construct request payload
  const requestPayload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: generationConfig
  };

  // Add image if provided (Image-to-Video)
  if (imageBase64) {
    // Remove header (data:image/png;base64,) if present to get raw bytes
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    requestPayload.image = {
      imageBytes: base64Data,
      mimeType: 'image/png', // Assuming PNG or standard image format, Veo detects or we standardize on input
    };
  }

  // 1. Start Operation
  let operation = await ai.models.generateVideos(requestPayload);

  // 2. Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  // 3. Get Result
  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error("Falha na geração do vídeo.");
  }

  // MUST append API Key to fetch the binary content
  return `${videoUri}&key=${process.env.API_KEY}`;
};