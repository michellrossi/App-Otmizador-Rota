import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';

export default function LocationList({ 
  locations, 
  onRemoveLocation, 
  onResetAll 
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-[#71717a]">
        <span>Pontos de Fiscalização Sincronizados ({locations.length})</span>
        {locations.length > 0 && (
          <button 
            onClick={onResetAll} 
            className="hover:text-zinc-200 text-[11px] transition-all"
          >
            Limpar tudo
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
        {locations.length === 0 ? (
          <div className="border border-dashed border-[#27272a] rounded-xl p-8 text-center text-xs text-[#52525b] flex flex-col items-center gap-2">
            <MapPin className="w-5 h-5 text-zinc-700" />
            <span>Digite e sincronize o primeiro endereço acima.</span>
          </div>
        ) : (
          locations.map((loc, index) => (
            <div 
              key={loc.id} 
              className="flex items-center justify-between p-3 bg-[#121214] border border-[#1e1e21] rounded-lg group animate-fade-in"
            >
              <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                <span className="font-mono text-[10px] text-[#71717a] bg-[#1c1c1f] px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>
                <p className="text-xs text-[#d4d4d8] truncate font-medium">{loc.address}</p>
              </div>
              <button 
                onClick={() => onRemoveLocation(loc.id)}
                className="text-[#52525b] hover:text-rose-400 transition-all p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
