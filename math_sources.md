# Edge Over Luck Exact Calculator Equations

## Purpose

This document records exact/basic equations for Edge Over Luck calculators where the math is stable, public, and not dependent on complex game-state modeling.

Blackjack EV is intentionally excluded from exact-equation requirements for now. The current Blackjack EV tool is an approximate educational model. A stronger exact blackjack solver can be built later.

Use this document when reviewing or editing:

- Roulette calculator
- Roulette strategy simulator
- Slot RTP / slot simulator tools
- Slot bankroll survival calculator
- Horse racing odds calculators
- Exotic ticket calculators
- Bubble craps / dice probability tools
- Basic bankroll / expected loss calculators

Do not use this document to pretend gambling can be beaten by a system. Most of these tools exist to show users where the edge is buried.

---

# Global Expected Value Equations

## Expected Value

Expected value is the probability-weighted average result of a bet.

Formula:

EV = sum(probability of each outcome × net result of that outcome)

For a simple win/loss bet:

EV = (winProbability × profitIfWin) - (lossProbability × amountLostIfLose)

If losing means losing the original bet:

EV = (winProbability × profitOnWin) - (lossProbability × betAmount)

## House Edge

House edge is the average player loss as a percentage of the original bet.

Formula:

houseEdge = -EV / betAmount

As a percentage:

houseEdgePercent = houseEdge × 100

Example:

EV = -$0.5263 on a $10 bet

houseEdge = 0.5263 / 10 = 0.05263

houseEdgePercent = 5.263%

## Total Amount Wagered

Formula:

totalWagered = betAmount × numberOfBets

## Expected Loss

Formula:

expectedLoss = totalWagered × houseEdge

If using RTP:

expectedLoss = totalWagered × (1 - RTP)

## Expected Return

Formula:

expectedReturn = totalWagered × RTP

## Expected Ending Bankroll

Formula:

expectedEndingBankroll = startingBankroll - expectedLoss

If a positive player edge is used:

expectedEndingBankroll = startingBankroll + expectedProfit

---


# Casino Bonus EV Calculator

## Casino Bonus EV Estimate

This calculator estimates the paper value of a casino bonus after wagering requirements, game contribution, RTP, and extra costs. It is an educational estimate, not a profit guarantee or a withdrawal prediction.

Inputs:

- bonusAmount
- depositAmount
- wageringMultiplier
- wageringBase = bonus only OR deposit plus bonus
- contributionPercent
- rtpPercent
- extraCosts
- maxCashout

Formula:

bonusBase = bonusAmount if wagering applies to bonus only

bonusBase = depositAmount + bonusAmount if wagering applies to deposit plus bonus

gameContributionDecimal = contributionPercent / 100

rtpDecimal = rtpPercent / 100

houseEdge = 1 - rtpDecimal

totalWagering = bonusBase × wageringMultiplier

adjustedWagering = totalWagering / gameContributionDecimal

expected loss = adjusted wagering × house edge

capped bonus value = min(bonus amount, max cashout) when max cashout is entered

capped bonus value = bonus amount when no max cashout is entered

gross EV = capped bonus value - expected loss

net EV = capped bonus value - expected loss - extra costs

Equivalent code formula:

cappedBonusValue = maxCashout > 0 ? Math.min(bonusAmount, maxCashout) : bonusAmount

netEV = cappedBonusValue - expectedLoss - extraCosts

## Casino Bonus EV Limits

This estimate does not model variance, withdrawal friction, game exclusions, max bet limits, expiration windows, account restrictions, or operator-specific terms. When max cashout is entered, the estimate caps the bonus upside before classifying the EV verdict, but it still does not simulate the probability distribution of reaching or exceeding the cashout cap.

# Roulette Calculator

## Source Notes

Roulette math is exact because the number of wheel pockets and payout odds are known.

American roulette has 38 pockets: 1-36, 0, and 00.

European roulette has 37 pockets: 1-36 and 0.

Standard roulette straight-up payout is 35:1.

American roulette straight-up EV:

EV = (1/38 × 35) - (37/38 × 1) = -0.0526

House edge = 5.26%

European roulette straight-up EV:

EV = (1/37 × 35) - (36/37 × 1) = -0.0270

House edge = 2.70%

Reference: Roulette expected value and house edge are widely documented. Wikipedia lists American roulette single-number EV as -0.0526 and European roulette single-number EV as -0.0270.

