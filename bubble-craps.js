
let betTotal = 0;
let bankroll = 100;

document.querySelectorAll(".chip").forEach(chip => {

  chip.addEventListener("click", () => {

    const value = Number(chip.dataset.value);

    if(betTotal + value > bankroll){
      alert("Not enough bankroll!");
      return;
    }

    betTotal += value;

    document.getElementById("betTotal").textContent = betTotal;

  });

});

document.getElementById("rollBtn").onclick = () => {

  if(betTotal === 0){
    alert("Place a bet first");
    return;
  }

  const dice =
    Math.floor(Math.random()*6 + 1) +
    Math.floor(Math.random()*6 + 1);

  document.getElementById("diceResult").textContent = dice;

  if(dice === 7){
    bankroll += betTotal;
  } else {
    bankroll -= betTotal;
  }

  if(bankroll <= 0){

    bankroll = 0;

    document.getElementById("bankroll").textContent = bankroll;

    alert("Bankroll busted!");

    document.getElementById("rollBtn").disabled = true;

    return;
  }

  document.getElementById("bankroll").textContent = bankroll;

  betTotal = 0;

  document.getElementById("betTotal").textContent = 0;

};

document.getElementById("resetGame").onclick = () => {

  bankroll = 100;

  betTotal = 0;

  document.getElementById("bankroll").textContent = bankroll;

  document.getElementById("betTotal").textContent = 0;

  document.getElementById("diceResult").textContent = "-";

  document.getElementById("rollBtn").disabled = false;

};

let betTotal = 0;
let bankroll = 100;

document.querySelectorAll(".chip").forEach(chip => {

  chip.addEventListener("click", () => {

    const value = Number(chip.dataset.value);

    // prevent betting more than bankroll
    if (betTotal + value > bankroll) {
      alert("Not enough bankroll!");
      return;
    }

    // add bet
    betTotal += value;

    document.getElementById("betTotal").textContent = betTotal;

    // play chip click sound
    const sound = document.getElementById("chipSound");
    sound.currentTime = 0;
    sound.play();

  });

});
