#!/usr/bin/env bash
set -euo pipefail

ROOT="ecotrip-updated"
ZIPNAME="${ROOT}.zip"

echo "Criando projeto em ./$ROOT ..."

# Limpa
rm -rf "$ROOT" "$ZIPNAME"
mkdir -p "$ROOT/public/assets/css" "$ROOT/public/assets/js" "$ROOT/public/assets/img" "$ROOT/server"

# ------------- public/index.html -------------
cat > "$ROOT/public/index.html" <<'HTML'
<!doctype html>
<html lang="pt-BR" dir="ltr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>EcoTrip — Calculadora de Emissão de CO₂</title>
  <meta name="description" content="Calcule emissões de CO₂ por modal no Brasil" />

  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-o9N1j8kW0tYk6vY5s9gq+oJkqDkV6p2KxX6p6g2Jf9M=" crossorigin=""/>

  <link rel="stylesheet" href="/assets/css/style.css" />

  <!-- jsPDF & html2canvas -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>

  <header class="app-header" role="banner">
    <div class="container header-content">
      <div class="brand">
        <img src="/assets/img/logo.svg" alt="" width="32" height="32" aria-hidden="true" />
        <div>
          <h1 class="app-title">EcoTrip — Calculadora de Emissão de CO₂</h1>
          <p class="app-subtitle">Calcule as emissões da sua viagem e ajude um planeta mais sustentável.</p>
        </div>
      </div>
      <div class="header-actions">
        <button id="theme-toggle" class="btn btn-ghost" type="button" aria-label="Alternar tema">🌓</button>
      </div>
    </div>
  </header>

  <main id="conteudo-principal" class="app-main container" role="main">
    <div class="layout">
      <aside class="sidebar" aria-label="Assistente de cálculo">
        <form id="trip-form" novalidate>
          <section class="card card-hero" data-step="1" aria-labelledby="step1-title">
            <h2 id="step1-title" class="card-title">Informe sua rota</h2>
            <div class="form-group">
              <label for="origin-city">Origem</label>
              <input id="origin-city" name="originCity" type="text" placeholder="Digite a cidade de origem (ex.: São Paulo, SP)" required />
            </div>
            <div class="form-group">
              <label for="dest-city">Destino</label>
              <input id="dest-city" name="destCity" type="text" placeholder="Digite a cidade de destino (ex.: Rio de Janeiro, RJ)" required />
            </div>
            <div class="form-group">
              <label class="checkbox">
                <input type="checkbox" id="manual-distance" name="manualDistance" />
                <span>Inserir distância manualmente</span>
              </label>
            </div>
            <div class="form-group is-disabled" id="distance-wrapper">
              <label for="distance-km">Distância (km)</label>
              <input id="distance-km" name="distanceKm" type="number" step="0.1" min="0" placeholder="0" disabled />
              <small class="help">Se não informado, calcularemos via rota (precisa de chave de mapas).</small>
            </div>

            <fieldset class="form-group" aria-labelledby="transport-legend">
              <legend id="transport-legend">Meio de Transporte</legend>
              <div class="modal-icons">
                <label class="modal-option" data-modal="bicicleta"><input type="radio" name="modal" value="bicicleta" />Bicicleta</label>
                <label class="modal-option is-active" data-modal="carro"><input type="radio" name="modal" value="carro" checked />Carro</label>
                <label class="modal-option" data-modal="onibus"><input type="radio" name="modal" value="onibus" />Ônibus</label>
                <label class="modal-option" data-modal="caminhao"><input type="radio" name="modal" value="caminhao" />Caminhão</label>
                <label class="modal-option" data-modal="moto"><input type="radio" name="modal" value="moto" />Moto</label>
              </div>
            </fieldset>

            <div class="form-inline">
              <button type="submit" id="btn-calc-step1" class="btn btn-primary">Calcular</button>
              <button type="button" id="btn-clear-step1" class="btn btn-ghost">Limpar</button>
            </div>
            <div id="form-errors" class="form-errors" role="alert" aria-live="assertive"></div>
          </section>

          <section class="card is-hidden" data-step="2" aria-labelledby="step2-title">
            <h2 id="step2-title" class="card-title">Combustível &amp; Eficiência</h2>
            <div class="form-group">
              <label for="fuel-type">Combustível</label>
              <select id="fuel-type" name="fuelType"><option value="gasolina">Gasolina</option><option value="etanol">Etanol</option><option value="flex">Flex</option><option value="diesel">Diesel</option><option value="nenhum">Nenhum</option></select>
            </div>

            <div id="flex-mix-wrapper" class="form-group is-hidden" data-show-when="fuel:flex">
              <label for="flex-mix">Mistura Flex — Gasolina (%)</label>
              <input id="flex-mix" name="flexGasolinaPct" type="range" min="0" max="100" step="1" value="50" />
              <div class="range-output" aria-live="polite"><output id="flex-gasolina-out">50%</output> gasolina — <output id="flex-etanol-out">50%</output> etanol</div>
            </div>

            <div class="form-group">
              <label for="efficiency-km-l">Consumo do veículo (km/L)</label>
              <input id="efficiency-km-l" name="efficiencyKmPerL" type="number" step="0.1" min="0" placeholder="Ex.: 12" />
            </div>

            <div class="form-group">
              <label for="trip-profile">Perfil da viagem</label>
              <select id="trip-profile" name="tripProfile"><option value="misto" selected>Misto</option><option value="urbano">Urbano</option><option value="rodoviario">Rodoviário</option></select>
            </div>

            <div id="bus-passenger-wrapper" class="form-group is-hidden" data-show-when="modal:onibus">
              <label for="bus-occupancy">Ocupação (passageiros)</label>
              <input id="bus-occupancy" name="busOccupancy" type="number" min="1" value="40" />
              <label class="checkbox"><input type="checkbox" id="calc-per-passenger" name="calcPerPassenger" checked /> <span>Calcular emissões por passageiro</span></label>
            </div>

            <div id="truck-payload-wrapper" class="form-group is-hidden" data-show-when="modal:caminhao">
              <label for="payload-kg">Carga transportada (kg) <span class="muted">(opcional)</span></label>
              <input id="payload-kg" name="payloadKg" type="number" step="10" min="0" placeholder="Ex.: 8000" />
            </div>

            <div class="form-group">
              <label class="switch"><input type="checkbox" id="toggle-wtw" name="useWTW" /> <span class="switch-label">Usar cadeia completa (WTW)</span></label>
            </div>

            <div class="form-inline">
              <button type="button" id="btn-recalc" class="btn btn-primary">Recalcular</button>
              <button type="button" id="btn-next-to-results" class="btn btn-secondary">Ver resultados</button>
            </div>
          </section>
        </form>
      </aside>

      <section class="content">
        <section class="card is-hidden" data-panel="map" aria-labelledby="map-title">
          <h2 id="map-title" class="card-title">Mapa da Rota</h2>
          <div id="map" class="map-container" role="application" aria-label="Mapa interativo do Brasil"></div>
        </section>

        <section class="card is-hidden" data-panel="results" aria-labelledby="results-title">
          <h2 id="results-title" class="card-title">Resultados</h2>
          <div class="results-grid" aria-live="polite">
            <div class="result-item"><div class="result-label">Distância total</div><div class="result-value"><span id="out-distance-km">—</span> km</div></div>
            <div class="result-item"><div class="result-label">Combustível estimado</div><div class="result-value"><span id="out-liters">—</span> L</div><div class="result-sub" id="out-fuel-summary">—</div></div>
            <div class="result-item"><div class="result-label">Emissão total</div><div class="result-value"><span id="out-total-kg">—</span> kg CO₂</div><div class="result-sub"><span id="out-per-km">—</span> g CO₂/km</div></div>
            <div class="result-item"><div class="result-label">Equivalência</div><div class="result-sub" id="out-equivalences">—</div></div>
          </div>
          <div class="chart-wrapper"><canvas id="emissions-chart" width="600" height="300" aria-label="Gráfico de emissões"></canvas></div>
          <div class="meta"><span id="precision-badge" class="badge">Precisão: média</span><span id="basis-badge" class="badge badge-alt">Base: TTW</span></div>
          <div class="form-inline"><button id="btn-save-trip" class="btn btn-secondary">Salvar viagem</button><button id="btn-export-pdf" class="btn btn-secondary">Exportar PDF</button></div>
        </section>

        <section class="card is-hidden" data-panel="history" aria-labelledby="history-title">
          <h2 id="history-title" class="card-title">Histórico de viagens</h2>
          <div id="history-list" class="history-list" role="list"></div>
          <div class="form-inline"><button id="btn-clear-history" class="btn btn-ghost">Limpar histórico</button></div>
        </section>
      </section>
    </div>
  </main>

  <footer class="app-footer" role="contentinfo"><div class="container"><p class="muted">⚠️ Estimativas sujeitas a variações de veículo, rota e condições.</p><p class="muted">© <span id="year"></span> EcoTrip</p></div></footer>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-p4Rr2M6rGk6mPzz/PKQ5m2K4sV5Q0q2r5Jv7i3y0vPc=" crossorigin="" defer></script>

  <!-- App scripts -->
  <script type="module" src="/assets/js/config.js"></script>
  <script type="module" src="/assets/js/co2-factors.js"></script>
  <script type="module" src="/assets/js/utils.js"></script>
  <script type="module" src="/assets/js/map-api.js"></script>
  <script type="module" src="/assets/js/calculator.js"></script>
  <script type="module" src="/assets/js/ui.js"></script>
  <script type="module" src="/assets/js/app.js"></script>
