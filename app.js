// ── Defaults & Data ────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = { 
  maxHits: 4, sessPerWeek: 5, quickHitsPerWeek: 3, quickHitTBreak: 1,
  nightWait: 15, dayWait: 120, tolerance: 'medium', 
  enforceWeeklyLimit: true,
  doseLow: 3, doseMed: 5, doseHigh: 7, 
  allowFuckIt: true, fuckItLimitPerMonth: 2,
  yearlyBreakMonth: 'none', weenOffEnabled: false
};

const DEFAULT_EQUIPMENT = [
  { id: 'e1', text: 'Sploofy (Personal Air Filter)', done: false },
  { id: 'e2', text: 'Water', done: false },
  { id: 'e3', text: 'Eye Drops', done: false },
  { id: 'e4', text: 'Airtight Glass Jar', done: false },
  { id: 'e5', text: 'Battery / Lighter', done: false },
  { id: 'e6', text: 'Isopropyl Alcohol & Q-Tips', done: false },
  { id: 'e7', text: 'Emergency CBD Tincture/Gummies', done: false }
];

function ld(k,d) { try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch { return d; } }
function sv(k,v) { localStorage.setItem(k,JSON.stringify(v)); }

let settings = { ...DEFAULT_SETTINGS, ...ld('t2_settings', {}) };
let username = ld('t2_username', 'User');
let pens = ld('t2_pens', []); 
let sessions = ld('t2_sessions', []);
let todos = ld('t2_todos', []);
let equipment = ld('t2_equipment', DEFAULT_EQUIPMENT);
let routineChecks = ld('t2_routine', []);
let fuckIts = ld('t2_fuckits', []); 
let quickHitLockoutUntil = ld('t2_qh_lockout', 0);

let currentMode = 'night'; 
let activeSession = ld('t2_activeSession', null);
let waitTimerInterval = null;
let drawSequenceState = { timeout: null, interval: null };
let pendingConfigType = 'normal'; 

