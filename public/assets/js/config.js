// ================================
// Configurações globais da aplicação
// ================================

// URL base da API (backend Node.js)
const API_BASE_URL = "http://localhost:3000";

// Chave de API para serviços externos (exemplo: mapas)
const MAP_API_KEY = "SUA_CHAVE_DE_API_AQUI";

// Fatores de emissão de CO2 (g/km) por tipo de veículo
const CO2_FACTORS = {
  carro: 120,       // gramas de CO2 por km
  moto: 90,
  onibus: 80,
  caminhao: 250,
  bicicleta: 0      // transporte sustentável
};

// Configurações de UI
const UI_CONFIG = {
  theme: "light",   // opções: "light" ou "dark"
  language: "pt-BR" // idioma padrão
};

// Exporta as configurações para uso em outros módulos
export {
  API_BASE_URL,
  MAP_API_KEY,
  CO2_FACTORS,
  UI_CONFIG
};