## Wheel Types

American roulette:

totalNumbers = 38

European roulette:

totalNumbers = 37

Triple-zero roulette, if added later:

totalNumbers = 39

## Core Formula

For any standard roulette bet:

winProbability = winningNumbers / totalNumbers

lossProbability = 1 - winProbability

profitOnWin = betAmount × payoutOdds

EV = (winProbability × profitOnWin) - (lossProbability × betAmount)

houseEdge = -EV / betAmount

houseEdgePercent = houseEdge × 100

## Common Roulette Bets

Straight Up:

winningNumbers = 1
payoutOdds = 35

Split:

winningNumbers = 2
payoutOdds = 17

Street:

winningNumbers = 3
payoutOdds = 11

Corner:

winningNumbers = 4
payoutOdds = 8

Six Line / Double Street:

winningNumbers = 6
payoutOdds = 5

Dozen:

winningNumbers = 12
payoutOdds = 2

Column:

winningNumbers = 12
payoutOdds = 2

Red / Black:

winningNumbers = 18
payoutOdds = 1

Odd / Even:

winningNumbers = 18
payoutOdds = 1

High / Low:

winningNumbers = 18
payoutOdds = 1

## American Roulette Sample Outputs

### $10 Straight Up

Input:

wheel = American
totalNumbers = 38
winningNumbers = 1
payoutOdds = 35
betAmount = 10

Calculation:

winProbability = 1 / 38 = 0.0263157895 = 2.63%
lossProbability = 37 / 38 = 0.9736842105 = 97.37%
profitOnWin = 10 × 35 = 350
EV = (1/38 × 350) - (37/38 × 10)
EV = 9.210526 - 9.736842
EV = -0.526316
houseEdge = 0.526316 / 10 = 0.0526316 = 5.26%

Expected Output:

Win probability = 2.63%
Profit on win = $350.00
Expected value = -$0.53
House edge = 5.26%

### $25 Red / Black

Input:

wheel = American
totalNumbers = 38
winningNumbers = 18
payoutOdds = 1
betAmount = 25

Calculation:

winProbability = 18 / 38 = 0.4736842105 = 47.37%
lossProbability = 20 / 38 = 0.5263157895 = 52.63%
profitOnWin = 25 × 1 = 25
EV = (18/38 × 25) - (20/38 × 25)
EV = 11.842105 - 13.157895
EV = -1.315789
houseEdge = 1.315789 / 25 = 0.0526316 = 5.26%

Expected Output:

Win probability = 47.37%
Profit on win = $25.00
Expected value = -$1.32
House edge = 5.26%

## European Roulette Sample Outputs

### $10 Straight Up

Input:

wheel = European
totalNumbers = 37
winningNumbers = 1
payoutOdds = 35
betAmount = 10

Calculation:

winProbability = 1 / 37 = 0.027027027 = 2.70%
lossProbability = 36 / 37 = 0.972972973 = 97.30%
profitOnWin = 10 × 35 = 350
EV = (1/37 × 350) - (36/37 × 10)
EV = 9.459459 - 9.729730
EV = -0.270270
houseEdge = 0.270270 / 10 = 0.027027 = 2.70%

Expected Output:

Win probability = 2.70%
Profit on win = $350.00
Expected value = -$0.27
House edge = 2.70%

### $25 Red / Black

Input:

wheel = European
totalNumbers = 37
winningNumbers = 18
payoutOdds = 1
betAmount = 25

Calculation:

winProbability = 18 / 37 = 0.486486486 = 48.65%
lossProbability = 19 / 37 = 0.513513514 = 51.35%
profitOnWin = 25
EV = (18/37 × 25) - (19/37 × 25)
EV = 12.162162 - 12.837838
EV = -0.675676
houseEdge = 0.675676 / 25 = 0.027027 = 2.70%

Expected Output:

Win probability = 48.65%
Profit on win = $25.00
Expected value = -$0.68
House edge = 2.70%

## Roulette User-Facing Description

Use this calculator to compare roulette bets by probability, payout, expected value, and house edge. It shows the real math behind each bet. Betting systems may change bet size and volatility, but they do not change the house edge of the wheel.

---

# Roulette Strategy Simulator

## Purpose

Simulate betting systems over repeated roulette spins.

