/* ============================================================================
   PreDict Carrusel (Grado Elemental) · MODO GUIADO para la pantalla de clase
   (30-sep-2026, Iago) «Una animación del proceso»: el carrusel se genera en el iPad («Generar carrusel»)
   y en la pantalla (la espiral del portal, ?pantalla=1) sale una portada con «Empezar carrusel».
   Después va solo: paso de ejercicio → ejercicio guiado (aviso = campanita + flecha + instrucción,
   escuchas, tiempo para escribir) → «Termina de completar el ejercicio» (10 s) → «Solución en 5…1» →
   solución con su cuenta atrás discreta (~20 s) → siguiente… → créditos.
   · Los ejercicios son EXACTAMENTE los del iPad: renderConSemilla() con la semilla publicada.
   · Todo generativo (VexFlow + Web Audio). Piano = el de los dictados animados (MusyngKite, bus 4,6 →
     paso alto 110 Hz → limitador). Ritmo = el sonido de los quizzes de GE. Aviso = la campanita de los dictados.
   · Rendimiento: durante los ejercicios no se mueve nada por detrás (ver guiado.css).
   · Teclas: espacio = pausa · → = siguiente ejercicio · ← = repetir ejercicio · F = pantalla completa.
   · Pruebas: ?ej=N empieza en el ejercicio N · ?semilla=N usa esa semilla sin leer la base.
   Para quitarlo: borrar guiado.js y guiado.css, sus dos líneas en index.html y la línea que llama a
   PCGuiado en abrirPantalla(): la pantalla vuelve a ser el carrusel de siempre.
   (30-sep-2026, tarde, Iago desde el aula) Minuto de preparación al pulsar «Empezar carrusel»; botones «Pausa» y
   «Pantalla completa» siempre a la vista; 5·4·3·2·1 en verde liso; 3·2·1 antes de cada escucha del melódico y más
   tiempo para corregirlo; TonCom con más aire y las casillas que tocan, destacadas; Armónico con las opciones en una
   línea que parpadean y las notas grave/central/aguda pegadas al acorde; bonus sin campanita; sin trazo negro en los
   textos de las partituras; el remolino y el «bioma» se pintan una vez en un lienzo pequeño (la espiral iba a tirones).
   · Pruebas: ?prep=0 se salta el minuto de preparación.
   ============================================================================ */
(function(){
'use strict';

/* ---------- BONUS TRACK: la cadencia (común al iPad y a la pantalla; sale siempre la misma para la misma semilla) ----------
   Bases a 4 voces del motor de cadencias del PreDict PRO (autentica_perfecta, plagal_perfecta, rota, semicadencia). */
const CAD4=[
  {id:'autentica',nom:'Auténtica',rn:'V – I',gr:['V','I'],expl:'Del V (dominante) al I (tónica): un final rotundo. Conclusiva.',ev:[
    {midi:[67,64,60,48],q:2},{midi:[64,60,55,48],q:2},{midi:[65,60,57,41],q:1},{midi:[64,60,57,41],q:1},{midi:[62,60,59,40],q:2},{midi:[62,65,59,43],q:2},{midi:[60,64,55,48],q:4}],modo:'major',ref:0},
  {id:'plagal',nom:'Plagal',rn:'IV – I',gr:['IV','I'],expl:'Del IV (subdominante) al I (tónica): un final suave, como un «amén». Conclusiva.',ev:[
    {midi:[69,65,60,41],q:2},{midi:[72,64,57,48],q:2},{midi:[71,65,55,43],q:2},{midi:[69,65,60,41],q:2},{midi:[72,65,57,46],q:2},{midi:[70,65,58,46],q:2},{midi:[77,65,60,41],q:4}],modo:'major',ref:5},
  {id:'rota',nom:'Rota',rn:'V – VI',gr:['V','VI'],expl:'Parece que va a terminar en el I… y va al VI. ¡Sorpresa!',ev:[
    {midi:[69,64,60,45],q:2},{midi:[72,64,57,45],q:2},{midi:[71,62,53,50],q:1},{midi:[69,64,53,50],q:1},{midi:[68,64,59,52],q:2},{midi:[69,62,53,50],q:2},{midi:[71,62,56,52],q:2},{midi:[72,60,57,53],q:4}],modo:'minor',ref:9},
  {id:'semicadencia',nom:'Semicadencia',rn:'… – V',gr:['I','V'],expl:'Termina en el V: se queda en el aire, como una pregunta. Suspensiva.',ev:[
    {midi:[66,62,57,50],q:2},{midi:[69,62,54,50],q:2},{midi:[66,62,57,54],q:1},{midi:[69,62,57,54],q:2},{midi:[66,62,57,57],q:2},{midi:[64,61,57,57],q:4}],modo:'major',ref:2},
];
const CAD_TON={major:[['C',0,0,'C'],['G',7,1,'G'],['F',5,-1,'F'],['D',2,2,'D']],minor:[['A',9,0,'Am'],['E',4,1,'Em'],['D',2,-1,'Dm']]};
const CAD_NOM={C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};
function mulb(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function cadenciaDe(semilla){
  const R=mulb(((Number(semilla)||0)*17+3)>>>0);
  const c=CAD4[Math.floor(R()*4)], ks=CAD_TON[c.modo], k=ks[Math.floor(R()*ks.length)];
  let semis=((k[1]-c.ref)%12+12)%12; if(semis>6) semis-=12;
  let ev=c.ev.map(e=>({midi:e.midi.map(m=>m+semis),q:e.q}));
  const hi=Math.max(...ev.map(e=>e.midi[0])), lo=Math.min(...ev.map(e=>e.midi[3]));
  let sh=0; if(lo<40&&hi+12<=83) sh=12; else if(hi>81&&lo-12>=37) sh=-12;
  if(sh) ev=ev.map(e=>({midi:e.midi.map(m=>m+sh),q:e.q}));
  return {id:c.id,nom:c.nom,rn:c.rn,gr:c.gr,expl:c.expl,modo:c.modo,tonica:k[0],sharps:k[2],vexKey:k[3],
    titulo:(c.id==='semicadencia'?'Semicadencia':'Cadencia '+c.nom.toLowerCase()),
    tonalidad:CAD_NOM[k[0]]+(c.modo==='major'?' M':' m'),ev};
}
/* iPad: al generar, en una esquina, qué cadencia saldrá en el bonus */
if(!/[?&]pantalla=1(&|$)/.test(location.search)){
  try{
    const pinta=seed=>{ let e=document.getElementById('pcgBonusIpad');
      if(!e){ e=document.createElement('div'); e.id='pcgBonusIpad'; document.body.appendChild(e); }
      const c=cadenciaDe(seed); e.innerHTML='<span>Bonus</span> '+c.titulo+' <b>'+c.rn+'</b>'; };
    if(typeof renderConSemilla==='function'){
      const orig=renderConSemilla;
      renderConSemilla=function(seed){ const r=orig.apply(this,arguments); try{ pinta(seed); }catch(e){} return r; };
    }
  }catch(e){}
  return;
}

/* ---------------- configuración ---------------- */
const QS=new URLSearchParams(location.search);
const VEL=Math.min(40,Math.max(0.25,Number(QS.get('vel'))||1));          // solo para probar deprisa
const EJ0=Math.min(5,Math.max(1,parseInt(QS.get('ej'),10)||1))-1;
const PREP=(EJ0===0 && QS.get('prep')!=='0');                         // (30-sep-2026) minuto de preparación al empezar
const SEMQ=QS.get('semilla');
const SEM_FORZADA=(SEMQ!=null&&SEMQ!==''&&Number.isFinite(Number(SEMQ)))?Number(SEMQ):null;
const S=x=>x/VEL;
const NS='http://www.w3.org/2000/svg';
const EJS=[
  {k:'rit',n:1,b:'RÍT',f:'MICO',nombre:'RÍTMICO', c:'#34d399',c2:'#0e9f74',rgb:'52,211,153'},
  {k:'mel',n:2,b:'MEL',f:'ÓDICO',nombre:'MELÓDICO',c:'#5bd0ff',c2:'#0b86c4',rgb:'91,208,255'},
  {k:'ton',n:3,b:'TON',f:'COM',nombre:'TONCOM',  c:'#ff9a3c',c2:'#dd6b0c',rgb:'255,154,60'},
  {k:'arm',n:4,b:'ARM',f:'ÓNICO',nombre:'ARMÓNICO',c:'#bd92ff',c2:'#7c3aed',rgb:'189,146,255'},
];
/* colores de Intervalia (líneas que unen las notas en la corrección del melódico) */
const BONUS={k:'bon',n:'★',b:'BONUS',f:' EXTRA',nombre:'CADENCIAS',c:'#ffd23f',c2:'#a16207',rgb:'255,210,63'};   // (30-sep-2026, Iago) «bonus extra · cadencias»
const INTERVALIA={'2m':'#a62c17','2M':'#ed732e','3m':'#2f6b1e','3M':'#9ed649','4J':'#2355ce','4A':'#f3ec4e','5D':'#f3ec4e',
  '5J':'#5ac4f7','6m':'#8c33b6','6M':'#d796f8','7m':'#5a2d05','7M':'#c98a1e','8J':'#000000'};

/* ---------------- utilidades ---------------- */
const $=(s,r)=>(r||document).querySelector(s);
function el(tag,cls,html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function sv(tag,at,padre){ const e=document.createElementNS(NS,tag); if(at) for(const k in at) e.setAttribute(k,at[k]); if(padre) padre.appendChild(e); return e; }
function ajustaSVG(svg,W,H,y0,h){ svg.setAttribute('viewBox','0 '+(y0||0)+' '+W+' '+(h||H)); svg.removeAttribute('width'); svg.removeAttribute('height');
  svg.style.width='100%'; svg.style.height='auto'; svg.style.overflow='visible'; }

/* ============================================================================
   AUDIO
   ============================================================================ */
let AC=null, PIANO=null, PIANO_EST='nada', BUS=null, RBUS=null, FX=null, VIVOS=[], RUIDO=null;
function ac(){
  if(AC) return AC;
  const C=window.AudioContext||window.webkitAudioContext;
  try{ AC=new C({latencyHint:'playback'}); }catch(e){ AC=new C(); }   // búfer holgado: menos cortes en ordenadores justos
  FX=AC.createGain(); FX.gain.value=1; FX.connect(AC.destination);
  RBUS=AC.createGain(); RBUS.gain.value=0.9; RBUS.connect(AC.destination);
  // piano: exactamente la cadena de los dictados animados de GE
  BUS=AC.createGain(); BUS.gain.value=4.6;
  const pa=AC.createBiquadFilter(); pa.type='highpass'; pa.frequency.value=110; pa.Q.value=0.707;
  const lim=AC.createDynamicsCompressor();
  try{ lim.threshold.value=-8; lim.knee.value=14; lim.ratio.value=6; lim.attack.value=0.003; lim.release.value=0.16; }catch(e){}
  BUS.connect(pa); pa.connect(lim); lim.connect(AC.destination);
  return AC;
}
function cargarPiano(){
  if(PIANO_EST!=='nada' && PIANO_EST!=='error') return;
  PIANO_EST='cargando'; pintaPiano();
  const ir=()=>{ try{
      Soundfont.instrument(ac(),'acoustic_grand_piano',{soundfont:'MusyngKite',gain:3.4,destination:BUS})
        .then(p=>{ PIANO=p; PIANO_EST='listo'; pintaPiano(); })
        .catch(()=>{ PIANO_EST='error'; pintaPiano(); });
    }catch(e){ PIANO_EST='error'; pintaPiano(); } };
  if(window.Soundfont) ir();
  else{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js';
    s.onload=ir; s.onerror=()=>{ PIANO_EST='error'; pintaPiano(); }; document.head.appendChild(s); }
}
function vivo(nodo,fin){ VIVOS.push({n:nodo,fin:fin}); }
/* nota de piano: el de los dictados; si no cargó, uno sintético de reserva */
function nota(t,midi,gain,dur){
  if(PIANO){ try{ PIANO.play(midi,t,{gain:gain,duration:dur}); return; }catch(e){} }
  pianoSint(t,midi,gain,dur);
}
function pianoSint(t,midi,gain,dur){
  const c=ac(), f=440*Math.pow(2,(midi-69)/12), end=t+dur, V=0.22*(gain||1);
  const g=c.createGain(); g.connect(BUS); g.gain.setValueAtTime(V,t); g.gain.setValueAtTime(V,Math.max(t,end-0.08)); g.gain.exponentialRampToValueAtTime(0.0001,end+0.15);
  [[1,1,1],[2,.62,.8],[3,.4,.62],[4,.26,.5],[5,.16,.4],[6,.1,.32]].forEach(([m,amp,dec])=>{
    const o=c.createOscillator(); o.type='sine'; o.frequency.value=f*m*(1+0.0004*m*m);
    const pg=c.createGain(), pk=amp*0.5; pg.gain.setValueAtTime(0.0001,t); pg.gain.exponentialRampToValueAtTime(pk,t+0.004);
    pg.gain.exponentialRampToValueAtTime(Math.max(0.00008,pk*0.04),t+Math.max(0.12,Math.min(dur,1.6+(69-midi)*0.02)*dec));
    pg.gain.exponentialRampToValueAtTime(0.00006,end+0.12);
    o.connect(pg); pg.connect(g); o.start(t); o.stop(end+0.18); vivo(o,end+0.18); });
}
/* sonido de RITMO (el de los quizzes de GE): golpe percusivo + cuerpo grave sostenido la duración de la figura */
function ritmoSonido(t0,durSec,gain){
  const c=ac(), out=RBUS, peak=(gain==null?0.34:gain);
  if(!RUIDO){ const n=Math.floor(c.sampleRate*0.012); RUIDO=c.createBuffer(1,n,c.sampleRate); const d=RUIDO.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.0); }
  const as=c.createBufferSource(); as.buffer=RUIDO;
  const af=c.createBiquadFilter(); af.type='bandpass'; af.frequency.value=850; af.Q.value=.6;
  const ag=c.createGain(); ag.gain.value=peak; as.connect(af); af.connect(ag); ag.connect(out); as.start(t0); as.stop(t0+0.03); vivo(as,t0+0.03);
  const sus=Math.max(0.05,durSec-0.05);
  const o=c.createOscillator(); o.type='sine'; o.frequency.value=110;
  const g=c.createGain(); o.connect(g); g.connect(out);
  g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(peak*0.42,t0+0.01);
  g.gain.setValueAtTime(peak*0.42,t0+Math.max(0.05,sus*0.6)); g.gain.exponentialRampToValueAtTime(0.0001,t0+sus);
  o.start(t0); o.stop(t0+sus+0.03); vivo(o,t0+sus+0.03);
}
/* claqueta suave de la cuenta atrás (la de los dictados animados) */
function claqueta(t,acc){ const c=ac(); const o=c.createOscillator(), g=c.createGain();
  o.type='sine'; o.frequency.setValueAtTime(acc?950:760,t); o.frequency.exponentialRampToValueAtTime(acc?520:420,t+0.04);
  g.gain.setValueAtTime(acc?0.10:0.055,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);
  o.connect(g); g.connect(FX); o.start(t); o.stop(t+0.09); vivo(o,t+0.09); }
/* campanita de aviso (la de los dictados animados): siempre la misma antes de revelar algo */
/* (30-sep-2026, Iago) «El sonidito que utilizas para indicar no me encanta»: la campanita ya no suena en ningún sitio.
   Para recuperarla: que ding() vuelva a llamar a dingViejo(). */
function ding(t){ return; }
function dingViejo(t){ const c=ac(); t=(t==null)?c.currentTime+0.03:t;
  [[659.25,0.07],[987.75,0.025]].forEach(([f,v])=>{ const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.35); o.connect(g); g.connect(FX); o.start(t); o.stop(t+0.6); vivo(o,t+0.6); }); }
/* (30-sep-2026, Iago) sonidito al aparecer la clave y la armadura del melódico: tres notas agudas muy suaves */
function brillo(t){ const c=ac(); t=(t==null)?c.currentTime+0.02:t;
  [[1318.5,0],[1568,0.07],[2093,0.14]].forEach(([f,dt])=>{ const o=c.createOscillator(), g=c.createGain(), ti=t+S(dt); o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(0.0001,ti); g.gain.exponentialRampToValueAtTime(0.045,ti+0.01); g.gain.exponentialRampToValueAtTime(0.0001,ti+0.45);
    o.connect(g); g.connect(FX); o.start(ti); o.stop(ti+0.5); vivo(o,ti+0.5); }); }
/* (30-sep-2026, Iago) un sonido cada vez que aparece la portada de un apartado: un «soplo» suave mientras se abre el
   color y, encima, la firma corta del apartado (≤1 s). Rítmico: ♪♪♩ con el sonido de ritmo · Melódico: cuatro notas
   que suben · TonCom: el acorde de tónica arpegiado · Armónico: un acorde plaqué · Bonus: V7–I.
   Para quitarlo: borrar la línea «soplo(…); firmaApartado(…)» de transicion(). */
let RUIDO_SOPLO=null;
function soplo(t){ const c=ac(), d=1.3;
  if(!RUIDO_SOPLO){ const n=Math.floor(c.sampleRate*d); RUIDO_SOPLO=c.createBuffer(1,n,c.sampleRate); const x=RUIDO_SOPLO.getChannelData(0); for(let i=0;i<n;i++) x[i]=Math.random()*2-1; }
  const s=c.createBufferSource(); s.buffer=RUIDO_SOPLO;
  const f=c.createBiquadFilter(); f.type='bandpass'; f.Q.value=0.8; f.frequency.setValueAtTime(240,t); f.frequency.exponentialRampToValueAtTime(2600,t+S(d));
  const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.06,t+S(d*0.7)); g.gain.exponentialRampToValueAtTime(0.0001,t+S(d));
  s.connect(f); f.connect(g); g.connect(FX); s.start(t); s.stop(t+S(d)+0.05); vivo(s,t+S(d)+0.05); }
function firmaApartado(k,t){
  if(k==='rit'){ [[0,0.14],[0.19,0.14],[0.38,0.5]].forEach(([dt,du])=>ritmoSonido(t+S(dt),S(du),0.3)); return; }
  if(k==='mel'){ [67,69,71,74].forEach((m,i)=>nota(t+S(i*0.14),m,0.72,S(i===3?1.0:0.28))); return; }
  if(k==='ton'){ [60,64,67,72].forEach((m,i)=>nota(t+S(i*0.1),m,0.6,S(1.3-i*0.1))); return; }
  if(k==='arm'){ [53,57,60,64].forEach(m=>nota(t,m,0.55,S(1.3))); return; }
  if(k==='bon'){ [55,59,62,65].forEach(m=>nota(t,m,0.5,S(0.42))); [48,64,67,72].forEach(m=>nota(t+S(0.48),m,0.6,S(1.2))); }
}
/* claqueta del TonCom (la del PreDict PRO): acento en el 1 de cada compás */
function clickTon(t0,acento,vol){ const c=ac(); const o=c.createOscillator(), g=c.createGain(), V=(vol==null?1:vol)*0.85;
  const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2200; lp.Q.value=0.4; lp.connect(FX);
  o.type='triangle'; o.frequency.value=acento?1050:900; o.connect(g); g.connect(lp);
  g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002,(acento?0.95:0.68)*V),t0+0.002); g.gain.exponentialRampToValueAtTime(0.0001,t0+0.05);
  o.start(t0); o.stop(t0+0.06); vivo(o,t0+0.06); }
