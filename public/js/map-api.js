// ================================
// Integração com API de Mapas (HeiGIT / OpenRouteService)
// ================================

// Use NEXT_PUBLIC_HEIGIT_API_KEY no Vercel para expor ao frontend
const HEIGIT_API_KEY = process.env.NEXT_PUBLIC_HEIGIT_API_KEY;

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
      return data.features[0].geometry.coordinates; // [lng, lat]
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
      body: JSON.stringify({ coordinates: [origin, destination] })
    });

    const data = await response.json();
    return data.routes[0].summary.distance / 1000; // metros → km
  } catch (error) {
    console.error('Erro ao calcular distância com HeiGIT:', error);
    throw error;
  }
}

// Exporta funções para uso em outros módulos
export { HEIGIT_API_KEY, geocodeLocation, calculateDistanceHeiGIT };
