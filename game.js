// ═══════════════════════════════════════════════════════════════
//   PIXEL FOOT '96  —  GAME ENGINE v2
//   Modes : 1J vs IA  /  2J local + tactile
// ═══════════════════════════════════════════════════════════════

// ── ÉQUIPES ─────────────────────────────────────────────────────
const TEAMS = [
  { id:'brazil',      name:'BRÉSIL',    badge:'🇧🇷', c1:'#f9e000', c2:'#1a7a1a', rating:95,
    players:['RONALDO','ROMÁRIO','BEBETO','ALDAIR','CAFU','R.CARLOS','DUNGA','MAZINHO','MAURO S.','BRANCO','TAFFAREL'] },
  { id:'france',      name:'FRANCE',    badge:'🇫🇷', c1:'#3055cc', c2:'#ED2939', rating:90,
    players:['ZIDANE','HENRY','DJORKAEFF','DESAILLY','BLANC','THURAM','LIZARAZU','DESCHAMPS','PETIT','VIEIRA','BARTHEZ'] },
  { id:'germany',     name:'ALLEMAGNE', badge:'🇩🇪', c1:'#ddd', c2:'#111', rating:88,
    players:['KLINSMANN','BIERHOFF','VÖLLER','MATTHÄUS','SAMMER','KOHLER','BREHME','EFFENBERG','HÄSSLER','ZIEGE','KAHN'] },
  { id:'italy',       name:'ITALIE',    badge:'🇮🇹', c1:'#1a44cc', c2:'#fff', rating:89,
    players:['BAGGIO','DEL PIERO','MALDINI','BARESI','COSTACURTA','ALBERTINI','ZOLA','SIGNORI','CASIRAGHI','DONADONI','PERUZZI'] },
  { id:'argentina',   name:'ARGENTINE', badge:'🇦🇷', c1:'#74ACDF', c2:'#fff', rating:87,
    players:['BATISTUTA','ORTEGA','CANIGGIA','SIMEONE','VERON','AYALA','ALMEYDA','GALLARDO','ZANETTI','SENSINI','GOYCOCHEA'] },
  { id:'spain',       name:'ESPAGNE',   badge:'🇪🇸', c1:'#AA151B', c2:'#F1BF00', rating:84,
    players:['RAÚL','HIERRO','MÍCHEL','GUARDIOLA','SERGI','NADAL','DE LA PEÑA','CAMINERO','SALINAS','ABELARDO','ZUBIZARRETA'] },
  { id:'england',     name:'ANGLETERRE',badge:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', c1:'#ddd', c2:'#CF142B', rating:83,
    players:['SHEARER','SHERINGHAM','GASCOIGNE','SCHOLES','BECKHAM','INCE','MCMANAMAN','ANDERTON','ADAMS','PEARCE','SEAMAN'] },
  { id:'netherlands', name:'PAYS-BAS',  badge:'🇳🇱', c1:'#FF4F00', c2:'#fff', rating:88,
    players:['BERGKAMP','KLUIVERT','DAVIDS','SEEDORF','OVERMARS','R.DE BOER','F.DE BOER','STAM','COCU','BLIND','VAN DER SAR'] },
  { id:'portugal',    name:'PORTUGAL',  badge:'🇵🇹', c1:'#006600', c2:'#FF0000', rating:85,
    players:['FIGO','J.PINTO','SA PINTO','COUTO','SECRETÁRIO','OCEANO','DRULOVIC','DIMAS','VIDIGAL','BETO','BAIA'] },
  { id:'milan',       name:'AC MILAN',  badge:'🔴⚫', c1:'#CC0000', c2:'#111', rating:92,
    players:['WEAH','SAVICEVIC','BOBAN','DESAILLY','MALDINI','BARESI','COSTACURTA','DONADONI','ALBERTINI','SIMONE','S.ROSSI'] },
];

// ── CONSTANTES ───────────────────────────────────────────────────
const PLAYER_SPEED  = 3.0;
const SPRINT_MULT   = 1.55;
const BALL_FRICTION = 0.955;
const SHOOT_POWER   = 11;
const PASS_POWER    = 6;
const AI_SPEED_BASE = 1.9;
const MATCH_FRAMES  = 60 * 180; // 3 minutes réelles ≈ 90 minutes match

// ── ÉTAT GLOBAL ──────────────────────────────────────────────────
const G = {
  mode: '1p',   // '1p' ou '2p'
  screen: 'title',
  selectStep: 0,
  hoverIdx: 0,
  team1: null,
  team2: null,
  endMenuIdx: 0,
};

// ── CANVAS ───────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let CW, CH; // dimensions canvas réelles

function resizeCanvas() {
  const area = document.getElementById('game-area');
  if (!area) return;
  CW = area.clientWidth;
  CH = area.clientHeight;
  canvas.width  = CW;
  canvas.height = CH;
}

// ── UTILS ────────────────────────────────────────────────────────
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

// ── SCREENS ──────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  G.screen = name;
  if (name === 'game') resizeCanvas();
}