Examples:

- Flat betting
- Martingale
- Fibonacci
- D'Alembert
- Paroli
- Custom progression systems

## Critical Rule

A betting system changes bet sizing, volatility, and bust risk.

A betting system does not change the expected value of the underlying roulette bet.

If the base bet has a 5.26% house edge, the system still has a 5.26% house edge on total money wagered in American roulette.

## Core Tracking Variables

startingBankroll
currentBankroll
baseBet
currentBet
tableLimit
numberOfSpins
totalWagered
wins
losses
netProfit
biggestDrawdown
lowestBankroll
bustOccurred
finalBankroll

## Flat Betting

Formula:

currentBet = baseBet

Every spin uses the same bet unless bankroll is too low.

## Martingale

After a loss:

nextBet = previousBet × 2

After a win:

nextBet = baseBet

Validation:

nextBet cannot exceed currentBankroll
nextBet cannot exceed tableLimit if tableLimit exists

## D'Alembert

After a loss:

nextBet = previousBet + baseBet

After a win:

nextBet = max(baseBet, previousBet - baseBet)

## Fibonacci

Use Fibonacci sequence units:

1, 1, 2, 3, 5, 8, 13, 21, ...

After a loss:

move one step forward in the sequence

After a win:

move two steps backward in the sequence, but not below the first step

currentBet = baseBet × fibonacciUnit

Validation:

currentBet cannot exceed currentBankroll
currentBet cannot exceed tableLimit if tableLimit exists

## Paroli / Reverse Martingale

After a win:

nextBet = previousBet × 2

After a loss:

nextBet = baseBet

Usually use a win streak cap.

Validation:

nextBet cannot exceed currentBankroll
nextBet cannot exceed tableLimit if tableLimit exists

## Strategy Simulator Expected Loss

For any roulette strategy:

expectedLoss = totalWagered × houseEdge

American roulette:

expectedLoss = totalWagered × 0.0526316

European roulette:

expectedLoss = totalWagered × 0.027027

## Sample Output: American Roulette, Flat Betting Red/Black

Input:

wheel = American
bet = Red / Black
baseBet = $10
spins = 100
strategy = Flat

Calculation:

totalWagered = 10 × 100 = $1,000
houseEdge = 5.26%
expectedLoss = 1000 × 0.0526316 = $52.63

Expected Output:

Total wagered = $1,000.00
Theoretical expected loss = $52.63
House edge = 5.26%

## User-Facing Description

This simulator shows how roulette betting systems affect bankroll swings, drawdowns, and bust risk. It does not prove a system beats roulette. The wheel still has the same edge. The only thing the system changes is how dramatically your bankroll gets introduced to gravity.

---

# Slot RTP Calculator / Slot Simulator

## Source Notes

Return to Player, or RTP, is the theoretical percentage of total wagered money returned to players over long-term play. A 95% RTP means that over a very large number of spins, the game is designed to return about $95 per $100 wagered on average.

This does not predict one short session.

## Core Variables

startingBankroll
betSize
spins
RTP
volatility
totalWagered
expectedReturn
expectedLoss
expectedEndingBankroll

## RTP Formula

RTP should be entered as decimal or converted to decimal.

Examples:

96% RTP = 0.96
95% RTP = 0.95
88% RTP = 0.88

## Total Wagered

Formula:

totalWagered = betSize × spins

## Expected Return

Formula:

expectedReturn = totalWagered × RTP

## Expected Loss

Formula:

expectedLoss = totalWagered × (1 - RTP)

## Expected Ending Bankroll

Formula:

expectedEndingBankroll = startingBankroll - expectedLoss

## House Edge from RTP

Formula:

houseEdge = 1 - RTP

houseEdgePercent = houseEdge × 100

Example:

RTP = 0.96

houseEdge = 1 - 0.96 = 0.04 = 4%

## Sample Output: 96% RTP Slot

Input:

startingBankroll = $100
betSize = $1
spins = 500
RTP = 0.96

Calculation:

totalWagered = 1 × 500 = $500
expectedReturn = 500 × 0.96 = $480
expectedLoss = 500 × 0.04 = $20
expectedEndingBankroll = 100 - 20 = $80

Expected Output:

Total wagered = $500.00
Expected return = $480.00
Expected loss = $20.00
Expected ending bankroll = $80.00
House edge = 4.00%

