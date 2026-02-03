import { calculateEmissions } from './calculator.js';
import { calculateRoute } from './map-api.js'; // integração com mapa

export async function initUI() {
  console.log('UI init');

  // Alternância de tema claro/escuro
const btnTheme = document.querySelector('#theme-toggle');
const htmlEl = document.documentElement; // <html>

function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

if (btnTheme) {
  btnTheme.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
}

  // Carregar preferência ao iniciar
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme('light'); // tema padrão inicial
}

  // === PASSO 1 ===
  const form = document.querySelector('#trip-form');
  const btnCalcular = document.querySelector('#btn-calc-step1');
  const btnLimpar = document.querySelector('#btn-clear-step1');

  btnCalcular.addEventListener('click', async (e) => {
    e.preventDefault();

    const origem = document.querySelector('#cidade-origem').value;
    const estadoOrigem = document.querySelector('#estado-origem').value;
    const destino = document.querySelector('#cidade-destino').value;
    const estadoDestino = document.querySelector('#estado-destino').value;
    const distanciaManual = document.querySelector('#distance-km').value;
    const transporte = document.querySelector('input[name="modal"]:checked')?.value;

    // 🔹 Captura do combustível selecionado
    const combustivel = document.querySelector('input[name="combustivel"]:checked')?.value;

    let distancia = parseFloat(distanciaManual);

    // Se não informado, buscar pelo mapa (somente se origem/destino existirem)
    if (!distancia && origem && destino) {
      try {
        distancia = await calculateRoute(`${origem} ${estadoOrigem}`, `${destino} ${estadoDestino}`);
        console.log('Distância obtida pelo mapa:', distancia);
      } catch (err) {
        console.error(err);
        alert("Não foi possível calcular a distância pelo mapa. Insira manualmente.");
        return;
      }
    }

    // 🔹 Novas variáveis contextuais (exemplo: podem ser capturadas da UI futuramente)
    const temperatura = parseFloat(document.querySelector('#temperatura')?.value || 25);
    const relevo = document.querySelector('#relevo')?.value || 'plano'; // plano | montanhoso
    const velocidade = parseFloat(document.querySelector('#velocidade')?.value || 80);
    const peso = document.querySelector('#peso')?.value || 'leve'; // leve | pesado
    const tipoVia = document.querySelector('#tipo-via')?.value || 'rodoviaria'; // urbana | rodoviaria

    // Calcular emissões com ajustes
    const resultado = calculateEmissions(distancia, transporte, combustivel, false, {
      temperatura,
      relevo,
      velocidade,
      peso,
      tipoVia
    });
    console.log('Resultado CO₂:', resultado);

    // Atualizar UI
    const outDistance = document.querySelector('#out-distance-km');
    const outTotal = document.querySelector('#out-total-kg');
    const outEquivalences = document.querySelector('#out-equivalences');
    const outLiters = document.querySelector('#out-liters');
    const outFuelSummary = document.querySelector('#out-fuel-summary');
    const outPerKm = document.querySelector('#out-per-km');

    if (outDistance) {
      outDistance.textContent = distancia || '—';
    }
    if (outTotal) {
      if (Number.isFinite(resultado)) {
        outTotal.textContent = Number(resultado).toFixed(2); // apenas número, unidade já está no HTML
      } else {
        outTotal.textContent = '—';
      }
    }

    // 🔹 Atualizar litros de combustível e emissões por km
    if (outLiters) {
      let consumoMedio = null;
      if (transporte === 'carro') consumoMedio = 12;
      if (transporte === 'onibus') consumoMedio = 3;
      if (transporte === 'caminhao') consumoMedio = 2.5;
      if (transporte === 'moto') consumoMedio = 25;
      if (transporte === 'bicicleta') consumoMedio = Infinity; // não consome combustível

      const litros = consumoMedio === Infinity ? 0 : (distancia / consumoMedio);
      outLiters.textContent = !isNaN(litros) ? litros.toFixed(2) : '—';

      if (outFuelSummary) {
        outFuelSummary.textContent = consumoMedio === Infinity 
          ? 'Não há consumo de combustível' 
          : `Consumo estimado considerando ${consumoMedio} km/L`;
      }
    }

    if (outPerKm) {
      if (Number.isFinite(resultado) && distancia > 0) {
        const perKm = (resultado * 1000) / distancia; // g CO₂/km
        outPerKm.textContent = perKm.toFixed(2);
      } else {
        outPerKm.textContent = '—';
      }
    }

    // 🔹 Implementar equivalências
    if (outEquivalences && Number.isFinite(resultado)) {
      const arvores = (resultado / 21).toFixed(1); // árvores por ano
      const energia = (resultado / 0.5).toFixed(0); // kWh equivalentes
      const vooHoras = (resultado / 90).toFixed(1); // horas de voo

      outEquivalences.textContent = 
        `Equivale a ${arvores} árvores em um ano, ` +
        `${energia} kWh de energia elétrica, ou ` +
        `${vooHoras} horas de voo de avião.`;
    }

    // 🔹 Mostrar seção de resultados automaticamente
    const resultsPanel = document.querySelector('[data-panel="results"]');
    if (resultsPanel) {
      resultsPanel.classList.remove('is-hidden');
    }
  });

  btnLimpar.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    const outDistance = document.querySelector('#out-distance-km');
    const outTotal = document.querySelector('#out-total-kg');
    const outEquivalences = document.querySelector('#out-equivalences');
    const outLiters = document.querySelector('#out-liters');
    const outFuelSummary = document.querySelector('#out-fuel-summary');
    const outPerKm = document.querySelector('#out-per-km');

    if (outDistance) outDistance.textContent = '';
    if (outTotal) outTotal.textContent = '';
    if (outEquivalences) outEquivalences.textContent = '';
    if (outLiters) outLiters.textContent = '';
    if (outFuelSummary) outFuelSummary.textContent = '';
    if (outPerKm) outPerKm.textContent = '';

    // 🔹 Esconder novamente a seção de resultados
    const resultsPanel = document.querySelector('[data-panel="results"]');
    if (resultsPanel) {
      resultsPanel.classList.add('is-hidden');
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
      const resultsPanel = document.querySelector('[data-panel="results"]');
      if (resultsPanel) {
        resultsPanel.classList.remove('is-hidden'); // também mostra resultados se usar esse botão
      }
    });
  }
}
