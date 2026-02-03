// ================================
// Integração com API de Mapas
// ================================

// Importa configurações globais
import { MAP_API_KEY } from './config.js';

/**
 * Função para inicializar o mapa
 * @param {string} elementId - ID do elemento HTML onde o mapa será renderizado
 */
function initMap(elementId) {
  const map = new google.maps.Map(document.getElementById(elementId), {
    zoom: 6,
    center: { lat: -14.2350, lng: -51.9253 }, // Centro aproximado do Brasil
  });

  return map;
}

/**
 * Função para calcular rota e distância entre dois pontos
 * @param {string} origin - Endereço ou coordenada de origem
 * @param {string} destination - Endereço ou coordenada de destino
 * @returns {Promise<number>} - Distância em km
 */
function calculateRoute(origin, destination) {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          const route = result.routes[0].legs[0];
          const distanceKm = route.distance.value / 1000; // metros → km
          resolve(distanceKm);
        } else {
          console.error('Erro ao calcular rota:', status);
          reject(new Error(`Erro ao calcular rota: ${status}`));
        }
      }
    );
  });
}

/**
 * Função para exibir rota no mapa
 * @param {object} map - Instância do mapa
 * @param {string} origin - Origem
 * @param {string} destination - Destino
 */
function displayRoute(map, origin, destination) {
  const renderer = new google.maps.DirectionsRenderer();
  renderer.setMap(map);

  const service = new google.maps.DirectionsService();
  service.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === 'OK') {
        renderer.setDirections(result);
      } else {
        console.error('Erro ao exibir rota:', status);
      }
    }
  );
}

// Exporta funções para uso em outros módulos
export { initMap, calculateRoute, displayRoute };