## Sample Output: 94% RTP Slot

Input:

startingBankroll = $250
betSize = $2
spins = 300
RTP = 0.94

Calculation:

totalWagered = 2 × 300 = $600
expectedReturn = 600 × 0.94 = $564
expectedLoss = 600 × 0.06 = $36
expectedEndingBankroll = 250 - 36 = $214

Expected Output:

Total wagered = $600.00
Expected return = $564.00
Expected loss = $36.00
Expected ending bankroll = $214.00
House edge = 6.00%

## Volatility Note

Volatility does not change RTP by itself.

Low volatility means:

- more frequent small wins
- smoother bankroll path
- fewer extreme outcomes

High volatility means:

- less frequent wins
- larger potential hits
- bigger bankroll swings
- higher chance of short-term bust

## User-Facing Description

Use this tool to estimate long-run expected return and loss from slot play based on RTP, bet size, and number of spins. RTP is a long-term average. It does not mean a 96% slot gives back $96 every time you bet $100. Short sessions can still get thrown into the variance wood chipper.

---

# Slot Bankroll Survival Calculator

## Purpose

Estimate bankroll pressure and theoretical spin survival based on bankroll, bet size, and RTP.

This is not a guarantee. It is an expected-loss estimate.

## Expected Loss Per Spin

Formula:

expectedLossPerSpin = betSize × (1 - RTP)

## Theoretical Spins Until Expected Loss Equals Bankroll

Formula:

theoreticalSpins = bankroll / expectedLossPerSpin

This number does not mean the bankroll will survive that many spins. It means expected cumulative loss equals the bankroll at that spin count.

## Total Spins Affordable by Bet Size Alone

Formula:

maxSpinsIfEverySpinLoses = bankroll / betSize

This is the absolute worst-case spin count before bankroll reaches zero if every spin loses.

## Sample Output: $200 Bankroll, $1 Bet, 95% RTP

Input:

bankroll = $200
betSize = $1
RTP = 0.95

Calculation:

houseEdge = 1 - 0.95 = 0.05
expectedLossPerSpin = 1 × 0.05 = $0.05
theoreticalSpins = 200 / 0.05 = 4,000
maxSpinsIfEverySpinLoses = 200 / 1 = 200

Expected Output:

Expected loss per spin = $0.05
Theoretical spins before expected loss equals bankroll = 4,000
Worst-case all-loss spin count = 200

Warning:

This does not mean the bankroll will last 4,000 spins. It means long-run expected loss reaches $200 around that point. Variance can bust the bankroll much sooner.

## Sample Output: $500 Bankroll, $2 Bet, 96% RTP

Input:

bankroll = $500
betSize = $2
RTP = 0.96

Calculation:

houseEdge = 0.04
expectedLossPerSpin = 2 × 0.04 = $0.08
theoreticalSpins = 500 / 0.08 = 6,250
maxSpinsIfEverySpinLoses = 500 / 2 = 250

Expected Output:

Expected loss per spin = $0.08
Theoretical spins before expected loss equals bankroll = 6,250
Worst-case all-loss spin count = 250

## User-Facing Description

Estimate how much pressure a slot session puts on your bankroll. This tool shows expected loss per spin and theoretical spin count based on RTP. It does not predict survival. Slots are very capable of speedrunning your bankroll before the long-run math has time to introduce itself.

---

# Dice Probability / Bubble Craps Tools

## Source Notes

Two fair six-sided dice have 36 equally likely outcomes.

Formula:

totalOutcomes = 6 × 6 = 36

Probability of a total:

probability = combinationsForTotal / 36

The total of 7 has the most combinations and is the most likely roll.

## Two-Dice Combination Table

Total = 2
Combinations = 1
Probability = 1 / 36 = 2.7778%

Total = 3
Combinations = 2
Probability = 2 / 36 = 5.5556%

Total = 4
Combinations = 3
Probability = 3 / 36 = 8.3333%

Total = 5
Combinations = 4
Probability = 4 / 36 = 11.1111%

Total = 6
Combinations = 5
Probability = 5 / 36 = 13.8889%

Total = 7
Combinations = 6
Probability = 6 / 36 = 16.6667%

Total = 8
Combinations = 5
Probability = 5 / 36 = 13.8889%

Total = 9
Combinations = 4
Probability = 4 / 36 = 11.1111%

