import React, { useState, useEffect } from 'react';
import { Route, Sparkles } from 'lucide-react';
import { useLeaflet } from './hooks/useLeaflet';
import { optimizeRoute } from './utils/optimizer';
import LocationInput from './components/LocationInput';
import LocationList from './components/LocationList';
import OptimizedRoute from './components/OptimizedRoute';
import MapView from './components/MapView';

// Chave opcional para Google Geocoding API. Se vazia, o sistema usa o Photon/OpenStreetMap de graça.
const GOOGLE_API_KEY = ""; 

export default function App() {
  const [locations, setLocations] = useState([]);
  const [optimizedRouteData, setOptimizedRouteData] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [roundTrip, setRoundTrip] = useState(false);

  const mapLoaded = useLeaflet();

  // Injetar fonte premium Plus Jakarta Sans e JetBrains Mono no cabeçalho
  useEffect(() => {
    const linkFont = document.createElement("link");
    linkFont.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
    linkFont.rel = "stylesheet";
    document.head.appendChild(linkFont);
    document.body.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
  }, []);

  const handleAddLocation = (newPoint) => {
    const updatedList = [...locations, newPoint];
    setLocations(updatedList);
    
    // Se a rota ainda não foi otimizada, o MapView lidará com a renderização em tempo real das localizações normais.
    if (optimizedRouteData.length > 0) {
      // Se já foi otimizada, resetamos a otimização ao adicionar novos pontos para forçar o recálculo
      setOptimizedRouteData([]);
    }
  };

  const handleRemoveLocation = (id) => {
    const updated = locations.filter(item => item.id !== id);
    setLocations(updated);
    setOptimizedRouteData([]);
  };

  const handleResetAll = () => {
    setLocations([]);
    setOptimizedRouteData([]);
    setStatusMessage({ text: "", type: "" });
  };

  // Motor combinatório de otimização combinada
  const handleOptimize = () => {
    if (locations.length < 2) {
      setStatusMessage({ text: "Adicione pelo menos 2 endereços para construir a rota.", type: "error" });
      return;
    }

    setIsOptimizing(true);
    
    setTimeout(() => {
      try {
        const bestTour = optimizeRoute(locations, roundTrip);
        setOptimizedRouteData(bestTour);
        setStatusMessage({ text: "Cálculo concluído! Rota sequencial otimizada com sucesso.", type: "success" });
      } catch (error) {
        setStatusMessage({ text: "Ocorreu um erro ao otimizar a rota.", type: "error" });
        console.error(error);
      } finally {
        setIsOptimizing(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Corpo da Aplicação */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-screen">
        
        {/* Painel de Controle Esquerdo */}
        <div className="lg:col-span-5 p-8 flex flex-col gap-8 border-r border-[#18181b] overflow-y-auto max-h-screen relative">
          
          {/* Logo e Contexto */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono tracking-widest uppercase">
              <Route className="w-3.5 h-3.5" />
              <span>Route Dispatcher & Auto-Complete v2</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-[#f4f4f5]">Otimizador de Vistorias</h1>
          </div>

          {/* Campo com Autocomplete em Tempo Real */}
          <LocationInput 
            onAddLocation={handleAddLocation}
            isOptimizing={isOptimizing}
            setStatusMessage={setStatusMessage}
            GOOGLE_API_KEY={GOOGLE_API_KEY}
          />

          {/* Alerta de Status */}
          {statusMessage.text && (
            <div className={`text-[11px] font-medium flex items-center gap-2 ${
              statusMessage.type === 'error' ? 'text-rose-400' : statusMessage.type === 'success' ? 'text-emerald-400' : 'text-zinc-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                statusMessage.type === 'error' ? 'bg-rose-500' : statusMessage.type === 'success' ? 'bg-emerald-500' : 'bg-zinc-500'
              }`} />
              <p>{statusMessage.text}</p>
            </div>
          )}

          {/* Lista de Endereços Sincronizados individualmente */}
          <LocationList 
            locations={locations}
            onRemoveLocation={handleRemoveLocation}
            onResetAll={handleResetAll}
          />

          {/* Botão de Disparo do Algoritmo Otimizador */}
          {locations.length >= 2 && optimizedRouteData.length === 0 && (
            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition-all"
            >
              {isOptimizing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Otimizar Rota de Fiscalização (TSP)</span>
            </button>
          )}

          {/* Exibição Completa das Vistorias Otimizadas */}
          <OptimizedRoute 
            optimizedRoute={optimizedRouteData}
            roundTrip={roundTrip}
            setRoundTrip={setRoundTrip}
          />
        </div>

        {/* Quadro do Mapa Cartográfico */}
        <MapView 
          mapLoaded={mapLoaded}
          locations={locations}
          optimizedRoute={optimizedRouteData}
          roundTrip={roundTrip}
        />

      </div>
    </div>
  );
}
