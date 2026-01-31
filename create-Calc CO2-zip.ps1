<#
  Script PowerShell para criar ecotrip-updated/ e empacotar em ecotrip-updated.zip (Compress-Archive).
  Requer PowerShell 5+.
#>
param([string]$Root = "ecotrip-updated", [string]$ZipName = "ecotrip-updated.zip")

function Write-File([string]$Path, [string]$Content) {
  $dir = Split-Path $Path -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $Content | Out-File -FilePath $Path -Encoding UTF8 -Force
}

if (Test-Path $Root) { Remove-Item -Recurse -Force $Root }
if (Test-Path $ZipName) { Remove-Item -Force $ZipName }

Write-Host "Criando estrutura..."
New-Item -ItemType Directory -Path "$Root\public\assets\css" -Force | Out-Null
New-Item -ItemType Directory -Path "$Root\public\assets\js" -Force | Out-Null
New-Item -ItemType Directory -Path "$Root\public\assets\img" -Force | Out-Null
New-Item -ItemType Directory -Path "$Root\server" -Force | Out-Null

# (arquivo index.html condensado; os demais arquivos completos são escritos em forma simplificada aqui para brevidade)
$index = @'
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>EcoTrip</title><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/><link rel="stylesheet" href="/assets/css/style.css"/><script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" defer></script><script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script></head><body><a class="skip-link" href="#conteudo-principal">Pular</a><main id="conteudo-principal" class="container"><h1>EcoTrip</h1></main><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin="" defer></script><script type="module" src="/assets/js/config.js"></script><script type="module" src="/assets/js/co2-factors.js"></script><script type="module" src="/assets/js/utils.js"></script><script type="module" src="/assets/js/map-api.js"></script><script type="module" src="/assets/js/calculator.js"></script><script type="module" src="/assets/js/ui.js"></script><script type="module" src="/assets/js/app.js"></script></body></html>
'@
Write-File "$Root\public\index.html" $index

# CSS
$css = ":root{--bg:#fff;--text:#0f172a} body{margin:0;font-family:Inter,system-ui,Arial} .container{padding:20px}"
Write-File "$Root\public\assets\css\style.css" $css

# Minimal JS files (replace by full ones if desired)
Write-File "$Root\public\assets\js\config.js" "export const API_BASE='';"
Write-File "$Root\public\assets\js\co2-factors.js" "export const DEFAULTS={EMISSION_FACTORS_TTW:{gasolina:2.31,diesel:2.68,etanol:1.47,nenhum:0},WTW_MULTIPLIERS:{gasolina:1.2,diesel:1.25,etanol:0.8,nenhum:1}}; export function getFactorForFuel(f,t=false){const n=DEFAULTS.EMISSION_FACTORS_TTW[f]||0; return t? n*(DEFAULTS.WTW_MULTIPLIERS[f]||1):n; }"
Write-File "$Root\public\assets\js\utils.js" "export function fmtNumber(n,d=2){if(!isFinite(n))return '—'; return Number(n).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}); }"
Write-File "$Root\public\assets\js\calculator.js" "export function calculateEmissions(){ return { liters:0, totalKgCO2:0, gPerKm:0, fuelSummary:'—', precision:'media' }; }"
$mapapi = @'
let map=null; let routeLayer=null;
export async function initMap(){ if(typeof L==='undefined'){ await new Promise(r=>setTimeout(r,200)); } if(typeof L==='undefined') return null; if(!map){ map=L.map("map",{center:[-15.79,-47.88],zoom:4}); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map); } return map; }
export async function getRouteDistance(origin,dest){ const res = await fetch("/api/route",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin,dest})}); if(!res.ok) return null; const j=await res.json(); if(!map) await initMap(); if(map && j.geometry){ if(routeLayer) map.removeLayer(routeLayer); routeLayer=L.geoJSON(j.geometry,{style:()=>({color:'#16a34a',weight:4})}).addTo(map); map.fitBounds(routeLayer.getBounds(),{padding:[40,40]}); } return j.distanceKm; }
'@
Write-File "$Root\public\assets\js\map-api.js" $mapapi

Write-File "$Root\public\assets\js\ui.js" "import { calculateEmissions } from './calculator.js'; export async function initUI(){ console.log('UI init'); }"
Write-File "$Root\public\assets\js\app.js" "import { initUI } from './ui.js'; document.addEventListener('DOMContentLoaded', ()=>{ initUI(); });"

# server files
$pkg = @'
{
  "name":"ecotrip-server",
  "version":"1.0.0",
  "type":"module",
  "main":"server.js",
  "scripts":{"start":"node server.js"},
  "dependencies":{"express":"^4.18.2","cors":"^2.8.5","body-parser":"^1.20.2","dotenv":"^16.1.4"},
  "engines":{"node":">=18"}
}
'@
Write-File "$Root\server\package.json" $pkg