// ════════════════════════════════════════════
//   ÉCRAN TITRE
// ════════════════════════════════════════════
document.getElementById('mode-1p').addEventListener('click', () => setMode('1p'));
document.getElementById('mode-2p').addEventListener('click', () => setMode('2p'));
document.getElementById('mode-1p').addEventListener('touchstart', e => { e.preventDefault(); setMode('1p'); }, {passive:false});
document.getElementById('mode-2p').addEventListener('touchstart', e => { e.preventDefault(); setMode('2p'); }, {passive:false});

function setMode(m) {
  G.mode = m;
  document.getElementById('mode-1p').classList.toggle('active-mode', m === '1p');
  document.getElementById('mode-2p').classList.toggle('active-mode', m === '2p');
}

document.addEventListener('keydown', e => {
  if (G.screen === 'title') {
    if (e.key === 'Enter') launchSelect();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setMode(G.mode === '1p' ? '2p' : '1p');
  } else if (G.screen === 'select') {
    handleSelectKey(e);
  } else if (G.screen === 'end') {
    handleEndKey(e);
  } else if (G.screen === 'game' && game) {
    handleGameKey(e, true);
  }
});
document.addEventListener('keyup', e => {
  if (G.screen === 'game' && game) handleGameKey(e, false);
});

// Tap sur titre pour lancer
document.getElementById('screen-title').addEventListener('touchstart', e => {
  if (e.target.closest('.mode-btn')) return;
  launchSelect();
}, {passive:true});
document.getElementById('screen-title').addEventListener('click', e => {
  if (e.target.closest('.mode-btn')) return;
  launchSelect();
});

function launchSelect() { initSelect(); showScreen('select'); }

// ════════════════════════════════════════════
//   SÉLECTION ÉQUIPE
// ════════════════════════════════════════════
function initSelect() {
  G.selectStep = 0; G.team1 = null; G.team2 = null; G.hoverIdx = 0;
  updateSelectUI();
  renderGrid();
}

function updateSelectUI() {
  const p2label = G.mode === '1p' ? 'IA' : 'P2';
  document.getElementById('team2-select-name').textContent = p2label;
  const step = G.selectStep;
  document.getElementById('select-title-text').textContent =
    step === 0 ? (G.mode === '1p' ? 'TES ÉQUIPE (P1)' : 'ÉQUIPE JOUEUR 1') : 'ÉQUIPE ' + p2label;
  document.getElementById('select-hint').textContent =
    '↑↓←→ NAVIGUER  •  ENTRÉE / TAP CONFIRMER';
}

function renderGrid() {
  const grid = document.getElementById('team-grid');
  grid.innerHTML = '';
  TEAMS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'team-card';
    if (i === G.hoverIdx) card.classList.add('hovered');
    if (G.team1 && G.team1.id === t.id) card.classList.add('selected-p1');
    if (G.team2 && G.team2.id === t.id) card.classList.add('selected-p2');
    card.innerHTML = `<div class="team-badge">${t.badge}</div><div class="team-card-name">${t.name}</div>`;
    card.addEventListener('click', () => { G.hoverIdx = i; confirmTeam(); });
    card.addEventListener('touchstart', e => { e.preventDefault(); G.hoverIdx = i; confirmTeam(); }, {passive:false});
    grid.appendChild(card);
  });
  document.getElementById('team1-badge').textContent = G.team1 ? G.team1.badge : '?';
  document.getElementById('team2-badge').textContent = G.team2 ? G.team2.badge : '?';
}

function handleSelectKey(e) {
  const cols = 5;
  let i = G.hoverIdx;
  if (e.key === 'ArrowRight') i = Math.min(TEAMS.length-1, i+1);
  if (e.key === 'ArrowLeft')  i = Math.max(0, i-1);
  if (e.key === 'ArrowDown')  i = Math.min(TEAMS.length-1, i+cols);
  if (e.key === 'ArrowUp')    i = Math.max(0, i-cols);
  if (e.key === 'Enter') { confirmTeam(); return; }
  G.hoverIdx = i;
  renderGrid();
}

function confirmTeam() {
  const t = TEAMS[G.hoverIdx];
  if (G.selectStep === 0) {
    G.team1 = t; G.selectStep = 1; G.hoverIdx = 0;
    // Mode 1P : IA choisit une équipe différente au hasard
    if (G.mode === '1p') {
      const others = TEAMS.filter(x => x.id !== t.id);
      G.team2 = others[Math.floor(Math.random() * others.length)];
      updateSelectUI(); renderGrid();
      setTimeout(() => startGame(), 400);
      return;
    }
    updateSelectUI(); renderGrid();
  } else {
    if (t.id === G.team1.id) return;
    G.team2 = t;
    updateSelectUI(); renderGrid();
    setTimeout(() => startGame(), 300);
  }
}

// ════════════════════════════════════════════
//   JEU — STRUCTURES
// ════════════════════════════════════════════
let game = null;
let raf  = null;

function mkBall() {
  return { x: CW/2, y: CH/2, vx: 0, vy: 0 };
}

