import React from 'react';

export default function OptimizedRoute({ 
  optimizedRoute, 
  roundTrip, 
  setRoundTrip 
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
          {optimizedRoute.map((loc, idx) => (
            <div key={loc.id} className="bg-[#121214] border border-[#18181b] rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-[#27272a] transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-5 h-5 rounded-full bg-[#1c1c1f] flex items-center justify-center text-[10px] font-mono text-zinc-400 font-bold shrink-0">
                  {idx + 1}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-zinc-200 truncate font-medium">{loc.address}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Disponível para GPS direto</p>
                </div>
              </div>

              {/* Botões GPS de Navegação com Vetores de Marcas Oficiais */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Botão Oficial Google Maps */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  className="w-8 h-8 rounded-lg bg-[#1c1c1f] hover:bg-[#27272a] border border-[#27272a] flex items-center justify-center transition-all"
                  title="Iniciar Navegação com Waze"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.176 17.5C15.176 18.328 14.504 19 13.676 19C12.848 19 12.176 18.328 12.176 17.5C12.176 16.672 12.848 16 13.676 16C14.504 16 15.176 16.672 15.176 17.5ZM8.176 17.5C8.176 18.328 7.504 19 6.676 19C5.848 19 5.176 18.328 5.176 17.5C5.176 16.672 5.848 16 6.676 16C7.504 16 8.176 16.672 8.176 17.5ZM10.518 2.006C5.006 2.144 0.5 6.674 0.5 12.202C0.5 14.582 1.34 16.772 2.744 18.498L2.012 21.366C1.904 21.786 2.296 22.152 2.716 22.022L5.438 21.182C6.91 22.11 8.642 22.65 10.518 22.65C16.03 22.512 20.5 17.982 20.5 12.454C20.5 6.926 16.03 2.144 10.518 2.006Z" fill="#33CCFF"/>
                    <path d="M13.676 18C13.952 18 14.176 17.776 14.176 17.5C14.176 17.224 13.952 17 13.676 17C13.4 17 13.176 17.224 13.176 17.5C13.176 17.776 13.4 18 13.676 18ZM6.676 18C6.952 18 7.176 17.776 7.176 17.5C7.176 17.224 6.952 17 6.676 17C6.4 17 6.176 17.224 6.176 17.5C6.176 17.776 6.4 18 6.676 18Z" fill="white"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