function bloque(t,midis,dur,g){ midis.forEach(m=>nota(t,m,g||0.62,S(dur))); return t+S(dur); }
function arpegio(t,midis,paso,cola,g,cb){ midis.forEach((m,i)=>{ const ti=t+S(i*paso); nota(ti,m,g||0.7,S((midis.length-1-i)*paso+cola)); if(cb) enTiempo(ti,()=>cb(i)); });
  return t+S((midis.length-1)*paso+cola); }

/* ============================================================================
   RELOJ: todo se programa en el reloj del audio (ctx.currentTime). La pantalla va
   con el retraso real de salida (outputLatency), como en los dictados animados.
   Pausa = suspender el audio (se para todo a la vez). Saltar = cambiar de «época».
   ============================================================================ */
const SALTO=new Error('salto');
let EPOCA=0, COLA=[], PAUSA=false, ultPoda=0;
function ahora(){ return AC?AC.currentTime:0; }
function enTiempo(t,fn){ COLA.push({t:t,fn:fn,ep:EPOCA}); COLA.sort((a,b)=>a.t-b.t); }
function hasta(t){ return new Promise((res,rej)=>{ COLA.push({t:t,res:res,rej:rej,ep:EPOCA}); COLA.sort((a,b)=>a.t-b.t); }); }
function espera(seg){ return hasta(ahora()+S(seg)); }
function tick(){
  if(!AC) return;
  const now=AC.currentTime-(AC.outputLatency||0)+0.02;
  if(COLA.length){
    const lista=COLA; COLA=[];
    const quedan=[];
    for(const q of lista){
      if(q.ep!==EPOCA){ if(q.rej) q.rej(SALTO); continue; }
      if(now>=q.t){ try{ if(q.fn) q.fn(); if(q.res) q.res(); }catch(e){ console.error('[guiado]',e); } }
      else quedan.push(q);
    }
    COLA=quedan.concat(COLA); COLA.sort((a,b)=>a.t-b.t);
  }
  if(AC.currentTime-ultPoda>2){ ultPoda=AC.currentTime; VIVOS=VIVOS.filter(v=>v.fin>AC.currentTime); }
}
(function bucle(){ tick(); requestAnimationFrame(bucle); })();
setInterval(tick,50);
function cortar(){
  EPOCA++; tick();
  try{ if(PIANO) PIANO.stop(); }catch(e){}
  VIVOS.forEach(v=>{ try{ v.n.stop(); }catch(e){} }); VIVOS=[];
}
async function pausa(on){
  if(!AC) return;
  PAUSA=(on==null)?!PAUSA:!!on;
  ROOT.classList.toggle('pausa',PAUSA);
  const b=$('#pcgBPausa'); if(b) b.innerHTML=(PAUSA?ICO.play:ICO.pausa)+'<span>'+(PAUSA?'Seguir':'Pausa')+'</span>';
  try{ if(PAUSA) await AC.suspend(); else await AC.resume(); }catch(e){}
}
async function pianoListo(){
  const ep=EPOCA, t0=performance.now();
  if(PIANO_EST==='nada') cargarPiano();
  while(PIANO_EST==='cargando' && performance.now()-t0<12000) await new Promise(r=>setTimeout(r,150));
  if(ep!==EPOCA) throw SALTO;
}

/* ============================================================================
   ESCENARIO (1600×900, escalado a la ventana)
   ============================================================================ */
let ROOT=null, STAGE=null, K=1, ESC=null, MODO='portada', EJ_ACT=0, RUN=0, SIG=null;
let SEMILLA=null, ULTIMO=null, ULTIMO_ERR=false, SONDEO=null;
const ICO={
  pausa:'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="#fff"/><rect x="14" y="5" width="4" height="14" rx="1" fill="#fff"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="#fff"/></svg>',
  sig:'<svg viewBox="0 0 24 24"><path d="M5 5l9 7-9 7zM16 5h3v14h-3z" fill="#fff"/></svg>',
  rep:'<svg viewBox="0 0 24 24"><path d="M12 5a7 7 0 1 1-6.6 4.7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M4 4v6h6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  casa:'<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="#fff"/></svg>',
  pc:'<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
  lapiz:'<svg viewBox="0 0 24 24"><path d="M4 20l1.2-4.6L15.8 4.8a2.1 2.1 0 0 1 3 0l.4.4a2.1 2.1 0 0 1 0 3L8.6 18.8z" fill="#ffd23f"/><path d="M4 20l1.2-4.6 3.4 3.4z" fill="#f5d6a8"/><path d="M14.2 6.4l3.4 3.4" stroke="#1c1b27" stroke-width="1.4"/></svg>',
};
/* (30-sep-2026, Iago) debajo de la cuenta atrás del rítmico y del melódico: «✎ Escribe» */
const ESCRIBE='<i>'+ICO.lapiz+'</i><span>Escribe</span>';
function montar(){
  document.documentElement.classList.add('pcg-on');
  ROOT=el('div'); ROOT.id='pcg'; ROOT.className='en-portada';
  ROOT.innerHTML='<div class="pcg-fondos"><div class="pcg-fondo f-base"></div><div class="pcg-fondo f-multi on"><canvas class="giro" width="360" height="360"></canvas></div>'+
    EJS.concat([BONUS]).map(e=>'<div class="pcg-fondo f-ej f-'+e.k+'"></div>').join('')+'</div>'+
    '<div id="pcgStage"></div><div class="pcg-pausa-tag">EN PAUSA · pulsa «Seguir» o la barra espaciadora</div>'+
    '<div class="pcg-ctrl" id="pcgCtrl">'+
      '<button class="solo-ej con-txt" id="pcgBPausa" title="Pausa (espacio)">'+ICO.pausa+'<span>Pausa</span></button>'+
      '<button class="solo-ej" id="pcgBRep" title="Repetir este ejercicio (←)">'+ICO.rep+'</button>'+
      '<button class="solo-ej" id="pcgBSig" title="Siguiente ejercicio (→)">'+ICO.sig+'</button>'+
      '<button class="solo-ej" id="pcgBCasa" title="Volver a la portada">'+ICO.casa+'</button>'+
      '<button class="con-txt" id="pcgBPC" title="Pantalla completa (F)">'+ICO.pc+'<span>Pantalla completa</span></button></div>';
  document.body.appendChild(ROOT);
  STAGE=$('#pcgStage');
  pintaRemolino($('.f-multi .giro',ROOT));
  document.addEventListener('fullscreenchange',pintaPC); document.addEventListener('webkitfullscreenchange',pintaPC);
  escalar(); addEventListener('resize',escalar);
  $('#pcgBPausa').onclick=e=>{ e.currentTarget.blur(); if(MODO==='carrusel') pausa(); };
  $('#pcgBRep').onclick=e=>{ e.currentTarget.blur(); repetir(); };
  $('#pcgBSig').onclick=e=>{ e.currentTarget.blur(); siguiente(); };
  $('#pcgBCasa').onclick=e=>{ e.currentTarget.blur(); aPortada(); };
  $('#pcgBPC').onclick=e=>{ e.currentTarget.blur(); pantallaCompleta(true); };
  let tR=0;
  addEventListener('mousemove',()=>{ ROOT.classList.add('raton'); ROOT.classList.remove('quieto'); clearTimeout(tR);
    tR=setTimeout(()=>{ ROOT.classList.remove('raton'); if(MODO!=='portada') ROOT.classList.add('quieto'); },2600); });
  addEventListener('keydown',teclas);
}
/* (30-sep-2026, tarde) La espiral iba a tirones en el ordenador del aula: el remolino de la portada y el «bioma» del paso
   de ejercicio se pintan UNA vez en un lienzo pequeño y la tarjeta gráfica solo lo gira o lo escala (antes eran
   degradados enormes, de más de 3000 px, que se recalculaban). Se ven igual: son degradados suaves. */
function mezcla(a,b,f){ const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)); const A=h(a),B=h(b);
  return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*f)).join(',')+')'; }
function pintaRemolino(cv){ if(!cv||!cv.getContext) return; const c=cv.getContext('2d'), W=cv.width, R=W/2;
  const cols=['#ff5fa2','#ff9a3c','#ffd23f','#34d399','#5bd0ff','#7c6cff','#bd92ff','#ff5fa2'];
  c.clearRect(0,0,W,W); c.save(); c.beginPath(); c.arc(R,R,R,0,2*Math.PI); c.clip();
  if(c.createConicGradient){ const g=c.createConicGradient(-Math.PI/2,R,R); cols.forEach((k,i)=>g.addColorStop(i/(cols.length-1),k)); c.fillStyle=g; c.fillRect(0,0,W,W); }
  else { for(let a=0;a<360;a++){ const p=a/360*(cols.length-1), i=Math.floor(p); c.fillStyle=mezcla(cols[i],cols[Math.min(i+1,cols.length-1)],p-i);
    const a0=(a-90.6)*Math.PI/180, a1=(a-89)*Math.PI/180; c.beginPath(); c.moveTo(R,R); c.arc(R,R,R+2,a0,a1); c.closePath(); c.fill(); } }
  c.restore(); }
function pintaBioma(cv,E){ const c=cv.getContext('2d'), W=cv.width, R=W/2;
  c.clearRect(0,0,W,W); c.save(); c.beginPath(); c.arc(R,R,R,0,2*Math.PI); c.clip();
  const g=c.createRadialGradient(R,R,0,R,R,R);
  g.addColorStop(0,E.c); g.addColorStop(0.16,'rgba('+E.rgb+',.85)'); g.addColorStop(0.34,'rgba('+E.rgb+',.5)'); g.addColorStop(0.6,'rgba(12,12,18,0)'); g.addColorStop(1,'rgba(12,12,18,0)');
  c.fillStyle=g; c.fillRect(0,0,W,W);
  c.fillStyle='rgba(255,255,255,.09)';
  for(let k=0;k<30;k++){ const a0=(k*12-90)*Math.PI/180, a1=(k*12-84)*Math.PI/180; c.beginPath(); c.moveTo(R,R); c.arc(R,R,R,a0,a1); c.closePath(); c.fill(); }
  c.restore(); }
function enPC(){ return !!(document.fullscreenElement||document.webkitFullscreenElement); }
function pintaPC(){ const on=enPC();
  const a=$('#pcgBPC span'); if(a) a.textContent=on?'Salir':'Pantalla completa';   // (30-sep-2026) corto: no tropieza con el reloj de abajo
  const b=$('#pcgPC'); if(b){ const t=on?'Salir de pantalla completa':'Pantalla completa'; b.title=t; b.setAttribute('aria-label',t); b.classList.toggle('on',on); } }
function escalar(){ if(!STAGE) return; const w=innerWidth,h=innerHeight; K=Math.min(w/1600,h/900);
  STAGE.style.transform='translate('+((w-1600*K)/2)+'px,'+((h-900*K)/2)+'px) scale('+K+')'; }
function fondo(k){ ROOT.querySelectorAll('.pcg-fondo:not(.f-base)').forEach(f=>f.classList.toggle('on',f.classList.contains('f-'+k))); }
function colores(E){ ROOT.style.setProperty('--c',E.c); ROOT.style.setProperty('--c2',E.c2); ROOT.style.setProperty('--rgb',E.rgb); }
function rectEsc(e){ const r=e.getBoundingClientRect(), s=STAGE.getBoundingClientRect(); return {x:(r.left-s.left)/K,y:(r.top-s.top)/K,w:r.width/K,h:r.height/K}; }
function union(els){ let r=null; els.forEach(e=>{ if(!e) return; const q=rectEsc(e); if(q.w<1&&q.h<1) return;
  if(!r) r=q; else { const x=Math.min(r.x,q.x),y=Math.min(r.y,q.y); r={x,y,w:Math.max(r.x+r.w,q.x+q.w)-x,h:Math.max(r.y+r.h,q.y+q.h)-y}; } }); return r||{x:800,y:450,w:1,h:1}; }
