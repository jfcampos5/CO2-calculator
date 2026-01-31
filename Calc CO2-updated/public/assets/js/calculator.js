// calculator.js
import { getFactorForFuel } from './co2-factors.js';
import { formatNumber } from './utils.js';

/**
 * Calcula as emissões de CO₂ com base em combustível e distância.
 * @param {string} fuel - Tipo de combustível (gasolina, diesel, etanol, nenhum)
 * @param {number|string} distanceKm - Distância em km (número ou string)
 * @param {boolean} wtw - Se true, aplica multiplicador Well-to-Wheel
 * @returns {string} Emissões em kg CO₂ (formatado)
 */
export function calculateEmissions(fuel, distanceKm, wtw = false) {
  try {
    const distance = parseFloat(distanceKm) || 0;
    const factor = getFactorForFuel(fuel, wtw);
    const emissions = distance * factor;

    console.log('=== Cálculo de Emissões ===');
    console.log(`Distância: ${distance} km`);
    console.log(`Combustível: ${fuel}`);
    console.log(`Fator de emissão (${wtw ? 'WTW' : 'TTW'}): ${factor}`);
    console.log(`Emissões calculadas: ${emissions} kg CO₂`);

    return formatNumber(emissions, 2);
  } catch (error) {
    console.error('Erro ao calcular emissões:', error);
    return "—";
  }
}