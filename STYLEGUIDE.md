# EdgeOverLuck Style Guide

Brand, copy, layout, and UX rules for EdgeOverLuck.com.

This file is for design, writing, layout, and user-experience consistency.

Use `REVIEW.md` for simulator testing and calculator QA.
Use `AGENTS.md` for repository-level AI/Codex editing rules.
Use `.github/agents/agentsmath.md.agent.md` for gambling math, calculator, EV, RTP, probability, and simulation review.

---

# Brand Identity

EdgeOverLuck.com is a casino math, gambling tools, and simulation site.

The site helps players understand:

- Odds
- Expected value
- Bankroll pressure
- House edge
- Variance
- Volatility
- RTP
- Betting myths
- Casino strategy limitations

Core idea:

Play with the numbers before you play with your money.

The brand should feel like a smart gambling friend who understands the math, not a fake guru selling secret systems out of a digital trench coat.

---

# Brand Positioning

## What EdgeOverLuck is

EdgeOverLuck is:

- Math-first
- Tool-driven
- Honest about gambling risk
- Beginner-friendly
- Practical
- Interactive
- Clear about negative EV
- Useful for testing ideas before risking money
- Entertaining without lying

## What EdgeOverLuck is not

EdgeOverLuck is not:

- A “beat the casino” scam
- A pick-selling site
- A guaranteed profit system
- A gambling addiction encouragement machine
- A fake strategy guru platform
- A boring textbook wall of math
- A doom-preaching gambling lecture

---

# Core Taglines

Preferred:

- Smart Gambling Tools for Real Players
- Real Math. Real Odds. Smarter Decisions.
- Play with the numbers before you play with your money.
- Casino math tools without the fake guru nonsense.

Acceptable sharper lines:

- The wheel has no memory. Your wallet does.
- Variance remains undefeated.
- Test the risk before your bankroll volunteers as tribute.
- Lower bets buy time. Bigger bets buy regret.

Use humor sparingly. One sharp line is good. Ten sharp lines is a cry for help wearing a gold gradient.

---

# Voice and Tone

## The voice should be

- Clear
- Confident
- Direct
- Practical
- Honest
- Beginner-friendly
- Math-aware without being smug
- Slightly sharp, but not try-hard

## The voice should not be

- Spammy
- Overhyped
- Overly cynical
- Too technical for beginners
- Fake-professional
- Clownish
- Full of forced jokes
- Gambling-guru nonsense

## Voice examples

Good:

- Roulette systems change the ride, not the road. The house edge is still there.
- A 96% RTP slot can still crush a short session. RTP is a long-run average, not tonight’s forecast.
- This tool estimates bankroll pressure. It does not predict the next hand.
- A straight-up bet pays more because it hits less often. The expected value is still negative.

Bad:

- Unlock the secret casino strategy they don’t want you to know!
- This system helps you win safer and smarter.
- Dominate roulette with proven betting patterns.
- Guaranteed strategy for beating slots.

Burn those with fire. Then test the fire’s RTP.

---

# Copywriting Rules

## Write for beginners first

Assume the user is smart but may not know gambling math terms yet.

Explain terms like:

- EV
- RTP
- House edge
- Volatility
- Variance
- Implied probability
- Bust risk
- Profit chance
- Push
- Takeout
- Bankroll

Use plain English before formulas.

Good:

- Expected value is the average result over many plays. It does not predict one spin, hand, or race.

Bad:

- EV is the probabilistic weighted return distribution normalized across outcome states.

That second one may be technically fine, but humans also visit the site.

## Be honest about uncertainty

Use:

- estimated
- approximate
- simulated
- modeled
- based on assumptions
- educational tool
- long-run average
- bankroll pressure

Avoid:

- guaranteed
- safe
- proven
- always
- never loses
- prediction
- lock
- secret
- foolproof
- exploit

## Separate short-term and long-term

Always make this clear:

