import React from 'react';
import { MediaResult, MediaType } from '../types';

interface MediaDisplayProps {
  result: MediaResult | null;
  loading: boolean;
  progressMessage: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ result, loading, progressMessage }) => {
  if (!result && !loading) return null;

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="relative rounded-2xl overflow-hidden glass-panel border border-zinc-800 shadow-2xl aspect-video bg-black flex items-center justify-center group">
        
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Trabalhando na sua criação...</h3>
            <p className="text-zinc-400 max-w-md">{progressMessage}</p>
          </div>
        )}

        {result && !loading && (
          <>
            {result.type === MediaType.IMAGE ? (
              <img 
                src={result.url} 
                alt={result.prompt} 
                className="w-full h-full object-contain animate-fade-in"
              />
            ) : (
              <video 
                src={result.url} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-contain animate-fade-in"
              />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm text-zinc-300 line-clamp-2 italic">"{result.prompt}"</p>
              <a 
                href={result.url} 
                download={`cinegen_${Date.now()}.${result.type === MediaType.IMAGE ? 'png' : 'mp4'}`}
                className="inline-block mt-3 text-xs font-bold text-white uppercase tracking-wider hover:text-indigo-400"
                target="_blank"
                rel="noreferrer"
              >
                Download Original
              </a>
            </div>
          </>
        )}
        
        {!result && !loading && (
          <div className="text-zinc-700 font-mono text-sm">
            [ AGUARDANDO COMANDO ]
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaDisplay;