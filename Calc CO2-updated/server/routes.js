// server/routes.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Função auxiliar: cálculo de distância em linha reta (Haversine)
function haversineDistance(origin, dest) {
  const R = 6371; // raio da Terra em km
  const dLat = (dest.lat - origin.lat) * Math.PI / 180;
  const dLng = (dest.lng - origin.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

// Endpoint /api/route
app.post('/api/route', (req, res) => {
  const { origin, dest } = req.body;

  if (!origin || !dest) {
    return res.status(400).json({ error: 'Origem e destino são obrigatórios' });
  }

  const distanceKm = haversineDistance(origin, dest);

  res.json({
    distanceKm: distanceKm.toFixed(1),
    geometry: {
      type: "LineString",
      coordinates: [
        [origin.lng, origin.lat],
        [dest.lng, dest.lat]
      ]
    }
  });
});

// Inicia servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});