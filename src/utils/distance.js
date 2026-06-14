/**
 * Calcula a distância entre duas coordenadas geográficas utilizando a fórmula de Haversine.
 * @param {Object} c1 Coordenada 1 {lat, lng}
 * @param {Object} c2 Coordenada 2 {lat, lng}
 * @returns {number} Distância em quilômetros
 */
export const calculateHaversine = (c1, c2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
