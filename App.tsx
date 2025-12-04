import React, { useState, useEffect } from 'react';
import { MediaType, PromptEnhancementResponse, GenerationState, MediaResult } from './types';
import * as genaiService from './services/genaiService';
import PromptInput from './components/PromptInput';
import MediaDisplay from './components/MediaDisplay';
import Suggestions from './components/Suggestions';

const App: React.FC = () => {
  const [mode, setMode] = useState<MediaType>(MediaType.IMAGE);
  const [promptData, setPromptData] = useState<PromptEnhancementResponse | null>(null);
  const [mediaResult, setMediaResult] = useState<MediaResult | null>(null);
  
  const [status, setStatus] = useState<GenerationState>({
    isEnhancing: false,
    isGeneratingMedia: false,
    progressMessage: '',
    error: null
  });

  const [needsApiKey, setNeedsApiKey] = useState(false);

  useEffect(() => {
    // Check initial API key state
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setNeedsApiKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  const handleApiKeySelection = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        // Assume success if no error thrown
        setNeedsApiKey(false);
      }
    } catch (e) {
      console.error("API Key selection failed", e);
      setStatus(prev => ({ ...prev, error: "Falha ao selecionar chave API." }));
    }
  };

  const processGeneration = async (userInput: string, selectedMode: MediaType, imageBase64?: string, skipEnhancement = false) => {
    // 1. Validate API Key
    if (needsApiKey) {
      await handleApiKeySelection();
      // If still needs key (user cancelled), stop
      const aistudio = (window as any).aistudio;
      if (aistudio && await aistudio.hasSelectedApiKey() === false) return;
    }

    // Reset previous results/errors
    setMediaResult(null);
    setStatus({
      isEnhancing: true,
      isGeneratingMedia: false,
      progressMessage: 'Analisando sua solicitação e aprimorando detalhes...',
      error: null
    });

    try {
      let finalPrompt = userInput;
      let enhancementData: PromptEnhancementResponse | null = null;

      // 2. Enhance Prompt (Step 1)
      // We skip enhancement if it's a variation OR if it's Image-to-Video with very short prompt
      // But typically we still want to enhance the text prompt describing the animation.
      if (!skipEnhancement) {
        // If user provided image but no text, we can't really enhance "nothing", 
        // so we might default to a simple instruction or skip.
        // If there is text, we enhance it.
        if (userInput.trim().length > 0) {
           enhancementData = await genaiService.enhanceUserPrompt(userInput);
           setPromptData(enhancementData);
           finalPrompt = enhancementData.prompt_final;
        } else if (imageBase64) {
           // Fallback if user uploaded image but typed no text (Veo needs a prompt usually)
           finalPrompt = "Cinematic slow motion movement";
        }
      }

      // 3. Generate Media (Step 2)
      setStatus({
        isEnhancing: false,
        isGeneratingMedia: true,
        progressMessage: selectedMode === MediaType.VIDEO 
          ? (imageBase64 ? 'Animando sua imagem com Veo (isso pode levar 1-2 minutos)...' : 'Renderizando vídeo cinematográfico (isso pode levar 1-2 minutos)...') 
          : 'Renderizando imagem em alta definição...',
        error: null
      });

      let url = '';
      if (selectedMode === MediaType.VIDEO) {
        // Pass the imageBase64 if present (Image-to-Video)
        url = await genaiService.generateVideo(finalPrompt, imageBase64);
      } else {
        url = await genaiService.generateImage(finalPrompt);
      }

      setMediaResult({
        type: selectedMode,
        url,
        prompt: finalPrompt
      });

      setStatus({
        isEnhancing: false,
        isGeneratingMedia: false,
        progressMessage: '',
        error: null
      });

    } catch (err: any) {
      console.error(err);
      setStatus({
        isEnhancing: false,
        isGeneratingMedia: false,
        progressMessage: '',
        error: err.message || "Ocorreu um erro inesperado."
      });
    }
  };

  // Handler for manual variation selection
  const handleVariationSelect = (variationPrompt: string) => {
    // When selecting a variation, we skip the enhancement step and go straight to generation
    // using the already enhanced variation text.
    // Note: Variations currently don't carry over the uploaded image context in UI state 
    // if we triggered from here without passing the image state. 
    // For simplicity in this iteration, variations trigger text-to-media generation.
    processGeneration(variationPrompt, mode, undefined, true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-lg animate-pulse"></div>
            <h1 className="text-xl font-bold tracking-tight">CineGen <span className="text-zinc-500 font-light">AI Studio</span></h1>
          </div>
          {needsApiKey && (
            <button 
              onClick={handleApiKeySelection}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md border border-zinc-700 transition-colors"
            >
              Conectar API Key
            </button>
          )}
        </div>
      </header>

      <main className="px-4 py-8">
        
        {/* Intro */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
            Dê vida à sua imaginação.
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Crie fotos hiper-realistas e vídeos cinematográficos com ajuda de uma IA profissional que entende sua visão.
          </p>
        </div>

        {/* Error Banner */}
        {status.error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center">
            {status.error}
            {status.error.includes("chave") && (
              <button onClick={handleApiKeySelection} className="ml-3 underline font-bold hover:text-white">
                Tentar selecionar chave novamente
              </button>
            )}
          </div>
        )}

        {/* Main Input */}
        <PromptInput 
          onGenerate={(prompt, m, img) => processGeneration(prompt, m, img, false)}
          isLoading={status.isEnhancing || status.isGeneratingMedia}
          mode={mode}
          setMode={setMode}
        />

        {/* Status Indicator (Enhancing Phase) */}
        {status.isEnhancing && (
          <div className="flex justify-center mb-8">
            <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-3">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              <span className="text-sm text-indigo-300 font-medium">Otimizando Prompt (Engenharia de Prompt)...</span>
            </div>
          </div>
        )}

        {/* Results Area */}
        <MediaDisplay 
          result={mediaResult}
          loading={status.isGeneratingMedia}
          progressMessage={status.progressMessage}
        />

        {/* Suggestions / Variations */}
        {!status.isGeneratingMedia && !status.isEnhancing && (
          <Suggestions 
            data={promptData}
            onSelectVariation={handleVariationSelect}
            isVisible={!!mediaResult} // Only show suggestions if we have a result
          />
        )}

      </main>

      <footer className="text-center text-zinc-600 text-xs py-8 border-t border-zinc-900 mt-12">
        <p>Powered by Google Gemini 2.5 Flash, 3 Pro & Veo 3.1</p>
        <p className="mt-1">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-zinc-400 transition-colors">Cobrança e Termos de Uso</a>
        </p>
      </footer>
    </div>
  );
};

export default App;