// ================================
// Integração com API de Mapas (HeiGIT / OpenRouteService)
// ================================

const HEIGIT_API_KEY = process.env.HEIGIT_API_KEY;

/**
 * Função para converter cidade + estado em coordenadas [lng, lat] usando HeiGIT
 * @param {string} local - Nome da cidade + estado (ex: "Salvador BA")
 * @returns {Promise<[number, number]>} Coordenadas [lng, lat]
 */
async function geocodeLocation(local) {
  try {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${HEIGIT_API_KEY}&text=${encodeURIComponent(local)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erro na geocodificação: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates; // [lng, lat]
      return coords;
    } else {
      throw new Error("Local não encontrado na geocodificação.");
    }
  } catch (error) {
    console.error("Erro ao geocodificar local:", error);
    throw error;
  }
}

/**
 * Função para calcular distância usando API da HeiGIT (OpenRouteService)
 * @param {Array} origin - Coordenadas [lng, lat] de origem
 * @param {Array} destination - Coordenadas [lng, lat] de destino
 * @returns {Promise<number>} - Distância em km
 */
async function calculateDistanceHeiGIT(origin, destination) {
  try {
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${HEIGIT_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates: [origin, destination]
      })
    });

    const data = await response.json();
    const distanceKm = data.routes[0].summary.distance / 1000; // metros → km
    return distanceKm;
  } catch (error) {
    console.error('Erro ao calcular distância com HeiGIT:', error);
    throw error;
  }
}

// Exporta funções para uso em outros módulos
export { HEIGIT_API_KEY, geocodeLocation, calculateDistanceHeiGIT };
// ================================
// Integração com API de Mapas
// ================================

const HEIGIT_API_KEY = process.env.HEIGIT_API_KEY;

/**
 * Recupera as chaves das variáveis de ambiente
 * No Vercel, configure em Settings > Environment Variables
 */
/*
const MAP_API_KEY = process.env.MAPS_API_KEY;
//
*/

/**
 * Função para inicializar o mapa (Google Maps)
 * @param {string} elementId - ID do elemento HTML onde o mapa será renderizado
 
function initMap(elementId) {
  const map = new google.maps.Map(document.getElementById(elementId), {
    zoom: 6,
    center: { lat: -14.2350, lng: -51.9253 }, // Centro aproximado do Brasil
  });

  return map;
}

/**
 * Função para calcular rota e distância entre dois pontos (Google Maps)
 * @param {string} origin - Endereço ou coordenada de origem
 * @param {string} destination - Endereço ou coordenada de destino
 * @returns {Promise<number>} - Distância em km
 
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
 * Função para exibir rota no mapa (Google Maps)
 * @param {object} map - Instância do mapa
 * @param {string} origin - Origem
 * @param {string} destination - Destino
 
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
*/
/**
*/
 * Função para calcular distância usando API da HeiGIT (OpenRouteService)
 * @param {Array} origin - Coordenadas [lng, lat] de origem
 * @param {Array} destination - Coordenadas [lng, lat] de destino
 * @returns {Promise<number>} - Distância em km
 
async function calculateDistanceHeiGIT(origin, destination) {
  try {
    const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${HEIGIT_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates: [origin, destination]
      })
    });

    const data = await response.json();
    const distanceKm = data.routes[0].summary.distance / 1000; // metros → km
    return distanceKm;
  } catch (error) {
    console.error('Erro ao calcular distância com HeiGIT:', error);
    throw error;
  }
}

// Exporta funções para uso em outros módulos
export { HEIGIT_API_KEY, calculateDistanceHeiGIT };

