let bankroll = 100;
let wins = 0;
let losses = 0;
let rolls = 0;
let point = null;
let roundActive = false;

let selectedChip = 0;
let lastBetSnapshot = { pass: 0, dontpass: 0, field: 0 };
let previousFieldBet = 0;

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

const auto10Btn = document.getElementById("auto10");
const auto25Btn = document.getElementById("auto25");
const auto50Btn = document.getElementById("auto50");
const stopAutoBtn = document.getElementById("stopAutoBtn");
const strategySelect = document.getElementById("strategySelect");

let autoRunning = false;

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
const explainTextEl = document.getElementById("explainText");

const die1El = document.getElementById("die1");
const die2El = document.getElementById("die2");

const pipClasses = ["face-1", "face-2", "face-3", "face-4", "face-5", "face-6"];
const rollHistory = [];

if (chipSound) chipSound.volume = 0.5;
if (rollSound) rollSound.volume = 0.6;
if (winSound) winSound.volume = 0.4;
if (loseSound) loseSound.volume = 0.4;

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

function setExplanation(text) {
  if (explainTextEl) {
    explainTextEl.textContent = text;
  }
}

function updateDiceFace(el, value) {
  pipClasses.forEach(cls => el.classList.remove(cls));
  el.classList.add(`face-${value}`);
}

function animateDice() {
  die1El.classList.remove("shake");
  die2El.classList.remove("shake");
  void die1El.offsetWidth;
  void die2El.offsetWidth;
  die1El.classList.add("shake");
  die2El.classList.add("shake");
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
  if (roundActive) {
    alert("You can't clear bets while the point is on.");
    return;
  }

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
  if (roundActive) {
    alert("Finish the current round first.");
    return;
  }

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
    if (!selectedChip) {
      alert("Pick a chip first.");
      return;
    }

    if (selectedChip > availableBankroll()) {
      alert("Not enough bankroll!");
      return;
    }

    const betType = spot.dataset.bet;

    if (roundActive && betType !== "field") {
      alert("Only Field bets can be added while the point is on.");
      return;
    }

    if (!roundActive) {
      if (
        (betType === "pass" && bets.dontpass > 0) ||
        (betType === "dontpass" && bets.pass > 0)
      ) {
        alert("Pick Pass Line or Don't Pass, not both.");
        return;
      }
    }

    bets[betType] += selectedChip;
    playSound(chipSound);
    updateDisplay();
  });
});

