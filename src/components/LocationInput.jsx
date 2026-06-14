import React, { useState, useEffect, useRef } from 'react';
import { Plus, MapPin, X } from 'lucide-react';

export default function LocationInput({ 
  onAddLocation, 
  isOptimizing, 
  setStatusMessage, 
  GOOGLE_API_KEY = "",
  label = "Inserir Endereço Individual",
  placeholder = "Comece a digitar o endereço...",
  buttonText = "Sincronizar"
}) {
  const [currentInput, setCurrentInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fechar dropdown de autocomplete ao clicar fora dele
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Algoritmo de Debounce para busca preditiva de endereços
  useEffect(() => {
    if (currentInput.trim().length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (selectedCoordinates && selectedCoordinates.address === currentInput) {
      return;
    }

    setIsSearchingSuggestions(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(currentInput)}&limit=5`);
        const data = await res.json();
        
        if (data && data.features) {
          const parsedSuggestions = data.features.map(feat => {
            const prop = feat.properties;
            
            // Constrói rua e número de forma garantida
            let streetAndNumber = prop.street;
            if (prop.housenumber) {
              streetAndNumber = streetAndNumber ? `${streetAndNumber}, ${prop.housenumber}` : prop.housenumber;
            }

            const addressParts = [
              (prop.name && prop.name !== prop.street) ? prop.name : null,
              streetAndNumber || prop.name,
              prop.district || prop.suburb,
              prop.city,
              prop.state,
              prop.country
            ].filter(Boolean);

            return {
              address: addressParts.join(', '),
              lat: feat.geometry.coordinates[1],
              lng: feat.geometry.coordinates[0]
            };
          });
          setSuggestions(parsedSuggestions);
          setShowDropdown(parsedSuggestions.length > 0);
        }
      } catch (err) {
        console.error("Erro na busca de sugestões", err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentInput, selectedCoordinates]);

  const handleSyncAddress = async (e) => {
    if (e) e.preventDefault();
    const addressTarget = currentInput.trim();
    if (!addressTarget) return;

    setIsGeocoding(true);
    setStatusMessage({ text: "Sincronizando e validando coordenadas...", type: "info" });

    try {
      let finalPoint = null;

      if (selectedCoordinates && selectedCoordinates.address === addressTarget) {
        finalPoint = {
          id: crypto.randomUUID(),
          userInput: addressTarget,
          address: selectedCoordinates.address,
          lat: selectedCoordinates.lat,
          lng: selectedCoordinates.lng
        };
      } else {
        if (GOOGLE_API_KEY) {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressTarget)}&key=${GOOGLE_API_KEY}`);
          const data = await res.json();
          if (data.status === "OK" && data.results.length > 0) {
            finalPoint = {
              id: crypto.randomUUID(),
              userInput: addressTarget,
              address: data.results[0].formatted_address,
              lat: data.results[0].geometry.location.lat,
              lng: data.results[0].geometry.location.lng
            };
          }
        } else {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressTarget)}&limit=1`, {
            headers: { 'User-Agent': 'Vistoria-Autocomplete-Client' }
          });
          const data = await res.json();
          if (data && data.length > 0) {
            finalPoint = {
              id: crypto.randomUUID(),
              userInput: addressTarget,
              address: data[0].display_name,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            };
          }
        }
      }

      if (finalPoint) {
        onAddLocation(finalPoint);
        setCurrentInput("");
        setSelectedCoordinates(null);
        setSuggestions([]);
        setShowDropdown(false);
        setStatusMessage({ text: "Endereço sincronizado com sucesso!", type: "success" });
      } else {
        setStatusMessage({ text: "Endereço não localizado. Tente selecionar uma sugestão da lista.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "Falha na sincronização cartográfica.", type: "error" });
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setCurrentInput(sug.address);
    setSelectedCoordinates(sug);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col gap-3 relative" ref={dropdownRef}>
      <label className="text-xs font-medium text-[#a1a1aa] flex justify-between items-center">
        <span>{label}</span>
        {isSearchingSuggestions && <span className="text-[10px] font-mono text-indigo-400 animate-pulse">buscando sugestões...</span>}
      </label>
      
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <input 
            type="text"
            className="w-full h-10 bg-[#121214] border border-[#27272a] rounded-lg pl-3 pr-8 text-xs text-[#e4e4e7] placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f46] transition-all"
            placeholder={placeholder}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
            disabled={isGeocoding || isOptimizing}
          />
          {currentInput && (
            <button 
              onClick={() => { setCurrentInput(""); setSelectedCoordinates(null); setSuggestions([]); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={handleSyncAddress}
          disabled={isGeocoding || !currentInput.trim()}
          className="h-10 px-4 bg-[#f4f4f5] hover:bg-[#e4e4e7] disabled:opacity-20 text-[#09090b] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shrink-0"
        >
          {isGeocoding ? (
            <div className="w-3.5 h-3.5 border-2 border-[#09090b]/30 border-t-[#09090b] rounded-full animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>{buttonText}</span>
        </button>
      </div>

      {/* Dropdown de Sugestões Premium */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-[72px] left-0 w-full bg-[#121214] border border-[#27272a] rounded-lg shadow-2xl z-35 max-h-56 overflow-y-auto animate-fade-in divide-y divide-[#1e1e21]">
          {suggestions.map((sug, i) => (
            <div
              key={i}
              onClick={() => handleSelectSuggestion(sug)}
              className="p-3 hover:bg-[#1c1c1f] cursor-pointer transition-all flex items-start gap-2.5"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span className="text-xs text-[#d4d4d8] leading-tight line-clamp-2">{sug.address}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
