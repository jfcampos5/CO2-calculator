export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Parâmetro q é obrigatório" });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      q
    )}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "co2-calculator/1.0"
      }
    });

    if (!response.ok) {
      throw new Error("Erro ao consultar Nominatim");
    }

    const data = await response.json();

    if (!data.length) {
      return res.status(404).json({ error: "Local não encontrado" });
    }

    return res.status(200).json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon), // 🔥 agora certo
      label: data[0].display_name
    });
  } catch (error) {
    console.error("Erro no geocode:", error);
    return res.status(500).json({ error: "Erro interno no geocode" });
  }
}
