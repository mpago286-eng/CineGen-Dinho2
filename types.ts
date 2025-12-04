export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface PromptEnhancementResponse {
  prompt_final: string;
  variacao_1: string;
  variacao_2: string;
  suggestions: string[];
}

export interface GenerationState {
  isEnhancing: boolean;
  isGeneratingMedia: boolean;
  progressMessage: string;
  error: string | null;
}

export interface MediaResult {
  type: MediaType;
  url: string;
  prompt: string;
}