// Limites terrain (recalculées selon canvas)
function field() {
  const pad = Math.round(CW * 0.045);
  const top = Math.round(CH * 0.04);
  const bot = CH - top;
  return { x: pad, y: top, w: CW - pad*2, h: bot - top,
           goalH: Math.round(CH * 0.22), goalW: Math.round(CW * 0.018) };
}

function mkHuman(side, team, playerIdx) {
  const f = field();
  const x = side === 'left' ? f.x + f.w * 0.28 : f.x + f.w * 0.72;
  const y = f.y + f.h / 2;
  return {
    x, y, vx: 0, vy: 0,
    side, team,
    name: team.players[playerIdx] || 'P'+(playerIdx+1),
    isHuman: true,
    facing: side === 'left' ? 1 : -1,
    kickCD: 0, sprintCD: 0,
    anim: 0, sprinting: false,
    jx: 0, jy: 0, // joystick input virtuel
    shootPressed: false, passPressed: false, sprintPressed: false,
  };
}

function mkAI(side, team, role, idx) {
  const f = field();
  const positions = {
    left: {
      gk:  [f.x + f.w*0.04, f.y + f.h/2],
      def: [[f.x + f.w*0.15, f.y + f.h*0.3], [f.x + f.w*0.15, f.y + f.h*0.7],
            [f.x + f.w*0.22, f.y + f.h/2]],
      mid: [[f.x + f.w*0.38, f.y + f.h*0.25],[f.x + f.w*0.38, f.y + f.h*0.75],
            [f.x + f.w*0.45, f.y + f.h/2]],
      fwd: [[f.x + f.w*0.6, f.y + f.h*0.35],[f.x + f.w*0.6, f.y + f.h*0.65]],
    },
    right: {
      gk:  [f.x + f.w*0.96, f.y + f.h/2],
      def: [[f.x + f.w*0.85, f.y + f.h*0.3],[f.x + f.w*0.85, f.y + f.h*0.7],
            [f.x + f.w*0.78, f.y + f.h/2]],
      mid: [[f.x + f.w*0.62, f.y + f.h*0.25],[f.x + f.w*0.62, f.y + f.h*0.75],
            [f.x + f.w*0.55, f.y + f.h/2]],
      fwd: [[f.x + f.w*0.4, f.y + f.h*0.35],[f.x + f.w*0.4, f.y + f.h*0.65]],
    }
  };
  const arr = positions[side][role];
  const pos = Array.isArray(arr[0]) ? arr[idx % arr.length] : arr;
  return {
    x: pos[0], y: pos[1],
    baseX: pos[0], baseY: pos[1],
    vx: 0, vy: 0,
    side, team, role,
    name: team.players[idx] || role.toUpperCase(),
    isHuman: false,
    facing: side === 'left' ? 1 : -1,
    kickCD: 0, anim: 0,
  };
}

function buildAITeam(side, team) {
  return [
    mkAI(side, team, 'gk',  10),
    mkAI(side, team, 'def', 3), mkAI(side, team, 'def', 4), mkAI(side, team, 'def', 5),
    mkAI(side, team, 'mid', 6), mkAI(side, team, 'mid', 7), mkAI(side, team, 'mid', 8),
    mkAI(side, team, 'fwd', 1), mkAI(side, team, 'fwd', 2),
  ];
}

// ════════════════════════════════════════════
//   DÉMARRER LE JEU
// ════════════════════════════════════════════
function startGame() {
  if (raf) cancelAnimationFrame(raf);
  showScreen('game');
  resizeCanvas();

  document.getElementById('team1-name-hud').textContent = G.team1.name;
  document.getElementById('team2-name-hud').textContent = G.team2.name;
  document.getElementById('mode-badge').textContent = G.mode === '1p' ? '1P' : '2P';

  // Afficher/masquer UI P2
  const show2p = G.mode === '2p';
  document.getElementById('joystick2-zone').classList.toggle('hidden-p2', !show2p);
  document.getElementById('btns-p2').classList.toggle('hidden-p2', !show2p);

  game = {
    score: [0, 0],
    timer: MATCH_FRAMES,
    ball: mkBall(),
    // P1 toujours humain — côté gauche
    p1: mkHuman('left', G.team1, 0),
    // P2 humain ou IA selon mode
    p2: G.mode === '2p' ? mkHuman('right', G.team2, 0) : null,
    // IA équipe 1 (coéquipiers P1)
    aiLeft:  buildAITeam('left',  G.team1),
    // IA équipe 2 (adversaires)
    aiRight: buildAITeam('right', G.team2),
    particles: [],
    goalFlash: 0,
    goalMsg: '',
    keys: {},
  };

  setupTouchControls();
  setupButtonControls();
  raf = requestAnimationFrame(loop);
}

