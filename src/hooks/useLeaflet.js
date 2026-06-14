import { useState, useEffect } from 'react';

/**
 * Hook customizado para carregar os recursos do Leaflet de forma assíncrona.
 * @returns {boolean} Estado que indica se o Leaflet foi totalmente carregado.
 */
export function useLeaflet() {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (window.L) {
        setMapLoaded(true);
        return;
      }
      
      // Carregar folhas de estilo CSS do Leaflet
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      // Carregar script Javascript do Leaflet
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };
    loadLeaflet();
  }, []);

  return mapLoaded;
}