// ── Helpers ────────────────────────────────────────────────────────────────
function ds(d) { return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0,10); }
function today() { return ds(new Date()); }
function formatDuration(ms) {
  const diff = Math.floor(ms / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function penById(id) { return pens.find(p=>p.id===id); }

// Pharmacokinetic curve
function getCurrentTHCInBody(evalTime = Date.now()) {
    let total = 0;
    const cutoff = evalTime - (30 * 24 * 3600 * 1000); // 30 days history tracking
    const processHits = (s) => {
        const pen = penById(s.penId) || { thc: 20 };
        s.hits.forEach(h => {
            if(h.time > cutoff && h.time <= evalTime) {
                // If Edible, h.directMg is logged directly. Otherwise, calculate vapor.
                let hitMg = h.directMg || (1.2 * h.drawSeconds * (pen.thc / 100) * 0.35);
                
                // Edible delays onset peak
                let hoursElapsed = (evalTime - h.time) / 3600000;
                if (s.method === 'edible') hoursElapsed = Math.max(0, hoursElapsed - 1.0); // 1hr onset buffer
                
                const alphaDecay = 0.8 * Math.pow(0.5, hoursElapsed / 0.5);
                const betaDecay = 0.2 * Math.pow(0.5, hoursElapsed / 36.0);
                total += hitMg * (alphaDecay + betaDecay); 
            }
        });
    };
    sessions.forEach(processHits);
    if(activeSession) processHits(activeSession);
    return total;
}

// ── App Init ───────────────────────────────────────────────────────────────
window.onload = () => {
  if (!ld('t2_age_verified', false)) {
      document.getElementById('age-gate-modal').style.display = 'flex';
  } else {
      initApp();
  }
};

function verifyAge() {
    sv('t2_age_verified', true);
    document.getElementById('age-gate-modal').style.display = 'none';
    initApp();
}

function initApp() {
  if (pens.length === 0) { document.getElementById('setup-modal').classList.add('open'); }
  generateFeelGrid('config-feel-grid');
  generateFeelGrid('recap-feel-grid');
  updateGlobalClock();
  setInterval(updateGlobalClock, 1000);
  
  renderDashboard();
  renderTodos();
  renderEquipment();
  renderPens();
  renderSettings();
  
  if(activeSession && activeSession.nextHitReadyAt) startWaitTimerUI();
}

function generateFeelGrid(containerId) {
  const c = document.getElementById(containerId);
  if(!c) return;
  c.innerHTML = '';
  for(let i=1; i<=10; i++) {
    const btn = document.createElement('button');
    btn.className = `feel-btn ${i===5?'active':''}`;
    btn.dataset.val = i;
    btn.innerText = i;
    btn.onclick = (e) => { 
        e.preventDefault(); 
        c.querySelectorAll('.feel-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(containerId.replace('-grid', '-val')).value = i;
    };
    c.appendChild(btn);
  }
}

// ── Ween-Off Logic ─────────────────────────────────────────────────────────
function isWeenOffActive() {
    if (!settings.weenOffEnabled || settings.yearlyBreakMonth === 'none') return false;
    let target = parseInt(settings.yearlyBreakMonth);
    let weenMonth = target === 0 ? 11 : target - 1;
    return new Date().getMonth() === weenMonth;
}

function isYearlyBreakActive() {
    if (settings.yearlyBreakMonth === 'none') return false;
    return new Date().getMonth() === parseInt(settings.yearlyBreakMonth);
}

function getActiveLimits() {
    let lim = { maxHits: settings.maxHits, wait: settings.nightWait };
    if (isWeenOffActive()) {
        lim.maxHits = Math.max(1, Math.floor(settings.maxHits / 2));
        lim.wait = settings.nightWait * 2;
        document.getElementById('ween-badge').style.display = 'block';
    } else {
        document.getElementById('ween-badge').style.display = 'none';
    }
    return lim;
}

// ── Global Clock & Clearance ───────────────────────────────────────────────
function updateGlobalClock() {
  const now = new Date();
  document.getElementById('greeting-date').innerText = now.toLocaleDateString([], {weekday:'long', month:'long', day:'numeric'}) + ' · ' + now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

  const hr = now.getHours();
  currentMode = (hr >= 6 && hr < 18) ? 'day' : 'night';
  document.getElementById('mode-badge').textContent = currentMode === 'night' ? '☽ NIGHT MODE' : '☀ DAY MODE';

  if (document.getElementById('tab-clearance').classList.contains('active')) {
      let t = Date.now();
      let currentThc = getCurrentTHCInBody(t);
      let clearEl = document.getElementById('cl-time-to-clear');
      if (currentThc <= 0.01) {
          clearEl.innerText = "00:00:00";
      } else {
          // Fast-forward simulate to find 0.01mg threshold
          let stepMs = 3600000; // 1 hour steps
          let maxSteps = 24 * 60; // max 60 days
          let steps = 0;
          while(getCurrentTHCInBody(t) > 0.01 && steps < maxSteps) {
              t += stepMs;
              steps++;
          }
          let diffMs = t - Date.now();
          let d = Math.floor(diffMs / 86400000);
          let h = Math.floor((diffMs % 86400000) / 3600000);
          clearEl.innerText = d > 0 ? `${d}d ${h}h` : `${h}h`;
      }
  }
}

// ── Modals & Setup ─────────────────────────────────────────────────────────
function showCustomModal(title, msg, buttons) {
  document.getElementById('custom-modal-title').innerText = title;
  document.getElementById('custom-modal-body').innerHTML = msg;
  const btnContainer = document.getElementById('custom-modal-buttons');
  btnContainer.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.cls || 'btn-ghost');
    btn.innerText = b.text;
    btn.onclick = () => { document.getElementById('custom-modal').classList.remove('open'); if(b.onClick) b.onClick(); };
    btnContainer.appendChild(btn);
  });
  document.getElementById('custom-modal').classList.add('open');
}

