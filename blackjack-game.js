let deck=[]
let player=[]
let dealer=[]
let bankroll=1000
let bet=0
let gameOver=true
let detailedExplanations = true

let correctMoves=0
let wrongMoves=0
let lastStrategyMove=null
let trainerHintsEnabled=true
let hintDismissedForHand = false
  
const bankrollEl=document.getElementById("bankroll")
const betEl=document.getElementById("bet")
const dealerHandEl=document.getElementById("dealer-hand")
const playerHandEl=document.getElementById("player-hand")
const dealerTotalEl=document.getElementById("dealer-total")
const playerTotalEl=document.getElementById("player-total")
const messageEl=document.getElementById("message")
const chipSound=document.getElementById("chipSound")
  
const homeBtn = document.getElementById("homeBtn")
const dealBtn=document.getElementById("dealBtn")
const hitBtn=document.getElementById("hitBtn")
const standBtn=document.getElementById("standBtn")
const doubleBtn=document.getElementById("doubleBtn")
const splitBtn=document.getElementById("splitBtn")
const clearBetBtn=document.getElementById("clearBetBtn")
const resetBtn=document.getElementById("resetBtn")

const chipsRow=document.getElementById("chipsRow")
const betSpot=document.getElementById("betSpot")

const correctMovesEl=document.getElementById("correctMoves")
const wrongMovesEl=document.getElementById("wrongMoves")
const accuracyEl=document.getElementById("accuracy")

const strategyPopup=document.getElementById("strategyPopup")
const tableArea=document.querySelector(".table-area")
const strategyMoveEl=document.getElementById("strategyMove")
const strategyTextEl=document.getElementById("strategyText")
const strategyCloseBtn=document.getElementById("strategyClose")
let strategyTimer=null

if(strategyCloseBtn){
  strategyCloseBtn.addEventListener("click",()=>{
    strategyPopup.classList.add("hidden")
    hintDismissedForHand = true
    clearTimeout(strategyTimer)
  })
}  

const resultBubble=document.getElementById("resultBubble")
const trainerToggle=document.getElementById("trainerToggle")
const trainerToggleText=document.getElementById("trainerToggleText")
const reasonTextEl=document.getElementById("reasonText")
const explainToggle = document.getElementById("explainToggle")
  
if(explainToggle){
  explainToggle.addEventListener("change",()=>{

    // update mode
    detailedExplanations = explainToggle.checked

    // 🔥 instant feedback (top message)
    setMessage(
      detailedExplanations
        ? "Coach: detailed explanations"
        : "Coach: quick mode"
    )

    // 🧠 only update explanation box BETWEEN hands
    if(gameOver){
      setReason(
        detailedExplanations
          ? "Detailed explanations ON"
          : "Quick explanations ON"
      )
    }

  })
}

const IMAGES = {
  correct: "images/corrextmove.png",
  wrong: "images/wrong.png",
  blackjack: "images/blackjackjackpot.png",
  playerBust: "images/dealerbust.png",
  dealerLaugh: "images/laughdealer.png",
  broke: "images/dealershrugemptytray.png"
}

if(homeBtn){
  homeBtn.onclick = () => {
    window.location.href = "index.html"
  }
}

if(trainerToggle){
  trainerToggle.addEventListener("change",()=>{
    trainerHintsEnabled=trainerToggle.checked
    trainerToggleText.textContent=trainerHintsEnabled ? "ON" : "OFF"

    if(!trainerHintsEnabled){
      hideStrategyPopup()
      setReason("Hints are OFF. Make your move first, then I’ll explain why it was right or wrong.")
    }else if(!gameOver && player.length>=2 && dealer.length>=1){
      maybeShowStrategy()
    }
  })
}

function showBubble(text,type="wrong"){
  resultBubble.textContent=text
  resultBubble.className=`result-bubble ${type}`
  resultBubble.classList.remove("hidden")
  resultBubble.classList.add("show")

  setTimeout(()=>{
    resultBubble.classList.add("hidden")
    resultBubble.classList.remove("show")
  },1200)
}

