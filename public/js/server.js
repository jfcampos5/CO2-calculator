import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
// Se estiver usando Node <18, descomente a linha abaixo:
// import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || "";
// Aceita tanto ORS_API_KEY quanto NEXT_PUBLIC_HEIGIT_API_KEY
const ORS_KEY =
  process.env.ORS_API_KEY || process.env.NEXT_PUBLIC_HEIGIT_API_KEY || "";

// Middleware
app.use(cors({ origin: "*" })); // permite chamadas de qualquer origem
app.use(bodyParser.json({ limit: "1mb" }));

// Servir arquivos estáticos
const PUBLIC_DIR = path.join(__dirname, "..", "public");
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
}

// Health check
app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    mapboxAvailable: !!MAPBOX_TOKEN,
    orsAvailable: !!ORS_KEY,
  })
);

// Geocoding endpoint
app.get("/api/geocode", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "missing q" });

  try {
    if (MAPBOX_TOKEN) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        q
      )}.json?limit=1&country=br&access_token=${MAPBOX_TOKEN}`;
      const r = await fetch(url);
      const j = await r.json();
      const feat = j.features?.[0];
      if (!feat) return res.json(null);
      const [lon, lat] = feat.center;
      return res.json({ lat, lon, label: feat.place_name });
    } else if (ORS_KEY) {
      const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(
        q
      )}&boundary.country=bra&size=1`;
      const r = await fetch(url);
      const j = await r.json();
      const feat = j.features?.[0];
      if (!feat) return res.json(null);
      const [lon, lat] = feat.geometry.coordinates;
      return res.json({ lat, lon, label: feat.properties.label || q });
    } else {
      return res.status(501).json({ error: "No geocoding provider configured" });
    }
  } catch (err) {
    console.error("Erro no geocode:", err);
    res.status(500).json({ error: "geocode failed" });
  }
});

// Route endpoint
app.post("/api/route", async (req, res) => {
  try {
    let { origin, dest } = req.body || {};
    if (!origin || !dest)
      return res.status(400).json({ error: "origin and dest required" });

    // Geocode se necessário
    if (origin.q && (!origin.lat || !origin.lon)) {
      const g = await geocodeServer(origin.q);
      if (!g) return res.status(400).json({ error: "origin geocode failed" });
      origin = { lat: g.lat, lon: g.lon };
    }
    if (dest.q && (!dest.lat || !dest.lon)) {
      const g = await geocodeServer(dest.q);
      if (!g) return res.status(400).json({ error: "dest geocode failed" });
      dest = { lat: g.lat, lon: g.lon };
    }

    if (
      !isFinite(origin.lat) ||
      !isFinite(origin.lon) ||
      !isFinite(dest.lat) ||
      !isFinite(dest.lon)
    )
      return res.status(400).json({ error: "invalid coords" });

    // Mapbox Directions
    if (MAPBOX_TOKEN) {
      const coords = `${origin.lon},${origin.lat};${dest.lon},${dest.lat}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
      const r = await fetch(url);
      const j = await r.json();
      const route = j.routes?.[0];
      if (!route) return res.status(500).json({ error: "route not found" });
      const distanceKm = route.distance / 1000.0;
      const geojson = {
        type: "FeatureCollection",
        features: [
          { type: "Feature", geometry: route.geometry, properties: {} },
        ],
      };
      return res.json({ distanceKm, geometry: geojson });
    }

    // OpenRouteService Directions
    else if (ORS_KEY) {
      const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ORS_KEY,
        },
        body: JSON.stringify({
          coordinates: [
            [origin.lon, origin.lat],
            [dest.lon, dest.lat],
          ],
        }),
      });
      const j = await r.json();
      const dist = j.features?.[0]?.properties?.summary?.distance;
      const distanceKm = dist ? dist / 1000.0 : null;
      return res.json({ distanceKm, geometry: j });
    }

    // Fallback: haversine
    else {
      const distanceKm = haversineKm(
        origin.lat,
        origin.lon,
        dest.lat,
        dest.lon
      );
      return res.json({ distanceKm, geometry: null });
    }
  } catch (err) {
    console.error("Erro no route:", err);
    res.status(500).json({ error: "route failed" });
  }
});

// Função auxiliar de geocodificação
async function geocodeServer(q) {
  if (!q) return null;
  try {
    if (MAPBOX_TOKEN) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        q
      )}.json?limit=1&country=br&access_token=${MAPBOX_TOKEN}`;
      const r = await fetch(url);
      const j = await r.json();
      const feat = j.features?.[0];
      if (!feat) return null;
      const [lon, lat] = feat.center;
      return { lat, lon, label: feat.place_name };
    } else if (ORS_KEY) {
      const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(
        q
      )}&boundary.country=bra&size=1`;
      const r = await fetch(url);
      const j = await r.json();
      const feat = j.features?.[0];
      if (!feat) return null;
      const [lon, lat] = feat.geometry.coordinates;
      return { lat, lon, label: feat.properties.label || q };
    } else return null;
  } catch (err) {
    console.error("Erro no geocodeServer:", err);
    return null;
  }
}

// Função auxiliar de distância
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180.0;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
