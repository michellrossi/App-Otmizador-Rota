import { calculateHaversine } from './distance';

/**
 * Motor combinatório de otimização de rota (Nearest Neighbor + Refinamento 2-Opt)
 * @param {Array} locations Lista de localizações [{id, address, lat, lng, ...}]
 * @param {boolean} roundTrip Indica se a rota deve retornar ao ponto inicial
 * @returns {Array} Lista otimizada de localizações
 */
export const optimizeRoute = (locations, roundTrip) => {
  if (locations.length < 2) return [...locations];

  let unvisited = [...locations.slice(1)];
  let current = locations[0];
  let tour = [current];

  // Algoritmo Nearest Neighbor (Vizinho Mais Próximo)
  while (unvisited.length > 0) {
    let nextIdx = 0;
    let minDist = calculateHaversine(current, unvisited[0]);
    for (let i = 1; i < unvisited.length; i++) {
      const d = calculateHaversine(current, unvisited[i]);
      if (d < minDist) {
        minDist = d;
        nextIdx = i;
      }
    }
    current = unvisited[nextIdx];
    tour.push(current);
    unvisited.splice(nextIdx, 1);
  }

  // Função auxiliar para calcular o custo total do tour
  const cost = (t) => {
    let d = 0;
    for (let i = 0; i < t.length - 1; i++) {
      d += calculateHaversine(t[i], t[i + 1]);
    }
    if (roundTrip) {
      d += calculateHaversine(t[t.length - 1], t[0]);
    }
    return d;
  };

  // Algoritmo de Refinamento 2-Opt
  let bestTour = [...tour];
  let bestDist = cost(bestTour);
  let globImproved = true;

  while (globImproved) {
    globImproved = false;
    for (let i = 1; i < bestTour.length - 1; i++) {
      for (let j = i + 1; j < bestTour.length; j++) {
        let newTour = [...bestTour];
        const sub = newTour.slice(i, j + 1).reverse();
        newTour.splice(i, sub.length, ...sub);
        let newDist = cost(newTour);
        if (newDist < bestDist) {
          bestTour = newTour;
          bestDist = newDist;
          globImproved = true;
        }
      }
    }
  }

  return bestTour;
};
