import React, { useEffect, useRef } from 'react';

export default function MapView({ 
  mapLoaded, 
  locations, 
  optimizedRoute, 
  roundTrip 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routeLineRef = useRef(null);

  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      const map = window.L.map(mapRef.current, { zoomControl: false }).setView([-23.55052, -46.633308], 12);
      
      // Visual do mapa: CartoDB Dark Matter
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap / CARTO'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = window.L.featureGroup().addTo(map);
    }
  }, [mapLoaded]);

  const clearMapLayer = () => {
    if (markersGroupRef.current) markersGroupRef.current.clearLayers();
    if (routeLineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
  };

  // Busca rota real via OSRM (gratuito)
  const fetchOSRMRoute = async (waypoints) => {
    try {
      // OSRM espera coordenadas no formato lng,lat
      const coordsStr = waypoints.map(pt => `${pt[1]},${pt[0]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        // Retorna as coordenadas no formato [lat, lng] para o Leaflet
        return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      }
    } catch (err) {
      console.warn('OSRM: Falha ao buscar rota real, usando linha reta como fallback.', err);
    }
    return null;
  };

  const updateMapRoute = async (routeData) => {
    if (!mapInstanceRef.current || !window.L) return;
    clearMapLayer();

    if (routeData.length === 0) return;
    const coordinates = routeData.map(pt => [pt.lat, pt.lng]);

    routeData.forEach((pt, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === routeData.length - 1 && !roundTrip;
      let borderHex = '#6366f1'; // Indigo base
      
      if (isFirst) borderHex = '#10b981'; // Verde de Origem
      else if (isLast) borderHex = '#f43f5e'; // Rosa/Vermelho de Fim

      const icon = window.L.divIcon({
        className: 'custom-minimal-icon',
        html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-slate-950 border-2 font-mono text-[10px] font-bold text-slate-200 animate-fade-in" style="border-color: ${borderHex}">${idx === 0 ? '★' : idx + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      window.L.marker([pt.lat, pt.lng], { icon })
        .bindPopup(`<div class="text-xs font-sans text-slate-900 font-medium">${pt.address}</div>`)
        .addTo(markersGroupRef.current);
    });

    if (routeData.length > 1) {
      const activePath = [...coordinates];
      if (roundTrip) activePath.push(coordinates[0]);

      // Tenta buscar rota real via OSRM
      const realRoute = await fetchOSRMRoute(activePath);
      
      if (realRoute && realRoute.length > 0) {
        // Rota real seguindo as vias
        routeLineRef.current = window.L.polyline(realRoute, {
          color: '#818cf8',
          weight: 3,
          opacity: 0.85,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(mapInstanceRef.current);
      } else {
        // Fallback: linha reta caso OSRM falhe
        routeLineRef.current = window.L.polyline(activePath, {
          color: '#818cf8',
          weight: 2,
          opacity: 0.9,
          lineJoin: 'round',
          dashArray: '6, 8'
        }).addTo(mapInstanceRef.current);
      }
    }

    const bounds = markersGroupRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      const activeRoute = optimizedRoute.length > 0 ? optimizedRoute : locations;
      updateMapRoute(activeRoute);
    }
  }, [locations, optimizedRoute, roundTrip, mapLoaded]);

  return (
    <div className="lg:col-span-7 bg-[#09090b] relative flex flex-col min-h-[350px] lg:min-h-0">
      <div ref={mapRef} className="w-full h-full z-10 bg-[#09090b]" />
      
      {/* Assinatura Visual Absoluta */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none opacity-40">
        <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase">OSRM ROAD ROUTING ENGINE ENABLED</span>
      </div>
    </div>
  );
}

