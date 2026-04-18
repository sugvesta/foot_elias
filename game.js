// ═══════════════════════════════════════════════════════════════
//   PIXEL FOOT '96  —  GAME ENGINE v3
//   - IA positionnelle (un seul chasseur à la fois)
//   - Auto-switch joueur humain (FIFA style)
//   - Desktop : ZQSD/Flèches + boutons cliquables
//   - Mobile : joystick + boutons tactiles
// ═══════════════════════════════════════════════════════════════

// ── ÉQUIPES ──────────────────────────────────────────────────────
const TEAMS = [
  { id:'brazil',   name:'BRÉSIL',    badge:'🇧🇷', c1:'#f9e000', c2:'#1a7a1a',
    players:['RONALDO','ROMÁRIO','BEBETO','ALDAIR','CAFU','R.CARLOS','DUNGA','MAZINHO','MAURO S.','BRANCO','TAFFAREL'] },
  { id:'france',   name:'FRANCE',    badge:'🇫🇷', c1:'#3055cc', c2:'#f0f0f0',
    players:['ZIDANE','HENRY','DJORKAEFF','DESAILLY','BLANC','THURAM','LIZARAZU','DESCHAMPS','PETIT','VIEIRA','BARTHEZ'] },
  { id:'germany',  name:'ALLEMAGNE', badge:'🇩🇪', c1:'#eee',    c2:'#111',
    players:['KLINSMANN','BIERHOFF','VÖLLER','MATTHÄUS','SAMMER','KOHLER','BREHME','EFFENBERG','HÄSSLER','ZIEGE','KAHN'] },
  { id:'italy',    name:'ITALIE',    badge:'🇮🇹', c1:'#1a44cc', c2:'#f0f0f0',
    players:['BAGGIO','DEL PIERO','MALDINI','BARESI','COSTACURTA','ALBERTINI','ZOLA','SIGNORI','CASIRAGHI','DONADONI','PERUZZI'] },
  { id:'argentina',name:'ARGENTINE', badge:'🇦🇷', c1:'#74ACDF', c2:'#f0f0f0',
    players:['BATISTUTA','ORTEGA','CANIGGIA','SIMEONE','VERON','AYALA','ALMEYDA','GALLARDO','ZANETTI','SENSINI','GOYCOCHEA'] },
  { id:'spain',    name:'ESPAGNE',   badge:'🇪🇸', c1:'#AA151B', c2:'#F1BF00',
    players:['RAÚL','HIERRO','MÍCHEL','GUARDIOLA','SERGI','NADAL','DE LA PEÑA','CAMINERO','SALINAS','ABELARDO','ZUBIZARRETA'] },
  { id:'england',  name:'ANGLETERRE',badge:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', c1:'#f0f0f0', c2:'#CF142B',
    players:['SHEARER','SHERINGHAM','GASCOIGNE','SCHOLES','BECKHAM','INCE','MCMANAMAN','ANDERTON','ADAMS','PEARCE','SEAMAN'] },
  { id:'netherlands',name:'PAYS-BAS',badge:'🇳🇱', c1:'#FF4F00', c2:'#f0f0f0',
    players:['BERGKAMP','KLUIVERT','DAVIDS','SEEDORF','OVERMARS','R.DE BOER','F.DE BOER','STAM','COCU','BLIND','VAN DER SAR'] },
  { id:'portugal', name:'PORTUGAL',  badge:'🇵🇹', c1:'#006600', c2:'#FF0000',
    players:['FIGO','J.PINTO','SA PINTO','COUTO','SECRETÁRIO','OCEANO','DRULOVIC','DIMAS','VIDIGAL','BETO','BAIA'] },
  { id:'milan',    name:'AC MILAN',  badge:'🔴⚫', c1:'#CC0000', c2:'#111',
    players:['WEAH','SAVICEVIC','BOBAN','DESAILLY','MALDINI','BARESI','COSTACURTA','DONADONI','ALBERTINI','SIMONE','S.ROSSI'] },
];

// ── CONSTANTES ───────────────────────────────────────────────────
const PLAYER_SPEED  = 2.2;   // vitesse joueur humain (px par frame à 640px de large)
const SPRINT_MULT   = 1.5;   // multiplicateur sprint
const BALL_FRICTION = 0.935; // ralentissement balle
const SHOOT_POWER   = 9;
const PASS_POWER    = 5.5;
const AI_SPEED_BASE = 1.3;   // vitesse IA base
const MATCH_FRAMES  = 60 * 180; // 3 min réelles

// ── ÉTAT GLOBAL ──────────────────────────────────────────────────
const G = {
  mode: '1p',
  screen: 'title',
  selectStep: 0,
  hoverIdx: 0,
  team1: null,
  team2: null,
  endMenuIdx: 0,
};

// ── CANVAS ───────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
let CW = 640, CH = 400;

function resizeCanvas() {
  const area = document.getElementById('game-area');
  if (!area) return;
  CW = area.clientWidth  || 640;
  CH = area.clientHeight || 400;
  canvas.width  = CW;
  canvas.height = CH;
}

