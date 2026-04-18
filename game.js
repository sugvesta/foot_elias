// ============================================================
//   PIXEL FOOT '96 — GAME ENGINE
//   Style retro années 90 — Canvas 2D pixel art
// ============================================================

// ── DONNÉES ÉQUIPES ─────────────────────────────────────────
const TEAMS = [
  {
    id: 'brazil', name: 'BRÉSIL', badge: '🇧🇷', color1: '#f9e000', color2: '#1a7a1a',
    rating: 95,
    players: ['ROMÁRIO','RONALDO','BEBETO','ALDAIR','CAFU','ROBERTO CARLOS','DUNGA','MAURO SILVA','MAZINHO','BRANCO','TAFFAREL']
  },
  {
    id: 'france', name: 'FRANCE', badge: '🇫🇷', color1: '#002395', color2: '#ED2939',
    rating: 90,
    players: ['ZIDANE','HENRY','DJORKAEFF','DESAILLY','BLANC','THURAM','LIZARAZU','DESCHAMPS','PETIT','VIEIRA','BARTHEZ']
  },
  {
    id: 'germany', name: 'ALLEMAGNE', badge: '🇩🇪', color1: '#fff', color2: '#000',
    rating: 88,
    players: ['KLINSMANN','BIERHOFF','VÖLLER','MATTHÄUS','SAMMER','KOHLER','BREHME','EFFENBERG','HÄSSLER','ZIEGE','KAHN']
  },
  {
    id: 'italy', name: 'ITALIE', badge: '🇮🇹', color1: '#003399', color2: '#fff',
    rating: 89,
    players: ['BAGGIO','DEL PIERO','MALDINI','BARESI','COSTACURTA','ALBERTINI','ZOLA','SIGNORI','CASIRAGHI','DONADONI','PERUZZI']
  },
  {
    id: 'argentina', name: 'ARGENTINE', badge: '🇦🇷', color1: '#74ACDF', color2: '#fff',
    rating: 87,
    players: ['ORTEGA','BATISTUTA','CANIGGIA','SIMEONE','VERON','AYALA','ALMEYDA','GALLARDO','ZANETTI','SENSINI','GOYCOCHEA']
  },
  {
    id: 'spain', name: 'ESPAGNE', badge: '🇪🇸', color1: '#AA151B', color2: '#F1BF00',
    rating: 84,
    players: ['HIERRO','RAÚL','MÍCHEL','GUARDIOLA','SERGI','NADAL','DE LA PEÑA','CAMINERO','JULIO SALINAS','ABELARDO','ZUBIZARRETA']
  },
  {
    id: 'england', name: 'ANGLETERRE', badge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color1: '#fff', color2: '#CF142B',
    rating: 83,
    players: ['SHEARER','SHERINGHAM','GASCOIGNE','SCHOLES','BECKHAM','INCE','MCMANAMAN','ANDERTON','ADAMS','SEAMAN','PEARCE']
  },
  {
    id: 'netherlands', name: 'PAYS-BAS', badge: '🇳🇱', color1: '#FF4F00', color2: '#fff',
    rating: 88,
    players: ['BERGKAMP','KLUIVERT','DAVIDS','SEEDORF','OVERMARS','DE BOER R.','DE BOER F.','STAM','COCU','BLIND','VAN DER SAR']
  },
  {
    id: 'portugal', name: 'PORTUGAL', badge: '🇵🇹', color1: '#006600', color2: '#FF0000',
    rating: 85,
    players: ['FIGO','JOAO PINTO','RÚBEN AMORIM','COUTO','SECRETÁRIO','OCEANO','SA PINTO','DRULOVIC','DIMAS','VIDIGAL','BAIA']
  },
  {
    id: 'milan', name: 'AC MILAN', badge: '🔴⚫', color1: '#CC0000', color2: '#000',
    rating: 92,
    players: ['WEAH','SAVICEVIC','BOBAN','DESAILLY','MALDINI','BARESI','COSTACURTA','DONADONI','ALBERTINI','SIMONE','SEBASTIANO ROSSI']
  },
];

