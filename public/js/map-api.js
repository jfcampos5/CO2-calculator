// ================================
// Integração com API de Mapas (HeiGIT / OpenRouteService)
// ================================

/**
 * Função para converter cidade + estado em coordenadas [lng, lat]
 * usando o endpoint do backend (/api/geocode)
 * @param {string} local - Nome da cidade + estado (ex: "Salvador BA")
 * @returns {Promise<[number, number]>} Coordenadas [lng, lat]
 */
async function geocodeLocation(local) {
  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(local)}`);

    if (!response.ok) {
      throw new Error(`Erro na geocodificação: ${response.statusText}`);
    }

    const data = await response.json();

    // Ajuste correto para o formato retornado pela API (HeiGIT / ORS)
    if (data?.features?.length > 0) {
      const [lon, lat] = data.features[0].geometry.coordinates;
      return [lon, lat]; // [lng, lat]
    } else {
      throw new Error("Local não encontrado na geocodificação.");
    }
  } catch (error) {
    console.error("Erro ao geocodificar local:", error);
    throw error;
  }
}

/**
 * Função para calcular distância usando o endpoint do backend (/api/route)
 * @param {Array} origin - Coordenadas [lng, lat] de origem
 * @param {Array} destination - Coordenadas [lng, lat] de destino
 * @returns {Promise<number>} - Distância em km
 */
async function calculateDistanceHeiGIT(origin, destination) {
  try {
    const response = await fetch(`/api/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: origin[1], lon: origin[0] },
        dest: { lat: destination[1], lon: destination[0] }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ao calcular distância: ${response.statusText}`);
    }

    const data = await response.json();
    return data.distanceKm; // já vem em km do backend
  } catch (error) {
    console.error('Erro ao calcular distância com HeiGIT:', error);
    throw error;
  }
}

// Exporta funções para uso em outros módulos
export { geocodeLocation, calculateDistanceHeiGIT };