function showWrong(){
  showBubble("WRONG!","wrong")
}

function showCorrect(){
  showBubble("CORRECT!","correct")
}

function updateAccuracy(){
  let total=correctMoves+wrongMoves
  let acc=total?Math.round((correctMoves/total)*100):100
  correctMovesEl.textContent=correctMoves
  wrongMovesEl.textContent=wrongMoves
  accuracyEl.textContent=acc
}

function setMessage(t){
  messageEl.textContent=t
}

function setReason(text){
  reasonTextEl.innerHTML=text
}

function updateMoney(){
  bankrollEl.textContent=bankroll
  betEl.textContent=bet
}

function buildDeck(){
  const suits=["spades","hearts","diamonds","clubs"]
  const ranks=["A","02","03","04","05","06","07","08","09","10","J","Q","K"]
  deck=[]
  for(let s of suits){
    for(let r of ranks){
      deck.push({suit:s,rank:r})
    }
  }
}

function shuffle(){
  for(let i=deck.length-1;i>0;i--){
    let j=Math.floor(Math.random()*(i+1))
    ;[deck[i],deck[j]]=[deck[j],deck[i]]
  }
}

function draw(){
  return deck.pop()
}

function cardValue(r){
  if(r==="A") return 11
  if(["K","Q","J"].includes(r)) return 10
  return parseInt(r,10)
}

function handValue(h){
  let total=0
  let aces=0
  for(let c of h){
    total+=cardValue(c.rank)
    if(c.rank==="A") aces++
  }
  while(total>21 && aces){
    total-=10
    aces--
  }
  return total
}

function renderHand(hand,el,hideHole=false){
  el.innerHTML=""

  hand.forEach((c,i)=>{
    let img=document.createElement("img")
    img.className="card"
    img.alt = hideHole && i === 1 ? "Hidden dealer card" : `${c.rank} of ${c.suit}`

    if(hideHole && i===1){
      img.src="images/cards/card_back.png"
    }else{
      img.src=`images/cards/card_${c.suit}_${c.rank}.png`
    }
    img.onerror=()=>{
      if(img.dataset.fallbackApplied === "1") return
      img.dataset.fallbackApplied = "1"
      img.src="images/cards/card_back.png"
      img.alt="Card image unavailable"
    }

    img.style.animationDelay=`${i*.15}s`
    el.appendChild(img)
  })
}

function render(showDealer=false){
  renderHand(player,playerHandEl,false)
  renderHand(dealer,dealerHandEl,!showDealer)
  playerTotalEl.textContent=handValue(player)
  dealerTotalEl.textContent=showDealer ? handValue(dealer) : (dealer[0] ? cardValue(dealer[0].rank) : 0)
}

function updateButtons(){
  dealBtn.disabled=!gameOver
  hitBtn.disabled=gameOver
  standBtn.disabled=gameOver
  doubleBtn.disabled=gameOver || player.length!==2 || bankroll<bet
  splitBtn.disabled=gameOver || !isPair(player) || bankroll<bet
  clearBetBtn.disabled=!gameOver || bet===0
}

function playChipSound(){
  if(!chipSound) return
  chipSound.pause()
  chipSound.currentTime=0
  chipSound.play().catch(()=>{})
}

function getMoveClass(move){
  return move.toLowerCase()
}

function showStrategyPopup(move,text){
  if(!trainerHintsEnabled || hintDismissedForHand) return

  lastStrategyMove=move
  strategyMoveEl.textContent=move.toUpperCase()
  strategyMoveEl.className=`strategy-move ${getMoveClass(move)}`
  strategyTextEl.textContent=text
  strategyPopup.classList.remove("hidden")

  clearTimeout(strategyTimer)
}

function hideStrategyPopup(){
  strategyPopup.classList.add("hidden")
  clearTimeout(strategyTimer)
}

function normalizeRank(rank){
  if(["J","Q","K"].includes(rank)) return "10"
  if(rank==="A") return "A"
  return String(parseInt(rank,10))
}