function comoRect(t){ return (t && t.getBoundingClientRect)?rectEsc(t):t; }
function espiral(c,n){ return '<svg viewBox="0 0 44 44"><g fill="none" stroke="'+c+'" stroke-linecap="round"><path d="M22 4 a18 18 0 1 0 18 18" stroke-width="3"/><path d="M22 10 a12 12 0 1 1 -12 12" stroke-width="2.4" opacity=".7"/></g><circle cx="40" cy="22" r="3" fill="'+c+'"/>'+(n?'<text x="22" y="27.5" text-anchor="middle" font-size="15" font-weight="800" fill="'+c+'" font-family="Helvetica Neue,Arial,sans-serif">'+n+'</text>':'')+'</svg>'; }
/* el logo: la espiral del PreDict PRO, en colores psicodélicos */
function logoSVG(id){
  let d=''; for(let a=90;a<=900;a+=4){ const r=58+27*(a-90)/810, rad=a*Math.PI/180; d+=(d?' L ':'M ')+(100+r*Math.cos(rad)).toFixed(2)+' '+(100+r*Math.sin(rad)).toFixed(2); }
  d+=' L 15.00 100.00';
  return '<svg viewBox="0 0 200 200"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1">'+
    '<stop offset="0" stop-color="#ff5fa2"/><stop offset=".2" stop-color="#ff9a3c"/><stop offset=".4" stop-color="#ffd23f"/><stop offset=".6" stop-color="#34d399"/><stop offset=".8" stop-color="#5bd0ff"/><stop offset="1" stop-color="#bd92ff"/></linearGradient></defs>'+
    '<path d="'+d+'" fill="none" stroke="url(#'+id+')" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity=".25"/>'+
    '<path d="'+d+'" fill="none" stroke="url(#'+id+')" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="100" cy="158" r="7.5" fill="#fff"/></svg>';
}
const MARCA='<span class="pre">Pre</span><span class="dict">Dict</span><span class="carr">Carrusel</span>';

/* ---------- escena de un ejercicio ---------- */
function escena(E){
  STAGE.innerHTML='';
  const sc=el('div','pcg-ej');
  sc.innerHTML='<div class="pcg-chip">'+espiral(E.c,E.n)+'<span class="t"><b>'+E.b+'</b><i>'+E.f+'</i></span></div>'+
    '<div class="pcg-marca">'+MARCA+'</div>'+
    '<div class="pcg-cartel"><div class="big"></div><div class="sub"></div></div>'+
    '<div class="pcg-hoja"></div><div class="pcg-pie"></div>'+
    '<div class="pcg-velo"><div class="t">Solución en</div><div class="n"></div></div>'+
    '<div class="pcg-corr"><b></b></div><div class="pcg-cuenta"><b></b><span class="pista"></span></div><div class="pcg-capa"></div>';
  STAGE.appendChild(sc);
  ESC={E,sc,hoja:$('.pcg-hoja',sc),cartel:$('.pcg-cartel',sc),pie:$('.pcg-pie',sc),velo:$('.pcg-velo',sc),corr:$('.pcg-corr',sc),cuenta:$('.pcg-cuenta',sc),capa:$('.pcg-capa',sc),pulso:1};
  return ESC;
}
function cartel(big,sub){ if(!ESC) return; const c=ESC.cartel; $('.big',c).innerHTML=big||''; $('.sub',c).innerHTML=sub||'';
  c.classList.remove('cambia'); void c.offsetWidth; c.classList.add('cambia'); }
