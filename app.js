// ── Data & Quotes ───────────────────────────────────────────────────────────
const WEED_QUOTES = [
  "\"The biggest killer on the planet is stress and I still think the best medicine is and always has been cannabis.\" — Willie Nelson",
  "\"I find that smoking a little weed helps to give me a little bit of a different perspective.\" — Seth Rogen",
  "\"When you smoke the herb, it reveals you to yourself.\" — Bob Marley",
  "\"It really puzzles me to see marijuana connected with narcotics... dope and all that crap. It's a thousand times better than whiskey - it's an assistant - a friend.\" — Louis Armstrong",
  "\"Of course I know how to roll a joint.\" — Martha Stewart",
  "Fun Fact: George Washington grew hemp at Mount Vernon as one of his primary crops.",
  "Fun Fact: Cannabis has been used for medicinal purposes for over 3,000 years.",
  "Reminder: Tolerance breaks (T-breaks) help reset your CB1 receptors.",
  "Reminder: Stay hydrated. Cannabis can temporarily decrease saliva production."
];
const WACKY_NAMES = ["Alaskan Thunderfuck", "Snoop's Dream", "Purple Space Dust", "Skywalker OG", "Granddaddy Purp", "Couch-Lock Supreme", "Green Crack", "Gorilla Glue", "Sour Diesel", "Blue Dream"];

// ── State & Defaults ────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = { 
  maxHits: 4, sessPerWeek: 5, quickHitsPerWeek: 3, quickHitTBreak: 1, 
  nightWait: 15, dayWait: 120, breakStart: null, breakEnd: null, tolerance: 'medium', 
  diabloEnabled: false, doseDiablo: 10, autoTBreak: true, autoTBreakWeek: 4, 
  enforceWeeklyLimit: true, enforceRestDays: true, restDays: 2,
  autoTuneDosing: false, doseLow: 3, doseMed: 5, doseHigh: 7,
  daySmokingEnabled: true, daySmokingDaysPerMonth: 5, nightSmokingEnabled: true,
  allowFuckIt: true, fuckItLimitPerMonth: 2, autoTBreakBypassedMonth: -1,
  theme: 'auto', largeText: false, yearlyBreakMonth: 'none', weenOffEnabled: false,
  hardcoreLockout: false
};

const DEFAULT_EQUIPMENT = [
  { id: 'e1', text: 'Sploofy (Personal Air Filter)', desc: 'Reduces smell and smoke indoors.' },
  { id: 'e2', text: 'Water', desc: 'Hydration is key. Prevents dry mouth and soothes throat.' },
  { id: 'e3', text: 'Eye Drops', desc: 'Relieves redness and irritation instantly.' },
  { id: 'e4', text: 'Airtight Glass Jar', desc: 'Preserves freshness and contains odors.' },
  { id: 'e5', text: 'Multi-voltage Battery', desc: 'Essential for vape cartridges (e.g. Yocan Uni Pro).' },
  { id: 'e6', text: 'Iso Alcohol & Q-Tips', desc: 'Crucial for cleaning gear and mouthpieces.' },
  { id: 'e7', text: 'Emergency CBD Tincture', desc: 'Can help counteract severe THC-induced anxiety.' },
  { id: 'e8', text: 'Smoking Hoodie', desc: 'A dedicated comfortable layer to absorb smoke smell.' },
  { id: 'e9', text: 'Hand Sanitizer', desc: 'Removes sticky resin and smells from fingers.' },
  { id: 'e10', text: 'Mouthpiece Caps', desc: 'Keeps out pocket lint and prevents clogs.' }
];

const DEFAULT_ROUTINE = [
  { id:'r1', text:'Drink a full glass of water', done:false, mode:'all' },
  { id:'r5', text:'Finished all critical daytime work', done:false, mode:'day' },
  { id:'r2', text:'No major commitments early tomorrow', done:false, mode:'night' },
  { id:'r3', text:'Completed a self-care task today', done:false, mode:'all' },
  { id:'r4', text:'I am not smoking to escape severe anxiety', done:false, mode:'all' }
];

const DEFAULT_RULES = [
  { id: 'ru1', text: 'Never smoke before all daily responsibilities are done.' },
  { id: 'ru2', text: 'Use cannabis to enhance experiences, not to escape reality.' },
  { id: 'ru3', text: 'Respect the limits you\'ve set for yourself.' }
];

function ld(k,d) { try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch { return d; } }
function sv(k,v) { localStorage.setItem(k,JSON.stringify(v)); }

let settings = { ...DEFAULT_SETTINGS, ...ld('t2_settings', {}) };
let username = ld('t2_username', 'User');
let pens = ld('t2_pens', []); 
let graveyard = ld('t2_graveyard', []);
let sessions = ld('t2_sessions', []);
let emergencyLinks = ld('t2_emergency', []);
let todos = ld('t2_todos', []);
let songs = ld('t2_songs', []);
let goals = ld('t2_goals', []);
let rules = ld('t2_rules', DEFAULT_RULES);
let journalText = ld('t2_journal', '');
let equipment = ld('t2_equipment', DEFAULT_EQUIPMENT);
let routineChecks = ld('t2_routine', DEFAULT_ROUTINE);
let plannedBreaks = ld('t2_planned_breaks', []); 
let fuckIts = ld('t2_fuckits', []); 
let quickHitLockoutUntil = ld('t2_qh_lockout', 0);

let currentMode = 'night'; 
let activeSession = ld('t2_activeSession', null);
let waitTimerInterval = null;
let lockTimerInterval = null;
let quoteInterval = null;
let drawSequenceState = { timeout: null, interval: null };
let selectedCalDate = null; 
let emStep = 0; 
let pendingConfigType = 'normal'; 
let cachedClearanceStr = "--:--:--";

