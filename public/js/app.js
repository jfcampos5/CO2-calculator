import { initUI } from './ui.js';


// Função para converter nome da cidade em coordenadas (lat/lng)
async function getCoordinates(city, state) {
  const query = `${city}, ${state}, Brasil`;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

// Fallback usando OpenRouteService (chave via variável de ambiente)
async function calcularRotaFallback(origin, dest) {
  try {
    const apiKey = import.meta.env.VITE_ORS_API_KEY; // chave definida em .env
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin.lng},${origin.lat}&end=${dest.lng},${dest.lat}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const distanciaKm = data.routes[0].summary.distance / 1000; // metros → km
      const duracaoMin = data.routes[0].summary.duration / 60; // segundos → minutos

      // Atualizar UI
      document.getElementById("out-distance-km").textContent = distanciaKm.toFixed(1);
      document.getElementById("out-liters").textContent = "—"; 
      document.getElementById("out-total-kg").textContent = "—"; 
      document.getElementById("out-equivalences").textContent = `Tempo estimado: ${duracaoMin.toFixed(0)} min`;

      showToast("Rota calculada via OpenRouteService (fallback).");
    }
  } catch (err) {
    console.error("Erro no fallback:", err);
    showToast("Erro ao calcular rota via fallback.");
  }
}

// Função principal para calcular rota
async function calcularRota(originCity, originState, destCity, destState) {
  try {
    const origin = await getCoordinates(originCity, originState);
    const dest = await getCoordinates(destCity, destState);

    if (!origin || !dest) {
      showToast("Não foi possível localizar uma das cidades.");
      return;
    }

    // Tenta backend
    try {
      const response = await fetch("http://localhost:3000/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, dest })
      });

      if (!response.ok) throw new Error("Backend indisponível");

      const data = await response.json();
      console.log("Resposta do backend:", data);

      // Atualizar UI com dados do backend
      document.getElementById("out-distance-km").textContent = data.distanceKm?.toFixed(1) || "—";
      document.getElementById("out-liters").textContent = data.fuelLiters?.toFixed(2) || "—";
      document.getElementById("out-total-kg").textContent = data.emissionsKg?.toFixed(2) || "—";
      document.getElementById("out-equivalences").textContent = data.equivalences || "—";

    } catch (err) {
      console.warn("Backend falhou, usando fallback:", err);
      await calcularRotaFallback(origin, dest);
    }

  } catch (err) {
    console.error("Erro geral ao calcular rota:", err);
    showToast("Erro ao calcular rota.");
  }
}

// Função para mostrar toast
function showToast(message) {
  const container = document.getElementById("toast-container");
  if (container) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initUI();

  const form = document.getElementById("trip-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const originCity = document.getElementById("cidade-origem").value;
      const originState = document.getElementById("estado-origem").value;
      const destCity = document.getElementById("cidade-destino").value;
      const destState = document.getElementById("estado-destino").value;

      calcularRota(originCity, originState, destCity, destState);
    });
  }
});

/* =================================================
   BLOCO MAPA — (Leaflet + HeiGIT)
   ================================================= */

let map;
let origemMarker;
let destinoMarker;
let rotaLayer;

/**
 * Inicializa o mapa apenas quando o painel é exibido
 */
function initMapa() {
  if (map) return; // evita inicializar duas vezes

  map = L.map("map", {
    center: [-14.235, -51.9253], // Brasil
    zoom: 4,
    scrollWheelZoom: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
}

/**
 * Cria ou atualiza marcador
 */
function criarMarcador(lat, lng, tipo) {
  const marker = L.marker([lat, lng]);

  if (tipo === "origem") {
    if (origemMarker) map.removeLayer(origemMarker);
    origemMarker = marker.addTo(map).bindPopup("Origem").openPopup();
  }

  if (tipo === "destino") {
    if (destinoMarker) map.removeLayer(destinoMarker);
    destinoMarker = marker.addTo(map).bindPopup("Destino").openPopup();
  }
}

/**
 * Calcula rota e distância usando HeiGIT
 */
async function calcularRota(origem, destino) {
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

  const body = {
    coordinates: [
      [origem.lng, origem.lat],
      [destino.lng, destino.lat],
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Erro na rota");

    const data = await response.json();

    if (rotaLayer) map.removeLayer(rotaLayer);

    rotaLayer = L.geoJSON(data, {
      style: {
        color: "#2563eb",
        weight: 4,
      },
    }).addTo(map);

    map.fitBounds(rotaLayer.getBounds());

    const distanciaKm =
      data.features[0].properties.summary.distance / 1000;

    atualizarDistancia(distanciaKm);
  } catch (error) {
    console.warn("Erro ao calcular rota:", error);
    mostrarErroDistancia();
  }
}

/**
 * Atualiza distância automática
 */
function atualizarDistancia(km) {
  const campo = document.querySelector("#distancia");

  if (campo) {
    campo.value = km.toFixed(2);
    campo.readOnly = true;
  }
}

/**
 * Fallback: erro na distância automática
 */
function mostrarErroDistancia() {
  const campo = document.querySelector("#distancia");

  if (campo) {
    campo.value = "";
    campo.readOnly = false;
    campo.placeholder =
      "Não foi possível calcular a distância automaticamente. Insira manualmente.";
  }
}

/**
 * Converte endereço em coordenadas (Nominatim)
 */
async function geocodificar(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    endereco
  )}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.length) throw new Error("Endereço não encontrado");

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}

/**
 * Função principal chamada ao calcular rota
 */
async function processarMapa(enderecoOrigem, enderecoDestino) {
  initMapa();

  try {
    const origem = await geocodificar(enderecoOrigem);
    const destino = await geocodificar(enderecoDestino);

    criarMarcador(origem.lat, origem.lng, "origem");
    criarMarcador(destino.lat, destino.lng, "destino");

    calcularRota(origem, destino);
  } catch (error) {
    console.warn("Erro no mapa:", error);
    mostrarErroDistancia();
  }
}
