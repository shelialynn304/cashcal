const quizQuestions = [
  {
    question: 'You win $400 early. What happens next?',
    answers: [
      { type: 'chaser', text: 'Great. Now I can win back what I lost last time.' },
      { type: 'grinder', text: 'Nice. I’ll lower my bet and play for six more hours.' },
      { type: 'hunter', text: 'Beautiful. Now we press. The machine is awake.' },
      { type: 'strategist', text: 'Lock part of it up, keep playing within the plan.' },
      { type: 'chaos', text: 'I don’t know, but I’m suddenly at a different machine.' }
    ]
  },
  {
    question: 'You lose half your bankroll in 20 minutes. What do you do?',
    answers: [
      { type: 'chaser', text: 'Reload. The comeback arc starts now.' },
      { type: 'grinder', text: 'Drop to tiny bets and slowly dissolve.' },
      { type: 'hunter', text: 'One big hit fixes this.' },
      { type: 'strategist', text: 'Stop or reduce risk. The session plan exists for a reason.' },
      { type: 'chaos', text: 'Switch games. Obviously the vibes are cursed.' }
    ]
  },
  {
    question: 'Pick your casino superpower.',
    answers: [
      { type: 'chaser', text: 'Refusing to leave down.' },
      { type: 'grinder', text: 'Turning $100 into seven hours of emotional fog.' },
      { type: 'hunter', text: 'Finding the highest-volatility thing in the building.' },
      { type: 'strategist', text: 'Making better decisions than the person next to me.' },
      { type: 'chaos', text: 'Being absolutely incorrect with confidence.' }
    ]
  },
  {
    question: 'What sentence sounds most like you?',
    answers: [
      { type: 'chaser', text: 'I just need to get even.' },
      { type: 'grinder', text: 'I’m only betting a little.' },
      { type: 'hunter', text: 'This one could hit huge.' },
      { type: 'strategist', text: 'What’s the house edge?' },
      { type: 'chaos', text: 'This machine looked at me funny. I trust it.' }
    ]
  },
  {
    question: 'What ruins a session fastest?',
    answers: [
      { type: 'chaser', text: 'Leaving right before the comeback.' },
      { type: 'grinder', text: 'Running out of time before I get my bonus.' },
      { type: 'hunter', text: 'Playing boring low-risk games.' },
      { type: 'strategist', text: 'Bad decisions and sloppy bankroll management.' },
      { type: 'chaos', text: 'Rules, plans, math, and other personal attacks.' }
    ]
  },
  {
    question: 'How do you pick bet size?',
    answers: [
      { type: 'chaser', text: 'Based on how mad I am.' },
      { type: 'grinder', text: 'Small enough to survive until my soul leaves.' },
      { type: 'hunter', text: 'Big enough to feel alive.' },
      { type: 'strategist', text: 'Bankroll, edge, volatility, and session length.' },
      { type: 'chaos', text: 'Whatever number feels haunted.' }
    ]
  },
  {
    question: 'You hit a bonus round. Your brain says:',
    answers: [
      { type: 'chaser', text: 'This better fix everything.' },
      { type: 'grinder', text: 'Please give me at least enough to keep playing.' },
      { type: 'hunter', text: 'MAX WIN. I DESERVE THE FIREWORKS.' },
      { type: 'strategist', text: 'Good variance. Don’t confuse it with skill.' },
      { type: 'chaos', text: 'I knew my gas station coffee was lucky.' }
    ]
  },
  {
    question: 'Which tool would you actually use?',
    answers: [
      { type: 'chaser', text: 'Something that tells me when I’m about to torch the bankroll.' },
      { type: 'grinder', text: 'Something that shows how tiny bets still bleed over time.' },
      { type: 'hunter', text: 'Something that shows big swings and jackpot risk.' },
      { type: 'strategist', text: 'Trainer, EV calculator, and strategy charts.' },
      { type: 'chaos', text: 'A wheel, a dice roll, and maybe an exorcist.' }
    ]
  },
  {
    question: 'When do you walk away?',
    answers: [
      { type: 'chaser', text: 'When I’m even. Or dead. Whichever first.' },
      { type: 'grinder', text: 'When the casino closes or my phone dies.' },
      { type: 'hunter', text: 'After the big hit. Unless I think there’s another one.' },
      { type: 'strategist', text: 'At my preset win/loss/time limit.' },
      { type: 'chaos', text: 'Walk away from what? I just found a new game.' }
    ]
  },
  {
    question: 'Your biggest gambling weakness is probably:',
    answers: [
      { type: 'chaser', text: 'Emotional revenge betting.' },
      { type: 'grinder', text: 'Confusing long playtime with winning.' },
      { type: 'hunter', text: 'Chasing massive upside and ignoring the crash.' },
      { type: 'strategist', text: 'Thinking good decisions eliminate risk.' },
      { type: 'chaos', text: 'Everything. But with charisma.' }
    ]
  }
];

