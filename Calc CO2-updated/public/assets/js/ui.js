// ui.js
import { calculateEmissions } from './calculator.js';

export async function initUI() {
  console.log('UI init');

  // === PASSO 1 ===
  const form = document.querySelector('form');
  const btnCalcular = document.querySelector('#btn-calc-step1');
  const btnLimpar = document.querySelector('#btn-clear-step1');

  btnCalcular.addEventListener('click', async (e) => {
    e.preventDefault();

    const origem = document.querySelector('#origin-city').value;
    const destino = document.querySelector('#dest-city').value;
    const distanciaManual = document.querySelector('#distance-km').value;

    // Aqui os radios devem ter valores "gasolina", "diesel", "etanol" ou "nenhum"
    const fuel = document.querySelector('input[name="modal"]:checked')?.value;

    let distancia = distanciaManual;

    // Se não informado, buscar pelo mapa (map-api.js futuramente)
    if (!distancia) {
      console.log('Buscar distância pelo mapa para:', origem, '->', destino);
      // Aqui vamos integrar a API de mapa no próximo passo
      distancia = 0; // placeholder
    }

    // Calcular emissões
    const resultado = calculateEmissions(fuel, distancia);
    console.log('Resultado CO₂:', resultado);

    // Atualizar UI
    const resultadoDiv = document.querySelector('#resultado');
    if (resultadoDiv) {
      resultadoDiv.textContent = `${resultado} kg CO₂`;
    }
  });

  btnLimpar.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    const resultadoDiv = document.querySelector('#resultado');
    if (resultadoDiv) {
      resultadoDiv.textContent = '';
    }
  });

  // === PASSO 2 ===
  const flexMix = document.querySelector('#flex-mix');
  const gasolinaOut = document.querySelector('#flex-gasolina-out');
  const etanolOut = document.querySelector('#flex-etanol-out');

  if (flexMix) {
    flexMix.addEventListener('input', () => {
      const gasolinaPct = flexMix.value;
      const etanolPct = 100 - gasolinaPct;
      gasolinaOut.textContent = `${gasolinaPct}%`;
      etanolOut.textContent = `${etanolPct}%`;
    });
  }

  const busWrapper = document.querySelector('#bus-passenger-wrapper');
  const truckWrapper = document.querySelector('#truck-payload-wrapper');

  document.querySelectorAll('input[name="modal"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (busWrapper) {
        busWrapper.classList.toggle('is-hidden', radio.value !== 'onibus');
      }
      if (truckWrapper) {
        truckWrapper.classList.toggle('is-hidden', radio.value !== 'caminhao');
      }
    });
  });

  const btnRecalc = document.querySelector('#btn-recalc');
  const btnNextResults = document.querySelector('#btn-next-to-results');

  if (btnRecalc) {
    btnRecalc.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Recalcular emissões com novos parâmetros...');
      // Aqui você pode chamar novamente calculateEmissions() com os novos dados
    });
  }

  if (btnNextResults) {
    btnNextResults.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Avançar para resultados...');
      // Aqui você pode mostrar a seção de resultados (PASSO 3)
    });
  }
}