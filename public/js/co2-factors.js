// co2-factors.js
export const EMISSION_FACTORS_TTW = {
  carro: {
    gasolina: 2.31,   // kg CO₂/km
    diesel: 2.68,
    etanol: 1.47
  },
  onibus: {
    diesel: 2.68
  },
  caminhao: {
    diesel: 2.68
  },
  moto: {
    gasolina: 2.31,
    etanol: 1.47
  },
  bicicleta: {
    nenhum: 0
  }
};

export const WTW_MULTIPLIERS = {
  gasolina: 1.2,
  diesel: 1.25,
  etanol: 0.8,
  nenhum: 1
};

/**
 * Retorna o fator de emissão para um transporte + combustível.
 * @param {string} transport - Tipo de transporte (carro, onibus, caminhao, moto, bicicleta)
 * @param {string} fuel - Tipo de combustível (gasolina, diesel, etanol, nenhum)
 * @param {boolean} wtw - Se true, aplica multiplicador Well-to-Wheel
 * @returns {number} Fator de emissão em kg CO₂/km
 */
export function getFactorForTransportFuel(transport, fuel, wtw = false) {
  const transportFactors = EMISSION_FACTORS_TTW[transport];
  if (!transportFactors) {
    console.warn(`Transporte "${transport}" não reconhecido`);
    return 0;
  }

  const base = transportFactors[fuel];
  if (base === undefined) {
    alert("Selecione um combustível válido para o transporte escolhido.");
    return 0;
  }

  return wtw ? base * (WTW_MULTIPLIERS[fuel] || 1) : base;
}

/**
 * Calcula emissões de CO₂ para uma viagem.
 * @param {number} distancia - Distância em km
 * @param {string} transport - Tipo de transporte
 * @param {string} fuel - Tipo de combustível
 * @param {boolean} wtw - Se true, aplica multiplicador Well-to-Wheel
 * @param {object} ajustes - Objeto com ajustes (temperatura, relevo, velocidade, peso, tipoVia)
 * @returns {number} Emissão total em kg CO₂
 */
export function calculateEmissions(distancia, transport, fuel, wtw = false, ajustes = {}) {
  const fatorBase = getFactorForTransportFuel(transport, fuel, wtw);

  // Ajustes simples (exemplo: relevo aumenta consumo, velocidade reduz eficiência etc.)
  let multiplicador = 1;
  if (ajustes.relevo === 'montanhoso') multiplicador *= 1.1;
  if (ajustes.velocidade && ajustes.velocidade > 120) multiplicador *= 1.05;
  if (ajustes.peso && ajustes.peso > 1000) multiplicador *= 1.02;

  return distancia * fatorBase * multiplicador;
}