// ── UTILS ─────────────────────────────────────────────────────────
const dist  = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ── SCREENS ───────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  G.screen = name;
  if (name === 'game') resizeCanvas();
}

// ════════════════════════════════════════════
//   ÉCRAN TITRE
// ════════════════════════════════════════════
document.getElementById('mode-1p').addEventListener('click',      () => setMode('1p'));
document.getElementById('mode-2p').addEventListener('click',      () => setMode('2p'));
document.getElementById('mode-1p').addEventListener('touchstart', e => { e.preventDefault(); setMode('1p'); }, {passive:false});
document.getElementById('mode-2p').addEventListener('touchstart', e => { e.preventDefault(); setMode('2p'); }, {passive:false});

function setMode(m) {
  G.mode = m;
  document.getElementById('mode-1p').classList.toggle('active-mode', m === '1p');
  document.getElementById('mode-2p').classList.toggle('active-mode', m === '2p');
}
setMode('1p'); // état initial

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
  updateSelectUI(); renderGrid();
}
function updateSelectUI() {
  const lbl = G.mode === '1p' ? 'IA' : 'P2';
  document.getElementById('team2-select-name').textContent = lbl;
  document.getElementById('select-title-text').textContent =
    G.selectStep === 0 ? (G.mode === '1p' ? 'TON ÉQUIPE' : 'ÉQUIPE J1') : ('ÉQUIPE ' + lbl);
  document.getElementById('select-hint').textContent = '↑↓←→ · ENTRÉE · TAP';
}
function renderGrid() {
  const grid = document.getElementById('team-grid');
  grid.innerHTML = '';
  TEAMS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'team-card';
    if (i === G.hoverIdx)              card.classList.add('hovered');
    if (G.team1 && G.team1.id === t.id) card.classList.add('selected-p1');
    if (G.team2 && G.team2.id === t.id) card.classList.add('selected-p2');
    card.innerHTML = `<div class="team-badge">${t.badge}</div><div class="team-card-name">${t.name}</div>`;
    card.addEventListener('click',      () => { G.hoverIdx = i; confirmTeam(); });
    card.addEventListener('touchstart', e => { e.preventDefault(); G.hoverIdx = i; confirmTeam(); }, {passive:false});
    grid.appendChild(card);
  });
  document.getElementById('team1-badge').textContent = G.team1 ? G.team1.badge : '?';
  document.getElementById('team2-badge').textContent = G.team2 ? G.team2.badge : '?';
}
function confirmTeam() {
  const t = TEAMS[G.hoverIdx];
  if (G.selectStep === 0) {
    G.team1 = t; G.selectStep = 1; G.hoverIdx = 0;
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
//   CLAVIER GLOBAL
// ════════════════════════════════════════════
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

function handleSelectKey(e) {
  let i = G.hoverIdx;
  if (e.key === 'ArrowRight') i = Math.min(TEAMS.length-1, i+1);
  if (e.key === 'ArrowLeft')  i = Math.max(0, i-1);
  if (e.key === 'ArrowDown')  i = Math.min(TEAMS.length-1, i+5);
  if (e.key === 'ArrowUp')    i = Math.max(0, i-5);
  if (e.key === 'Enter')      { confirmTeam(); return; }
  G.hoverIdx = i; renderGrid();
}

// ════════════════════════════════════════════
//   STRUCTURES JEU
// ════════════════════════════════════════════
let game = null, raf = null;

function mkBall() { return { x:CW/2, y:CH/2, vx:0, vy:0 }; }

function field() {
  const px = Math.round(CW*0.045), py = Math.round(CH*0.04);
  return {
    x:px, y:py,
    w:CW-px*2, h:CH-py*2,
    goalH: Math.round(CH*0.23),
    goalW: Math.round(CW*0.02),
  };
}

// Positions de base selon rôle / côté (proportionnelles)
const BASE_POS = {
  left: {
    gk:  [[0.04, 0.50]],
    def: [[0.16, 0.25],[0.16, 0.50],[0.16, 0.75]],
    mid: [[0.40, 0.20],[0.40, 0.50],[0.40, 0.80]],
    fwd: [[0.62, 0.35],[0.62, 0.65]],
  },
  right: {
    gk:  [[0.96, 0.50]],
    def: [[0.84, 0.25],[0.84, 0.50],[0.84, 0.75]],
    mid: [[0.60, 0.20],[0.60, 0.50],[0.60, 0.80]],
    fwd: [[0.38, 0.35],[0.38, 0.65]],
  }
};

function mkHuman(side, team, pIdx) {
  const f = field();
  return {
    x: side==='left' ? f.x+f.w*0.28 : f.x+f.w*0.72,
    y: f.y + f.h/2,
    vx:0, vy:0,
    side, team,
    name: team.players[pIdx] || 'J'+(pIdx+1),
    isHuman: true,
    facing: side==='left'?1:-1,
    kickCD:0, anim:0,
    jx:0, jy:0,
    shootPressed:false, passPressed:false, sprintPressed:false,
  };
}

function mkAI(side, team, role, slotIdx, playerIdx) {
  const f  = field();
  const pp = BASE_POS[side][role][slotIdx % BASE_POS[side][role].length];
  return {
    x: f.x + f.w*pp[0],
    y: f.y + f.h*pp[1],
    baseX: f.x + f.w*pp[0],
    baseY: f.y + f.h*pp[1],
    vx:0, vy:0,
    side, team, role,
    name: team.players[playerIdx] || role.toUpperCase(),
    isHuman: false,
    facing: side==='left'?1:-1,
    kickCD:0, anim:0,
  };
}

function buildAITeam(side, team) {
  return [
    mkAI(side, team, 'gk',  0, 10),
    mkAI(side, team, 'def', 0, 3),
    mkAI(side, team, 'def', 1, 4),
    mkAI(side, team, 'def', 2, 5),
    mkAI(side, team, 'mid', 0, 6),
    mkAI(side, team, 'mid', 1, 7),
    mkAI(side, team, 'mid', 2, 8),
    mkAI(side, team, 'fwd', 0, 1),
    mkAI(side, team, 'fwd', 1, 2),
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
  document.getElementById('mode-badge').textContent = G.mode==='1p'?'1P':'2P';

  const show2p = G.mode === '2p';
  document.getElementById('joystick2-zone').classList.toggle('hidden-p2', !show2p);
  document.getElementById('btns-p2').classList.toggle('hidden-p2', !show2p);
  const kbP2 = document.getElementById('kb-p2-hint');
  if (kbP2) kbP2.classList.toggle('hidden-p2', !show2p);

  game = {
    score: [0, 0],
    timer: MATCH_FRAMES,
    ball:  mkBall(),
    p1:    mkHuman('left',  G.team1, 0),
    p2:    G.mode==='2p' ? mkHuman('right', G.team2, 0) : null,
    aiLeft:  buildAITeam('left',  G.team1),
    aiRight: buildAITeam('right', G.team2),
    particles: [],
    goalFlash: 0,
    goalMsg: '',
    keys: {},
    // Index du joueur AI de gauche qui "chasse" la balle (en mode 1P, l'equipe gauche aide)
    // En mode 1P : aiLeft sont des coéquipiers, aiRight sont les adversaires
  };

  rebuildTouchControls();
  raf = requestAnimationFrame(loop);
}

// ════════════════════════════════════════════
//   CONTRÔLES CLAVIER
// ════════════════════════════════════════════
function handleGameKey(e, down) {
  if (!game) return;
  game.keys[e.key] = down;
  // Actions one-shot
  if (down) {
    if (e.key === ' ')                       game.p1.shootPressed = true;
    if (e.key === 'e' || e.key === 'E')      game.p1.passPressed  = true;
    if (game.p2) {
      if (e.key === 'Enter')                 game.p2.shootPressed = true;
      if (e.key === 'Shift')                 game.p2.passPressed  = true;
    }
  }
  // Empêcher scroll page
  const nav = [' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'];
  if (nav.includes(e.key)) e.preventDefault();
}

function readKeyboard() {
  if (!game) return;
  const k = game.keys;
  // P1 : ZQSD (clavier AZERTY)
  const p1 = game.p1;
  p1.jx = (k['d']||k['D'] ? 1:0) - (k['q']||k['Q'] ? 1:0);
  p1.jy = (k['s']||k['S'] ? 1:0) - (k['z']||k['Z'] ? 1:0);
  p1.sprintPressed = !!(k['a']||k['A']);
  const m1 = Math.hypot(p1.jx, p1.jy);
  if (m1 > 1) { p1.jx /= m1; p1.jy /= m1; }

  if (game.p2) {
    const p2 = game.p2;
    p2.jx = (k['ArrowRight'] ? 1:0) - (k['ArrowLeft'] ? 1:0);
    p2.jy = (k['ArrowDown']  ? 1:0) - (k['ArrowUp']   ? 1:0);
    p2.sprintPressed = !!(k['Control']);
    const m2 = Math.hypot(p2.jx, p2.jy);
    if (m2 > 1) { p2.jx /= m2; p2.jy /= m2; }
  }
}

// ════════════════════════════════════════════
//   CONTRÔLES TACTILES
// ════════════════════════════════════════════
// On reconstruit les listeners à chaque reset pour éviter les doublons
function rebuildTouchControls() {
  if (!game) return;
  setupJoystick('joystick1-zone', 'joystick1-knob', game.p1);
  if (game.p2) setupJoystick('joystick2-zone', 'joystick2-knob', game.p2);
  setupButtons();
}

function setupJoystick(zoneId, knobId, target) {
  const zone = document.getElementById(zoneId);
  const knob = document.getElementById(knobId);
  if (!zone || !knob) return;

  // Clone pour supprimer anciens listeners
  const z2 = zone.cloneNode(true);
  zone.parentNode.replaceChild(z2, zone);
  // Récupérer le nouveau knob
  const k2 = z2.querySelector('.joystick-knob');

  const R = 42;
  let tid = null, ox = 0, oy = 0;

  z2.addEventListener('touchstart', e => {
    e.preventDefault();
    if (tid !== null) return;
    const t = e.changedTouches[0];
    tid = t.identifier;
    const rc = z2.getBoundingClientRect();
    ox = rc.left + rc.width/2;
    oy = rc.top  + rc.height/2;
  }, {passive:false});

  z2.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier !== tid) continue;
      const dx = t.clientX - ox, dy = t.clientY - oy;
      const len = Math.hypot(dx, dy) || 1;
      const cl  = Math.min(len, R);
      target.jx = (dx/len) * (cl/R);
      target.jy = (dy/len) * (cl/R);
      if (k2) k2.style.transform = `translate(${dx/len*cl}px,${dy/len*cl}px)`;
    }
  }, {passive:false});

  const rel = () => {
    target.jx = 0; target.jy = 0; tid = null;
    if (k2) k2.style.transform = 'translate(0,0)';
  };
  z2.addEventListener('touchend',    rel, {passive:true});
  z2.addEventListener('touchcancel', rel, {passive:true});
}