// ── CONSTANTES ───────────────────────────────────────────────
const W = 640, H = 400;
const FIELD_X = 30, FIELD_Y = 10, FIELD_W = W - 60, FIELD_H = H - 20;
const GOAL_W = 10, GOAL_H = 60;
const PLAYER_SIZE = 10;
const BALL_SIZE = 6;
const PLAYER_SPEED = 2.6;
const BALL_FRICTION = 0.97;
const SHOOT_POWER = 9;
const PASS_POWER = 5;
const AI_SPEED = 1.8;
const MATCH_DURATION = 90 * 10; // en frames (~90s réel pour du fun)

// ── ÉTAT GLOBAL ──────────────────────────────────────────────
const state = {
  screen: 'title',
  selectStep: 0, // 0=choisir equipe 1, 1=choisir equipe 2
  hoverIdx: 0,
  team1: null,
  team2: null,
  endMenuIdx: 0,
};

// ── AFFICHAGE SCREENS ────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  state.screen = name;
}

// ── ÉCRAN TITRE ──────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (state.screen === 'title') {
    if (e.key === 'Enter') { initSelectScreen(); showScreen('select'); }
  } else if (state.screen === 'select') {
    handleSelectInput(e);
  } else if (state.screen === 'end') {
    handleEndInput(e);
  }
});

// ── ÉCRAN SÉLECTION ──────────────────────────────────────────
function initSelectScreen() {
  state.selectStep = 0;
  state.team1 = null;
  state.team2 = null;
  state.hoverIdx = 0;
  renderTeamGrid();
  updateVsBadges();
  document.getElementById('select-hint').textContent = 'P1 → CHOISIR TON ÉQUIPE  •  ←↑↓→ NAVIGUER  •  ENTRÉE CONFIRMER';
}

function renderTeamGrid() {
  const grid = document.getElementById('team-grid');
  grid.innerHTML = '';
  TEAMS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'team-card' + (i === state.hoverIdx ? ' hovered' : '');
    if (state.team1 && state.team1.id === t.id) card.classList.add('selected-p1');
    if (state.team2 && state.team2.id === t.id) card.classList.add('selected-p2');
    card.innerHTML = `<div class="team-badge">${t.badge}</div><div class="team-card-name">${t.name}</div>`;
    card.addEventListener('click', () => { state.hoverIdx = i; selectTeam(); });
    grid.appendChild(card);
  });
}

function handleSelectInput(e) {
  const cols = 5;
  const rows = Math.ceil(TEAMS.length / cols);
  let idx = state.hoverIdx;
  if (e.key === 'ArrowRight') idx = Math.min(TEAMS.length - 1, idx + 1);
  if (e.key === 'ArrowLeft')  idx = Math.max(0, idx - 1);
  if (e.key === 'ArrowDown')  idx = Math.min(TEAMS.length - 1, idx + cols);
  if (e.key === 'ArrowUp')    idx = Math.max(0, idx - cols);
  if (e.key === 'Enter') { selectTeam(); return; }
  state.hoverIdx = idx;
  renderTeamGrid();
}

function selectTeam() {
  const t = TEAMS[state.hoverIdx];
  if (state.selectStep === 0) {
    state.team1 = t;
    state.selectStep = 1;
    state.hoverIdx = 0;
    document.getElementById('select-hint').textContent = 'P2 → CHOISIR TON ÉQUIPE  •  ←↑↓→ NAVIGUER  •  ENTRÉE CONFIRMER';
    updateVsBadges();
    renderTeamGrid();
  } else {
    if (t.id === state.team1.id) return; // même équipe
    state.team2 = t;
    updateVsBadges();
    setTimeout(() => startGame(), 300);
  }
}

function updateVsBadges() {
  document.getElementById('team1-badge').textContent = state.team1 ? state.team1.badge : '?';
  document.getElementById('team2-badge').textContent = state.team2 ? state.team2.badge : '?';
}

// ── MOTEUR DE JEU ───────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let game = null;
let animFrame = null;

