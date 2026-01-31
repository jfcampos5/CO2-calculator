// utils.js
/**
 * Formata um número para exibição com casas decimais.
 * @param {number} n - Número a formatar
 * @param {number} d - Número de casas decimais (default = 2)
 * @returns {string} Número formatado ou "—" se inválido
 */
export function formatNumber(n, d = 2) {
  if (!isFinite(n)) return "—"; // retorna traço se não for número válido
  return Number(n).toFixed(d);
}