</body>
</html>
HTML

# ------------- CSS -------------
cat > "$ROOT/public/assets/css/style.css" <<'CSS'
:root{--bg:#ffffff;--text:#0f172a;--muted:#6b7280;--accent:#16a34a}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,Arial}
.container{max-width:1100px;margin:0 auto;padding:20px}
.layout{display:grid;grid-template-columns:340px 1fr;gap:20px;margin-top:18px}
.card{background:#f8fafc;padding:16px;border-radius:10px;box-shadow:0 6px 18px rgba(2,6,23,0.08);margin-bottom:12px}
.form-group{margin-bottom:12px}
input,select{width:100%;padding:8px;border-radius:8px;border:1px solid rgba(15,23,42,0.06)}
.btn{padding:8px 12px;border-radius:8px;cursor:pointer}
.btn-primary{background:var(--accent);color:#fff}
.map-container{height:320px;border-radius:8px;border:1px solid rgba(15,23,42,0.04);overflow:hidden}
.results-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.muted{color:#6b7280}
@media(max-width:980px){.layout{grid-template-columns:1fr}}
CSS

# ------------- JS files -------------
cat > "$ROOT/public/assets/js/config.js" <<'JS'
export const API_BASE = '';
JS

cat > "$ROOT/public/assets/js/co2-factors.js" <<'JS'
export const DEFAULTS = {
  EMISSION_FACTORS_TTW: { gasolina:2.31, diesel:2.68, etanol:1.47, nenhum:0 },
  WTW_MULTIPLIERS: { gasolina:1.20, diesel:1.25, etanol:0.80, nenhum:1 },
  AVERAGE_EFFICIENCY: { carro:{gasolina:12,diesel:14,etanol:8,flex:10}, moto:{gasolina:30}, onibus:{diesel:2.5}, caminhao:{diesel:3.5}, bicicleta:{nenhum:Infinity} },
  EQUIVALENCES:{ kgPerTreeYear:21.77, kgPerKmCar:0.150 }
};
export function getFactorForFuel(fuelType, useWTW=false){ const t=DEFAULTS.EMISSION_FACTORS_TTW[fuelType]||0; if(!useWTW) return t; const m=DEFAULTS.WTW_MULTIPLIERS[fuelType]||1; return t*m; }
JS

cat > "$ROOT/public/assets/js/utils.js" <<'JS'
import { DEFAULTS } from './co2-factors.js';
export function fmtNumber(n,d=2){ if(!isFinite(n)) return '—'; return Number(n).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}); }
export function computeEquivalences(kg){ return { trees: kg/DEFAULTS.EQUIVALENCES.kgPerTreeYear, carKm: kg/DEFAULTS.EQUIVALENCES.kgPerKmCar }; }
const HIST_KEY='ecotrip_history_v1';
export function loadHistoryLocal(){ try{ const r=localStorage.getItem(HIST_KEY); return r?JSON.parse(r):[] }catch{return[]} }
export function saveHistoryLocal(it){ const a=loadHistoryLocal(); a.unshift(it); localStorage.setItem(HIST_KEY,JSON.stringify(a.slice(0,200))); }
export function clearHistoryLocal(){ localStorage.removeItem(HIST_KEY); }
JS

cat > "$ROOT/public/assets/js/calculator.js" <<'JS'
import { getFactorForFuel } from './co2-factors.js';
function clampPercent(p){const n=Number(p)||0;return Math.max(0,Math.min(100,n));}
export function calculateEmissions(opts={}){
  const { modal, distanceKm, fuelType, efficiencyKmPerL, flexGasolinaPct=50, useWTW=false, busOccupancy=1, calcPerPassenger=false, payloadKg=0 } = opts;
  const dist = Number(distanceKm)||0; if(dist<=0) return { error:'Distância inválida' };
  let eff = Number(efficiencyKmPerL);
  if(!eff||eff<=0){
    const avg = { carro:{gasolina:12,flex:10}, moto:{gasolina:30}, onibus:{diesel:2.5}, caminhao:{diesel:3.5}, bicicleta:{nenhum:Infinity} }[modal]||{gasolina:10};
    eff = fuelType==='flex'? (avg.flex||avg.gasolina) : (avg[fuelType]||avg.gasolina);
  }
  let liters = (modal==='bicicleta'||fuelType==='nenhum')?0: dist/eff;
  let totalKg=0; let fuelSummary=fuelType;
  if(fuelType==='flex'){ const pctG=clampPercent(flexGasolinaPct); const pctE=100-pctG; const lg=liters*(pctG/100), le=liters*(pctE/100); totalKg = lg*getFactorForFuel('gasolina',useWTW) + le*getFactorForFuel('etanol',useWTW); fuelSummary=`${pctG}% gasolina, ${pctE}% etanol`; }
  else if(fuelType==='nenhum'){ totalKg=0; } else { totalKg = liters * getFactorForFuel(fuelType,useWTW); }
  if(modal==='caminhao' && payloadKg>0){ totalKg *= 1 + (payloadKg/1000)*0.005; }
  let perPassengerKg = null; if(modal==='onibus' && calcPerPassenger){ perPassengerKg = totalKg / Math.max(1,Number(busOccupancy)||1); }
  const gPerKm = dist>0? (totalKg*1000)/dist : 0;
  const precision = (efficiencyKmPerL && efficiencyKmPerL>0)?'alta':'media';
  return { liters, totalKgCO2: totalKg, gPerKm, perPassengerKg, fuelSummary, precision };
}
JS

cat > "$ROOT/public/assets/js/map-api.js" <<'JS'
let map = null;
let routeLayer = null;
export async function serverHealth(){ try{ const r = await fetch('/api/health'); if(!r.ok) return null; return await r.json(); }catch{return null} }
export async function initMap(containerId='map'){
  try{
    if(typeof L === 'undefined'){
      await new Promise((resolve)=>{ let tries=0; const t=setInterval(()=>{ tries++; if(typeof L!=='undefined'){ clearInterval(t); resolve(); } else if(tries>50){ clearInterval(t); resolve(); } },50); });
    }
    if(typeof L === 'undefined') return null;
    if(!map){ map = L.map(containerId,{ center: [-15.7942, -47.8825], zoom: 4 }); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map); }
    return map;
  }catch(err){ console.warn('initMap failed',err); return null; }
}
export async function geocode(q){ if(!q) return null; try{ const res = await fetch('/api/geocode?q='+encodeURIComponent(q)); if(!res.ok) return null; return await res.json(); }catch{ return null } }
export async function getRouteDistance(origin,dest){
  try{
    const res = await fetch('/api/route',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({origin,dest}) });
    if(!res.ok){ console.warn('route API error', await res.text()); return null; }
    const j = await res.json();
    if(!map) await initMap();
    if(map && j.geometry) drawRouteOnMap(j.geometry);
    return j.distanceKm;
  }catch(err){ console.warn('getRouteDistance failed',err); return null; }
}
export function drawRouteOnMap(geojson){
  if(!map || !geojson) return;
  try{
    if(routeLayer){ map.removeLayer(routeLayer); routeLayer = null; }
    routeLayer = L.geoJSON(geojson, { style: ()=>({ color:'#16a34a', weight:4, opacity:0.9 }) }).addTo(map);
    const bounds = routeLayer.getBounds();
    if(bounds && bounds.isValid && bounds.isValid()) map.fitBounds(bounds, { padding:[40,40] });
  }catch(err){ console.warn('drawRouteOnMap failed', err); }
}
JS