function flechaSVG(apunta){
  const v=(apunta==='abajo'||apunta==='arriba');
  const d={abajo:'M27 8 V64 M10 47 L27 70 L44 47',arriba:'M27 76 V20 M10 37 L27 14 L44 37',der:'M8 27 H64 M47 10 L70 27 L47 44',izq:'M76 27 H20 M37 10 L14 27 L37 44'}[apunta];
  // (30-sep-2026, Iago) sin contorno (antes llevaba un trazo blanco por debajo)
  return '<svg class="flecha '+(v?'fv':'fh')+'" viewBox="'+(v?'0 0 54 84':'0 0 84 54')+'">'+
    '<path d="'+d+'" stroke="'+ESC.E.c2+'" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
/* flecha + bocadillo que señalan algo (lado = dónde se pone la flecha respecto al objetivo) */
function guia(target,texto,lado){
  lado=lado||'arriba';
  const r=comoRect(target);
  const g=el('div','pcg-guia lado-'+lado);
  const apunta={arriba:'abajo',abajo:'arriba',izq:'der',der:'izq'}[lado];
  g.innerHTML=(texto?'<div class="bocadillo'+(texto.length>44?' largo':'')+'">'+texto+'</div>':'')+flechaSVG(apunta);
  let x,y;
  if(lado==='arriba'){ x=r.x+r.w/2; y=r.y-4; } else if(lado==='abajo'){ x=r.x+r.w/2; y=r.y+r.h+4; }
  else if(lado==='izq'){ x=r.x-4; y=r.y+r.h/2; } else { x=r.x+r.w+4; y=r.y+r.h/2; }
  g.style.left=x+'px'; g.style.top=y+'px';
  ESC.capa.appendChild(g);
  const b=$('.bocadillo',g);
  if(b){ const rb=rectEsc(b); let dx=0; if(rb.x<20) dx=20-rb.x; if(rb.x+rb.w>1580) dx=1580-(rb.x+rb.w); if(dx) b.style.transform='translateX('+dx+'px)'; }
  requestAnimationFrame(()=>g.classList.add('on'));
  return {quitar(){ g.classList.remove('on'); setTimeout(()=>g.remove(),450); }};
}
/* (30-sep-2026, Iago) cartel que ocupa TODA la pantalla (guía clara antes de decidir la inversión del acorde 2) */
function pantallazo(big,sub){ const p=el('div','pcg-pantallazo','<div class="big">'+big+'</div><div class="sub">'+(sub||'')+'</div>');
  ESC.capa.appendChild(p); requestAnimationFrame(()=>p.classList.add('on'));
  return { cambia(b2,s2){ $('.big',p).innerHTML=b2; $('.sub',p).innerHTML=s2||''; p.classList.remove('cambia'); void p.offsetWidth; p.classList.add('cambia'); },
    quitar(){ p.classList.remove('on'); setTimeout(()=>p.remove(),500); } }; }
/* (30-sep-2026, Iago) cartel centrado en la pantalla, sin flecha (el «Escribe la primera y la última nota» del melódico) */
function centrado(texto,y){ const g=el('div','pcg-centrado','<div class="bocadillo">'+texto+'</div>'); g.style.top=(y||470)+'px';
  ESC.capa.appendChild(g); requestAnimationFrame(()=>g.classList.add('on'));
  return {quitar(){ g.classList.remove('on'); setTimeout(()=>g.remove(),450); }}; }
/* el AVISO: siempre campanita + flecha + instrucción, y un momento para mirarlo */
async function aviso(target,texto,lado){ ding(); const g=guia(target,texto,lado); await espera(1.3); return g; }
function destello(target,pad){ const r=comoRect(target); pad=(pad==null?10:pad); const d=el('div','pcg-destello');
  d.style.cssText='left:'+(r.x-pad)+'px;top:'+(r.y-pad)+'px;width:'+(r.w+2*pad)+'px;height:'+(r.h+2*pad)+'px';
  ESC.capa.appendChild(d); setTimeout(()=>d.remove(),1600); }
/* (30-sep-2026, Iago) números verdes, lisos: sin destello, sin sombra y sin contorno */
function numeroGrande(n){ const c=ESC.cuenta; $('b',c).textContent=n; c.classList.add('on'); }
/* cuenta atrás 5·4·3·2·1 al pulso del ejercicio (5 pulsos iguales, como en los dictados animados); n=3 → 3·2·1 */
function cuentaAtras(t0,pulso,n,pista){ n=n||5;
  if(ESC&&ESC.cuenta){ $('.pista',ESC.cuenta).innerHTML=pista||''; ESC.cuenta.classList.toggle('con-pista',!!pista); }
  for(let k=0;k<n;k++){ const t=t0+S(k*pulso); claqueta(t,false); enTiempo(t,()=>numeroGrande(n-k)); }
  const tF=t0+S(n*pulso); enTiempo(tF,()=>{ if(ESC&&ESC.cuenta) ESC.cuenta.classList.remove('on'); }); return tF; }
/* una escucha: campanita + cartel + cuenta atrás + música */
async function pase(et,sub,programa,pre,pista){
  ding(); cartel(et,sub); await espera(pre||2.0);
  const t0=ahora()+0.3, tIni=cuentaAtras(t0,ESC.pulso,5,pista), tFin=programa(tIni);
  await hasta(tFin+S(0.5));
}
/* tiempo para escribir: anillo que se vacía + segundos */
async function escribir(seg,big,sub,pieTexto,eventos){
  cartel(big,sub||'');
  const P=ESC.pie;
  P.innerHTML='<div class="pcg-reloj"><svg viewBox="0 0 100 100"><circle class="fondo" cx="50" cy="50" r="44"/><circle class="arco" cx="50" cy="50" r="44" style="animation-duration:'+S(seg)+'s"/></svg><b>'+seg+'</b></div>'+
    (pieTexto?'<div class="pcg-reloj-t" style="font-size:31px;font-weight:700;max-width:1120px;line-height:1.3">'+pieTexto+'</div>':'');
  const b=$('b',P), t0=ahora();
  for(let k=1;k<seg;k++){ await hasta(t0+S(k)); b.textContent=seg-k; (eventos||[]).forEach(e=>{ if(e[0]===k) try{ e[1](); }catch(x){ console.error(x); } }); }
  await hasta(t0+S(seg)); P.innerHTML='';
}
/* final de cada ejercicio: 10 s para terminar + «Solución en 5…1» (sin sonido) */
async function finEjercicio(sub,pieTexto){
  await escribir(10,'Termina de completar el ejercicio',sub||'',pieTexto);
  cartel('','');
  const V=ESC.velo, n=$('.n',V); V.classList.add('on');
  const t0=ahora();
  for(let k=0;k<5;k++){ await hasta(t0+S(k)); n.textContent=String(5-k); }
  await hasta(t0+S(5)); V.classList.remove('on');
}
/* corrección: se enseña la solución y abajo a la derecha, discreto y sin sonido, los segundos que dura (~20) */
async function correccion(mostrar,seg,margen){
  cartel('Solución','Compara con lo que has escrito');
  ding();
  let dur=0; try{ dur=mostrar()||0; }catch(e){ console.error('[guiado]',e); }
  const total=Math.max(seg||20,Math.ceil(dur+(margen==null?8:margen)));   // (30-sep-2026) melódico 35 s (animación + 7) · TonCom 10 s · el resto 20 s
  const C=ESC.corr, b=$('b',C); b.textContent=total; C.classList.add('on');
  const t0=ahora();
  for(let k=1;k<=total;k++){ await hasta(t0+S(k)); b.textContent=Math.max(0,total-k); }
  C.classList.remove('on');
}
function mensaje(html){ const m=el('div','pcg-mensaje',html); ESC.capa.appendChild(m); requestAnimationFrame(()=>m.classList.add('on'));
  return {quitar(){ m.classList.remove('on'); setTimeout(()=>m.remove(),600); }}; }

/* ============================================================================
   1 · RÍTMICO
   ============================================================================ */
function modeloRitmo(){
  const R=datosRitmico[0], spec=R.spec;
  const spq=spec.compound?(60/42)/1.5:60/50;           // tempos de los quizzes de GE: negra 50 · negra con puntillo 42
  const BASE={q:1,'8':0.5,'16':0.25};
  let q=0; const ev=[], ini=[];
  R.compases.forEach((compas,ci)=>{ ini.push(q); compas.forEach(cell=>cell.notes.forEach(n=>{
    let d=BASE[String(n.dur).replace(/r$/,'')]||1; if(n.dots) d*=1.5;
    if(cell.tuplet===3) d=1/3; else if(cell.tuplet===2) d=0.75;
    ev.push({q:q,d:d,rest:!!(n.rest||/r$/.test(n.dur))}); q+=d; })); });
  return {spec,spq,beatQ:spec.compound?1.5:1,ev,totalQ:q,ini,compases:R.compases};
}
function dibujaRitmo(host,M){
  const VF=Vex.Flow; host.innerHTML='';
  const box=el('div','pcg-nota'); host.appendChild(box);
  const W=880,H=178, x0=12, y=46, totalW=W-24, firstExtra=70, barW=(totalW-firstExtra)/4, spec=M.spec;
  const ren=new VF.Renderer(box,VF.Renderer.Backends.SVG); ren.resize(W,H);
  const ctx=ren.getContext(); ctx.setFont('Arial',10);
  let x=x0, k=0; const notas=[], comp=[];
  M.compases.forEach((compas,ci)=>{
    const isFirst=ci===0, isLast=ci===3, w=isFirst?barW+firstExtra:barW;
    const stave=new VF.Stave(x,y,w);
    for(let ln=0;ln<5;ln++) stave.setConfigForLine(ln,{visible:false});
    if(isFirst) stave.addClef('treble').addTimeSignature(spec.ts);
    if(isLast) stave.setEndBarType(VF.Barline.type.END);
    ctx.openGroup('rmarco'); stave.setContext(ctx).draw(); ctx.closeGroup();
    if(isFirst){ try{ stave.setNoteStartX(stave.getNoteStartX()+12); }catch(e){} }   // (30-sep-2026) el 1.er ritmo no toca la casilla del compás
    const nts=[], tuplets=[], beamGroups=[];
    compas.forEach(cell=>{
      const group=[];
      cell.notes.forEach(n=>{
        const isRest=n.rest||/r$/.test(n.dur);
        const sn=new VF.StaveNote({keys:['b/4'],duration:isRest&&!/r$/.test(n.dur)?n.dur+'r':n.dur,stem_direction:1});
        if(n.dots){ for(let d=0;d<n.dots;d++) VF.Dot.buildAndAttach([sn],{all:true}); }
        sn.setAttribute('id','pcgrn'+(k++));
        nts.push(sn); group.push(sn); notas.push(sn);
      });
      if(cell.tuplet) tuplets.push(new VF.Tuplet(group,{num_notes:cell.tuplet,notes_occupied:cell.tuplet===3?2:(cell.tuplet===2?3:2)}));
      if(cell.beam){
        const beamable=sn=>{ try{ if(sn.isRest&&sn.isRest()) return false; const d=sn.getDuration?sn.getDuration():''; return d==='8'||d==='16'||d==='32'||d==='64'; }catch(e){ return false; } };
        let run=[]; const flush=()=>{ if(run.length>1) beamGroups.push(run.slice()); run=[]; };
        group.forEach(sn=>{ if(beamable(sn)) run.push(sn); else flush(); }); flush();
      }
    });
    const beams=beamGroups.map(g=>new VF.Beam(g));
    const voice=new VF.Voice({num_beats:spec.compound?6:spec.pulsos,beat_value:spec.compound?8:4});
    voice.setStrict(false); voice.addTickables(nts);
    new VF.Formatter().joinVoices([voice]).format([voice],w-(isFirst?firstExtra+22:14));
    ctx.openGroup('rnotas'); voice.draw(ctx,stave); beams.forEach(b=>b.setContext(ctx).draw()); tuplets.forEach(t=>t.setContext(ctx).draw()); ctx.closeGroup();
    comp.push({a:x,b:x+w});
    x+=w;
  });
  const svg=box.querySelector('svg'); ajustaSVG(svg,W,H);
  // la solución se escribe «de izquierda a derecha» con un recorte (arriba: plicas y barras; abajo: cabezas y puntillos)
  const defs=sv('defs'); svg.insertBefore(defs,svg.firstChild);
  const cp=sv('clipPath',{id:'pcgRitClip'},defs), poly=sv('polygon',{points:'0,0 0,0 0,0'},cp);
  svg.querySelectorAll('g.vf-rnotas').forEach(g=>g.setAttribute('clip-path','url(#pcgRitClip)'));
  const hl=sv('rect',{class:'pcg-hl',x:0,y:y+10,width:10,height:98,rx:12}); svg.insertBefore(hl,defs.nextSibling);
  const ts=svg.querySelector('.vf-timesignature'); if(ts) ts.classList.add('pcg-oc');
  const bb=ts?ts.getBBox():{x:70,y:y+40,width:16,height:40};
  const caja=sv('rect',{class:'pcg-caja',x:bb.x-11,y:bb.y-11,width:bb.width+22,height:bb.height+22,rx:10}); svg.insertBefore(caja,hl.nextSibling);
  comp[0].a=bb.x+bb.width+11;   // (30-sep-2026, Iago) el 1.er compás empieza después de la casilla del compás
  const bbs=notas.map((sn,i)=>{ const g=svg.querySelector('#vf-pcgrn'+i); try{ return g.getBBox(); }catch(e){ return {x:0,y:0,width:0,height:0}; } });
  const lim=notas.map((sn,i)=>{
    const b=bbs[i]; let right=b.x+b.width, stemX=null;
    try{ if(!sn.isRest() && sn.hasStem()) stemX=sn.getStemX(); }catch(e){}
    if(stemX!=null) right=Math.max(right,stemX+1);
    const next=(i+1<notas.length)?bbs[i+1].x:W+50;
    const lo=Math.min(right+2,next-1);
    const hi=(sn.beam&&stemX!=null)?Math.min(stemX+1.6,next-1):lo;
    return {lo,hi};
  });
  const ySplit=y+51;
  function clip(i){
    if(i<0){ poly.setAttribute('points','0,0 0,0 0,0'); return; }
    const L=(i>=notas.length-1)?{lo:W+60,hi:W+60}:lim[i];
    poly.setAttribute('points',['-10,-60',L.hi+',-60',L.hi+','+ySplit,L.lo+','+ySplit,L.lo+','+(H+60),'-10,'+(H+60)].join(' '));
  }
  clip(-1);
  return { caja,
    verCompas(){ if(ts) ts.classList.add('pcg-si'); caja.classList.add('llena'); },
    hasta(i){ clip(i); }, todo(){ clip(notas.length-1); }, nada(){ clip(-1); },
    compas(ci){ if(ci<0){ hl.classList.remove('on'); return; } const c=comp[ci], m=4;   // (30-sep-2026) entre las dos líneas, sin pisarlas
      hl.setAttribute('x',c.a+m); hl.setAttribute('width',Math.max(10,c.b-c.a-2*m)); hl.classList.add('on'); } };
}
/* «Piensa en los ritmos típicos de este compás»: una nube de pensamiento con TODAS las células del motor
   de ese compás apareciendo y desvaneciéndose deprisa (ayudita fugaz; solo opacidad y posición) */
function celdaVF(host,cell,compound){
  const VF=Vex.Flow, n=cell.notes.length, W=Math.max(74,44+n*25), H=100;
  const box=el('div','celda-svg'); host.appendChild(box);
  const ren=new VF.Renderer(box,VF.Renderer.Backends.SVG); ren.resize(W,H);
  const ctx=ren.getContext(); ctx.setFont('Arial',10);
  const st=new VF.Stave(0,0,W); for(let ln=0;ln<5;ln++) st.setConfigForLine(ln,{visible:false});
  try{ st.setBegBarType(VF.Barline.type.NONE); st.setEndBarType(VF.Barline.type.NONE); }catch(e){}
  st.setContext(ctx).draw();
  const nts=cell.notes.map(nn=>{ const isRest=nn.rest||/r$/.test(nn.dur);
    const sn=new VF.StaveNote({keys:['b/4'],duration:isRest&&!/r$/.test(nn.dur)?nn.dur+'r':nn.dur,stem_direction:1});
    if(nn.dots){ for(let d=0;d<nn.dots;d++) VF.Dot.buildAndAttach([sn],{all:true}); } return sn; });
  const tup=cell.tuplet?new VF.Tuplet(nts,{num_notes:cell.tuplet,notes_occupied:cell.tuplet===3?2:3}):null;
  const beams=[];
  if(cell.beam){ const bm=sn=>{ try{ if(sn.isRest()) return false; const d=sn.getDuration(); return d==='8'||d==='16'; }catch(e){ return false; } };
    let run=[]; const fl=()=>{ if(run.length>1) beams.push(new VF.Beam(run.slice())); run=[]; }; nts.forEach(sn=>{ if(bm(sn)) run.push(sn); else fl(); }); fl(); }
  const v=new VF.Voice({num_beats:compound?3:1,beat_value:compound?8:4}); v.setStrict(false); v.addTickables(nts);
  new VF.Formatter().joinVoices([v]).format([v],W-34);
  v.draw(ctx,st); beams.forEach(b=>b.setContext(ctx).draw()); if(tup) tup.setContext(ctx).draw();
  ajustaSVG($('svg',box),W,H,2,90);
}
function nubeRitmos(spec){
  const lista=spec.compound
    ? [].concat(CELLS_COMPOUND.facil,CELLS_COMPOUND.medio,CELLS_COMPOUND.dificil,[{id:'sil_negrap',beats:1,notes:[{dur:'q',dots:1,rest:true}]}])
    : [].concat(CELLS_SIMPLE.facil,CELLS_SIMPLE.medio);
  // (30-sep-2026, Iago) primero los TÍPICOS del compás (en 6/8: negra con puntillo, tres corcheas, negra-corchea y
  // corchea-negra) y después el resto, barajado
  const TIP=spec.compound?['negrap','3corcheas','negra_corch','corch_negra']:['negra','2corcheas','4semi','corch_2semi','2semi_corch'];
  const resto=lista.filter(c=>TIP.indexOf(c.id)<0); for(let i=resto.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [resto[i],resto[j]]=[resto[j],resto[i]]; }
  const orden=TIP.map(id=>lista.find(c=>c.id===id)).filter(Boolean).concat(resto);
  const n=el('div','pcg-nube');
  const bolas=[[650,285,560,205],[235,160,125],[430,105,140],[650,88,150],[870,102,142],[1072,160,125],[140,290,118],[1165,280,120],
    [255,420,120],[468,470,122],[690,482,126],[912,462,122],[1105,405,112]];
  n.innerHTML='<svg class="nube-f" viewBox="0 -70 1300 720">'+bolas.map(b=>b.length===4?'<ellipse cx="'+b[0]+'" cy="'+b[1]+'" rx="'+b[2]+'" ry="'+b[3]+'"/>':'<circle cx="'+b[0]+'" cy="'+b[1]+'" r="'+b[2]+'"/>').join('')+
    '<circle cx="179" cy="10" r="23"/><circle cx="156" cy="-33" r="14.5"/><circle cx="137" cy="-66" r="9"/></svg><div class="nube-in"></div>';   // (30-sep-2026, Iago) las bolitas salen de «Piensa»
  ESC.capa.appendChild(n);
  const cont=$('.nube-in',n);
  // (30-sep-2026) seis sitios bien DENTRO de la nube (antes algunos se salían por los lados); un sitio no se repite
  // hasta que el ritmo anterior ya se ha ido
  const SLOTS=[[380,165],[650,150],[920,165],[380,370],[650,385],[920,370]];
  const ordSlots=[0,4,2,3,1,5];
  orden.forEach((cell,k)=>{
    const c=el('div','celda'); const sl=SLOTS[ordSlots[k%ordSlots.length]];
    c.style.left=sl[0]+'px'; c.style.top=sl[1]+'px'; c.style.animationDelay=(0.5+k*0.33)+'s';
    c.style.setProperty('--r',((Math.random()*10)-5).toFixed(1)+'deg');
    cont.appendChild(c); try{ celdaVF(c,cell,spec.compound); }catch(e){ console.warn('[guiado] célula',cell.id,e); }
  });
  requestAnimationFrame(()=>{ n.classList.add('on'); n.classList.add('va'); });
  return {dura:0.5+orden.length*0.33+1.7, quitar(){ n.classList.remove('on'); setTimeout(()=>n.remove(),700); }};
}
function tocaRitmo(t0,M,D,escribe){
  M.ev.forEach((e,k)=>{ const t=t0+S(e.q*M.spq); if(!e.rest) ritmoSonido(t,S(e.d*M.spq),0.34); if(escribe) enTiempo(t,()=>D.hasta(k)); });
  M.ini.forEach((q,ci)=>enTiempo(t0+S(q*M.spq),()=>D.compas(ci)));
  const tFin=t0+S(M.totalQ*M.spq); enTiempo(tFin,()=>D.compas(-1));
  return tFin;
}
async function ejRitmico(){
  escena(EJS[0]);
  const M=modeloRitmo(); ESC.pulso=M.spq*M.beatQ;
  const D=dibujaRitmo(ESC.hoja,M);
  cartel('Dictado rítmico','Cuatro compases');
  await espera(1.6);
  const g=await aviso(D.caja,'Escribe el compás','arriba');
  D.verCompas(); destello(D.caja,6);
  await espera(3.5); g.quitar();
  cartel('Piensa en los ritmos típicos de este compás','');
  const nube=nubeRitmos(M.spec);
  await espera(Math.max(5.5,nube.dura+0.1)); nube.quitar();
  await espera(0.5);
  await pase('1ª escucha','',t=>tocaRitmo(t,M,D,false),2.0,ESCRIBE);
  await escribir(10,'','','Próxima repetición');   // (30-sep-2026, Iago) sin cartel: abajo, junto al tiempo
  await pase('2ª escucha','',t=>tocaRitmo(t,M,D,false),2.0,ESCRIBE);
  await finEjercicio();
  await correccion(()=>{ const t=ahora()+0.4, tf=tocaRitmo(t,M,D,true); enTiempo(tf,()=>D.todo()); return M.totalQ*M.spq+0.4; });
}

/* ============================================================================
   2 · MELÓDICO
   ============================================================================ */
function nombreIntervalo(a,b){
  const L='cdefgab', pa=a.key.split('/'), pb=b.key.split('/');
  const da=L.indexOf(pa[0][0])+7*Number(pa[1]), db=L.indexOf(pb[0][0])+7*Number(pb[1]);
  const n=Math.abs(db-da)+1, s=Math.abs(b.midi-a.midi), nn=((n-1)%7)+1, sb=s-12*Math.floor((n-1)/7);
  const MAY={1:0,2:2,3:4,4:5,5:7,6:9,7:11}, d=sb-MAY[nn];
  const q=(nn===1||nn===4||nn===5)?(d===0?'J':(d>0?'A':'D')):(d===0?'M':(d===-1?'m':(d>0?'A':'D')));
  return n+q;
}
function dibujaMelodia(host,key,mel){
  const VF=Vex.Flow; host.innerHTML='';
  const box=el('div','pcg-nota'); host.appendChild(box);
  const W=900,H=240, x0=10, y=58, w=W-20, clef=mel.clef||'treble';
  const ren=new VF.Renderer(box,VF.Renderer.Backends.SVG); ren.resize(W,H);
  const ctx=ren.getContext();
  const stave=new VF.Stave(x0,y,w); stave.addClef(clef).addKeySignature(key.vfsig); stave.setContext(ctx).draw();
  const sigPCs=keySigPCs(key.sig);
  // misma escritura que el carrusel del iPad (dibujarPentagramaMelodico)
  const vfs=mel.seq.map(m=>{ const pc=m%12;
    if(pc===mel.leadingPC && mel.useFlats){ const oct=Math.floor(m/12)-1, nm=NOTE_NAMES[pc]; return {key:nm[0].toLowerCase()+nm.slice(1)+'/'+oct,accidental:nm.slice(1)||null}; }
    return midiToVF(m,mel.useFlats,sigPCs); });
  const notes=vfs.map(v=>{ const sn=new VF.StaveNote({keys:[v.key],duration:'w',clef}); if(v.accidental) sn.addModifier(new VF.Accidental(v.accidental),0); return sn; });
  const voice=new VF.Voice({num_beats:40,beat_value:4}); voice.setStrict(false); voice.addTickables(notes);
  new VF.Formatter().joinVoices([voice]).format([voice],w-110);
  const gInt=ctx.openGroup('pcgint'); ctx.closeGroup();
  const gN=notes.map(sn=>{ const g=ctx.openGroup('pcgmn'); sn.setStave(stave); sn.setContext(ctx); sn.drawWithStyle(); ctx.closeGroup(); return g; });
  const svg=box.querySelector('svg'); ajustaSVG(svg,W,H);
  const P=notes.map((sn,i)=>{ const a=sn.getNoteHeadBeginX(), b=sn.getNoteHeadEndX(); return {cx:(a+b)/2,cy:sn.getYs()[0],acc:!!vfs[i].accidental,key:vfs[i].key,midi:mel.seq[i]}; });
  const clefG=svg.querySelector('.vf-clef'), ksG=svg.querySelector('.vf-keysignature');
  [clefG,ksG].forEach(g=>{ if(g) g.classList.add('pcg-oc'); });
  gN.forEach(g=>g.classList.add('pcg-oc'));
  // casilla de la tonalidad (como en la ficha)
  const caja=sv('rect',{class:'pcg-caja',x:x0+4,y:6,width:196,height:44,rx:10},svg);
  const ph=sv('text',{class:'pcg-caja-ph',x:x0+102,y:33,'text-anchor':'middle'},svg); ph.textContent='tonalidad';
  const tn=sv('text',{class:'pcg-caja-t pcg-oc',x:x0+102,y:37,'text-anchor':'middle'},svg); tn.textContent=key.name;
  // números 1…10 (30-sep-2026, Iago: sin aros ni contornos)
  const numY=y+146, gNum=sv('g',{},svg);
  const hlN=sv('circle',{class:'pcg-num-hl',cx:P[0].cx,cy:numY-6,r:16},gNum);
  const tNum=P.map((p,i)=>{ const t=sv('text',{class:'pcg-num',x:p.cx,y:numY,'text-anchor':'middle'},gNum); t.textContent=String(i+1); return t; });
  const gLab=sv('g',{},svg);
  // (30-sep-2026, Iago) flechas de la 1.ª y la 10.ª nota: azules, sin contorno, verticales, de abajo arriba, encima del número
  const fl={}, yBaja=stave.getYForLine(4);
  [0,9].forEach(i=>{ const p=P[i], y1=numY-26; let y0=Math.max(p.cy+13,yBaja+6); if(y1-y0<14) y0=y1-14;
    const g=sv('g',{class:'pcg-oc pcg-flecha-n'},svg);
    sv('path',{d:'M'+p.cx+' '+y1+' V'+y0+' M'+(p.cx-7)+' '+(y0+9)+' L'+p.cx+' '+y0+' L'+(p.cx+7)+' '+(y0+9)},g); fl[i]=g; });
  return { gN, P,
    zonaClave(){ return union([clefG,ksG]); },
    verClave(){ [clefG,ksG].forEach(g=>{ if(g) g.classList.add('pcg-si'); }); ph.style.opacity=0; tn.classList.add('pcg-si'); caja.classList.add('llena'); },
    verNota(i){ gN[i].classList.add('pcg-si'); },
    flecha(i,on){ if(fl[i]) fl[i].classList.toggle('pcg-si',!!on); },
    marca(i){ tNum.forEach((t,j)=>t.classList.toggle('act',j===i)); if(i<0){ hlN.classList.remove('on'); return; } hlN.setAttribute('cx',P[i].cx); hlN.classList.add('on'); },
    intervalo(i){
      const a=P[i-1], b=P[i], nom=nombreIntervalo(a,b), col=INTERVALIA[nom]||'#444';
      const dx=b.cx-a.cx, dy=b.cy-a.cy, len=Math.hypot(dx,dy)||1, ux=dx/len, uy=dy/len, r0=17, r1=b.acc?31:17;   // (30-sep-2026, Iago) con margen: no tocan la nota
      sv('line',{class:'pcg-int-l',x1:a.cx+ux*r0,y1:a.cy+uy*r0,x2:b.cx-ux*r1,y2:b.cy-uy*r1,stroke:col},gInt);
      const mx=(a.cx+b.cx)/2, my=Math.min(a.cy,b.cy)-17, tw=nom.length*10+16;
      const g=sv('g',{},gLab);
      sv('rect',{class:'pcg-int-b',x:mx-tw/2,y:my-17,width:tw,height:23,rx:7},g);
      const t=sv('text',{class:'pcg-int-t',x:mx,y:my,'text-anchor':'middle'},g); t.textContent=nom;
    } };
}
async function paseMel(D,seq,dur,sil,et,sub){
  ding(); cartel(et,sub); await espera(2.0);
  const t0=cuentaAtras(ahora()+0.3,1,5,ESCRIBE)+S(0.15);   // (30-sep-2026, Iago) 5·4·3·2·1 para estar prevenidos, y «✎ Escribe»
  seq.forEach((m,i)=>{ const t=t0+S(i*(dur+sil)); nota(t,m,0.95,S(dur)); enTiempo(t,()=>D.marca(i)); });
  await hasta(t0+S(seq.length*(dur+sil)-sil+0.4)); D.marca(-1);
}
async function ejMelodico(){
  escena(EJS[1]); await pianoListo();
  const key=datosMelodico[0].key, mel=datosMelodico[0].mel;
  const D=dibujaMelodia(ESC.hoja,key,mel);
  cartel('Dictado melódico','Diez notas');
  await espera(1.6);
  let g=await aviso(D.zonaClave(),'Escribe la clave y la armadura','der');   // (30-sep-2026) a la derecha: no tapa la tonalidad
  D.verClave(); destello(D.zonaClave(),8); brillo();   // (30-sep-2026, Iago) con un sonidito
  await espera(4.5); g.quitar();
  // (30-sep-2026, Iago) el cartel, centrado; la flecha de la 1.ª nota sale con la 1.ª nota y después la de la 10.ª
  const zc=D.zonaClave(); ding(); const cen=centrado('Escribe la primera y la última nota',zc.y+zc.h/2); await espera(1.3);
  D.verNota(0); D.marca(0); D.flecha(0,true); nota(ahora()+0.05,mel.seq[0],0.95,S(1.6));
  await espera(1.6);
  D.verNota(9); D.marca(9); D.flecha(9,true); nota(ahora()+0.05,mel.seq[9],0.95,S(1.6));
  await espera(3.5); cen.quitar(); D.flecha(0,false); D.flecha(9,false); D.marca(-1);
  await paseMel(D,mel.seq,3,3,'1ª escucha','');
  await escribir(10,'','','Próxima repetición');   // (30-sep-2026, Iago) igual que en el rítmico
  await paseMel(D,mel.seq,2,2,'2ª escucha','');
  // (30-sep-2026) la aclaración va en el cartel de arriba (abajo tropezaba con los mandos)
  await finEjercicio('Si te equivocas en una nota, pero mantienes los intervalos siguientes, solo cuenta un error');
  // (30-sep-2026, Iago) la solución, más lenta para que los alumnos vayan diciendo las notas: cada nota suena lo mismo
  // (1,3 s), pero pasa 2,9 s de una a otra; al acabar, quedan 7 s (35 s en total)
  const PASO=2.9;
  await correccion(()=>{ const t=ahora()+0.35;
    mel.seq.forEach((m,i)=>{ const ti=t+S(i*PASO); nota(ti,m,0.95,S(1.3)); enTiempo(ti,()=>{ D.verNota(i); D.marca(i); if(i>0) D.intervalo(i); }); });
    enTiempo(t+S(9*PASO+1.3),()=>D.marca(-1));
    return 0.35+9*PASO+1.3; },0,7);
}

/* ============================================================================
   3 · TONCOM (como el TonCom del PreDict PRO: La → tónica → acordes → armadura → 5·4·3·2·1 → ejemplo)
   ============================================================================ */
const TON_COMPAS_G={'2/4':{ts:'2/4',beats:2,comp:false,bpm:70},'3/4':{ts:'3/4',beats:3,comp:false,bpm:70},'6/8':{ts:'6/8',beats:2,comp:true,bpm:60}};
function chordSemisG(grade,mode){ const major=[0,4,7],minor=[0,3,7],degRoot={1:0,2:2,4:5,5:7,6:9}, root=degRoot[grade]||0;
  if(grade===5) return major.map(iv=>(root+iv)%12);
  if(mode==='minor') return (grade===1||grade===4?minor:(grade===6?major:minor)).map(iv=>(root+iv)%12);
  return (grade===2||grade===6?minor:major).map(iv=>(root+iv)%12); }
function sensibleG(events,tpc){ const r=events.filter(e=>!e.rest); for(let i=0;i<r.length-1;i++){ const n=r[i],nx=r[i+1];
  const a=(((n.midi%12)-tpc)+12)%12, b=(((nx.midi%12)-tpc)+12)%12; if(a===10&&b===0&&nx.midi>n.midi&&(nx.midi-n.midi)<=2) n.midi+=1; } }
/* dictado tonal de 8 compases (motor del PRO) con un azar propio sembrado: siempre el mismo para la misma semilla */
function genTonDictadoG(key,compas,R){
  const lp=a=>a[Math.floor(R()*a.length)];
  const SC={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10]};
  const tpc=((key.tpc)%12+12)%12, sc=SC[key.mode], mode=key.mode;
  const pulseSec=(compas.comp?1.5:1)*(60/compas.bpm), LO=57, HI=76;
  const scale=[]; for(let m=LO;m<=HI;m++){ if(sc.includes(((m-tpc)%12+12)%12)) scale.push(m); }
  const tonics=scale.filter(m=>((m%12)+12)%12===tpc), floors=tonics.filter(t=>t>=58&&t+11<=76);
  const winFloor=floors.length?lp(floors):(tonics[0]||60);
  const win=scale.filter(m=>m>=Math.max(LO,winFloor-2)&&m<=Math.min(HI,winFloor+11));
  const idxOf=m=>{ let bi=0,bd=1e9; win.forEach((x,i)=>{ const d=Math.abs(x-m); if(d<bd){bd=d;bi=i;} }); return bi; };
  const startTonic=win.find(m=>((m%12)+12)%12===tpc)||win[0];
  const chordTonesOf=grade=>{ const pcs=chordSemisG(grade,mode).map(s=>((tpc+s)%12)); return win.filter(m=>pcs.includes(((m%12)+12)%12)); };
  const nearestChordTone=(grade,ref)=>{ const c=chordTonesOf(grade); return c.length?c.reduce((a,b)=>Math.abs(b-ref)<Math.abs(a-ref)?b:a):ref; };
  const c3=(()=>{ const r=R(); return r<0.5?4:(r<0.75?2:6); })();
  const plan=[1,5,c3,5,1,4,5,1];
  const pulseSubs=()=>{ if(compas.comp){ const r=R(); return r<0.5?[1]:(r<0.82?[1/3,1/3,1/3]:[2/3,1/3]); }
    const r=R(); return r<0.5?[1]:(r<0.8?[0.5,0.5]:(r<0.92?[0.75,0.25]:[0.25,0.25,0.25,0.25])); };
  const arch=[0,2,4,3,0,3,5,0], baseIdx=idxOf(startTonic);
  const targetOf=(b,k,beats)=>{ const a0=arch[b], a1=(b<7?arch[b+1]:0), t=beats>1?k/beats:0; return Math.max(0,Math.min(win.length-1,baseIdx+Math.round(a0+(a1-a0)*t))); };
  const events=[]; let cur=startTonic;
  for(let b=0;b<8;b++){
    const grade=plan[b], beats=compas.beats;
    if(b===3){ const v=nearestChordTone(5,cur); cur=v; events.push({midi:v,durSec:pulseSec,strong:true,beatStart:true});
      for(let k=1;k<beats;k++) events.push({rest:true,durSec:pulseSec,beatStart:true}); continue; }
    const strongs=[]; let c=cur;
    for(let k=0;k<beats;k++){ let s;
      if(b===0&&k===0) s=startTonic;
      else if(b===7&&k===beats-1) s=win.find(m=>((m%12)+12)%12===tpc&&Math.abs(m-c)<=9)||startTonic;
      else { const target=win[targetOf(b,k,beats)]; s=nearestChordTone(grade,target);
        if(s===c){ const alt=chordTonesOf(grade).filter(m=>m!==c); if(alt.length) s=alt.reduce((a,x)=>Math.abs(x-target)<Math.abs(a-target)?x:a); } }
      strongs.push(s); c=s; }
    for(let k=0;k<beats;k++){
      const subs=(b===7&&k===beats-1)?[1]:pulseSubs();
      const strong=strongs[k], nextStrong=(k+1<beats)?strongs[k+1]:(b<7?nearestChordTone(plan[b+1],strong):strong), i1=idxOf(nextStrong);
      subs.forEach((frac,si)=>{ let midi;
        if(si===0) midi=strong;
        else { const iC=idxOf(cur); const dir=(i1>iC)?1:(i1<iC?-1:(R()<0.5?1:-1)); let idx=Math.max(0,Math.min(win.length-1,iC+dir)); midi=win[idx];
          if(midi===cur){ idx=Math.max(0,Math.min(win.length-1,iC-dir)); midi=win[idx]; } }
        cur=midi; events.push({midi,durSec:frac*pulseSec,strong:(k===0&&si===0),beatStart:(si===0)}); });
    }
  }
  if(mode==='minor') sensibleG(events,tpc);
  return {events};
}
function tonChordMidisG(key,degree,nearRoot){ const rootSemi={0:0,3:5,4:7}[degree], rootPc=(key.tpc+rootSemi)%12, third=key.mode==='major'?4:(degree===4?4:3);
  const target=(nearRoot!=null)?nearRoot:55; let root=null,best=1e9;
  for(let m=40;m<=79;m++){ if(((m%12)+12)%12===rootPc){ const d=Math.abs(m-target); if(d<best){best=d;root=m;} } }
  return [root,root+third,root+7]; }