function startGame() {
  showScreen('game');
  document.getElementById('team1-name-hud').textContent = state.team1.name;
  document.getElementById('team2-name-hud').textContent = state.team2.name;

  game = {
    score: [0, 0],
    timer: MATCH_DURATION,
    paused: false,
    kickoff: true,
    keys: {},
    // Balle
    ball: { x: W/2, y: H/2 - 18, vx: 0, vy: 0, owner: null },
    // Joueurs humains
    players: [
      createPlayer(1, W/2 - 60, H/2 - 18, state.team1),
      createPlayer(2, W/2 + 60, H/2 - 18, state.team2),
    ],
    // IA adversaires
    aiTeam1: createAITeam(state.team1, 'left'),
    aiTeam2: createAITeam(state.team2, 'right'),
    goalFlash: 0,
    goalMsg: '',
    lastScorer: null,
    particles: [],
  };

  document.addEventListener('keydown', gameKeyDown);
  document.addEventListener('keyup',   gameKeyUp);

  if (animFrame) cancelAnimationFrame(animFrame);
  gameLoop();
}

function createPlayer(num, x, y, team) {
  return {
    x, y, vx: 0, vy: 0,
    team, num,
    name: team.players[num - 1] || 'JOUEUR',
    color: team.color1,
    outlineColor: team.color2,
    isHuman: true,
    facing: num === 1 ? 1 : -1,
    kickCooldown: 0,
    passCooldown: 0,
    hasBall: false,
    anim: 0,
  };
}

function createAITeam(team, side) {
  const positions = side === 'left'
    ? [ [FIELD_X+30, H/2-60],[FIELD_X+30, H/2+30],[FIELD_X+90, H/2-30],[FIELD_X+90, H/2+30],[FIELD_X+50, H/2] ]
    : [ [FIELD_X+FIELD_W-30, H/2-60],[FIELD_X+FIELD_W-30, H/2+30],[FIELD_X+FIELD_W-90, H/2-30],[FIELD_X+FIELD_W-90, H/2+30],[FIELD_X+FIELD_W-50, H/2] ];

  return positions.map((pos, i) => ({
    x: pos[0], y: pos[1],
    baseX: pos[0], baseY: pos[1],
    vx: 0, vy: 0,
    team,
    isHuman: false,
    side,
    name: team.players[i + 2] || 'AI',
    color: team.color1,
    outlineColor: team.color2,
    facing: side === 'left' ? 1 : -1,
    kickCooldown: 0,
    hasBall: false,
    anim: 0,
    role: ['def','def','mid','mid','fwd'][i],
  }));
}

function gameKeyDown(e) {
  if (!game) return;
  game.keys[e.key] = true;
  e.preventDefault();
}
function gameKeyUp(e) {
  if (!game) return;
  game.keys[e.key] = false;
}

// ── BOUCLE DE JEU ────────────────────────────────────────────
function gameLoop() {
  if (!game) return;
  update();
  render();
  animFrame = requestAnimationFrame(gameLoop);
}

function update() {
  if (game.paused) return;

  // Timer
  if (game.timer > 0) {
    game.timer--;
    const seconds = Math.floor((MATCH_DURATION - game.timer) * 90 / MATCH_DURATION);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer-display').textContent =
      String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
  }

  if (game.goalFlash > 0) { game.goalFlash--; return; }
  if (game.timer <= 0) { endMatch(); return; }

  // Décrémente cooldowns
  game.players.forEach(p => { if (p.kickCooldown > 0) p.kickCooldown--; });
  game.aiTeam1.forEach(p => { if (p.kickCooldown > 0) p.kickCooldown--; });
  game.aiTeam2.forEach(p => { if (p.kickCooldown > 0) p.kickCooldown--; });

  // Mouvement joueur 1 (ZQSD)
  moveHuman(game.players[0], 'z','s','q','d',' ', 'e');
  // Mouvement joueur 2 (Flèches)
  moveHuman(game.players[1], 'ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Shift');

  // IA
  [...game.aiTeam1, ...game.aiTeam2].forEach(ai => moveAI(ai));

  // Physique balle
  moveBall();

  // Collision joueurs <-> balle
  const allPlayers = [...game.players, ...game.aiTeam1, ...game.aiTeam2];
  allPlayers.forEach(p => checkBallCollision(p));

  // Bords terrain
  boundPlayers();

  // Particles
  game.particles = game.particles.filter(p => p.life > 0);
  game.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.vy += 0.1; });

  // Score
  checkGoal();

  // Animation marche
  allPlayers.forEach(p => {
    if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) p.anim = (p.anim + 0.3) % (Math.PI * 2);
  });
}