function softValueInfo(hand){
  let total=0
  let aces=0

  for(const card of hand){
    total+=cardValue(card.rank)
    if(card.rank==="A") aces++
  }

  let usedAsEleven=false
  while(total>21 && aces>0){
    total-=10
    aces--
  }

  if(hand.some(card=>card.rank==="A") && total<=21){
    let alt=0
    let altAces=0
    for(const card of hand){
      if(card.rank==="A"){
        alt+=11
        altAces++
      }else{
        alt+=cardValue(card.rank)
      }
    }
    while(alt>21 && altAces>0){
      alt-=10
      altAces--
    }
    usedAsEleven = hand.some(card=>card.rank==="A") && altAces>0
  }

  return { total, isSoft: usedAsEleven }
}

function isSoftHand(hand){
  return softValueInfo(hand).isSoft
}

function isPair(hand){
  return hand.length===2 &&
    normalizeRank(hand[0].rank)===normalizeRank(hand[1].rank)
}

function getBasicStrategy(playerHand,dealerCard){
  const total=handValue(playerHand)
  const dealerUp=cardValue(dealerCard.rank)
  const soft=isSoftHand(playerHand)
  const pair=isPair(playerHand)

  if(pair){
    const pairRank=normalizeRank(playerHand[0].rank)

    if(pairRank==="A" || pairRank==="8") return "Split"
    if(pairRank==="10") return "Stand"
    if(pairRank==="9") return [2,3,4,5,6,8,9].includes(dealerUp) ? "Split" : "Stand"
    if(pairRank==="7") return dealerUp>=2 && dealerUp<=7 ? "Split" : "Hit"
    if(pairRank==="6") return dealerUp>=2 && dealerUp<=6 ? "Split" : "Hit"
    if(pairRank==="5") return dealerUp>=2 && dealerUp<=9 ? "Double" : "Hit"
    if(pairRank==="4") return (dealerUp===5 || dealerUp===6) ? "Split" : "Hit"
    if(pairRank==="3" || pairRank==="2") return dealerUp>=2 && dealerUp<=7 ? "Split" : "Hit"
  }

  if(soft){
    if(total===13 || total===14) return (dealerUp===5 || dealerUp===6) ? "Double" : "Hit"
    if(total===15 || total===16) return (dealerUp>=4 && dealerUp<=6) ? "Double" : "Hit"
    if(total===17) return (dealerUp>=3 && dealerUp<=6) ? "Double" : "Hit"

    if(total===18){
      if(dealerUp>=3 && dealerUp<=6) return "Double"
      if([2,7,8].includes(dealerUp)) return "Stand"
      return "Hit"
    }

    if(total>=19) return "Stand"
  }

  if(total<=8) return "Hit"
  if(total===9) return (dealerUp>=3 && dealerUp<=6) ? "Double" : "Hit"
  if(total===10) return (dealerUp>=2 && dealerUp<=9) ? "Double" : "Hit"
  if(total===11) return dealerUp===11 ? "Hit" : "Double"
  if(total===12) return (dealerUp>=4 && dealerUp<=6) ? "Stand" : "Hit"
  if(total>=13 && total<=16) return (dealerUp>=2 && dealerUp<=6) ? "Stand" : "Hit"
  return "Stand"
}