// ════════════════════════════════════════════
//   INPUT CLAVIER
// ════════════════════════════════════════════
function handleGameKey(e, down) {
  if (!game) return;
  game.keys[e.key] = down;
  if (down) {
    // Actions instantanées P1
    if (e.key === ' ')     { if (down) game.p1.shootPressed = true; }
    if (e.key === 'e' || e.key === 'E') { if (down) game.p1.passPressed = true; }
    // Actions P2 (2J)
    if (game.p2) {
      if (e.key === 'Enter') { if (down) game.p2.shootPressed = true; }
      if (e.key === 'Shift') { if (down) game.p2.passPressed = true; }
    }
  }
  e.preventDefault();
}

function readKeyboard() {
  if (!game) return;
  const k = game.keys;
  const p1 = game.p1;
  // P1 : ZQSD
  p1.jx = (k['d'] || k['D'] ? 1 : 0) - (k['q'] || k['Q'] ? 1 : 0);
  p1.jy = (k['s'] || k['S'] ? 1 : 0) - (k['z'] || k['Z'] ? 1 : 0);
  p1.sprintPressed = !!(k['a'] || k['A']);
  // Normaliser diagonale
  const pl = Math.hypot(p1.jx, p1.jy);
  if (pl > 1) { p1.jx /= pl; p1.jy /= pl; }

  if (game.p2) {
    const p2 = game.p2;
    p2.jx = (k['ArrowRight'] ? 1 : 0) - (k['ArrowLeft'] ? 1 : 0);
    p2.jy = (k['ArrowDown']  ? 1 : 0) - (k['ArrowUp']   ? 1 : 0);
    p2.sprintPressed = !!(k['Control']);
    const pl2 = Math.hypot(p2.jx, p2.jy);
    if (pl2 > 1) { p2.jx /= pl2; p2.jy /= pl2; }
  }
}

// ════════════════════════════════════════════
//   JOYSTICKS TACTILES
// ════════════════════════════════════════════
function setupJoystick(zoneId, knobId, target) {
  const zone = document.getElementById(zoneId);
  const knob = document.getElementById(knobId);
  if (!zone || !knob) return;
  let tid = null, ox = 0, oy = 0;
  const R = 38; // rayon max déplacement knob

  function center() {
    return { cx: zone.getBoundingClientRect().left + zone.offsetWidth/2,
             cy: zone.getBoundingClientRect().top  + zone.offsetHeight/2 };
  }

  zone.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    tid = t.identifier;
    const {cx,cy} = center();
    ox = cx; oy = cy;
  }, {passive:false});

  zone.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== tid) continue;
      const dx = t.clientX - ox, dy = t.clientY - oy;
      const len = Math.hypot(dx, dy) || 1;
      const clamped = Math.min(len, R);
      target.jx = (dx/len) * (clamped/R);
      target.jy = (dy/len) * (clamped/R);
      knob.style.transform = `translate(${dx/len*clamped}px, ${dy/len*clamped}px)`;
    }
  }, {passive:false});

  function release() {
    target.jx = 0; target.jy = 0; tid = null;
    knob.style.transform = 'translate(0,0)';
  }
  zone.addEventListener('touchend',    release, {passive:true});
  zone.addEventListener('touchcancel', release, {passive:true});
}

function setupTouchControls() {
  if (!game) return;
  setupJoystick('joystick1-zone', 'joystick1-knob', game.p1);
  if (game.p2) setupJoystick('joystick2-zone', 'joystick2-knob', game.p2);
}

function setupButtonControls() {
  if (!game) return;
  function btn(id, onDown, onUp) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = e => { e.preventDefault(); onDown && onDown(); };
    const end   = e => { onUp && onUp(); };
    el.addEventListener('touchstart', start, {passive:false});
    el.addEventListener('touchend',   end,   {passive:true});
    el.addEventListener('mousedown',  start);
    el.addEventListener('mouseup',    end);
  }
  btn('btn-p1-shoot',  () => { game.p1.shootPressed = true; });
  btn('btn-p1-pass',   () => { game.p1.passPressed  = true; });
  btn('btn-p1-sprint', () => { game.p1.sprintPressed = true; }, () => { game.p1.sprintPressed = false; });
  if (game.p2) {
    btn('btn-p2-shoot',  () => { game.p2.shootPressed = true; });
    btn('btn-p2-pass',   () => { game.p2.passPressed  = true; });
    btn('btn-p2-sprint', () => { game.p2.sprintPressed = true; }, () => { game.p2.sprintPressed = false; });
  }
}

// ════════════════════════════════════════════
//   BOUCLE PRINCIPALE
// ════════════════════════════════════════════
function loop() {
  if (!game) return;
  update();
  draw();
  raf = requestAnimationFrame(loop);
}