Total = 10
Combinations = 3
Probability = 3 / 36 = 8.3333%

Total = 11
Combinations = 2
Probability = 2 / 36 = 5.5556%

Total = 12
Combinations = 1
Probability = 1 / 36 = 2.7778%

## Sample Output: Rolling a 7

Input:

diceTotal = 7

Expected Output:

Combinations = 6
Probability = 6 / 36
Probability percent = 16.67%

## Sample Output: Rolling a 2

Input:

diceTotal = 2

Expected Output:

Combinations = 1
Probability = 1 / 36
Probability percent = 2.78%

## Sample Output: Rolling a 6 or 8

Input:

diceTotal = 6

Expected Output:

Combinations = 5
Probability = 5 / 36
Probability percent = 13.89%

Input:

diceTotal = 8

Expected Output:

Combinations = 5
Probability = 5 / 36
Probability percent = 13.89%

## Pass Line Bet Probability

Pass line come-out roll:

Immediate wins:

7 or 11

Combinations:

7 has 6 combinations
11 has 2 combinations

Immediate win combinations = 8

Immediate losses:

2, 3, or 12

Combinations:

2 has 1 combination
3 has 2 combinations
12 has 1 combination

Immediate loss combinations = 4

Point numbers:

4, 5, 6, 8, 9, 10

If a point is established, the pass line wins if the point repeats before a 7.

Point win probability:

For point 4:

point combinations = 3
seven combinations = 6
probability point wins before 7 = 3 / (3 + 6) = 1 / 3

For point 5:

point combinations = 4
seven combinations = 6
probability point wins before 7 = 4 / (4 + 6) = 2 / 5

For point 6:

point combinations = 5
seven combinations = 6
probability point wins before 7 = 5 / (5 + 6) = 5 / 11

For point 8:

point combinations = 5
seven combinations = 6
probability point wins before 7 = 5 / (5 + 6) = 5 / 11

For point 9:

point combinations = 4
seven combinations = 6
probability point wins before 7 = 4 / (4 + 6) = 2 / 5

For point 10:

point combinations = 3
seven combinations = 6
probability point wins before 7 = 3 / (3 + 6) = 1 / 3

## Pass Line Overall Win Probability

Formula:

passWinProbability =
P(come-out 7 or 11)
+ P(point 4) × P(4 before 7)
+ P(point 5) × P(5 before 7)
+ P(point 6) × P(6 before 7)
+ P(point 8) × P(8 before 7)
+ P(point 9) × P(9 before 7)
+ P(point 10) × P(10 before 7)

Calculation:

P(come-out 7 or 11) = 8 / 36

P(point 4) = 3 / 36
P(point 5) = 4 / 36
P(point 6) = 5 / 36
P(point 8) = 5 / 36
P(point 9) = 4 / 36
P(point 10) = 3 / 36

passWinProbability =
8/36
+ (3/36 × 1/3)
+ (4/36 × 2/5)
+ (5/36 × 5/11)
+ (5/36 × 5/11)
+ (4/36 × 2/5)
+ (3/36 × 1/3)

passWinProbability ≈ 0.492929

passLossProbability = 1 - 0.492929 = 0.507071

Pass line EV on even-money $1 bet:

EV = (0.492929 × 1) - (0.507071 × 1)
EV = -0.014141

House edge = 1.4141%

Expected Output:

Pass line win probability = 49.29%
Pass line loss probability = 50.71%
Pass line expected value = -0.0141 units per $1
Pass line house edge = 1.41%

## User-Facing Description

Use this tool to see real two-dice probabilities and bubble craps bet math. The seven is the most common total because it has the most combinations. Craps can look chaotic, but the dice are not improvising. They are just doing 36-outcome math.

---

# Horse Racing Odds Calculators

## Source Notes

Horse racing commonly uses fractional odds, decimal odds, implied probability, and pari-mutuel payout logic.

In pari-mutuel betting, wagers go into a pool, the track takeout is deducted, and the remaining pool is distributed among winning tickets. This means final odds can change until betting closes.

## Fractional Odds to Decimal Odds

Fractional odds are commonly shown as:

numerator / denominator

Example:

5 / 1

Formula:

decimalOdds = (numerator / denominator) + 1

Example:

5/1 = (5 / 1) + 1 = 6.00