function completeSetup() {
  username = document.getElementById('setup-user-name').value.trim() || 'User';
  let pname = document.getElementById('setup-pen-name').value.trim() || 'Profile 1';
  let thc = parseFloat(document.getElementById('setup-pen-thc').value) || 75;
  sv('t2_username', username);
  pens.push({ id: 'p'+Date.now(), name: pname, thc });
  sv('t2_pens', pens);
  document.getElementById('setup-modal').classList.remove('open');
  renderDashboard();
}

// ── Session Config (Vape/Joint/Edible) ─────────────────────────────────────
function updateConfigMethodUI() {
    const m = document.getElementById('config-method').value;
    document.getElementById('config-dose-vape').style.display = m !== 'edible' ? 'block' : 'none';
    document.getElementById('config-dose-edible').style.display = m === 'edible' ? 'block' : 'none';
}

function openQuickHitModal() {
    if (Date.now() < quickHitLockoutUntil) {
        let diff = Math.ceil((quickHitLockoutUntil - Date.now()) / 86400000);
        return showCustomModal("Lockout Active", `Quick hits are locked for ${diff} more days to enforce T-Break padding.`, [{text:"OK"}]);
    }
    openConfigModal(true, 'quick');
}

function openConfigModal(isNewSession, type = 'normal') {
  if (pens.length === 0) return showCustomModal("Add Profile", "Add a strain in the Profiles tab first.", [{text:"OK"}]);
  if (isYearlyBreakActive() && !fuckIts.includes(today())) {
      return showCustomModal("T-Break Active", "It is your designated Yearly T-Break month. Dashboard locked.", [{text:"Understood"}]);
  }

  pendingConfigType = type;
  document.getElementById('config-title').innerText = type === 'quick' ? "Quick Hit" : (isNewSession ? "Start Session" : "Take a Hit");
  
  document.getElementById('config-method-group').style.display = isNewSession && type !== 'quick' ? 'flex' : 'none';
  document.getElementById('config-pen-group').style.display = isNewSession ? 'flex' : 'none';
  document.getElementById('config-pen').innerHTML = pens.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  
  document.getElementById('config-dose').innerHTML = `
    <option value="low">Low Dose (${settings.doseLow}s / Small)</option>
    <option value="medium" selected>Medium Dose (${settings.doseMed}s / Reg)</option>
    <option value="high">High Dose (${settings.doseHigh}s / Heavy)</option>
  `;

  // Focus Task Dropdown
  document.getElementById('config-task-group').style.display = isNewSession && type !== 'quick' ? 'flex' : 'none';
  if(todos.length > 0) {
      document.getElementById('config-task-select').innerHTML = todos.map(t=>`<option value="${t.text}">${t.text}</option>`).join('');
  } else {
      document.getElementById('config-task-select').innerHTML = `<option value="Reflect">Just Reflect (No Tasks Added)</option>`;
  }

  updateConfigMethodUI();
  document.getElementById('config-modal').classList.add('open');
}

function closeConfigModal() { document.getElementById('config-modal').classList.remove('open'); }

