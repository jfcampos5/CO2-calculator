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