function voiceUnderTopG(chord,topMidi){ const topPc=((topMidi%12)+12)%12, pcs=[...new Set(chord.map(m=>((m%12)+12)%12))].filter(pc=>pc!==topPc), v=[topMidi];
  pcs.forEach(pc=>{ let x=topMidi-1; while(((x%12)+12)%12!==pc) x--; if(topMidi-x>12) x+=12; v.push(x); }); return v.sort((a,b)=>a-b); }
function acordesTonales(t,key,tonM,paso){ paso=paso||1.2; const tops=[tonM,tonM,tonM-1,tonM], deg=[0,3,4,0];
  deg.forEach((d,i)=>{ const tri=tonChordMidisG(key,d,tonM-7); let top=tops[i]; const topPc=((top%12)+12)%12;
    if(!tri.some(m=>((m%12)+12)%12===topPc)){ let bp=((tri[0]%12)+12)%12,bd=1e9; tri.forEach(m=>{ const x=Math.abs(((m%12)+12)%12-topPc); if(x<bd){bd=x;bp=((m%12)+12)%12;} }); while(((top%12)+12)%12!==bp) top--; }
    const vs=voiceUnderTopG(tri,top); vs.forEach((m,j)=>nota(t+S(i*paso),m,j===vs.length-1?0.85:0.42,S(paso*0.875))); });
  return t+S(4*paso); }
function tocaTon(t0,ev){ let bt=t0;
  ev.forEach(e=>{ if(e.beatStart) clickTon(bt,!!e.strong,e.strong?0.30:0.12); if(!e.rest) nota(bt,e.midi,e.strong?1.0:0.72,Math.max(0.22,S(e.durSec)*0.96)); bt+=S(e.durSec); });
  return bt; }
const SOST=['Fa♯','Do♯','Sol♯','Re♯','La♯','Mi♯','Si♯'], BEM=['Si♭','Mi♭','La♭','Re♭','Sol♭','Do♭','Fa♭'];
/* (30-sep-2026, Iago) en la solución, solo el número y la alteración (sin los nombres de las notas) */
function armaduraHTML(sig){ if(!sig) return '0';
  const n=Math.abs(sig); return n+(sig>0?'♯':'♭'); }
function dibujaToncom(host,T){
  const cp=T.compas.split('/');
  const celda=(k,lab,sol)=>'<div class="tc" data-k="'+k+'"><div class="lab">'+lab+'</div><div class="val"><span class="q">?</span><span class="sol pcg-oc">'+sol+'</span></div></div>';
  host.innerHTML='<div class="pcg-ton">'+celda('ton','Tonalidad',T.tonalidad)+celda('arm','Armadura',armaduraHTML(T.key.sig))+
    celda('com','Compás','<span class="cp"><span>'+cp[0]+'</span><span>'+cp[1]+'</span></span>')+'</div>';
  const c=k=>host.querySelector('.tc[data-k="'+k+'"]');
  return { ton:c('ton'), arm:c('arm'), com:c('com'),
    // (30-sep-2026, Iago) se destaca lo que toca escribir y se oscurece lo demás (null = todo normal)
    foco(ks){ ['ton','arm','com'].forEach(k=>{ const x=c(k), on=!!ks&&ks.indexOf(k)>=0; x.classList.toggle('foco',on); x.classList.toggle('apagada',!!ks&&!on); }); },
    ver(k){ const x=c(k); x.querySelector('.val').classList.add('visto'); x.querySelector('.sol').classList.add('pcg-si'); destello(x,4); } };
}
async function ejToncom(){
  escena(EJS[2]); await pianoListo();
  const T=datosToncom, key={tpc:TONIC_PC[T.key.tonic],mode:T.key.mode,sig:T.key.sig};
  const compas=TON_COMPAS_G[T.compas]||TON_COMPAS_G['2/4'];
  const dict=genTonDictadoG(key,compas,mulberry32(((Number(SEMILLA)||0)*31+7)>>>0));
  ESC.pulso=(compas.comp?1.5:1)*(60/compas.bpm);
  const B=dibujaToncom(ESC.hoja,T);
  // (30-sep-2026, Iago) «iba muy directo»: una guía sencilla al principio de cada parte (es un recordatorio: lo hacen a
  // menudo) y la casilla que toca, destacada. Primero, tonalidad y armadura…
  B.foco(['ton','arm']);
  cartel('Tonalidad y armadura','Escucha el La, la tónica y los acordes: con ellos sacas la tonalidad y la armadura');
  ding(); await espera(3.5);
  let tonM=60; for(let m=60;m<=71;m++) if(m%12===key.tpc){ tonM=m; break; }
  // (30-sep-2026, Iago) «va todo demasiado rápido»: más aire entre el La, la tónica y los acordes
  cartel('La','Nota de referencia'); nota(ahora()+0.05,69,0.95,S(1.8)); await espera(3.0);
  cartel('Tónica',''); nota(ahora()+0.05,tonM,0.95,S(1.8)); await espera(3.0);
  cartel('Acordes tonales','I · IV · V · I'); await espera(0.5);
  const tA=acordesTonales(ahora()+0.05,key,tonM,1.6); await hasta(tA+S(0.8));
  // (30-sep-2026, Iago) 20 s (antes 15) y, mientras, vuelven a sonar el La, la tónica y los acordes
  { const t=ahora(); nota(t+S(1.5),69,0.95,S(1.8)); nota(t+S(4.5),tonM,0.95,S(1.8)); acordesTonales(t+S(7.5),key,tonM,1.6); }
  await escribir(20,'Escribe la tonalidad y la armadura','Otra vez: el La, la tónica y los acordes','Ve contestando');
  // …y después, el compás
  B.foco(['com']);
  await pase('Ahora, céntrate en el compás','Vas a escuchar un dictado completo: fíjate en el acento',t=>tocaTon(t,dict.events),3.5);
  B.foco(null);
  await finEjercicio('Tonalidad, armadura y compás');
  await correccion(()=>{ B.ver('ton'); const t=ahora();
    enTiempo(t+S(1.8),()=>B.ver('arm')); enTiempo(t+S(3.6),()=>B.ver('com')); return 3.7; },10,6);   // (30-sep-2026) 10 s; más pausa entre una solución y otra
}