- Short-term wins can happen. Long-term math still matters.
- A winning session does not prove a strategy works.
- A losing session does not prove a good decision was wrong.
- Variance can make bad ideas look smart for a while.

## Good structure for tool pages

Each calculator or simulator page should usually include:

1. Clear headline
2. Short plain-English explanation
3. Calculator/tool section
4. Assumptions box
5. “What this means” section
6. Myth vs math section
7. Related tools
8. Responsible gambling note

---

# Humor Rules

Dark humor is allowed. Trying too hard is not.

## Good humor

- The wheel has no memory. Your wallet does.
- Variance remains undefeated.
- The house edge is small, patient, and annoyingly employed.
- Lower bets buy time. Bigger bets buy regret.

## Bad humor

- Your bankroll is about to get murdered by math goblins.
- Casinos are evil blood temples of doom.
- LOL you are poor now.
- This calculator will save your wallet from becoming roadkill.

Keep the edge. Drop the cringe.

---

# Visual Identity

## Overall feel

The site should look like:

- Modern casino math lab
- Dark premium dashboard
- Black and gold gambling atmosphere
- Sharp but readable
- Interactive tool hub
- Serious enough for trust
- Fun enough to explore

## Core colors

Preferred palette:

- Background: black / near-black
- Primary accent: gold / yellow-gold
- Secondary accent: cyan / electric blue
- Text: white / off-white
- Muted text: gray
- Danger/warning: red/orange
- Success/positive: green

Use gold for:

- Primary CTAs
- Important highlights
- Math/value emphasis
- Premium visual accents

Use cyan for:

- Secondary highlights
- Interactive states
- Tool/helper accents
- Contrast sections

Use red/orange for:

- Risk warnings
- Bust risk
- Negative EV
- Dangerous behavior

Do not turn the site into a neon clown casino. Vegas already committed that crime.

---

# Layout Rules

## Preferred layout patterns

Use existing shared classes where possible:

- `.container`
- `.section`
- `.section-tight`
- `.card`
- `.glass-card`
- `.glass-panel`
- `.btn`
- `.btn-secondary`
- `.grid`
- `.grid-2`
- `.grid-3`
- `.section-title`
- `.section-subtext`
- `.small-note`
- `.warning-box`
- `.info-box`

## Page structure

Recommended page structure:

- Header
- Hero
- Quick reality strip
- Tool/calculator section
- Explanation section
- Myth vs math section
- Related tools
- Responsible gambling note
- Footer

## Cards

Cards should feel:

- Layered
- Clean
- Dark
- Slightly glowing
- Easy to scan

Use cards for:

- Tool sections
- Result outputs
- Assumption boxes
- Myth vs math comparisons
- Related tools
- Warning sections

## Spacing

Use generous spacing.

Avoid:

- Cramped form controls
- Dense text walls
- Tiny buttons
- Overloaded sections
- Results smashed against inputs

If a section looks like a tax form mated with a slot machine, simplify it.

---

# Button Rules

## Primary buttons

Use for the main action:

- Run Calculator
- Spin Simulator
- Check Bankroll Risk
- Compare EV
- Test Strategy
- Practice Blackjack Decisions

## Secondary buttons

Use for related actions:

- Learn Strategy
- Open Simulator
- Read Guide
- Try Another Tool
- View Assumptions

## Bad button copy

Avoid vague CTAs:

- Click Here
- Submit
- Learn More
- Start Now
- Win Smarter

Better:

- Run the Bankroll Check
- Compare Roulette Odds
- Test the Strategy
- Practice Blackjack Decisions
- Check Slot Survival Risk

---

# Form and Calculator UX

## Every input should have context

Bad:

- House Edge %

Better:

- House Edge (%)
- Typical blackjack with decent basic strategy may be near 0.5%. Worse rules or mistakes increase this.

## Results should explain themselves

Bad:

- EV: -0.27

Better:

- Expected Value / Spin: -$0.27
- On average, this $10 roulette bet gives up about 27 cents per spin over the long run.

