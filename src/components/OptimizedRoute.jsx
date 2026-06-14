import React from 'react';
import { ChevronUp, ChevronDown, CheckCircle, Clock } from 'lucide-react';

export default function OptimizedRoute({ 
  optimizedRoute, 
  roundTrip, 
  setRoundTrip,
  onMoveLocation,
  onToggleStatus
}) {
  if (optimizedRoute.length === 0) return null;

  const getGoogleMapsBundleUrl = () => {
    if (optimizedRoute.length === 0) return "#";
    const start = `${optimizedRoute[0].lat},${optimizedRoute[0].lng}`;
    const endLoc = roundTrip ? optimizedRoute[0] : optimizedRoute[optimizedRoute.length - 1];
    const end = `${endLoc.lat},${endLoc.lng}`;
    const midPoints = optimizedRoute
      .slice(1, roundTrip ? optimizedRoute.length : optimizedRoute.length - 1)
      .map(p => `${p.lat},${p.lng}`)
      .join("|");
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(start)}&destination=${encodeURIComponent(end)}&waypoints=${encodeURIComponent(midPoints)}&travelmode=driving`;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 border-t border-[#18181b] pt-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 text-xs font-medium text-[#a1a1aa] cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
            checked={roundTrip}
            onChange={(e) => setRoundTrip(e.target.checked)}
          />
          <span>Retornar ao ponto inicial</span>
        </label>
        
        {/* Botão de Navegação Agrupada Completa */}
        <a
          href={getGoogleMapsBundleUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 px-3 bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] rounded-md text-[11px] font-medium flex items-center gap-2 transition-all text-zinc-200"
        >
          {/* Logo Google Maps SVG Oficial */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4285F4"/>
            <path d="M12 2c-3.87 0-7 3.13-7 7 0 1 .19 1.96.53 2.84l6.47-6.47V2.05C12 2.03 12 2 12 2z" fill="#EA4335"/>
            <path d="M19.47 11.84c.34-.88.53-1.84.53-2.84 0-3.87-3.13-7-7-7v3.36l6.47 6.48z" fill="#FBBC05"/>
            <path d="M12 22s7-7.75 7-13c0-.35-.03-.69-.08-1.03L12 14.92V22z" fill="#34A853"/>
          </svg>
          <span>Iniciar Rota Unificada</span>
        </a>
      </div>

      {/* Lista dos Trechos Sequenciados com Logos Originais */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-mono tracking-wider text-[#52525b] uppercase">Fila de Atendimento Otimizada</span>
        
        <div className="flex flex-col gap-2">
          {optimizedRoute.map((loc, idx) => {
            const isCompleted = loc.status === 'completed';
            return (
              <div 
                key={loc.id} 
                className={`border rounded-xl p-4 flex items-center justify-between gap-4 group transition-all ${
                  isCompleted 
                    ? 'bg-[#121214]/50 border-emerald-950/20 opacity-70 hover:opacity-100' 
                    : 'bg-[#121214] border-[#18181b] hover:border-[#27272a]'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Controles de Reordenação */}
                  {idx > 0 && (
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        disabled={idx === 1}
                        onClick={() => onMoveLocation && onMoveLocation(idx, 'up')}
                        className="text-zinc-600 hover:text-indigo-400 disabled:opacity-20 transition-all p-0.5"
                        title="Subir posição"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        disabled={idx === optimizedRoute.length - 1}
                        onClick={() => onMoveLocation && onMoveLocation(idx, 'down')}
                        className="text-zinc-600 hover:text-indigo-400 disabled:opacity-20 transition-all p-0.5"
                        title="Descer posição"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="w-5 h-5 rounded-full bg-[#1c1c1f] flex items-center justify-center text-[10px] font-mono text-zinc-400 font-bold shrink-0">
                    {idx === 0 ? "★" : idx + 1}
                  </div>
                  
                  <div className="overflow-hidden">
                    <p className={`text-xs truncate font-medium transition-all ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                      {loc.address}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => onToggleStatus && onToggleStatus(loc.id)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 transition-all ${
                          isCompleted 
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/50' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                        }`}
                        title="Clique para alternar o status"
                      >
                        {isCompleted ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        <span>{isCompleted ? "Concluído" : "A Vistoriar"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botões GPS de Navegação */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Botão Oficial Google Maps */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onToggleStatus && onToggleStatus(loc.id, 'completed')}
                    className="w-8 h-8 rounded-lg bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] flex items-center justify-center transition-all"
                    title="Abrir no Google Maps"
                  >
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#4285F4"/>
                      <path d="M12 2C9.28 2 7.02 3.56 5.92 5.83L12 11.91V2.05C12.00 2.05 12.00 2 12 2Z" fill="#EA4335"/>
                      <path d="M19.08 7.83C18.52 5.42 16.73 3.49 14.39 2.65L12 5.04V9.67L19.08 7.83Z" fill="#FBBC05"/>
                      <path d="M12 22C12 22 19 14.25 19 9C19 8.59 18.96 8.19 18.88 7.81L12 14.69V22Z" fill="#34A853"/>
                      <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
                    </svg>
                  </a>

                  {/* Botão Oficial Waze */}
                  <a
                    href={`https://waze.com/ul?ll=${loc.lat},${loc.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onToggleStatus && onToggleStatus(loc.id, 'completed')}
                    className="w-8 h-8 rounded-lg bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] flex items-center justify-center transition-all"
                    title="Iniciar Navegação com Waze"
                  >
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="#33CCFF" xmlns="http://www.w3.org/2000/svg">
                      <title>Waze</title>
                      <path d="M13.314 1.59c-.225.003-.45.013-.675.03-2.165.155-4.295.924-6.069 2.327-2.194 1.732-3.296 4.325-3.496 7.05h.002c-.093 1.22-.23 2.15-.469 2.63-.238.479-.42.638-1.24.639C.27 14.259-.4 15.612.266 16.482c1.248 1.657 2.902 2.705 4.72 3.364a2.198 2.198 0 00-.033.367 2.198 2.198 0 002.2 2.197 2.198 2.198 0 002.128-1.668c1.307.12 2.607.14 3.824.1.364-.012.73-.045 1.094-.092a2.198 2.198 0 002.127 1.66 2.198 2.198 0 002.2-2.197 2.198 2.198 0 00-.151-.797 12.155 12.155 0 002.303-1.549c2.094-1.807 3.511-4.399 3.302-7.404-.112-1.723-.761-3.298-1.748-4.608-2.143-2.86-5.53-4.309-8.918-4.265zm.366 1.54c.312.008.623.027.933.063 2.48.288 4.842 1.496 6.4 3.577v.001c.829 1.1 1.355 2.386 1.446 3.792v.003c.173 2.477-.965 4.583-2.777 6.147a10.66 10.66 0 01-2.375 1.535 2.198 2.198 0 00-.98-.234 2.198 2.198 0 00-1.934 1.158 9.894 9.894 0 01-1.338.146 27.323 27.323 0 01-3.971-.148 2.198 2.198 0 00-1.932-1.156 2.198 2.198 0 00-1.347.463c-1.626-.553-3.078-1.422-4.155-2.762 1.052-.096 1.916-.6 2.319-1.408.443-.889.53-1.947.625-3.198v-.002c.175-2.391 1.11-4.536 2.92-5.964h.002c1.77-1.402 3.978-2.061 6.164-2.012zm-3.157 4.638c-.688 0-1.252.579-1.252 1.298 0 .72.564 1.297 1.252 1.297.689 0 1.252-.577 1.252-1.297 0-.711-.563-1.298-1.252-1.298zm5.514 0c-.688 0-1.25.579-1.25 1.298-.008.72.554 1.297 1.25 1.297.688 0 1.252-.577 1.252-1.297 0-.711-.564-1.298-1.252-1.298zM9.641 11.78a.72.72 0 00-.588.32.692.692 0 00-.11.54c.345 1.783 2.175 3.129 4.264 3.129h.125c1.056-.032 2.026-.343 2.816-.922.767-.556 1.29-1.316 1.477-2.137a.746.746 0 00-.094-.547.69.69 0 00-.445-.32.714.714 0 00-.867.539c-.22.93-1.299 1.9-2.934 1.94-1.572.046-2.738-.986-2.926-1.956a.72.72 0 00-.718-.586Z"/>
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
