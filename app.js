(function(){
'use strict';
const D = window.UHR;
const app = document.getElementById('app');
const KEY = 'uhrmacher_v1';

/* ---------- Speicher (nur im eigenen Browser) ---------- */
let mem = {};
function load(){ try{ mem = JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ mem = mem || {}; } mem.codes = mem.codes || {}; return mem; }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(mem)); }catch(e){} }
load();

/* ---------- Hilfsfunktionen ---------- */
function norm(s){
  return String(s||'').toUpperCase().replace(/Ä/g,'AE').replace(/Ö/g,'OE').replace(/Ü/g,'UE').replace(/ß/g,'SS')
    .normalize('NFKD').replace(/[^A-Z0-9|]/g,'');
}
function b64d(s){ const b = atob(s), u = new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
async function dec(key, e){
  try{
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(norm(key)), 'PBKDF2', false, ['deriveKey']);
    const k = await crypto.subtle.deriveKey({name:'PBKDF2', salt:b64d(e.s), iterations:D.iter, hash:'SHA-256'}, km, {name:'AES-GCM', length:256}, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv:b64d(e.i)}, k, b64d(e.c));
    return JSON.parse(new TextDecoder().decode(pt));
  }catch(err){ return null; }
}
function unobf(s){ const b = b64d(s); for(let i=0;i<b.length;i++) b[i] ^= (i*7+23)%256; return new TextDecoder().decode(b); }
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function h(html){ app.innerHTML = html; window.scrollTo(0,0); }
/* ---------- Geräusche ---------- */
const SFX = {};
['schloss','buch','gong','falsch','piep'].forEach(n => { try{ SFX[n] = new Audio('a/s_'+n+'.mp3'); SFX[n].preload = 'auto'; }catch(e){} });
function primeSfx(){ // iOS: Töne beim Tippen freischalten
  Object.values(SFX).forEach(a => { try{ a.muted = true; const p = a.play(); if(p) p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; }); }catch(e){} });
}
function sfx(n){ const a = SFX[n]; if(!a) return; try{ a.muted = false; a.currentTime = 0; a.play().catch(()=>{}); }catch(e){} }
const STEP_SFX = {1:'schloss', 2:'buch', 3:'piep'};
function shake(el){ el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

/* ---------- Router ---------- */
const routes = {'':home, 'kunden':kunden, 'anrufbeantworter':ab, 'terminal':terminal, 'finale':finale, 'wissen':wissen, 'datenschutz':datenschutz};
function route(){
  const r = (location.hash.replace(/^#\/?/,'').split('?')[0]) || '';
  document.body.classList.toggle('term', ['terminal','finale','wissen'].includes(r));
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/'+r));
  (routes[r] || home)();
}
window.addEventListener('hashchange', route);

/* ---------- Startseite ---------- */
function home(){
  h(`
  <section class="hero" style="background-image:url(img/hero.jpg)">
    <div class="cap"><h1>Uhrmacherei Albrecht &amp; Sohn</h1><p>Meisterbetrieb in dritter Generation · Reparatur, Restaurierung und Verkauf feiner Uhren</p></div>
  </section>
  <div class="wrap">
    <div class="grid2">
      <div>
        <h2>Willkommen in unserer Werkstatt</h2>
        <p>Seit 1921 schlägt am Marktplatz von Kronstein das Herz der Uhrmacherei Albrecht. Gegründet von Wilhelm Albrecht, weitergeführt von seinem Sohn Friedrich und heute geleitet von Uhrmachermeister Konrad Albrecht, reparieren und restaurieren wir alles, was tickt – vom Erbstück aus Großvaters Westentasche bis zur stattlichen Standuhr.</p>
        <p>Bei uns bekommt jede Uhr die Zeit, die sie braucht. Denn eine Uhr ist mehr als ein Gerät: Sie erzählt Geschichten.</p>
      </div>
      <div class="card">
        <h3>Öffnungszeiten</h3>
        <table class="hours">
          <tr><td>Di – Fr</td><td>9:00 – 12:30 · 14:30 – 18:00</td></tr>
          <tr><td>Samstag</td><td>9:00 – 13:00</td></tr>
          <tr><td>Mo + So</td><td>geschlossen</td></tr>
        </table>
        <p class="muted" style="margin-top:.8rem"><b>Hinweis:</b> Wegen eines Trauerfalls bleibt das Geschäft bis auf Weiteres geschlossen. Bereits abgegebene Uhren werden selbstverständlich zurückgegeben.</p>
      </div>
    </div>

    <h2>Unsere Leistungen</h2>
    <div class="grid2">
      <div class="card"><h3>Reparatur &amp; Revision</h3><p>Reinigung, Ölung und Instandsetzung mechanischer Uhrwerke aller Art – Armband-, Taschen-, Wand- und Standuhren.</p></div>
      <div class="card"><h3>Restaurierung</h3><p>Antike Uhren und Schlagwerke bringen wir behutsam und originalgetreu wieder in Gang.</p></div>
      <div class="card"><h3>Gutachten</h3><p>Wertgutachten für Versicherung und Nachlass – in Zusammenarbeit mit unserem langjährigen Gutachter Herrn Viktor Hahn (Antiquitäten Hahn, Kronstein).</p></div>
    </div>

    <h2>Unser Team</h2>
    <div class="team">
      <figure><img src="img/konrad.jpg" alt="Konrad Albrecht"><figcaption><b>Konrad Albrecht</b>Uhrmachermeister · Inhaber</figcaption></figure>
      <figure><img src="img/felix.jpg" alt="Felix Wendt"><figcaption><b>Felix Wendt</b>Auszubildender · 2. Lehrjahr</figcaption></figure>
    </div>

    <h2>Aus der Werkstatt</h2>
    <div class="news"><small>14. November 2026</small><br>Eine Kundin hat uns eine prachtvolle astronomische Taschenuhr zur Revision anvertraut – solche Stücke sieht man in einem Uhrmacherleben nur selten. Wir sind gespannt, was das Werk uns erzählt.</div>
    <div class="news"><small>2. November 2026</small><br>Ab sofort reparieren wir auch wieder Kuckucksuhren. Unser Lehrling Felix hat sich bestens eingearbeitet!</div>
    <div class="news"><small>Unser Rätsel des Monats</small><br><i>„Ich habe Hände, aber kann nicht klatschen. Ich habe ein Gesicht, aber keine Augen. Was bin ich?“</i> – Die Auflösung gibt es wie immer an der Ladentheke. Ihr Konrad Albrecht</div>

    <h2>Kontakt</h2>
    <div class="grid2">
      <div><p>Uhrmacherei Albrecht &amp; Sohn<br>Marktplatz 7 · Kronstein<br>(direkt neben dem Parkhaus am Marktplatz)</p>
        <p>Bestehende Kunden finden den Stand ihres Auftrags im <a href="#/kunden">Kundenbereich</a>.</p></div>
      <div class="card"><h3>Telefon</h3><p class="muted">Zurzeit erreichen Sie nur unseren Anrufbeantworter:</p><audio controls preload="none" src="a/ansage.mp3"></audio></div>
    </div>
  </div>`);
}

/* ---------- Kundenbereich ---------- */
function kunden(){
  h(`<div class="wrap narrow">
    <h1>Kundenbereich</h1>
    <p>Hier sehen Sie den Stand Ihres Auftrags. Bitte geben Sie die Auftragsnummer von Ihrem Abholschein und Ihren Nachnamen ein.</p>
    <form class="box" id="kf">
      <div><label for="nr">Auftragsnummer</label><input id="nr" placeholder="z. B. 2611-01" autocomplete="off"></div>
      <div><label for="nm">Nachname</label><input id="nm" placeholder="Nachname" autocomplete="off"></div>
      <div><button type="submit">Auftrag anzeigen</button></div>
      <div class="msg" id="km"></div>
    </form>
    <div id="ko"></div></div>`);
  const f = document.getElementById('kf');
  f.onsubmit = async ev => {
    ev.preventDefault();
    const nr = document.getElementById('nr').value, nm = document.getElementById('nm').value.trim().split(/\s+/).pop();
    const m = document.getElementById('km'); m.className = 'msg'; m.textContent = 'Einen Moment …'; primeSfx();
    const e = D.kunden[norm(nr)];
    const o = e ? await dec(nr + '|' + nm, e) : null;
    if(!o){ sfx('falsch'); m.className = 'msg bad'; m.textContent = 'Zu diesen Angaben wurde kein Auftrag gefunden. Bitte prüfen Sie Auftragsnummer und Namen.'; shake(f); return; }
    m.textContent = ''; sfx('buch');
    document.getElementById('ko').innerHTML = `<h2>Auftrag ${esc(o.nr)}</h2><div class="order">
      <dl><dt>Kunde</dt><dd>${esc(o.name)}</dd><dt>Gegenstand</dt><dd>${esc(o.obj)}</dd><dt>Eingang</dt><dd>${esc(o.eing)}</dd>
      <dt>Leistung</dt><dd>${esc(o.leistung)}</dd><dt>Status</dt><dd>${esc(o.status)}</dd><dt>Werkstattnotiz</dt><dd>${o.notiz}</dd></dl>
      ${o.img ? `<img src="${o.img}" alt="Foto des Auftrags">` : '<div class="card muted">Kein Foto hinterlegt.</div>'}</div>`;
    // Komfort: löst im Terminal Rätsel 2 mit
    if(norm(nr) === '261108' && mem.access && !mem.codes[2] && mem.codes[1]){
      if(await dec(nr, D.steps[1].e)){ mem.codes[2] = nr; save(); }
    }
  };
}

/* ---------- Anrufbeantworter ---------- */
async function ab(){
  h(`<div class="wrap narrow"><h1>Fernabfrage</h1><div id="abx"></div></div>`);
  const box = document.getElementById('abx');
  const show = async pin => {
    const d = await dec(pin, D.ab);
    if(!d) return false;
    let html = `<div class="ab"><div class="lcd">ALBRECHT &amp; SOHN · ${d.msgs.length + 1} NACHRICHTEN</div>`;
    const all = d.msgs.slice(0,3).concat([Object.assign({extra:1}, d.extra)], d.msgs.slice(3));
    all.forEach((m,i) => {
      html += `<div class="m"><b>Nachricht ${i+1} · ${esc(m.t)}</b>${m.extra ? `<div class="note">${esc(m.note)}</div>` : ''}<audio controls preload="none" src="a/${m.f}"></audio></div>`;
    });
    html += `</div><p class="muted" style="margin-top:1rem">Tipp: Notiert euch zu jeder Nachricht, wer spricht und um wie viel Uhr.</p>`;
    box.innerHTML = html;
    return true;
  };
  if(mem.pin && await show(mem.pin)) return;
  box.innerHTML = `<p>Fernabfrage des Anrufbeantworters. Bitte geben Sie die vierstellige PIN ein.</p>
    <form class="box" id="pf"><div><label for="pin">PIN</label><input id="pin" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="····"></div>
    <div><button type="submit">Nachrichten abhören</button></div><div class="msg" id="pm"></div></form>
    <h3>Ansage</h3><audio controls preload="none" src="a/ansage.mp3"></audio>`;
  const f = document.getElementById('pf');
  f.onsubmit = async ev => {
    ev.preventDefault();
    const pin = document.getElementById('pin').value;
    const m = document.getElementById('pm'); m.className = 'msg'; m.textContent = 'Verbinde …'; primeSfx();
    if(await show(pin)){ sfx('piep');
      mem.pin = pin;
      if(mem.access && !mem.codes[3] && mem.codes[2]) mem.codes[3] = pin;
      save();
    } else { sfx('falsch'); m.className = 'msg bad'; m.textContent = 'Falsche PIN.'; shake(f); }
  };
}

/* ---------- Ermittler-Terminal ---------- */
function solvedCount(){ return D.steps.filter(s => mem.codes[s.id]).length; }
async function terminal(){
  h(`<section class="thead" style="background-image:url(img/cover.jpg)"><div class="cap"><p>Fallakte Albrecht · Ermittler-Terminal</p><h1>Der letzte Auftrag des Uhrmachers</h1></div></section><div class="wrap narrow" id="tx"></div>`);
  const tx = document.getElementById('tx');
  let intro = mem.access ? await dec(mem.access, D.access) : null;
  if(!intro){
    tx.innerHTML = `<div class="tcard"><h3>Zugang</h3><p>Euren Ermittler-Zugang findet ihr in der Spielanleitung der Fallakte.</p>
      <form id="af" class="row"><input id="acc" placeholder="Zugangscode" autocomplete="off"><button type="submit">Anmelden</button></form><div class="msg" id="am"></div></div>`;
    const f = document.getElementById('af');
    f.onsubmit = async ev => {
      ev.preventDefault();
      const v = document.getElementById('acc').value;
      if(await dec(v, D.access)){ mem.access = v; save(); terminal(); }
      else { const m = document.getElementById('am'); m.className = 'msg bad'; m.textContent = 'Dieser Zugangscode ist nicht bekannt.'; shake(f); }
    };
    return;
  }
  let html = `<div class="tcard"><div class="akt">Nachricht von Marie Albrecht</div><audio controls preload="none" src="a/${intro.intro}"></audio>
    <p style="margin:.6rem 0 0">Neu bei Uhren? Lest zuerst <a href="#/wissen">So denkt ein Uhrmacher</a>.</p></div>
    <p class="progress">Fortschritt: ${solvedCount()} von ${D.steps.length} Rätseln gelöst</p>`;
  let reached = true;
  for(const s of D.steps){
    const solved = !!mem.codes[s.id];
    const active = !solved && reached;
    html += `<div class="tcard ${solved ? 'done' : (active ? '' : 'locked')}" id="st${s.id}"><div class="akt">${esc(s.akt)} · Rätsel ${s.id}</div><h3>${esc(s.title)}${solved ? ' ✓' : ''}</h3>`;
    if(solved || active) html += `<p>${esc(s.q)}</p>`;
    if(active){
      html += `<form class="row" data-s="${s.id}"><input placeholder="${esc(s.ph)}" autocomplete="off" autocapitalize="characters"><button type="submit">Prüfen</button></form><div class="msg"></div>
        <div class="hints"><button class="ghost" data-h="0">Denkanstoß</button><button class="ghost" data-h="1">Hinweis</button><button class="ghost" data-h="2">Lösung</button></div><div class="hbox"></div>`;
    }
    if(solved) html += `<div class="ok" data-ok="${s.id}">…</div>`;
    if(!solved && !active) html += `<p class="muted" style="margin:0">Gesperrt – löst zuerst das vorherige Rätsel.</p>`;
    html += `</div>`;
    if(!solved) reached = false;
  }
  if(mem.codes[8]) html += `<div class="tcard"><h3>Finale</h3><p><a class="btn" href="#/finale">Täter benennen</a></p></div>`;
  html += `<p style="margin-top:2rem"><button class="ghost" id="rst">Spielstand zurücksetzen</button> <span class="muted" id="rstm"></span></p>`;
  tx.innerHTML = html;

  // gelöste Rätsel: Text entschlüsseln
  for(const s of D.steps){
    const el = tx.querySelector(`[data-ok="${s.id}"]`);
    if(el){ const r = await dec(mem.codes[s.id], s.e); el.innerHTML = r ? r.ok : ''; }
  }
  const form = tx.querySelector('form[data-s]');
  if(form){
    const s = D.steps.find(x => x.id == form.dataset.s);
    const card = document.getElementById('st'+s.id);
    form.onsubmit = async ev => {
      ev.preventDefault();
      const v = form.querySelector('input').value, m = card.querySelector('.msg');
      m.className = 'msg'; m.textContent = 'Prüfe …'; primeSfx();
      if(await dec(v, s.e)){ sfx(STEP_SFX[s.id] || 'gong'); mem.codes[s.id] = v; save(); await terminal(); const c = document.getElementById('st'+s.id); if(c) c.scrollIntoView({behavior:'smooth', block:'start'}); }
      else { sfx('falsch'); m.className = 'msg bad'; m.textContent = 'Das stimmt noch nicht. Prüft eure Spuren noch einmal.'; shake(card); }
    };
    const hb = card.querySelector('.hbox');
    card.querySelectorAll('[data-h]').forEach(b => b.onclick = () => {
      const i = +b.dataset.h;
      if(i === 2 && !b.dataset.sure){ b.dataset.sure = 1; b.textContent = 'Wirklich die Lösung zeigen?'; return; }
      hb.innerHTML += `<div class="hint"><b>${['Denkanstoß','Hinweis','Lösung'][i]}:</b> ${esc(unobf(s.h[i]))}</div>`;
      b.disabled = true; b.style.opacity = .5;
    });
  }
  const r = document.getElementById('rst');
  r.onclick = () => {
    if(!r.dataset.sure){ r.dataset.sure = 1; r.textContent = 'Wirklich alles zurücksetzen?'; document.getElementById('rstm').textContent = 'Alle gelösten Rätsel gehen verloren.'; return; }
    mem = {codes:{}}; save(); terminal();
  };
}

/* ---------- Finale ---------- */
async function finale(){
  h(`<section class="thead" style="background-image:url(img/cover.jpg)"><div class="cap"><p>Fallakte Albrecht · Finale</p><h1>Wer hat an den Zeigern gedreht?</h1></div></section><div class="wrap narrow" id="fx"></div>`);
  const fx = document.getElementById('fx');
  if(!mem.codes[8]){ fx.innerHTML = `<div class="tcard"><p>Das Finale öffnet sich, sobald ihr im <a href="#/terminal">Ermittler-Terminal</a> alle acht Rätsel gelöst habt.</p></div>`; return; }
  const F = D.fin;
  let html = `<div class="tcard"><p>Ihr habt alle Spuren gesichert. Jetzt müsst ihr den Fall vor Marie und der Polizei begründen.</p><form id="ff">`;
  F.q.forEach(q => {
    html += `<div style="margin:1rem 0"><label for="q_${q.id}"><b>${esc(q.label)}</b></label><select id="q_${q.id}"><option value="">– bitte wählen –</option>${q.opts.map(o => `<option value="${o[0]}">${esc(o[1])}</option>`).join('')}</select><div class="msg" id="m_${q.id}"></div></div>`;
  });
  html += `<button type="submit">Fall abschließen</button></form></div><div id="res"></div>`;
  fx.innerHTML = html;
  const run = async vals => {
    let all = true;
    for(const q of F.q){
      const ok = vals[q.id] && await dec(vals[q.id], F.chk[q.id]);
      const m = document.getElementById('m_'+q.id);
      m.className = 'msg ' + (ok ? '' : 'bad'); m.textContent = ok ? '✓' : (vals[q.id] ? q.wrong : 'Bitte wählt eine Antwort.');
      if(!ok) all = false;
    }
    if(!all){ sfx('falsch'); shake(document.getElementById('ff')); return; }
    const r = await dec(F.q.map(q => vals[q.id]).join('|'), F.all);
    if(!r) return;
    if(window._finSfx){ sfx('gong'); window._finSfx = 0; }
    mem.fin = vals; save();
    document.getElementById('ff').querySelector('button').disabled = true;
    const res = document.getElementById('res');
    res.innerHTML = `<div class="tcard final"><div class="akt">Fall gelöst</div><h3>Viktor Hahn ist überführt.</h3>
      <img src="${r.img}" alt="Viktor Hahn"><p>Marie hat noch eine Nachricht für euch:</p><audio controls src="a/${r.audio}"></audio></div>
      <div class="tcard"><h3>Eure Urkunde</h3><p>Tragt eure Namen ein und druckt die Urkunde aus (am besten im Querformat).</p>
        <input id="cn" placeholder="Eure Namen" autocomplete="off"><p style="margin-top:.8rem"><button id="pr">Urkunde drucken</button></p></div>
      <div class="cert" id="cert"><div class="seal-ic">⚙</div><h2>Meisterdetektiv der Uhrmacherzunft</h2><div>Hiermit wird bescheinigt, dass</div>
        <div class="name" id="cname">&nbsp;</div><div>den Fall „Der letzte Auftrag des Uhrmachers“ gelöst, die wahre Tatzeit ermittelt und den Täter überführt hat.</div>
        <div style="margin-top:1rem">Kronstein, im Namen von Konrad Albrecht</div><div class="q">„Die Zeit lügt nie. Nur die Menschen, die an den Zeigern drehen.“</div></div>
      <div class="tcard"><p>Lust auf mehr Fälle? Im <a href="https://www.etsy.com/shop/DigitalRegalShop" target="_blank" rel="noopener">DigitalRegalShop</a> warten Krimidinner und Krimi-Rätsel auf euch.</p>
        <p class="muted" style="margin:0">Hat euch der Fall gefallen? Über eine kurze Bewertung freuen wir uns von Herzen – sie hilft unserem kleinen Shop sehr.</p></div>`;
    const cn = document.getElementById('cn');
    cn.value = mem.certName || '';
    const upd = () => { document.getElementById('cname').textContent = cn.value || ' '; mem.certName = cn.value; save(); };
    cn.oninput = upd; upd();
    document.getElementById('pr').onclick = () => {
      let pc = document.getElementById('printcert');
      if(!pc){ pc = document.createElement('div'); pc.id = 'printcert'; document.body.appendChild(pc); }
      pc.innerHTML = document.getElementById('cert').outerHTML.replace('id="cert"','');
      window.print();
    };
    res.scrollIntoView({behavior:'smooth'});
  };
  document.getElementById('ff').onsubmit = ev => { ev.preventDefault(); primeSfx(); window._finSfx = 1; const v = {}; F.q.forEach(q => v[q.id] = document.getElementById('q_'+q.id).value); run(v); };
  if(mem.fin){ F.q.forEach(q => document.getElementById('q_'+q.id).value = mem.fin[q.id]); run(mem.fin); }
}

/* ---------- Wissen ---------- */
function wissen(){
  h(`<section class="thead" style="background-image:url(img/cover.jpg)"><div class="cap"><p>Für Einsteiger</p><h1>So denkt ein Uhrmacher</h1></div></section>
  <div class="wrap narrow">
    <div class="tcard"><h3>Zahnräder</h3><p>Greifen zwei Zahnräder ineinander, drehen sie sich immer in <b>entgegengesetzte</b> Richtungen. Sitzen zwei Räder auf <b>derselben Welle</b>, drehen sie gleich schnell und in dieselbe Richtung. Wie oft sich ein Rad dreht, verrät das Verhältnis der Zähne: Ein Rad mit 20 Zähnen dreht ein Rad mit 60 Zähnen bei einer Umdrehung nur um ein Drittel weiter.</p></div>
    <div class="tcard"><h3>IIII statt IV</h3><p>Auf den allermeisten Zifferblättern steht die Vier als <b>IIII</b> – eine jahrhundertealte Uhrmacher-Tradition. Sie wirkt ausgewogener gegenüber der VIII. Ein Zifferblatt mit „IV“ ist unter alten Uhren die Ausnahme.</p></div>
    <div class="tcard"><h3>Besondere Uhren</h3><p><b>Einzeigeruhren</b> stammen aus der Zeit, bevor Minutenzeiger üblich waren. <b>Elektrische Synchronuhren</b> laufen mit dem Takt des Stromnetzes – sie summen leise, statt zu ticken. <b>Barbier- oder Spiegeluhren</b> haben ein spiegelverkehrtes Zifferblatt, damit man sie im Spiegel richtig lesen kann.</p></div>
    <div class="tcard"><h3>Die Unruh</h3><p>Das schwingende Rädchen mit der feinen Spiralfeder ist das Herz jeder mechanischen Taschen- und Armbanduhr. Es gibt den Takt vor – Tick für Tick.</p></div>
    <div class="tcard"><h3>Gewichte und Schlagwerke</h3><p>Viele alte Wanduhren werden von <b>Gewichten</b> angetrieben, die langsam nach unten sinken. Fehlt das Gewicht, bleibt die Uhr stehen. Ein <b>Schlagwerk</b> schlägt zur vollen Stunde so oft, wie die Stunde zählt, und zur halben Stunde einmal. Kirchturmuhren schlagen oft zusätzlich jede Viertelstunde.</p></div>
    <p><a href="#/terminal">← Zurück zum Terminal</a></p>
  </div>`);
}

/* ---------- Datenschutz ---------- */
function datenschutz(){
  h(`<div class="wrap narrow"><h1>Datenschutz</h1>
    <p>Diese Website ist Teil eines Spiels und kommt ohne Cookies, Tracking, Werbung oder Analyse-Dienste aus. Schriften und Medien werden direkt von dieser Website geladen, es werden keine externen Dienste eingebunden.</p>
    <p>Euer Spielstand (gelöste Rätsel, eingegebene Codes, der Name auf der Urkunde) wird ausschließlich lokal in eurem Browser gespeichert und nicht an uns übertragen. Ihr könnt ihn im Ermittler-Terminal jederzeit zurücksetzen oder über die Browser-Einstellungen löschen.</p>
    <p>Die Website wird über GitHub Pages (GitHub Inc.) bereitgestellt. Dabei verarbeitet GitHub technisch notwendige Verbindungsdaten wie die IP-Adresse, um die Seite auszuliefern und vor Missbrauch zu schützen.</p>
    <p>Verantwortlich ist der Betreiber laut <a href="https://digitalregal.com/impressum" target="_blank" rel="noopener">Impressum</a>.</p></div>`);
}

route();
})();
