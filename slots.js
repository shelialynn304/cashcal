const symbols = [
  { icon: "🍒", weight: 20, payout: 2 },
  { icon: "🍋", weight: 18, payout: 3 },
  { icon: "🔔", weight: 14, payout: 5 },
  { icon: "🍀", weight: 12, payout: 8 },
  { icon: "💎", weight: 8, payout: 15 },
  { icon: "7️⃣", weight: 5, payout: 35 },
  { icon: "👑", weight: 2, payout: 100 },
  { icon: "⭐", weight: 3, payout: 0 }
];
 
const reelCountEl = document.getElementById("reelCount");
const rtpSelectEl = document.getElementById("rtpSelect");
const betSizeEl = document.getElementById("betSize");
const bankrollEl = document.getElementById("bankroll");
const reelsEl = document.getElementById("reels");
const spinBtn = document.getElementById("spinBtn");
const autoBtn = document.getElementById("autoBtn");
const turboBtn = document.getElementById("turboBtn");
const resetBtn = document.getElementById("resetBtn");
const stopBtn = document.getElementById("stopBtn");
const soundToggleBtn = document.getElementById("soundToggleBtn");

const balanceDisplay = document.getElementById("balanceDisplay");
const spinsDisplay = document.getElementById("spinsDisplay");
const wageredDisplay = document.getElementById("wageredDisplay");
const actualRtpDisplay = document.getElementById("actualRtpDisplay");
const bonusMeterEl = document.getElementById("bonusMeter");
const biggestWinDisplay = document.getElementById("biggestWinDisplay");
const lastHitDisplay = document.getElementById("lastHitDisplay");
const messageEl = document.getElementById("message");

let state = {
  balance: 100,
  spins: 0,
  wagered: 0,
  returned: 0,
  bonusMeter: 0,
  biggestWin: 0,
  autoRunning: false
};

