import React from 'react';
import { PromptEnhancementResponse } from '../types';

interface SuggestionsProps {
  data: PromptEnhancementResponse | null;
  onSelectVariation: (prompt: string) => void;
  isVisible: boolean;
}

const Suggestions: React.FC<SuggestionsProps> = ({ data, onSelectVariation, isVisible }) => {
  if (!data || !isVisible) return null;

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
      
      {/* Enhanced Prompt (Main) */}
      <div className="md:col-span-3 glass-panel p-6 rounded-xl border-l-4 border-indigo-500 bg-zinc-900/50">
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Prompt Profissional Gerado</h3>
        <p className="text-zinc-100 leading-relaxed text-sm md:text-base font-light">
          {data.prompt_final}
        </p>
      </div>

      {/* Variations */}
      <div 
        onClick={() => onSelectVariation(data.variacao_1)}
        className="glass-panel p-5 rounded-xl cursor-pointer hover:bg-zinc-800/80 transition-all hover:border-indigo-500/50 group"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase group-hover:text-white">Variação 1</h4>
          <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">➜</span>
        </div>
        <p className="text-zinc-300 text-sm leading-snug line-clamp-4">{data.variacao_1}</p>
      </div>

      <div 
        onClick={() => onSelectVariation(data.variacao_2)}
        className="glass-panel p-5 rounded-xl cursor-pointer hover:bg-zinc-800/80 transition-all hover:border-indigo-500/50 group"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase group-hover:text-white">Variação 2</h4>
          <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">➜</span>
        </div>
        <p className="text-zinc-300 text-sm leading-snug line-clamp-4">{data.variacao_2}</p>
      </div>

      {/* Technical Suggestions */}
      <div className="glass-panel p-5 rounded-xl">
        <h4 className="text-xs font-bold text-emerald-500 uppercase mb-3">Sugestões Técnicas</h4>
        <ul className="space-y-2">
          {data.suggestions.map((sug, idx) => (
            <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
              <span className="text-emerald-500/50">•</span>
              {sug}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default Suggestions;