cat > "$ROOT/public/assets/js/ui.js" <<'JS'
import { calculateEmissions } from './calculator.js';
import { getRouteDistance, initMap } from './map-api.js';
import { fmtNumber, computeEquivalences, loadHistoryLocal, saveHistoryLocal, clearHistoryLocal } from './utils.js';
const qs=(s)=>document.querySelector(s), qsa=(s)=>Array.from(document.querySelectorAll(s));
export async function initUI(){
  const form=qs('#trip-form'), md=qs('#manual-distance'), distInput=qs('#distance-km'), btnCalc=qs('#btn-calc-step1'), btnClear=qs('#btn-clear-step1');
  const resultsPanel=qs('[data-panel="results"]'), mapPanel=qs('[data-panel="map"]');
  const outDist=qs('#out-distance-km'), outLiters=qs('#out-liters'), outFuel=qs('#out-fuel-summary'), outTotal=qs('#out-total-kg'), outPerKm=qs('#out-per-km'), outEquiv=qs('#out-equivalences');
  const precisionBadge=qs('#precision-badge'), basisBadge=qs('#basis-badge'), historyList=qs('#history-list');
  await initMap();
  md.addEventListener('change', (e)=>{ distInput.disabled = !e.target.checked; qs('#distance-wrapper').classList.toggle('is-disabled', !e.target.checked); if(!e.target.checked) distInput.value=''; });
  btnClear.addEventListener('click',(e)=>{ e.preventDefault(); form.reset(); distInput.disabled=true; qsa('[data-step="2"]').forEach(s=>s.classList.add('is-hidden')); qsa('[data-panel]').forEach(p=>p.classList.add('is-hidden')); });
  function readForm(){ const fd=new FormData(form); return { originCity: fd.get('originCity'), destCity: fd.get('destCity'), manualDistance: fd.get('manualDistance')==='on' || md.checked, distanceKm: Number(fd.get('distanceKm'))||0, modal: fd.get('modal')||'carro', fuelType: fd.get('fuelType')||'gasolina', flexGasolinaPct: Number(fd.get('flexGasolinaPct'))||50, efficiencyKmPerL: Number(fd.get('efficiencyKmPerL'))||null, busOccupancy: Number(fd.get('busOccupancy'))||40, calcPerPassenger: fd.get('calcPerPassenger')==='on', payloadKg: Number(fd.get('payloadKg'))||0, useWTW: fd.get('useWTW')==='on' }; }
  btnCalc.addEventListener('click', async (e)=>{ e.preventDefault(); const d=readForm(); if(!d.originCity||!d.destCity){ alert('Informe origem e destino.'); return; } let distance=d.distanceKm; if(!d.manualDistance||!distance){ const origin={q:d.originCity}, dest={q:d.destCity}; const rd=await getRouteDistance(origin,dest); if(rd==null){ alert('Não foi possível calcular a rota automaticamente. Habilite distância manual e informe km.'); return; } distance=rd; } qs('[data-step="2"]').classList.remove('is-hidden'); mapPanel.classList.remove('is-hidden'); resultsPanel.classList.remove('is-hidden'); const opts={ modal:d.modal, distanceKm:distance, fuelType:d.fuelType, efficiencyKmPerL:d.efficiencyKmPerL, flexGasolinaPct:d.flexGasolinaPct, useWTW:d.useWTW, busOccupancy:d.busOccupancy, calcPerPassenger:d.calcPerPassenger, payloadKg:d.payloadKg }; const res=calculateEmissions(opts); if(res.error) return alert(res.error); outDist.textContent = fmtNumber(distance,1); outLiters.textContent = fmtNumber(res.liters,2); outFuel.textContent = res.fuelSummary; outTotal.textContent = fmtNumber(res.totalKgCO2,2); outPerKm.textContent = `${fmtNumber(res.gPerKm,0)} g CO₂/km`; precisionBadge.textContent = `Precisão: ${res.precision==='alta'?'alta':'média'}`; basisBadge.textContent = `Base: ${d.useWTW?'WTW':'TTW'}`; const equiv=computeEquivalences(res.totalKgCO2); outEquiv.textContent = `${fmtNumber(equiv.trees,1)} árvores/ano ≈ ${fmtNumber(equiv.carKm,0)} km de carro médio`; const hist={ createdAt: new Date().toISOString(), origin: d.originCity, dest: d.destCity, modal: d.modal, distanceKm: distance, totalKgCO2: res.totalKgCO2 }; try{ await fetch('/api/save',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({item:hist}) }); }catch{ saveHistoryLocal(hist); } renderHistory(); drawMiniChart(res); });
  async function renderHistory(){ historyList.innerHTML=''; try{ const r=await fetch('/api/history'); if(r.ok){ const arr=await r.json(); if(!arr||arr.length===0){ historyList.innerHTML='<div class="muted">Nenhum registro ainda.</div>'; return; } arr.forEach(item=>{ const el=document.createElement('div'); el.className='history-row'; el.innerHTML=`<strong>${item.origin||'—'}</strong> → <strong>${item.dest||'—'}</strong><div class="muted">${new Date(item.createdAt).toLocaleString()} — ${fmtNumber(item.distanceKm,1)} km — ${fmtNumber(item.totalKgCO2,2)} kg CO₂</div>`; historyList.appendChild(el); }); return; } }catch{} const local = loadHistoryLocal(); if(!local||local.length===0){ historyList.innerHTML='<div class="muted">Nenhum registro ainda.</div>'; return; } local.forEach(item=>{ const el=document.createElement('div'); el.className='history-row'; el.innerHTML=`<strong>${item.origin||'—'}</strong> → <strong>${item.dest||'—'}</strong><div class="muted">${new Date(item.createdAt).toLocaleString()} — ${fmtNumber(item.distanceKm,1)} km — ${fmtNumber(item.totalKgCO2,2)} kg CO₂</div>`; historyList.appendChild(el); }); }
  document.getElementById('btn-export-pdf')?.addEventListener('click', async ()=>{ const resultsCard = document.querySelector('[data-panel="results"]'); if(!resultsCard) return; const canvas = await html2canvas(resultsCard,{ scale:2 }); const img = canvas.toDataURL('image/png'); const { jsPDF } = window.jspdf; const pdf = new jsPDF({ orientation:'portrait', unit:'pt', format:'a4' }); const w = pdf.internal.pageSize.getWidth(); const props = pdf.getImageProperties(img); const h = (props.height * (w-40))/props.width; pdf.addImage(img,'PNG',20,20,w-40,h); pdf.save(`ecotrip-${new Date().toISOString().slice(0,10)}.pdf`); });
  document.getElementById('btn-clear-history')?.addEventListener('click', async ()=>{ if(!confirm('Limpar histórico no servidor e local?')) return; try{ await fetch('/api/clear-history',{ method:'POST' }); }catch{} clearHistoryLocal(); renderHistory(); });
  function drawMiniChart(res){ const canvas=document.getElementById('emissions-chart'); if(!canvas) return; const ctx=canvas.getContext('2d'); const w=canvas.width, h=canvas.height; ctx.clearRect(0,0,w,h); const bars=[{label:'Emissão (kg CO₂)', value: res.totalKgCO2},{label:'Litros (L)', value: res.liters}]; const max=Math.max(...bars.map(b=>b.value),1); const pad=20; const barW=(w-pad*2)/bars.length*0.6; bars.forEach((b,i)=>{ const x=pad + i*((w-pad*2)/bars.length) + (((w-pad*2)/bars.length)-barW)/2; const barH=(b.value/max)*(h-pad*2); ctx.fillStyle = i===0? '#16a34a' : '#a3e635'; ctx.fillRect(x, h-pad-barH, barW, barH); ctx.fillStyle = '#333'; ctx.font='12px sans-serif'; ctx.fillText(b.label, x, h-pad+14); ctx.fillText(fmtNumber(b.value,2), x, h-pad-barH-6); }); }
  renderHistory();
}
JS