const resultData = {
  chaser: {
    name: 'The Chaser',
    image: 'images/quiz/chaser.webp',
    headline: 'You don’t hate losing. You hate stopping while losing.',
    description: 'You turn a bad session into a revenge mission. The danger is that every loss starts feeling like a temporary inconvenience before the legendary comeback.',
    riskLeak: 'Tilt, reloads, doubling bets, and trying to emotionally negotiate with math.',
    playSmarter: 'Set a stop-loss before you start. If you win, pocket part of it immediately. Your bankroll is not a hostage rescue operation.',
    links: [
      { label: 'Blackjack Bankroll Calculator', href: 'blackjack-bankroll-calculator.html' },
      { label: 'EV Calculator', href: 'blackjack-ev-calculator.html' },
      { label: 'Responsible Gambling', href: 'responsible-gambling.html' }
    ]
  },
  grinder: {
    name: 'The Grinder',
    image: 'images/quiz/grinder.webp',
    headline: 'You don’t lose fast. You lose forever.',
    description: 'You stretch sessions with tiny bets and call it discipline. Sometimes it is. Sometimes it is just a very slow donation with free carpet smells.',
    riskLeak: 'Underestimating cumulative loss, time-on-device, and slow bankroll bleed.',
    playSmarter: 'Track total spins, not just bet size. Tiny bets still add up when you run them through the machine long enough to qualify for a pension.',
    links: [
      { label: 'Slot Simulator', href: 'slot-simulator.html' },
      { label: 'Bankroll Calculator', href: 'blackjack-bankroll-calculator.html' },
      { label: 'RTP Guide', href: 'slot-rtp-explained.html' }
    ]
  },
  hunter: {
    name: 'The Heater Hunter',
    image: 'images/quiz/hunter.webp',
    headline: 'You came for the lightning strike.',
    description: 'You love volatility, big hits, and the feeling that tonight could become a story. Big wins can happen. The problem is surviving the swings and not feeding the win back.',
    riskLeak: 'High variance, oversized bets, jackpot chasing, and pressing too hard after wins.',
    playSmarter: 'Decide your win-lock rule before the first spin. If you hit big, protect part of it like it owes you child support.',
    links: [
      { label: 'Slot Simulator', href: 'slot-simulator.html' },
      { label: 'Roulette Calculator', href: 'roulette-calculator.html' },
      { label: 'Bankroll Calculator', href: 'blackjack-bankroll-calculator.html' }
    ]
  },
  strategist: {
    name: 'The Strategist',
    image: 'images/quiz/strategist.webp',
    headline: 'You can’t control the cards. You can control the damage.',
    description: 'You like games where decisions matter. You care about odds, strategy, and reducing mistakes. Good. Just don’t confuse better decisions with guaranteed profit.',
    riskLeak: 'Overconfidence, analysis paralysis, and forgetting variance can still punch you in the mouth.',
    playSmarter: 'Use strategy to reduce mistakes. Use bankroll rules to survive variance. The goal is not magic. The goal is fewer stupid losses.',
    links: [
      { label: 'Blackjack Trainer', href: 'blackjack-game.html' },
      { label: 'Blackjack Strategy Guide', href: 'blackjack-strategy.html' },
      { label: 'EV Calculator', href: 'blackjack-ev-calculator.html' }
    ]
  },
  chaos: {
    name: 'The Chaos Goblin',
    image: 'images/quiz/chaos.webp',
    headline: 'No strategy. Only vibes.',
    description: 'You are pure casino weather. You switch games, trust random feelings, and somehow turn a $12 win into a full financial side quest.',
    riskLeak: 'Random bet sizing, superstition, game hopping, and calling chaos a system.',
    playSmarter: 'Give yourself a hard budget and a time limit. You can still chase vibes. Just put the vibes in a cage first.',
    links: [
      { label: 'Gambler Personality Quiz', href: 'gambler-personality-quiz.html' },
      { label: 'Bankroll Calculator', href: 'blackjack-bankroll-calculator.html' },
      { label: 'Roulette Guide', href: 'roulette.html' },
      { label: 'Responsible Gambling', href: 'responsible-gambling.html' }
    ]
  }
};

const tiePriority = ['chaser', 'hunter', 'chaos', 'grinder', 'strategist'];
const initialScores = { chaser: 0, grinder: 0, hunter: 0, strategist: 0, chaos: 0 };

let currentQuestion = 0;
let scores = { ...initialScores };

const quizCard = document.getElementById('quiz-card');
const quizResult = document.getElementById('quiz-result');
const quizTitle = document.getElementById('quiz-title');
const quizOptions = document.getElementById('quiz-options');
const progressText = document.getElementById('quiz-progress-text');
const progressPercent = document.getElementById('quiz-progress-percent');
const progressBar = document.getElementById('quiz-progress-bar');

function updateProgress() {
  const questionNumber = Math.min(currentQuestion + 1, quizQuestions.length);
  const percent = Math.round((questionNumber / quizQuestions.length) * 100);

  progressText.textContent = `Question ${questionNumber} of ${quizQuestions.length}`;
  progressPercent.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
}

function renderQuestion() {
  const question = quizQuestions[currentQuestion];

  updateProgress();
  quizTitle.textContent = question.question;
  quizOptions.innerHTML = '';

  question.answers.forEach((answer) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quiz-answer';
    button.textContent = answer.text;
    button.addEventListener('click', () => selectAnswer(answer.type));
    quizOptions.appendChild(button);
  });
}

function selectAnswer(type) {
  scores[type] += 1;
  currentQuestion += 1;

  if (currentQuestion >= quizQuestions.length) {
    showResult(getWinningType());
    return;
  }

  renderQuestion();
}

function getWinningType() {
  const highScore = Math.max(...Object.values(scores));
  return tiePriority.find((type) => scores[type] === highScore);
}

function createToolLinks(links) {
  return links.map((link) => `<a class="btn btn-secondary" href="${link.href}">${link.label}</a>`).join('');
}

function showResult(type, updateUrl = true) {
  const result = resultData[type];
  const shareUrl = `${window.location.origin}${window.location.pathname}?result=${type}`;

  quizCard.hidden = true;
  quizResult.hidden = false;
  quizResult.innerHTML = `
    <div class="quiz-result-layout">
      <div class="quiz-result-copy">
        <span class="eyebrow">Your casino personality</span>
        <h2>${result.name}</h2>
        <h3>${result.headline}</h3>
        <p>${result.description}</p>
      </div>
      <img class="quiz-result-image" src="${result.image}" alt="${result.name} gambling personality result" loading="eager" decoding="async" />
    </div>
    <div class="quiz-result-grid">
      <div class="result-item">
        <span>Biggest risk leak</span>
        <strong>${result.riskLeak}</strong>
      </div>
      <div class="result-item">
        <span>How to play smarter without killing the fun</span>
        <strong>${result.playSmarter}</strong>
      </div>
    </div>
    <div class="quiz-tool-block">
      <h3>Recommended tools</h3>
      <div class="quiz-tool-links">${createToolLinks(result.links)}</div>
    </div>
    <p class="quiz-responsible-note">This quiz is entertainment and education, not a diagnosis. If gambling stops being fun, starts causing financial stress, or feels hard to stop, take a break and use responsible gambling resources.</p>
    <div class="quiz-result-actions">
      <button type="button" class="btn btn-primary" id="retake-quiz">Retake quiz</button>
      <button type="button" class="btn btn-secondary" id="share-result" data-share-url="${shareUrl}">Copy result link</button>
    </div>
    <p class="small-note" id="share-status" aria-live="polite"></p>
  `;

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set('result', type);
    window.history.replaceState({}, '', url);
  }

  document.getElementById('retake-quiz').addEventListener('click', resetQuiz);
  document.getElementById('share-result').addEventListener('click', copyResultLink);
  quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyResultLink(event) {
  const shareStatus = document.getElementById('share-status');
  const shareUrl = event.currentTarget.dataset.shareUrl;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      shareStatus.textContent = 'Copied. Send it to someone who needs emotional damage with citations.';
    }).catch(() => {
      shareStatus.textContent = shareUrl;
    });
    return;
  }

  shareStatus.textContent = shareUrl;
}

function resetQuiz() {
  currentQuestion = 0;
  scores = { ...initialScores };
  quizCard.hidden = false;
  quizResult.hidden = true;
  quizResult.innerHTML = '';

  const url = new URL(window.location.href);
  url.searchParams.delete('result');
  window.history.replaceState({}, '', url);

  renderQuestion();
  quizCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initQuiz() {
  const resultParam = new URLSearchParams(window.location.search).get('result');

  if (resultParam && resultData[resultParam]) {
    showResult(resultParam, false);
    return;
  }

  renderQuestion();
}

initQuiz();