// ════════════════════════════════════════════
//   UPDATE
// ════════════════════════════════════════════
function update() {
  readKeyboard();

  const f = field();

  // Timer
  game.timer = Math.max(0, game.timer - 1);
  const elapsed = MATCH_FRAMES - game.timer;
  const matchSec = Math.floor(elapsed / MATCH_FRAMES * 90 * 60);
  const mm = Math.floor(matchSec / 60), ss = matchSec % 60;
  document.getElementById('timer-display').textContent =
    String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');

  if (game.goalFlash > 0) {
    game.goalFlash--;
    updateParticles();
    return;
  }
  if (game.timer === 0) { endMatch(); return; }

  // Cooldowns
  [game.p1, game.p2, ...game.aiLeft, ...game.aiRight].forEach(p => {
    if (p && p.kickCD > 0) p.kickCD--;
  });

  // Joueurs humains
  moveHuman(game.p1, f);
  if (game.p2) moveHuman(game.p2, f);

  // IA
  // En mode 1P, l'équipe gauche est composée entièrement d'IA coéquipières
  // En mode 2P, les deux équipes AI sont adversaires
  game.aiLeft.forEach(ai  => moveAI(ai, f, game.ball, 'left'));
  game.aiRight.forEach(ai => moveAI(ai, f, game.ball, 'right'));

  // Balle
  updateBall(f);

  // Collisions balle/joueurs
  const all = [game.p1, game.p2, ...game.aiLeft, ...game.aiRight].filter(Boolean);
  all.forEach(p => ballPlayerCollision(p));

  // Limites des joueurs
  all.forEach(p => {
    p.x = clamp(p.x, f.x + 8, f.x + f.w - 8);
    p.y = clamp(p.y, f.y + 8, f.y + f.h - 8);
  });

  // Buts
  checkGoals(f);
  updateParticles();

  // Anims
  all.forEach(p => {
    if (Math.abs(p.vx) > 0.2 || Math.abs(p.vy) > 0.2) p.anim = (p.anim + 0.35) % (Math.PI*2);
  });
}

// ── Déplacer un joueur humain ────────────────────────────────────
function moveHuman(p, f) {
  const sp = (p.sprintPressed ? PLAYER_SPEED * SPRINT_MULT : PLAYER_SPEED) * (CW / 640);
  p.vx = p.jx * sp;
  p.vy = p.jy * sp;
  if (p.vx !== 0) p.facing = p.vx > 0 ? 1 : -1;
  p.x += p.vx;
  p.y += p.vy;

  const b = game.ball;
  const d = dist(p, b);
  const reach = CW * 0.038; // distance de contact balle

  // TIR
  if (p.shootPressed) {
    p.shootPressed = false;
    if (p.kickCD === 0 && d < reach * 1.6) {
      shoot(p, b, f);
    }
  }
  // PASSE
  if (p.passPressed) {
    p.passPressed = false;
    if (p.kickCD === 0 && d < reach * 1.6) {
      pass(p, b, f);
    }
  }
}

function shoot(p, b, f) {
  const atkGoalX = p.side === 'left' ? f.x + f.w + f.goalW : f.x - f.goalW;
  const atkGoalY = f.y + f.h / 2;
  const dx = atkGoalX - p.x, dy = atkGoalY - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const power = SHOOT_POWER * (CW / 640);
  const spread = (Math.random() - 0.5) * power * 0.18;
  b.vx = (dx/len) * power;
  b.vy = (dy/len) * power + spread;
  // Positionner balle devant le joueur
  b.x = p.x + (dx/len) * (CW*0.025);
  b.y = p.y + (dy/len) * (CH*0.025);
  p.kickCD = 25;
  particles(b.x, b.y, '#f9e000', 8);
  beep(440, 0.09);
}

function pass(p, b, f) {
  // Cherche le coéquipier humain ou IA le plus proche devant
  const teammates = p.side === 'left'
    ? (game.p2 && game.p2.side === 'left' ? [game.p2, ...game.aiLeft] : [...game.aiLeft])
    : (game.p2 && game.p2.side === 'right' ? [game.p2, ...game.aiRight] : [...game.aiRight]);

  // Le mieux placé = le plus avancé vers le but adverse
  let best = null, bestScore = -Infinity;
  teammates.forEach(tm => {
    if (tm === p) return;
    const fwd = p.side === 'left' ? tm.x - p.x : p.x - tm.x;
    if (fwd > 10) { const score = fwd - dist(p, tm)*0.3; if (score > bestScore) { bestScore = score; best = tm; } }
  });

  if (!best) best = teammates[0]; // fallback
  if (!best) return;

  const dx = best.x - b.x, dy = best.y - b.y;
  const len = Math.hypot(dx, dy) || 1;
  const power = PASS_POWER * (CW / 640);
  b.vx = (dx/len) * power;
  b.vy = (dy/len) * power;
  p.kickCD = 20;
  beep(330, 0.06);
}

