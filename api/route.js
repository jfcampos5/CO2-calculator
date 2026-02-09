export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { origin, dest } = req.body;

  if (!origin || !dest) {
    return res.status(400).json({ error: 'Origem e destino são obrigatórios' });
  }

  try {
    const apiKey = process.env.HEIGIT_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Chave ORS não configurada' });
    }

    const url =
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey 
      },
      body: JSON.stringify({
        coordinates: [
          [origin.lng ?? origin.lon, origin.lat],
          [dest.lng ?? dest.lon, dest.lat]
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Erro ORS:', text);
      return res.status(500).json({ error: 'Erro ao calcular rota' });
    }

    const data = await response.json();

    const summary = data.features[0].properties.summary;

    res.status(200).json({
      distanceKm: summary.distance / 1000,
      durationMin: summary.duration / 60,
      geometry: data
    });

  } catch (error) {
    console.error('Erro interno route:', error);
    res.status(500).json({ error: 'Erro interno ao calcular rota' });
  }
}