function getStrategyExplanation(playerHand,dealerCard){
  const move=getBasicStrategy(playerHand,dealerCard)
  const total=handValue(playerHand)
  const dealerUp=cardValue(dealerCard.rank)
  const dealerLabel=normalizeRank(dealerCard.rank)
  const soft=isSoftHand(playerHand)
  const pair=isPair(playerHand)

  let shortText=""
  let detailedText=""

  if(pair){
    const rank=normalizeRank(playerHand[0].rank)

    if(move==="Split"){
      if(rank==="A" || rank==="8"){
        shortText=`Always split ${rank}s`
        detailedText=`Always split ${rank}s. Playing them together gives you a weak hand. Splitting gives you a better chance to build stronger hands.`
      }else{
        shortText=`Split this pair`
        detailedText=`Splitting this pair gives you a better long-term chance than playing it as one awkward hand.`
      }
    }else if(move==="Stand"){
      shortText=`Stand on this pair`
      detailedText=`This pair is already strong enough as one hand. Splitting would usually make it worse.`
    }else if(move==="Double"){
      shortText=`Play it like a strong total`
      detailedText=`This pair plays better as a strong total here. Doubling gives more value than splitting.`
    }else{
      shortText=`Do not split here`
      detailedText=`This is not a good spot to split. You are better off trying to improve the hand normally.`
    }
  }

  else if(soft){
    if(move==="Double"){
      shortText=`Good spot to double`
      detailedText=`This is a good spot to double because soft hands are flexible. You can improve the hand without the same bust risk as a hard total.`
    }else if(move==="Stand"){
      shortText=`Stand here`
      detailedText=`Your hand is already strong enough here. There is no reason to force more action.`
    }else{
      shortText=`Hit and improve`
      detailedText=`Your hand is flexible, but not strong enough yet. Hitting gives you a good chance to improve it.`
    }
  }

  else{
    if(move==="Hit"){
      if(dealerUp >= 7 || dealerUp === 11){
        shortText=`Dealer strong → hit`
        detailedText=`Since the dealer has a strong card (${dealerLabel}), standing usually loses. You need to try to improve your hand. Hitting gives you a better chance to improve and win than standing and hoping the dealer messes up.`
      }else{
        shortText=`Too weak to stand`
        detailedText=`Your hand is too weak to stand on here, so the better play is to hit and try to improve it.`
      }
    }else if(move==="Stand"){
      if(dealerUp >= 2 && dealerUp <= 6){
        shortText=`Dealer weak → stand`
        detailedText=`Since the dealer has a weak card (${dealerLabel}), they are more likely to bust. The best move is to stand and let the dealer be the one who has to improve.`
      }else{
        shortText=`Strong enough to stand`
        detailedText=`Your hand is already strong enough. Hitting would add unnecessary bust risk.`
      }
    }else if(move==="Double"){
      shortText=`Strong spot to double`
      detailedText=`This is one of the better spots to double because you have a strong starting hand against a weaker dealer situation.`
    }else{
      shortText=`Split here`
      detailedText=`Splitting this hand creates a better long-term result than playing it as one total.`
    }
  }

  return {
    move,
    text: detailedExplanations ? detailedText : shortText
  }
}



function maybeShowStrategy(){
  if(gameOver) return
  if(player.length<2 || dealer.length<1) return

  const advice=getStrategyExplanation(player,dealer[0])


  hitBtn.classList.remove("correct-glow")
  standBtn.classList.remove("correct-glow")
  doubleBtn.classList.remove("correct-glow")
  splitBtn.classList.remove("correct-glow")

  if(trainerHintsEnabled){
    if(advice.move==="Hit") hitBtn.classList.add("correct-glow")
    if(advice.move==="Stand") standBtn.classList.add("correct-glow")
    if(advice.move==="Double") doubleBtn.classList.add("correct-glow")
    if(advice.move==="Split") splitBtn.classList.add("correct-glow")
  }

  showStrategyPopup(advice.move,advice.text)
}

function showImage(src){
  let img=document.createElement("img")
  img.src=src
  img.className="feedback-image"
  tableArea.appendChild(img)

  setTimeout(()=>img.remove(),2200)
}

function explainMove(action){
  if(!dealer[0] || player.length<2) return

  const advice=getStrategyExplanation(player,dealer[0])
  lastStrategyMove=advice.move

  if(action === advice.move){
    correctMoves++
    showCorrect()
    setReason(`✅ Correct. ${advice.text}`)
    showImage(IMAGES.correct)
  }else{
    wrongMoves++
    showWrong()
    setReason(`❌ ${action} was not the best move. The correct play is <strong>${advice.move}</strong>. ${advice.text}`)
    showImage(IMAGES.wrong)
  }

  updateAccuracy()
}
  
