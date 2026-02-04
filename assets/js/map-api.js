// ================================
// Integração com API de Mapas
// ================================

/**
 * Recupera a chave da API de mapas das variáveis de ambiente
 * No Vercel, configure em Settings > Environment Variables
 */
const MAP_API_KEY = process.env.MAPS_API_KEY;

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
export { MAP_API_KEY, initMap, calculateRoute, displayRoute };
