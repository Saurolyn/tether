// ── Data & Quotes ───────────────────────────────────────────────────────────
const WEED_QUOTES = [
  "\"The biggest killer on the planet is stress and I still think the best medicine is and always has been cannabis.\" — Willie Nelson",
  "\"I find that smoking a little weed helps to give me a little bit of a different perspective.\" — Seth Rogen",
  "\"When you smoke the herb, it reveals you to yourself.\" — Bob Marley",
  "\"It really puzzles me to see marijuana connected with narcotics... dope and all that crap. It's a thousand times better than whiskey - it's an assistant - a friend.\" — Louis Armstrong",
  "\"Of course I know how to roll a joint.\" — Martha Stewart",
  "Fun Fact: George Washington, James Madison, and Thomas Jefferson all grew hemp at Mount Vernon as one of their primary crops.",
  "Fun Fact: Cannabis has been used for medicinal purposes for over 3,000 years.",
  "Reminder: Tolerance breaks (T-breaks) help reset your CB1 receptors.",
  "Reminder: Stay hydrated. Cannabis can temporarily decrease saliva production.",
  "In the early 1970s, students at Stanford and MIT used ARPANET (the early internet) to arrange a marijuana deal, making it the first e-commerce transaction.",
  "Archaeologists found a 2,700-year-old burial site in China in 2008 with nearly two pounds of well-preserved cannabis.",
  "NASA sent cannabis plant cells into space on a SpaceX rocket in 2019 to see how microgravity affects plant stress.",
  "Modern cannabis has much higher THC levels than the weed from the 1960s and 1990s.",
  "Hemp was planted near the Chernobyl nuclear disaster site in the 1990s to clean toxins from the soil through a process called phytoremediation."
];
const WACKY_NAMES = ["Alaskan Thunderfuck", "Snoop's Dream", "Purple Space Dust", "Skywalker OG", "Granddaddy Purp", "Couch-Lock Supreme", "Green Crack", "Gorilla Glue", "Sour Diesel", "Blue Dream"];

// ── State & Defaults ────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = { 
  maxHits: 4, maxMiniSessionHits: 2, sessPerWeek: 5, quickHitsPerWeek: 3, quickHitTBreak: 1, 
  sessionTokensPerWeek: 3, miniTokensPerWeek: 3, tokenCooldownHours: 24,
  fuckItTokensPerMonth: 1, fuckItPenaltyEnabled: false, fuckItPenaltyDays: 3,
  sessionWait: 15, miniWait: 15,
  globalCooldownEnabled: false, globalCooldownHours: 24, clearanceFrequency: '',
  nightWait: 15, dayWait: 120, dayStart: '06:00', nightStart: '18:00', breakStart: null, breakEnd: null,
  autoTBreak: false, autoTBreakWeek: 4, 
  enforceWeeklyLimit: true, enforceRestDays: true, restDays: 2,
  daySmokingEnabled: true, daySmokingDaysPerMonth: 5, nightSmokingEnabled: true,
  allowQuickHit: true, allowFuckIt: true, fuckItLimitPerMonth: 2, fuckItTBreak: 3, autoTBreakBypassedMonth: -1,
  theme: 'auto', font: "'Space Mono', monospace", largeText: false, yearlyBreakMonth: 'none', weenOffEnabled: false,
  hardcoreLockout: false
};
const DEFAULT_PEN_DRAW_SETTINGS = {
  drawLow: 3, drawMed: 5, drawHigh: 7, drawDiablo: 10, diabloEnabled: false
};

const DEFAULT_EQUIPMENT = [
  { id: 'e1', text: 'Sploofy (Personal Air Filter)', desc: 'Reduces smell and smoke indoors.', url: '' },
  { id: 'e2', text: 'Water', desc: 'Hydration is key. Prevents dry mouth and soothes throat.', url: '' },
  { id: 'e3', text: 'Eye Drops', desc: 'Relieves redness and irritation instantly.', url: '' },
  { id: 'e4', text: 'Airtight Glass Jar', desc: 'Preserves freshness and contains odors.', url: '' },
  { id: 'e5', text: 'Multi-voltage Battery', desc: 'Essential for vape cartridges (e.g. Yocan Uni Pro).', url: '' },
  { id: 'e6', text: 'Iso Alcohol & Q-Tips', desc: 'Crucial for cleaning gear and mouthpieces.', url: '' },
  { id: 'e7', text: 'Emergency CBD Tincture', desc: 'Can help counteract severe THC-induced anxiety.', url: '' },
  { id: 'e8', text: 'Smoking Hoodie', desc: 'A dedicated comfortable layer to absorb smoke smell.', url: '' },
  { id: 'e9', text: 'Hand Sanitizer', desc: 'Removes sticky resin and smells from fingers.', url: '' },
  { id: 'e10', text: 'Mouthpiece Caps', desc: 'Keeps out pocket lint and prevents clogs.', url: '' }
];