function startDrawSequence() {
  const isNew = !activeSession;
  const method = isNew ? document.getElementById('config-method').value : activeSession.method;
  const penId = isNew ? document.getElementById('config-pen').value : activeSession.penId;
  const feeling = parseInt(document.getElementById('config-feel-val').value);
  const task = isNew ? document.getElementById('config-task-select').value : activeSession.focusTask;

  if (isNew && type === 'quick') {
      quickHitLockoutUntil = Date.now() + (settings.quickHitTBreak * 86400000);
      sv('t2_qh_lockout', quickHitLockoutUntil);
  }

  closeConfigModal();

  if (method === 'vape' && pendingConfigType !== 'quick') {
      executeSequence(isNew, penId, document.getElementById('config-dose').value, feeling, task, method);
  } else {
      // Direct logging for Edibles, Joints, or Quick Hits (skip breathing visuals)
      let doseSize = document.getElementById('config-dose').value;
      let drawSecs = doseSize === 'low' ? settings.doseLow : (doseSize === 'high' ? settings.doseHigh : settings.doseMed);
      let hitObj = { time: Date.now(), dose: doseSize, feelingPreHit: feeling, drawSeconds: method==='joint'?drawSecs:0 };
      
      if (method === 'edible') {
          hitObj.directMg = parseFloat(document.getElementById('config-edible-mg').value) || 10;
      } else if (method === 'joint') {
          // approximate mg equivalent using drawSecs scale
      }

      if (isNew) {
          activeSession = { id: Date.now().toString(), ts: Date.now(), penId, mode: currentMode, method, hits: [], notes: "", media: [], focusTask: task };
      }
      finishHitDirect(hitObj);
  }
}

// ── Sequence Logic ─────────────────────────────────────────────────────────
function executeSequence(isNew, penId, dose, feeling, task, method) {
  if (isNew) activeSession = { id: Date.now().toString(), ts: Date.now(), penId, mode: currentMode, method, hits: [], notes: "", media: [], focusTask: task };
  let drawSecs = dose === 'low' ? settings.doseLow : (dose === 'high' ? settings.doseHigh : settings.doseMed);
  
  const modal = document.getElementById('draw-modal');
  const circle = document.getElementById('draw-circle');
  modal.classList.add('open');
  circle.className = 'draw-circle breathing-in'; circle.innerText = "Draw";
  
  let left = drawSecs;
  drawSequenceState.interval = setInterval(() => {
    left--;
    if(left > 0) circle.innerText = left;
    else { 
        clearInterval(drawSequenceState.interval); 
        circle.className = 'draw-circle exhaling'; circle.innerText = "Release";
        setTimeout(() => {
            document.getElementById('draw-modal').classList.remove('open');
            finishHitDirect({ time: Date.now(), dose, feelingPreHit: feeling, drawSeconds: drawSecs });
        }, 2000);
    }
  }, 1000);
}

function cancelDraw() {
  clearInterval(drawSequenceState.interval);
  document.getElementById('draw-modal').classList.remove('open');
  if (activeSession && activeSession.hits.length === 0) activeSession = null;
  renderDashboard();
}

function finishHitDirect(hitObj) {
    if (pendingConfigType === 'quick') {
        sessions.push({
            id: 'qh_' + Date.now(), ts: Date.now(), endTime: Date.now(), penId: hitObj.penId || pens[0].id, mode: currentMode,
            method: 'vape', hits: [hitObj], isQuickHit: true, notes: "⚡ Quick Hit"
        });
        sv('t2_sessions', sessions);
        return renderDashboard();
    }

    activeSession.hits.push(hitObj);
    const limits = getActiveLimits();
    activeSession.nextHitReadyAt = Date.now() + (limits.wait * 60000);
    sv('t2_activeSession', activeSession);
    renderDashboard();
    startWaitTimerUI();
}