function addBet(a){
  if(!gameOver) return
  if(bankroll<a) return
  bankroll-=a
  bet+=a
  playChipSound()
  updateMoney()

  let chip=document.createElement("img")
  chip.src=`images/chips/chip-${a}.png`
  chip.alt=`$${a} bet chip`
  chip.className="bet-chip"
  chip.style.bottom=`${betSpot.children.length*4}px`
  chip.onerror=()=>{
    chip.remove()
    const textChip=document.createElement("span")
    textChip.className="bet-chip"
    textChip.textContent=`$${a}`
    textChip.style.width="34px"
    textChip.style.height="34px"
    textChip.style.display="inline-flex"
    textChip.style.alignItems="center"
    textChip.style.justifyContent="center"
    textChip.style.borderRadius="50%"
    textChip.style.background="#222"
    textChip.style.border="2px solid #f7d16c"
    textChip.style.color="#ffd54a"
    textChip.style.fontWeight="700"
    textChip.style.fontSize=".75rem"
    textChip.style.bottom=`${betSpot.children.length*4}px`
    betSpot.appendChild(textChip)
  }
  betSpot.appendChild(chip)
}

function clearBet(){
  bankroll+=bet
  bet=0
  betSpot.innerHTML=""
  updateMoney()
  updateButtons()
}

function deal(){
  hintDismissedForHand = false

  if(bankroll <= 0 && bet <= 0){
    setMessage("You are out of money.")
    setReason("Bankroll destroyed. The dealer now has an empty tray and your chips are extinct.")
    showImage(IMAGES.broke)
    return
  }

  if(bet <= 0){
    setMessage("Place bet")
    return
  }

  buildDeck()
  shuffle()
  player = [draw(), draw()]
  dealer = [draw(), draw()]
  gameOver = false

  render()
  updateButtons()
  setMessage("Your move")

  if(handValue(player) === 21){
    render(false)
    setReason("🎉 Blackjack. You hit 21 immediately, which is the dream before the casino remembers whose building this is.")
    showImage(IMAGES.blackjack)
  }else{
    setReason(trainerHintsEnabled
      ? "Hints are ON. The coach is showing the recommended move."
      : "Hints are OFF. Make your choice and I’ll explain it after.")
  }

  maybeShowStrategy()
}

  
function hit(){
  if(gameOver) return

  explainMove("Hit")
  player.push(draw())
  render()

if(handValue(player) > 21){
  bet = 0
  gameOver = true
  hideStrategyPopup()

  hitBtn.classList.remove("correct-glow")
  standBtn.classList.remove("correct-glow")
  doubleBtn.classList.remove("correct-glow")
  splitBtn.classList.remove("correct-glow")

  updateMoney()
  updateButtons()
 setMessage("Bust")
 setReason("💥 You busted. You went over 21, so the hand is dead.")
  showImage(IMAGES.playerBust)

  if(bankroll<=0){
    setTimeout(()=>{
      setMessage("Out of money")
      setReason("The bankroll has flatlined. Dealer’s got the empty tray look now.")
      showImage(IMAGES.broke)
    },700)
  }

  return
}

  if(handValue(player) === 21){
    setReason("You made 21. Now the dealer gets their turn.")
    stand(true)
    return
  }

  setMessage("Hit or stand?")
  maybeShowStrategy()
}


  function stand(fromAuto=false){
  if(gameOver) return

  if(!fromAuto){
    explainMove("Stand")
  }

  while(handValue(dealer) < 17){
    dealer.push(draw())
  }

  render(true)

  let pt = handValue(player)
  let dt = handValue(dealer)

  if(dt > 21){
    bankroll += bet * 2
    setMessage("Dealer busts. You win.")
    setReason("✅ Dealer busted by going over 21.")
    showImage(IMAGES.correct)
  }
  else if(pt > dt){
    bankroll += bet * 2
    setMessage("You win")
    setReason(`✅ Your ${pt} beat the dealer’s ${dt}.`)
    showImage(IMAGES.correct)
  }
  else if(pt === dt){
    bankroll += bet
    setMessage("Push")
    setReason(`🤝 Push. You and the dealer both finished with ${pt}, so your bet comes back.`)
  }
  else{
    setMessage("Dealer wins")
    setReason(`❌ Dealer ${dt} beats your ${pt}.`)
    showImage(IMAGES.dealerLaugh)
  }

  bet = 0
  gameOver = true

  hideStrategyPopup()

  hitBtn.classList.remove("correct-glow")
  standBtn.classList.remove("correct-glow")
  doubleBtn.classList.remove("correct-glow")
  splitBtn.classList.remove("correct-glow")

  updateMoney()
  updateButtons()

  if(bankroll<=0){
    setTimeout(()=>{
      setMessage("Out of money")
      setReason("💸 Bankroll wiped out. The dealer shrugging at an empty tray feels about right.")
      showImage(IMAGES.broke)
    },700)
  }
}
function doubleDown(){
  if(gameOver) return

  explainMove("Double")

  if(bankroll < bet){
    setMessage("Not enough bankroll to double.")
    return
  }

  bankroll -= bet
  bet *= 2
  player.push(draw())
  render()

  if(handValue(player) > 21){
    bet = 0
    gameOver = true
    hideStrategyPopup()
     hitBtn.classList.remove("correct-glow")
  standBtn.classList.remove("correct-glow")
  doubleBtn.classList.remove("correct-glow")
  splitBtn.classList.remove("correct-glow")
    updateMoney()
    updateButtons()
    setMessage("Bust after double")
    setReason("💥 You doubled and busted. Aggressive, educational, and financially unfortunate.")
    showImage(IMAGES.playerBust)

    if(bankroll<=0){
      setTimeout(()=>{
        setMessage("Out of money")
        setReason("The bankroll has flatlined. Dealer’s got the empty tray look now.")
        showImage(IMAGES.broke)
      },1200)
    }
    return
  }

  stand(true)
}