function moveHuman(p, up, down, left, right, shoot, pass) {
  const k = game.keys;
  p.vx = 0; p.vy = 0;
  if (k[up])    p.vy = -PLAYER_SPEED;
  if (k[down])  p.vy =  PLAYER_SPEED;
  if (k[left])  { p.vx = -PLAYER_SPEED; p.facing = -1; }
  if (k[right]) { p.vx =  PLAYER_SPEED; p.facing =  1; }
  if (p.vx !== 0 && p.vy !== 0) { p.vx *= 0.707; p.vy *= 0.707; }
  p.x += p.vx;
  p.y += p.vy;

  if (k[shoot] && p.kickCooldown === 0) {
    doShoot(p);
    k[shoot] = false;
  }
  if (k[pass] && p.kickCooldown === 0) {
    doPass(p);
    k[pass] = false;
  }
}

function doShoot(p) {
  const b = game.ball;
  const dist = Math.hypot(b.x - p.x, b.y - p.y);
  if (dist < 20) {
    // Tir vers le but adverse
    const goalX = p.team.id === state.team1.id ? FIELD_X + FIELD_W + GOAL_W : FIELD_X - GOAL_W;
    const goalY = H/2 - 18;
    const dx = goalX - p.x, dy = goalY - p.y;
    const len = Math.hypot(dx, dy);
    // Légère imprécision
    const spread = (Math.random() - 0.5) * 2;
    b.vx = (dx/len) * SHOOT_POWER;
    b.vy = (dy/len) * SHOOT_POWER + spread;
    b.owner = null;
    p.kickCooldown = 20;
    spawnParticles(b.x, b.y, '#f9e000', 6);
    playBeep(440, 0.08);
  }
}

function doPass(p) {
  const b = game.ball;
  const dist = Math.hypot(b.x - p.x, b.y - p.y);
  if (dist < 22) {
    // Passe au coéquipier le plus proche vers l'avant
    const dx = p.facing;
    b.vx = dx * PASS_POWER;
    b.vy = (Math.random() - 0.5);
    b.owner = null;
    p.kickCooldown = 15;
    playBeep(330, 0.05);
  }
}

function moveAI(ai) {
  const b = game.ball;
  const isMyTeam1 = ai.side === 'left';
  const myGoalX  = isMyTeam1 ? FIELD_X + 20 : FIELD_X + FIELD_W - 20;
  const atkGoalX = isMyTeam1 ? FIELD_X + FIELD_W : FIELD_X;

  let targetX = ai.baseX, targetY = ai.baseY;
  const ballDist = Math.hypot(b.x - ai.x, b.y - ai.y);

  const ballIsOnMySide = isMyTeam1 ? b.x < W/2 : b.x > W/2;

  if (ai.role === 'fwd' || (ballDist < 100 && ai.role === 'mid') || ballIsOnMySide) {
    targetX = b.x;
    targetY = b.y;
  } else if (ai.role === 'def') {
    targetX = (ai.baseX + b.x * 0.3) / 1.3;
    targetY = (ai.baseY + b.y * 0.3) / 1.3;
  } else {
    targetX = (ai.baseX + b.x) / 2;
    targetY = (ai.baseY + b.y) / 2;
  }

  const dx = targetX - ai.x, dy = targetY - ai.y;
  const len = Math.hypot(dx, dy) || 1;
  const speed = AI_SPEED * (ai.role === 'fwd' ? 1.1 : 0.9);
  if (len > 3) { ai.vx = (dx/len)*speed; ai.vy = (dy/len)*speed; }
  else         { ai.vx = 0; ai.vy = 0; }

  ai.x += ai.vx; ai.y += ai.vy;
  if (ai.vx !== 0) ai.facing = ai.vx > 0 ? 1 : -1;

  // Tir AI
  if (ballDist < 16 && ai.kickCooldown === 0) {
    const goalDx = atkGoalX - ai.x;
    const goalDy = (H/2 - 18) - ai.y;
    const gl = Math.hypot(goalDx, goalDy);
    b.vx = (goalDx/gl) * SHOOT_POWER * (0.7 + Math.random()*0.4);
    b.vy = (goalDy/gl) * SHOOT_POWER + (Math.random()-0.5)*1.5;
    b.owner = null;
    ai.kickCooldown = 30;
    playBeep(220, 0.04);
  }
}