/* ============================================================================
   4 · ARMÓNICO
   ============================================================================ */
const ARM_INV_G=['E.F.','1ª inv <span class="cifras"><span>6</span></span>','2ª inv <span class="cifras"><span>6</span><span>4</span></span>'];
const TIPO_NOMBRE={PM:'Perfecto mayor',Pm:'Perfecto menor',Aum:'Aumentado',Dis:'Disminuido',D7:'Séptima de dominante'};
function penta(host,W,H){ const VF=Vex.Flow; const box=el('div','pcg-nota'); host.appendChild(box);
  const ren=new VF.Renderer(box,VF.Renderer.Backends.SVG); ren.resize(W,H); return {box,ctx:ren.getContext()}; }
/* un acorde en una x FIJA (así el acorde completo y la nota sola caen en el mismo sitio) */
function acordeEn(ctx,stave,notas,X,clase,colorIdx,color){
  const VF=Vex.Flow;
  const sn=new VF.StaveNote({keys:notas.map(armVexKey),duration:'w',clef:'treble'});
  notas.forEach((n,k)=>{ if(n.acc!==0) sn.addModifier(new VF.Accidental(armAccSym(n.acc)),k); });
  if(colorIdx!=null){ try{ sn.setKeyStyle(colorIdx,{fillStyle:color,strokeStyle:color}); }catch(e){} }
  const v=new VF.Voice({num_beats:4,beat_value:4}); v.setStrict(false); v.addTickables([sn]);
  new VF.Formatter().joinVoices([v]).format([v],80);
  sn.getTickContext().setX(X);
  const g=ctx.openGroup(clase); sn.setStave(stave); sn.setContext(ctx); sn.drawWithStyle(); ctx.closeGroup();
  const a=sn.getNoteHeadBeginX(), b=sn.getNoteHeadEndX();
  return {sn,g,cx:(a+b)/2,x1:a,x2:b,ys:sn.getYs().slice()};
}
function dibujaArmonico(host,a,b){
  const VF=Vex.Flow, morado='#7c3aed';
  host.innerHTML='<div class="pcg-arm">'+
    '<div class="arm-p" id="pcgA1"><div class="cap">Acorde 1 · tipo</div><div class="penta"></div><div class="arm-ops">'+
      ['PM','Pm','Aum','Dis','D7'].map(q=>'<span data-q="'+q+'">'+(q==='D7'?'7D':q)+'</span>').join('')+'</div></div>'+
    '<div class="arm-p" id="pcgA2"><div class="cap">Acorde 2 · tiple · bajo · inversión</div><div class="penta"></div><div class="arm-ops">'+
      ARM_INV_G.map((t,i)=>'<span data-i="'+i+'">'+t+'</span>').join('')+'</div></div></div>';
  const p1=$('#pcgA1',host), p2=$('#pcgA2',host);
  // ---- acorde 1 (30-sep-2026, Iago: recuadro más ancho, opciones en una línea y el acorde y la «?» en el centro)
  const W1=300,H1=160, P1=penta($('.penta',p1),W1,H1);
  const st1=new VF.Stave(4,20,292); st1.addClef('treble'); st1.setContext(P1.ctx).draw();
  const A1=acordeEn(P1.ctx,st1,a.notes,110,'pcga1');
  const dx1=Math.round((W1/2+8-A1.cx)*10)/10; A1.g.setAttribute('transform','translate('+dx1+',0)');
  const svg1=$('svg',P1.box); ajustaSVG(svg1,W1,H1,26,110);
  A1.g.classList.add('pcg-oc');
  const q1=sv('text',{class:'pcg-q pcg-oc pcg-si',x:W1/2+8,y:st1.getYForLine(2)+13,'text-anchor':'middle'},svg1); q1.textContent='?';
  // ---- acorde 2
  const W2=400,H2=170, P2=penta($('.penta',p2),W2,H2);
  const st2=new VF.Stave(4,20,392); st2.addClef('treble'); st2.setContext(P2.ctx).draw();
  const n2=b.notes, mid=n2[1];
  const rl=(n2.find(n=>n.member===0)||n2[0]).letter, iv=ARM_QUAL[b.quality].iv;
  const raiz=(n2.find(n=>n.member===0)||n2[0]).midi;
  let mejor=null;
  [raiz-24,raiz-12,raiz,raiz+12].forEach(r=>{ const top=r+iv[2]; if(r<60||top>81) return; const c=(r+top)/2, c0=(n2[0].midi+n2[2].midi)/2;
    if(!mejor||Math.abs(c-c0)<Math.abs(mejor.c-c0)) mejor={r,c}; });
  const r0=mejor?mejor.r:raiz;
  const ord=[0,1,2].map(k=>armSpell(rl,k,r0+iv[k]));
  const Asol=acordeEn(P2.ctx,st2,[mid],84,'pcga2mid',0,morado);   // (30-sep-2026) un poco más a la derecha: sitio para las etiquetas
  const Afull=acordeEn(P2.ctx,st2,n2,84,'pcga2full',1,morado);
  const Aord=acordeEn(P2.ctx,st2,ord,226,'pcga2ord');
  const svg2=$('svg',P2.box); ajustaSVG(svg2,W2,H2,28,122);
  [Asol.g,Afull.g,Aord.g].forEach(g=>g.classList.add('pcg-oc'));
  // (30-sep-2026, Iago) el texto de cada escucha («Nota central y nota grave»…) a la derecha, en el hueco del pentagrama,
  // mientras todavía no está el paréntesis
  const yP=st2.getYForLine(2), pasoG=sv('g',{class:'pcg-oc'},svg2);
  const pasoT=sv('text',{class:'pcg-paso-t',x:284,y:yP+2,'text-anchor':'middle'},pasoG), pasoN=sv('text',{class:'pcg-paso-n',x:284,y:yP+18,'text-anchor':'middle'},pasoG);
  // paréntesis a la derecha, donde el alumno ordena por terceras
  const yT=st2.getYForLine(0)-22, yB=st2.getYForLine(4)+22, xL=Aord.x1-38, xR=Aord.x2+50;
  const par=sv('g',{class:'pcg-oc'},svg2);
  sv('path',{class:'pcg-paren',d:'M'+xL+' '+yT+' Q'+(xL-18)+' '+((yT+yB)/2)+' '+xL+' '+yB},par);
  sv('path',{class:'pcg-paren',d:'M'+xR+' '+yT+' Q'+(xR+18)+' '+((yT+yB)/2)+' '+xR+' '+yB},par);
  // explicación de la inversión (30-sep-2026, Iago: aprendizaje guiado, por partes). A: el papel de cada nota del acorde
  // ordenado y la que hace de bajo; B: el bajo del acorde del ejercicio. Entre las dos, la nota «viaja» (ver viaja()).
  const explA=sv('g',{class:'pcg-oc'},svg2), explB=sv('g',{class:'pcg-oc'},svg2);
  const ROL=['fund.','3ª','5ª'];
  ord.forEach((n,k)=>{ const t=sv('text',{class:'pcg-rol'+(k===b.inv?' clave':''),x:Aord.x2+17,y:Aord.ys[k]+3.5},explA); t.textContent=ROL[k]; });
  const yb=Afull.ys[0], yo=Aord.ys[b.inv];
  sv('circle',{class:'pcg-anillo',cx:Aord.cx,cy:yo,r:9},explA);
  sv('circle',{class:'pcg-anillo',cx:Afull.cx,cy:yb,r:9},explB);
  const tb=sv('text',{class:'pcg-rol clave',x:Afull.cx,y:Math.min(yb+22,146),'text-anchor':'middle'},explB); tb.textContent='bajo';
  // las tres voces (para guiar la escucha, sin dar la respuesta). (30-sep-2026, Iago) PEGADAS al acorde: cada etiqueta
  // a la izquierda de su nota, con «?» arriba (aguda) y abajo (grave) de la nota central
  const yM=Asol.ys[0], xq=Asol.cx, yA=Math.max(40,yM-17), yG=Math.min(142,yM+18), xe=Asol.x1-(mid.acc!==0?21:7);   // (30-sep-2026) «?» más cerca de la central
  const slots=sv('g',{class:'pcg-oc'},svg2), fila={};
  const ponFila=(k,etq,xE,yE,yQ)=>{ const g=sv('g',{class:'pcg-slot'},slots); fila[k]=g;
    const t=sv('text',{class:'pcg-slot-t',x:xE,y:yE,'text-anchor':'end'},g); t.textContent=etq;
    if(yQ!=null){ const q=sv('text',{class:'pcg-slot-q',x:xq,y:yQ,'text-anchor':'middle'},g); q.textContent='?'; } };
  // (30-sep-2026, Iago) las tres palabras alineadas (mismo borde derecho)
  ponFila(2,'aguda',xe-5,yA+4,yA+9);
  ponFila(1,'central',xe-5,yM+3.8,null);
  ponFila(0,'grave',xe-5,yG+4,yG+9);
  return {
    p1,p2, ops1:$('.arm-ops',p1), ops2:$('.arm-ops',p2), acorde1:A1.g, acorde2:Afull.g, central:Asol.g, parentesis:par, ord,
    // (30-sep-2026) ilumina en morado el acorde 1 entero ('todo'), una de sus notas (0 = la más grave) o ninguna (null)
    luz1(k){ const hs=[...A1.g.querySelectorAll('.vf-notehead')].sort((p,q)=>q.getBBox().y-p.getBBox().y);
      hs.forEach((h,i)=>h.classList.toggle('pcg-luz',k==='todo'||k===i)); },
    activa(n){ p1.classList.toggle('apagado',n!==1); p2.classList.toggle('apagado',n!==2); },
    ok1(){ const s=p1.querySelector('[data-q="'+a.quality+'"]'); s.classList.add('ok'); A1.g.classList.add('pcg-si'); q1.classList.remove('pcg-si'); },
    verCentral(){ Asol.g.classList.add('pcg-si'); },
    verOriginal(){ Afull.g.classList.add('pcg-si'); Asol.g.classList.remove('pcg-si'); },
    verParentesis(){ par.classList.add('pcg-si'); },
    verOrdenado(){ Aord.g.classList.add('pcg-si'); },
    explica(){ explA.classList.add('pcg-si'); explB.classList.add('pcg-si'); },
    explicaRoles(){ explA.classList.add('pcg-si'); },
    explicaBajo(){ explB.classList.add('pcg-si'); },
    // la nota del acorde ordenado que hace de bajo se duplica y baja despacio hasta el bajo del acorde del ejercicio
    viaja(seg){ const hs=[...Aord.g.querySelectorAll('.vf-notehead')].sort((p,q)=>q.getBBox().y-p.getBBox().y), h=hs[b.inv]; if(!h) return;
      const cl=h.cloneNode(true); cl.removeAttribute('id'); cl.classList.add('pcg-luz','pcg-viaja'); svg2.appendChild(cl);
      cl.style.transition='transform '+seg+'s cubic-bezier(.45,0,.25,1)';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{ cl.style.transform='translate('+(Afull.cx-Aord.cx)+'px,'+(yb-yo)+'px)'; })); },
    ok2(){ p2.querySelector('[data-i="'+b.inv+'"]').classList.add('ok'); },
    slots(on){ slots.classList.toggle('pcg-si',!!on); },
    luz(idx){ [0,1,2].forEach(k=>fila[k].classList.toggle('luz',idx.indexOf(k)>=0)); },
    paso(t,nn){ if(!t){ pasoG.classList.remove('pcg-si'); return; } pasoT.textContent=t; pasoN.textContent=nn||''; pasoG.classList.add('pcg-si'); },
    parpadea(n,on){ (n===1?p1:p2).querySelector('.arm-ops').classList.toggle('parpadea',!!on); },
  };
}
async function ejArmonico(){
  escena(EJS[3]); await pianoListo();
  const a=datosArmonico.a, b=datosArmonico.b;
  const A=dibujaArmonico(ESC.hoja,a,b);
  const m1=a.notes.map(n=>n.midi), m2=b.notes.map(n=>n.midi);
  // ---------- ACORDE 1 · tipo
  A.activa(1);
  cartel('Acorde 1','Indica qué tipo de acorde vas a escuchar');   // (30-sep-2026, Iago) guía al principio
  await espera(2.3);
  ding(); cartel('Acorde 1','Escucha: primero el acorde y después el arpegio'); await espera(1.2);   // (30-sep-2026) sin «plaqué»
  let t=ahora()+0.1; bloque(t,m1,2.4); await hasta(t+S(3.1));
  t=ahora()+0.05; await hasta(arpegio(t,m1,0.7,1.3)+S(0.5));
  A.parpadea(1,true);   // (30-sep-2026, Iago) mientras piensan, las opciones parpadean
  await escribir(10,'¿Qué tipo de acorde es?','Rodéalo en tu libreta: PM · Pm · Aum · Dis · 7D');
  A.parpadea(1,false);
  // (30-sep-2026) sin flecha de «Solución» (señalaba justo la 7D): se ilumina la opción buena
  // (30-sep-2026, Iago) suena el acorde iluminado en morado y después se arpegia, iluminando cada nota
  A.ok1(); A.luz1('todo'); bloque(ahora()+0.05,m1,2.0);
  cartel(TIPO_NOMBRE[a.quality]||a.label,'Solución');
  await espera(2.0); A.luz1(null);
  { const arr=m1.slice().sort((p,q)=>p-q); await hasta(arpegio(ahora()+0.1,arr,0.7,1.2,0.7,i=>A.luz1(i))+S(0.3)); }
  A.luz1(null); await espera(0.3);
  let g;
  // ---------- ACORDE 2 · tiple, bajo e inversión
  A.activa(2);
  cartel('Acorde 2','Escribe la nota aguda y la grave; después, la inversión');   // (30-sep-2026, Iago) guía al principio
  await espera(2.3);
  // (30-sep-2026, Iago) primero solo «Escríbela», a la derecha de la nota con la flecha hacia la izquierda…
  A.verCentral(); g=await aviso(A.central,'Escríbela','der'); nota(ahora()+0.05,m2[1],0.95,S(2.2));
  cartel('Nota central: '+b.dada,'Escríbela en el pentagrama');
  await espera(5); g.quitar();
  // …y después, lo que tienen que adivinar: la aguda y la grave
  A.slots(true); A.luz([]); await espera(0.6);
  const PASOS=[
    {t:'Acorde completo',f:tt=>{ A.luz([0,1,2]); return bloque(tt,m2,1.7); }},
    {t:'Arpegiado',f:tt=>arpegio(tt,m2,0.62,1.2,0.7,i=>A.luz([i]))},
    {t:'Nota central y nota grave',f:tt=>{ A.luz([0,1]); return bloque(tt,[m2[0],m2[1]],1.7); }},
    {t:'Las dos, arpegiadas',f:tt=>arpegio(tt,[m2[0],m2[1]],0.7,1.2,0.7,i=>A.luz([i]))},
    {t:'Nota central y nota aguda',f:tt=>{ A.luz([1,2]); return bloque(tt,[m2[1],m2[2]],1.7); }},
    {t:'Las dos, arpegiadas',f:tt=>arpegio(tt,[m2[1],m2[2]],0.7,1.2,0.7,i=>A.luz([i+1]))},
    {t:'Acorde completo',f:tt=>{ A.luz([0,1,2]); return bloque(tt,m2,1.7); }},
    {t:'Arpegiado',f:tt=>arpegio(tt,m2,0.62,1.2,0.7,i=>A.luz([i]))},
  ];
  cartel('Acorde 2','Escucha y escribe la nota aguda y la grave');
  for(let i=0;i<PASOS.length;i++){ A.paso(PASOS[i].t,(i+1)+' de '+PASOS.length); const tf=PASOS[i].f(ahora()+0.12); await hasta(tf+S(0.55)); A.luz([]); }
  A.paso(null);
  await escribir(10,'Escribe la nota aguda y la grave');
  A.slots(false);
  A.verParentesis();
  g=await aviso(A.parentesis,'Ordena tu acorde aquí','arriba');
  await escribir(15,'Ordena tu acorde por terceras','Dentro del paréntesis');   // (30-sep-2026, Iago) 15 s (antes 12)
  g.quitar();
  // (30-sep-2026, Iago) guía clara antes de decidir: dos carteles a pantalla completa; después, sin nada que tape los
  // acordes, las tres opciones parpadeando abajo y la nota del bajo (la «grave») iluminada
  const PZ=pantallazo('Ahora que ya sabes cómo es el acorde ordenado<br>y cómo es el acorde del ejercicio…'); await espera(3.0);
  PZ.cambia('Decide en qué estado está','(fíjate en la nota del bajo)'); await espera(2.8); PZ.quitar();
  A.slots(true); A.luz([0]);
  cartel('¿En qué estado está?','Fíjate en la nota del bajo · rodéalo en tu libreta');
  A.parpadea(2,true);
  await espera(4.5);
  A.parpadea(2,false); A.luz([]); A.slots(false);
  await finEjercicio('Tiple, bajo e inversión');
  const INV=['Estado fundamental','1ª inversión','2ª inversión'], ROLN=['la fundamental','la tercera','la quinta'];
  // (30-sep-2026, Iago) aprendizaje guiado, en los mismos 20 s: el acorde del ejercicio → el acorde ordenado → la nota del
  // ordenado que hace de bajo se duplica y baja despacio hasta el bajo → «El bajo es la … del acorde» → «Por lo tanto, el
  // acorde está en…» → solución marcada, y quedan unos 4 s
  await correccion(()=>{ const t0=ahora();
    A.verOriginal(); bloque(t0+0.05,m2,2.0);
    enTiempo(t0+S(2.3),()=>{ A.verOrdenado(); });
    arpegio(t0+S(2.3),A.ord.map(n=>n.midi),0.5,1.0);
    enTiempo(t0+S(5.0),()=>{ A.explicaRoles(); });
    enTiempo(t0+S(6.3),()=>{ A.viaja(S(2.6)); });
    nota(t0+S(8.9),m2[0],0.8,S(1.2));
    enTiempo(t0+S(9.0),()=>{ A.explicaBajo(); cartel('El bajo es '+ROLN[b.inv]+' del acorde','Tiple: '+b.tiple+' · Bajo: '+b.bajo); });
    enTiempo(t0+S(12.6),()=>{ cartel('Por lo tanto, el acorde está en…',''); });
    enTiempo(t0+S(15.4),()=>{ A.ok2(); cartel(INV[b.inv],'El bajo ('+b.bajo+') es '+ROLN[b.inv]+' del acorde'); bloque(ahora()+0.05,m2,1.8); });
    return 16.2; },20,3.8);
}