## Always validate inputs

Do not silently calculate nonsense.

Examples:

- Bet size cannot exceed bankroll without warning.
- Simulations should have reasonable min/max values.
- Odds should reject invalid formats.
- Negative bankroll should not be allowed unless intentionally modeled.
- Empty inputs should produce helpful messages.
- Invalid values should not create NaN, Infinity, or blank outputs.

---

# Calculator Language Rules

## Use “calculator” only when math is direct

Good calculator pages:

- Roulette odds calculator
- Odds-to-probability calculator
- Ticket cost calculator
- Expected loss calculator

## Use “estimator” when assumptions are simplified

Use estimator for:

- Blackjack EV tool
- Bankroll survival model
- Session risk tool
- Simplified Monte Carlo tools

## Use “simulator” when randomness is involved

Use simulator for:

- Slot simulator
- Roulette simulator
- Strategy simulator
- Horse racing favorite vs longshot demo
- Bubble craps simulator

---

# Gambling Math Rules

Accuracy beats vibes.

## Always separate

- Theoretical EV
- Simulated result
- Short-term outcome
- Long-term average
- Profit chance
- Bust risk
- House edge
- Bankroll pressure

## Never imply

- A system beats house edge
- A tool predicts the next outcome
- A player is due
- Past spins affect future spins
- RTP guarantees session results
- Betting bigger changes the odds
- Chasing losses is strategy

## Preferred explanation

- This tool models risk. It does not predict outcomes.
- Winning sessions happen. That does not remove negative expected value.
- A betting system can change volatility, but it does not change the wheel odds.
- Short-term results can be noisy. Long-term math is less impressed.

---

# Blackjack Style Rules

Blackjack pages should emphasize:

- Basic strategy
- Decision quality
- Bankroll pressure
- Rule differences
- House edge assumptions
- Variance

## Blackjack EV tool

Treat as:

- Blackjack EV Estimator

unless a full solver exists.

Assumption copy should mention:

- Infinite-shoe approximation
- Estimated dealer outcomes
- Not composition-dependent
- No split modeling unless actually supported
- No surrender unless actually supported
- No insurance unless actually supported
- No dealer peek unless actually supported
- True count is approximate unless using a real count-based model

## Blackjack copy examples

Good:

- This estimates the average value of a decision under simplified assumptions.
- A good blackjack decision can still lose one hand.
- Strategy lowers mistake rate. It does not cancel variance.

Bad:

- This tells you the correct move for every blackjack situation.
- This guarantees the mathematically perfect casino decision.
- Use this to beat blackjack.

No. Blackjack has enough traps without the copy becoming one.

---

# Roulette Style Rules

Roulette pages should emphasize:

- Wheel type
- Bet coverage
- Payout
- House edge
- EV
- Bankroll risk
- Strategy myths

## Roulette facts

- European roulette: 37 pockets
- American roulette: 38 pockets
- European house edge: about 2.70%
- American house edge: about 5.26%

## Roulette copy examples

Good:

- A straight-up bet pays more because it hits less often. The expected value is still negative.
- Martingale changes bet size after losses. It does not change roulette odds.
- European roulette is friendlier than American roulette, but the house edge still exists.

Bad:

- Use this system to recover losses safely.
- This roulette strategy avoids the zero.
- Bet progressions can overcome bad luck.

No. That sentence should be launched into the sun.

---

# Slot Style Rules

Slot pages should emphasize:

- RTP
- Volatility
- Hit frequency
- Bonus features
- Bankroll swings
- Long-run vs short-run behavior

## Slot copy examples

Good:

- RTP is a long-run average, not a promise about your next session.
- High volatility can create bigger wins and longer droughts.
- Bonus features are part of the game’s RTP, not free extra value.
- Past spins do not make the next spin more likely to hit.

Bad:

- This machine is due.
- Bonus chasing improves your odds.
- A 96% RTP slot should give back $96 from every $100 session.
- Hot slots are easier to find if you know what to watch.