function moveBall() {
  const b = game.ball;
  b.x += b.vx;
  b.y += b.vy;
  b.vx *= BALL_FRICTION;
  b.vy *= BALL_FRICTION;

  // Rebond bords haut/bas
  if (b.y - BALL_SIZE < FIELD_Y)         { b.y = FIELD_Y + BALL_SIZE; b.vy = Math.abs(b.vy) * 0.7; playBeep(180, 0.03); }
  if (b.y + BALL_SIZE > FIELD_Y+FIELD_H) { b.y = FIELD_Y + FIELD_H - BALL_SIZE; b.vy = -Math.abs(b.vy) * 0.7; playBeep(180, 0.03); }
  // Rebond bords gauche/droit (hors zone de but)
  const inGoalZone = b.y > H/2 - 18 - GOAL_H/2 - 4 && b.y < H/2 - 18 + GOAL_H/2 + 4;
  if (!inGoalZone) {
    if (b.x - BALL_SIZE < FIELD_X)            { b.x = FIELD_X + BALL_SIZE; b.vx = Math.abs(b.vx)*0.7; playBeep(180, 0.03); }
    if (b.x + BALL_SIZE > FIELD_X + FIELD_W)  { b.x = FIELD_X+FIELD_W-BALL_SIZE; b.vx = -Math.abs(b.vx)*0.7; playBeep(180, 0.03); }
  }
}

function checkBallCollision(p) {
  const b = game.ball;
  const dist = Math.hypot(b.x - p.x, b.y - p.y);
  if (dist < PLAYER_SIZE + BALL_SIZE + 2) {
    // Déviation douce
    const dx = b.x - p.x, dy = b.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    b.vx += (dx/len) * 1.5 + p.vx * 0.5;
    b.vy += (dy/len) * 1.5 + p.vy * 0.5;
    b.x = p.x + (dx/len) * (PLAYER_SIZE + BALL_SIZE + 2);
    b.y = p.y + (dy/len) * (PLAYER_SIZE + BALL_SIZE + 2);
  }
}

function boundPlayers() {
  const all = [...game.players, ...game.aiTeam1, ...game.aiTeam2];
  all.forEach(p => {
    p.x = Math.max(FIELD_X + PLAYER_SIZE, Math.min(FIELD_X+FIELD_W-PLAYER_SIZE, p.x));
    p.y = Math.max(FIELD_Y + PLAYER_SIZE, Math.min(FIELD_Y+FIELD_H-PLAYER_SIZE, p.y));
  });
}

function checkGoal() {
  const b = game.ball;
  const goalTop = H/2 - 18 - GOAL_H/2;
  const goalBot = H/2 - 18 + GOAL_H/2;

  // But côté gauche (équipe 2 marque)
  if (b.x < FIELD_X - 2 && b.y > goalTop && b.y < goalBot) {
    game.score[1]++;
    triggerGoal(1, state.team2);
    return;
  }
  // But côté droit (équipe 1 marque)
  if (b.x > FIELD_X + FIELD_W + 2 && b.y > goalTop && b.y < goalBot) {
    game.score[0]++;
    triggerGoal(0, state.team1);
    return;
  }
}

function triggerGoal(scorerIdx, team) {
  document.getElementById('score').textContent = game.score[0] + ' - ' + game.score[1];
  game.goalFlash = 90;
  game.goalMsg = '⚽ BUT DE ' + team.name + ' !';
  spawnParticles(W/2, H/2, '#f9e000', 30);
  spawnParticles(W/2, H/2, '#fff', 20);
  playGoalSound();
  // Remise au centre
  setTimeout(() => resetKickoff(), 1800);
}

function resetKickoff() {
  if (!game) return;
  game.ball = { x: W/2, y: H/2 - 18, vx: 0, vy: 0, owner: null };
  game.players[0] = createPlayer(1, W/2 - 60, H/2 - 18, state.team1);
  game.players[1] = createPlayer(2, W/2 + 60, H/2 - 18, state.team2);
  game.aiTeam1 = createAITeam(state.team1, 'left');
  game.aiTeam2 = createAITeam(state.team2, 'right');
  game.goalMsg = '';
  game.paused = false;
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    game.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color,
      life: 30 + Math.random() * 30,
      size: 2 + Math.random() * 3,
    });
  }
}

// ── AUDIO RETRO ──────────────────────────────────────────────
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBeep(freq, vol) {
  try {
    const ac = getAudio();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
    osc.start(); osc.stop(ac.currentTime + 0.1);
  } catch(e) {}
}