let audioCtx = null;
let soundEnabled = true;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq = 440, duration = 0.08, type = "sine", volume = 0.03) {
  if (!soundEnabled) return;

  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playSpinSound() {
  playTone(180, 0.05, "square", 0.02);
}

function playStopSound() {
  playTone(120, 0.07, "triangle", 0.03);
}

function playWinSound() {
  playTone(523.25, 0.08, "sine", 0.03);
  setTimeout(() => playTone(659.25, 0.08, "sine", 0.03), 90);
  setTimeout(() => playTone(783.99, 0.12, "sine", 0.03), 180);
}

function playBonusSound() {
  playTone(440, 0.08, "triangle", 0.03);
  setTimeout(() => playTone(660, 0.08, "triangle", 0.03), 80);
  setTimeout(() => playTone(880, 0.14, "triangle", 0.04), 160);
}

function playBigWinSound() {
  playTone(392, 0.09, "sawtooth", 0.03);
  setTimeout(() => playTone(523.25, 0.09, "sawtooth", 0.03), 90);
  setTimeout(() => playTone(659.25, 0.12, "sawtooth", 0.04), 180);
  setTimeout(() => playTone(783.99, 0.18, "sawtooth", 0.04), 300);
}

function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`;
}

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return items[items.length - 1];
}

function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `slot-message ${type}`.trim();
}

function getTargetHitRate(reels, rtp) {
  const reelMultiplier = ({ 3: 0.85, 5: 1, 7: 1.35 })[reels] || 1;
  const avgVariance = 1.025;
  const avgSymbolPayout = 9.556962025316455;
  const bonusRtpShare = 0.06;

  const lineRtpTarget = Math.max(0.01, rtp - bonusRtpShare);

  return Math.max(
    0.01,
    Math.min(0.20, lineRtpTarget / (avgSymbolPayout * reelMultiplier * avgVariance))
  );
}

function buildLosingResult(reels) {
  let result = [];

  while (result.length < reels) {
    result = [];
    for (let i = 0; i < reels; i++) {
      result.push(weightedPick(symbols));
    }

    const first = result[0].icon;
    if (!result.every((s) => s.icon === first)) break;
  }

  return result;
}

function renderReels(result, highlight = false) {
  const count = Number(reelCountEl.value);
  reelsEl.innerHTML = "";
  reelsEl.style.gridTemplateColumns = `repeat(${count}, minmax(0, 92px))`;

  result.forEach((symbol) => {
    const reel = document.createElement("div");
    reel.className = `reel${highlight ? " hit" : ""}`;
    reel.textContent = symbol.icon;
    reelsEl.appendChild(reel);
  });
}

function renderSpinningState() {
  const count = Number(reelCountEl.value);
  reelsEl.innerHTML = "";
  reelsEl.style.gridTemplateColumns = `repeat(${count}, minmax(0, 92px))`;

  for (let i = 0; i < count; i++) {
    const reel = document.createElement("div");
    reel.className = "reel spinning";
    reel.textContent = symbols[Math.floor(Math.random() * symbols.length)].icon;
    reelsEl.appendChild(reel);
  }
}

function updateStats() {
  balanceDisplay.textContent = formatMoney(state.balance);
  spinsDisplay.textContent = state.spins.toLocaleString();
  wageredDisplay.textContent = formatMoney(state.wagered);
  bonusMeterEl.textContent = state.bonusMeter;
  biggestWinDisplay.textContent = formatMoney(state.biggestWin);

  const actualRtp = state.wagered > 0 ? (state.returned / state.wagered) * 100 : 0;
  actualRtpDisplay.textContent = `${actualRtp.toFixed(2)}%`;
}

function getWinSymbol(reels, rtp) {
  const targetHitRate = getTargetHitRate(reels, rtp);
  const baseSymbols = symbols.filter((s) => s.icon !== "⭐");
  return Math.random() < targetHitRate ? weightedPick(baseSymbols) : null;
}

function maybeBonus(bet) {
  if (state.bonusMeter < 3) return 0;

  state.bonusMeter = 0;

  const bonus = Math.round((bet * (3 + Math.random() * 6)) * 100) / 100;

  state.balance += bonus;
  state.returned += bonus;

  if (bonus > state.biggestWin) state.biggestWin = bonus;

  lastHitDisplay.textContent = `Bonus paid ${formatMoney(bonus)}`;
  setMessage(`⭐ Bonus trigger paid ${formatMoney(bonus)}`, "bonus");
  playBonusSound();

  return bonus;
}

async function spinOnce(animated = true) {
  const reels = Number(reelCountEl.value);
  const rtp = Number(rtpSelectEl.value);
  const bet = Number(betSizeEl.value);

  if (!Number.isFinite(bet) || bet <= 0) {
    setMessage("Enter a valid bet size.", "loss");
    return;
  }

  if (state.balance < bet) {
    setMessage("Not enough balance. The machine has completed the robbery.", "loss");
    state.autoRunning = false;
    return;
  }

  if (animated) {
    renderSpinningState();
    playSpinSound();
    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  state.balance -= bet;
  state.spins += 1;
  state.wagered += bet;

  const winSymbol = getWinSymbol(reels, rtp);
  let result;
  let payout = 0;
  let bonusPayout = 0;

  if (Math.random() < 0.03) {
    state.bonusMeter += 1;
  }

  if (winSymbol) {
    result = Array.from({ length: reels }, () => winSymbol);
    const reelMultiplier = ({ 3: 0.85, 5: 1, 7: 1.35 })[reels] || 1;
    const variance = 0.85 + Math.random() * 0.35;
    payout = Math.round((bet * winSymbol.payout * reelMultiplier * variance) * 100) / 100;

    state.balance += payout;
    state.returned += payout;

    if (payout > state.biggestWin) state.biggestWin = payout;

    lastHitDisplay.textContent = `${winSymbol.icon} paid ${formatMoney(payout)}`;
    renderReels(result, true);
    setMessage(`Win: ${winSymbol.icon} line paid ${formatMoney(payout)}`, "win");

    if (payout >= bet * 20) {
      playBigWinSound();
    } else {
      playWinSound();
    }
  } else {
    result = buildLosingResult(reels);
    renderReels(result, false);
    lastHitDisplay.textContent = "No win on the last spin.";
    setMessage("No win this spin.", "loss");
    playStopSound();
  }

  bonusPayout = maybeBonus(bet);
  updateStats();

  if (!payout && !bonusPayout && state.balance < bet) {
    setMessage("Bankroll dead. Another brave soldier lost to variance.", "loss");
  }
}

function resetSimulator() {
  state = {
    balance: Number(bankrollEl.value) || 100,
    spins: 0,
    wagered: 0,
    returned: 0,
    bonusMeter: 0,
    biggestWin: 0,
    autoRunning: false
  };

  lastHitDisplay.textContent = "No win yet.";
  renderReels(
    Array.from(
      { length: Number(reelCountEl.value) },
      () => weightedPick(symbols.filter((s) => s.icon !== "⭐"))
    )
  );
  updateStats();
  setMessage("Fresh bankroll loaded. Let the shiny theft begin.");
}

async function autoSpin(totalSpins = 100, turbo = false) {
  if (state.autoRunning) return;
  state.autoRunning = true;

  for (let i = 0; i < totalSpins; i++) {
    if (!state.autoRunning) break;
    await spinOnce(!turbo);
    if (state.balance < Number(betSizeEl.value)) break;
    if (!turbo) await new Promise((resolve) => setTimeout(resolve, 70));
  }

  state.autoRunning = false;
}

spinBtn.addEventListener("click", () => {
  getAudioCtx();
  spinOnce(true);
});

autoBtn.addEventListener("click", () => {
  getAudioCtx();
  autoSpin(100, false);
});

turboBtn.addEventListener("click", () => {
  getAudioCtx();
  autoSpin(500, true);
});

stopBtn.addEventListener("click", () => {
  state.autoRunning = false;
  setMessage("Auto spin stopped.");
});

resetBtn.addEventListener("click", resetSimulator);

soundToggleBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? "Sound: On" : "Sound: Off";
});

reelCountEl.addEventListener("change", resetSimulator);
bankrollEl.addEventListener("change", resetSimulator);

resetSimulator();