The machine is not due. It is plastic, code, and disappointment with lights.

---

# Horse Racing Style Rules

Horse racing pages should emphasize:

- Implied probability
- Price vs true chance
- Takeout
- Variance
- Favorites vs longshots
- Ticket cost
- Net profit vs total payout

## Horse racing copy examples

Good:

- Picking winners is not enough. The price has to be better than the horse’s true chance.
- Takeout means the pool pays back less than bettors put in.
- Longshots create bigger payouts because they lose more often.
- A favorite can be likely to win and still be a bad bet if the odds are too short.

Bad:

- This method finds guaranteed value bets.
- Longshots are where the real money is.
- Favorites are safer.
- Use this to beat the track.

No, it doesn’t. The horses did not sign a contract with your spreadsheet.

---

# Bubble Craps Style Rules

Bubble craps pages should emphasize:

- Bet rules
- Dice outcomes
- House edge
- Pass/Don’t Pass differences
- Come-out phase
- Point phase
- Bankroll changes

## Bubble craps copy examples

Good:

- Pass Line and Don’t Pass are low-house-edge craps bets, but low edge does not mean no risk.
- The point phase changes what wins and loses. The dice do not care that you feel momentum.
- A roll can be correct for the rules and still ugly for your bankroll.

Bad:

- Follow the rhythm of the dice.
- Hot dice change the table.
- This system avoids seven-outs.

Dice do not have a mood. People do. That is usually the problem.

---

# SEO Style Rules

Every page should have:

- One clear H1
- Descriptive H2s
- Useful intro copy
- Internal links to related tools
- Meta description
- Canonical URL
- Image alt text
- FAQ where useful
- Assumptions/disclaimer sections for tools

## Meta description style

Good:

- Use this roulette odds calculator to compare payouts, win probability, expected value, house edge, and bankroll risk for European and American roulette.

Bad:

- Best roulette calculator online. Win smarter with powerful roulette strategy tools.

Avoid “best” unless you can defend it. Google has enough landfill.

---

# Internal Linking Rules

Every major tool page should link to related tools.

## Blackjack pages link to

- Blackjack Trainer
- Blackjack Strategy Guide
- Blackjack Trainer Guide
- Blackjack Bankroll Calculator
- Blackjack EV Estimator

## Roulette pages link to

- Roulette Guide
- Roulette Calculator
- Roulette Simulator
- Roulette Strategy Simulator
- Responsible Gambling

## Slot pages link to

- Slots Guide
- Slot Simulator
- Slot RTP Guide
- Slot Volatility Guide
- Slot Bankroll Survival Calculator

## Horse racing page links to

- Bankroll tools
- Gambling personality quiz
- Responsible gambling
- Related betting math tools

## Bubble craps page links to

- Bankroll tools
- Responsible gambling
- Dice/probability explanations where available
- Related simulator pages

---

# Responsible Gambling Style

Responsible gambling copy should be direct and serious.

Good:

- Only gamble with money you can afford to lose. Set limits before playing.
- If gambling is causing stress, debt, secrecy, or loss of control, stop and get help.
- Tools can explain risk. They cannot make gambling risk-free.

Avoid jokes in serious responsible gambling sections.

Do not soften risk language just to keep the page fun. That is how you become the villain in your own footer.

---

# Affiliate Style Rules

Affiliate content must not affect math claims.

Good:

- This page may contain affiliate links. Affiliate relationships do not change our odds, house edge, or calculator explanations.

Bad:

- Recommended casinos where this strategy works best.
- Use these casinos to maximize this betting system.
- These games pair well with our strategy.

Never imply an affiliate site changes the math.

---

# Visual Components

## Hero sections

Should include:

- Clear H1
- Short explanation
- Primary CTA
- Secondary CTA
- Optional visual card/stat panel

Hero copy should be specific.

Bad:

- Play smarter today.

Good:

- Compare roulette bet probability, payout, expected loss, and bankroll pressure before testing a system.

