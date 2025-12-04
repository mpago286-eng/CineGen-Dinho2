import React, { useState, useRef } from 'react';
import { MediaType } from '../types';

interface PromptInputProps {
  onGenerate: (prompt: string, mode: MediaType, imageBase64?: string) => void;
  isLoading: boolean;
  mode: MediaType;
  setMode: (mode: MediaType) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading, mode, setMode }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;
    // Pass undefined if selectedImage is null
    onGenerate(input, mode, selectedImage || undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Auto-switch to Video mode when uploading an image (as per requirement for animation)
      if (mode !== MediaType.VIDEO) {
        setMode(MediaType.VIDEO);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Mode Switcher */}
      <div className="flex justify-center mb-6">
        <div className="bg-zinc-900/80 p-1 rounded-full border border-zinc-700 flex">
          <button
            onClick={() => setMode(MediaType.IMAGE)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === MediaType.IMAGE
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            FOTO (Gemini 3 Pro)
          </button>
          <button
            onClick={() => setMode(MediaType.VIDEO)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === MediaType.VIDEO
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            VÍDEO (Veo)
          </button>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 rounded-2xl blur-xl -z-10"></div>
        
        <div className="glass-panel rounded-2xl p-2 flex flex-col gap-2">
          
          {/* Image Preview Area */}
          {selectedImage && (
            <div className="px-4 pt-2">
              <div className="relative inline-block group">
                <img 
                  src={selectedImage} 
                  alt="Reference" 
                  className="h-20 w-auto rounded-lg border border-zinc-600 object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-red-900 border border-zinc-600 rounded-full p-1 shadow-lg transition-colors"
                  title="Remover imagem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
                <div className="absolute bottom-1 left-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                  Referência
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === MediaType.VIDEO && selectedImage 
                    ? "Descreva como você quer animar esta imagem..."
                    : mode === MediaType.IMAGE 
                      ? "Descreva a imagem dos seus sonhos..." 
                      : "Descreva a cena do vídeo que você imagina..."
                }
                className="w-full bg-transparent border-none text-white placeholder-zinc-500 p-4 pr-12 focus:ring-0 resize-none h-24 sm:h-auto outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              
              {/* Image Upload Button (Inside Text Area) */}
              <div className="absolute bottom-3 right-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg transition-all ${
                    selectedImage 
                      ? 'text-emerald-400 bg-emerald-400/10' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  title="Adicionar imagem de referência para animação"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className={`
                px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300
                flex items-center justify-center gap-2
                ${isLoading 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10'
                }
              `}
            >
              {isLoading ? (
                <span className="animate-pulse">Criando...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  Gerar
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromptInput;