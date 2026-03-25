let bankroll = 100;
let wins = 0;
let losses = 0;
let rolls = 0;
let point = null;
let roundActive = false;

let selectedChip = 0;
let lastBetSnapshot = { pass: 0, dontpass: 0, field: 0 };

const bets = {
  pass: 0,
  dontpass: 0,
  field: 0
};

const bankrollEl = document.getElementById("bankroll");
const diceResultEl = document.getElementById("diceResult");
const rollBtn = document.getElementById("rollBtn");
const resetBtn = document.getElementById("resetGame");
const clearBetBtn = document.getElementById("clearBetBtn");
const repeatBetBtn = document.getElementById("repeatBetBtn");

const chipSound = document.getElementById("chipSound");
const rollSound = document.getElementById("rollSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");

const chipButtons = document.querySelectorAll(".chip-btn");
const betSpots = document.querySelectorAll(".bet-spot");

const selectedChipLabelEl = document.getElementById("selectedChipLabel");
const passBetAmountEl = document.getElementById("passBetAmount");
const dontPassBetAmountEl = document.getElementById("dontPassBetAmount");
const fieldBetAmountEl = document.getElementById("fieldBetAmount");
const betTotalEl = document.getElementById("betTotal");

const roundResultEl = document.getElementById("roundResult");
const rollCountEl = document.getElementById("rollCount");
const winCountEl = document.getElementById("winCount");
const lossCountEl = document.getElementById("lossCount");
const pointEl = document.getElementById("pointValue");
const pointPuckEl = document.getElementById("pointPuck");
const tableStatusEl = document.getElementById("tableStatus");
const rollHistoryEl = document.getElementById("rollHistory");

const die1El = document.getElementById("die1");
const die2El = document.getElementById("die2");

const pipClasses = ["face-1", "face-2", "face-3", "face-4", "face-5", "face-6"];
const rollHistory = [];

function totalBet() {
  return bets.pass + bets.dontpass + bets.field;
}

function availableBankroll() {
  return bankroll - totalBet();
}

function playSound(audioEl) {
  if (!audioEl) return;
  audioEl.currentTime = 0;
  audioEl.play().catch(() => {});
}

function updateDiceFace(el, value) {
  pipClasses.forEach(cls => el.classList.remove(cls));
  el.classList.add(`face-${value}`);
}

function flashBankroll(type) {
  bankrollEl.classList.remove("flash-win", "flash-loss");
  void bankrollEl.offsetWidth;
  bankrollEl.classList.add(type === "win" ? "flash-win" : "flash-loss");
}

function updateRollHistory() {
  if (rollHistory.length === 0) {
    rollHistoryEl.innerHTML = `<span class="history-empty">No rolls yet.</span>`;
    return;
  }

  rollHistoryEl.innerHTML = rollHistory
    .slice(-10)
    .reverse()
    .map(item => `<span class="roll-badge">${item}</span>`)
    .join("");
}

function updateTableStatus() {
  if (point === null) {
    tableStatusEl.textContent = "COME OUT ROLL";
    pointEl.textContent = "OFF";
    pointPuckEl.classList.remove("on");
  } else {
    tableStatusEl.textContent = "POINT ON";
    pointEl.textContent = point;
    pointPuckEl.classList.add("on");
  }
}

function updateDisplay() {
  bankrollEl.textContent = bankroll;
  rollCountEl.textContent = rolls;
  winCountEl.textContent = wins;
  lossCountEl.textContent = losses;

  passBetAmountEl.textContent = `$${bets.pass}`;
  dontPassBetAmountEl.textContent = `$${bets.dontpass}`;
  fieldBetAmountEl.textContent = `$${bets.field}`;
  betTotalEl.textContent = totalBet();

  selectedChipLabelEl.textContent = selectedChip ? `$${selectedChip}` : "None";

  betSpots.forEach(spot => {
    const betType = spot.dataset.bet;
    spot.classList.toggle("active-bet", bets[betType] > 0);
  });

  updateTableStatus();
}

function clearCurrentBets() {
  if (roundActive) return;
  bets.pass = 0;
  bets.dontpass = 0;
  bets.field = 0;
  updateDisplay();
}

function saveBetSnapshot() {
  lastBetSnapshot = {
    pass: bets.pass,
    dontpass: bets.dontpass,
    field: bets.field
  };
}

function repeatLastBet() {
  if (roundActive) return;
  const needed = lastBetSnapshot.pass + lastBetSnapshot.dontpass + lastBetSnapshot.field;
  if (needed <= 0) return;
  if (needed > bankroll) {
    alert("Not enough bankroll to repeat last bet.");
    return;
  }
  bets.pass = lastBetSnapshot.pass;
  bets.dontpass = lastBetSnapshot.dontpass;
  bets.field = lastBetSnapshot.field;
  updateDisplay();
}

chipButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedChip = Number(btn.dataset.value);

    chipButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    playSound(chipSound);
    updateDisplay();
  });
});

betSpots.forEach(spot => {
  spot.addEventListener("click", () => {
    if (roundActive) {
      alert("Finish the current round first.");
      return;
    }

    if (!selectedChip) {
      alert("Pick a chip first.");
      return;
    }

    if (selectedChip > availableBankroll()) {
      alert("Not enough bankroll!");
      return;
    }

    const betType = spot.dataset.bet;

    if ((betType === "pass" && bets.dontpass > 0) || (betType === "dontpass" && bets.pass > 0)) {
      alert("Pick Pass Line or Don't Pass, not both.");
      return;
    }

    bets[betType] += selectedChip;
    playSound(chipSound);
    updateDisplay();
  });
});

function resolveFieldBet(total) {
  if (bets.field <= 0) return 0;

  let payout = 0;

  if ([2, 3, 4, 9, 10, 11, 12].includes(total)) {
    payout = total === 2 || total === 12 ? bets.field * 2 : bets.field;
    bankroll += payout;
  } else {
    bankroll -= bets.field;
  }

  bets.field = 0;
  return payout;
}

function recordRoll(d1, d2, total) {
  rollHistory.push(`${d1}+${d2}=${total}`);
  updateRollHistory();
}

rollBtn.addEventListener("click", () => {
  if (totalBet() <= 0) {
    alert("Place a bet first.");
    return;
  }

  const mainBetActive = bets.pass > 0 || bets.dontpass > 0;

  if (!mainBetActive && point !== null) {
    alert("You need an active Pass or Don't Pass bet while the point is on.");
    return;
  }

  playSound(rollSound);

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const total = die1 + die2;

  updateDiceFace(die1El, die1);
  updateDiceFace(die2El, die2);

  rolls++;
  diceResultEl.textContent = `${die1} + ${die2} = ${total}`;
  recordRoll(die1, die2, total);

  let winHappened = false;
  let lossHappened = false;
  let messages = [];

  const fieldPayout = resolveFieldBet(total);
  if (bets.field === 0 && fieldPayout > 0) {
    messages.push(`Field wins $${fieldPayout}`);
    winHappened = true;
  } else if (![2, 3, 4, 9, 10, 11, 12].includes(total) && lastBetSnapshot.field > 0) {
    messages.push(`Field loses`);
    lossHappened = true;
  }

  if (point === null) {
    roundActive = true;

    if (bets.pass > 0) {
      if (total === 7 || total === 11) {
        bankroll += bets.pass;
        messages.push(`Pass Line wins $${bets.pass}`);
        bets.pass = 0;
        wins++;
        winHappened = true;
      } else if (total === 2 || total === 3 || total === 12) {
        bankroll -= bets.pass;
        messages.push(`Pass Line loses`);
        bets.pass = 0;
        losses++;
        lossHappened = true;
      } else {
        point = total;
        messages.push(`Point set to ${point}`);
      }
    }

    if (bets.dontpass > 0) {
      if (total === 2 || total === 3) {
        bankroll += bets.dontpass;
        messages.push(`Don't Pass wins $${bets.dontpass}`);
        bets.dontpass = 0;
        wins++;
        winHappened = true;
      } else if (total === 7 || total === 11) {
        bankroll -= bets.dontpass;
        messages.push(`Don't Pass loses`);
        bets.dontpass = 0;
        losses++;
        lossHappened = true;
      } else if (total === 12) {
        messages.push(`Don't Pass pushes on 12`);
      } else {
        point = total;
        messages.push(`Point set to ${point}`);
      }
    }

    roundActive = point !== null;
  } else {
    if (bets.pass > 0) {
      if (total === point) {
        bankroll += bets.pass;
        messages.push(`Pass Line wins $${bets.pass}`);
        bets.pass = 0;
        wins++;
        winHappened = true;
        point = null;
        roundActive = false;
      } else if (total === 7) {
        bankroll -= bets.pass;
        messages.push(`Seven out. Pass Line loses`);
        bets.pass = 0;
        losses++;
        lossHappened = true;
        point = null;
        roundActive = false;
      }
    }

    if (bets.dontpass > 0) {
      if (total === 7) {
        bankroll += bets.dontpass;
        messages.push(`Seven out. Don't Pass wins $${bets.dontpass}`);
        bets.dontpass = 0;
        wins++;
        winHappened = true;
        point = null;
        roundActive = false;
      } else if (total === point) {
        bankroll -= bets.dontpass;
        messages.push(`Don't Pass loses on point hit`);
        bets.dontpass = 0;
        losses++;
        lossHappened = true;
        point = null;
        roundActive = false;
      }
    }

    if (point !== null) {
      messages.push(`Point stays at ${point}`);
    }
  }

  saveBetSnapshot();

  if (bankroll <= 0) {
    bankroll = 0;
    point = null;
    roundActive = false;
    bets.pass = 0;
    bets.dontpass = 0;
    bets.field = 0;
    messages = ["Bankroll busted! The table ate your lunch."];
    rollBtn.disabled = true;
  }

  roundResultEl.textContent = messages.join(" | ");

  if (winHappened) {
    playSound(winSound);
    flashBankroll("win");
  } else if (lossHappened) {
    playSound(loseSound);
    flashBankroll("loss");
  }

  updateDisplay();
});

clearBetBtn.addEventListener("click", () => {
  clearCurrentBets();
});

repeatBetBtn.addEventListener("click", () => {
  repeatLastBet();
});

resetBtn.addEventListener("click", () => {
  bankroll = 100;
  wins = 0;
  losses = 0;
  rolls = 0;
  point = null;
  roundActive = false;
  selectedChip = 0;

  bets.pass = 0;
  bets.dontpass = 0;
  bets.field = 0;

  lastBetSnapshot = { pass: 0, dontpass: 0, field: 0 };
  rollHistory.length = 0;

  chipButtons.forEach(b => b.classList.remove("selected"));

  diceResultEl.textContent = "-";
  roundResultEl.textContent = "-";
  rollBtn.disabled = false;

  updateDiceFace(die1El, 1);
  updateDiceFace(die2El, 1);
  updateRollHistory();
  updateDisplay();
});

updateDiceFace(die1El, 1);
updateDiceFace(die2El, 1);
updateRollHistory();
updateDisplay();