const DEFAULT_ROUTINE = [
  { id:'r1', text:'Drink a full glass of water', done:false, mode:'all' },
  { id:'r5', text:'Finished all critical daytime work', done:false, mode:'mini' },
  { id:'r2', text:'No major commitments early tomorrow', done:false, mode:'session' },
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

const savedSettings = ld('t2_settings', {});
let settings = { ...DEFAULT_SETTINGS, ...savedSettings };
if (!Object.prototype.hasOwnProperty.call(savedSettings, 'sessionWait')) settings.sessionWait = savedSettings.nightWait || DEFAULT_SETTINGS.sessionWait;
if (!Object.prototype.hasOwnProperty.call(savedSettings, 'miniWait')) settings.miniWait = savedSettings.nightWait || DEFAULT_SETTINGS.miniWait;
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
let routineMigrated = false;
routineChecks.forEach(check => {
  if (check.mode === 'day' || check.mode === 'night') {
    check.mode = check.mode === 'day' ? 'mini' : 'session';
    routineMigrated = true;
  }
});
if (routineMigrated) sv('t2_routine', routineChecks);
let plannedBreaks = ld('t2_planned_breaks', []); 
let sessionAllowedDays = ld('t2_session_allowed_days', []);
let fuckIts = ld('t2_fuckits', []); 
let quickHitLockoutUntil = ld('t2_qh_lockout', 0);
let quickHitTimerUntil = ld('t2_qh_timer', 0);
let fuckItLockoutUntil = ld('t2_fi_lockout', 0);

let currentMode = 'night'; 
let activeSession = ld('t2_activeSession', null);
let tokenUses = ld('t2_token_uses', []);
let waitTimerInterval = null;
let lockTimerInterval = null;
let quoteInterval = null;
let drawSequenceState = { timeout: null, interval: null };
let selectedCalDate = null; 
let emStep = 0; 
let pendingConfigType = 'normal'; 

// ── Helper Functions ────────────────────────────────────────────────────────
const OIL_RATE_LOW = 1.2;
const OIL_RATE_HIGH = 2.2;
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
function getModeStart(mode) {
  const fallback = mode === 'day' ? '06:00' : '18:00';
  const configured = mode === 'day' ? settings.dayStart : settings.nightStart;
  return typeof configured === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(configured) ? configured : fallback;
}
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
function getModeForDate(date = new Date()) {
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const dayStart = timeToMinutes(getModeStart('day'));
  const nightStart = timeToMinutes(getModeStart('night'));
  const isDay = dayStart < nightStart
    ? nowMinutes >= dayStart && nowMinutes < nightStart
    : nowMinutes >= dayStart || nowMinutes < nightStart;
  return isDay ? 'day' : 'night';
}
function setTimeOnDate(date, time) {
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}
function formatStartTime(time) {
  return setTimeOnDate(new Date(), time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function validTHCPercent(value) {
  const number = Number(value);
  return value !== null && value !== undefined && value !== '' && Number.isFinite(number) && number > 0 && number <= 100 ? number : null;
}

function calculateTHC(sessionList) {
  const result = { low: 0, high: 0, vapeHits: 0, edibleMg: 0, edibleHits: 0, unavailable: 0, missingMethod: 0, missingPercent: 0, missingDuration: 0, unsupported: 0, profilePercentHits: 0, inferredMethodHits: 0 };
  sessionList.forEach(session => {
    (session.hits || []).forEach(hit => {
      const method = hit.method || session.method;
      const profile = penById(hit.penId || session.penId);
      const inferredVape = !method && profile && profile.type === 'cart';
      if (method === 'edible' || Number.isFinite(hit.directMg)) {
        if (Number.isFinite(hit.directMg) && hit.directMg >= 0) {
          result.edibleMg += hit.directMg;
          result.edibleHits++;
        } else result.unavailable++;
      } else if (method === 'vape' || inferredVape) {
        const recordedPercent = validTHCPercent(hit.thcPercent);
        const percent = recordedPercent !== null ? recordedPercent : validTHCPercent(profile && profile.thc);
        const seconds = Number(hit.drawSeconds);
        if (percent !== null && Number.isFinite(seconds) && seconds > 0) {
          result.low += seconds * OIL_RATE_LOW * percent / 100;
          result.high += seconds * OIL_RATE_HIGH * percent / 100;
          result.vapeHits++;
          if (recordedPercent === null) result.profilePercentHits++;
          if (inferredVape) result.inferredMethodHits++;
        } else {
          result.unavailable++;
          if (percent === null) result.missingPercent++;
          else result.missingDuration++;
        }
      } else {
        result.unavailable++;
        if (!method) result.missingMethod++;
        else result.unsupported++;
      }
    });
  });
  return result;
}

function formatTHCRange(low, high) {
  return `${((low + high) / 2).toFixed(2)} mg (${low.toFixed(2)}–${high.toFixed(2)} mg)`;
}

function thcMissingDetails(result) {
  const reasons = [];
  if (result.missingMethod) reasons.push(`${result.missingMethod} missing method`);
  if (result.missingPercent) reasons.push(`${result.missingPercent} missing THC % or linked profile`);
  if (result.missingDuration) reasons.push(`${result.missingDuration} missing draw duration`);
  if (result.unsupported) reasons.push(`${result.unsupported} non-cart hits`);
  return reasons.length ? ` (${reasons.join(', ')})` : '';
}

function formatTHCSummary(result) {
  const parts = [];
  if (result.vapeHits) parts.push(`Cart: ${formatTHCRange(result.low, result.high)} estimated vaporized`);
  if (result.edibleHits) parts.push(`Edible: ${result.edibleMg.toFixed(2)} mg labeled`);
  if (result.unavailable) parts.push(`${result.unavailable} hit${result.unavailable === 1 ? '' : 's'} not estimated${thcMissingDetails(result)}`);
  if (result.profilePercentHits) parts.push(`${result.profilePercentHits} hit${result.profilePercentHits === 1 ? '' : 's'} use linked profile THC %`);
  if (result.inferredMethodHits) parts.push(`${result.inferredMethodHits} hit${result.inferredMethodHits === 1 ? '' : 's'} inferred as cart`);
  return parts.length ? parts.join(' · ') : 'No THC logged';
}

function getPenDrawSettings(pen) {
  const legacyDefaults = {
    drawLow: settings.doseLow || 3,
    drawMed: settings.doseMed || 5,
    drawHigh: settings.doseHigh || 7,
    drawDiablo: settings.doseDiablo || 10,
    diabloEnabled: !!settings.diabloEnabled
  };
  let changed = false;
  ['drawLow', 'drawMed', 'drawHigh', 'drawDiablo'].forEach(key => {
    const storedValue = Number(pen[key]);
    const legacyValue = Number(legacyDefaults[key]);
    const fallback = Number.isInteger(legacyValue) && legacyValue >= 1 && legacyValue <= 60 ? legacyValue : DEFAULT_PEN_DRAW_SETTINGS[key];
    const value = Number.isInteger(storedValue) && storedValue >= 1 && storedValue <= 60 ? storedValue : fallback;
    if (pen[key] !== value) {
      pen[key] = value;
      changed = true;
    }
  });
  if (typeof pen.diabloEnabled !== 'boolean') {
    pen.diabloEnabled = legacyDefaults.diabloEnabled;
    changed = true;
  }
  if (changed) {
    if (pens.includes(pen)) sv('t2_pens', pens);
    else if (graveyard.includes(pen)) sv('t2_graveyard', graveyard);
  }
  return pen;
}

function getConfigPen() {
  const penId = activeSession ? activeSession.penId : document.getElementById('config-pen').value;
  const pen = penById(penId);
  return pen ? getPenDrawSettings(pen) : null;
}

function updateConfigDoseOptions() {
  const doseSelect = document.getElementById('config-dose');
  const pen = getConfigPen();
  if (!doseSelect || !pen) return;
  const selected = doseSelect.value;
  const options = [
    ['low', 'Low Draw', pen.drawLow],
    ['medium', 'Medium Draw', pen.drawMed],
    ['high', 'High Draw', pen.drawHigh]
  ];
  doseSelect.innerHTML = options.map(([value, label, seconds]) =>
    `<option value="${value}">${label} (${seconds}s)</option>`
  ).join('');
  if (pen.diabloEnabled) {
    doseSelect.insertAdjacentHTML('beforeend', `<option value="diablo">Diablo Draw (${pen.drawDiablo}s)</option>`);
  }
  doseSelect.value = options.some(([value]) => value === selected) || (selected === 'diablo' && pen.diabloEnabled)
    ? selected
    : 'medium';
  checkDoseWarning();
}

function getTodayTHCEstimate() {
  const date = today();
  const allSessions = activeSession ? [...sessions, activeSession] : sessions;
  const todaySessions = allSessions.map(session => ({
    ...session,
    hits: (session.hits || []).filter(hit => {
      const timestamp = Number.isFinite(hit.time) ? hit.time : session.ts;
      return ds(new Date(timestamp)) === date;
    })
  }));
  return calculateTHC(todaySessions);
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

function getQuickHitState() {
  return getTokenStartState('mini');
}

function getBreakReasons(at = Date.now()) {
  const date = new Date(at);
  const day = ds(date);
  const reasons = [];
  if (settings.hardcoreLockout) reasons.push('Hardcore Lockout');
  if (settings.breakStart && settings.breakEnd && day >= settings.breakStart && day <= settings.breakEnd) reasons.push('Scheduled break');
  if (settings.yearlyBreakMonth !== 'none' && Number(settings.yearlyBreakMonth) === date.getMonth()) reasons.push('Yearly T-Break');
  if (settings.autoTBreak) {
    const week = Number(settings.autoTBreakWeek);
    const dayOfMonth = date.getDate();
    if ((week === 1 && dayOfMonth <= 7) || (week === 2 && dayOfMonth >= 8 && dayOfMonth <= 14) ||
        (week === 3 && dayOfMonth >= 15 && dayOfMonth <= 21) || (week === 4 && dayOfMonth >= 22)) reasons.push('Monthly T-Break');
  }
  const penaltyUntil = tokenUses.reduce((end, use) => use.startedAt <= at ? Math.max(end, use.penaltyUntil || 0) : end, 0);
  if (penaltyUntil > at) reasons.push(`Fuck It penalty until ${new Date(penaltyUntil).toLocaleString()}`);
  return reasons;
}

function getTokenPool(type, at = Date.now()) {
  if (type === 'fuckit') {
    const capacity = settings.fuckItTokensPerMonth;
    const d = new Date(at);
    const start = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const used = tokenUses.filter(use => use.type === type && use.startedAt >= start && use.startedAt <= at).length;
    const available = Math.max(0, capacity - used);
    return { capacity, available, weeklyRemaining: available, slots: [] };
  }
  const configured = type === 'mini' ? settings.miniTokensPerWeek : settings.sessionTokensPerWeek;
  const capacity = isWeenOffActive(new Date(at)) && configured > 0 ? Math.max(1, Math.floor(configured / 2)) : configured;
  const start = weekStartFromDate(new Date(at));
  const uses = tokenUses.filter(use => use.type === type && use.startedAt <= at);
  const weeklyRemaining = Math.max(0, capacity - uses.filter(use => use.startedAt >= start).length);
  const slots = Array.from({ length: capacity }, (_, slot) => {
    const lastUse = uses.filter(use => use.slot === slot).sort((a, b) => b.startedAt - a.startedAt)[0];
    return { slot, readyAt: lastUse ? lastUse.readyAt : 0 };
  });
  const ready = slots.filter(slot => slot.readyAt <= at).length;
  return { capacity, weeklyRemaining, slots, available: Math.min(ready, weeklyRemaining) };
}

function getGlobalCooldownUntil(at = Date.now()) {
  return tokenUses.reduce((end, use) => use.startedAt <= at ? Math.max(end, use.globalUntil || 0) : end, 0);
}

function getTokenStartState(type) {
  const pool = getTokenPool(type);
  const globalUntil = getGlobalCooldownUntil();
  let reason = '';
  const breaks = getBreakReasons();
  if (settings.hardcoreLockout) reason = 'Hardcore Lockout is active';
  else if (!checkAllPreflight(type === 'mini' ? 'mini' : 'session')) reason = 'Complete the applicable checklist first';
  else if (type !== 'fuckit' && breaks.length) reason = breaks.join(', ');
  else if (type !== 'fuckit' && globalUntil > Date.now()) reason = `Global cooldown until ${new Date(globalUntil).toLocaleString()}`;
  else if (type === 'fuckit' && !pool.available) reason = 'Monthly Fuck It tokens used; resets on the first';
  else if (!pool.weeklyRemaining) reason = 'Weekly token allowance used; resets Monday';
  else if (!pool.available) reason = 'All tokens are cooling down';
  return { ...pool, remaining: pool.available, disabled: !!reason, reason };
}

function nextTokenRefresh(type, at, pool) {
  if (pool.available >= pool.capacity) return null;
  if (type === 'fuckit') {
    const date = new Date(at);
    return new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  }
  const nextWeek = new Date(weekStartFromDate(new Date(at)));
  nextWeek.setDate(nextWeek.getDate() + 7);
  const date = new Date(at);
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  const candidates = [nextWeek.getTime(), nextMonth, ...pool.slots.map(slot => slot.readyAt)]
    .filter(time => time > at)
    .sort((a, b) => a - b);
  return candidates.find(time => getTokenPool(type, time).available > pool.available) || null;
}

function formatCountdown(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function refreshTokenCountdowns() {
  document.querySelectorAll('[data-token-refresh]').forEach(element => {
    element.textContent = `${formatCountdown(Number(element.dataset.tokenRefresh) - Date.now())} Until Refresh`;
  });
}

function renderTokenStatus(at = Date.now(), live = true) {
  const globalUntil = getGlobalCooldownUntil(at);
  const pools = ['session', 'mini', 'fuckit'].map(type => {
    const pool = getTokenPool(type, at);
    const name = type === 'mini' ? 'Mini Session' : (type === 'fuckit' ? 'Fuck It' : 'Session');
    const refresh = nextTokenRefresh(type, at, pool);
    const color = pool.available === pool.capacity ? 'ready' : 'used';
    const countdown = refresh ? `<div class="token-countdown"${live ? ` data-token-refresh="${refresh}"` : ''}>${formatCountdown(refresh - at)} Until Refresh</div>` : '';
    return `<div class="token-status-item ${color}"><div><span aria-hidden="true">${type === 'mini' ? '⚡' : (type === 'fuckit' ? '⚠️' : '🔥')}</span> ${name} Tokens: ${pool.available}/${pool.capacity}</div>${countdown}</div>`;
  }).join('');
  const global = globalUntil > at ? `<div class="text-sm text-muted">Global cooldown until ${new Date(globalUntil).toLocaleString()}</div>` : '';
  return `<div class="token-status-list">${pools}${global}</div>`;
}

function beginTokenSession(penId, task, method) {
  const type = pendingConfigType === 'quick' ? 'mini' : (pendingConfigType === 'fuckit' ? 'fuckit' : 'session');
  const state = getTokenStartState(type);
  if (state.disabled) {
    showCustomModal('Token unavailable', state.reason, [{text: 'OK'}]);
    return false;
  }
  const now = Date.now();
  const slot = type === 'fuckit' ? null : state.slots.find(item => item.readyAt <= now).slot;
  const monthlyReset = new Date(new Date(now).getFullYear(), new Date(now).getMonth() + 1, 1).getTime();
  const use = {
    type, slot, startedAt: now,
    readyAt: type === 'fuckit' ? monthlyReset : now + settings.tokenCooldownHours * 3600000,
    globalUntil: settings.globalCooldownEnabled ? now + settings.globalCooldownHours * 3600000 : 0,
    penaltyUntil: type === 'fuckit' && settings.fuckItPenaltyEnabled ? now + settings.fuckItPenaltyDays * 86400000 : 0
  };
  tokenUses.push(use);
  sv('t2_token_uses', tokenUses);
  activeSession = { id: now.toString(), ts: now, penId, mode: currentMode, method, hits: [], notes: '', media: [], focusTask: task, isQuickHit: type === 'mini', isFuckIt: type === 'fuckit' };
  sv('t2_activeSession', activeSession);
  return true;
}

// ── Ween-Off Protocol ───────────────────────────────────────────────────────
function isWeenOffActive(date = new Date()) {
    if (!settings.weenOffEnabled || settings.yearlyBreakMonth === 'none') return false;
    return date.getMonth() === (Number(settings.yearlyBreakMonth) + 11) % 12;
}

function isYearlyBreakActive() {
    if (settings.yearlyBreakMonth === 'none') return false;
    return new Date().getMonth() === parseInt(settings.yearlyBreakMonth);
}

function getActiveLimits() {
    const mini = activeSession && activeSession.isQuickHit;
    const wait = mini ? settings.miniWait : settings.sessionWait;
    return { maxHits: isWeenOffActive() ? Math.max(1, Math.floor(settings.maxHits / 2)) : settings.maxHits, wait: wait * (isWeenOffActive() ? 2 : 1) };
}

  function getSessionHitLimit(session = activeSession) {
    if (session && session.isQuickHit) {
      const configuredLimit = parseInt(settings.maxMiniSessionHits, 10);
      const limit = Math.min(20, Math.max(1, Number.isFinite(configuredLimit) ? configuredLimit : DEFAULT_SETTINGS.maxMiniSessionHits));
      return isWeenOffActive() ? Math.max(1, Math.floor(limit / 2)) : limit;
    }
    return getActiveLimits().maxHits;
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

  const spn = document.getElementById('setup-pen-name');
  if (spn) spn.placeholder = `e.g. ${WACKY_NAMES[Math.floor(Math.random()*WACKY_NAMES.length)]}`;

  rotateQuote();
  if(quoteInterval) clearInterval(quoteInterval);
  quoteInterval = setInterval(rotateQuote, 15000);

  generateFeelGrid('config-feel-grid');
  generateFeelGrid('recap-feel-grid');

  const journalEl = document.getElementById('journal-text');
  if (journalEl) journalEl.value = journalText;
  
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
   let t = settings.theme || 'auto';
   const mb = document.getElementById('mode-badge');
   document.body.style.setProperty('--app-font', settings.font || "'Space Mono', monospace");
   
   if (t === 'seasonal') {
       const m = new Date().getMonth();
       if (m === 1) t = 'valentines';
       else if (m === 5) t = 'pride-rainbow';
       else if (m === 9) t = 'halloween';
       else if (m === 10) t = 'thanksgiving';
       else if (m === 11) t = 'christmas';
       else t = 'auto';
   } else if (t === 'random') {
       const themes = ['cyberpunk', 'nature', 'sunset', 'swirly-temple', 'galactic-grape', 'lemon-loopz', 'baja-blazed', 'pride-rainbow', 'pride-lesbian', 'pride-gay', 'pride-bi', 'genderfluid', 'trans', 'non-binary'];
       t = themes[new Date().getDate() % themes.length];
   }

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

  const newMode = getModeForDate(now);
  const lastRoutineDay = ld('t2_routine_day', today());
  if (lastRoutineDay !== today()) {
    routineChecks.forEach(c => c.done = false);
    sv('t2_routine', routineChecks);
    renderRoutine(); renderDashboard();
  }
  if (lastRoutineDay !== today() || !localStorage.getItem('t2_routine_day')) sv('t2_routine_day', today());
  if (newMode !== currentMode) {
    currentMode = newMode;
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

  const lastHit = getLastHitInfo();
  const todayThcEstimate = formatTHCSummary(getTodayTHCEstimate());
  const sinceLastUse = lastHit.time ? formatDuration(Date.now() - lastHit.time) : "No use logged";

  const clTab = document.getElementById('tab-clearance');
  const dashClEl = document.getElementById('dash-clear-countdown');
  const tabClEl = document.getElementById('cl-time-to-clear');
  const thcTodayEl = document.getElementById('dash-thc-today-val');

  if (dashClEl) dashClEl.innerText = sinceLastUse;
  if (tabClEl) tabClEl.innerText = sinceLastUse;
  if (thcTodayEl) thcTodayEl.innerText = todayThcEstimate;

  if (clTab && clTab.classList.contains('active')) renderClearance();
  refreshTokenCountdowns();
  const tokenClockKey = [
    today(), weekStart(), ...['session', 'mini'].flatMap(type => getTokenPool(type).slots.map(slot => slot.readyAt > Date.now())),
    getTokenPool('session').available, getTokenPool('mini').available,
    getTokenPool('fuckit').available, getGlobalCooldownUntil() > Date.now(), getBreakReasons().join(',')
  ].join(':');
  if (window.lastTokenClockKey !== tokenClockKey) {
    window.lastTokenClockKey = tokenClockKey;
    renderDashboard();
    if (document.getElementById('tab-calendar').classList.contains('active')) renderCalendar();
  }
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
  const ptype = document.getElementById('setup-pen-type').value;
  const thc = parseFloat(document.getElementById('setup-pen-thc').value);
  const cbd = parseFloat(document.getElementById('setup-pen-cbd').value) || 0;
  const terp = parseFloat(document.getElementById('setup-pen-terp').value) || 0;
  if(!uname || !pname || !thc) { return showCustomModal('Incomplete', 'Please fill out Name, Profile Name, and THC % to continue.', [{text:'OK'}]); }
  if (validTHCPercent(thc) === null) return showCustomModal('Invalid THC percentage', 'Enter a THC percentage greater than 0 and no more than 100.', [{text:'OK'}]);
  
  username = uname; sv('t2_username', username);
  sv('t2_settings', settings);
  
  pens.push({ id: 'p'+Date.now(), name: pname, type: ptype, thc, cbd, customCName: 'Terpenes', customCVal: terp, notes: '', ...DEFAULT_PEN_DRAW_SETTINGS });
  sv('t2_pens', pens);
  
  document.getElementById('setup-modal').classList.remove('open');
  renderPens(); renderDashboard(); renderSettings();
  applyTheme();
  setTimeout(() => { openGuideModal(); }, 500);
}

// ── Locks & Blocking Logic ──────────────────────────────────────────────────
function togglePreflight(id) {
  let rCheck = routineChecks.find(c => c.id === id);
  if(rCheck) { rCheck.done = !rCheck.done; sv('t2_routine', routineChecks); }
  renderDashboard(); renderRoutine(); 
}

function checkAllPreflight(type = 'session') {
  return routineChecks.filter(c => c.mode === 'all' || c.mode === type).every(c => c.done);
}

function getBlockingReasons(dStr, type = 'session') {
   let reasons = [];
   const dayTs = new Date(dStr + "T12:00:00").getTime();
   const dObj = new Date(dStr + "T12:00:00");

   if (plannedBreaks.includes(dStr)) reasons.push("Manually Planned No-Smoke Day");
   
   if (fuckItLockoutUntil > dayTs) {
       reasons.push(`Mandatory Break Active (Bypass Used)`);
   }

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
       const week = parseInt(settings.autoTBreakWeek || 4);
       const daysInMo = new Date(dObj.getFullYear(), dObj.getMonth() + 1, 0).getDate();
       let isBreakDay = false;

       if (week === 1 && day >= 1 && day <= 7) isBreakDay = true;
       else if (week === 2 && day >= 8 && day <= 14) isBreakDay = true;
       else if (week === 3 && day >= 15 && day <= 21) isBreakDay = true;
       else if (week === 4 && day >= 22 && day <= daysInMo) isBreakDay = true;

       if (isBreakDay && !fuckIts.includes(dStr)) reasons.push(`Auto Monthly T-Break (Week ${week})`);
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

    let getNextTarget = (time) => {
      let t = new Date(now);
        setTimeOnDate(t, time);
      if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1);
      return t.getTime();
  };

    if (plannedBreaks.includes(today())) {
        const nextStart = settings.daySmokingEnabled ? getModeStart('day') : getModeStart('night');
        return { locked: true, msg: "Today is planned as a No-Smoke Day.", endTs: getNextTarget(nextStart) };
    }
    if (currentMode === 'night') {
        if (!settings.nightSmokingEnabled) return { locked: true, msg: `Night smoking is disabled. Waiting until ${formatStartTime(getModeStart('day'))}.`, endTs: getNextTarget(getModeStart('day')) };
        if (hasNight) {
          const nextStart = settings.daySmokingEnabled ? getModeStart('day') : getModeStart('night');
          return { locked: true, msg: "Good night. You've completed your session for today.", endTs: getNextTarget(nextStart) };
        }
    } else if (currentMode === 'day') {
        if (!settings.daySmokingEnabled) return { locked: true, msg: `Day smoking is disabled. Hang tight until ${formatStartTime(getModeStart('night'))}.`, endTs: getNextTarget(getModeStart('night')) };
      
      const mo = now.getMonth();
      const yr = now.getFullYear();
      let daySessDates = new Set();
      sessions.forEach(s => {
          const d = new Date(s.ts);
          if (d.getMonth() === mo && d.getFullYear() === yr && s.mode === 'day' && !s.isQuickHit) daySessDates.add(ds(d));
      });
      
      if (daySessDates.size >= settings.daySmokingDaysPerMonth && !daySessDates.has(ds(now))) {
           return { locked: true, msg: `Monthly day limit reached (${settings.daySmokingDaysPerMonth} days). Waiting for night mode.`, endTs: getNextTarget(getModeStart('night')) };
      }
      
      if (hasDay) return { locked: true, msg: `You've already had your day session. Hang tight until night mode activates at ${formatStartTime(getModeStart('night'))}.`, endTs: getNextTarget(getModeStart('night')) };
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
    setTimeOnDate(unlockDate, getModeStart(settings.daySmokingEnabled ? 'day' : 'night'));
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
  showCustomModal("Override Lock", `Are you sure you want to bypass your lock? This will use a 'Fuck It' pass to start a full Session, and initiate a ${settings.fuckItTBreak || 3} day strict lock afterwards.`, [
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
  fuckItLockoutUntil = 0; sv('t2_fi_lockout', 0);
  
  sv('t2_settings', settings); sv('t2_planned_breaks', plannedBreaks);
  showToast("Lock bypassed."); renderDashboard(); renderCalendar();
}


// ── Dashboard Rendering ─────────────────────────────────────────────────────
function renderDashboard() {
  const dObj = new Date();
  const hr = dObj.getHours();
  const grt = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting-txt').innerText = `${grt}, ${username}.`;
  
  const dayStatus = getPlannedDayStatus(today());
  const globalCooling = getGlobalCooldownUntil() > Date.now();
  const activityStatus = activeSession ? 'IN PROGRESS' : (globalCooling ? 'COOLDOWN' : 'IDLE');
  const activityStatusClass = activeSession || globalCooling ? 'warn' : 'ok';
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat glass">
      <div class="stat-label">THC Logged Today</div>
      <div class="text-sm" id="dash-thc-today-val">${formatTHCSummary(getTodayTHCEstimate())}</div>
      <div style="font-size:11px; margin-top:4px; font-weight:700; color:var(--text3);">Cart estimate is not absorbed dose; edible amounts are label values.</div>
    </div>
    <div class="stat glass">
      <div class="stat-label">Since Last Logged Use</div>
      <div class="stat-value" id="dash-clear-countdown">--:--:--</div>
      <div style="font-size:11px; margin-top:4px; font-weight:700; color:var(--text3);">Elapsed time; not a clearance estimate</div>
    </div>
    <div class="stat glass ${activityStatusClass}">
      <div class="stat-label">Status</div>
      <div class="stat-value ${activityStatusClass}" style="font-size:20px;">
        ${activityStatus}
      </div>
      <div class="text-sm text-muted" style="font-size:10px; font-weight:700; margin-top:6px;">${dayStatus.label}</div>
    </div>
  `;
  document.getElementById('dash-token-status').innerHTML = renderTokenStatus();

  if (activeSession) {
    document.getElementById('session-card-idle').style.display = 'none';
    document.getElementById('session-card-active').style.display = 'block';
    
    const pen = penById(activeSession.penId);
    let nameStr = pen ? pen.name : 'Unknown';
    document.getElementById('active-pen-name').innerText = `${nameStr} (${activeSession.method} - ${activeSession.isQuickHit ? 'Mini Session' : (activeSession.isFuckIt ? 'Fuck It Session' : 'Session')})`;
    document.getElementById('active-hits').innerText = activeSession.hits.length;
    document.getElementById('active-thc').innerText = formatTHCSummary(calculateTHC([activeSession]));
    document.getElementById('active-notes').value = activeSession.notes || '';
    document.getElementById('active-focus-task').innerText = activeSession.focusTask || 'None selected';

    const limits = getActiveLimits();
    const remHits = getSessionHitLimit(activeSession) - activeSession.hits.length;
    const hitTxt = document.getElementById('hits-remaining-txt');
    
    if (remHits <= 0) {
      hitTxt.innerText = activeSession.isQuickHit ? "Mini Session limit reached." : "Session limit reached."; hitTxt.style.color = "var(--red)";
      document.getElementById('btn-take-hit').disabled = true;
      document.getElementById('btn-add-time').disabled = true;
      document.getElementById('wait-timer').innerText = "COMPLETE";
      document.getElementById('wait-timer').className = "timer-display expired";
      document.getElementById('wait-timer-lbl').innerText = "Log session to clear limits.";
    } else {
      hitTxt.innerText = `${remHits} ${activeSession.isQuickHit ? `Mini Session hit${remHits === 1 ? '' : 's'}` : 'doses'} remaining.`; hitTxt.style.color = "var(--accent)";
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
    
    const applicableChecks = routineChecks;
    
    document.getElementById('preflight-list').innerHTML = applicableChecks.map(c => {
      let badge = '';
      if (c.mode === 'mini') badge = '<span class="mode-badge day" style="margin-left:8px; padding:2px 6px; font-size:8px;">MINI</span>';
      if (c.mode === 'session') badge = '<span class="mode-badge night" style="margin-left:8px; padding:2px 6px; font-size:8px;">SESSION</span>';
      if (c.mode === 'all') badge = '<span class="mode-badge" style="margin-left:8px; padding:2px 6px; font-size:8px;">BOTH</span>';
      return `
      <div class="check-row" onclick="togglePreflight('${c.id}')">
        <div class="check-box ${c.done ? 'checked' : ''}">${c.done ? '✓' : ''}</div>
        <div class="check-text" style="${c.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${c.text}${badge}</div>
      </div>
    `}).join('') || '<div class="text-sm text-muted mb-8">No routine configured. Start session right away.</div>';

    const sessionState = getTokenStartState('session');
    document.getElementById('btn-start-session').disabled = sessionState.disabled;
    document.getElementById('btn-start-session').title = sessionState.reason || 'Session token available';
    const miniState = getTokenStartState('mini');
    const fuckItState = getTokenStartState('fuckit');
    const fuckItButton = document.getElementById('btn-fuck-it');
    fuckItButton.disabled = fuckItState.disabled;
    fuckItButton.title = fuckItState.reason || 'Start an extra Session';
    fuckItButton.innerText = `Fuck It ⚠️ (${fuckItState.available} left)`;
    document.getElementById('token-start-reasons').innerText = [
      sessionState.reason ? `Session: ${sessionState.reason}.` : '',
      miniState.reason ? `Mini Session: ${miniState.reason}.` : '',
      fuckItState.reason ? `Fuck It: ${fuckItState.reason}.` : ''
    ].filter(Boolean).join(' ');
    
    const btnQhIdle = document.getElementById('btn-quick-hit-idle');
    if (btnQhIdle) {
        const qhState = getQuickHitState();
        btnQhIdle.disabled = qhState.disabled;
        btnQhIdle.style.opacity = qhState.disabled ? '0.55' : '1';
        btnQhIdle.style.cursor = qhState.disabled ? 'not-allowed' : 'pointer';
        btnQhIdle.style.display = 'block';
        btnQhIdle.title = qhState.reason || 'Mini Session available';
        btnQhIdle.innerText = `Mini Session ⚡ (${qhState.remaining} left)`;
    }
  }

  const recent = sessions.slice().sort((a,b)=>b.ts-a.ts).slice(0,5);
  const rEl = document.getElementById('dash-recent');
  if(!recent.length) rEl.innerHTML = '<div class="empty">No history yet.</div>';
  else {
    rEl.innerHTML = recent.map(s => {
      const p = penById(s.penId) || {name: 'Deleted Profile', type: 'other'};
      const hStr = s.hits.length === 1 ? 'dose' : 'doses';
      const isQuick = s.isQuickHit ? '⚡' : '';
      return `<div style="padding:12px 0; border-bottom:0.5px solid var(--border)">
        <div style="font-weight:700; margin-bottom:4px;">${p.name} ${isQuick} <span class="mode-badge ${s.isQuickHit ? 'day' : 'night'}" style="padding:2px 6px;font-size:8px">${s.isQuickHit ? 'MINI' : (s.isFuckIt ? 'FUCK IT' : 'SESSION')}</span></div>
        <div class="text-sm text-muted">${new Date(s.ts).toLocaleDateString([], {month:'short', day:'numeric'})} · ${s.method} · ${s.hits.length} ${hStr}</div>
      </div>`;
    }).join('');
  }
}

// ── Draw Sequence & Hit Logging ─────────────────────────────────────────────
function openDoseGuide() {
  const pen = getConfigPen();
  const drawSettings = pen || DEFAULT_PEN_DRAW_SETTINGS;
  showCustomModal("Dose Guide", `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div style="background:var(--bg3); padding:16px; border-left:3px solid var(--green); border-radius:4px;">
        <strong style="color:var(--green)">Low Draw (${drawSettings.drawLow}s)</strong>
        <div class="text-sm text-muted mt-8">A user-configured draw-time preset, not a standardized dose or safety level.</div>
      </div>
      <div style="background:var(--bg3); padding:16px; border-left:3px solid var(--amber); border-radius:4px;">
        <strong style="color:var(--amber)">Medium Draw (${drawSettings.drawMed}s)</strong>
        <div class="text-sm text-muted mt-8">A user-configured draw-time preset; effects and delivered THC vary.</div>
      </div>
      <div style="background:var(--bg3); padding:16px; border-left:3px solid var(--red); border-radius:4px;">
        <strong style="color:var(--red)">High Draw (${drawSettings.drawHigh}s)</strong>
        <div class="text-sm text-muted mt-8">A user-configured draw-time preset, not a measured or recommended THC dose.</div>
      </div>
      <div class="text-sm text-muted">Cart THC vaporized is estimated as draw seconds × 1.2–2.2 mg oil/second × profile THC fraction. The rate is an illustrative assumption, not a measurement; device power, oil and inhalation can change it substantially. It does not estimate absorption. Flower hits cannot be estimated from draw time; edible values are label amounts.</div>
    </div>
  `, [{text: "Close"}]);
}

function checkDoseWarning() {
  const d = document.getElementById('config-dose').value;
  const w = document.getElementById('dose-warning');
  if (d === 'high') {
    w.style.display = 'flex';
  } else {
    w.style.display = 'none';
  }
}

function updateConfigMethodUI() {
    const m = document.getElementById('config-method').value;
    document.getElementById('config-dose-vape').style.display = m !== 'edible' ? 'block' : 'none';
    document.getElementById('config-dose-edible').style.display = m === 'edible' ? 'block' : 'none';
    updateConfigDoseOptions();
}

function openQuickHitModal() {
    const qhState = getQuickHitState();
    if (qhState.disabled) {
        return showCustomModal("Mini Session Unavailable", `Mini Sessions are currently unavailable: ${qhState.reason}.`, [{text:"OK"}]);
    }
    openConfigModal(true, 'quick');
}

function openConfigModal(isNewSession, type = 'normal', planConfirmed = false) {
  if (pens.length === 0) return showCustomModal("Add Profile", "Add a strain or profile in the Profiles tab first.", [{text:"OK"}]);
  if (isNewSession) {
      const state = getTokenStartState(type === 'quick' ? 'mini' : (type === 'fuckit' ? 'fuckit' : 'session'));
      if (state.disabled) return showCustomModal("Token unavailable", state.reason, [{text:"OK"}]);
      const plan = getPlannedDayStatus(today()).key;
      const againstPlan = plan === 'no-smoke' || (plan === 'session' && type === 'quick') || (plan === 'quick-hit' && type !== 'quick');
      if (type === 'fuckit' && !planConfirmed) {
        const penalty = settings.fuckItPenaltyEnabled ? ` A ${settings.fuckItPenaltyDays}-day penalty starts when the session begins.` : '';
        const planWarning = againstPlan ? " You're going against your plan for today." : '';
        return showCustomModal('Use Fuck It Token', `Start an extra Session and bypass active breaks and cooldowns?${penalty}${planWarning}`, [
          {text:'Cancel'}, {text:'Continue', cls:'btn-primary', onClick:() => openConfigModal(isNewSession, type, true)}
        ]);
      }
      if (againstPlan && !planConfirmed) {
        return showCustomModal("Plan Reminder", "You're going against your plan for today. Continue?", [
          {text: "Cancel"},
          {text: "Continue", cls: "btn-primary", onClick: () => openConfigModal(isNewSession, type, true)}
        ]);
      }
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
  document.getElementById('config-title').innerText = type === 'quick' ? "Mini Session" : (type === 'fuckit' ? "Fuck It Session" : (isNewSession ? "Start Session" : "Log a Dose"));
  
  document.getElementById('config-method-group').style.display = isNewSession ? 'flex' : 'none';
  document.getElementById('config-pen-group').style.display = isNewSession ? 'flex' : 'none';
  const penSelect = document.getElementById('config-pen');
  penSelect.innerHTML = pens.map(p=>`<option value="${p.id}">[${p.type.toUpperCase()}] ${p.name}</option>`).join('');
  if (activeSession) penSelect.value = activeSession.penId;
  updateConfigDoseOptions();

  document.getElementById('config-task-group').style.display = isNewSession ? 'flex' : 'none';
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
  const method = isNew ? document.getElementById('config-method').value : activeSession.method;
  const penId = isNew ? document.getElementById('config-pen').value : activeSession.penId;
  const feeling = parseInt(document.getElementById('config-feel-val').value);
  const task = isNew ? document.getElementById('config-task-select').value : activeSession.focusTask;
  
  if (feeling <= 3) {
      return showCustomModal("Mood Check", "⚠️ Low headspace detected. Getting elevated right now might worsen your mood. Are you sure you want to continue?", [
          {text: "Cancel", onClick: () => closeConfigModal() },
          {text: "Continue", cls: "btn-primary", onClick: () => { closeConfigModal(); executeHitLogic(isNew, penId, feeling, task, method); }}
      ]);
  }

  closeConfigModal();
  executeHitLogic(isNew, penId, feeling, task, method);
}

function executeHitLogic(isNew, penId, feeling, task, method) {
    let doseSize = document.getElementById('config-dose').value;
    const pen = penById(penId);
    if (!pen) return showCustomModal("Profile unavailable", "The selected pen/profile could not be found. Select a profile and try again.", [{text:"OK"}]);
    getPenDrawSettings(pen);
    let drawSecs = doseSize === 'low' ? pen.drawLow : (doseSize === 'high' ? pen.drawHigh : (doseSize === 'diablo' ? pen.drawDiablo : pen.drawMed));
    if (isWeenOffActive()) drawSecs = Math.max(1, Math.floor(drawSecs * 0.75));
    if (method === 'edible') {
        const edibleMg = Number(document.getElementById('config-edible-mg').value);
        if (!Number.isFinite(edibleMg) || edibleMg <= 0) {
            return showCustomModal("Invalid THC amount", "Enter the positive THC amount shown on the edible label.", [{text:"OK"}]);
        }
    }
    if (isNew && !beginTokenSession(penId, task, method)) return;
    if (!isNew && (!activeSession || activeSession.hits.length >= getSessionHitLimit(activeSession))) {
        return showCustomModal("Session limit reached", "No more hits are available in this session.", [{text:"OK"}]);
    }
    if (method === 'vape') {
        executeVapeSequence(isNew, penId, doseSize, feeling, task, method, drawSecs);
    } else {
        let hitObj = { time: Date.now(), dose: doseSize, feelingPreHit: feeling, drawSeconds: method==='joint'?drawSecs:0, penId: penId };
        if (method === 'edible') {
            const edibleMg = Number(document.getElementById('config-edible-mg').value);
            if (!Number.isFinite(edibleMg) || edibleMg <= 0) {
                return showCustomModal("Invalid THC amount", "Enter the positive THC amount shown on the edible label.", [{text:"OK"}]);
            }
            hitObj.directMg = edibleMg;
        } else if (method === 'joint') {
            hitObj.drawSeconds = drawSecs; 
        }

        finishHitDirect(hitObj);
    }
}

function executeVapeSequence(isNew, penId, dose, feeling, task, method, drawSecs) {
  const thcPercent = validTHCPercent(penById(penId).thc);
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
                        drawSequenceState.timeout = setTimeout(() => {
                            document.getElementById('draw-modal').classList.remove('open');
                            finishHitDirect({ time: Date.now(), dose, feelingPreHit: feeling, drawSeconds: drawSecs, penId: penId, thcPercent });
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
  clearTimeout(drawSequenceState.timeout);
  document.getElementById('draw-modal').classList.remove('open');
  if (activeSession && activeSession.hits.length === 0) {
    activeSession = null;
    sv('t2_activeSession', null);
    showToast('The session was cancelled; its token remains used.');
  }
  renderDashboard();
}

function finishHitDirect(hitObj) {
    if (!activeSession) return;
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

    const effectEl = document.getElementById('active-effect-text');
    if (effectEl) {
        let eff = hitObj.dose === 'low' ? 'mild' : (hitObj.dose === 'medium' ? 'moderate' : 'heavy');
        effectEl.innerText = `You should be feeling a ${eff} effect.`;
    }

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
    
    if(activeSession.hits.length >= getSessionHitLimit(activeSession)) {
        el.className = 'timer-display expired'; el.innerText = 'LIMIT';
      document.getElementById('wait-timer-lbl').innerText = activeSession.isQuickHit ? "Mini Session limit reached." : "Session limit reached.";
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
  document.getElementById('recap-thc').innerText = formatTHCSummary(calculateTHC([activeSession]));
  document.getElementById('recap-time').innerText = formatDuration(Date.now() - activeSession.ts);
  selectFeel(5, 'recap-feel-grid');
}

function cancelRecap() {
  showCustomModal("Discard Session", "Discard session? History will not be saved, and the token remains used.", [
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
    const p = penById(s.penId) || {name: 'Deleted Profile', type: 'other'};
    const fColor = getFeelColorObj(s.finalFeeling);
    const durStr = s.endTime ? formatDuration(s.endTime - s.ts) : '0m';
    const sThc = formatTHCSummary(calculateTHC([s]));
    
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
            <span class="mode-badge ${s.isQuickHit ? 'day' : 'night'} ml-auto" style="padding:2px 6px;font-size:8px">${s.isQuickHit ? 'MINI' : (s.isFuckIt ? 'FUCK IT' : 'SESSION')}</span>
        </div>
        <div class="text-sm text-muted mb-16">
            ${new Date(s.ts).toLocaleDateString()} • Started: ${fmtTime(new Date(s.ts))} 
            ${s.isQuickHit ? '⚡ Mini Session' : `• Method: ${s.method || 'Not recorded'}`}
        </div>
        
        <div style="border-top:1px dashed var(--border2); padding-top:12px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <div class="text-sm text-muted"><strong>Focus:</strong> ${s.focusTask || 'N/A'} ${s.taskCompleted ? '✅' : ''}</div>
          <div class="ml-auto flex-row" style="gap:8px;">
            <div style="padding:4px 10px; border-radius:8px; background:var(--bg2); color:var(--text2); font-weight:700; font-size:12px;">⏱ ${durStr}</div>
            <div style="padding:4px 10px; border-radius:8px; background:rgba(92,170,127,0.15); color:#5caa7f; font-weight:700; font-size:12px;">${sThc}</div>
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
  showCustomModal("Delete Record", "Permanently remove this session? Its token use and cooldown will remain.", [
    {text: "Cancel"},
    {text: "Delete", cls: "btn-danger-solid", onClick: () => {
       const deleted = sessions.find(s => s.id === id);
       sessions = sessions.filter(s=>s.id !== id); sv('t2_sessions', sessions);

       if (deleted && deleted.isQuickHit) {
         const latestQuickHit = sessions.filter(s => s.isQuickHit).reduce((latest, s) => {
           const ts = new Date(s.ts).getTime();
           return ts > latest ? ts : latest;
         }, 0);
         quickHitTimerUntil = latestQuickHit > 0 ? latestQuickHit + ((getActiveLimits().wait || 15) * 60000) : 0;
         sv('t2_qh_timer', quickHitTimerUntil);

         const lockWindowStart = Date.now() - ((parseInt(settings.quickHitTBreak, 10) || 1) * 86400000);
         const stillHasRecentQuickHit = sessions.some(s => s.isQuickHit && new Date(s.ts).getTime() >= lockWindowStart);
         if (!stillHasRecentQuickHit) {
           quickHitLockoutUntil = 0;
           sv('t2_qh_lockout', quickHitLockoutUntil);
         }
       }

       renderHistory(); renderDashboard(); renderCalendar(); renderStats();
    }}
  ]);
}

function getLongestBreak() {
  if (!sessions.length) return 0;

  const uniqueDays = [...new Set(sessions.map(s => ds(new Date(s.ts))))].sort();
  if (uniqueDays.length === 0) return 0;

  const sessionDays = new Set(uniqueDays);
  const firstDay = new Date(uniqueDays[0] + 'T00:00:00');
  const todayDate = new Date(today() + 'T00:00:00');

  let longestBreak = 0;
  let currentBreak = 0;
  const cursor = new Date(firstDay);

  while (cursor <= todayDate) {
    const dayKey = ds(cursor);
    if (sessionDays.has(dayKey)) {
      currentBreak = 0;
    } else {
      currentBreak += 1;
      longestBreak = Math.max(longestBreak, currentBreak);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return longestBreak;
}

function getFavoritePen() {
  if (!sessions.length) return { name: 'N/A', count: 0 };

  const counts = sessions.reduce((acc, s) => {
    if (!s.penId) return acc;
    acc[s.penId] = (acc[s.penId] || 0) + 1;
    return acc;
  }, {});

  const bestEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!bestEntry) return { name: 'N/A', count: 0 };

  return { name: penById(bestEntry[0])?.name || 'Unknown', count: bestEntry[1] };
}

function renderStats() {
  const totalSess = sessions.length;
  const totalHits = sessions.reduce((acc, s) => acc + s.hits.length, 0);
  const totalThc = calculateTHC(sessions);
  const qhCount = sessions.filter(s=>s.isQuickHit).length;
  const feelingValues = sessions.filter(s => typeof s.finalFeeling === 'number').map(s => s.finalFeeling);
  const avgFeel = feelingValues.length ? (feelingValues.reduce((a, b) => a + b, 0) / feelingValues.length) : 0;
  const longestBreak = getLongestBreak();
  const favoritePen = getFavoritePen();
  const avgHitsPerSess = totalSess ? totalHits / totalSess : 0;
  const completeCartSessions = sessions.map(s => calculateTHC([s])).filter(result => result.vapeHits && !result.unavailable);
  const cartAverage = completeCartSessions.reduce((total, result) => ({ low: total.low + result.low, high: total.high + result.high }), { low: 0, high: 0 });
  const quickHitRate = totalSess ? (qhCount / totalSess) * 100 : 0;

  const uniqueDaysLogged = new Set(sessions.map(s => ds(new Date(s.ts)))).size;
  const thisWeekSessions = sessions.filter(s => new Date(s.ts).getTime() >= weekStart() && !s.isQuickHit).length;

  const statGroups = [
    {
      title: 'Session Volume',
      stats: [
        { label: 'Total Sessions', value: totalSess },
        { label: 'Total Hits / Doses', value: totalHits },
        { label: 'Cart THC Vaporized (Estimate)', value: `<span style="font-size:16px">${totalThc.vapeHits ? formatTHCRange(totalThc.low, totalThc.high) : 'N/A'}${totalThc.unavailable ? ' (incomplete)' : ''}</span>` },
        { label: 'Total Mini Sessions', value: `<span style="color:var(--amber)">${qhCount}</span>` },
      ]
    },
    {
      title: 'Session Quality',
      stats: [
        { label: 'Avg Hits / Session', value: avgHitsPerSess.toFixed(1) },
        { label: 'Edible THC (Label Amounts)', value: `${totalThc.edibleMg.toFixed(2)}<span class="text-sm text-muted">mg</span>` },
        { label: 'Avg Cart THC / Complete Cart Session', value: `<span style="font-size:16px">${completeCartSessions.length ? formatTHCRange(cartAverage.low / completeCartSessions.length, cartAverage.high / completeCartSessions.length) : 'N/A'}</span>` },
        { label: 'Avg Feel', value: `${avgFeel.toFixed(1)}<span class="text-sm text-muted">/10</span>` },
        { label: 'Mini Session Rate', value: `${quickHitRate.toFixed(0)}<span class="text-sm text-muted">%</span>` },
      ]
    },
    {
      title: 'Patterns & Breaks',
      stats: [
        { label: 'Longest Break', value: `${longestBreak}d` },
        { label: 'Most Used Pen', value: `<span style="font-size:20px; line-height:1.2;">${favoritePen.name}</span>` },
        { label: 'This Week', value: thisWeekSessions },
        { label: 'Days Logged', value: uniqueDaysLogged },
      ]
    }
  ];

  document.getElementById('stats-groups').innerHTML = statGroups.map(group => `
    <div class="stats-category">
      <div class="stats-category-title">${group.title}</div>
      <div class="stat-grid">
        ${group.stats.map(stat => `
          <div class="stat glass">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('') + `<div class="text-sm text-muted">Cart values estimate THC vaporized, not absorbed. Edible label amounts are separate. Cart averages exclude sessions with unestimated hits. ${totalThc.unavailable} hit${totalThc.unavailable === 1 ? '' : 's'} could not be estimated${thcMissingDetails(totalThc)}. ${totalThc.profilePercentHits} hits use the linked profile's current THC percentage; ${totalThc.inferredMethodHits} methodless hits are inferred as cart hits.</div>`;
}

// ── Calendar ────────────────────────────────────────────────────────────────
let calYear = new Date().getFullYear(), calMonth = new Date().getMonth();

function getPlannedDayStatus(dStr) {
  if (plannedBreaks.includes(dStr)) return { key: 'no-smoke', label: 'No-Smoke 🚭 Plan Day', icon: '🚭' };
  if (sessionAllowedDays.includes(dStr)) return { key: 'session', label: 'Session 🔥 Plan Day', icon: '🔥' };
  return { key: 'quick-hit', label: 'Mini-Session ⚡ Plan Day', icon: '⚡' };
}

function renderCalendar() {
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('cal-month-lbl').textContent=months[calMonth]+' '+calYear;
  document.getElementById('calendar-token-status').innerHTML = renderTokenStatus();
  
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset = (firstDay + 6) % 7; 
  const daysInMo = new Date(calYear, calMonth + 1, 0).getDate();
  
  const todayStr=today();
  const dayMap={};
  
  const calendarSessions = activeSession && activeSession.hits.length ? [...sessions, activeSession] : sessions;
  calendarSessions.forEach(s=>{
    const d=ds(new Date(s.ts));
    if(!dayMap[d])dayMap[d]={ sessionHits:0, quickHitHits:0, sList:[], hasQuickHit:false, hasSession:false };
    if(s.isQuickHit) {
      dayMap[d].hasQuickHit=true;
      dayMap[d].quickHitHits += s.hits.length;
    } else {
      dayMap[d].hasSession=true;
      dayMap[d].sessionHits += s.hits.length;
    }
    dayMap[d].sList.push(s);
  });
  
  let cells='';
  for(let i=0;i<offset;i++) cells+='<div style="aspect-ratio:1"></div>';
  
  for(let d=1;d<=daysInMo;d++){
    const dStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dm=dayMap[dStr]||{sList:[]};
    const isT=dStr===todayStr, isF=dStr>todayStr;
    const weekdayLabel = new Date(`${dStr}T12:00:00`).toLocaleDateString([], { weekday: 'short' });
    let bg = 'var(--bg3)', border = 'transparent';
    let extraCls = dStr === selectedCalDate ? 'selected-cal-day' : '';
    
    if(dm.hasSession && dm.hasQuickHit) { bg = 'rgba(224,94,94,0.15)'; border = 'var(--red)'; }
    else if(dm.hasQuickHit) { bg = 'rgba(162,117,255,0.15)'; border = 'var(--purple)'; }
    else if(dm.hasSession) { bg = 'rgba(212,168,67,0.15)'; border = 'var(--amber)'; }
    
    let style = `background:${bg}; border:1px solid ${border}; color:var(--text);`;
    if(isT && dStr !== selectedCalDate) style += `box-shadow: 0 0 0 2px var(--border2);`;
    if(isF) style += `opacity: 0.5;`;

    const status = getPlannedDayStatus(dStr);
    const rechargeCount = tokenUses.filter(use => use.readyAt > use.startedAt && ds(new Date(use.readyAt)) === dStr).length;
    const breakAt = isT ? Date.now() : new Date(dStr + 'T00:00:00').getTime();
    const icon = status.icon + (rechargeCount ? '🔄' : '') + (dStr >= todayStr && getBreakReasons(breakAt).length ? '🔒' : '');
    const activity = [
      { label: 'Session', icon: '🔥', hits: dm.sessionHits || 0, color: 'night' },
      { label: 'Mini Session', icon: '⚡', hits: dm.quickHitHits || 0, color: 'quick-hit' }
    ].filter(item => item.hits > 0);
    const activityLabel = activity.length ? activity.map(item => `${item.label}: ${item.hits} hit${item.hits === 1 ? '' : 's'}`).join(', ') : (isF ? 'Future day' : 'Rest day');
    const activityHtml = activity.map(item => `
      <div class="cal-activity-row ${item.color}" title="${item.label}: ${item.hits} hit${item.hits === 1 ? '' : 's'}">
        <span aria-hidden="true">${item.icon}</span>
        <span class="cal-activity-track"><span class="cal-activity-fill" style="width:${Math.min(item.hits, 4) * 25}%;"></span></span>
      </div>`).join('');
    const futureLabel = isF ? 'Future' : 'Rest';

    cells+=`
    <div class="cal-cell" style="aspect-ratio:1;">
      <div class="cal-cell-inner glass ${extraCls}" style="${style}" onclick="showCalDetails('${dStr}')" title="${dStr}: ${activityLabel}" aria-label="${dStr}: ${activityLabel}">
        <div class="cal-date-num">${d}</div>
        ${activityHtml ? `<div class="cal-activity">${activityHtml}</div>` : ''}
        ${!activity.length ? `<div class="cal-day-label">${futureLabel}</div>` : ''}
      </div>
      ${icon ? `<div class="cal-badge">${icon}</div>` : ''}
    </div>`;
  }
  document.getElementById('cal-grid').innerHTML=cells;
  if (selectedCalDate) showCalDetailsPane(selectedCalDate);
  else clearCalPreview();
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
  const calendarSessions = activeSession && activeSession.hits.length ? [...sessions, activeSession] : sessions;
  const dSess = calendarSessions.filter(s => ds(new Date(s.ts)) === dStr);
  const pane = document.getElementById('cal-details-pane');
  const status = getPlannedDayStatus(dStr);
  const statusHtml = `<div class="calendar-plan-status ${status.key}">${status.label}</div>`;
  
  const noSmokeDay = plannedBreaks.includes(dStr);
  let planBtn = `
  <div class="toggle-row mt-16" style="border-top:1px dashed var(--border2); padding-top:16px;">
      <label class="toggle-label" for="cal-planned-break">No-Smoke Day 🚭</label>
      <label class="toggle"><input type="checkbox" id="cal-planned-break" ${noSmokeDay ? 'checked' : ''} onchange="togglePlannedBreak('${dStr}')"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
  </div>`;
  const allowSession = !noSmokeDay ? `
    <div class="toggle-row" style="border-top:1px dashed var(--border2);">
      <label class="toggle-label" for="cal-allow-session">Plan Session Day 🔥</label>
      <label class="toggle"><input type="checkbox" id="cal-allow-session" ${sessionAllowedDays.includes(dStr) ? 'checked' : ''} onchange="toggleSessionAllowed('${dStr}')"><div class="toggle-track"></div><div class="toggle-thumb"></div></label>
    </div>
  ` : '';
  const calendarControls = planBtn + allowSession;

  const events = tokenUses.filter(use => use.readyAt > use.startedAt && ds(new Date(use.readyAt)) === dStr);
  const rechargeHtml = events.length ? `<div class="text-sm mt-16">${events.map(use =>
    `🔄 ${use.type === 'mini' ? 'Mini Session' : (use.type === 'fuckit' ? 'Fuck It' : 'Session')} token${use.slot === null ? '' : ` ${use.slot + 1}`} recharges at ${fmtTime(new Date(use.readyAt))}`
  ).join('<br>')}</div>` : '';
  const future = dStr >= today();
  const at = dStr === today() ? Date.now() : new Date(dStr + 'T00:00:00').getTime();
  const breaks = future ? getBreakReasons(at) : [];
  const breakHtml = breaks.length ? `<div class="alert warn mt-16">🔒 ${dStr === today() ? 'Active now' : 'At start of day'}: ${breaks.join(', ')}</div>` : '';
  const availability = future ? `<div class="mt-16"><strong>Token status ${dStr === today() ? 'now' : 'at start of day'}</strong>${renderTokenStatus(at, dStr === today())}<div class="text-sm text-muted">Projection assumes no additional sessions or settings changes; breaks may prevent use.</div></div>` : '';

  if(dSess.length === 0) { 
    const badge = dStr > today() ? 'Future day' : 'No recorded use (rest day)';
    pane.innerHTML = `<div class="flex-row"><div class="card-title" style="margin:0;">${dObj.toDateString()}</div></div><div class="empty mt-16 mb-16">${badge}</div>${statusHtml}${breakHtml}${rechargeHtml}${availability}${calendarControls}`;
    return; 
  }
  
  const totalThc = formatTHCSummary(calculateTHC(dSess));
  pane.innerHTML = `
    <div class="card-title">${dObj.toDateString()}</div>
    <div class="flex-row mb-16"><div class="stat glass" style="flex:1;padding:10px;">${totalThc}</div></div>
    ${dSess.map(s=>{
      const qb = s.isQuickHit ? '⚡ Mini Session' : (s.isFuckIt ? '⚠️ Fuck It Session' : 'Session');
      return `<div class="text-sm text-muted mb-8">• ${penById(s.penId)?.name||'Unknown'} [${qb}] - ${s.hits.length} doses${s === activeSession ? ' (in progress)' : ''}</div>`;
    }).join('')}
    ${statusHtml}
    ${breakHtml}
    ${rechargeHtml}
    ${availability}
    ${calendarControls}
  `;
}

function togglePlannedBreak(dStr) {
  if (plannedBreaks.includes(dStr)) {
      plannedBreaks = plannedBreaks.filter(d => d !== dStr);
  } else {
      plannedBreaks.push(dStr);
      sessionAllowedDays = sessionAllowedDays.filter(d => d !== dStr);
      sv('t2_session_allowed_days', sessionAllowedDays);
  }
  sv('t2_planned_breaks', plannedBreaks); renderCalendar(); renderDashboard();
}

function toggleSessionAllowed(dStr) {
  if (plannedBreaks.includes(dStr)) return;
  sessionAllowedDays = sessionAllowedDays.includes(dStr)
      ? sessionAllowedDays.filter(d => d !== dStr)
      : [...sessionAllowedDays, dStr];
  sv('t2_session_allowed_days', sessionAllowedDays);
  renderCalendar();
  renderDashboard();
}

// ── Clearance Tests Tab ─────────────────────────────────────────────────────
function renderClearance() {
    const lastHit = getLastHitInfo();
    const lastUseEl = document.getElementById('cl-last-use');
    const salivaStatusEl = document.getElementById('cl-saliva-status');
    const urineStatusEl = document.getElementById('cl-urine-status');
    const frequencyEl = document.getElementById('cl-frequency');
    const windows = { single: 'About 2 days', weekly: 'About 2 weeks', daily: '2–4 weeks', heavy: '4–6 weeks; up to 12 weeks' };
    const frequency = Object.prototype.hasOwnProperty.call(windows, settings.clearanceFrequency) ? settings.clearanceFrequency : '';

    if (lastUseEl) {
        lastUseEl.innerText = lastHit.time ? new Date(lastHit.time).toLocaleString() : 'No use logged';
    }
    frequencyEl.value = frequency;
    if (salivaStatusEl) salivaStatusEl.innerText = 'Published example: up to 24 hours';
    if (urineStatusEl) urineStatusEl.innerText = frequency ? windows[frequency] : 'Select usage frequency for an example';
}

function saveClearanceFrequency() {
    settings.clearanceFrequency = document.getElementById('cl-frequency').value;
    sv('t2_settings', settings);
    renderClearance();
}

// ── Tab Management ──────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.content').forEach(el => el.classList.remove('active'));
  
  const activeBtn = document.querySelector(`.nav-item[onclick*="switchTab('${name}')"]`);
  const targetContent = document.getElementById('tab-' + name);
  
  if (activeBtn) activeBtn.classList.add('active'); 
  if (targetContent) targetContent.classList.add('active'); 
  
  let niceName = name.toUpperCase().replace('-', ' ');
  if (name === 'binder') niceName = 'THE BINDER';
  document.getElementById('topbar-title').innerText = niceName;
  
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
  if (name === 'binder') { renderTodo(); renderGoals(); renderSongs(); }
  if (name === 'guide') renderRules();
  if (name === 'settings') renderSettings();
}

// ── Equipment Checklist ──────────────────────────────────────────────────────
function renderEquipment() {
    document.getElementById('equipment-list').innerHTML = equipment.map(e => `
        <div class="glass" style="background:var(--bg3); padding:16px; border:1px solid var(--border2); border-radius:8px;">
            <div class="flex-row" style="justify-content:space-between; margin-bottom: 8px;">
              <strong style="color:var(--accent); ${e.url ? 'cursor:pointer; text-decoration:underline;' : ''}" onclick="${e.url ? `window.open('${e.url}', '_blank')` : ''}">${e.text} ${e.url ? '🔗' : ''}</strong>
              <div class="flex-row gap-8">
                 <button class="btn btn-ghost btn-sm" style="padding:4px 8px;" onclick="editEquipment('${e.id}')">Edit</button>
                 <button class="btn btn-ghost btn-sm" style="padding:4px 8px;" onclick="deleteEquipment('${e.id}')">Del</button>
              </div>
            </div>
            <p class="text-sm text-muted" style="margin-bottom:0;">${e.desc || ''}</p>
        </div>
    `).join('') || '<div class="empty">No equipment logged.</div>';
}

function addNewEquipment() {
    const newId = 'e' + Date.now();
    equipment.push({ id: newId, text: 'New Gear Item', desc: 'Description here.', url: '' });
    sv('t2_equipment', equipment);
    editEquipment(newId);
}

function editEquipment(id) {
    const eq = equipment.find(e => e.id === id);
    if (!eq) return;
    document.getElementById('edit-equip-id').value = eq.id;
    document.getElementById('edit-equip-name').value = eq.text;
    document.getElementById('edit-equip-desc').value = eq.desc || '';
    document.getElementById('edit-equip-url').value = eq.url || '';
    document.getElementById('edit-equip-modal').classList.add('open');
}

function closeEditEquipModal() { document.getElementById('edit-equip-modal').classList.remove('open'); }

function saveEquipEdit() {
    const id = document.getElementById('edit-equip-id').value;
    const eq = equipment.find(e => e.id === id);
    if(eq) {
        eq.text = document.getElementById('edit-equip-name').value.trim() || 'Unnamed Item';
        eq.desc = document.getElementById('edit-equip-desc').value.trim();
        eq.url = document.getElementById('edit-equip-url').value.trim();
        sv('t2_equipment', equipment);
        renderEquipment();
        closeEditEquipModal();
    }
}

function deleteEquipment(id) {
    if(confirm("Delete this equipment item?")) {
        equipment = equipment.filter(e => e.id !== id);
        sv('t2_equipment', equipment);
        renderEquipment();
    }
}

// ── Checklists ──────────────────────────────────────────────────────────────
function renderTodo() { document.getElementById('todo-list').innerHTML = todos.map(t => `<div class="check-row" onclick="removeTodo('${t.id}')"><div class="check-box"></div><div class="check-text">${t.text}</div></div>`).join('') || '<div class="empty text-sm">Tasks clear!</div>'; }
function addTodo() { const val = document.getElementById('new-todo-input').value.trim(); if(val) { todos.push({ id:'t'+Date.now(), text: val }); sv('t2_todos', todos); document.getElementById('new-todo-input').value = ''; renderTodo(); } }
function removeTodo(id) { todos = todos.filter(t=>t.id!==id); sv('t2_todos', todos); renderTodo(); }

function renderRoutine() {
  const list = document.getElementById('routine-list');
  const all = routineChecks.filter(c => c.mode === 'all');
  const mini = routineChecks.filter(c => c.mode === 'mini');
  const full = routineChecks.filter(c => c.mode === 'session');

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
  list.innerHTML = renderGroup('Both', all, '', '') + renderGroup('Mini Session', mini, 'day', 'MINI') + renderGroup('Session', full, 'night', 'SESSION') || '<div class="empty">No requirements added.</div>';
}
function toggleHabit(id) { const h = routineChecks.find(x => x.id === id); if(h) h.done = !h.done; sv('t2_routine', routineChecks); renderRoutine(); renderDashboard(); }
function addHabit() { const val = document.getElementById('new-habit-input').value.trim(); const mode = document.getElementById('new-habit-mode').value; if(val) { routineChecks.push({ id:'r'+Date.now(), text: val, done: false, mode: mode }); sv('t2_routine', routineChecks); document.getElementById('new-habit-input').value = ''; renderRoutine(); renderDashboard(); } }
function removeHabit(id) { routineChecks = routineChecks.filter(x => x.id !== id); sv('t2_routine', routineChecks); renderRoutine(); renderDashboard(); }
function resetRoutine() { routineChecks.forEach(h => h.done = false); sv('t2_routine', routineChecks); renderRoutine(); renderDashboard(); showToast("Checks reset"); }

function renderSongs() { 
    document.getElementById('song-list').innerHTML = songs.map(s => `
        <div class="check-row" onclick="removeSong('${s.id}')">
            <div class="check-box" style="border-radius:50%">🎵</div>
            <div class="check-text"><strong>${s.artist || 'Unknown Artist'}</strong> - ${s.text}</div>
        </div>
    `).join('') || '<div class="empty text-sm">No songs queued.</div>'; 
}
function addSong() { 
    const artist = document.getElementById('new-song-artist').value.trim();
    const val = document.getElementById('new-song-input').value.trim(); 
    if(val) { 
        songs.push({ id:'s'+Date.now(), text: val, artist: artist }); 
        sv('t2_songs', songs); 
        document.getElementById('new-song-input').value = ''; 
        document.getElementById('new-song-artist').value = ''; 
        renderSongs(); 
    } 
}
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
  if (p.type !== 'cart') return '<div class="mt-8 text-sm text-muted">No cartridge estimate for this profile type.</div>';
  const compounds = [['THC', p.thc], ['CBD', p.cbd], [p.customCName || 'Other', p.customCVal]];
  const text = compounds.filter(([, value]) => validTHCPercent(value) !== null).map(([name, value]) => {
    const safeName = String(name).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
    const percent = validTHCPercent(value);
    return `~${formatTHCRange(seconds * OIL_RATE_LOW * percent / 100, seconds * OIL_RATE_HIGH * percent / 100)} ${safeName}`;
  });
  return `<div class="mt-8 text-sm text-muted">${text.length ? text.join('<br>') : 'Add a valid compound percentage to estimate.'}</div>`;
}

function renderPens() {
  const container = document.getElementById('pens-grid-container');
  const cols = [
      { key: 'cart', title: 'Carts & Disposables' },
      { key: 'edible', title: 'Edibles & Pills' },
      { key: 'flower', title: 'Flower & Joints' },
      { key: 'other', title: 'Other / Tinctures' }
  ];

  let gridHtml = '';
  
  cols.forEach(col => {
      const colPens = pens.filter(p => (p.type || 'other') === col.key);
      let colContent = `<div class="pen-col-header">${col.title} (${colPens.length})</div>`;
      
      if (!colPens.length) {
          colContent += `<div class="empty" style="padding: 20px 10px;">Nothing here yet.</div>`;
      } else {
          colContent += colPens.map(p => {
              getPenDrawSettings(p);
              let diabloHtml = '';
              if (p.diabloEnabled) {
                diabloHtml = `<div class="text-center" style="background:rgba(162,117,255,0.05); padding:12px; border-radius:8px; flex:1; min-width:80px; border:1px solid rgba(162,117,255,0.2); margin-top:8px;">
                    <div style="color:var(--purple); font-weight:700; font-size:12px;">Diablo Draw (${p.drawDiablo}s)</div>
                    ${getCompoundsHtml(p, p.drawDiablo)}
                </div>`;
              }
              return `
              <div class="glass" style="background:var(--bg3); padding:16px; border-radius:var(--radius); border:0.5px solid var(--border2); margin-bottom:12px;">
                 <div class="flex-row mb-8" style="justify-content:space-between;">
                   <strong style="color:var(--accent); font-size:15px; word-break:break-word;">${p.name}</strong>
                   <div class="flex-row gap-4">
                     <button class="btn btn-ghost btn-sm" style="padding:4px;" onclick="editPen('${p.id}')">✏️</button>
                     <button class="btn btn-ghost btn-sm" style="padding:4px;" onclick="retirePen('${p.id}')">🥀</button>
                   </div>
                 </div>
                 <div class="text-sm text-muted mb-8">THC: ${p.thc || 0}% ${p.cbd ? ' | CBD: '+p.cbd+'%' : ''} ${p.customCVal ? ' | ' + (p.customCName || 'CBN') + ': ' + p.customCVal + '%' : ''}</div>
                 ${p.notes ? `<div class="text-sm text-muted mb-12" style="font-style:italic;">Notes: ${p.notes}</div>` : ''}
                 
                 <div style="background:var(--bg2); padding:12px; border-radius:8px;">
                   <div class="pen-draw-row">
                      <div class="text-center" style="background:rgba(92,170,127,0.05); padding:8px; border-radius:8px; border:1px solid rgba(92,170,127,0.2);">
                          <div style="color:var(--green); font-weight:700; font-size:11px;">Low Draw (${p.drawLow}s)</div>
                          ${getCompoundsHtml(p, p.drawLow)}
                      </div>
                      <div class="text-center" style="background:rgba(212,168,67,0.05); padding:8px; border-radius:8px; border:1px solid rgba(212,168,67,0.2);">
                          <div style="color:var(--amber); font-weight:700; font-size:11px;">Medium Draw (${p.drawMed}s)</div>
                          ${getCompoundsHtml(p, p.drawMed)}
                      </div>
                      <div class="text-center" style="background:rgba(224,94,94,0.05); padding:8px; border-radius:8px; border:1px solid rgba(224,94,94,0.2);">
                          <div style="color:var(--red); font-weight:700; font-size:11px;">High Draw (${p.drawHigh}s)</div>
                          ${getCompoundsHtml(p, p.drawHigh)}
                      </div>
                   </div>
                   ${diabloHtml}
                 </div>
              </div>`;
          }).join('');
      }
      gridHtml += `<div class="pen-col">${colContent}</div>`;
  });

  container.innerHTML = gridHtml;

  const graveList = document.getElementById('graveyard-list');
  if(!graveyard.length) { graveList.innerHTML = '<div class="empty">No profiles in the graveyard.</div>'; }
  else {
    graveList.innerHTML = graveyard.map(p => `
        <div class="glass" style="background:var(--bg2); padding:16px; border-radius:var(--radius); border:1px solid var(--border2); opacity:0.7;">
           <div class="flex-row">
             <strong style="color:var(--text2); text-decoration:line-through; font-size:16px;">[${(p.type||'other').toUpperCase()}] ${p.name}</strong>
             <span class="ml-auto" style="font-size:18px;">🥀</span>
             <button class="btn btn-ghost btn-sm ml-8" onclick="deleteGravePen('${p.id}')">Del</button>
           </div>
        </div>`).join('');
  }
}

function addPen() {
  const name = document.getElementById('pen-name').value.trim();
  const type = document.getElementById('pen-type').value;
  const thcInput = document.getElementById('pen-thc').value;
  const thc = thcInput === '' ? 0 : Number(thcInput);
  if(!name) return showCustomModal("Error", "Required: Strain / Profile Name", [{text: "OK"}]);
  if (!Number.isFinite(thc) || thc < 0 || thc > 100) return showCustomModal("Invalid THC percentage", "Enter a THC percentage from 0 to 100, or leave it blank.", [{text:"OK"}]);
  const cbd = parseFloat(document.getElementById('pen-cbd').value) || 0;
  const cVal = parseFloat(document.getElementById('pen-c-val').value) || 0;
  const cName = document.getElementById('pen-c-name').value.trim() || 'CBN';
  const notes = document.getElementById('pen-notes').value.trim();

  pens.push({id:'p'+Date.now(), name, type, thc, cbd, customCVal: cVal, customCName: cName, notes, ...DEFAULT_PEN_DRAW_SETTINGS});
  sv('t2_pens', pens); 
  document.getElementById('pen-name').value=''; document.getElementById('pen-thc').value='';
  document.getElementById('pen-cbd').value=''; document.getElementById('pen-c-val').value=''; document.getElementById('pen-notes').value='';
  renderPens(); showToast("Profile added");
}

function editPen(id) {
  const p = pens.find(x => x.id === id);
  if (!p) return;
  getPenDrawSettings(p);
  document.getElementById('edit-pen-id').value = p.id;
  document.getElementById('edit-pen-name').value = p.name || '';
  document.getElementById('edit-pen-type').value = p.type || 'other';
  document.getElementById('edit-pen-thc').value = p.thc || 0;
  document.getElementById('edit-pen-draw-low').value = p.drawLow;
  document.getElementById('edit-pen-draw-med').value = p.drawMed;
  document.getElementById('edit-pen-draw-high').value = p.drawHigh;
  document.getElementById('edit-pen-diablo-enabled').checked = p.diabloEnabled;
  document.getElementById('edit-pen-draw-diablo').value = p.drawDiablo;
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
      const thcInput = document.getElementById('edit-pen-thc').value;
      const thc = thcInput === '' ? 0 : Number(thcInput);
      if (!Number.isFinite(thc) || thc < 0 || thc > 100) return showCustomModal("Invalid THC percentage", "Enter a THC percentage from 0 to 100, or leave it blank.", [{text:"OK"}]);
      const drawFields = [
        ['drawLow', 'edit-pen-draw-low'],
        ['drawMed', 'edit-pen-draw-med'],
        ['drawHigh', 'edit-pen-draw-high'],
        ['drawDiablo', 'edit-pen-draw-diablo']
      ];
      const drawValues = {};
      for (const [key, elementId] of drawFields) {
        const value = Number(document.getElementById(elementId).value);
        if (!Number.isInteger(value) || value < 1 || value > 60) {
          showToast("Draw times must be whole seconds from 1 to 60.");
          return;
        }
        drawValues[key] = value;
      }
      p.name = document.getElementById('edit-pen-name').value.trim();
      p.type = document.getElementById('edit-pen-type').value;
      p.thc = thc;
      Object.assign(p, drawValues);
      p.diabloEnabled = document.getElementById('edit-pen-diablo-enabled').checked;
      p.cbd = parseFloat(document.getElementById('edit-pen-cbd').value) || 0;
      p.customCVal = parseFloat(document.getElementById('edit-pen-c-val').value) || 0;
      p.customCName = document.getElementById('edit-pen-c-name').value.trim() || 'CBN';
      p.notes = document.getElementById('edit-pen-notes').value.trim();
      sv('t2_pens', pens); renderPens(); closeEditPenModal(); showToast("Profile updated!");
      if(activeSession && activeSession.penId === id) renderDashboard();
  }
}

function deleteGravePen(id) {
  showCustomModal("Delete Profile", "Permanently delete this profile from graveyard? History remains.", [
    {text: "Cancel"}, {text: "Delete", cls: "btn-danger", onClick: () => { graveyard = graveyard.filter(p=>p.id!==id); sv('t2_graveyard', graveyard); renderPens(); }}
  ]);
}
function retirePen(id) {
  showCustomModal("Retire Profile", "Is this profile completely empty? It will be moved to the graveyard.", [
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
  setVal('s-theme', settings.theme || 'auto');
  setVal('s-font', settings.font || "'Space Mono', monospace");

  setVal('s-maxHits', settings.maxHits);
  setVal('s-maxMiniSessionHits', settings.maxMiniSessionHits);
  setVal('s-sessPerWeek', settings.sessPerWeek);
  setVal('s-quickHitsPerWeek', settings.quickHitsPerWeek);
  setVal('s-quickHitTBreak', settings.quickHitTBreak);
  setVal('s-sessionTokensPerWeek', settings.sessionTokensPerWeek);
  setVal('s-miniTokensPerWeek', settings.miniTokensPerWeek);
  setVal('s-tokenMaxHits', settings.maxHits);
  setVal('s-tokenMiniHits', settings.maxMiniSessionHits);
  setVal('s-tokenCooldownHours', settings.tokenCooldownHours);
  setVal('s-globalCooldownHours', settings.globalCooldownHours);
  setCheck('s-globalCooldownEnabled', settings.globalCooldownEnabled);
  setVal('s-sessionWait', settings.sessionWait);
  setVal('s-miniWait', settings.miniWait);
  setVal('s-fuckItTokensPerMonth', settings.fuckItTokensPerMonth);
  setVal('s-fuckItPenaltyDays', settings.fuckItPenaltyDays);
  setCheck('s-fuckItPenaltyEnabled', settings.fuckItPenaltyEnabled);
  setVal('s-dayStart', getModeStart('day'));
  setVal('s-nightStart', getModeStart('night'));
  
  setCheck('s-enforceWeeklyLimit', !!settings.enforceWeeklyLimit);
  setCheck('s-enforceRestDays', !!settings.enforceRestDays);
  
  setVal('s-restDays', settings.restDays);
  if(document.getElementById('restDaysLbl')) document.getElementById('restDaysLbl').innerText = settings.restDays;

  setVal('s-yearlyBreakMonth', settings.yearlyBreakMonth);
  setCheck('s-weenOffEnabled', !!settings.weenOffEnabled);

  setCheck('s-autoTBreak', !!settings.autoTBreak);
  setVal('s-autoTBreakWeek', settings.autoTBreakWeek || 4);

  setVal('s-breakStart', settings.breakStart || '');
  setVal('s-breakEnd', settings.breakEnd || '');
  setCheck('s-hardcoreLockout', !!settings.hardcoreLockout);
  setCheck('s-allowQuickHit', !!settings.allowQuickHit);

  setCheck('s-allowFuckIt', !!settings.allowFuckIt);
  setVal('s-fuckItLimitPerMonth', settings.fuckItLimitPerMonth);

  renderEmergencyLinksSettings();
}

function saveSettings(silent = false) {
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : null; };
  const getInt = (id, dflt=0) => { const v = getVal(id); return v ? parseInt(v, 10) : dflt; };
  const getCheck = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };
  const dayStart = getVal('s-dayStart');
  const nightStart = getVal('s-nightStart');
  if (!dayStart || !nightStart || dayStart === nightStart) {
    showToast("Daytime and nighttime start times must be different.");
    renderSettings();
    return;
  }
  const tokenFields = [
    ['sessionTokensPerWeek', 's-sessionTokensPerWeek', 0, 20],
    ['miniTokensPerWeek', 's-miniTokensPerWeek', 0, 20],
    ['maxHits', 's-tokenMaxHits', 1, 20],
    ['maxMiniSessionHits', 's-tokenMiniHits', 1, 20],
    ['tokenCooldownHours', 's-tokenCooldownHours', 0, 720],
    ['globalCooldownHours', 's-globalCooldownHours', 0, 720],
    ['sessionWait', 's-sessionWait', 1, 240],
    ['miniWait', 's-miniWait', 1, 240],
    ['fuckItTokensPerMonth', 's-fuckItTokensPerMonth', 0, 20],
    ['fuckItPenaltyDays', 's-fuckItPenaltyDays', 1, 30]
  ];
  const tokenValues = {};
  const breakStart = getVal('s-breakStart');
  const breakEnd = getVal('s-breakEnd');
  if (breakStart && breakEnd && breakStart > breakEnd) {
    showToast('Break end date must be on or after the start date.');
    renderSettings();
    return;
  }
  for (const [key, id, min, max] of tokenFields) {
    const raw = getVal(id);
    const value = Number(raw);
    if (raw === '' || !Number.isInteger(value) || value < min || value > max) {
      showToast(`Enter a whole number between ${min} and ${max} for ${document.getElementById(id).closest('.settings-group').querySelector('.settings-title').textContent}.`);
      renderSettings();
      return;
    }
    tokenValues[key] = value;
  }

  username = getVal('s-username'); sv('t2_username', username);
  settings.theme = getVal('s-theme');
  settings.font = getVal('s-font');

  Object.assign(settings, tokenValues);
  settings.globalCooldownEnabled = getCheck('s-globalCooldownEnabled');
  settings.fuckItPenaltyEnabled = getCheck('s-fuckItPenaltyEnabled');
  settings.dayStart = dayStart;
  settings.nightStart = nightStart;
  
  settings.enforceWeeklyLimit = getCheck('s-enforceWeeklyLimit');
  settings.enforceRestDays = getCheck('s-enforceRestDays');
  settings.restDays = getInt('s-restDays', settings.restDays);

  settings.allowFuckIt = getCheck('s-allowFuckIt');
  settings.fuckItLimitPerMonth = getInt('s-fuckItLimitPerMonth', settings.fuckItLimitPerMonth);

  settings.yearlyBreakMonth = getVal('s-yearlyBreakMonth') || 'none';
  settings.weenOffEnabled = getCheck('s-weenOffEnabled');

  settings.autoTBreak = getCheck('s-autoTBreak');
  settings.autoTBreakWeek = getInt('s-autoTBreakWeek', settings.autoTBreakWeek);

  settings.breakStart = breakStart;
  settings.breakEnd = breakEnd;
  settings.hardcoreLockout = getCheck('s-hardcoreLockout');
  settings.allowQuickHit = getCheck('s-allowQuickHit');

  sv('t2_settings', settings);
  updateGlobalClock();
  applyTheme();
  if (!silent) showToast("Settings saved!");
  renderDashboard();
  renderCalendar();
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
            renderDashboard();
            renderCalendar();
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
  const csvRow = values => values.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',') + '\n';
  let csv = csvRow(['Date', 'Time', 'Pen', 'Method', 'Mode', 'Hits', 'Cart_THC_low_mg', 'Cart_THC_high_mg', 'Edible_label_THC_mg', 'Unestimated_hits', 'Missing_method_hits', 'Missing_THC_percent_hits', 'Final_Feeling', 'Is_Quick_Hit', 'Focus_Task', 'Task_Done', 'Notes', 'Session_Type']);
  sessions.forEach(s => {
    const p = penById(s.penId) || {name: 'Deleted Profile', type: 'other'};
    const d = new Date(s.ts);
    const thc = calculateTHC([s]);
    csv += csvRow([d.toLocaleDateString(), d.toLocaleTimeString(), p.name, s.method || 'Unknown', s.mode, s.hits.length, thc.vapeHits ? thc.low.toFixed(2) : '', thc.vapeHits ? thc.high.toFixed(2) : '', thc.edibleHits ? thc.edibleMg.toFixed(2) : '', thc.unavailable, thc.missingMethod, thc.missingPercent, s.finalFeeling || '', s.isQuickHit ? 'Yes' : 'No', s.focusTask || 'None', s.taskCompleted ? 'Yes' : 'No', s.notes || '', s.isQuickHit ? 'Mini Session' : (s.isFuckIt ? 'Fuck It Session' : 'Session')]);
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