// ── IA ───────────────────────────────────────────────────────────
function moveAI(ai, f, b, mySide) {
  const atkGoalX = mySide === 'left' ? f.x + f.w : f.x;
  const defGoalX = mySide === 'left' ? f.x        : f.x + f.w;
  const ballDist = dist(ai, b);
  const ballOnMySide = mySide === 'left' ? b.x < f.x + f.w/2 : b.x > f.x + f.w/2;

  let tx = ai.baseX, ty = ai.baseY;

  if (ai.role === 'gk') {
    // Gardien : reste sur sa ligne, suit la balle en Y
    tx = defGoalX + (mySide === 'left' ? f.w*0.04 : -f.w*0.04);
    ty = clamp(b.y, f.y + f.h*0.25, f.y + f.h*0.75);
  } else if (ai.role === 'fwd') {
    // Attaquant : presse toujours vers la balle
    tx = b.x + (mySide === 'left' ? 10 : -10);
    ty = b.y;
  } else if (ai.role === 'mid') {
    if (ballDist < f.w * 0.3) { tx = b.x; ty = b.y; }
    else { tx = (ai.baseX + b.x) / 2; ty = (ai.baseY + b.y) / 2; }
  } else if (ai.role === 'def') {
    if (ballOnMySide) { tx = b.x + (mySide === 'left' ? 15 : -15); ty = b.y; }
    else { tx = ai.baseX; ty = (ai.baseY + b.y) / 2; }
  }

  const dx = tx - ai.x, dy = ty - ai.y;
  const len = Math.hypot(dx, dy) || 1;
  const sp = AI_SPEED_BASE * (CW / 640) * (ai.role === 'fwd' ? 1.1 : ai.role === 'gk' ? 1.15 : 0.95);

  if (len > 3) { ai.vx = dx/len*sp; ai.vy = dy/len*sp; }
  else { ai.vx = 0; ai.vy = 0; }
  ai.x += ai.vx; ai.y += ai.vy;
  if (ai.vx !== 0) ai.facing = ai.vx > 0 ? 1 : -1;

  // Tir IA
  if (ballDist < CW * 0.038 && ai.kickCD === 0) {
    const goDx = atkGoalX - ai.x, goDy = f.y + f.h/2 - ai.y;
    const gl = Math.hypot(goDx, goDy) || 1;
    const power = SHOOT_POWER * (CW/640) * (0.75 + Math.random()*0.35);
    b.vx = goDx/gl * power;
    b.vy = goDy/gl * power + (Math.random()-0.5) * power * 0.2;
    ai.kickCD = 35;
    beep(220, 0.04);
  }
}

// ── Physique balle ────────────────────────────────────────────────
function updateBall(f) {
  const b = game.ball;
  b.x += b.vx; b.y += b.vy;
  b.vx *= BALL_FRICTION; b.vy *= BALL_FRICTION;

  // Rebond haut/bas
  if (b.y < f.y + 4) { b.y = f.y + 4; b.vy = Math.abs(b.vy) * 0.6; beep(200, 0.03); }
  if (b.y > f.y + f.h - 4) { b.y = f.y + f.h - 4; b.vy = -Math.abs(b.vy) * 0.6; beep(200, 0.03); }

  // Rebond latéral hors zone de but
  const goalTop = f.y + f.h/2 - f.goalH/2;
  const goalBot = f.y + f.h/2 + f.goalH/2;
  const inGoal  = b.y > goalTop && b.y < goalBot;
  if (!inGoal) {
    if (b.x < f.x + 3)        { b.x = f.x + 3;        b.vx = Math.abs(b.vx) * 0.6; beep(200, 0.03); }
    if (b.x > f.x + f.w - 3)  { b.x = f.x + f.w - 3;  b.vx = -Math.abs(b.vx) * 0.6; beep(200, 0.03); }
  }
}

function ballPlayerCollision(p) {
  const b = game.ball;
  const r = CW * 0.022;
  const d = dist(p, b);
  if (d < r) {
    const dx = b.x - p.x, dy = b.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    // Rebond propre
    b.vx = dx/len * Math.max(Math.hypot(b.vx,b.vy)+0.5, 2.5*(CW/640));
    b.vy = dy/len * Math.max(Math.hypot(b.vx,b.vy)+0.5, 2.5*(CW/640));
    // Repositionner
    b.x = p.x + dx/len * r;
    b.y = p.y + dy/len * r;
  }
}

// ── Buts ─────────────────────────────────────────────────────────
function checkGoals(f) {
  const b = game.ball;
  const gt = f.y + f.h/2 - f.goalH/2;
  const gb = f.y + f.h/2 + f.goalH/2;

  if (b.x < f.x - f.goalW && b.y > gt && b.y < gb) {
    game.score[1]++;
    triggerGoal(G.team2);
  } else if (b.x > f.x + f.w + f.goalW && b.y > gt && b.y < gb) {
    game.score[0]++;
    triggerGoal(G.team1);
  }
}

function triggerGoal(team) {
  document.getElementById('score').textContent = game.score[0] + ' - ' + game.score[1];
  game.goalFlash = 100;
  game.goalMsg = '⚽ BUT !  ' + team.name;
  particles(CW/2, CH/2, '#f9e000', 35);
  particles(CW/2, CH/2, '#fff', 20);
  goalSound();
  setTimeout(() => resetKickoff(), 2000);
}

function resetKickoff() {
  if (!game) return;
  resizeCanvas();
  game.ball    = mkBall();
  game.p1      = mkHuman('left', G.team1, 0);
  game.p2      = G.mode === '2p' ? mkHuman('right', G.team2, 0) : null;
  game.aiLeft  = buildAITeam('left',  G.team1);
  game.aiRight = buildAITeam('right', G.team2);
  game.goalMsg = '';
  setupTouchControls();
  setupButtonControls();
}