## Decimal Odds to Fractional Profit Multiple

Formula:

profitMultiple = decimalOdds - 1

Example:

decimalOdds = 6.00

profitMultiple = 6.00 - 1 = 5.00

Equivalent fractional odds:

5/1

## Implied Probability from Decimal Odds

Formula:

impliedProbability = 1 / decimalOdds

As percentage:

impliedProbabilityPercent = impliedProbability × 100

Example:

decimalOdds = 6.00

impliedProbability = 1 / 6 = 0.1667

impliedProbabilityPercent = 16.67%

## Implied Probability from Fractional Odds

Formula:

impliedProbability = denominator / (numerator + denominator)

Example:

5/1

impliedProbability = 1 / (5 + 1) = 1 / 6 = 16.67%

## Profit from Fractional Odds

Formula:

profit = stake × (numerator / denominator)

totalReturn = stake + profit

Example:

stake = $10
odds = 5/1

profit = 10 × (5 / 1) = $50
totalReturn = 10 + 50 = $60

Expected Output:

Profit = $50.00
Total return = $60.00
Implied probability = 16.67%

## Profit from Decimal Odds

Formula:

totalReturn = stake × decimalOdds

profit = totalReturn - stake

Example:

stake = $10
decimalOdds = 6.00

totalReturn = 10 × 6.00 = $60
profit = 60 - 10 = $50

Expected Output:

Profit = $50.00
Total return = $60.00

## Pari-Mutuel Basic Payout Formula

Formula:

netPool = totalPool × (1 - takeoutRate)

payoutPerDollar = netPool / amountBetOnWinner

profitPerDollar = payoutPerDollar - 1

Example:

totalPool = $1,028
takeoutRate = 14.25%
amountBetOnWinner = $110

Calculation:

netPool = 1028 × (1 - 0.1425)
netPool = 1028 × 0.8575
netPool = $881.51

payoutPerDollar = 881.51 / 110 = 8.0137

profitPerDollar = 8.0137 - 1 = 7.0137

Expected Output:

Net pool after takeout = $881.51
Payout per $1 = $8.01
Profit per $1 = $7.01
Approximate odds = 7.01 to 1

## Exotic Ticket Combination Calculators

### Exacta Box

An exacta requires selecting the first two finishers in exact order.

For an exacta box using N horses:

combinations = N × (N - 1)

ticketCost = combinations × baseWager

Example:

N = 4
baseWager = $1

combinations = 4 × 3 = 12

ticketCost = 12 × 1 = $12

Expected Output:

Combinations = 12
Ticket cost = $12.00

### Trifecta Box

A trifecta requires selecting the first three finishers in exact order.

For a trifecta box using N horses:

combinations = N × (N - 1) × (N - 2)

ticketCost = combinations × baseWager

Example:

N = 4
baseWager = $1

combinations = 4 × 3 × 2 = 24

ticketCost = 24 × 1 = $24

Expected Output:

Combinations = 24
Ticket cost = $24.00

### Superfecta Box

A superfecta requires selecting the first four finishers in exact order.

For a superfecta box using N horses:

combinations = N × (N - 1) × (N - 2) × (N - 3)

ticketCost = combinations × baseWager

Example:

N = 5
baseWager = $1

combinations = 5 × 4 × 3 × 2 = 120

ticketCost = 120 × 1 = $120

Expected Output:

Combinations = 120
Ticket cost = $120.00

## User-Facing Description

Use these tools to convert horse racing odds, estimate payouts, understand implied probability, and calculate exotic ticket costs before placing a bet. Horse racing math gets expensive fast. A box bet that sounds harmless can turn into a wallet ambush with hooves.

---

# Basic Bankroll / Session Calculators

## Purpose

Estimate total wagered, expected loss, bet sizing pressure, and session risk signals.

This is not a guarantee of session outcome. It is an expected value estimate.

## Bankroll Units

Formula:

bankrollUnits = bankroll / betSize

Example:

bankroll = $500
betSize = $25

bankrollUnits = 500 / 25 = 20

Expected Output:

Bankroll units = 20

## Bet Size as Percentage of Bankroll

Formula:

betPercent = betSize / bankroll

betPercentDisplay = betPercent × 100

Example:

bankroll = $500
betSize = $25

betPercent = 25 / 500 = 0.05

betPercentDisplay = 5.00%

