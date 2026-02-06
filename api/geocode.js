export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Parâmetro q é obrigatório' });
  }

  // Exemplo simples: retornar coordenadas fixas para Salvador
  if (q.toLowerCase().includes('salvador')) {
    return res.status(200).json({
      lat: -12.9714,
      lon: -38.5014,
      label: 'Salvador, Bahia, Brasil'
    });
  }

  // Caso não reconheça
  return res.status(404).json({ error: 'Local não encontrado' });
}