// ── Helper Functions ────────────────────────────────────────────────────────
function ds(d) { const l = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)); return l.toISOString().slice(0,10); }
function today() { return ds(new Date()); }
function fmtTime(d) { return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }
function formatDuration(ms) {
  if (!ms || ms <= 0) return '0m';
  const diff = Math.floor(ms / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
function weekStartFromDate(d) {
  const date = new Date(d);
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setDate(date.getDate() + diff);
  date.setHours(0,0,0,0);
  return date.getTime();
}
function weekStart() { return weekStartFromDate(new Date()); }
function penById(id) { return pens.find(p=>p.id===id) || graveyard.find(p=>p.id===id); }
function isFuckItDay(dStr = today()) { return fuckIts.includes(dStr); }

function sumTHC(hitsArray, penObj, method = 'vape') {
  if(!hitsArray) return 0;
  let total = 0;
  hitsArray.forEach(h => {
      if (h.directMg) {
          total += h.directMg;
      } else if (penObj) {
          const thcFraction = penObj.thc / 100;
          const rate = method === 'joint' ? 1.5 : 1.2;
          total += (h.drawSeconds * rate * thcFraction);
      }
  });
  return Math.round(total * 100) / 100; 
}

function getLastHitInfo() {
  let lastHitTime = 0; let lastPenId = null;
  sessions.forEach(s => { s.hits.forEach(h => { if (h.time > lastHitTime) { lastHitTime = h.time; lastPenId = s.penId; } }); });
  if (activeSession) { activeSession.hits.forEach(h => { if (h.time > lastHitTime) { lastHitTime = h.time; lastPenId = activeSession.penId; } }); }
  return { time: lastHitTime, penId: lastPenId };
}

function rotateQuote() {
  const seed = Math.floor(Math.random() * WEED_QUOTES.length);
  const qEl = document.getElementById('greeting-quote');
  if(qEl) qEl.innerText = WEED_QUOTES[seed];
}

function getFeelColorObj(val) {
  if (val <= 2) return { bg: 'rgba(255,77,77,0.15)', border: 'rgba(255,77,77,0.5)', text: '#ff4d4d' };
  if (val <= 4) return { bg: 'rgba(255,153,51,0.15)', border: 'rgba(255,153,51,0.5)', text: '#ff9933' };
  if (val <= 6) return { bg: 'rgba(255,214,51,0.15)', border: 'rgba(255,214,51,0.5)', text: '#ffd633' };
  if (val <= 8) return { bg: 'rgba(153,230,153,0.15)', border: 'rgba(153,230,153,0.5)', text: '#99e699' };
  return { bg: 'rgba(51,204,51,0.15)', border: 'rgba(51,204,51,0.5)', text: '#33cc33' };
}

// ── Ween-Off Protocol ───────────────────────────────────────────────────────
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
    let lim = { maxHits: parseInt(settings.maxHits, 10) || 4, wait: currentMode === 'night' ? (parseInt(settings.nightWait)||15) : (parseInt(settings.dayWait)||120), sessPerWeek: parseInt(settings.sessPerWeek, 10) || 5 };
    if (isWeenOffActive()) {
        lim.maxHits = Math.max(1, Math.floor(lim.maxHits / 2));
        lim.wait = lim.wait * 2;
        lim.sessPerWeek = Math.max(1, Math.floor(lim.sessPerWeek / 2));
        const b = document.getElementById('ween-badge');
        if(b) b.style.display = 'block';
    } else {
        const b = document.getElementById('ween-badge');
        if(b) b.style.display = 'none';
    }
    return lim;
}

// ── Init & Global Clock ─────────────────────────────────────────────────────
window.onload = () => {
  if (Notification && Notification.permission === 'default') Notification.requestPermission();
  if (!ld('t2_age_verified', false)) {
      document.getElementById('age-gate-modal').classList.add('open');
      document.getElementById('sidebar-nav').style.filter = 'blur(10px)';
      document.getElementById('main-content-area').style.filter = 'blur(10px)';
  } else {
      initApp();
  }
};

function verifyAge() {
    sv('t2_age_verified', true);
    document.getElementById('age-gate-modal').classList.remove('open');
    document.getElementById('sidebar-nav').style.filter = 'none';
    document.getElementById('main-content-area').style.filter = 'none';
    initApp();
}

function initApp() {
  if (pens.length === 0 && graveyard.length === 0) { document.getElementById('setup-modal').classList.add('open'); }
  if (settings.weenOffEnabled && settings.yearlyBreakMonth !== 'none') {
      let target = parseInt(settings.yearlyBreakMonth);
      let weenMonth = target === 0 ? 11 : target - 1;
      let now = new Date();
      if (now.getMonth() === weenMonth && now.getDate() === 1) {
          let storageKey = 't2_ween_prompt_' + now.getFullYear() + '_' + weenMonth;
          if (!ld(storageKey, false)) {
              showCustomModal("Ween-Off Activated", "It's the 1st of the month before your Yearly T-Break. Ween-Off Mode is now active: your session limits and draw times are halved to smoothly lower your tolerance.", [{text: "Understood"}]);
              sv(storageKey, true);
          }
      }
  }

  const spn = document.getElementById('setup-pen-name');
  if (spn) spn.placeholder = `e.g. ${WACKY_NAMES[Math.floor(Math.random()*WACKY_NAMES.length)]}`;

  rotateQuote();
  if(quoteInterval) clearInterval(quoteInterval);
  quoteInterval = setInterval(rotateQuote, 15000);

  generateFeelGrid('config-feel-grid');
  generateFeelGrid('recap-feel-grid');

  const journalEl = document.getElementById('journal-text');
  if (journalEl) journalEl.value = journalText;
  
  applyAutoDosing();
  updateGlobalClock();
  applyTheme(); 
  setInterval(updateGlobalClock, 1000);

  renderDashboard();
  renderRoutine();
  renderEquipment();
  renderTodo();
  renderSongs();
  renderGoals();
  renderPens();
  renderRules();
  renderSettings();
  
  if(activeSession && activeSession.nextHitReadyAt) startWaitTimerUI();
}

function toggleSidebar() {
  document.getElementById('sidebar-nav').classList.toggle('open');
  document.getElementById('mobile-overlay').classList.toggle('open');
}

function applyTheme() {
   const t = settings.theme || 'auto';
   const mb = document.getElementById('mode-badge');
   document.body.classList.toggle('large-text', settings.largeText);

   if (t === 'auto') {
      document.body.setAttribute('data-mode', currentMode);
      document.body.removeAttribute('data-theme');
      mb.textContent = currentMode === 'night' ? '☽ NIGHT MODE' : '☀ DAY MODE';
      mb.className = `mode-badge ${currentMode}`;
   } else {
      document.body.removeAttribute('data-mode');
      document.body.setAttribute('data-theme', t);
      let friendlyName = t.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      if (t === 'high-contrast') friendlyName = 'High Contrast';
      mb.textContent = `✨ ${friendlyName} (${currentMode.toUpperCase()})`;
      mb.className = `mode-badge custom-theme-badge`;
   }
}

function updateGlobalClock() {
  const now = new Date();
  const elDate = document.getElementById('greeting-date');
  if (elDate) elDate.innerText = now.toLocaleDateString([], {weekday:'long', month:'long', day:'numeric'}) + ' · ' + fmtTime(now);

  const hr = now.getHours();
  const newMode = (hr >= 6 && hr < 18) ? 'day' : 'night';
  if (newMode !== currentMode) {
    currentMode = newMode;
    routineChecks.forEach(c => c.done = false); sv('t2_routine', routineChecks);
    applyTheme(); renderDashboard(); renderRoutine();
  }

  if (activeSession) {
    const durEl = document.getElementById('active-duration');
    if (durEl) {
      const diff = Math.floor((Date.now() - activeSession.ts) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      let durStr = "";
      if (h > 0) durStr += String(h).padStart(2,'0') + ':';
      durStr += String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
      durEl.innerText = durStr;
    }
  }

  // ── Restored 10-Day Formula Countdown & Thousandth-Place THC Tracker ──
  const lastHit = getLastHitInfo();
  let thcInBody = getCurrentTHCInBody();
  
  if (lastHit.time === 0) {
      cachedClearanceStr = "CLEAR";
  } else {
      const targetTs = lastHit.time + (10 * 86400000); 
      const rem = targetTs - Date.now();
      if (rem <= 0) {
          cachedClearanceStr = "CLEAR";
      } else {
          const d = Math.floor(rem / 86400000);
          const h2 = Math.floor((rem % 86400000) / 3600000);
          const m2 = Math.floor((rem % 3600000) / 60000);
          const s2 = Math.floor((rem % 60000) / 1000);
          cachedClearanceStr = `${d}d ${String(h2).padStart(2,'0')}:${String(m2).padStart(2,'0')}:${String(s2).padStart(2,'0')}`;
      }
  }

  const clTab = document.getElementById('tab-clearance');
  const dashClEl = document.getElementById('dash-clear-countdown');
  const tabClEl = document.getElementById('cl-time-to-clear');
  const thcBodyEl = document.getElementById('dash-thc-body-val');

  if (dashClEl) { dashClEl.innerText = cachedClearanceStr; dashClEl.style.color = cachedClearanceStr === "CLEAR" ? "var(--green)" : "var(--text)"; }
  if (tabClEl) tabClEl.innerText = cachedClearanceStr === "CLEAR" ? "00:00:00" : cachedClearanceStr;
  if (thcBodyEl) thcBodyEl.innerText = thcInBody.toFixed(3);

  if (clTab && clTab.classList.contains('active')) renderClearance();
}

function applyAutoDosing() {
  if (!settings.autoTuneDosing) return;
  const now = Date.now();
  const fourteenDaysAgo = now - (14 * 24 * 3600 * 1000);
  let recentHits = 0;
  sessions.forEach(s => { s.hits.forEach(h => { if (h.time >= fourteenDaysAgo) recentHits++; }); });
  if (activeSession) { activeSession.hits.forEach(h => { if (h.time >= fourteenDaysAgo) recentHits++; }); }
  
  let bLow = 3, bMed = 5, bHigh = 7;
  let extraSecs = Math.floor(recentHits / 15);
  if (extraSecs > 5) extraSecs = 5;
  if(isWeenOffActive()) extraSecs = Math.floor(extraSecs / 2);
  
  settings.doseLow = bLow + extraSecs;
  settings.doseMed = bMed + extraSecs;
  settings.doseHigh = bHigh + extraSecs;
}

// ── Pharmacokinetic Decay ───────────────────────────────────────────────────
function getCurrentTHCInBody(evalTime = Date.now()) {
    let total = 0;
    const cutoff = evalTime - (30 * 24 * 3600 * 1000); 
    const BIOAVAILABILITY = 0.35; 

    const processHits = (s) => {
        const pen = penById(s.penId);
        const thcFraction = pen ? (pen.thc / 100) : 0.50; 

        s.hits.forEach(h => {
            if(h.time > cutoff && h.time <= evalTime) {
                let hitMg = 0;
                let hoursElapsed = (evalTime - h.time) / 3600000;

                if (h.directMg) {
                    hitMg = h.directMg;
                    hoursElapsed = Math.max(0, hoursElapsed - 1.0); 
                } else {
                    const rate = s.method === 'joint' ? 1.5 : 1.2;
                    const totalMgVaporized = rate * h.drawSeconds * thcFraction;
                    hitMg = totalMgVaporized * BIOAVAILABILITY;
                }
                
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

// ── Modals & Notifications ──────────────────────────────────────────────────
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

function showToast(msg, isWater=false) {
  const t = document.createElement('div');
  t.className = 'toast glass' + (isWater ? ' water' : '');
  t.innerHTML = `<span>${isWater ? '💧' : 'ℹ️'}</span> <span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(()=>t.remove(), 5000);
}

function insertTimestamp(id) {
   const el = document.getElementById(id);
   if(!el) return;
   const ts = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
   const prefix = el.value.length > 0 && !el.value.endsWith('\n') ? '\n' : '';
   el.value += `${prefix}[${ts}] `;
   el.focus();
   if(id === 'active-notes') saveActiveNotes();
   if(id === 'journal-text') saveJournal();
}

function openGuideModal() { document.getElementById('guide-modal').classList.add('open'); }
function closeGuideModal() { document.getElementById('guide-modal').classList.remove('open'); }

function completeSetup() {
  const uname = document.getElementById('setup-user-name').value.trim();
  const pname = document.getElementById('setup-pen-name').value.trim();
  const thc = parseFloat(document.getElementById('setup-pen-thc').value);
  const cbd = parseFloat(document.getElementById('setup-pen-cbd').value) || 0;
  const tol = document.getElementById('setup-user-tolerance').value;

  if(!uname || !pname || !thc) { return showCustomModal('Incomplete', 'Please fill out Name, Strain Name, and THC % to continue.', [{text:'OK'}]); }
  
  username = uname; sv('t2_username', username);
  settings.tolerance = tol; sv('t2_settings', settings);
  pens.push({ id: 'p'+Date.now(), name: pname, thc, cbd, customCName: 'CBN', customCVal: 0, notes: '' });
  sv('t2_pens', pens);
  
  document.getElementById('setup-modal').classList.remove('open');
  renderPens(); renderDashboard(); renderSettings();
  setTimeout(() => { openGuideModal(); }, 500);
}

// ── Locks & Blocking Logic ──────────────────────────────────────────────────
function togglePreflight(id) {
  let rCheck = routineChecks.find(c => c.id === id);
  if(rCheck) { rCheck.done = !rCheck.done; sv('t2_routine', routineChecks); }
  renderDashboard(); renderRoutine(); 
}

function checkAllPreflight() { 
  return routineChecks.filter(c => c.mode === 'all' || c.mode === currentMode).every(c => c.done); 
}

function getBlockingReasons(dStr) {
   let reasons = [];
   const dayTs = new Date(dStr + "T12:00:00").getTime();
   const dObj = new Date(dStr + "T12:00:00");

   if (plannedBreaks.includes(dStr)) reasons.push("Manually Planned No-Smoke Day");

   if (settings.breakStart && settings.breakEnd) {
       const bs = new Date(settings.breakStart + "T00:00:00").getTime();
       const be = new Date(settings.breakEnd + "T23:59:59").getTime();
       if (dayTs >= bs && dayTs <= be) reasons.push("Scheduled Break Range");
   }

   if (isYearlyBreakActive() && !fuckIts.includes(dStr)) {
       reasons.push(`Annual Yearly T-Break Month`);
   }

   if (settings.autoTBreak && settings.autoTBreakBypassedMonth !== dObj.getMonth() && !isYearlyBreakActive()) {
       const day = dObj.getDate();
       const week = settings.autoTBreakWeek || 4;
       const daysInMo = new Date(dObj.getFullYear(), dObj.getMonth() + 1, 0).getDate();
       let isBreakDay = false;

       if (week === 1 && day >= 1 && day <= 7) isBreakDay = true;
       else if (week === 2 && day >= 8 && day <= 14) isBreakDay = true;
       else if (week === 3 && day >= 15 && day <= 21) isBreakDay = true;
       else if (week === 4 && day >= 22 && day <= daysInMo) isBreakDay = true;

       if (isBreakDay) reasons.push(`Auto Monthly T-Break (Week ${week})`);
   }

   if (settings.enforceWeeklyLimit) {
       let ws = weekStartFromDate(dObj);
       let weekSessCount = sessions.filter(s => {
          let sts = new Date(s.ts).getTime();
          return sts >= ws && sts < ws + 7*86400000 && !s.isQuickHit;
       }).length;
       
       let limit = parseInt(settings.sessPerWeek, 10) || 5;
       if (isWeenOffActive()) limit = Math.max(1, Math.floor(limit / 2));

       if (weekSessCount >= limit) reasons.push(`Weekly Session Limit Reached (${limit})`);
   }

   if (settings.enforceRestDays && settings.restDays > 0) {
       let isRestDay = false;
       for (let i = 1; i <= settings.restDays; i++) {
           let prevDate = new Date(dayTs - i * 86400000);
           let prevDStr = ds(prevDate);
           const hasSess = sessions.some(s => ds(new Date(s.ts)) === prevDStr && !s.isQuickHit);
           if (hasSess) isRestDay = true;
       }
       if (isRestDay) reasons.push(`Mandatory ${settings.restDays}-Day Rest Period Active`);
   }

   return { reasons };
}

function checkDailyLock() {
  if (activeSession) return { locked: false };
  if (isFuckItDay()) return { locked: false };

  const now = new Date();
  const todaySess = sessions.filter(s => ds(new Date(s.ts)) === ds(now) && !s.isQuickHit);
  const hasDay = todaySess.some(s => s.mode === 'day');
  const hasNight = todaySess.some(s => s.mode === 'night');

  let getNextTarget = (hour) => {
      let t = new Date(now);
      t.setHours(hour, 0, 0, 0);
      if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
      return t.getTime();
  };

  if (currentMode === 'night') {
      if (!settings.nightSmokingEnabled) return { locked: true, msg: "Night smoking is disabled. Waiting for morning.", endTs: getNextTarget(6) };
      if (hasNight) return { locked: true, msg: "Good night. You've completed your session for today.", endTs: settings.daySmokingEnabled ? getNextTarget(6) : getNextTarget(18) };
  } else if (currentMode === 'day') {
      if (!settings.daySmokingEnabled) return { locked: true, msg: "Day smoking is disabled. Hang tight until 6 PM.", endTs: getNextTarget(18) };
      
      const mo = now.getMonth();
      const yr = now.getFullYear();
      let daySessDates = new Set();
      sessions.forEach(s => {
          const d = new Date(s.ts);
          if (d.getMonth() === mo && d.getFullYear() === yr && s.mode === 'day' && !s.isQuickHit) daySessDates.add(ds(d));
      });
      
      if (daySessDates.size >= settings.daySmokingDaysPerMonth && !daySessDates.has(ds(now))) {
           return { locked: true, msg: `Monthly day limit reached (${settings.daySmokingDaysPerMonth} days). Waiting for night mode.`, endTs: getNextTarget(18) };
      }
      
      if (hasDay) return { locked: true, msg: "You've already had your day session. Hang tight until night mode activates at 6 PM.", endTs: getNextTarget(18) };
  }
  return { locked: false };
}

function calculateUnlockTime() {
    const now = new Date();
    const todayStr = ds(now);
    const dailyStatus = checkDailyLock();
    const { reasons: todayReasons } = getBlockingReasons(todayStr);

    if (todayReasons.length === 0 && !dailyStatus.locked) return null;

    let nextUnblockedDate = null;
    let targetTs = null;

    for (let i = 0; i < 60; i++) {
        let d = new Date(now.getTime() + i * 86400000);
        let dStr = ds(d);
        const { reasons } = getBlockingReasons(dStr);

        if (i === 0) {
            if (reasons.length === 0 && dailyStatus.locked) {
                if (dailyStatus.endTs && dailyStatus.endTs > now.getTime() && ds(new Date(dailyStatus.endTs)) === todayStr) {
                     targetTs = dailyStatus.endTs;
                     break;
                }
            }
            continue; 
        } else {
            if (reasons.length === 0) {
                nextUnblockedDate = d;
                break;
            }
        }
    }

    if (targetTs) return targetTs;
    if (!nextUnblockedDate) return Date.now() + 60 * 86400000;

    let unlockDate = new Date(nextUnblockedDate);
    unlockDate.setHours(settings.daySmokingEnabled ? 6 : 18, 0, 0, 0);
    if (unlockDate.getTime() < now.getTime()) unlockDate.setDate(unlockDate.getDate() + 1);

    return unlockDate.getTime();
}

function startLockCountdown(targetTs) {
   if(lockTimerInterval) clearInterval(lockTimerInterval);
   const tick = () => {
      const rem = targetTs - Date.now();
      if(rem <= 0) { renderDashboard(); return; }
      
      const d = Math.floor(rem / 86400000);
      const h = Math.floor((rem % 86400000) / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      
      let str = "";
      if (d > 0) str += `${d}d `;
      if (h > 0 || d > 0) str += `${h}h `;
      str += `${m}m ${s}s`;
      
      const el = document.getElementById('lock-countdown');
      if (el) el.innerText = str;
   };
   tick();
   lockTimerInterval = setInterval(tick, 1000);
}

function promptFuckIt() {
  if (settings.hardcoreLockout) return showToast("Hardcore Lockout is active. Overrides disabled.", false);
  showCustomModal("Override Lock", "Are you sure you want to bypass your lock? This will use a 'Fuck It' pass to start a full Session.", [
    {text: "Cancel"},
    {text: "Yes, Override", cls: "btn-primary", onClick: () => {
       showCustomModal("Final Warning", "Bypassing breaks entirely resets your T-break period and flags your calendar. Continue?", [
         {text: "Cancel"},
         {text: "FUCK IT ⚠️", cls: "btn-danger-solid", onClick: () => executeFuckIt(today())}
       ]);
    }}
  ]);
}

function executeFuckIt(dStr = today()) {
  if(!fuckIts.includes(dStr)) fuckIts.push(dStr);
  sv('t2_fuckits', fuckIts);
  
  settings.breakStart = null; settings.breakEnd = null;
  plannedBreaks = plannedBreaks.filter(d => d !== dStr);
  settings.autoTBreakBypassedMonth = new Date().getMonth();
  
  sv('t2_settings', settings); sv('t2_planned_breaks', plannedBreaks);
  showToast("Lock bypassed."); renderDashboard(); renderCalendar();
}


// ── Dashboard Rendering ─────────────────────────────────────────────────────
function renderDashboard() {
  const dObj = new Date();
  const hr = dObj.getHours();
  const grt = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting-txt').innerText = `${grt}, ${username}.`;
  
  const ws = weekStart();
  const weekSess = sessions.filter(s => new Date(s.ts).getTime() >= ws && !s.isQuickHit);
  const weekQuickHits = sessions.filter(s => new Date(s.ts).getTime() >= ws && s.isQuickHit).length;

  const activeLimits = getActiveLimits();
  const weekCls = weekSess.length >= activeLimits.sessPerWeek ? 'danger' : 'ok';
  const remSess = Math.max(0, activeLimits.sessPerWeek - weekSess.length);
  const qhRem = Math.max(0, (parseInt(settings.quickHitsPerWeek)||3) - weekQuickHits);

  let limitsStr = `<div class="stat-value ${weekCls}">${remSess}<span class="text-sm text-muted"> left</span></div>`;
  if (isWeenOffActive()) {
      limitsStr = `<div class="stat-value ${weekCls}">${remSess}<span class="text-sm text-muted"> left</span> <span style="font-size:12px; color:var(--purple); display:block; line-height:1;">(Ween-off halved)</span></div>`;
  }

  // Mixed Thousandth-Place THC Factor & 10-Day Countdown Cards
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat glass ${weekCls}">
      <div class="stat-label">Remaining this week</div>
      ${limitsStr}
    </div>
    <div class="stat glass">
      <div class="stat-label">Est. Active THC in Body</div>
      <div class="stat-value"><span id="dash-thc-body-val">0.000</span><span class="text-sm text-muted">mg</span></div>
      <div style="font-size:11px; margin-top:4px; font-weight:700; color:var(--text3);">Realtime &alpha;/&beta; decay scale</div>
    </div>
    <div class="stat glass">
      <div class="stat-label">Clearance (10-Day Formula)</div>
      <div class="stat-value" id="dash-clear-countdown">--:--:--</div>
      <div style="font-size:11px; margin-top:4px; font-weight:700; color:var(--text3);">Time until zero THC</div>
    </div>
    <div class="stat glass ${activeSession ? 'warn' : 'ok'}">
      <div class="stat-label">Status</div>
      <div class="stat-value ${activeSession ? 'warn' : 'ok'}" style="font-size:20px;">
        ${activeSession ? 'IN PROGRESS' : 'IDLE'}
      </div>
    </div>
  `;

  const lockPane = document.getElementById('dashboard-lock');
  const mainPane = document.getElementById('dashboard-main-content');
  const unlockTs = calculateUnlockTime();

  if (unlockTs && unlockTs > Date.now() && !activeSession && !isFuckItDay()) {
      lockPane.style.display = 'block'; mainPane.style.display = 'none';

      const { reasons } = getBlockingReasons(today());
      const dailyStatus = checkDailyLock();
      let title = "Session Locked.";
      let msg = "";

      if (reasons.length > 0) {
         title = reasons.some(r=>r.includes('Yearly') || r.includes('Auto')) ? "T-Break Active" : "Enjoy your break.";
         msg = "Dashboard features locked. Next session available 6AM that day. " + reasons.join(", ");
      } else if (dailyStatus.locked) {
         msg = dailyStatus.msg;
      }

      document.getElementById('lock-title').innerText = title;
      document.getElementById('lock-msg').innerText = msg;
      startLockCountdown(unlockTs);
      
      const now = new Date();
      const usedThisMonth = fuckIts.filter(dStr => {
          const d = new Date(dStr + "T12:00:00");
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
      const fiRem = Math.max(0, settings.fuckItLimitPerMonth - usedThisMonth);

      let qhDisabled = qhRem <= 0 || Date.now() < quickHitLockoutUntil || settings.hardcoreLockout;
      let fiDisabled = fiRem <= 0 || settings.hardcoreLockout;
      let qhSubText = `${qhRem} remaining this week`;
      
      if (settings.hardcoreLockout) qhSubText = "HARDCORE LOCKOUT ACTIVE";
      else if (Date.now() < quickHitLockoutUntil) qhSubText = `Locked for ${Math.ceil((quickHitLockoutUntil - Date.now())/86400000)} days`;

      let lockActionsHtml = '<div class="stat-grid" style="margin-top:32px;">';
      lockActionsHtml += `
          <div class="lock-action-card ${qhDisabled ? 'disabled' : ''}" onclick="${!qhDisabled ? 'openQuickHitModal()' : ''}" style="border-color: var(--accent-border);">
              <div class="lock-action-icon">⚡</div>
              <div class="lock-action-title" style="color: var(--accent);">Quick Hit</div>
              <div class="lock-action-qty" style="color: var(--accent);">${qhSubText}</div>
              <div class="lock-action-desc">Take a single microdose. Bypasses lock, but initiates a ${settings.quickHitTBreak} day penalty.</div>
          </div>
      `;

      if (settings.allowFuckIt) {
          lockActionsHtml += `
              <div class="lock-action-card ${fiDisabled ? 'disabled' : ''}" onclick="${!fiDisabled ? 'promptFuckIt()' : ''}" style="border-color: rgba(224,94,94,0.3);">
                  <div class="lock-action-icon">⚠️</div>
                  <div class="lock-action-title" style="color: var(--amber);">"Fuck It" Pass</div>
                  <div class="lock-action-qty" style="color: var(--red);">${settings.hardcoreLockout ? "DISABLED" : fiRem + " remaining this month"}</div>
                  <div class="lock-action-desc">Completely override the lock and start a full session. Resets T-Break progress entirely.</div>
              </div>
          `;
      }

      lockActionsHtml += '</div>';
      document.getElementById('lock-overrides-container').innerHTML = lockActionsHtml;
      return;
  }
  
  lockPane.style.display = 'none'; mainPane.style.display = 'grid';
  if(lockTimerInterval) clearInterval(lockTimerInterval);

  if (activeSession) {
    document.getElementById('session-card-idle').style.display = 'none';
    document.getElementById('session-card-active').style.display = 'block';
    
    const pen = penById(activeSession.penId);
    let nameStr = pen ? pen.name : 'Unknown';
    document.getElementById('active-pen-name').innerText = `${nameStr} (${activeSession.method} - ${activeSession.mode} mode)`;
    document.getElementById('active-hits').innerText = activeSession.hits.length;
    document.getElementById('active-thc').innerText = sumTHC(activeSession.hits, pen, activeSession.method) + 'mg';
    document.getElementById('active-notes').value = activeSession.notes || '';
    document.getElementById('active-focus-task').innerText = activeSession.focusTask || 'None selected';

    const limits = getActiveLimits();
    const remHits = limits.maxHits - activeSession.hits.length;
    const hitTxt = document.getElementById('hits-remaining-txt');
    
    if (remHits <= 0) {
      hitTxt.innerText = "Session limit reached."; hitTxt.style.color = "var(--red)";
      document.getElementById('btn-take-hit').disabled = true;
      document.getElementById('btn-add-time').disabled = true;
      document.getElementById('wait-timer').innerText = "COMPLETE";
      document.getElementById('wait-timer').className = "timer-display expired";
      document.getElementById('wait-timer-lbl').innerText = "Log session to clear limits.";
    } else {
      hitTxt.innerText = `${remHits} doses remaining.`; hitTxt.style.color = "var(--accent)";
      document.getElementById('btn-take-hit').disabled = false;
      document.getElementById('btn-add-time').disabled = false;
    }

    const mList = document.getElementById('active-media-list');
    if(activeSession.media && activeSession.media.length > 0) {
       mList.innerHTML = activeSession.media.map((m, i) => `
         <div style="background:var(--bg2); padding:8px 12px; border-radius:8px; margin-bottom:8px; border:1px solid var(--border); font-size:12px;">
           <div class="flex-row"><strong style="color:var(--accent)">${m.title}</strong></div>
           <div class="text-muted mt-8"><a href="${m.link}" target="_blank" style="color:var(--text2)">${m.link}</a></div>
           <div class="text-right mt-8"><button class="btn btn-ghost btn-sm" style="font-size:9px;padding:2px 6px;" onclick="removeActiveMedia(${i})">Delete</button></div>
         </div>
       `).join('');
    } else {
       mList.innerHTML = `<div class="text-muted text-sm" style="font-style:italic;">No media logged yet.</div>`;
    }

  } else {
    document.getElementById('session-card-idle').style.display = 'block';
    document.getElementById('session-card-active').style.display = 'none';
    
    const applicableChecks = routineChecks.filter(c => c.mode === 'all' || c.mode === currentMode);
    
    document.getElementById('preflight-list').innerHTML = applicableChecks.map(c => {
      let badge = '';
      if (c.mode === 'day') badge = '<span class="mode-badge day" style="margin-left:8px; padding:2px 6px; font-size:8px;">DAY</span>';
      if (c.mode === 'night') badge = '<span class="mode-badge night" style="margin-left:8px; padding:2px 6px; font-size:8px;">NIGHT</span>';
      return `
      <div class="check-row" onclick="togglePreflight('${c.id}')">
        <div class="check-box ${c.done ? 'checked' : ''}">${c.done ? '✓' : ''}</div>
        <div class="check-text" style="${c.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${c.text}${badge}</div>
      </div>
    `}).join('') || '<div class="text-sm text-muted mb-8">No routine configured. Start session right away.</div>';

    const reqsUnmet = (applicableChecks.length > 0 && !checkAllPreflight());
    document.getElementById('btn-start-session').disabled = reqsUnmet;
    
    const btnQhIdle = document.getElementById('btn-quick-hit-idle');
    if (btnQhIdle) {
        let qhDisabled = qhRem <= 0 || Date.now() < quickHitLockoutUntil || settings.hardcoreLockout;
        btnQhIdle.disabled = qhDisabled;
        btnQhIdle.innerText = `Quick Hit ⚡ (${qhRem} left)`;
    }
  }

  const recent = sessions.slice().sort((a,b)=>b.ts-a.ts).slice(0,5);
  const rEl = document.getElementById('dash-recent');
  if(!recent.length) rEl.innerHTML = '<div class="empty">No history yet.</div>';
  else {
    rEl.innerHTML = recent.map(s => {
      const p = penById(s.penId) || {name: 'Deleted Pen'};
      const hStr = s.hits.length === 1 ? 'dose' : 'doses';
      const isQuick = s.isQuickHit ? '⚡' : '';
      return `<div style="padding:12px 0; border-bottom:0.5px solid var(--border)">
        <div style="font-weight:700; margin-bottom:4px;">${p.name} ${isQuick} <span class="mode-badge ${s.mode}" style="padding:2px 6px;font-size:8px">${s.mode}</span></div>
        <div class="text-sm text-muted">${new Date(s.ts).toLocaleDateString([], {month:'short', day:'numeric'})} · ${s.method} · ${s.hits.length} ${hStr}</div>
      </div>`;
    }).join('');
  }
}

// ── Draw Sequence & Hit Logging ─────────────────────────────────────────────
function openDoseGuide() {
  showCustomModal("Dose Guide", `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="background:var(--bg3); padding:16px; border-left:3px solid var(--green); border-radius:4px;">
        <strong style="color:var(--green)">Low Dose (${settings.doseLow}s)</strong>
        <div class="text-sm text-muted mt-8">Perfect for beginners or a light buzz. Enhances mood without heavy impairment. Easy to control.</div>
      </div>
      <div style="background:var(--bg3); padding:16px; border-left:3px solid var(--amber); border-radius:4px;">
        <strong style="color:var(--amber)">Medium Dose (${settings.doseMed}s)</strong>
        <div class="text-sm text-muted mt-8">Standard recreational hit. Noticeable euphoria and body relaxation.</div>
      </div>
      <div style="background:var(--bg3); padding:16px; border-left:3px solid var(--red); border-radius:4px;">
        <strong style="color:var(--red)">High Dose (${settings.doseHigh}s)</strong>
        <div class="text-sm text-muted mt-8">For experienced users. Heavy psychoactive effects, potential couch-lock and dry mouth.</div>
      </div>
    </div>
  `, [{text: "Close"}]);
}

function checkDoseWarning() {
  const d = document.getElementById('config-dose').value;
  const w = document.getElementById('dose-warning');
  if (currentMode === 'day' && d === 'high') {
    w.style.display = 'flex';
  } else {
    w.style.display = 'none';
  }
}

function updateConfigMethodUI() {
    const m = document.getElementById('config-method').value;
    document.getElementById('config-dose-vape').style.display = m !== 'edible' ? 'block' : 'none';
    document.getElementById('config-dose-edible').style.display = m === 'edible' ? 'block' : 'none';
}

function openQuickHitModal() {
    if (settings.hardcoreLockout) return showToast("Hardcore Lockout active. Feature disabled.");
    if (Date.now() < quickHitLockoutUntil) {
        let diff = Math.ceil((quickHitLockoutUntil - Date.now()) / 86400000);
        return showCustomModal("Lockout Active", `Quick hits are locked for ${diff} more days to enforce T-Break padding.`, [{text:"OK"}]);
    }
    const { reasons } = getBlockingReasons(today());
    const modeSessToday = sessions.filter(s => ds(new Date(s.ts)) === today() && s.mode === currentMode && !s.isQuickHit);
    
    if (reasons.length > 0) {
        let msg = "You are currently locked out. A Quick Hit bypasses this lock but will incur a " + settings.quickHitTBreak + " day penalty. Continue?";
        showCustomModal("⚠️ Warning", msg, [
            {text: "Cancel"},
            {text: "Take Quick Hit", cls: "btn-primary", onClick: () => openConfigModal(true, 'quick')}
        ]);
    } else if (modeSessToday.length > 0) {
        showCustomModal("⚠️ Already Smoked", `You've already had a session. Take a Quick Hit anyway?`, [
            {text: "Cancel"},
            {text: "Take Quick Hit", cls: "btn-primary", onClick: () => openConfigModal(true, 'quick')}
        ]);
    } else {
        openConfigModal(true, 'quick');
    }
}

function openConfigModal(isNewSession, type = 'normal') {
  if (pens.length === 0) return showCustomModal("Add Profile", "Add a strain in the Profiles tab first.", [{text:"OK"}]);
  if (isYearlyBreakActive() && !fuckIts.includes(today())) {
      return showCustomModal("T-Break Active", "It is your designated Yearly T-Break month. Dashboard locked.", [{text:"Understood"}]);
  }
  if (isNewSession && emergencyLinks.length === 0 && !ld('t2_ignored_safety', false)) {
      return showCustomModal("Safety First", "You have not set any emergency safety links in Settings. These are crucial if you experience anxiety while elevated.", [
          {text: "Ignore for now", onClick: () => { sv('t2_ignored_safety', true); openConfigModalBypass(isNewSession, type); }},
          {text: "Add Links", cls: "btn-primary", onClick: () => { document.getElementById('custom-modal').classList.remove('open'); switchTab('settings'); }}
      ]);
  }
  if (activeSession && activeSession.nextHitReadyAt && Date.now() < activeSession.nextHitReadyAt) {
      return showCustomModal("Wait Timer", "Your wait timer is not finished yet. Are you sure you want to take a hit early?", [
          {text: "Cancel"},
          {text: "Yes, Hit Early", cls: "btn-primary", onClick: () => openConfigModalBypass(isNewSession, type)}
      ]);
  }
  openConfigModalBypass(isNewSession, type);
}

function openConfigModalBypass(isNewSession, type) {
  pendingConfigType = type;
  document.getElementById('config-title').innerText = type === 'quick' ? "Quick Hit" : (isNewSession ? "Start Session" : "Log a Dose");
  
  document.getElementById('config-method-group').style.display = isNewSession && type !== 'quick' ? 'flex' : 'none';
  document.getElementById('config-pen-group').style.display = isNewSession ? 'flex' : 'none';
  document.getElementById('config-pen').innerHTML = pens.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  
  let doseHtml = `
    <option value="low">Low Dose (${settings.doseLow}s)</option>
    <option value="medium" selected>Medium Dose (${settings.doseMed}s)</option>
    <option value="high">High Dose (${settings.doseHigh}s)</option>
  `;
  if(settings.diabloEnabled) doseHtml += `<option value="diablo">DIABLO (${settings.doseDiablo}s)</option>`;
  document.getElementById('config-dose').innerHTML = doseHtml;

  document.getElementById('config-task-group').style.display = isNewSession && type !== 'quick' ? 'flex' : 'none';
  if(todos.length > 0) {
      document.getElementById('config-task-select').innerHTML = todos.map(t=>`<option value="${t.text}">${t.text}</option>`).join('');
  } else {
      document.getElementById('config-task-select').innerHTML = `<option value="Reflect">Just Reflect (No Tasks Added)</option>`;
  }

  selectFeel(5, 'config-feel-grid');
  updateConfigMethodUI();
  document.getElementById('config-modal').classList.add('open');
}

function closeConfigModal() { document.getElementById('config-modal').classList.remove('open'); }

function startDrawSequence() {
  const isNew = !activeSession;
  const method = isNew ? (pendingConfigType === 'quick' ? 'vape' : document.getElementById('config-method').value) : activeSession.method;
  const penId = isNew ? document.getElementById('config-pen').value : activeSession.penId;
  const feeling = parseInt(document.getElementById('config-feel-val').value);
  const task = isNew ? document.getElementById('config-task-select').value : activeSession.focusTask;
  
  if (pendingConfigType !== 'quick' && feeling <= 3) {
      return showCustomModal("Mood Check", "⚠️ Low headspace detected. Getting elevated right now might worsen your mood. Are you sure you want to continue?", [
          {text: "Cancel", onClick: () => closeConfigModal() },
          {text: "Continue", cls: "btn-primary", onClick: () => { closeConfigModal(); executeHitLogic(isNew, penId, feeling, task, method); }}
      ]);
  }

  closeConfigModal();
  executeHitLogic(isNew, penId, feeling, task, method);
}

function executeHitLogic(isNew, penId, feeling, task, method) {
    if (isNew && pendingConfigType === 'quick') {
        quickHitLockoutUntil = Date.now() + (settings.quickHitTBreak * 86400000);
        sv('t2_qh_lockout', quickHitLockoutUntil);
    }

    let doseSize = document.getElementById('config-dose').value;
    let drawSecs = doseSize === 'low' ? settings.doseLow : (doseSize === 'high' ? settings.doseHigh : (doseSize === 'diablo' ? settings.doseDiablo : settings.doseMed));
    if (isWeenOffActive()) drawSecs = Math.max(1, Math.floor(drawSecs * 0.75));

    if (method === 'vape' && pendingConfigType !== 'quick') {
        executeVapeSequence(isNew, penId, doseSize, feeling, task, method, drawSecs);
    } else {
        let hitObj = { time: Date.now(), dose: doseSize, feelingPreHit: feeling, drawSeconds: method==='joint'?drawSecs:0, penId: penId };
        if (method === 'edible') {
            hitObj.directMg = parseFloat(document.getElementById('config-edible-mg').value) || 10;
        } else if (method === 'joint' || pendingConfigType === 'quick') {
            hitObj.drawSeconds = drawSecs; 
        }

        if (isNew) {
            activeSession = { id: Date.now().toString(), ts: Date.now(), penId, mode: currentMode, method, hits: [], notes: "", media: [], focusTask: task };
        }
        finishHitDirect(hitObj);
    }
}

function executeVapeSequence(isNew, penId, dose, feeling, task, method, drawSecs) {
  if (isNew) activeSession = { id: Date.now().toString(), ts: Date.now(), penId, mode: currentMode, method, hits: [], notes: "", media: [], focusTask: task };
  
  const modal = document.getElementById('draw-modal');
  const circle = document.getElementById('draw-circle');
  modal.classList.add('open');
  circle.className = 'draw-circle'; document.getElementById('draw-instruction').innerText = "Get Ready..."; circle.innerText = "3";
  
  let countdown = 3;
  drawSequenceState.interval = setInterval(() => {
    countdown--;
    if (countdown > 0) circle.innerText = countdown;
    else { 
        clearInterval(drawSequenceState.interval); 
        circle.className = 'draw-circle breathing-in'; document.getElementById('draw-instruction').innerText = "Draw!"; circle.innerText = drawSecs;
        let left = drawSecs;
        drawSequenceState.interval = setInterval(() => {
            left--;
            if(left > 0) circle.innerText = left;
            else {
                clearInterval(drawSequenceState.interval);
                circle.className = 'draw-circle holding'; document.getElementById('draw-instruction').innerText = "Hold..."; circle.innerText = "4";
                let hold = 4;
                drawSequenceState.interval = setInterval(() => {
                    hold--;
                    if(hold > 0) circle.innerText = hold;
                    else {
                        clearInterval(drawSequenceState.interval);
                        circle.className = 'draw-circle exhaling'; document.getElementById('draw-instruction').innerText = "Release"; circle.innerText = "Ah";
                        setTimeout(() => {
                            document.getElementById('draw-modal').classList.remove('open');
                            finishHitDirect({ time: Date.now(), dose, feelingPreHit: feeling, drawSeconds: drawSecs, penId: penId });
                        }, 2000);
                    }
                }, 1000);
            }
        }, 1000);
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
        showCustomModal("Quick Hit Reflection", `
          <div class="form-group mb-16 text-left">
            <label>Optional Note</label>
            <textarea id="qh-note" class="glass" rows="3" placeholder="Why did you take this quick hit?"></textarea>
          </div>
        `, [
          {text: "Save Hit", cls: "btn-primary", onClick: () => {
              const note = document.getElementById('qh-note').value.trim();
              sessions.push({
                  id: 'qh_' + Date.now(), ts: Date.now(), endTime: Date.now(), penId: hitObj.penId || pens[0].id, mode: currentMode,
                  method: 'vape', hits: [hitObj], isQuickHit: true, notes: "⚡ Quick Hit\n" + note
              });
              sv('t2_sessions', sessions); showToast("Quick hit logged! 💧", true);
              renderDashboard(); renderCalendar(); renderStats();
          }}
        ]);
        return;
    }

    activeSession.hits.push(hitObj);
    const limits = getActiveLimits();
    activeSession.nextHitReadyAt = Date.now() + (limits.wait * 60000);
    
    const hitNum = activeSession.hits.length;
    const tsStr = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    if (!activeSession.notes) activeSession.notes = "";
    activeSession.notes += (activeSession.notes.length > 0 && !activeSession.notes.endsWith('\n') ? '\n' : '') + `[Dose ${hitNum} Taken - ${tsStr}] \n`;
    
    sv('t2_activeSession', activeSession);
    const notesEl = document.getElementById('active-notes');
    if(notesEl) { notesEl.value = activeSession.notes; notesEl.scrollTop = notesEl.scrollHeight; }

    renderDashboard();
    startWaitTimerUI();
    setTimeout(() => showToast("Drink some water! 💧", true), 1000);
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

function addTimeToWait() { if(!activeSession) return; activeSession.nextHitReadyAt += 300000; sv('t2_activeSession', activeSession); startWaitTimerUI(); }
function saveActiveNotes() { if (activeSession) { activeSession.notes = document.getElementById('active-notes').value; sv('t2_activeSession', activeSession); } }

function openMediaModal() {
   showCustomModal("Review Media", `
     <div class="form-group mb-16"><label>Title</label><input type="text" id="m-title" placeholder="e.g. Planet Earth II" class="glass"></div>
     <div class="form-group mb-16"><label>URL / Link</label><input type="url" id="m-link" class="glass" placeholder="https://..."></div>
   `, [
     {text: "Cancel"},
     {text: "Save Media", cls: "btn-primary", onClick: () => {
         const t = document.getElementById('m-title').value.trim();
         const l = document.getElementById('m-link').value.trim();
         if(!t) return showToast("Title required.");
         if(!activeSession.media) activeSession.media = [];
         activeSession.media.push({ title: t, link: l });
         sv('t2_activeSession', activeSession); renderDashboard();
     }}
   ]);
}

window.removeActiveMedia = function(idx) {
   if(!activeSession || !activeSession.media) return;
   activeSession.media.splice(idx, 1); sv('t2_activeSession', activeSession); renderDashboard();
}

// ── Recap Logic ─────────────────────────────────────────────────────────────
function endSession() { 
  if (!activeSession) return; 
  document.getElementById('recap-task-name').innerText = activeSession.focusTask || 'None';
  document.getElementById('recap-notes').value = activeSession.notes || '';
  switchTab('recap'); 
}

function renderRecap() {
  const empty = document.getElementById('recap-empty');
  const form = document.getElementById('recap-form');
  if (!activeSession) { empty.style.display = 'block'; form.style.display = 'none'; return; }
  empty.style.display = 'none'; form.style.display = 'block';
  document.getElementById('recap-hits').innerText = activeSession.hits.length;
  document.getElementById('recap-thc').innerText = sumTHC(activeSession.hits, penById(activeSession.penId), activeSession.method) + 'mg';
  document.getElementById('recap-time').innerText = formatDuration(Date.now() - activeSession.ts);
  selectFeel(5, 'recap-feel-grid');
}

function cancelRecap() {
  showCustomModal("Discard Session", "Discard session? History will not be saved.", [
    {text: "No, Keep it"},
    {text: "Discard", cls: "btn-danger", onClick: () => {
       activeSession = null; sv('t2_activeSession', null);
       if(waitTimerInterval) clearInterval(waitTimerInterval);
       switchTab('dashboard');
    }}
  ]);
}

function saveRecap() {
  if (!activeSession) return;
  activeSession.endTime = Date.now();
  activeSession.finalFeeling = parseInt(document.getElementById('recap-feel-val').value);
  activeSession.notes = document.getElementById('recap-notes').value.trim();
  activeSession.taskCompleted = document.getElementById('recap-task-done').checked;
  
  sessions.push(activeSession); sv('t2_sessions', sessions);
  activeSession = null; sv('t2_activeSession', null);
  routineChecks.forEach(c=>c.done=false); 
  sv('t2_routine', routineChecks); 
  if(waitTimerInterval) clearInterval(waitTimerInterval);
  showToast("Session Logged!"); switchTab('dashboard'); renderStats(); renderCalendar();
}

// ── Interactive Emergency ───────────────────────────────────────────────────
function generateFeelGrid(containerId) {
  const c = document.getElementById(containerId);
  if(!c) return;
  c.innerHTML = '';
  for(let i=1; i<=10; i++) {
    const btn = document.createElement('button');
    btn.className = `feel-btn`;
    btn.dataset.val = i;
    btn.innerText = i;
    btn.onclick = (e) => { e.preventDefault(); selectFeel(i, containerId); };
    c.appendChild(btn);
  }
}
function selectFeel(val, containerId) {
  const container = document.getElementById(containerId);
  const btns = container.querySelectorAll('.feel-btn');
  btns.forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = "var(--border2)";
      b.style.color = "var(--text2)";
      b.style.background = "var(--bg3)";
  });
  const target = container.querySelector(`[data-val="${val}"]`);
  if(target) {
      target.classList.add('active');
      const colorObj = getFeelColorObj(val);
      target.style.borderColor = colorObj.text;
      target.style.color = colorObj.text;
      target.style.background = colorObj.bg;
  }
  const hiddenInputId = containerId.replace('-grid', '-val');
  const inp = document.getElementById(hiddenInputId);
  if(inp) inp.value = val;
}

function openEmergency() { emStep = 0; document.getElementById('emergency-modal').classList.add('open'); renderEmergencyStep(); }
function closeEmergency() { document.getElementById('emergency-modal').classList.remove('open'); }
function renderEmergencyStep() {
  const c = document.getElementById('em-dynamic-content');
  if(emStep === 0) {
    c.innerHTML = `
      <div class="text-center">
        <div style="font-size:48px; margin-bottom:16px;">🫁</div>
        <div class="modal-title" style="color:var(--accent);">Breathe with me.</div>
        <div class="text-muted mb-24 text-sm">Inhale for 4s, hold for 4s, exhale for 6s.</div>
        <div class="draw-circle" style="margin:0 auto 32px; width:150px; height:150px; border-color:var(--text2); color:var(--text2); animation: breathe-anim 14s infinite;">Breathe</div>
        <button class="btn btn-primary btn-block" style="padding:16px;" onclick="emStep++; renderEmergencyStep()">I'm ready to ground →</button>
      </div>
    `;
  } else if(emStep >= 1 && emStep <= 5) {
    const rules = [
      {num: 5, sense: "SEE", desc: "Look around you. What are 5 things you can see right now?"},
      {num: 4, sense: "FEEL", desc: "Pay attention to your body. What are 4 things you can physically feel?"},
      {num: 3, sense: "HEAR", desc: "Listen closely. What are 3 things you can hear right now?"},
      {num: 2, sense: "SMELL", desc: "Take a deep breath. What are 2 things you can smell?"},
      {num: 1, sense: "TASTE", desc: "What is 1 thing you can taste right now?"}
    ];
    const r = rules[emStep-1];
    let inputs = '';
    for(let i=1; i<=r.num; i++) inputs += `<input type="text" class="glass mb-8" style="width:100%;" placeholder="${i}."><br>`;
    c.innerHTML = `
      <div class="text-left">
         <div class="flex-row mb-16"><div class="grounding-num" style="background:var(--accent);color:#000;padding:4px 10px;border-radius:4px;font-weight:bold;">${r.num}</div><div class="card-title" style="margin:0; font-size:16px;">Things you can ${r.sense}</div></div>
         <p class="text-muted text-sm mb-16">${r.desc}</p>${inputs}
         <div class="flex-row mt-24">
           <button class="btn btn-ghost" onclick="emStep--; renderEmergencyStep()">← Back</button>
           <button class="btn btn-primary ml-auto" style="padding:12px 24px;" onclick="emStep++; renderEmergencyStep()">Next →</button>
         </div>
      </div>
    `;
  } else if(emStep === 6) {
     let linksHtml = emergencyLinks.map(l=>`<button class="btn btn-ghost mb-8 btn-block" onclick="window.open('${l.url}','_blank')">▶ ${l.name}</button>`).join('') || '<div class="text-sm text-muted">No links saved in settings. Add some in settings!</div>';
     c.innerHTML = `
      <div class="text-center">
        <div style="font-size:48px; margin-bottom:16px;">🫂</div>
        <div class="modal-title" style="color:var(--green);">You are safe.</div>
        <div class="text-muted mb-24 text-sm">Great job. This feeling is temporary and will pass. Pick a comforting distraction below.</div>
        <div class="mb-24">${linksHtml}</div>
        <button class="btn btn-ghost btn-block" onclick="closeEmergency()">I'm okay now (Close)</button>
      </div>
     `;
  }
}

// ── History & Stats ─────────────────────────────────────────────────────────
function renderHistory() {
  const sorted = sessions.slice().sort((a,b)=>b.ts-a.ts);
  const el = document.getElementById('history-list');
  if(!sorted.length) { el.innerHTML='<div class="empty">No sessions logged yet.</div>'; return; }
  
  el.innerHTML = sorted.map(s => {
    const p = penById(s.penId) || {name: 'Deleted Pen'};
    const fColor = getFeelColorObj(s.finalFeeling);
    const durStr = s.endTime ? formatDuration(s.endTime - s.ts) : '0m';
    const sThc = sumTHC(s.hits, p, s.method);
    
    let mediaHtml = '';
    if(s.media && s.media.length > 0) {
       mediaHtml = `<div class="mt-16 mb-16 glass" style="background:var(--bg2); padding:12px; border-radius:8px;">
         <div class="text-sm text-muted mb-8" style="font-weight:700; text-transform:uppercase;">📺 Media Reviewed</div>
         ${s.media.map(m => `<div><strong style="color:var(--accent)">${m.title}</strong><br><a href="${m.link}" target="_blank" style="color:var(--text2); font-size:11px;">${m.link}</a></div>`).join('')}
       </div>`;
    }

    return `
      <div class="glass" style="padding:16px; background:var(--bg3); border:0.5px solid var(--border2); border-radius:var(--radius); margin-bottom:12px;">
        <div class="flex-row" style="margin-bottom:8px">
            <strong style="color:var(--accent); font-size:16px;">${p.name}</strong> 
            <span class="mode-badge ${s.mode} ml-auto" style="padding:2px 6px;font-size:8px">${s.mode}</span>
        </div>
        <div class="text-sm text-muted mb-16">
            ${new Date(s.ts).toLocaleDateString()} • Started: ${fmtTime(new Date(s.ts))} 
            ${s.isQuickHit ? '⚡ Quick Hit' : `• Method: ${s.method}`}
        </div>
        
        <div style="border-top:1px dashed var(--border2); padding-top:12px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <div class="text-sm text-muted"><strong>Focus:</strong> ${s.focusTask || 'N/A'} ${s.taskCompleted ? '✅' : ''}</div>
          <div class="ml-auto flex-row" style="gap:8px;">
            <div style="padding:4px 10px; border-radius:8px; background:var(--bg2); color:var(--text2); font-weight:700; font-size:12px;">⏱ ${durStr}</div>
            <div style="padding:4px 10px; border-radius:8px; background:rgba(92,170,127,0.15); color:#5caa7f; font-weight:700; font-size:12px;">~${sThc}mg</div>
            <div style="padding:4px 10px; border-radius:8px; background:${fColor.bg}; color:${fColor.text}; font-weight:700; font-size:12px;">Feel: ${s.finalFeeling||'-'}/10</div>
          </div>
        </div>
        ${mediaHtml}
        ${s.notes ? `<div class="text-sm text-muted mt-16" style="font-style:italic; white-space:pre-wrap;">"${s.notes}"</div>` : ''}
        <button class="btn btn-ghost btn-sm mt-16" onclick="deleteSession('${s.id}')">Delete Session</button>
      </div>
    `;
  }).join('');
}

function deleteSession(id) {
  showCustomModal("Delete Record", "Permanently remove this session?", [
    {text: "Cancel"},
    {text: "Delete", cls: "btn-danger-solid", onClick: () => {
       sessions = sessions.filter(s=>s.id !== id); sv('t2_sessions', sessions); renderHistory(); renderDashboard(); renderCalendar(); renderStats();
    }}
  ]);
}

function renderStats() {
  const totalSess = sessions.length;
  const totalHits = sessions.reduce((acc, s) => acc + s.hits.length, 0);
  const totalThc = sessions.reduce((acc, s) => acc + sumTHC(s.hits, penById(s.penId), s.method), 0);
  const qhCount = sessions.filter(s=>s.isQuickHit).length;
  
  let daysActive = 1;
  if (totalSess > 0) {
      const first = Math.min(...sessions.map(s => s.ts));
      daysActive = Math.max(1, Math.ceil((Date.now() - first) / 86400000));
  }

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat glass"><div class="stat-label">Total Sessions</div><div class="stat-value">${totalSess}</div></div>
    <div class="stat glass"><div class="stat-label">Total Hits/Doses</div><div class="stat-value">${totalHits}</div></div>
    <div class="stat glass"><div class="stat-label">Total Quick Hits</div><div class="stat-value" style="color:var(--amber)">${qhCount}</div></div>
    <div class="stat glass"><div class="stat-label">Est. Total THC</div><div class="stat-value">${Math.round(totalThc)}<span class="text-sm text-muted">mg</span></div></div>
    <div class="stat glass"><div class="stat-label">Avg Sess / Week</div><div class="stat-value">${((totalSess / daysActive)*7).toFixed(1)}</div></div>
    <div class="stat glass"><div class="stat-label">Days Logged</div><div class="stat-value">${daysActive}</div></div>
  `;
}

// ── Calendar ────────────────────────────────────────────────────────────────
let calYear = new Date().getFullYear(), calMonth = new Date().getMonth();

function renderCalendar() {
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('cal-month-lbl').textContent=months[calMonth]+' '+calYear;
  const firstDay=new Date(calYear,calMonth,1).getDay();
  const offset=firstDay===0?6:firstDay-1;
  const daysInMo=new Date(calYear,calMonth+1,0).getDate();
  const todayStr=today();
  const dayMap={};
  
  sessions.forEach(s=>{
    const d=ds(new Date(s.ts));
    if(!dayMap[d])dayMap[d]={ day:false, night:false, sList:[], hasQuickHit:false };
    if(!s.isQuickHit) dayMap[d][s.mode]=true;
    if(s.isQuickHit) dayMap[d].hasQuickHit=true;
    dayMap[d].sList.push(s);
  });
  
  let cells='';
  for(let i=0;i<offset;i++) cells+='<div style="aspect-ratio:1"></div>';
  
  for(let d=1;d<=daysInMo;d++){
    const dStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dm=dayMap[dStr]||{sList:[]};
    const isT=dStr===todayStr, isF=dStr>todayStr;
    let bg = 'var(--bg3)', border = 'transparent';
    let extraCls = dStr === selectedCalDate ? 'selected-cal-day' : '';
    
    if(dm.day && dm.night) { bg = 'rgba(224,94,94,0.15)'; border = 'var(--red)'; }
    else if(dm.day) { bg = 'rgba(74,159,196,0.15)'; border = '#4a9fc4'; }
    else if(dm.night) { bg = 'rgba(212,168,67,0.15)'; border = 'var(--amber)'; }
    
    let style = `background:${bg}; border:1px solid ${border}; color:var(--text);`;
    if(isT && dStr !== selectedCalDate) style += `box-shadow: 0 0 0 2px var(--border2);`;
    if(isF) style += `opacity: 0.5;`;

    let icon = '';
    let dayReasons = getBlockingReasons(dStr).reasons;
    if (fuckIts.includes(dStr)) icon = '⚠️';
    else if (dayReasons.length > 0) icon = '🚭'; 
    else if (dm.sList.length > 0 && !dm.sList.every(s=>s.isQuickHit)) icon = '✅'; 
    
    if (isF && dayReasons.length === 0 && !icon) icon = '<span style="opacity:0.3;">✅</span>';
    if (dm.hasQuickHit) icon = icon && !icon.includes('✅') ? icon + '⚡' : '⚡';

    cells+=`
    <div class="cal-cell" style="aspect-ratio:1;">
      <div class="cal-cell-inner glass ${extraCls}" style="${style}" onclick="showCalDetails('${dStr}')">${d}</div>
      ${icon ? `<div class="cal-badge">${icon}</div>` : ''}
    </div>`;
  }
  document.getElementById('cal-grid').innerHTML=cells;
  if (selectedCalDate) showCalDetailsPane(selectedCalDate);
}

function calPrev(){calMonth--;if(calMonth<0){calMonth=11;calYear--;} selectedCalDate=null; renderCalendar();}
function calNext(){calMonth++;if(calMonth>11){calMonth=0;calYear++;} selectedCalDate=null; renderCalendar();}
function previewCalDetails(dStr) { showCalDetailsPane(dStr); }
function clearCalPreview() {
   if (selectedCalDate) showCalDetailsPane(selectedCalDate);
   else document.getElementById('cal-details-pane').innerHTML = `<div class="text-center text-muted" style="padding:40px 0;">Select a day to view details.</div>`;
}
function showCalDetails(dStr) { selectedCalDate = dStr; renderCalendar(); }

function showCalDetailsPane(dStr) {
  const dObj = new Date(dStr + "T12:00:00");
  const dSess = sessions.filter(s => ds(new Date(s.ts)) === dStr);
  const pane = document.getElementById('cal-details-pane');
  
  let plannedText = plannedBreaks.includes(dStr) ? 'Remove Planned Break' : 'Set No-Smoke Day';
  let planBtn = `
  <div class="toggle-row mt-16" style="border-top:1px dashed var(--border2); padding-top:16px;">
      <label class="toggle-label" for="cal-planned-break">${plannedText}</label>
      <label class="toggle"><input type="checkbox" id="cal-planned-break" ${plannedBreaks.includes(dStr) ? 'checked' : ''} onchange="togglePlannedBreak('${dStr}')"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
  </div>`;

  let blockHtml = '';
  let blockReasons = getBlockingReasons(dStr).reasons;
  if (blockReasons.length > 0) {
      blockHtml = `<div class="alert warn mt-16" style="flex-direction:column; align-items:flex-start; background:rgba(212,168,67,0.1);">
        <strong style="margin-bottom:4px; font-size:12px;"><span style="font-size:14px;">🚭</span> Blocked By:</strong>
        ${blockReasons.map(r => `<div style="font-size:11px;">• ${r}</div>`).join('')}
      </div>`;
  }

  if(dSess.length === 0) { 
    const badge = fuckIts.includes(dStr) ? '⚠️ Bypassed' : (dStr > today() ? 'Future Day' : 'Sober day!');
    pane.innerHTML = `<div class="flex-row"><div class="card-title" style="margin:0;">${dObj.toDateString()}</div></div><div class="empty mt-16 mb-16">${badge}</div>${blockHtml}${planBtn}`; 
    return; 
  }
  
  const totalThc = Math.round(dSess.reduce((a, s) => a + sumTHC(s.hits, penById(s.penId), s.method), 0));
  pane.innerHTML = `
    <div class="card-title">${dObj.toDateString()} ${fuckIts.includes(dStr) ? '<span style="color:var(--amber);">⚠️ Bypassed Lock</span>' : ''}</div>
    <div class="flex-row mb-16"><div class="stat glass" style="flex:1;padding:10px;">Est. THC: ${totalThc}mg</div></div>
    ${dSess.map(s=>{
      const qb = s.isQuickHit ? '⚡ Quick Hit' : s.method;
      return `<div class="text-sm text-muted mb-8">• ${penById(s.penId)?.name||'Unknown'} (${s.mode}) [${qb}] - ${s.hits.length} doses</div>`;
    }).join('')}
    ${blockHtml}
    ${planBtn}
  `;
}

function togglePlannedBreak(dStr) {
  if (plannedBreaks.includes(dStr)) plannedBreaks = plannedBreaks.filter(d => d !== dStr);
  else plannedBreaks.push(dStr);
  sv('t2_planned_breaks', plannedBreaks); renderCalendar(); renderDashboard();
}

// ── Clearance Tests Tab ─────────────────────────────────────────────────────
function renderClearance() {
    const lastHit = getLastHitInfo();
    const salivaStatusEl = document.getElementById('cl-saliva-status');
    const urineStatusEl = document.getElementById('cl-urine-status');
    const salivaBar = document.getElementById('cl-saliva-bar');
    const urineBar = document.getElementById('cl-urine-bar');

    if (lastHit.time === 0) {
        salivaStatusEl.innerHTML = `<span style="color:var(--green)">CLEAR</span>`;
        urineStatusEl.innerHTML = `<span style="color:var(--green)">CLEAR</span>`;
        salivaBar.style.width = '100%'; salivaBar.style.background = 'var(--green)';
        urineBar.style.width = '100%'; urineBar.style.background = 'var(--green)';
        return;
    }

    const now = Date.now();
    const hoursSince = (now - lastHit.time) / 3600000;
    const pen = penById(lastHit.penId);
    
    let M = 1.0;
    if (settings.tolerance === 'low') M = 0.6;
    if (settings.tolerance === 'high') M = 1.6;
    const penTHC = pen ? pen.thc : 75;
    M = Math.max(0.4, Math.min(2.0, M + ((penTHC - 50) / 100 * 0.3))); 

    const sMed = 48 * Math.min(1.5, M); 
    let sStatus = '', sColor = '';
    if (hoursSince < (24*M)) { sStatus = 'HIGH RISK'; sColor = 'var(--red)'; }
    else if (hoursSince < sMed) { sStatus = 'MEDIUM RISK'; sColor = 'var(--amber)'; }
    else { sStatus = 'CLEAR'; sColor = 'var(--green)'; }
    salivaStatusEl.innerHTML = `<span style="color:${sColor}">${sStatus}</span>`;
    salivaBar.style.width = `${Math.min(100, (hoursSince / sMed) * 100)}%`; salivaBar.style.background = sColor;
    document.getElementById('cl-saliva-desc').innerText = hoursSince >= sMed ? 'Safe window reached.' : `Est. clear in: ${(sMed - hoursSince).toFixed(1)} hrs`;

    const uMed2 = 60 * Math.min(1.6, M); 
    let uStatus = '', uColor = '';
    if (hoursSince < (12*M)) { uStatus = 'MEDIUM RISK (Delay)'; uColor = 'var(--amber)'; }
    else if (hoursSince < (36*M)) { uStatus = 'HIGH RISK'; uColor = 'var(--red)'; }
    else if (hoursSince < uMed2) { uStatus = 'MEDIUM RISK (Clearing)'; uColor = 'var(--amber)'; }
    else { uStatus = 'CLEAR'; uColor = 'var(--green)'; }
    urineStatusEl.innerHTML = `<span style="color:${uColor}">${uStatus}</span>`;
    urineBar.style.width = `${Math.min(100, (hoursSince / uMed2) * 100)}%`; urineBar.style.background = uColor;
    document.getElementById('cl-urine-desc').innerText = hoursSince >= uMed2 ? 'Safe window reached.' : `Est. clear in: ${(uMed2 - hoursSince).toFixed(1)} hrs`;
}

// ── Tab Management ──────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.content').forEach(el => el.classList.remove('active'));
  
  const tabs = ['dashboard', 'recap', 'history', 'stats', 'calendar', 'clearance', 'equipment', 'pens', 'routine', 'todo', 'goals', 'guide', 'settings'];
  
  const idx = tabs.indexOf(name);
  if (idx >= 0) { 
      const targetBtn = document.querySelectorAll('.nav-item')[idx];
      const targetContent = document.getElementById('tab-' + name);
      
      if (targetBtn) targetBtn.classList.add('active'); 
      if (targetContent) targetContent.classList.add('active'); 
      
      let niceName = name.toUpperCase().replace('-', ' ');
      if (name === 'todo') niceName = 'TASKS & JOURNAL';
      document.getElementById('topbar-title').innerText = niceName;
  }
  
  const sidebarEl = document.getElementById('sidebar-nav');
  const overlayEl = document.getElementById('mobile-overlay');
  if (sidebarEl) sidebarEl.classList.remove('open');
  if (overlayEl) overlayEl.classList.remove('open');
  
  if (name === 'dashboard') renderDashboard();
  if (name === 'recap') renderRecap();
  if (name === 'history') renderHistory();
  if (name === 'stats') renderStats();
  if (name === 'calendar') renderCalendar();
  if (name === 'clearance') renderClearance();
  if (name === 'equipment') renderEquipment();
  if (name === 'pens') renderPens();
  if (name === 'routine') renderRoutine();
  if (name === 'todo') { renderTodo(); renderSongs(); }
  if (name === 'goals') renderGoals();
  if (name === 'guide') renderRules();
  if (name === 'settings') renderSettings();
}

// ── Checklists ──────────────────────────────────────────────────────────────
function renderEquipment() {
    document.getElementById('equipment-list').innerHTML = equipment.map(e => `
        <div class="glass" style="background:var(--bg3); padding:16px; border:1px solid var(--border2); border-radius:8px;">
            <strong style="color:var(--accent);">${e.text}</strong>
            <p class="text-sm text-muted mt-8" style="margin-bottom:0;">${e.desc}</p>
        </div>
    `).join('') || '<div class="empty">No equipment logged.</div>';
}

function renderTodo() { document.getElementById('todo-list').innerHTML = todos.map(t => `<div class="check-row" onclick="removeTodo('${t.id}')"><div class="check-box"></div><div class="check-text">${t.text}</div></div>`).join('') || '<div class="empty text-sm">Tasks clear!</div>'; }
function addTodo() { const val = document.getElementById('new-todo-input').value.trim(); if(val) { todos.push({ id:'t'+Date.now(), text: val }); sv('t2_todos', todos); document.getElementById('new-todo-input').value = ''; renderTodo(); } }
function removeTodo(id) { todos = todos.filter(t=>t.id!==id); sv('t2_todos', todos); renderTodo(); }

function renderRoutine() {
  const list = document.getElementById('routine-list');
  const all = routineChecks.filter(c => c.mode === 'all');
  const day = routineChecks.filter(c => c.mode === 'day');
  const night = routineChecks.filter(c => c.mode === 'night');

  const renderGroup = (title, items, badgeClass, badgeText) => {
     if (!items.length) return '';
     let groupHtml = `<div class="text-sm text-muted mt-16 mb-8" style="font-weight:bold; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border2); padding-bottom:4px;">${title}</div>`;
     groupHtml += items.map(h => `
        <div class="check-row" onclick="toggleHabit('${h.id}')">
          <div class="check-box ${h.done ? 'checked' : ''}">${h.done ? '✓' : ''}</div>
          <div class="check-text" style="${h.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${h.text} ${badgeText ? `<span class="mode-badge ${badgeClass}" style="margin-left:8px; padding:2px 6px; font-size:8px;">${badgeText}</span>` : ''}</div>
          <button class="btn btn-ghost btn-sm ml-auto" onclick="event.stopPropagation(); removeHabit('${h.id}')">Del</button>
        </div>
     `).join('');
     return groupHtml;
  };
  list.innerHTML = renderGroup('Every Session', all, '', '') + renderGroup('Day Mode Only', day, 'day', 'DAY') + renderGroup('Night Mode Only', night, 'night', 'NIGHT') || '<div class="empty">No requirements added.</div>';
}
function toggleHabit(id) { const h = routineChecks.find(x => x.id === id); if(h) h.done = !h.done; sv('t2_routine', routineChecks); renderRoutine(); renderDashboard(); }
function addHabit() { const val = document.getElementById('new-habit-input').value.trim(); const mode = document.getElementById('new-habit-mode').value; if(val) { routineChecks.push({ id:'r'+Date.now(), text: val, done: false, mode: mode }); sv('t2_routine', routineChecks); document.getElementById('new-habit-input').value = ''; renderRoutine(); renderDashboard(); } }
function removeHabit(id) { routineChecks = routineChecks.filter(x => x.id !== id); sv('t2_routine', routineChecks); renderRoutine(); renderDashboard(); }
function resetRoutine() { routineChecks.forEach(h => h.done = false); sv('t2_routine', routineChecks); renderRoutine(); renderDashboard(); showToast("Checks reset"); }

function renderSongs() { document.getElementById('song-list').innerHTML = songs.map(s => `<div class="check-row" onclick="removeSong('${s.id}')"><div class="check-box" style="border-radius:50%">🎵</div><div class="check-text">${s.text}</div></div>`).join('') || '<div class="empty text-sm">No songs queued.</div>'; }
function addSong() { const val = document.getElementById('new-song-input').value.trim(); if(val) { songs.push({ id:'s'+Date.now(), text: val }); sv('t2_songs', songs); document.getElementById('new-song-input').value = ''; renderSongs(); } }
function removeSong(id) { songs = songs.filter(x => x.id !== id); sv('t2_songs', songs); renderSongs(); }

function renderGoals() { document.getElementById('goals-list').innerHTML = goals.map(g => `<div class="check-row" onclick="toggleGoal('${g.id}')"><div class="check-box ${g.done ? 'checked' : ''}">${g.done ? '✓' : ''}</div><div class="check-text" style="${g.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${g.text}</div><button class="btn btn-ghost btn-sm ml-auto" onclick="event.stopPropagation(); removeGoal('${g.id}')">Del</button></div>`).join('') || '<div class="empty text-sm">No goals set yet. Add some milestones.</div>'; }
function addGoal() { const v = document.getElementById('new-goal-input').value.trim(); if(v) { goals.push({ id:'g'+Date.now(), text: v, done: false }); sv('t2_goals', goals); document.getElementById('new-goal-input').value = ''; renderGoals(); } }
function removeGoal(id) { goals = goals.filter(g => g.id !== id); sv('t2_goals', goals); renderGoals(); }
function toggleGoal(id) { const g = goals.find(x => x.id === id); if(g) g.done = !g.done; sv('t2_goals', goals); renderGoals(); }

function renderRules() {
   const el = document.getElementById('rules-list');
   if (!rules.length) { el.innerHTML = '<div class="empty">No rules defined.</div>'; return; }
   el.innerHTML = rules.map((r, i) => `
      <div class="glass flex-row" style="padding:16px; background:var(--bg3); border:1px solid var(--border2); border-radius:8px;">
         <strong style="color:var(--accent); font-size:16px; width:30px; text-align:center;">${String.fromCharCode(65 + i)}</strong>
         <div style="flex:1; font-size:13px;">${r.text}</div>
         <button class="btn btn-ghost btn-sm ml-auto" onclick="removeRule('${r.id}')">Del</button>
      </div>
   `).join('');
}
function addRule() { const inp = document.getElementById('new-rule-input'); if (inp.value.trim()) { rules.push({ id: 'ru' + Date.now(), text: inp.value.trim() }); sv('t2_rules', rules); inp.value = ''; renderRules(); } }
function removeRule(id) { rules = rules.filter(r => r.id !== id); sv('t2_rules', rules); renderRules(); }

function saveJournal() { const el = document.getElementById('journal-text'); if(el) { journalText = el.value; sv('t2_journal', journalText); } }

// ── Pens / Profiles ─────────────────────────────────────────────────────────
function getCompoundsHtml(p, seconds) {
  let html = `<div class="mt-8" style="display:inline-block; font-family:'Space Mono',monospace; font-size:11px; text-align:left; margin:0 auto;">`;
  const thcMg = ((p.thc || 0) / 100 * seconds).toFixed(1);
  html += `<div style="margin-bottom:2px;">- ${thcMg}mg <span style="color:var(--text3); font-weight:bold; font-size:10px; text-transform:uppercase;">[thc]</span></div>`;
  if (p.cbd > 0) { html += `<div style="margin-bottom:2px;">- ${((p.cbd) / 100 * seconds).toFixed(1)}mg <span style="color:var(--text3); font-weight:bold; font-size:10px; text-transform:uppercase;">[cbd]</span></div>`; }
  if (p.customCVal > 0) { html += `<div style="margin-bottom:2px;">- ${((p.customCVal) / 100 * seconds).toFixed(1)}mg <span style="color:var(--text3); font-weight:bold; font-size:10px; text-transform:uppercase;">[${(p.customCName || 'CBN').toLowerCase()}]</span></div>`; }
  html += `</div>`;
  return html;
}

function renderPens() {
  const list = document.getElementById('pen-db-list');
  if(!pens.length) { list.innerHTML = '<div class="empty">No active profiles.</div>'; }
  else {
    list.innerHTML = pens.map(p => {
      let diabloHtml = '';
      if (settings.diabloEnabled) {
        diabloHtml = `<div class="text-center" style="background:rgba(162,117,255,0.05); padding:12px; border-radius:8px; flex:1; min-width:120px; border:1px solid rgba(162,117,255,0.2);">
            <div style="color:var(--purple); font-weight:700; font-size:12px;">Diablo (${settings.doseDiablo}s)</div>
            ${getCompoundsHtml(p, settings.doseDiablo)}
        </div>`;
      }
      return `
      <div class="glass" style="background:var(--bg3); padding:16px; border-radius:var(--radius); border:0.5px solid var(--border2); margin-bottom:16px;">
         <div class="flex-row mb-16">
           <div>
             <strong style="color:var(--accent); font-size:16px;">${p.name}</strong>
             <div class="text-sm text-muted mt-8">THC: ${p.thc}% ${p.cbd ? ' | CBD: '+p.cbd+'%' : ''} ${p.customCVal ? ' | ' + p.customCName + ': ' + p.customCVal + '%' : ''}</div>
             ${p.notes ? `<div class="text-sm text-muted mt-8" style="font-style:italic;">Notes: ${p.notes}</div>` : ''}
           </div>
           <div class="flex-row gap-8 ml-auto">
             <button class="btn btn-ghost btn-sm" onclick="editPen('${p.id}')">Edit</button>
             <button class="btn btn-ghost btn-sm" onclick="retirePen('${p.id}')">Retire 🫡</button>
             <button class="btn btn-ghost btn-sm" onclick="deletePen('${p.id}')">Del</button>
           </div>
         </div>
         <div style="background:var(--bg2); padding:16px; border-radius:8px;">
           <div class="text-sm mb-16" style="font-weight:700; color:var(--text2);">Dosage Profile (Vape Est.)</div>
           <div class="flex-row" style="gap:12px; align-items:stretch;">
              <div class="text-center" style="background:rgba(92,170,127,0.05); padding:12px; border-radius:8px; flex:1; min-width:120px; border:1px solid rgba(92,170,127,0.2);">
                  <div style="color:var(--green); font-weight:700; font-size:12px;">Low Dose (${settings.doseLow}s)</div>
                  ${getCompoundsHtml(p, settings.doseLow)}
              </div>
              <div class="text-center" style="background:rgba(212,168,67,0.05); padding:12px; border-radius:8px; flex:1; min-width:120px; border:1px solid rgba(212,168,67,0.2);">
                  <div style="color:var(--amber); font-weight:700; font-size:12px;">Med Dose (${settings.doseMed}s)</div>
                  ${getCompoundsHtml(p, settings.doseMed)}
              </div>
              <div class="text-center" style="background:rgba(224,94,94,0.05); padding:12px; border-radius:8px; flex:1; min-width:120px; border:1px solid rgba(224,94,94,0.2);">
                  <div style="color:var(--red); font-weight:700; font-size:12px;">High Dose (${settings.doseHigh}s)</div>
                  ${getCompoundsHtml(p, settings.doseHigh)}
              </div>
              ${diabloHtml}
           </div>
         </div>
      </div>`;
    }).join('');
  }

  const graveList = document.getElementById('graveyard-list');
  if(!graveyard.length) { graveList.innerHTML = '<div class="empty">No profiles in the graveyard.</div>'; }
  else {
    graveList.innerHTML = graveyard.map(p => `
        <div class="glass" style="background:var(--bg2); padding:16px; border-radius:var(--radius); border:1px solid var(--border2); opacity:0.7;">
           <div class="flex-row">
             <strong style="color:var(--text2); text-decoration:line-through; font-size:16px;">${p.name}</strong>
             <span class="ml-auto" style="font-size:18px;">🥀</span>
           </div>
        </div>`).join('');
  }
}

function addPen() {
  const name = document.getElementById('pen-name').value.trim(), thc = parseFloat(document.getElementById('pen-thc').value);
  if(!name||!thc) return showCustomModal("Error", "Required: Strain Name & THC %", [{text: "OK"}]);
  const cbd = parseFloat(document.getElementById('pen-cbd').value) || 0;
  const cVal = parseFloat(document.getElementById('pen-c-val').value) || 0;
  const cName = document.getElementById('pen-c-name').value.trim() || 'CBN';
  const notes = document.getElementById('pen-notes').value.trim();

  pens.push({id:'p'+Date.now(), name, thc, cbd, customCVal: cVal, customCName: cName, notes});
  sv('t2_pens', pens); 
  document.getElementById('pen-name').value=''; document.getElementById('pen-thc').value='';
  document.getElementById('pen-cbd').value=''; document.getElementById('pen-c-val').value=''; document.getElementById('pen-notes').value='';
  renderPens(); showToast("Profile added");
}

function editPen(id) {
  const p = pens.find(x => x.id === id);
  if (!p) return;
  document.getElementById('edit-pen-id').value = p.id;
  document.getElementById('edit-pen-name').value = p.name;
  document.getElementById('edit-pen-thc').value = p.thc;
  document.getElementById('edit-pen-cbd').value = p.cbd || 0;
  document.getElementById('edit-pen-c-val').value = p.customCVal || 0;
  document.getElementById('edit-pen-c-name').value = p.customCName || 'CBN';
  document.getElementById('edit-pen-notes').value = p.notes || '';
  document.getElementById('edit-pen-modal').classList.add('open');
}
function closeEditPenModal() { document.getElementById('edit-pen-modal').classList.remove('open'); }
function savePenEdit() {
  const id = document.getElementById('edit-pen-id').value;
  const p = pens.find(x => x.id === id);
  if (p) {
      p.name = document.getElementById('edit-pen-name').value.trim();
      p.thc = parseFloat(document.getElementById('edit-pen-thc').value);
      p.cbd = parseFloat(document.getElementById('edit-pen-cbd').value) || 0;
      p.customCVal = parseFloat(document.getElementById('edit-pen-c-val').value) || 0;
      p.customCName = document.getElementById('edit-pen-c-name').value.trim() || 'CBN';
      p.notes = document.getElementById('edit-pen-notes').value.trim();
      sv('t2_pens', pens); renderPens(); closeEditPenModal(); showToast("Profile updated!");
      if(activeSession && activeSession.penId === id) renderDashboard();
  }
}

function deletePen(id) {
  showCustomModal("Delete Profile", "Permanently delete this profile? History remains.", [
    {text: "Cancel"}, {text: "Delete", cls: "btn-danger", onClick: () => { pens = pens.filter(p=>p.id!==id); sv('t2_pens', pens); renderPens(); }}
  ]);
}
function retirePen(id) {
  showCustomModal("Retire Profile", "Is this strain/pen completely empty? It will be moved to the graveyard.", [
    {text: "Cancel"}, {text: "Retire 🥀", cls: "btn-primary", onClick: () => {
         const p = pens.find(x => x.id === id);
         if(p) { graveyard.push(p); pens = pens.filter(x => x.id !== id); sv('t2_pens', pens); sv('t2_graveyard', graveyard); renderPens(); showToast("Profile sent to the graveyard."); }
    }}
  ]);
}

// ── Settings & Backup ───────────────────────────────────────────────────────
function renderSettings() {
  const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
  const setCheck = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };

  setVal('s-username', username);
  setVal('s-tolerance', settings.tolerance || 'medium');
  setVal('s-theme', settings.theme || 'auto');

  setVal('s-maxHits', settings.maxHits);
  setVal('s-sessPerWeek', settings.sessPerWeek);
  setVal('s-quickHitsPerWeek', settings.quickHitsPerWeek);
  setVal('s-quickHitTBreak', settings.quickHitTBreak);
  setVal('s-nightWait', settings.nightWait);
  setVal('s-dayWait', settings.dayWait);
  
  setVal('s-doseLow', settings.doseLow);
  setVal('s-doseMed', settings.doseMed);
  setVal('s-doseHigh', settings.doseHigh);
  setVal('s-doseDiablo', settings.doseDiablo);

  setCheck('s-autoTuneDosing', !!settings.autoTuneDosing);
  setCheck('s-diabloEnabled', !!settings.diabloEnabled);
  document.getElementById('diablo-row').style.display = settings.diabloEnabled ? 'flex' : 'none';

  const isAuto = !!settings.autoTuneDosing;
  ['s-doseLow', 's-doseMed', 's-doseHigh'].forEach(id => {
      const el = document.getElementById(id);
      if(el) { el.disabled = isAuto; el.style.opacity = isAuto ? '0.5' : '1'; }
  });
  
  setCheck('s-enforceWeeklyLimit', !!settings.enforceWeeklyLimit);
  setCheck('s-enforceRestDays', !!settings.enforceRestDays);
  
  setVal('s-restDays', settings.restDays);
  if(document.getElementById('restDaysLbl')) document.getElementById('restDaysLbl').innerText = settings.restDays;

  setVal('s-yearlyBreakMonth', settings.yearlyBreakMonth);
  setCheck('s-weenOffEnabled', !!settings.weenOffEnabled);

  setVal('s-breakStart', settings.breakStart || '');
  setVal('s-breakEnd', settings.breakEnd || '');
  setCheck('s-hardcoreLockout', !!settings.hardcoreLockout);

  setCheck('s-allowFuckIt', !!settings.allowFuckIt);
  setVal('s-fuckItLimitPerMonth', settings.fuckItLimitPerMonth);

  renderEmergencyLinksSettings();
}

function saveSettings(silent = false) {
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : null; };
  const getInt = (id, dflt=0) => { const v = getVal(id); return v ? parseInt(v, 10) : dflt; };
  const getCheck = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };

  username = getVal('s-username'); sv('t2_username', username);
  settings.tolerance = getVal('s-tolerance');
  settings.theme = getVal('s-theme');

  settings.maxHits = getInt('s-maxHits', settings.maxHits);
  settings.sessPerWeek = getInt('s-sessPerWeek', settings.sessPerWeek);
  settings.quickHitsPerWeek = getInt('s-quickHitsPerWeek', settings.quickHitsPerWeek);
  settings.quickHitTBreak = getInt('s-quickHitTBreak', settings.quickHitTBreak);
  settings.nightWait = getInt('s-nightWait', settings.nightWait);
  settings.dayWait = getInt('s-dayWait', settings.dayWait);
  
  settings.diabloEnabled = getCheck('s-diabloEnabled');
  settings.doseDiablo = getInt('s-doseDiablo', settings.doseDiablo);

  settings.autoTuneDosing = getCheck('s-autoTuneDosing');
  if (!settings.autoTuneDosing) {
      settings.doseLow = getInt('s-doseLow', settings.doseLow);
      settings.doseMed = getInt('s-doseMed', settings.doseMed);
      settings.doseHigh = getInt('s-doseHigh', settings.doseHigh);
  } else { applyAutoDosing(); }
  
  settings.enforceWeeklyLimit = getCheck('s-enforceWeeklyLimit');
  settings.enforceRestDays = getCheck('s-enforceRestDays');
  settings.restDays = getInt('s-restDays', settings.restDays);

  settings.allowFuckIt = getCheck('s-allowFuckIt');
  settings.fuckItLimitPerMonth = getInt('s-fuckItLimitPerMonth', settings.fuckItLimitPerMonth);

  settings.yearlyBreakMonth = getVal('s-yearlyBreakMonth') || 'none';
  settings.weenOffEnabled = getCheck('s-weenOffEnabled');

  settings.breakStart = getVal('s-breakStart');
  settings.breakEnd = getVal('s-breakEnd');
  settings.hardcoreLockout = getCheck('s-hardcoreLockout');

  sv('t2_settings', settings);
  applyTheme();
  if (!silent) showToast("Settings saved!");
  renderDashboard();
  renderSettings(); 
}

function renderEmergencyLinksSettings() {
    const el = document.getElementById('settings-emergency-list');
    if (!emergencyLinks.length) { el.innerHTML = '<div class="text-sm text-muted">No safety links added.</div>'; return; }
    el.innerHTML = emergencyLinks.map((em, i) => `
        <div class="glass flex-row" style="padding:10px; background:var(--bg2); border:1px solid var(--border2); border-radius:8px;">
           <div style="flex:1; font-size:12px;"><strong>${em.name}</strong><br><span class="text-muted">${em.url}</span></div>
           <button class="btn btn-ghost btn-sm" onclick="removeEmergencyLink(${i})">Del</button>
        </div>
    `).join('');
}
function addEmergencyLink() {
    const name = document.getElementById('new-em-name').value.trim();
    const url = document.getElementById('new-em-url').value.trim();
    if(name && url) {
        emergencyLinks.push({name, url});
        sv('t2_emergency', emergencyLinks);
        document.getElementById('new-em-name').value = '';
        document.getElementById('new-em-url').value = '';
        renderEmergencyLinksSettings();
    }
}
function removeEmergencyLink(i) { emergencyLinks.splice(i, 1); sv('t2_emergency', emergencyLinks); renderEmergencyLinksSettings(); }

function resetToDefaults() {
    showCustomModal("Restore Defaults", "Are you sure you want to revert all settings to their default values? This does NOT delete your logs or profiles.", [
        {text: "Cancel"},
        {text: "Restore", cls: "btn-primary", onClick: () => {
            settings = { ...DEFAULT_SETTINGS };
            sv('t2_settings', settings);
            showToast("Settings reverted.");
            renderSettings();
            applyTheme();
        }}
    ]);
}

function exportDataJSON() {
  const data = {};
  for(let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if(k.startsWith('t2_')) data[k] = localStorage.getItem(k);
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'tether_backup.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      let imported = 0;
      for(let key in data) {
        if(key.startsWith('t2_')) {
          let parsedVal;
          if (typeof data[key] === 'string') {
              try { parsedVal = JSON.parse(data[key]); }
              catch(err) { parsedVal = data[key]; }
          } else {
              parsedVal = data[key];
          }
          localStorage.setItem(key, JSON.stringify(parsedVal));
          imported++;
        }
      }
      if(imported > 0) {
        showCustomModal("Restore Complete", `Successfully fully restored ${imported} data modules. The app will now reload to apply your history, settings, and calendar data.`, [
            {text: "Reload App", cls: "btn-primary", onClick: () => window.location.reload()}
        ]);
      } else {
        showCustomModal("Error", "No valid Tether data found in file.", [{text: "OK"}]);
      }
    } catch(err) {
      showCustomModal("Error", "Failed to parse backup file. It may be corrupt.", [{text: "OK"}]);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; 
}

function exportCSV() {
  if(!sessions.length) return showToast("No data to export.");
  let csv = "Date,Time,Pen,Method,Mode,Hits,Est_THC_mg,Final_Feeling,Is_Quick_Hit,Focus_Task,Task_Done,Notes\n";
  sessions.forEach(s => {
    const p = penById(s.penId) || {name: 'Deleted Pen'};
    const d = new Date(s.ts);
    const n = (s.notes||'').replace(/\n/g, ' ').replace(/,/g, ';');
    csv += `${d.toLocaleDateString()},${d.toLocaleTimeString()},${p.name},${s.method||'vape'},${s.mode},${s.hits.length},${s.thc},${s.finalFeeling},${s.isQuickHit?"Yes":"No"},${s.focusTask||'None'},${s.taskCompleted?"Yes":"No"},${n}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'tether_history.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function deleteAllData() {
  showCustomModal("Delete All Data", "ERASE EVERYTHING? This cannot be undone.", [
    {text: "Cancel"},
    {text: "Yes, Erase Data", cls: "btn-danger-solid", onClick: () => {
       showCustomModal("Final Confirmation", "Are you absolutely sure?", [
         {text: "Cancel"}, {text: "DELETE EVERYTHING", cls: "btn-danger-solid", onClick: () => { localStorage.clear(); window.location.reload(true); }}
       ]);
    }}
  ]);
}