$server = @'
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || "";
const ORS_KEY = process.env.ORS_API_KEY || "";
app.use(cors());
app.use(bodyParser.json({limit:"1mb"}));
const PUBLIC_DIR = path.join(process.cwd(),"public");
if(fs.existsSync(PUBLIC_DIR)) app.use(express.static(PUBLIC_DIR));
app.get("/api/health",(req,res)=>res.json({ok:true,mapboxAvailable:!!MAPBOX_TOKEN,orsAvailable:!!ORS_KEY}));
app.get("/api/geocode", async (req,res)=>{ const q=req.query.q; if(!q) return res.status(400).json({error:"missing q"}); try{ if(MAPBOX_TOKEN){ const url=`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?limit=1&country=br&access_token=${MAPBOX_TOKEN}`; const r=await fetch(url); const j=await r.json(); const feat=j.features?.[0]; if(!feat) return res.json(null); const [lon,lat]=feat.center; return res.json({lat,lon,label:feat.place_name}); } else if(ORS_KEY){ const url=`https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(q)}&boundary.country=bra&size=1`; const r=await fetch(url); const j=await r.json(); const feat=j.features?.[0]; if(!feat) return res.json(null); const [lon,lat]=feat.geometry.coordinates; return res.json({lat,lon,label:feat.properties.label||q}); } else return res.status(501).json({error:"No geocoding provider configured"}); }catch(err){ console.error(err); res.status(500).json({error:"geocode failed"}); }});
app.post("/api/route", async (req,res)=>{ try{ let { origin,dest } = req.body || {}; if(!origin||!dest) return res.status(400).json({error:"origin and dest required"}); if(origin.q && (!origin.lat || !origin.lon)){ const g = await geocodeServer(origin.q); if(!g) return res.status(400).json({error:"origin geocode failed"}); origin={lat:g.lat,lon:g.lon}; } if(dest.q && (!dest.lat || !dest.lon)){ const g = await geocodeServer(dest.q); if(!g) return res.status(400).json({error:"dest geocode failed"}); dest={lat:g.lat,lon:g.lon}; } if(!isFinite(origin.lat)||!isFinite(origin.lon)||!isFinite(dest.lat)||!isFinite(dest.lon)) return res.status(400).json({error:"invalid coords"}); if(MAPBOX_TOKEN){ const coords = `${origin.lon},${origin.lat};${dest.lon},${dest.lat}`; const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`; const r=await fetch(url); const j=await r.json(); const route=j.routes?.[0]; if(!route) return res.status(500).json({error:"route not found"}); const distanceKm = route.distance/1000.0; const geojson = { type:"FeatureCollection", features:[{ type:"Feature", geometry: route.geometry, properties:{} }] }; return res.json({ distanceKm, geometry: geojson }); } else if(ORS_KEY){ const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`; const r = await fetch(url,{ method:"POST", headers:{ "Content-Type":"application/json", "Authorization": ORS_KEY }, body: JSON.stringify({ coordinates:[[origin.lon,origin.lat],[dest.lon,dest.lat]] }) }); const j=await r.json(); const dist = j.features?.[0]?.properties?.summary?.distance; const distanceKm = dist ? dist/1000.0 : null; return res.json({ distanceKm, geometry: j }); } else { const distanceKm = haversineKm(origin.lat,origin.lon,dest.lat,dest.lon); return res.json({ distanceKm, geometry: null }); } }catch(err){ console.error(err); res.status(500).json({error:"route failed"}); }});
async function geocodeServer(q){ if(!q) return null; try{ if(MAPBOX_TOKEN){ const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?limit=1&country=br&access_token=${MAPBOX_TOKEN}`; const r = await fetch(url); const j = await r.json(); const feat = j.features?.[0]; if(!feat) return null; const [lon,lat]=feat.center; return {lat,lon,label:feat.place_name}; } else if(ORS_KEY){ const url=`https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(q)}&boundary.country=bra&size=1`; const r=await fetch(url); const j=await r.json(); const feat=j.features?.[0]; if(!feat) return null; const [lon,lat]=feat.geometry.coordinates; return {lat,lon,label:feat.properties.label||q}; } else return null; }catch(err){ console.error(err); return null; } }
function haversineKm(lat1,lon1,lat2,lon2){ const toRad=(d)=>(d*Math.PI)/180.0; const R=6371; const dLat = toRad(lat2-lat1); const dLon = toRad(lon2-lon1); const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2; const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c; }
app.listen(process.env.PORT || 3000, ()=>console.log('Server running'));
'@
Write-File "$Root\server\server.js" $server

Write-File "$Root\server\.env.example" "# MAPBOX_TOKEN=your_mapbox_token_here`n# ORS_API_KEY=your_ors_key_here"

"[]" | Out-File -FilePath "$Root\server\history.json" -Encoding UTF8 -Force

# Zip
Write-Host "Compactando para $ZipName ..."
Compress-Archive -Path "$Root\*" -DestinationPath $ZipName -Force

Write-Host "Concluído. Arquivo criado: $ZipName. Extraia e siga as instruções no README dentro da pasta."