function resolveFieldBet(total, messages, explanations) {
  if (previousFieldBet <= 0) return { win: false, loss: false };

  if ([2, 3, 4, 9, 10, 11, 12].includes(total)) {
    const payout = (total === 2 || total === 12) ? previousFieldBet * 2 : previousFieldBet;
    bankroll += payout;
    messages.push(`Field wins $${payout}`);
    explanations.push(`Field wins because ${total} is one of the winning Field numbers.`);
    return { win: true, loss: false };
  }

  bankroll -= previousFieldBet;
  messages.push("Field loses");
  explanations.push(`Field loses because ${total} is not a Field number. Field loses on 5, 6, 7, and 8.`);
  return { win: false, loss: true };
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

  const hasMainBet = bets.pass > 0 || bets.dontpass > 0;
  if (!hasMainBet && point === null && bets.field <= 0) {
    alert("Place a bet first.");
    return;
  }

  previousFieldBet = bets.field;
  bets.field = 0;

  if (rollSound) {
    rollSound.playbackRate = 1 + Math.random() * 0.15;
    playSound(rollSound);
  }

  animateDice();

  setTimeout(() => {
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
    let explanations = [];

    const fieldResult = resolveFieldBet(total, messages, explanations);
    if (fieldResult.win) winHappened = true;
    if (fieldResult.loss) lossHappened = true;

    if (point === null) {
      if (bets.pass > 0) {
        if (total === 7 || total === 11) {
          bankroll += bets.pass;
          messages.push(`Pass Line wins $${bets.pass}`);
          explanations.push(`Pass Line wins because 7 or 11 wins instantly on the come-out roll.`);
          bets.pass = 0;
          wins++;
          winHappened = true;
        } else if (total === 2 || total === 3 || total === 12) {
          bankroll -= bets.pass;
          messages.push("Pass Line loses");
          explanations.push(`Pass Line loses because 2, 3, and 12 are losing come-out rolls.`);
          bets.pass = 0;
          losses++;
          lossHappened = true;
        } else {
          point = total;
          roundActive = true;
          messages.push(`Point set to ${point}`);
          explanations.push(`${point} becomes the point. Now you need to roll ${point} again before a 7.`);
        }
      }

      if (bets.dontpass > 0) {
        if (total === 2 || total === 3) {
          bankroll += bets.dontpass;
          messages.push(`Don't Pass wins $${bets.dontpass}`);
          explanations.push(`Don't Pass wins because 2 or 3 wins on the come-out roll.`);
          bets.dontpass = 0;
          wins++;
          winHappened = true;
        } else if (total === 7 || total === 11) {
          bankroll -= bets.dontpass;
          messages.push("Don't Pass loses");
          explanations.push(`Don't Pass loses because 7 or 11 wins for Pass Line on the come-out roll.`);
          bets.dontpass = 0;
          losses++;
          lossHappened = true;
        } else if (total === 12) {
          messages.push("Don't Pass pushes on 12");
          explanations.push(`Don't Pass pushes on 12, so the bet neither wins nor loses.`);
        } else {
          point = total;
          roundActive = true;
          messages.push(`Point set to ${point}`);
          explanations.push(`${point} becomes the point. For Don't Pass, you now want a 7 before the point is rolled again.`);
        }
      }

    } else {
      if (bets.pass > 0) {
        if (total === point) {
          bankroll += bets.pass;
          messages.push(`Pass Line wins $${bets.pass}`);
          explanations.push(`You rolled the point (${point}) before a 7, so the Pass Line bet wins.`);
          bets.pass = 0;
          wins++;
          winHappened = true;
          point = null;
          roundActive = false;
        } else if (total === 7) {
          bankroll -= bets.pass;
          messages.push("Seven out. Pass Line loses");
          explanations.push(`A 7 before the point is called a seven out, so the Pass Line bet loses.`);
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
          explanations.push(`Don't Pass wins because a 7 came before the point was rolled again.`);
          bets.dontpass = 0;
          wins++;
          winHappened = true;
          point = null;
          roundActive = false;
        } else if (total === point) {
          bankroll -= bets.dontpass;
          messages.push("Don't Pass loses on point hit");
          explanations.push(`Don't Pass loses because the point (${point}) was rolled before a 7.`);
          bets.dontpass = 0;
          losses++;
          lossHappened = true;
          point = null;
          roundActive = false;
        }
      }

      if (point !== null) {
        messages.push(`Point stays at ${point}`);
        explanations.push(`The point is still ${point}, so the round continues.`);
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
      explanations = ["Your bankroll hit zero, so the session is over. Reset the game to start again."];
      rollBtn.disabled = true;
      lossHappened = true;
    }

    roundResultEl.textContent = messages.join(" | ");

    if (explanations.length > 0) {
      setExplanation(explanations.join(" "));
    }

    updateDisplay();

    if (winHappened) {
      flashBankroll("win");
      setTimeout(() => playSound(winSound), 250);
    } else if (lossHappened) {
      flashBankroll("loss");
      setTimeout(() => playSound(loseSound), 250);
    }
  }, 260);
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
  previousFieldBet = 0;

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
  setExplanation("Make a bet and roll the dice. This box explains why the result happened.");
});

updateDiceFace(die1El, 1);
updateDiceFace(die2El, 1);
updateRollHistory();
updateDisplay();
setExplanation("On the come-out roll, Pass Line wins on 7 or 11, loses on 2, 3, or 12, and any other main number becomes the point.");
