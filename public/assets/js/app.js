import { initUI } from './ui.js';

// Função para converter nome da cidade em coordenadas (lat/lng)
async function getCoordinates(city) {
  console.log("Buscando coordenadas para:", city); // LOG EXTRA
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
  );
  const data = await response.json();
  console.log("Resposta da API de geocodificação:", data); // LOG EXTRA
  if (data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

// Função para enviar origem/destino ao backend
async function calcularRota(originCity, destCity) {
  try {
    console.log("Calculando rota entre:", originCity, "→", destCity); // LOG EXTRA

    const origin = await getCoordinates(originCity);
    const dest = await getCoordinates(destCity);

    console.log("Coordenadas obtidas:", { origin, dest }); // LOG EXTRA

    if (!origin || !dest) {
      const result = document.getElementById("result");
      if (result) {
        result.textContent = "Não foi possível localizar uma das cidades.";
      }
      return;
    }

    const response = await fetch("http://localhost:3000/api/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, dest })
    });

    const data = await response.json();
    console.log("Resposta do backend:", data); // LOG EXTRA

    const result = document.getElementById("result");
    if (result) {
      result.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    console.error("Erro ao calcular rota:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initUI();

  const form = document.getElementById("routeForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const originCity = document.getElementById("origin-city").value;
      const destCity = document.getElementById("dest-city").value;

      console.log("Formulário enviado. Origem:", originCity, "Destino:", destCity); // LOG EXTRA

      calcularRota(originCity, destCity);
    });
  }
});