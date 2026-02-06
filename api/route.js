export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { origin, dest } = req.body;

  if (!origin || !dest) {
    return res.status(400).json({ error: 'Origem e destino são obrigatórios' });
  }

  // Exemplo simples: calcular distância aproximada
  const distanceKm = Math.round(
    Math.sqrt(
      Math.pow(dest.lat - origin.lat, 2) +
      Math.pow(dest.lon - origin.lon, 2)
    ) * 111 // fator aproximado para converter graus em km
  );

  res.status(200).json({
    distanceKm,
    geometry: {
      type: 'LineString',
      coordinates: [
        [origin.lon, origin.lat],
        [dest.lon, dest.lat]
      ]
    }
  });
}