## Reality check strips

Use these for quick truths:

- The wheel has no memory.
- RTP is not tonight’s forecast.
- A good blackjack decision can still lose one hand.
- Longshots pay more because they lose more often.
- Low house edge is not the same as no risk.

## Myth vs Math sections

Recommended format:

- Myth: “Black is due after five reds.”
- Math: Each spin is independent. Streaks are normal.

These are excellent for SEO, education, and brand personality.

---

# Image Style

Images should match:

- Black/gold/casino math feel
- Dark premium look
- Clean contrast
- WebP format when practical
- No stretched aspect ratios
- No cheesy stock photos if avoidable

## Image alt text

Alt text should describe the image and context.

Good:

- Roulette odds calculator interface with gold casino chips and probability chart.

Bad:

- image
- best roulette strategy secret casino winner

Alt text is not a keyword landfill. Google is dumb sometimes, not blind drunk.

---

# Animation Style

Allowed:

- Subtle glow
- Hover lift
- Soft card transitions
- Roulette ambient motion
- Card flip
- Chip movement
- Result highlight
- Ticker/counter effects

Avoid:

- Constant flashing
- Distracting loops
- Heavy animations that slow pages
- Motion that hides calculator results
- Autoplay sound
- Anything that feels like a malware banner from 2007

Respect reduced motion where practical.

---

# Sound Style

Sound should be:

- Optional
- Triggered by user action
- Short
- Non-looping unless explicitly controlled
- Safe if file is missing

Never autoplay sound on page load.

Good uses:

- Dice roll on roll
- Chip click on bet
- Roulette spin on spin
- Card sound on deal
- Win/loss sound after result

Bad:

- Shuffle sound looping forever
- Voice clip firing before interaction
- Sound blocking calculator function
- Broken audio throwing console errors

---

# Mobile Style

Mobile pages must prioritize:

- Tool usability
- Visible inputs
- Tappable buttons
- No sideways scrolling
- Clear results
- Nav accessibility

On mobile:

- Keep controls near the result.
- Avoid giant images before the tool.
- Do not bury calculator under five hype sections.
- Make primary CTA jump to the tool.
- Make buttons large enough to tap.
- Make result cards stack cleanly.

---

# Page-Specific Priorities

## Homepage

Should quickly explain:

- What EdgeOverLuck is
- Main tools
- Why the tools matter
- Where to start

Priority tools:

- Blackjack Trainer
- Blackjack Bankroll Calculator
- Blackjack EV Estimator
- Roulette Calculator
- Roulette Simulator
- Slot Simulator
- Horse Racing Guide
- Bubble Craps Simulator

## Blackjack Trainer

Prioritize:

- Game usability
- Clear buttons
- Visible bankroll
- Visible bet size
- Clear decision feedback
- Mobile layout
- Fast interaction
- No looping or annoying audio

## Blackjack Bankroll Calculator

Prioritize:

- Bet size vs bankroll clarity
- Bust risk explanation
- Expected loss explanation
- Simplified-model assumptions
- Clear warning against overbetting

## Blackjack EV Estimator

Prioritize:

- Honest estimator language
- Assumptions box
- Estimated EV labels
- No false full-solver claims
- Clear action comparison

## Roulette Calculator

Prioritize:

- Bet type clarity
- Wheel type clarity
- EV accuracy
- House edge clarity
- Bankroll simulation clarity
- Theory vs simulation separation

## Roulette Simulator

Prioritize:

- Readable wheel numbers
- Clear betting controls
- Correct payouts
- Mobile-friendly layout
- Audio that only plays on user action

## Roulette Strategy Simulator

Prioritize:

- System comparison clarity
- Martingale risk explanation
- Flat betting baseline
- Bust/table limit risk
- No “system beats roulette” implication

## Slot Simulator

Prioritize:

- RTP/volatility explanation
- Bankroll results
- Bonus feature education
- No “machine is due” language