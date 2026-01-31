// co2-factors.js
export const DEFAULTS = {
  EMISSION_FACTORS_TTW: {
    gasolina: 2.31,   // kg CO₂/km
    diesel: 2.68,
    etanol: 1.47,
    nenhum: 0
  },
  WTW_MULTIPLIERS: {
    gasolina: 1.2,
    diesel: 1.25,
    etanol: 0.8,
    nenhum: 1
  }
};

/**
 * Retorna o fator de emissão para um combustível.
 * @param {string} fuel - Tipo de combustível (gasolina, diesel, etanol, nenhum)
 * @param {boolean} wtw - Se true, aplica multiplicador Well-to-Wheel
 * @returns {number} Fator de emissão em kg CO₂/km
 */
export function getFactorForFuel(fuel, wtw = false) {
  const base = DEFAULTS.EMISSION_FACTORS_TTW[fuel];
  if (base === undefined) {
    console.warn(`Combustível "${fuel}" não reconhecido`);
    return 0;
  }
  return wtw ? base * (DEFAULTS.WTW_MULTIPLIERS[fuel] || 1) : base;
}