function splitHand(){
  if(gameOver) return
  if(!isPair(player)){
    setMessage("Split only works on pairs.")
    return
  }
  if(bankroll < bet){
    setMessage("Not enough bankroll to split.")
    return
  }

  explainMove("Split")
  bankroll -= bet
  bet *= 2
  player = [player[0], draw(), player[1], draw()]
  render()
  updateMoney()
  updateButtons()
  setMessage("Split trainer mode active")
  setReason("Split dealt one extra card to each split hand. Continue practicing with Hit / Stand.")
  maybeShowStrategy()
}

function resetGame(){
  deck=[]
  player=[]
  dealer=[]
  bankroll=1000
  bet=0
  gameOver=true
  hideStrategyPopup()
  betSpot.innerHTML=""
  setMessage("New game started. Place a bet.")
  setReason("Bankroll reset to $1000. Place your chips and press Deal.")
  updateMoney()
  updateButtons()
  render()
}

function initChipImageFallbacks(){
  document.querySelectorAll("#chipsRow .chip").forEach((chipImg)=>{
    chipImg.onerror=()=>{
      const amount = chipImg.dataset.amount || "?"
      const fallbackBtn = document.createElement("button")
      fallbackBtn.type = "button"
      fallbackBtn.className = "chip chip-fallback"
      fallbackBtn.dataset.amount = amount
      fallbackBtn.textContent = `$${amount}`
      chipImg.replaceWith(fallbackBtn)
    }
  })
}

if(chipsRow){
  chipsRow.addEventListener("click",(e)=>{
    const chip=e.target.closest(".chip")
    if(!chip) return

    const amount=Number(chip.dataset.amount)
    if(!Number.isFinite(amount)) return

    addBet(amount)
  })
}

dealBtn.onclick=deal
hitBtn.onclick=hit
standBtn.onclick=stand
doubleBtn.onclick=doubleDown
splitBtn.onclick=splitHand
clearBetBtn.onclick=clearBet
if(resetBtn){
  resetBtn.onclick=resetGame
}

initChipImageFallbacks()
updateMoney()
updateButtons()
render()