// ── Particules ────────────────────────────────────────────────────
function particles(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = (1 + Math.random() * 4) * (CW / 640);
    game.particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 2, color, life: 40+Math.random()*30, size: 2+Math.random()*3 });
  }
}
function updateParticles() {
  game.particles = game.particles.filter(p => p.life > 0);
  game.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--; });
}

// ════════════════════════════════════════════
//   RENDU
// ════════════════════════════════════════════
function draw() {
  ctx.clearRect(0, 0, CW, CH);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CW, CH);

  drawField();

  const all = [game.p1, game.p2, ...game.aiLeft, ...game.aiRight].filter(Boolean);

  if (game.goalFlash > 0) {
    all.forEach(p => drawPlayer(p));
    drawBall();
    drawGoalFlash();
  } else {
    game.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(~~(p.x - p.size/2), ~~(p.y - p.size/2), ~~p.size, ~~p.size);
    });
    all.forEach(p => drawPlayer(p));
    drawBall();
  }
}

function drawField() {
  const f = field();
  const stripeW = f.w / 8;

  // Herbe rayée
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1c7a1c' : '#177017';
    ctx.fillRect(f.x + i * stripeW, f.y, stripeW, f.h);
  }

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(1.5, CW/400);

  // Contour
  ctx.strokeRect(f.x, f.y, f.w, f.h);

  // Ligne médiane
  ctx.beginPath();
  ctx.moveTo(f.x + f.w/2, f.y);
  ctx.lineTo(f.x + f.w/2, f.y + f.h);
  ctx.stroke();

  // Cercle central
  ctx.beginPath();
  ctx.arc(f.x + f.w/2, f.y + f.h/2, f.h * 0.18, 0, Math.PI*2);
  ctx.stroke();

  // Point central
  ctx.fillStyle = '#fff';
  ctx.fillRect(f.x + f.w/2 - 2, f.y + f.h/2 - 2, 4, 4);

  // Surfaces de réparation
  const bw = f.w * 0.14, bh = f.h * 0.45;
  ctx.strokeRect(f.x,             f.y + f.h/2 - bh/2, bw, bh);
  ctx.strokeRect(f.x + f.w - bw, f.y + f.h/2 - bh/2, bw, bh);
  const sw = bw * 0.5, sh = bh * 0.55;
  ctx.strokeRect(f.x,              f.y + f.h/2 - sh/2, sw, sh);
  ctx.strokeRect(f.x + f.w - sw,  f.y + f.h/2 - sh/2, sw, sh);

  // Buts
  const gt = f.y + f.h/2 - f.goalH/2;
  ctx.lineWidth = Math.max(2, CW/300);
  ctx.strokeStyle = '#ccc';
  ctx.strokeRect(f.x - f.goalW, gt, f.goalW, f.goalH);
  ctx.strokeRect(f.x + f.w,     gt, f.goalW, f.goalH);

  // Filet
  ctx.setLineDash([2,3]);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const gy = gt + i * f.goalH / 4;
    ctx.beginPath();
    ctx.moveTo(f.x - f.goalW, gy); ctx.lineTo(f.x, gy);
    ctx.moveTo(f.x + f.w, gy);     ctx.lineTo(f.x + f.w + f.goalW, gy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Noms équipes
  const fs = Math.max(7, CW/90);
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#4aaeff';
  ctx.textAlign = 'left';
  ctx.fillText(G.team1 ? G.team1.name : '', f.x + 4, f.y + fs + 4);
  ctx.fillStyle = '#e03030';
  ctx.textAlign = 'right';
  ctx.fillText(G.team2 ? G.team2.name : '', f.x + f.w - 4, f.y + fs + 4);
  ctx.textAlign = 'left';
}

function drawPlayer(p) {
  const x = ~~p.x, y = ~~p.y;
  const ps = Math.max(7, CW * 0.018);
  const leg = Math.sin(p.anim) * ps * 0.5;

  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x - ps + 2, y + ps - 1, ps*2 - 2, 3);

  // Corps maillot
  ctx.fillStyle = p.team.c1;
  ctx.fillRect(x - ps*0.6, y - ps*0.5, ps*1.2, ps);
  ctx.strokeStyle = p.team.c2;
  ctx.lineWidth = Math.max(1, ps*0.12);
  ctx.strokeRect(x - ps*0.6, y - ps*0.5, ps*1.2, ps);

  // Tête
  ctx.fillStyle = '#f5c87a';
  ctx.fillRect(x - ps*0.35, y - ps*0.5 - ps*0.65, ps*0.7, ps*0.65);
  ctx.strokeStyle = '#b8883a';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - ps*0.35, y - ps*0.5 - ps*0.65, ps*0.7, ps*0.65);

  // Jambes
  ctx.fillStyle = '#ddd';
  ctx.fillRect(x - ps*0.45, y + ps*0.5, ps*0.35, ps*0.5 + leg);
  ctx.fillRect(x + ps*0.1,  y + ps*0.5, ps*0.35, ps*0.5 - leg);

  // Indicateur joueur humain
  if (p.isHuman) {
    ctx.fillStyle = p.side === 'left' ? '#4aaeff' : '#e03030';
    ctx.fillRect(x - ps*0.3, y - ps*0.5 - ps*0.65 - ps*0.4, ps*0.6, ps*0.3);
  }

  // Nom
  const nfs = Math.max(5, CW/130);
  ctx.font = `${nfs}px "Press Start 2P", monospace`;
  ctx.fillStyle = p.isHuman ? '#fff' : 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  ctx.fillText(p.name.substring(0, 8), x, y - ps - ps*0.7);
  ctx.textAlign = 'left';
}