/* ============================================================================
   ★ BONUS TRACK · CADENCIA (sin escribir nada: se ve, suena, pistas, 4 opciones, 15 s y solución)
   ============================================================================ */
function dibujaBonus(host,gen){
  host.innerHTML='<div class="pcg-bon"><div class="bon-part"></div><div class="bon-ops pcg-oc">'+
    ['autentica','plagal','semicadencia','rota'].map(id=>CAD4.find(c=>c.id===id)).map(c=>'<div class="op" data-id="'+c.id+'"><b>'+c.nom+'</b><span>'+c.rn+'</span></div>').join('')+'</div></div>';   // mismo orden que el letrero
  const VF=Vex.Flow, box=el('div','pcg-nota'); $('.bon-part',host).appendChild(box);
  const W=700,H=262;
  const ren=new VF.Renderer(box,VF.Renderer.Backends.SVG); ren.resize(W,H); const ctx=ren.getContext();
  const top=new VF.Stave(10,14,W-20), bot=new VF.Stave(10,124,W-20);
  top.addClef('treble').addKeySignature(gen.vexKey); bot.addClef('bass').addKeySignature(gen.vexKey);
  top.setEndBarType(VF.Barline.type.END); bot.setEndBarType(VF.Barline.type.END);
  const hlG=ctx.openGroup('pcgcadhl'); ctx.closeGroup();
  top.setContext(ctx).draw(); bot.setContext(ctx).draw();
  new VF.StaveConnector(top,bot).setType(VF.StaveConnector.type.BRACE).setContext(ctx).draw();
  new VF.StaveConnector(top,bot).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
  // deletreo diatónico (como el PRO): la sensible como alteración de su grado
  const LT=['c','d','e','f','g','a','b'], LPC={c:0,d:2,e:4,f:5,g:7,a:9,b:11}, SH=['f','c','g','d','a','e','b'], FL=['b','e','a','d','g','c','f'];
  const sigAcc=L=>gen.sharps>0?(SH.slice(0,gen.sharps).includes(L)?'#':''):(gen.sharps<0?(FL.slice(0,-gen.sharps).includes(L)?'b':''):'');
  const spell=m=>{ const pc=((m%12)+12)%12, oct=Math.floor(m/12)-1, st=LT.indexOf(gen.tonica[0].toLowerCase()), ord=[]; for(let i=0;i<7;i++) ord.push(LT[(st+i)%7]);
    const dp=L=>{ const sa=sigAcc(L); return {sa,p:((LPC[L]+(sa==='#'?1:sa==='b'?-1:0))%12+12)%12}; };
    for(const L of ord){ const d=dp(L); if(d.p===pc) return {L,acc:d.sa,key:L+d.sa+'/'+oct}; }
    for(const L of ord){ const d=dp(L); if((d.p+1)%12===pc){ const na=d.sa===''?'#':(d.sa==='b'?'n':'##'); return {L,acc:na,key:L+(na==='n'?'':na)+'/'+oct}; } }
    for(const L of ord){ const d=dp(L); if((d.p+11)%12===pc){ const na=d.sa===''?'b':(d.sa==='#'?'n':'bb'); return {L,acc:na,key:L+(na==='n'?'':na)+'/'+oct}; } }
    return {L:'c',acc:'',key:'c/'+oct}; };
  const dur=q=>q>=4?'w':(q>=2?'h':'q'), N=gen.ev.length;
  const voz=(v,clef,dir)=>gen.ev.map((e,i)=>{ const sp=spell(e.midi[v]);
    const sn=new VF.StaveNote({clef,keys:[sp.key],duration:dur(e.q),stem_direction:dir});
    if(sp.acc!==sigAcc(sp.L)){ try{ sn.addModifier(new VF.Accidental(sp.acc===''?'n':sp.acc),0); }catch(err){} }
    sn.setAttribute('id','pcgcad'+v+'x'+i); return sn; });
  const nS=voz(0,'treble',1), nA=voz(1,'treble',-1), nT=voz(2,'bass',1), nB=voz(3,'bass',-1);
  const V=arr=>{ const v=new VF.Voice({num_beats:1,beat_value:4}).setMode(VF.Voice.Mode.SOFT); v.addTickables(arr); return v; };
  const vS=V(nS),vA=V(nA),vT=V(nT),vB=V(nB);
  new VF.Formatter().joinVoices([vS]).joinVoices([vA]).joinVoices([vT]).joinVoices([vB]).format([vS,vA,vT,vB],W-150);
  vS.draw(ctx,top); vA.draw(ctx,top); vT.draw(ctx,bot); vB.draw(ctx,bot);
  const svg=$('svg',box); ajustaSVG(svg,W,H);
  const xs=nS.map(sn=>sn.getAbsoluteX()), yTop=top.getYForLine(0)-18, yBot=bot.getYForLine(4)+18;
  const hl=sv('rect',{class:'pcg-cadhl',x:0,y:yTop,width:10,height:yBot-yTop,rx:10},hlG);
  const anchoDe=i=>(i+1<N?xs[i+1]:W-14)-xs[i];
  // los BAJOS de los dos últimos acordes: anillo naranja (la pista señala desde abajo)
  // (30-sep-2026, Iago) «fíjate en el bajo»: el bajo de los dos últimos acordes se ilumina en AMARILLO (un círculo por
  // DETRÁS de la nota, en el grupo de fondo, para que la nota se siga leyendo); sin flechas
  const gBaj=sv('g',{class:'pcg-oc'},hlG); let bx0=1e9,bx1=-1e9,by0=1e9,by1=-1e9;
  [N-2,N-1].forEach(i=>{ const sn=nB[i], cx=(sn.getNoteHeadBeginX()+sn.getNoteHeadEndX())/2, cy=sn.getYs()[0];
    sv('ellipse',{class:'pcg-bajoluz',cx:cx,cy:cy,rx:14,ry:12},gBaj);
    bx0=Math.min(bx0,cx-12); bx1=Math.max(bx1,cx+12); by0=Math.min(by0,cy-10); by1=Math.max(by1,cy+10); });
  const ult=sv('rect',{x:bx0,y:by0,width:bx1-bx0,height:by1-by0,fill:'none',stroke:'none'},svg);
  // (30-sep-2026, Iago) marco amarillo opaco, de esquinas redondeadas, alrededor de los dos últimos acordes (lo principal)
  const mx0=xs[N-2]-26, mx1=W-16, marco=sv('rect',{class:'pcg-oc pcg-cadmarco',x:mx0,y:yTop-6,width:mx1-mx0,height:(yBot+6)-(yTop-6),rx:12},svg);
  const gRn=sv('g',{class:'pcg-oc'},svg);
  [N-2,N-1].forEach((i,k)=>{ const t=sv('text',{class:'pcg-cadrn',x:xs[i]+6,y:yBot+29,'text-anchor':'middle'},gRn); t.textContent=gen.gr[k]; });
  const ton=el('div','bon-ton pcg-oc','Tonalidad: <b>'+gen.tonalidad+'</b>'); $('.pcg-bon',host).appendChild(ton);
  return { ultimos:ult, marco(){ marco.classList.add('pcg-si'); }, bajos(on){ gBaj.classList.toggle('pcg-si',!!on); },
    verTonalidad(quieta){ ton.classList.add('pcg-si'); if(!quieta) destello(ton,6); },
    // (30-sep-2026, Iago) «¿A qué te suena?»: las cuatro cadencias explicadas, en un letrero oscuro sobre la parte del
    // pentagrama que ahora no importa (los primeros acordes), con el título en amarillo
    letrero(on){ if(!on){ const l=this._l; this._l=null; if(l){ l.classList.remove('on'); setTimeout(()=>l.remove(),500); } return; }
      const rs=rectEsc(svg), rm=rectEsc(marco), x0=rs.x+6, x1=rm.x-18;
      const l=el('div','pcg-bonlet','<div class="tit">¿A qué te suena?</div>'+
        [['Cadencia auténtica','final conclusivo'],['Cadencia plagal','final suave'],['Semicadencia','final sin terminar'],['Cadencia rota','final inesperado']]
          .map(o=>'<div class="fila"><b>'+o[0]+'</b><span>'+o[1]+'</span></div>').join(''));
      l.style.left=x0+'px'; l.style.width=Math.max(460,x1-x0)+'px'; l.style.top=(rm.y+rm.h/2)+'px';
      ESC.capa.appendChild(l);
      { const rt=rectEsc(ton), hh=l.offsetHeight; let cy=rm.y+rm.h/2; if(cy-hh/2<rt.y+rt.h+10) cy=rt.y+rt.h+10+hh/2; l.style.top=cy+'px'; }   // sin tapar «Tonalidad»
      requestAnimationFrame(()=>l.classList.add('on')); this._l=l; },
    verGrados(){ gRn.classList.add('pcg-si'); },
    marca(i){ if(i<0){ hl.classList.remove('on'); return; } hl.setAttribute('x',xs[i]-12); hl.setAttribute('width',Math.max(34,anchoDe(i)-4)); hl.classList.add('on'); },
    verOpciones(){ $('.bon-ops',host).classList.add('pcg-si'); },
    solucion(){ $('.bon-ops .op[data-id="'+gen.id+'"]',host).classList.add('ok');
      host.querySelectorAll('.bon-ops .op:not(.ok)').forEach(o=>o.classList.add('no'));
      [N-2,N-1].forEach(i=>[0,1,2,3].forEach(v=>{ const g=svg.querySelector('#vf-pcgcad'+v+'x'+i); if(g) g.classList.add('pcg-cadfin'); }));
      gRn.classList.add('pcg-si'); ton.classList.add('pcg-si'); } };
}
function tocaCadencia(t0,gen,B,desde){
  const spb=60/84; let q=0; desde=desde||0;
  gen.ev.forEach((e,i)=>{ if(i<desde){ return; } const t=t0+S(q*spb); e.midi.forEach((m,v)=>nota(t,m,v===0?0.7:0.55,S(e.q*spb*0.98))); if(B) enTiempo(t,()=>B.marca(i)); q+=e.q; });
  const tf=t0+S(q*spb); if(B) enTiempo(tf,()=>B.marca(-1)); return tf;
}
async function ejBonus(){
  escena(BONUS); await pianoListo();
  const gen=cadenciaDe(SEMILLA);
  const B=dibujaBonus(ESC.hoja,gen);
  // (30-sep-2026, Iago) la tonalidad, a la vista desde el principio y sin llamar la atención
  B.verTonalidad(true);
  cartel('¿Qué cadencia es?','Bonus: no hay que escribir nada, solo escuchar y pensar');
  await espera(2.0);
  cartel('Escucha la cadencia',''); B.marco(); await espera(1.2);   // sin campanita; el marco, desde que empieza a sonar
  await hasta(tocaCadencia(ahora()+0.1,gen,B)+S(0.8));
  // «¿A qué te suena?»: las cuatro, explicadas, unos segundos
  cartel('',''); B.letrero(true); await espera(7); B.letrero(false); await espera(0.5);
  // otra vez y, después, las pistas: el bajo en amarillo, las opciones con sus grados y a pensar
  cartel('Escúchala otra vez',''); await espera(0.8);
  await hasta(tocaCadencia(ahora()+0.1,gen,B)+S(0.6));
  B.bajos(true); cartel('Fíjate en el bajo','¿Qué grados son?'); await espera(2.8);
  B.verOpciones(); await espera(2.5);
  await escribir(8,'Define tu respuesta','Piensa: ¿cuál es tu respuesta?');
  B.bajos(false); B.solucion(); cartel(gen.titulo+' · '+gen.rn,gen.expl);
  await espera(0.6);
  await hasta(tocaCadencia(ahora()+0.1,gen,B,gen.ev.length-2)+S(0.8));
  await espera(3);
}