function setupButtons() {
  const reg = (id, p, action) => {
    const el = document.getElementById(id);
    if (!el || !p) return;
    // clone pour reset listeners
    const c = el.cloneNode(true);
    el.parentNode.replaceChild(c, el);
    const fire = e => { e.preventDefault(); e.stopPropagation();
      if (action === 'shoot')  { p.shootPressed  = true; }
      if (action === 'pass')   { p.passPressed   = true; }
      if (action === 'sprint') { p.sprintPressed = true; }
    };
    const unfire = e => {
      if (action === 'sprint') p.sprintPressed = false;
    };
    c.addEventListener('touchstart', fire,   {passive:false});
    c.addEventListener('mousedown',  fire,   {passive:false});
    c.addEventListener('touchend',   unfire, {passive:true});
    c.addEventListener('mouseup',    unfire, {passive:true});
  };
  reg('btn-p1-shoot',  game.p1, 'shoot');
  reg('btn-p1-pass',   game.p1, 'pass');
  reg('btn-p1-sprint', game.p1, 'sprint');
  if (game.p2) {
    reg('btn-p2-shoot',  game.p2, 'shoot');
    reg('btn-p2-pass',   game.p2, 'pass');
    reg('btn-p2-sprint', game.p2, 'sprint');
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
  if (!game) return;
  readKeyboard();
  const f = field();

  // Timer
  game.timer = Math.max(0, game.timer - 1);
  const elapsed  = MATCH_FRAMES - game.timer;
  const matchSec = Math.floor((elapsed / MATCH_FRAMES) * 90 * 60);
  document.getElementById('timer-display').textContent =
    String(Math.floor(matchSec/60)).padStart(2,'0') + ':' + String(matchSec%60).padStart(2,'0');

  // Pause sur but
  if (game.goalFlash > 0) { game.goalFlash--; updateParticles(); return; }
  if (game.timer === 0)   { endMatch(); return; }

  // Cooldowns
  [game.p1, game.p2, ...game.aiLeft, ...game.aiRight].forEach(p => { if (p && p.kickCD > 0) p.kickCD--; });

  // Joueurs humains
  moveHuman(game.p1, f);
  if (game.p2) moveHuman(game.p2, f);

  // IA
  // Trouver le joueur IA le plus proche de la balle pour chaque équipe → il chasse
  const aiLeftChaser  = closestToBall(game.aiLeft,  game.ball);
  const aiRightChaser = closestToBall(game.aiRight, game.ball);
  game.aiLeft.forEach(ai  => moveAI(ai, f, game.ball, 'left',  ai === aiLeftChaser));
  game.aiRight.forEach(ai => moveAI(ai, f, game.ball, 'right', ai === aiRightChaser));

  // Physique balle
  updateBall(f);

  // Collisions
  const all = [game.p1, game.p2, ...game.aiLeft, ...game.aiRight].filter(Boolean);
  all.forEach(p => ballPlayerCollision(p));

  // Clamper joueurs
  all.forEach(p => {
    p.x = clamp(p.x, f.x+8, f.x+f.w-8);
    p.y = clamp(p.y, f.y+8, f.y+f.h-8);
  });

  checkGoals(f);
  updateParticles();

  // Anim marche
  all.forEach(p => {
    if (Math.abs(p.vx)+Math.abs(p.vy) > 0.3) p.anim = (p.anim+0.3)%(Math.PI*2);
  });
}

function closestToBall(team, ball) {
  let best = null, bd = Infinity;
  team.forEach(ai => { const d = dist(ai, ball); if (d < bd) { bd = d; best = ai; } });
  return best;
}

// ── Joueur humain ────────────────────────────────────────────────
function moveHuman(p, f) {
  const scale = CW / 640;
  const speed = (p.sprintPressed ? PLAYER_SPEED*SPRINT_MULT : PLAYER_SPEED) * scale;
  p.vx = p.jx * speed;
  p.vy = p.jy * speed;
  if (p.vx !== 0) p.facing = p.vx > 0 ? 1 : -1;
  p.x += p.vx;
  p.y += p.vy;

  const b = game.ball;
  const d = dist(p, b);
  const reach = CW * 0.04;

  if (p.shootPressed) {
    p.shootPressed = false;
    if (p.kickCD === 0 && d < reach*2) shoot(p, b, f);
  }
  if (p.passPressed) {
    p.passPressed = false;
    if (p.kickCD === 0 && d < reach*2) doPass(p, b, f);
  }
}

function shoot(p, b, f) {
  const gx = p.side==='left' ? f.x+f.w+f.goalW : f.x-f.goalW;
  const gy = f.y + f.h/2;
  const dx = gx - b.x, dy = gy - b.y;
  const len = Math.hypot(dx,dy) || 1;
  const pw  = SHOOT_POWER * (CW/640);
  b.vx = dx/len*pw;
  b.vy = dy/len*pw + (Math.random()-0.5)*pw*0.2;
  b.x  = p.x + dx/len*(CW*0.022);
  b.y  = p.y + dy/len*(CH*0.022);
  p.kickCD = 22;
  emitParticles(b.x, b.y, '#f9e000', 8);
  beep(440, 0.08);
}

function doPass(p, b, f) {
  const mates = p.side==='left'
    ? (game.p2 && game.p2.side==='left' ? [game.p2,...game.aiLeft] : [...game.aiLeft])
    : (game.p2 && game.p2.side==='right'? [game.p2,...game.aiRight]: [...game.aiRight]);

  let best=null, bestS=-Infinity;
  mates.forEach(m => {
    if (m===p) return;
    const fwd = p.side==='left' ? m.x-p.x : p.x-m.x;
    if (fwd > 5) { const s = fwd - dist(p,m)*0.25; if (s>bestS){bestS=s;best=m;} }
  });
  if (!best) best = mates.filter(m=>m!==p)[0];
  if (!best) return;

  const dx = best.x-b.x, dy = best.y-b.y;
  const len= Math.hypot(dx,dy)||1;
  const pw = PASS_POWER*(CW/640);
  b.vx = dx/len*pw;
  b.vy = dy/len*pw;
  p.kickCD = 18;
  beep(330, 0.06);
}

// ── IA positionnelle ─────────────────────────────────────────────
// Un seul joueur IA par équipe "chasse" la balle (chaser=true)
// Les autres restent près de leur position de base
function moveAI(ai, f, b, side, chaser) {
  const scale = CW/640;
  const atkGoalX = side==='left' ? f.x+f.w : f.x;
  const defGoalX = side==='left' ? f.x      : f.x+f.w;

  let tx, ty;

  if (ai.role === 'gk') {
    // Gardien : ne sort jamais de sa ligne (x fixe), évolue en Y
    tx = defGoalX + (side==='left' ? f.w*0.04 : -f.w*0.04);
    ty = clamp(b.y, f.y+f.h*0.25, f.y+f.h*0.75);
  } else if (chaser) {
    // Le chasseur va directement sur la balle
    tx = b.x;
    ty = b.y;
  } else {
    // Les autres : retour à la position de base, avec dérive vers Y de la balle
    const driftY = (b.y - ai.baseY) * 0.25; // légère attraction en Y
    tx = ai.baseX;
    ty = ai.baseY + driftY;
  }

  // Ajustement : le defender en mode défense reste entre la balle et son but
  if (ai.role === 'def' && !chaser) {
    const ballSide = side==='left' ? b.x < f.x+f.w/2 : b.x > f.x+f.w/2;
    if (ballSide) {
      // Balle de notre côté → se mettre entre balle et but
      const mx = (b.x + defGoalX) / 2;
      tx = clamp(mx, Math.min(ai.baseX, defGoalX), Math.max(ai.baseX, defGoalX));
    }
  }

  // Attaquant sans ballon : garder une position offensive utile
  if (ai.role === 'fwd' && !chaser) {
    const offX = atkGoalX + (side==='left' ? -f.w*0.25 : f.w*0.25);
    tx = clamp(ai.baseX, Math.min(offX, ai.baseX), Math.max(offX, ai.baseX));
    // Écarter legèrement pour ne pas s'entasser
  }

  // Déplacement
  const dx = tx-ai.x, dy = ty-ai.y;
  const len = Math.hypot(dx,dy)||1;
  const spMult = ai.role==='gk' ? 1.2 : chaser ? 1.0 : 0.8;
  const sp = AI_SPEED_BASE * scale * spMult;
  if (len > 2) { ai.vx = dx/len*sp; ai.vy = dy/len*sp; }
  else         { ai.vx = 0; ai.vy = 0; }
  ai.x += ai.vx; ai.y += ai.vy;
  if (ai.vx !== 0) ai.facing = ai.vx>0?1:-1;

  // Tir IA dès qu'il touche la balle
  const ballDist = dist(ai, b);
  if (ballDist < CW*0.036 && ai.kickCD === 0) {
    const gx = atkGoalX, gy = f.y+f.h/2;
    const dx2 = gx-ai.x, dy2 = gy-ai.y;
    const l2  = Math.hypot(dx2,dy2)||1;
    const pw  = SHOOT_POWER*(CW/640)*(0.7+Math.random()*0.35);
    b.vx = dx2/l2*pw;
    b.vy = dy2/l2*pw + (Math.random()-0.5)*pw*0.22;
    ai.kickCD = 30;
    beep(210, 0.04);
  }
}

// ── Physique balle ────────────────────────────────────────────────
function updateBall(f) {
  const b = game.ball;
  b.x += b.vx; b.y += b.vy;
  b.vx *= BALL_FRICTION; b.vy *= BALL_FRICTION;
  if (Math.abs(b.vx)<0.05) b.vx=0;
  if (Math.abs(b.vy)<0.05) b.vy=0;

  const gt = f.y+f.h/2 - f.goalH/2;
  const gb = f.y+f.h/2 + f.goalH/2;
  const inGoalZone = b.y>gt && b.y<gb;

  // Rebonds haut/bas terrain
  if (b.y < f.y+3)       { b.y=f.y+3;       b.vy= Math.abs(b.vy)*0.55; beep(180,0.02); }
  if (b.y > f.y+f.h-3)   { b.y=f.y+f.h-3;   b.vy=-Math.abs(b.vy)*0.55; beep(180,0.02); }

  // Rebonds gauche/droite (pas en zone de but)
  if (!inGoalZone) {
    if (b.x < f.x+3)       { b.x=f.x+3;       b.vx= Math.abs(b.vx)*0.55; beep(180,0.02); }
    if (b.x > f.x+f.w-3)   { b.x=f.x+f.w-3;   b.vx=-Math.abs(b.vx)*0.55; beep(180,0.02); }
  }
}

function ballPlayerCollision(p) {
  const b = game.ball;
  const r  = CW*0.022;
  const d  = dist(p, b);
  if (d < r && d > 0) {
    const dx = (b.x-p.x)/d, dy = (b.y-p.y)/d;
    const spd = Math.max(Math.hypot(b.vx,b.vy)*0.9, 2*(CW/640));
    b.vx = dx*spd; b.vy = dy*spd;
    b.x  = p.x+dx*r; b.y = p.y+dy*r;
  }
}

// ── Buts ─────────────────────────────────────────────────────────
function checkGoals(f) {
  const b  = game.ball;
  const gt = f.y+f.h/2-f.goalH/2;
  const gb = f.y+f.h/2+f.goalH/2;
  if (b.y>gt && b.y<gb) {
    if (b.x < f.x-f.goalW*0.5) { game.score[1]++; triggerGoal(G.team2); }
    if (b.x > f.x+f.w+f.goalW*0.5) { game.score[0]++; triggerGoal(G.team1); }
  }
}

function triggerGoal(team) {
  document.getElementById('score').textContent = game.score[0]+' - '+game.score[1];
  game.goalFlash = 110;
  game.goalMsg   = '⚽ BUT !  '+team.name;
  emitParticles(CW/2, CH/2, '#f9e000', 35);
  emitParticles(CW/2, CH/2, '#fff',    20);
  goalSound();
  setTimeout(resetKickoff, 2200);
}

function resetKickoff() {
  if (!game) return;
  resizeCanvas();
  game.ball    = mkBall();
  game.p1      = mkHuman('left', G.team1, 0);
  game.p2      = G.mode==='2p' ? mkHuman('right', G.team2, 0) : null;
  game.aiLeft  = buildAITeam('left',  G.team1);
  game.aiRight = buildAITeam('right', G.team2);
  game.goalMsg = '';
  rebuildTouchControls();
}

// ── Particules ───────────────────────────────────────────────────
function emitParticles(x, y, color, n) {
  for (let i=0;i<n;i++) {
    const a = Math.random()*Math.PI*2;
    const s = (1+Math.random()*4)*(CW/640);
    game.particles.push({x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s-1.5, color, life:40+Math.random()*30, size:2+Math.random()*3});
  }
}
function updateParticles() {
  game.particles = game.particles.filter(p=>p.life>0);
  game.particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.1;p.life--;});
}