function drawBall() {
  const b = game.ball;
  const r = Math.max(4, CW * 0.012);
  const x = ~~b.x, y = ~~b.y;

  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - r + 2, y + r, r*2 - 2, 3);

  // Balle
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(x - r, y - r, r*2, r*2);

  // Motif hexagone pixel
  ctx.fillStyle = '#111';
  ctx.fillRect(x - ~~(r*0.3), y - ~~(r*0.3), ~~(r*0.6)+1, ~~(r*0.6)+1);
  ctx.fillRect(x - r + 1, y - ~~(r*0.2), ~~(r*0.3), ~~(r*0.4));
  ctx.fillRect(x + ~~(r*0.7), y - ~~(r*0.2), ~~(r*0.3), ~~(r*0.4));
  ctx.fillRect(x - ~~(r*0.2), y - r + 1, ~~(r*0.4), ~~(r*0.3));
  ctx.fillRect(x - ~~(r*0.2), y + ~~(r*0.7), ~~(r*0.4), ~~(r*0.3));
}

function drawGoalFlash() {
  const alpha = (game.goalFlash / 100) * 0.3;
  ctx.fillStyle = `rgba(249,224,0,${alpha})`;
  ctx.fillRect(0, 0, CW, CH);

  const fs = Math.max(12, CW/36);
  ctx.font = `${fs}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#f9e000';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 10;
  ctx.fillText(game.goalMsg, CW/2, CH/2 - fs);
  const fs2 = Math.max(10, CW/48);
  ctx.font = `${fs2}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#fff';
  ctx.fillText(game.score[0] + '  -  ' + game.score[1], CW/2, CH/2 + fs2);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';

  // Particules
  game.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(~~(p.x-p.size/2), ~~(p.y-p.size/2), ~~p.size, ~~p.size);
  });
}

// ════════════════════════════════════════════
//   FIN DE MATCH
// ════════════════════════════════════════════
function endMatch() {
  if (!game) return;
  cancelAnimationFrame(raf);
  raf = null;

  const s = game.score;
  document.getElementById('end-score').textContent = s[0] + '  -  ' + s[1];
  let w = '';
  if (s[0] > s[1])      w = G.team1.badge + ' ' + G.team1.name + ' GAGNE !';
  else if (s[1] > s[0]) w = G.team2.badge + ' ' + G.team2.name + ' GAGNE !';
  else                  w = '🤝 MATCH NUL !';
  document.getElementById('end-winner').textContent = w;

  G.endMenuIdx = 0;
  updateEndMenu();
  showScreen('end');
  game = null;
  goalSound();
}

function updateEndMenu() {
  document.getElementById('btn-rematch').classList.toggle('active-btn', G.endMenuIdx === 0);
  document.getElementById('btn-menu').classList.toggle('active-btn', G.endMenuIdx === 1);
}

function handleEndKey(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    G.endMenuIdx = 1 - G.endMenuIdx; updateEndMenu(); beep(300, 0.05);
  }
  if (e.key === 'Enter') { G.endMenuIdx === 0 ? startGame() : showScreen('title'); }
}

document.getElementById('btn-rematch').addEventListener('click', () => startGame());
document.getElementById('btn-rematch').addEventListener('touchstart', e => { e.preventDefault(); startGame(); }, {passive:false});
document.getElementById('btn-menu').addEventListener('click', () => showScreen('title'));
document.getElementById('btn-menu').addEventListener('touchstart', e => { e.preventDefault(); showScreen('title'); }, {passive:false});

// ════════════════════════════════════════════
//   AUDIO 8-BIT
// ════════════════════════════════════════════
let ac = null;
function getAC() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){} }
  return ac;
}
function beep(freq, vol) {
  try {
    const a = getAC(); if(!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.frequency.value = freq; o.type = 'square';
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.08);
    o.start(); o.stop(a.currentTime + 0.08);
  } catch(e) {}
}
function goalSound() {
  [523,659,784,1047].forEach((f,i) => setTimeout(() => beep(f, 0.15), i*110));
}

// ════════════════════════════════════════════
//   RESIZE
// ════════════════════════════════════════════
window.addEventListener('resize', () => {
  if (G.screen === 'game') { resizeCanvas(); if (game) resetKickoff(); }
});

// ── INIT ─────────────────────────────────────────────────────────
showScreen('title');
