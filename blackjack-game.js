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
let splitModeActive=false
let handHadCorrectDecision=false
let losingStreak=0
let lastHandNet=0
let lastSettledBet=0
let recentBetActions=[]
  
const bankrollEl=document.getElementById("bankroll")
const betEl=document.getElementById("bet")
const dealerHandEl=document.getElementById("dealer-hand")
const playerHandEl=document.getElementById("player-hand")
const dealerTotalEl=document.getElementById("dealer-total")
const playerTotalEl=document.getElementById("player-total")
const messageEl=document.getElementById("message")
const soundToggle=document.getElementById("soundToggle")
const soundToggleText=document.getElementById("soundToggleText")
const voiceToggle=document.getElementById("voiceToggle")
const voiceToggleText=document.getElementById("voiceToggleText")
  
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
const explainToggleText = document.getElementById("explainToggleText")
  
if(explainToggle){
  explainToggle.addEventListener("change",()=>{
    playButtonSound()

    // update mode
    detailedExplanations = explainToggle.checked
    if(explainToggleText){
      explainToggleText.textContent = detailedExplanations ? "ON" : "OFF"
    }

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


const blackjackAudio = {
  enabled: localStorage.getItem("blackjackSoundMuted") !== "true",
  voiceEnabled: localStorage.getItem("blackjackVoiceMuted") !== "true",
  unlocked: false,
  firstVoicePlayed: false,
  activeVoice: null,
  lastVoiceAt: 0,
  voiceCooldownMs: 8500,
  voiceCategoryCooldowns: {},
  clips: {
    chip: { src: "sounds/chips/placing-poker-chips.mp3", volume: 0.25 },
    click: { src: "sounds/chips/chip-click.mp3", volume: 0.18 },
    deal: { src: "sounds/cards/card_slide.mp3", volume: 0.22 },
    flip: { src: "sounds/cards/card_slide.mp3", volume: 0.22 },
    shuffle: { src: "sounds/cards/cards-being-shuffled.mp3", volume: 0.16 },
    win: { src: "sounds/ui/subtle-win.mp3", volume: 0.22 },
    fail: { src: "sounds/ui/subtle-fail.mp3", volume: 0.20 },
    lose: { src: "sounds/ui/lose.mp3", volume: 0.18 }
  },
  voices: {
    blackjack: { src: "sounds/voices/blackjack.mp3", volume: 0.26 },
    cardsInTheAir: { src: "sounds/voices/cards-in-th-air.mp3", volume: 0.24 },
    dealerBusts: { src: "sounds/voices/dealer-busts.mp3", volume: 0.26 },
    houseWin: { src: "sounds/voices/house-win.mp3", volume: 0.24 },
    interestingDecision: { src: "sounds/voices/interstng-decision.mp3", volume: 0.24 },
    placeBets: { src: "sounds/voices/place-bets.mp3", volume: 0.22 },
    push: { src: "sounds/voices/push.mp3", volume: 0.24 },
    questionableStats: { src: "sounds/voices/statis-questionbl.mp3", volume: 0.23 },
    mathApproves: { src: "sounds/voices/the-math-approves.mp3", volume: 0.24 },
    varianceUndefeated: { src: "sounds/voices/varianc-remains-undefeat.mp3", volume: 0.24 },
    emotionallyInvested: { src: "sounds/voices/you-appear-emotinally-invested.mp3", volume: 0.23 }
  },
  init(){
    Object.keys(this.clips).forEach((name)=>{
      const clip = this.clips[name]
      const audio = new Audio(clip.src)
      audio.preload = "auto"
      audio.volume = clip.volume
      clip.audio = audio
    })
    this.updateToggle()
    this.updateVoiceToggle()
  },
  unlock(){
    this.unlocked = true
  },
  setEnabled(enabled){
    this.enabled = enabled
    localStorage.setItem("blackjackSoundMuted", enabled ? "false" : "true")
    if(!enabled) this.stopVoice()
    this.updateToggle()
    this.updateVoiceToggle()
  },
  setVoiceEnabled(enabled){
    this.voiceEnabled = enabled
    localStorage.setItem("blackjackVoiceMuted", enabled ? "false" : "true")
    if(!enabled) this.stopVoice()
    this.updateVoiceToggle()
  },
  toggle(){
    this.unlock()
    this.setEnabled(!this.enabled)
    if(this.enabled){
      this.play("click")
    }
  },
  toggleVoice(){
    this.unlock()
    this.setVoiceEnabled(!this.voiceEnabled)
    if(this.enabled){
      this.play("click")
    }
  },
  updateToggle(){
    if(soundToggle){
      soundToggle.setAttribute("aria-pressed", this.enabled ? "true" : "false")
      soundToggle.setAttribute("aria-label", this.enabled ? "Sound on" : "Sound off")
    }
    if(soundToggleText){
      soundToggleText.textContent = this.enabled ? "ON" : "OFF"
    }
  },
  updateVoiceToggle(){
    const effectiveVoiceOn = this.enabled && this.voiceEnabled
    if(voiceToggle){
      voiceToggle.setAttribute("aria-pressed", effectiveVoiceOn ? "true" : "false")
      voiceToggle.setAttribute("aria-label", effectiveVoiceOn ? "Dealer voice on" : "Dealer voice off")
      voiceToggle.disabled = !this.enabled
    }
    if(voiceToggleText){
      voiceToggleText.textContent = effectiveVoiceOn ? "ON" : "OFF"
    }
  },
  play(name){
    if(!this.enabled || !this.unlocked) return
    const clip = this.clips[name]
    if(!clip || !clip.audio) return
    try{
      clip.audio.pause()
      clip.audio.currentTime = 0
      clip.audio.volume = clip.volume
      clip.audio.play().catch(()=>{})
    }catch(error){}
  },
  getVoice(name){
    const clip = this.voices[name]
    if(!clip) return null
    if(!clip.audio){
      const audio = new Audio(clip.src)
      audio.preload = "none"
      audio.volume = clip.volume
      audio.addEventListener("error",()=>{ clip.failed = true },{ once:true })
      clip.audio = audio
    }
    return clip
  },
  canPlayVoice(category, cooldownMs){
    const now = Date.now()
    if(now - this.lastVoiceAt < this.voiceCooldownMs) return false
    if(category && now - (this.voiceCategoryCooldowns[category] || 0) < cooldownMs) return false
    if(this.activeVoice && !this.activeVoice.paused && !this.activeVoice.ended) return false
    return true
  },
  playVoice(name, options={}){
    if(!this.enabled || !this.voiceEnabled || !this.unlocked) return false
    const chance = options.chance ?? 1
    if(Math.random() > chance) return false
    const category = options.category || name
    const cooldownMs = options.cooldownMs ?? 18000
    if(!this.canPlayVoice(category, cooldownMs)) return false
    const clip = this.getVoice(name)
    if(!clip || clip.failed || !clip.audio) return false
    try{
      this.stopVoice()
      clip.audio.currentTime = 0
      clip.audio.volume = clip.volume
      this.activeVoice = clip.audio
      this.lastVoiceAt = Date.now()
      this.voiceCategoryCooldowns[category] = this.lastVoiceAt
      clip.audio.play().catch(()=>{})
      return true
    }catch(error){
      return false
    }
  },
  playRandomVoice(names, options={}){
    if(!Array.isArray(names) || names.length===0) return false
    const name = names[Math.floor(Math.random()*names.length)]
    return this.playVoice(name, options)
  },
  stopVoice(){
    if(!this.activeVoice) return
    try{
      this.activeVoice.pause()
      this.activeVoice.currentTime = 0
    }catch(error){}
    this.activeVoice = null
  },
  playBlackjack(){
    if(this.playVoice("blackjack", { category: "blackjack", cooldownMs: 20000 })){
      this.firstVoicePlayed = true
    }
    window.setTimeout(()=>this.play("win"), 170)
  }
}

blackjackAudio.init()

document.addEventListener("pointerdown",()=>blackjackAudio.unlock(),{ once:true })
document.addEventListener("keydown",()=>blackjackAudio.unlock(),{ once:true })

if(soundToggle){
  soundToggle.addEventListener("click",()=>blackjackAudio.toggle())
}

if(voiceToggle){
  voiceToggle.addEventListener("click",()=>blackjackAudio.toggleVoice())
}

const IMAGES = {
  correct: "images/corrextmove.png",
  wrong: "images/wrong.png",
  blackjack: "images/blackjackjackpot.png",
  playerBust: "images/dealerbust.png",
  dealerLaugh: "images/laughdealer.png",
  broke: "images/dealershrugemptytray.png"
}

function dealerVoice(name, options={}){
  return blackjackAudio.playVoice(name, options)
}

function dealerVoiceRandom(names, options={}){
  return blackjackAudio.playRandomVoice(names, options)
}

function maybeDealerWelcome(){
  if(blackjackAudio.firstVoicePlayed) return
  if(dealerVoice("blackjack", { category: "intro", cooldownMs: 45000 })){
    blackjackAudio.firstVoicePlayed = true
  }
}

function maybeBetVoice(amount){
  const now = Date.now()
  recentBetActions = recentBetActions.filter((time)=>now-time<5000)
  recentBetActions.push(now)

  if(lastHandNet < 0 && recentBetActions.length >= 3 && amount >= 25 && amount >= lastSettledBet){
    dealerVoice("emotionallyInvested", { category: "tilt", cooldownMs: 65000, chance: 0.35 })
    return
  }

  dealerVoice("placeBets", { category: "betting", cooldownMs: 24000, chance: 0.22 })
}

function isRecklessMove(action){
  const total = handValue(player)
  const hardTotal = !isSoftHand(player)
  if(action === "Hit" && hardTotal && total >= 17) return true
  if(action === "Double" && (total <= 8 || total >= 17)) return true
  return false
}

function isDramaticHit(){
  const total = handValue(player)
  return total >= 15 && total < 21
}

function reactToStrategyDecision(action, advice){
  if(action === advice.move){
    handHadCorrectDecision = true
    if(["Double", "Split"].includes(action)){
      dealerVoiceRandom(["mathApproves", "interestingDecision"], { category: "smart-move", cooldownMs: 26000, chance: 0.42 })
    }else if(action === "Stand" && handValue(player) >= 17){
      dealerVoice("mathApproves", { category: "smart-move", cooldownMs: 30000, chance: 0.26 })
    }else{
      dealerVoice("mathApproves", { category: "smart-move", cooldownMs: 30000, chance: 0.16 })
    }
    return
  }

  if(isRecklessMove(action)){
    dealerVoice("questionableStats", { category: "questionable", cooldownMs: 36000, chance: 0.45 })
    return
  }

  dealerVoice("interestingDecision", { category: "interesting", cooldownMs: 30000, chance: 0.28 })
}

function handleHandSettled(netChange, outcome, context={}){
  lastHandNet = netChange
  lastSettledBet = context.betAmount || 0
  losingStreak = netChange < 0 ? losingStreak + 1 : 0

  if(outcome === "dealer-bust"){
    dealerVoice("dealerBusts", { category: "result", cooldownMs: 18000, chance: 0.82 })
    return
  }

  if(outcome === "push"){
    dealerVoice("push", { category: "result", cooldownMs: 18000, chance: 0.72 })
    return
  }

  if(outcome === "loss"){
    const dealerMiracle = context.dealerTotal >= 20 && context.playerTotal >= 17
    if((handHadCorrectDecision && dealerMiracle) || losingStreak >= 3){
      dealerVoice("varianceUndefeated", { category: "bad-beat", cooldownMs: 52000, chance: 0.48 })
    }else if(context.betAmount >= 100 || losingStreak >= 2){
      dealerVoice("houseWin", { category: "house-win", cooldownMs: 30000, chance: 0.46 })
    }
    return
  }

  if(outcome === "win" && handHadCorrectDecision){
    dealerVoice("mathApproves", { category: "smart-result", cooldownMs: 32000, chance: 0.26 })
  }
}

if(homeBtn){
  homeBtn.onclick = () => {
    window.location.href = "index.html"
  }
}

if(trainerToggle){
  trainerToggle.addEventListener("change",()=>{
    playButtonSound()
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
      img.classList.add("card-back")
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
  blackjackAudio.play("chip")
}

function playButtonSound(){
  blackjackAudio.play("click")
}

function playDealSound(){
  blackjackAudio.play("deal")
}

function playFlipSound(){
  blackjackAudio.play("flip")
}

function playShuffleSound(){
  blackjackAudio.play("shuffle")
}

function playWinSound(){
  blackjackAudio.play("win")
}

function playFailSound(){
  blackjackAudio.play("fail")
}

function playLoseSound(){
  blackjackAudio.play("lose")
}

function playBlackjackSound(){
  blackjackAudio.playBlackjack()
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

  reactToStrategyDecision(action, advice)

  if(action === advice.move){
    correctMoves++
    showCorrect()
    playWinSound()
    setReason(`✅ Correct. ${advice.text}`)
    showImage(IMAGES.correct)
  }else{
    wrongMoves++
    showWrong()
    playFailSound()
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
  maybeBetVoice(a)
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
  playButtonSound()
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

  maybeDealerWelcome()
  if(!blackjackAudio.firstVoicePlayed){
    dealerVoice("placeBets", { category: "betting", cooldownMs: 24000, chance: 0.28 })
  }
  handHadCorrectDecision=false
  playShuffleSound()
  buildDeck()
  shuffle()
  splitModeActive=false
  player = [draw(), draw()]
  dealer = [draw(), draw()]
  gameOver = false

  render()
  playDealSound()
  updateButtons()
  setMessage("Your move")

  if(handValue(player) === 21){
    render(false)
    setReason("🎉 Blackjack. You hit 21 immediately, which is the dream before the casino remembers whose building this is.")
    playBlackjackSound()
    dealerVoice("cardsInTheAir", { category: "big-card", cooldownMs: 26000, chance: 0.38 })
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
  if(isDramaticHit()){
    dealerVoice("cardsInTheAir", { category: "big-card", cooldownMs: 28000, chance: 0.28 })
  }
  player.push(draw())
  playDealSound()
  render()

if(handValue(player) > 21){
  const resolvedBet = bet
  splitModeActive=false
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
  playLoseSound()
  handleHandSettled(-resolvedBet, "loss", { betAmount: resolvedBet, playerTotal: handValue(player), dealerTotal: handValue(dealer) })

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

  playFlipSound()
  render(true)

  const settledBet = bet
  let pt = handValue(player)
  let dt = handValue(dealer)

  if(splitModeActive && player.length >= 4){
    const splitHands = [player.slice(0,2), player.slice(2,4)]
    const perHandBet = bet / splitHands.length
    const messages = []
    let splitWins = 0
    let splitPushes = 0

    splitHands.forEach((singleHand, index)=>{
      const handTotal = handValue(singleHand)

      if(handTotal > 21){
        messages.push(`Hand ${index+1}: busted with ${handTotal}.`)
        return
      }

      if(dt > 21){
        bankroll += perHandBet * 2
        splitWins++
        messages.push(`Hand ${index+1}: ${handTotal} beat the dealer’s ${dt}.`)
      }
      else if(handTotal > dt){
        bankroll += perHandBet * 2
        splitWins++
        messages.push(`Hand ${index+1}: ${handTotal} beat the dealer’s ${dt}.`)
      }
      else if(handTotal === dt){
        bankroll += perHandBet
        splitPushes++
        messages.push(`Hand ${index+1}: ${handTotal} pushed with the dealer’s ${dt}.`)
      }
      else{
        messages.push(`Hand ${index+1}: ${handTotal} lost to the dealer’s ${dt}.`)
      }
    })

    if(splitWins === splitHands.length){
      setMessage("Both split hands win")
      playWinSound()
      showImage(IMAGES.correct)
    }else if(splitWins > 0 || splitPushes > 0){
      setMessage("Split hand results")
      playWinSound()
    }else{
      setMessage("Dealer wins")
      playLoseSound()
      showImage(IMAGES.dealerLaugh)
    }

    setReason(`✅ ${messages.join(" ")}`)
    const splitNet = (splitWins * perHandBet * 2) + (splitPushes * perHandBet) - settledBet
    const splitOutcome = dt > 21 ? "dealer-bust" : (splitNet > 0 ? "win" : (splitNet === 0 ? "push" : "loss"))
    handleHandSettled(splitNet, splitOutcome, { betAmount: settledBet, playerTotal: pt, dealerTotal: dt })
  }
  else if(dt > 21){
    bankroll += bet * 2
    setMessage("Dealer busts. You win.")
    setReason("✅ Dealer busted by going over 21.")
    playWinSound()
    showImage(IMAGES.correct)
    handleHandSettled(settledBet, "dealer-bust", { betAmount: settledBet, playerTotal: pt, dealerTotal: dt })
  }
  else if(pt > dt){
    bankroll += bet * 2
    setMessage("You win")
    setReason(`✅ Your ${pt} beat the dealer’s ${dt}.`)
    playWinSound()
    showImage(IMAGES.correct)
    handleHandSettled(settledBet, "win", { betAmount: settledBet, playerTotal: pt, dealerTotal: dt })
  }
  else if(pt === dt){
    bankroll += bet
    setMessage("Push")
    setReason(`🤝 Push. You and the dealer both finished with ${pt}, so your bet comes back.`)
    handleHandSettled(0, "push", { betAmount: settledBet, playerTotal: pt, dealerTotal: dt })
  }
  else{
    setMessage("Dealer wins")
    setReason(`❌ Dealer ${dt} beats your ${pt}.`)
    playLoseSound()
    showImage(IMAGES.dealerLaugh)
    handleHandSettled(-settledBet, "loss", { betAmount: settledBet, playerTotal: pt, dealerTotal: dt })
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
  dealerVoice("interestingDecision", { category: "interesting", cooldownMs: 30000, chance: 0.25 })

  if(bankroll < bet){
    setMessage("Not enough bankroll to double.")
    return
  }

  bankroll -= bet
  bet *= 2
  playChipSound()
  player.push(draw())
  playDealSound()
  render()

  if(handValue(player) > 21){
    const resolvedBet = bet
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
    playLoseSound()
    showImage(IMAGES.playerBust)
    handleHandSettled(-resolvedBet, "loss", { betAmount: resolvedBet, playerTotal: handValue(player), dealerTotal: handValue(dealer) })

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
  dealerVoiceRandom(["cardsInTheAir", "interestingDecision"], { category: "split", cooldownMs: 30000, chance: 0.46 })
  bankroll -= bet
  bet *= 2
  playChipSound()
  player = [player[0], draw(), player[1], draw()]
  playDealSound()
  splitModeActive=true
  render()
  updateMoney()
  updateButtons()
  setMessage("Split trainer mode active")
  setReason("Split dealt one extra card to each split hand. Continue practicing with Hit / Stand.")
  maybeShowStrategy()
}

function resetGame(){
  playShuffleSound()
  deck=[]
  player=[]
  dealer=[]
  splitModeActive=false
  handHadCorrectDecision=false
  losingStreak=0
  lastHandNet=0
  lastSettledBet=0
  recentBetActions=[]
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