// ════════════════════════════════════════════
//   RENDU
// ════════════════════════════════════════════
function draw() {
  ctx.clearRect(0,0,CW,CH);
  ctx.fillStyle='#000'; ctx.fillRect(0,0,CW,CH);
  drawField();

  const all = [game.p1, game.p2, ...game.aiLeft, ...game.aiRight].filter(Boolean);

  if (game.goalFlash > 0) {
    all.forEach(drawPlayer);
    drawBall();
    drawGoalFlash();
  } else {
    game.particles.forEach(p=>{
      ctx.fillStyle=p.color;
      ctx.fillRect(~~(p.x-p.size/2),~~(p.y-p.size/2),~~p.size,~~p.size);
    });
    all.forEach(drawPlayer);
    drawBall();
  }
}

function drawField() {
  const f = field();
  // Herbe rayée
  for (let i=0;i<8;i++) {
    ctx.fillStyle = i%2===0?'#1c7a1c':'#177017';
    ctx.fillRect(f.x+i*(f.w/8), f.y, f.w/8, f.h);
  }
  ctx.strokeStyle='#fff';
  ctx.lineWidth=Math.max(1.5,CW/420);
  ctx.strokeRect(f.x,f.y,f.w,f.h);
  ctx.beginPath();
  ctx.moveTo(f.x+f.w/2,f.y); ctx.lineTo(f.x+f.w/2,f.y+f.h);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(f.x+f.w/2,f.y+f.h/2,f.h*0.17,0,Math.PI*2);
  ctx.stroke();
  ctx.fillStyle='#fff';
  ctx.fillRect(f.x+f.w/2-2,f.y+f.h/2-2,4,4);

  // Surfaces
  const bw=f.w*0.14, bh=f.h*0.45;
  ctx.strokeRect(f.x,f.y+f.h/2-bh/2,bw,bh);
  ctx.strokeRect(f.x+f.w-bw,f.y+f.h/2-bh/2,bw,bh);
  ctx.strokeRect(f.x,f.y+f.h/2-bh*0.28,bw*0.5,bh*0.56);
  ctx.strokeRect(f.x+f.w-bw*0.5,f.y+f.h/2-bh*0.28,bw*0.5,bh*0.56);

  // Buts
  const gt=f.y+f.h/2-f.goalH/2;
  ctx.lineWidth=Math.max(2,CW/300); ctx.strokeStyle='#ccc';
  ctx.strokeRect(f.x-f.goalW, gt, f.goalW, f.goalH);
  ctx.strokeRect(f.x+f.w,     gt, f.goalW, f.goalH);
  // Filet
  ctx.setLineDash([2,3]); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1;
  for (let i=1;i<5;i++){
    const gy=gt+i*f.goalH/4;
    ctx.beginPath();
    ctx.moveTo(f.x-f.goalW,gy); ctx.lineTo(f.x,gy);
    ctx.moveTo(f.x+f.w,gy);     ctx.lineTo(f.x+f.w+f.goalW,gy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Noms
  const fs=Math.max(7,CW/90);
  ctx.font=`${fs}px "Press Start 2P",monospace`;
  ctx.fillStyle='#4aaeff'; ctx.textAlign='left';
  ctx.fillText(G.team1?G.team1.name:'', f.x+4, f.y+fs+4);
  ctx.fillStyle='#e03030'; ctx.textAlign='right';
  ctx.fillText(G.team2?G.team2.name:'', f.x+f.w-4, f.y+fs+4);
  ctx.textAlign='left';
}

function drawPlayer(p) {
  const x=~~p.x, y=~~p.y;
  const ps=Math.max(8,CW*0.019);
  const leg=Math.sin(p.anim)*ps*0.5;

  // Ombre
  ctx.fillStyle='rgba(0,0,0,.22)';
  ctx.fillRect(x-ps+2, y+ps, ps*2-2, 3);

  // Corps
  ctx.fillStyle=p.team.c1;
  ctx.fillRect(x-ps*.6, y-ps*.5, ps*1.2, ps);
  ctx.strokeStyle=p.team.c2; ctx.lineWidth=Math.max(1,ps*.12);
  ctx.strokeRect(x-ps*.6, y-ps*.5, ps*1.2, ps);

  // Tête
  ctx.fillStyle='#f5c87a';
  ctx.fillRect(x-ps*.35, y-ps*.5-ps*.65, ps*.7, ps*.65);
  ctx.strokeStyle='#b8883a'; ctx.lineWidth=1;
  ctx.strokeRect(x-ps*.35, y-ps*.5-ps*.65, ps*.7, ps*.65);

  // Jambes
  ctx.fillStyle='#ddd';
  ctx.fillRect(x-ps*.45, y+ps*.5, ps*.35, ps*.5+leg);
  ctx.fillRect(x+ps*.1,  y+ps*.5, ps*.35, ps*.5-leg);

  // Flèche joueur actif
  if (p.isHuman) {
    ctx.fillStyle = p.side==='left'?'#4aaeff':'#e03030';
    const aw=ps*.6, ah=ps*.28;
    ctx.fillRect(x-aw/2, y-ps*.5-ps*.65-ah-2, aw, ah);
  }

  // Nom
  const nfs=Math.max(5,CW/130);
  ctx.font=`${nfs}px "Press Start 2P",monospace`;
  ctx.fillStyle=p.isHuman?'#fff':'rgba(255,255,255,.65)';
  ctx.textAlign='center';
  ctx.fillText(p.name.substring(0,8), x, y-ps-ps*.7);
  ctx.textAlign='left';
}

function drawBall() {
  const b=game.ball;
  const r=Math.max(4,CW*0.013);
  const x=~~b.x, y=~~b.y;
  // Ombre
  ctx.fillStyle='rgba(0,0,0,.3)';
  ctx.fillRect(x-r+2, y+r, r*2-2, 3);
  // Corps
  ctx.fillStyle='#f0f0f0';
  ctx.fillRect(x-r, y-r, r*2, r*2);
  // Motif
  ctx.fillStyle='#111';
  ctx.fillRect(x-~~(r*.3), y-~~(r*.3), ~~(r*.6)+1, ~~(r*.6)+1);
  ctx.fillRect(x-r+1,      y-~~(r*.2), ~~(r*.3), ~~(r*.4));
  ctx.fillRect(x+~~(r*.7), y-~~(r*.2), ~~(r*.3), ~~(r*.4));
  ctx.fillRect(x-~~(r*.2), y-r+1,      ~~(r*.4), ~~(r*.3));
  ctx.fillRect(x-~~(r*.2), y+~~(r*.7), ~~(r*.4), ~~(r*.3));
}

function drawGoalFlash() {
  ctx.fillStyle=`rgba(249,224,0,${(game.goalFlash/110)*0.28})`;
  ctx.fillRect(0,0,CW,CH);
  const fs=Math.max(13,CW/34);
  ctx.font=`${fs}px "Press Start 2P",monospace`;
  ctx.fillStyle='#f9e000'; ctx.textAlign='center';
  ctx.shadowColor='#000'; ctx.shadowBlur=12;
  ctx.fillText(game.goalMsg, CW/2, CH/2-fs*.5);
  ctx.font=`${Math.max(10,CW/48)}px "Press Start 2P",monospace`;
  ctx.fillStyle='#fff';
  ctx.fillText(game.score[0]+'  -  '+game.score[1], CW/2, CH/2+fs);
  ctx.shadowBlur=0; ctx.textAlign='left';
  game.particles.forEach(p=>{
    ctx.fillStyle=p.color;
    ctx.fillRect(~~(p.x-p.size/2),~~(p.y-p.size/2),~~p.size,~~p.size);
  });
}

// ════════════════════════════════════════════
//   FIN DE MATCH
// ════════════════════════════════════════════
function endMatch() {
  if (!game) return;
  cancelAnimationFrame(raf); raf=null;
  const s=game.score;
  document.getElementById('end-score').textContent = s[0]+'  -  '+s[1];
  let w='🤝 MATCH NUL !';
  if (s[0]>s[1]) w=G.team1.badge+' '+G.team1.name+' GAGNE !';
  if (s[1]>s[0]) w=G.team2.badge+' '+G.team2.name+' GAGNE !';
  document.getElementById('end-winner').textContent=w;
  G.endMenuIdx=0; updateEndMenu();
  showScreen('end'); game=null;
  goalSound();
}
function updateEndMenu() {
  document.getElementById('btn-rematch').classList.toggle('active-btn', G.endMenuIdx===0);
  document.getElementById('btn-menu').classList.toggle('active-btn',    G.endMenuIdx===1);
}
function handleEndKey(e) {
  if (e.key==='ArrowLeft'||e.key==='ArrowRight') { G.endMenuIdx=1-G.endMenuIdx; updateEndMenu(); beep(300,.05); }
  if (e.key==='Enter') { G.endMenuIdx===0 ? startGame() : showScreen('title'); }
}
document.getElementById('btn-rematch').addEventListener('click',      ()=>startGame());
document.getElementById('btn-menu').addEventListener('click',         ()=>showScreen('title'));
document.getElementById('btn-rematch').addEventListener('touchstart', e=>{e.preventDefault();startGame();},{passive:false});
document.getElementById('btn-menu').addEventListener('touchstart',    e=>{e.preventDefault();showScreen('title');},{passive:false});

// ════════════════════════════════════════════
//   AUDIO 8-BIT
// ════════════════════════════════════════════
let ac=null;
function getAC(){if(!ac){try{ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}return ac;}
function beep(freq,vol){
  try{
    const a=getAC();if(!a)return;
    const o=a.createOscillator(),g=a.createGain();
    o.connect(g);g.connect(a.destination);
    o.frequency.value=freq;o.type='square';
    g.gain.setValueAtTime(vol,a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.08);
    o.start();o.stop(a.currentTime+0.08);
  }catch(e){}
}
function goalSound(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.15),i*110));}

// ════════════════════════════════════════════
//   RESIZE
// ════════════════════════════════════════════
window.addEventListener('resize', ()=>{
  if(G.screen==='game'){resizeCanvas();if(game)resetKickoff();}
});

// ── INIT ──────────────────────────────────────────────────────────
showScreen('title');