/* ============================================================================
   PORTADA · PASO DE EJERCICIO · CRÉDITOS
   ============================================================================ */
function fechaBonita(iso){ const d=new Date(iso); if(!iso||isNaN(d)) return '—';
  const hh=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'), hoy=new Date(), ayer=new Date(); ayer.setDate(hoy.getDate()-1);
  if(d.toDateString()===hoy.toDateString()) return 'hoy a las '+hh;
  if(d.toDateString()===ayer.toDateString()) return 'ayer a las '+hh;
  const M=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return d.getDate()+' de '+M[d.getMonth()]+' a las '+hh; }
function leerSemilla(){
  if(SEM_FORZADA!=null) return Promise.resolve({semilla:SEM_FORZADA,en:new Date().toISOString()});
  return fetch(PC_SB+'/rest/v1/app_config?select=value&key=eq.'+PC_CLAVE,{cache:'no-store',headers:{apikey:PC_SB_KEY,Authorization:'Bearer '+PC_SB_KEY}})
    .then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.json(); })
    .then(f=>{ const v=(f&&f[0]&&f[0].value)||null, n=v?Number(v.semilla):NaN; return Number.isFinite(n)?{semilla:n,en:v.en||null}:null; });
}
function pintaUltimo(){ const u=$('#pcgUltimo'), b=$('#pcgEmpezar'); if(!u) return;
  if(ULTIMO){ u.innerHTML='Último generado: '+fechaBonita(ULTIMO.en)+'<small id="pcgPiano"></small>'; if(b) b.disabled=false; }
  else if(ULTIMO_ERR){ u.innerHTML='No he podido leer el carrusel del iPad. Comprueba la conexión.<small id="pcgPiano"></small>'; }
  else u.innerHTML='Todavía no hay ningún carrusel generado en el iPad.<small id="pcgPiano"></small>';
  pintaPiano(); }
function pintaPiano(){ const p=$('#pcgPiano'); if(!p) return;
  p.textContent=(PIANO_EST==='listo'?'♪ piano listo':(PIANO_EST==='error'?'♪ sin piano de muestras (usaré uno sintético)':'♪ cargando el piano…'))+durTexto(); }
/* (30-sep-2026, Iago) «a la derecha de donde pone piano listo, la duración total en minutos, así tengo una referencia».
   Desde «Empezar» hasta los créditos, con el minuto de preparación. Con la semilla del iPad se generan los mismos
   ejercicios que al empezar; cambia de un carrusel a otro lo que dura el ritmo, el dictado del TonCom, el acorde 1 y la
   cadencia; el resto es fijo (DUR_FIJA, medido con el reloj del audio en carruseles de prueba). */
const DUR_FIJA=550.7, DUR_CACHE={};   // medido: semillas 6, 424242 y 1 (con los recortes de 30-sep)
function duracionCarrusel(sem){
  if(sem==null) return null; if(sem in DUR_CACHE) return DUR_CACHE[sem];
  let tot=null;
  try{
    renderConSemilla(sem);   // los mismos datos que se generan al pulsar «Empezar»
    const M=modeloRitmo(), R=M.totalQ*M.spq, pr=M.spq*M.beatQ;
    const nCel=M.spec.compound?CELLS_COMPOUND.facil.length+CELLS_COMPOUND.medio.length+CELLS_COMPOUND.dificil.length+1:CELLS_SIMPLE.facil.length+CELLS_SIMPLE.medio.length;
    const nube=Math.max(5.5,0.5+nCel*0.33+1.7+0.1);
    const T=datosToncom, key={tpc:TONIC_PC[T.key.tonic],mode:T.key.mode,sig:T.key.sig}, cps=TON_COMPAS_G[T.compas]||TON_COMPAS_G['2/4'];
    const dict=genTonDictadoG(key,cps,mulberry32(((Number(sem)||0)*31+7)>>>0));
    const Dt=dict.events.reduce((a,e)=>a+e.durSec,0), pt=(cps.comp?1.5:1)*(60/cps.bpm);
    const n1=datosArmonico.a.notes.length;
    const cad=cadenciaDe(sem), spb=60/84, qs=cad.ev.map(e=>e.q), C=qs.reduce((a,b)=>a+b,0)*spb, C2=(qs[qs.length-2]+qs[qs.length-1])*spb;
    tot=DUR_FIJA+2*(5*pr+R)+Math.max(20,Math.ceil(R+0.4+8))+nube+5*pt+Dt+1.4*(n1-1)+2*C+C2;
    if(!Number.isFinite(tot)) tot=null;
  }catch(e){ console.warn('[guiado] duración',e); tot=null; }
  DUR_CACHE[sem]=tot; return tot;
}
function durTexto(){ const d=ULTIMO?duracionCarrusel(ULTIMO.semilla):null; if(!d) return '';
  const t=Math.round(d/10)*10, m=Math.floor(t/60), s=t%60; return '  ·  Duración total: '+m+' min'+(s?' '+s+' s':''); }
function refrescar(){ leerSemilla().then(v=>{ ULTIMO=v; ULTIMO_ERR=false; pintaUltimo(); }).catch(()=>{ if(!ULTIMO){ ULTIMO_ERR=true; pintaUltimo(); } }); }
function portada(){
  MODO='portada'; ESC=null; ROOT.classList.add('en-portada'); ROOT.classList.remove('quieto');
  fondo('multi'); STAGE.innerHTML='';
  const p=el('div','pcg-portada');
  p.innerHTML='<div class="pcg-logo">'+logoSVG('pcgLg1')+'</div>'+
    '<h1 class="pcg-titulo"><span class="pd"><span class="pre">Pre</span><span class="dict">Dict</span></span><span class="carr">Carrusel</span></h1>'+
    '<div class="pcg-kick">Grado Elemental · trabajo auditivo de clase</div>'+
    '<button class="pcg-empezar" id="pcgEmpezar"><span class="dot"></span>Empezar carrusel</button>'+
    '<div class="pcg-ultimo" id="pcgUltimo">Buscando el último carrusel del iPad…<small id="pcgPiano"></small></div>';
  STAGE.appendChild(p);
  // (30-sep-2026, Iago) «Pantalla completa», arriba a la derecha y discreto, como en las otras apps (no debajo de «Empezar»)
  const bpc=el('button','pcg-pcmini',ICO.pc); bpc.id='pcgPC'; bpc.title='Pantalla completa'; bpc.setAttribute('aria-label','Pantalla completa'); STAGE.appendChild(bpc);
  $('#pcgEmpezar').onclick=empezar;
  bpc.onclick=e=>{ e.currentTarget.blur(); pantallaCompleta(true); };
  pintaPC(); vigila();
  if(ULTIMO) pintaUltimo(); else pintaPiano();
  refrescar(); clearInterval(SONDEO); SONDEO=setInterval(()=>{ if(MODO==='portada') refrescar(); },20000);
  cargarPiano();
}
function pantallaCompleta(alternar){
  const de=document.documentElement;
  try{ if(!enPC()){ const f=de.requestFullscreen||de.webkitRequestFullscreen; if(f){ const r=f.call(de); if(r&&r.catch) r.catch(()=>{}); } }
       else if(alternar){ const x=document.exitFullscreen||document.webkitExitFullscreen; if(x){ const r=x.call(document); if(r&&r.catch) r.catch(()=>{}); } } }catch(e){}
  setTimeout(pintaPC,400);
}
/* (30-sep-2026) Si este ordenador no mueve la portada con soltura, el remolino de fondo se queda quieto (el logo sigue
   girando). Se mide cuando ya ha cargado el piano (mientras carga, cualquier ordenador va a saltos). */
let LIGERO=false, VIGILANDO=false;
(function(){ const q=QS.get('ligero'); try{ if(q==='0') localStorage.removeItem('pcg_ligero'); else if(q==='1'||localStorage.getItem('pcg_ligero')==='1') LIGERO=true; }catch(e){ if(q==='1') LIGERO=true; } })();
function vigila(){
  if(LIGERO&&ROOT) ROOT.classList.add('ligero');
  if(LIGERO||VIGILANDO) return; VIGILANDO=true;
  let prev=performance.now(), n=0, lentos=0, desde=0;
  function f(now){
    if(MODO!=='portada'&&MODO!=='fin'){ VIGILANDO=false; return; }
    if(PIANO_EST==='cargando'||PIANO_EST==='nada'||document.hidden){ desde=0; prev=now; requestAnimationFrame(f); return; }
    if(!desde) desde=now+800;
    const d=now-prev; prev=now;
    if(now>desde){ n++; if(d>34) lentos++; }
    if(n<90) requestAnimationFrame(f);
    else { VIGILANDO=false; if(lentos/n>0.3){ LIGERO=true; ROOT.classList.add('ligero'); try{ localStorage.setItem('pcg_ligero','1'); }catch(e){} console.info('[guiado] portada en modo ligero'); } }
  }
  requestAnimationFrame(f);
}
/* (30-sep-2026, Iago) al pulsar «Empezar carrusel»: un minuto para coger el material (→ o «Siguiente» lo salta) */
async function preparacion(){
  EJ_ACT=-1; ESC=null; fondo('multi'); STAGE.innerHTML='';
  const p=el('div','pcg-prep');
  p.innerHTML='<div class="t">El carrusel empezará en…</div><div class="reloj">1:00</div>'+
    '<div class="sub">Coge tu libro, lápiz y goma antes de que se acabe el tiempo</div>';
  STAGE.appendChild(p);
  const r=$('.reloj',p), t0=ahora(), N=60;
  for(let k=1;k<=N;k++){ await hasta(t0+S(k)); const q=N-k; r.textContent=Math.floor(q/60)+':'+String(q%60).padStart(2,'0'); }
  await espera(0.5);
}
async function empezar(){
  const b=$('#pcgEmpezar'); if(!b||b.disabled) return; b.disabled=true; b.blur();
  ac(); try{ AC.resume(); }catch(e){}
  pantallaCompleta(false);
  try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').catch(()=>{}); }catch(e){}
  cargarPiano();
  let v=null; try{ v=await leerSemilla(); }catch(e){ v=ULTIMO; }
  if(!v){ ULTIMO_ERR=!ULTIMO; b.disabled=false; pintaUltimo(); return; }
  ULTIMO=v; SEMILLA=v.semilla;
  try{ renderConSemilla(SEMILLA); }catch(e){ console.error('[guiado] renderConSemilla',e); }
  MODO='carrusel'; ROOT.classList.remove('en-portada');
  carrusel(PREP?-1:EJ0);
}
async function transicion(i){
  const E=(i<4)?EJS[i]:BONUS; EJ_ACT=i; ESC=null; colores(E);
  STAGE.innerHTML='';
  // el «bioma» del ejercicio se abre desde el centro (solo aquí hay color fuerte y movimiento)
  const bio=el('canvas','pcg-bioma'); bio.width=bio.height=400; pintaBioma(bio,E);   // (30-sep-2026) lienzo pequeño: ligero
  $('.pcg-fondos',ROOT).appendChild(bio);
  void bio.offsetWidth; bio.classList.add('va');
  try{ const ts=ahora()+0.05; soplo(ts); firmaApartado(E.k,ts+S(0.55)); }catch(e){ console.warn('[guiado] sonido de portada',e); }   // (30-sep-2026) sonido de portada
  fondo(E.k);
  const t=el('div','pcg-trans');
  t.innerHTML='<div class="ico">'+espiral('#fff',E.n)+'</div><div class="lin">'+(i<4?'EJERCICIO '+E.n:'BONUS EXTRA')+' · <b>'+E.nombre+'</b></div>'+
    '<div class="pasos">'+EJS.concat([BONUS]).map((e,j)=>'<i class="'+(j<i?'hecho':(j===i?'act':''))+(j===4?' estrella':'')+'"></i>').join('')+'</div>';
  STAGE.appendChild(t);
  try{ await espera(2.4); t.classList.add('fuera'); await espera(0.4); }   // (30-sep-2026) más corta: el carrusel entero, por debajo de 11:20
  finally{ setTimeout(()=>bio.remove(),900); }
}
function creditos(){
  MODO='fin'; ESC=null; fondo('multi'); STAGE.innerHTML=''; ROOT.classList.remove('quieto'); ROOT.classList.add('en-portada');
  const c=el('div','pcg-portada pcg-fin');
  c.innerHTML='<div class="pcg-logo">'+logoSVG('pcgLg2')+'</div>'+
    '<h1 class="pcg-titulo"><span class="pd"><span class="pre">Pre</span><span class="dict">Dict</span></span><span class="carr">Carrusel</span></h1>'+
    '<div class="pcg-kick">¡Carrusel completado!</div>'+
    '<div class="pasos4">'+EJS.map(e=>'<i style="--c:'+e.c+'"></i>').join('')+
      '<i class="estrella" title="Bonus extra"><svg viewBox="0 0 24 24"><path d="M12 1.8l3 6.5 7.1.8-5.3 4.8 1.5 7L12 17.3l-6.3 3.6 1.5-7L1.9 9.1 9 8.3z"/></svg></i></div>'+   // (30-sep-2026) el bonus, en estrella
    '<button class="pcg-volver" id="pcgVolver">Volver a la portada</button>';
  STAGE.appendChild(c);
  $('#pcgVolver').onclick=aPortada; vigila();
}
const EJF=[ejRitmico,ejMelodico,ejToncom,ejArmonico,ejBonus];
async function carrusel(desde){
  const run=++RUN; let i=desde;
  while(run===RUN){
    if(i<-1) return;
    if(i>=5){ creditos(); return; }
    try{ if(i===-1) await preparacion(); else { await transicion(i); await EJF[i](); } i++; }
    catch(e){
      if(run!==RUN) return;
      if(e===SALTO){ i=(SIG!=null)?SIG:i+1; SIG=null; }
      else { console.error('[guiado]',e); i++; }
    }
  }
}
function siguiente(){ if(MODO!=='carrusel') return; SIG=EJ_ACT+1; if(PAUSA) pausa(false); cortar(); }
function repetir(){ if(MODO!=='carrusel') return; SIG=EJ_ACT; if(PAUSA) pausa(false); cortar(); }
function aPortada(){ RUN++; SIG=null; if(PAUSA) pausa(false); cortar(); portada(); }
function teclas(e){
  const k=e.key;
  if(k===' '||e.code==='Space'){ e.preventDefault(); if(MODO==='carrusel') pausa(); else if(MODO==='portada') empezar(); }
  else if(k==='ArrowRight'||k==='PageDown'){ if(MODO==='carrusel'){ e.preventDefault(); siguiente(); } }
  else if(k==='ArrowLeft'||k==='PageUp'){ if(MODO==='carrusel'){ e.preventDefault(); repetir(); } }
  else if(k==='f'||k==='F'){ pantallaCompleta(true); }
}

/* ---------------- arranque: lo llama abrirPantalla() de index.html ---------------- */
let abierto=false;
function abrir(){ if(abierto) return; abierto=true; montar(); portada(); }
window.PCGuiado={abrir, duracion:s=>duracionCarrusel(s), estado:()=>({modo:MODO,ejercicio:EJ_ACT,piano:PIANO_EST,semilla:SEMILLA,pausa:PAUSA,vel:VEL,t:AC?AC.currentTime:0,ligero:LIGERO})};
})();