cat > "$ROOT/public/assets/js/app.js" <<'JS'
import { initUI } from './ui.js';
document.addEventListener('DOMContentLoaded', ()=>{ const y=new Date().getFullYear(); const el=document.getElementById('year'); if(el) el.textContent=String(y); try{ initUI(); }catch(err){ console.error('ui init error',err); alert('Erro ao inicializar a interface. Veja console.'); } const themeToggle=document.getElementById('theme-toggle'); const st=localStorage.getItem('ecotrip_theme'); if(st) document.documentElement.setAttribute('data-theme', st); themeToggle?.addEventListener('click', ()=>{ const cur = document.documentElement.getAttribute('data-theme')==='dark' ? 'dark' : 'light'; const next = cur==='dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', next==='dark'?'dark':''); localStorage.setItem('ecotrip_theme', next==='dark'?'dark':'light'); }); });
JS

# ------------- Images (svgs) -------------
cat > "$ROOT/public/assets/img/logo.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#16a34a"/><path d="M6 12c1.5-3 6-5 9-3" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
SVG

# ------------- server files -------------
cat > "$ROOT/server/package.json" <<'JSON'
{
  "name": "ecotrip-server",
  "version": "1.0.0",
  "description": "EcoTrip server (fetch native, proxy mapbox/ors)",
  "type": "module",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": { "express":"^4.18.2", "cors":"^2.8.5", "body-parser":"^1.20.2", "dotenv":"^16.1.4" },
  "engines": { "node": ">=18" }
}
JSON

