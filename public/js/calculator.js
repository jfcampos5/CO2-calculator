// Importa função de rota do map-api.js
import { calculateRoute } from './map-api.js';
import { getFactorForTransportFuel } from './co2-factors.js';

// Função exportada para ser usada em outros módulos (ex: ui.js)
export function calculateEmissions(distancia, tipoTransporte, tipoCombustivel, wtw = false, options = {}) {
  // Bicicleta não precisa de combustível
  if (tipoTransporte === "bicicleta") {
    return distancia * getFactorForTransportFuel("bicicleta", "nenhum", wtw);
  }

  const fator = getFactorForTransportFuel(tipoTransporte, tipoCombustivel, wtw);
  if (!fator) {
    alert("Selecione um combustível válido para o transporte escolhido.");
    return NaN;
  }

  // === Ajustes adicionais ===
  const {
    temperatura = 25,   // °C
    relevo = 'plano',   // plano | montanhoso
    velocidade = 80,    // km/h
    peso = 'leve',      // leve | pesado
    tipoVia = 'rodoviaria' // urbana | rodoviaria
  } = options;

  let ajusteTemperatura = 1.0;
  if (temperatura < 5 || temperatura > 35) ajusteTemperatura = 1.1;

  let ajusteRelevo = 1.0;
  if (relevo === 'montanhoso') ajusteRelevo = 1.2;

  let ajusteVelocidade = 1.0;
  if (velocidade < 30) ajusteVelocidade = 1.3;
  else if (velocidade > 120) ajusteVelocidade = 1.15;

  let ajustePeso = 1.0;
  if (peso === 'pesado') ajustePeso = 1.25;

  let ajusteTipoVia = 1.0;
  if (tipoVia === 'urbana') ajusteTipoVia = 1.2;

  // Emissão total considerando ajustes
  return distancia * fator *
    ajusteTemperatura *
    ajusteRelevo *
    ajusteVelocidade *
    ajustePeso *
    ajusteTipoVia;
}

// Função usada diretamente pelo botão no HTML
async function calcularEmissao() {
  const origem = document.getElementById("origem")?.value;
  const destino = document.getElementById("destino")?.value;
  const manual = document.getElementById("manual-distance")?.checked;

  let distancia = 0;

  if (manual) {
    distancia = parseFloat(document.getElementById("distance-km")?.value || 0);
  } else {
    try {
      distancia = await calculateRoute(origem, destino);
    } catch (err) {
      console.error(err);
      alert("Não foi possível calcular a distância pelo mapa. Insira manualmente.");
      return;
    }
  }

  const tipoTransporte = document.querySelector('input[name="modal"]:checked')?.value;
  const tipoCombustivel = document.querySelector('input[name="combustivel"]:checked')?.value;

  // Logs para depuração
  console.log("Origem:", origem);
  console.log("Destino:", destino);
  console.log("Distância (km):", distancia);
  console.log("Transporte:", tipoTransporte);
  console.log("Combustível:", tipoCombustivel);

  if (!tipoTransporte) {
    alert("Selecione um meio de transporte.");
    return;
  }

  if ((tipoTransporte === "carro" || tipoTransporte === "moto") && !tipoCombustivel) {
    alert("Selecione o combustível para o transporte escolhido.");
    return;
  }

  if (isNaN(distancia) || distancia <= 0) {
    alert("Informe uma distância válida ou escolha cidades corretas.");
    return;
  }

  // Exemplo: passando ajustes fixos (pode ser adaptado para vir da UI futuramente)
  const emissao = calculateEmissions(distancia, tipoTransporte, tipoCombustivel, false, {
    temperatura: 30,
    relevo: 'montanhoso',
    velocidade: 25,
    peso: 'leve',
    tipoVia: 'urbana'
  });

  const resultado = document.getElementById("resultado");
  if (resultado && !isNaN(emissao)) {
    resultado.innerText = `Emissão estimada: ${emissao.toFixed(2)} kg de CO₂`;
  } else {
    console.log("Emissão estimada:", emissao);
  }
}

// Adiciona evento ao botão automaticamente
document.addEventListener("DOMContentLoaded", () => {
  const botao = document.getElementById("btnCalcular");
  if (botao) {
    botao.addEventListener("click", calcularEmissao);
  }
});