function startWaitTimerUI() {
  if (waitTimerInterval) clearInterval(waitTimerInterval);
  const limits = getActiveLimits();
  const tick = () => {
    if (!activeSession) return clearInterval(waitTimerInterval);
    const el = document.getElementById('wait-timer');
    if (!el) return;
    
    if(activeSession.hits.length >= limits.maxHits) {
        el.className = 'timer-display expired'; el.innerText = 'LIMIT';
        document.getElementById('wait-timer-lbl').innerText = "Session limit reached.";
        clearInterval(waitTimerInterval); return;
    }

    const rem = activeSession.nextHitReadyAt - Date.now();
    if (rem <= 0) { el.className = 'timer-display expired'; el.innerText = 'READY'; }
    else {
      const m = Math.floor((rem % 3600000) / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      el.className = 'timer-display active';
      el.innerText = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }
  };
  tick();
  waitTimerInterval = setInterval(tick, 1000);
}

function addTimeToWait() { activeSession.nextHitReadyAt += 300000; sv('t2_activeSession', activeSession); startWaitTimerUI(); }

// ── Dashboard & Media ──────────────────────────────────────────────────────
function renderDashboard() {
  const ws = new Date(); ws.setDate(ws.getDate() - ws.getDay() + 1); ws.setHours(0,0,0,0);
  const weekSess = sessions.filter(s => s.ts >= ws.getTime() && !s.isQuickHit).length;
  
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat glass"><div class="stat-label">Sess This Week</div><div class="stat-value">${weekSess} <span class="text-sm">/ ${settings.sessPerWeek}</span></div></div>
    <div class="stat glass"><div class="stat-label">Current THC</div><div class="stat-value">${getCurrentTHCInBody().toFixed(2)}<span class="text-sm">mg</span></div></div>
  `;

  if (activeSession) {
    document.getElementById('session-card-idle').style.display = 'none';
    document.getElementById('session-card-active').style.display = 'block';
    
    document.getElementById('active-pen-name').innerText = penById(activeSession.penId)?.name || 'Unknown';
    document.getElementById('active-hits').innerText = activeSession.hits.length;
    document.getElementById('active-focus-task').innerText = activeSession.focusTask || 'None';
    
    let isMaxed = activeSession.hits.length >= getActiveLimits().maxHits;
    document.getElementById('btn-take-hit').disabled = isMaxed;
    document.getElementById('hits-remaining-txt').innerText = isMaxed ? "Limit Reached." : "";

    const mList = document.getElementById('active-media-list');
    mList.innerHTML = activeSession.media?.map(m => `
       <div class="glass text-sm mb-8" style="padding:8px; border:1px solid var(--border2); border-radius:8px;">
         <strong>${m.title}</strong><br><a href="${m.link}" target="_blank" style="color:var(--accent); font-size:10px;">${m.link}</a>
       </div>
    `).join('') || '<div class="text-muted text-sm">No media logged.</div>';
  } else {
    document.getElementById('session-card-idle').style.display = 'block';
    document.getElementById('session-card-active').style.display = 'none';
    
    const preflight = routineChecks.concat(equipment);
    document.getElementById('preflight-list').innerHTML = preflight.map(c => `
      <div class="check-row" onclick="togglePreflight('${c.id}')">
        <div class="check-box ${c.done ? 'checked' : ''}">${c.done ? '✓' : ''}</div>
        <div class="check-text" style="${c.done ? 'opacity:0.6;' : ''}">${c.text}</div>
      </div>
    `).join('');
    
    document.getElementById('btn-start-session').disabled = preflight.some(c => !c.done);
  }
}

function togglePreflight(id) {
    let target = routineChecks.find(c=>c.id===id) || equipment.find(c=>c.id===id);
    if(target) target.done = !target.done;
    sv('t2_routine', routineChecks); sv('t2_equipment', equipment);
    renderDashboard();
}

function openMediaModal() {
   showCustomModal("Review Media", `
     <div class="form-group mb-16"><label>Title</label><input type="text" id="m-title" class="glass"></div>
     <div class="form-group mb-16"><label>URL / Link</label><input type="url" id="m-link" class="glass" placeholder="https://..."></div>
   `, [
     {text: "Cancel"},
     {text: "Save Media", cls: "btn-primary", onClick: () => {
         activeSession.media.push({ title: document.getElementById('m-title').value, link: document.getElementById('m-link').value });
         sv('t2_activeSession', activeSession); renderDashboard();
     }}
   ]);
}

// ── Recap Logic ─────────────────────────────────────────────────────────────
function endSession() { 
  if (!activeSession) return; 
  document.getElementById('recap-task-name').innerText = activeSession.focusTask || 'None';
  switchTab('recap'); 
}
function cancelRecap() { activeSession = null; sv('t2_activeSession', null); switchTab('dashboard'); }
function saveRecap() {
  if (!activeSession) return;
  activeSession.endTime = Date.now();
  activeSession.finalFeeling = parseInt(document.getElementById('recap-feel-val').value);
  activeSession.notes = document.getElementById('recap-notes').value.trim();
  activeSession.taskCompleted = document.getElementById('recap-task-done').checked;
  
  sessions.push(activeSession); sv('t2_sessions', sessions);
  activeSession = null; sv('t2_activeSession', null);
  routineChecks.forEach(c=>c.done=false); equipment.forEach(c=>c.done=false);
  switchTab('dashboard');
}

// ── UI Navigation & Renders ─────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.content').forEach(el=>el.classList.remove('active'));
  
  const tabs=['dashboard','recap','history','stats','calendar','clearance','equipment','pens','routine','todo','goals','guide','settings'];
  const idx=tabs.indexOf(name);
  if(idx>=0) { 
      document.querySelectorAll('.nav-item')[idx].classList.add('active'); 
      document.getElementById('tab-'+name).classList.add('active'); 
      document.getElementById('topbar-title').innerText = name.toUpperCase();
  }
  document.getElementById('sidebar').classList.remove('open');
  if(name==='dashboard') renderDashboard();
  if(name==='equipment') renderEquipment();
  if(name==='settings') renderSettings();
}
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

function renderTodos() {
    document.getElementById('todo-list').innerHTML = todos.map(t => `<div class="check-row" onclick="removeTodo('${t.id}')"><div class="check-box"></div><div class="check-text">${t.text}</div></div>`).join('');
}
function addTodo() {
    const val = document.getElementById('new-todo-input').value;
    if(val) { todos.push({ id:'t'+Date.now(), text: val }); sv('t2_todos', todos); renderTodos(); }
}
function removeTodo(id) { todos = todos.filter(t=>t.id!==id); sv('t2_todos', todos); renderTodos(); }

function renderEquipment() {
    document.getElementById('equipment-list').innerHTML = equipment.map(e => `
        <div class="check-row" onclick="toggleEq('${e.id}')">
            <div class="check-box ${e.done ? 'checked' : ''}">${e.done ? '✓' : ''}</div>
            <div class="check-text">${e.text}</div>
        </div>
    `).join('');
}
function toggleEq(id) {
    let eq = equipment.find(e=>e.id===id); if(eq) eq.done = !eq.done;
    sv('t2_equipment', equipment); renderEquipment();
}

function renderPens() {
    document.getElementById('pen-db-list').innerHTML = pens.map(p => `<div class="glass mb-8" style="padding:16px; border:1px solid var(--border2); border-radius:8px;"><strong>${p.name}</strong> (${p.thc}%)</div>`).join('');
}
function addPen() {
    pens.push({ id:'p'+Date.now(), name: document.getElementById('pen-name').value, thc: document.getElementById('pen-thc').value });
    sv('t2_pens', pens); renderPens();
}

function renderSettings() {
    ['s-sessPerWeek', 's-quickHitsPerWeek', 's-quickHitTBreak', 's-maxHits', 's-nightWait', 's-yearlyBreakMonth', 's-fuckItLimitPerMonth'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = settings[id.replace('s-','')];
    });
    ['s-allowFuckIt', 's-enforceWeeklyLimit', 's-weenOffEnabled'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).checked = settings[id.replace('s-','')];
    });
}
function saveSettings(silent=false) {
    settings.sessPerWeek = parseInt(document.getElementById('s-sessPerWeek').value);
    settings.quickHitsPerWeek = parseInt(document.getElementById('s-quickHitsPerWeek').value);
    settings.quickHitTBreak = parseInt(document.getElementById('s-quickHitTBreak').value);
    settings.yearlyBreakMonth = document.getElementById('s-yearlyBreakMonth').value;
    settings.weenOffEnabled = document.getElementById('s-weenOffEnabled').checked;
    sv('t2_settings', settings);
    renderDashboard();
}