Expected Output:

Bet size = 5.00% of bankroll

## Total Wagered

Formula:

totalWagered = betSize × numberOfBets

Example:

betSize = $25
numberOfBets = 100

totalWagered = 25 × 100 = $2,500

Expected Output:

Total wagered = $2,500.00

## Expected Loss from House Edge

Formula:

expectedLoss = totalWagered × houseEdge

Example:

totalWagered = $2,500
houseEdge = 0.005

expectedLoss = 2500 × 0.005 = $12.50

Expected Output:

Expected loss = $12.50

## Expected Profit from Player Edge

Formula:

expectedProfit = totalWagered × playerEdge

Example:

totalWagered = $2,500
playerEdge = 0.01

expectedProfit = 2500 × 0.01 = $25.00

Expected Output:

Expected profit = $25.00

## Ending Bankroll Estimate

If house edge:

expectedEndingBankroll = startingBankroll - expectedLoss

If player edge:

expectedEndingBankroll = startingBankroll + expectedProfit

Example:

startingBankroll = $500
expectedLoss = $12.50

expectedEndingBankroll = 500 - 12.50 = $487.50

Expected Output:

Expected ending bankroll = $487.50

## User-Facing Description

Use this calculator to estimate total money wagered, average expected loss, bankroll units, and bet pressure before a session. House edge applies to total money wagered, not just the cash you walk in with. That is how a small edge quietly becomes a large bill.

---

# Formatting Rules

Money:

Use 2 decimals.

Example:

$12.50

Percentages:

Use 2 decimals unless more precision is needed.

Example:

5.26%

Probability:

Show both fraction and percent when useful.

Example:

1 / 38 = 2.63%

Expected value:

For dollars:

Expected value = -$0.53

For units:

Expected value = -0.0526 units per $1 bet

House edge:

House edge = 5.26%

## Rounding

Use standard rounding:

- $0.5263 becomes $0.53
- 5.263% becomes 5.26%
- 2.7027% becomes 2.70%

Do not round internal calculations too early. Round only for display.

---

# Calculators Marked Approximate / Needs Future Audit

## Blackjack EV Calculator

Status:

Approximate model for now.

Do not claim exact blackjack EV.

Current tool may use:

- infinite-shoe approximation
- simulation-estimated dealer distribution
- simplified rule adjustments
- simplified true count adjustment
- simplified hit/double decision logic

Allowed description:

This is an approximate educational model for comparing hit, stand, and double decisions. It is useful directionally but is not a full composition-dependent blackjack solver.

Future improvement:

Build or reference a stronger blackjack EV engine with explicit rules for:

- S17 vs H17
- double after split
- surrender
- resplitting
- blackjack payout
- deck count
- card composition
- exact dealer outcome probabilities
- strategy assumptions

## Complex Slot Bonus Simulators

Status:

Needs model-specific audit.

Reason:

Real slot math depends on reel strips, symbol frequencies, bonus triggers, pay tables, wild behavior, free spins, multipliers, and game-specific mechanics.

Use RTP/volatility approximations unless exact game math is available.

## Horse Racing True Value / Fair Odds

Status:

Partially exact.

Odds conversion and ticket cost are exact.

True value is not exact unless the user provides their own probability estimate.

Formula if user provides estimated win probability:

expectedValue = (estimatedWinProbability × profitIfWin) - ((1 - estimatedWinProbability) × stake)

Fair decimal odds:

fairDecimalOdds = 1 / estimatedWinProbability

Fair fractional profit multiple:

fairProfitMultiple = fairDecimalOdds - 1

---

# QA Checklist for Basic Equation Calculators

Before finishing edits, verify:

- Formula is documented.
- Assumptions are visible to users.
- Inputs validate impossible values.
- Percent inputs are converted correctly.
- RTP is handled as decimal internally.
- American and European roulette are not mixed.
- Roulette payouts use profit odds, not total return.
- Dice probabilities use 36 total outcomes.
- Horse racing odds distinguish profit from total return.
- Pari-mutuel payout includes takeout before distribution.
- Exotic ticket combinations use permutations, not combinations.
- Money values display with 2 decimals.
- Percentages display clearly.
- No output implies guaranteed profit.
- No betting system claims to change house edge.
- Simulation outputs use ranges/tolerances when tested.
- Internal calculations do not round too early.