function playGoalSound() {
  try {
    const ac = getAudio();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.value = freq;
      osc.type = 'square';
      const t = ac.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t); osc.stop(t + 0.3);
    });
  } catch(e) {}
}

// ── RENDU ────────────────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, W, H);

  // Fond
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  drawField();

  if (game.goalFlash > 0) {
    drawGoalFlash();
  } else {
    // Particules
    game.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - p.size/2), Math.round(p.y - p.size/2), Math.round(p.size), Math.round(p.size));
    });

    // Joueurs IA
    game.aiTeam1.forEach(p => drawPlayer(p, false));
    game.aiTeam2.forEach(p => drawPlayer(p, false));
    // Joueurs humains
    game.players.forEach(p => drawPlayer(p, true));
    // Balle
    drawBall();
  }
}

function drawField() {
  const fx = FIELD_X, fy = FIELD_Y, fw = FIELD_W, fh = FIELD_H;

  // Herbe alternée
  ctx.fillStyle = '#1a6e1a';
  ctx.fillRect(fx, fy, fw, fh);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#1e7e1e' : '#186018';
    ctx.fillRect(fx + i * (fw/8), fy, fw/8, fh);
  }

  // Bordure terrain
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(fx, fy, fw, fh);

  // Ligne médiane
  ctx.beginPath();
  ctx.moveTo(fx + fw/2, fy);
  ctx.lineTo(fx + fw/2, fy + fh);
  ctx.stroke();

  // Cercle central
  ctx.beginPath();
  ctx.arc(fx + fw/2, fy + fh/2, 40, 0, Math.PI*2);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fillRect(fx + fw/2 - 1, fy + fh/2 - 1, 3, 3);

  // Points de corner
  [[fx,fy],[fx+fw,fy],[fx,fy+fh],[fx+fw,fy+fh]].forEach(([cx,cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI*2);
    ctx.stroke();
  });

  // Surfaces de réparation
  const boxW = 80, boxH = 120;
  ctx.strokeRect(fx, fy + fh/2 - boxH/2, boxW, boxH);
  ctx.strokeRect(fx + fw - boxW, fy + fh/2 - boxH/2, boxW, boxH);

  const smallBoxW = 40, smallBoxH = 70;
  ctx.strokeRect(fx, fy + fh/2 - smallBoxH/2, smallBoxW, smallBoxH);
  ctx.strokeRect(fx + fw - smallBoxW, fy + fh/2 - smallBoxH/2, smallBoxW, smallBoxH);

  // Buts
  const goalTop = fy + fh/2 - GOAL_H/2;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  // But gauche
  ctx.strokeRect(fx - GOAL_W, goalTop, GOAL_W, GOAL_H);
  // But droit
  ctx.strokeRect(fx + fw, goalTop, GOAL_W, GOAL_H);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';

  // Filet (pointillés)
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 5; i++) {
    const y = goalTop + i * (GOAL_H / 4);
    ctx.beginPath();
    ctx.moveTo(fx - GOAL_W, y);
    ctx.lineTo(fx, y);
    ctx.moveTo(fx + fw, y);
    ctx.lineTo(fx + fw + GOAL_W, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = '#fff';

  // Noms équipes
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = '#4af';
  ctx.textAlign = 'left';
  ctx.fillText(state.team1 ? state.team1.name : '', fx + 4, fy + 14);
  ctx.fillStyle = '#f55';
  ctx.textAlign = 'right';
  ctx.fillText(state.team2 ? state.team2.name : '', fx + fw - 4, fy + 14);
  ctx.textAlign = 'left';
}

function drawPlayer(p, isHuman) {
  const x = Math.round(p.x), y = Math.round(p.y);
  const ps = PLAYER_SIZE;
  const legAnim = Math.sin(p.anim) * 3;

  // Ombre
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - ps + 2, y + ps - 1, ps*2 - 2, 3);

  // Corps (maillot)
  ctx.fillStyle = p.color;
  ctx.fillRect(x - ps/2, y - ps/2, ps, ps);

  // Contour maillot
  ctx.strokeStyle = p.outlineColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - ps/2, y - ps/2, ps, ps);

  // Tête
  ctx.fillStyle = '#f5c87a';
  ctx.fillRect(x - 3, y - ps/2 - 5, 6, 6);
  ctx.strokeStyle = '#c4952a';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 3, y - ps/2 - 5, 6, 6);

  // Jambes animées
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 4, y + ps/2, 3, 4 + legAnim);
  ctx.fillRect(x + 1, y + ps/2, 3, 4 - legAnim);

  // Flèche direction (joueur humain)
  if (isHuman) {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + p.facing * (ps/2 + 2), y - 1, p.facing * 3, 2);
    ctx.globalAlpha = 1;
  }

  // Nom abrégé
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  const shortName = p.name.split(' ')[0].substring(0, 8);
  ctx.fillText(shortName, x, y - ps/2 - 8);
  ctx.textAlign = 'left';

  // Indicateur joueur humain
  if (isHuman) {
    ctx.fillStyle = p.num === 1 ? '#4af' : '#f55';
    ctx.fillRect(x - 2, y - ps/2 - 14, 4, 4);
  }
}