cat > "$ROOT/server/server.js" <<'JS'
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || '';
const ORS_KEY = process.env.ORS_API_KEY || '';
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
const PUBLIC_DIR = path.join(process.cwd(), 'public');
if (fs.existsSync(PUBLIC_DIR)) app.use(express.static(PUBLIC_DIR));
app.get('/api/health', (req, res) => res.json({ ok:true, mapboxAvailable: !!MAPBOX_TOKEN, orsAvailable: !!ORS_KEY }));
app.get('/api/geocode', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'missing q' });
  try {
    if (MAPBOX_TOKEN) {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?limit=1&country=br&access_token=${MAPBOX_TOKEN}`;
      const r = await fetch(url); const j = await r.json(); const feat = j.features?.[0]; if (!feat) return res.json(null);
      const [lon, lat] = feat.center; return res.json({ lat, lon, label: feat.place_name });
    } else if (ORS_KEY) {
      const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(q)}&boundary.country=bra&size=1`;
      const r = await fetch(url); const j = await r.json(); const feat = j.features?.[0]; if (!feat) return res.json(null);
      const [lon, lat] = feat.geometry.coordinates; return res.json({ lat, lon, label: feat.properties.label || q });
    } else return res.status(501).json({ error:'No geocoding provider configured on server.' });
  } catch (err) { console.error('geocode error', err); res.status(500).json({ error:'geocode failed' }); }
});
app.post('/api/route', async (req, res) => {
  try {
    let { origin, dest } = req.body || {};
    if (!origin || !dest) return res.status(400).json({ error: 'origin and dest required' });
    if (origin.q && (!origin.lat || !origin.lon)) { const g = await geocodeServer(origin.q); if (!g) return res.status(400).json({ error:'origin geocode failed' }); origin = { lat: g.lat, lon: g.lon }; }
    if (dest.q && (!dest.lat || !dest.lon)) { const g = await geocodeServer(dest.q); if (!g) return res.status(400).json({ error:'dest geocode failed' }); dest = { lat: g.lat, lon: g.lon }; }
    if (!isFinite(origin.lat) || !isFinite(origin.lon) || !isFinite(dest.lat) || !isFinite(dest.lon)) return res.status(400).json({ error:'invalid coordinates' });
    if (MAPBOX_TOKEN) {
      const coords = `${origin.lon},${origin.lat};${dest.lon},${dest.lat}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
      const r = await fetch(url); const j = await r.json(); const route = j.routes?.[0]; if (!route) return res.status(500).json({ error:'route not found' });
      const distanceKm = route.distance / 1000.0; const geojson = { type:'FeatureCollection', features:[{ type:'Feature', geometry: route.geometry, properties:{} }] }; return res.json({ distanceKm, geometry: geojson });
    } else if (ORS_KEY) {
      const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;
      const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': ORS_KEY }, body: JSON.stringify({ coordinates: [[origin.lon, origin.lat], [dest.lon, dest.lat]] }) });
      const j = await r.json(); const dist = j.features?.[0]?.properties?.summary?.distance; const distanceKm = dist ? dist/1000.0 : null; return res.json({ distanceKm, geometry: j });
    } else {
      const distanceKm = haversineKm(origin.lat, origin.lon, dest.lat, dest.lon);
      return res.json({ distanceKm, geometry: null });
    }
  } catch (err) { console.error('route error', err); res.status(500).json({ error:'route failed' }); }
});
const HISTORY_FILE = path.join(process.cwd(), 'server', 'history.json');
app.post('/api/save', async (req, res) => { try{ const { item } = req.body || {}; if(!item) return res.status(400).json({ error:'missing item' }); const arr = readHistory(); arr.unshift(item); fs.writeFileSync(HISTORY_FILE, JSON.stringify(arr.slice(0,500), null,2)); res.json({ ok:true }); }catch(err){ console.error('save history failed',err); res.status(500).json({ error:'save failed' }); }});
app.get('/api/history', (req,res) => { try{ const arr = readHistory(); res.json(arr); }catch(err){ res.status(500).json([]); }});
app.post('/api/clear-history', (req,res) => { try{ if(fs.existsSync(HISTORY_FILE)) fs.unlinkSync(HISTORY_FILE); res.json({ ok:true }); }catch(err){ res.status(500).json({ error:'clear failed' }); }});
function readHistory(){ try{ if(!fs.existsSync(HISTORY_FILE)) return []; const raw = fs.readFileSync(HISTORY_FILE,'utf8'); return JSON.parse(raw||'[]'); }catch{return []} }
async function geocodeServer(q){ if(!q) return null; try{ if(MAPBOX_TOKEN){ const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?limit=1&country=br&access_token=${MAPBOX_TOKEN}`; const r = await fetch(url); const j = await r.json(); const feat = j.features?.[0]; if(!feat) return null; const [lon,lat] = feat.center; return { lat, lon, label: feat.place_name }; } else if(ORS_KEY){ const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(q)}&boundary.country=bra&size=1`; const r = await fetch(url); const j = await r.json(); const feat = j.features?.[0]; if(!feat) return null; const [lon,lat] = feat.geometry.coordinates; return { lat, lon, label: feat.properties.label || q }; } else return null; }catch(err){ console.error('server geocode error',err); return null; } }
function haversineKm(lat1,lon1,lat2,lon2){ const toRad=(d)=>(d*Math.PI)/180.0; const R=6371; const dLat=toRad(lat2-lat1); const dLon=toRad(lon2-lon1); const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2; const c=2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R*c; }
app.listen(process.env.PORT || 3000, ()=>console.log('EcoTrip server listening on http://localhost:3000'));
JS

cat > "$ROOT/server/.env.example" <<'ENV'
# COPIE para .env e preencha a chave (opcional)
MAPBOX_TOKEN=your_mapbox_token_here
# ORS_API_KEY=your_openrouteservice_key_here
ENV

echo "[]" > "$ROOT/server/history.json"

# ------------- README -------------
cat > "$ROOT/README.md" <<'MD'
EcoTrip (updated) — Projeto pronto

Como usar:
1. Extraia ecotrip-updated.zip ou trabalhe na pasta ecotrip-updated.
2. Edite server/.env (copie .env.example para .env) e insira MAPBOX_TOKEN ou ORS_API_KEY se desejar rotas reais.
3. Entre em server: cd ecotrip-updated/server
   npm install
   npm start
4. Abra http://localhost:3000

Requisitos: Node >= 18
MD

# ------------- Zip -------------
echo "Criando ZIP $ZIPNAME ..."
if command -v zip >/dev/null 2>&1; then
  (cd "$ROOT" && zip -r "../$ZIPNAME" .) >/dev/null
  echo "ZIP criado: $ZIPNAME"
else
  echo "zip não encontrado: gerando sem compactação. Você pode compactar a pasta $ROOT manualmente."
fi

echo "Concluído. Pasta: $ROOT  — ZIP: $ZIPNAME (se zip instalado)."
echo "Depois extraia/abra a pasta, edite server/.env e rode server."