function drawBall() {
  const b = game.ball;
  const x = Math.round(b.x), y = Math.round(b.y);

  // Ombre balle
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x - BALL_SIZE + 2, y + BALL_SIZE - 1, BALL_SIZE*2 - 2, 3);

  // Balle blanche
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(x - BALL_SIZE, y - BALL_SIZE, BALL_SIZE*2, BALL_SIZE*2);

  // Pentagones pixel (motif ballon)
  ctx.fillStyle = '#111';
  ctx.fillRect(x - 2, y - 2, 4, 4);
  ctx.fillRect(x - BALL_SIZE + 1, y - 1, 2, 2);
  ctx.fillRect(x + BALL_SIZE - 3, y - 1, 2, 2);
  ctx.fillRect(x - 1, y - BALL_SIZE + 1, 2, 2);
  ctx.fillRect(x - 1, y + BALL_SIZE - 3, 2, 2);
}

function drawGoalFlash() {
  // Flash jaune but
  const alpha = game.goalFlash / 90;
  ctx.fillStyle = `rgba(249, 224, 0, ${alpha * 0.25})`;
  ctx.fillRect(0, 0, W, H);

  ctx.font = '18px "Press Start 2P", monospace';
  ctx.fillStyle = '#f9e000';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 8;
  ctx.fillText(game.goalMsg, W/2, H/2 - 10);
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillStyle = '#fff';
  ctx.fillText(game.score[0] + '  -  ' + game.score[1], W/2, H/2 + 16);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';

  // Particules
  game.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - p.size/2), Math.round(p.y - p.size/2), Math.round(p.size), Math.round(p.size));
  });
}

// ── FIN DE MATCH ─────────────────────────────────────────────
function endMatch() {
  if (!game) return;
  cancelAnimationFrame(animFrame);
  document.removeEventListener('keydown', gameKeyDown);
  document.removeEventListener('keyup', gameKeyUp);

  const s = game.score;
  const t1 = state.team1, t2 = state.team2;
  document.getElementById('end-score').textContent = s[0] + '  -  ' + s[1];

  let winnerText = '';
  if (s[0] > s[1]) winnerText = t1.badge + ' ' + t1.name + ' GAGNE !';
  else if (s[1] > s[0]) winnerText = t2.badge + ' ' + t2.name + ' GAGNE !';
  else winnerText = 'MATCH NUL !';
  document.getElementById('end-winner').textContent = winnerText;

  state.endMenuIdx = 0;
  updateEndMenu();
  showScreen('end');
  game = null;
  playGoalSound();
}

function updateEndMenu() {
  document.getElementById('btn-rematch').classList.toggle('active-btn', state.endMenuIdx === 0);
  document.getElementById('btn-menu').classList.toggle('active-btn', state.endMenuIdx === 1);
}

function handleEndInput(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    state.endMenuIdx = 1 - state.endMenuIdx;
    updateEndMenu();
    playBeep(300, 0.05);
  }
  if (e.key === 'Enter') {
    if (state.endMenuIdx === 0) {
      startGame();
    } else {
      showScreen('title');
    }
  }
}

document.getElementById('btn-rematch').addEventListener('click', () => startGame());
document.getElementById('btn-menu').addEventListener('click', () => showScreen('title'));

// ── INIT ─────────────────────────────────────────────────────
showScreen('title');
