===============================================================================
MALLOY LABS — LIQUIDITY SWEEP MAPPER V2
===============================================================================

thanks for buying. this file walks through setup, every input, and how to
read the signals. takes about 5 minutes to get it running.

questions or issues: reply to the delivery email. goes straight to my inbox.

— noah
  malloylabs.net
  @malloyalgos


===============================================================================
1. QUICK START
===============================================================================

1. open tradingview, go to any chart
2. click "pine editor" at the bottom of the screen
3. open liquidity-sweep-mapper-v2.txt, copy the full contents
4. paste into the pine editor (replace any existing code)
5. click "save" — name it whatever you want
6. click "add to chart"

the indicator appears overlaid on your chart. default settings work well for
most crypto pairs on the 5m–1h timeframes. for other setups, see section 6.


===============================================================================
2. WHAT YOU'RE LOOKING AT
===============================================================================

PURPLE BOXES    active liquidity zones derived from swing highs/lows
GRAY BOXES      zones already swept (invalidated, kept for context)
DOTTED LINES    round number levels (psychological support/resistance)
EMA LINES       magnet levels at 20 / 50 / 200 periods (default)

TOP-RIGHT TABLE   live status: zone count, vol spike, trend, etc.

▲ SWEEP          a liquidity sweep just fired (bullish)
▼ SWEEP          a liquidity sweep just fired (bearish)
BUY / SELL       a signal passed all filters — not just a sweep, but a
                 fully qualified setup


===============================================================================
3. HOW SIGNALS WORK
===============================================================================

A SWEEP fires when:
  - price wicks beyond a liquidity zone (minimum % configurable)
  - then closes back inside the zone on the same bar
  - with a body in the right direction (bull body for bullish sweep,
    bear body for bearish sweep)
  - volume spikes above the recent average (if volume filter is on)

A BUY/SELL SIGNAL requires the sweep PLUS:
  - price on the correct side of the mid EMA (trend alignment, if on)
  - the zone has been tested 2+ times (multi-touch filter, if on)

the sweep fires first as a raw event. the buy/sell only fires when the full
setup is qualified. you'll see a SWEEP label on every qualifying wick; the
BUY/SELL label only on the ones that pass the extra filters.

the indicator also tracks sweeps of the EMAs themselves — when price wicks
past an EMA and closes back on the other side with a matching body. these
show up as small labels on the chart (▲ EMA20, ▼ EMA50, etc.).


===============================================================================
4. INPUT REFERENCE
===============================================================================

--- LIQUIDITY ZONE DETECTION ---

PIVOT LOOKBACK LENGTH (default 10)
  bars used to confirm a swing high/low. higher = fewer but stronger levels.
  on 5m/15m charts leave at 10. on 1h+ consider 15–20. on 1m, drop to 5–7.

ZONE WIDTH % (default 0.3)
  how wide each zone is around the pivot price. 0.3% is tight and suits most
  crypto. widen to 0.5–1.0% for very volatile pairs or low-cap tokens.

MAX ACTIVE ZONES (default 20)
  caps how many zones are tracked at once. higher = more clutter but more
  context. 20 is a good middle ground.

MERGE THRESHOLD % (default 0.5)
  zones within this % of each other merge into one stronger zone. tighten
  to 0.2–0.3% to keep every pivot distinct. widen to 1% to consolidate
  aggressively.


--- ROUND NUMBER LIQUIDITY ---

SHOW ROUND NUMBER LEVELS (default on)
  toggles the dotted round-number overlay. turn off if your chart gets busy
  or if the asset has no meaningful round-number structure.

ROUND NUMBER INTERVAL (default 0 = auto)
  set to 0 for auto. the indicator picks an interval based on current price:

    price > 50k    →  5000
    price > 10k    →  1000
    price > 1k     →  100
    price > 100    →  50
    price > 10     →  5
    price > 1      →  0.5
    below 1        →  0.1

  override only if auto doesn't match how the asset actually respects
  round numbers. example: BTC often respects 500-point increments near
  major levels — set it to 500 manually if that fits your read.


--- EMA MAGNET LEVELS ---

SHOW EMA MAGNETS (default on)
  displays the three EMAs as dynamic magnet levels.

EMA 1 LENGTH (default 20)   short-term magnet
EMA 2 LENGTH (default 50)   mid-term, drives the trend-alignment filter
EMA 3 LENGTH (default 200)  long-term bias

defaults cover most intraday crypto. drop to 9/21/50 for faster setups on
lower timeframes. stretch to 50/100/200 for swing timeframes (4h+).


--- SWEEP DETECTION ---

MIN WICK BEYOND LEVEL % (default 0.1)
  how far the wick must go past the zone to qualify as a sweep. 0.1% is
  tight. increase to 0.2–0.3% for choppy assets to filter noise.

REQUIRE VOLUME SPIKE (default on)
  only count sweeps when volume is elevated vs the recent average. turning
  this off will fire more signals but reduce quality.

VOLUME SPIKE MULTIPLIER (default 1.5)
  how much the current bar's volume must exceed the average. 1.5x is
  permissive. raise to 2.0–2.5x for stricter filtering.

VOLUME AVERAGE LENGTH (default 20)
  lookback for the volume average.


--- BUY / SELL SIGNALS ---

REQUIRE EMA TREND ALIGNMENT (default on)
  only fire BUY when price > mid EMA, SELL when price < mid EMA. this is
  the counter-trend filter — turn off and you'll see signals that fight
  the trend, which can work for mean-reversion strategies but is noisier.

REQUIRE MULTI-TOUCH ZONE (default off)
  only fire BUY/SELL on zones tested 2+ times. turn on to reduce signal
  count and focus on zones the market has confirmed.


--- ALERTS ---

ALERT ON SWEEP
  fires on every qualifying sweep (noisy, high-frequency)

ALERT ON BUY/SELL SIGNAL
  only fires on fully qualified setups


===============================================================================
5. SETTING UP ALERTS IN TRADINGVIEW
===============================================================================

OPTION A — alert on every qualified event (recommended)

  1. right-click your chart → create alert
  2. condition: malloyalgos: sweep mapper → any alert() function call
  3. frequency: once per bar
  4. notifications: email / app push / webhook (your choice)
  5. name it something clear: "sweep mapper — BTC 15m"
  6. create

  fires for every sweep and every buy/sell because the script uses internal
  alert() calls. alert text includes the level, touch count, and volume
  spike status.

OPTION B — only qualified BUY/SELL signals

  in the indicator settings, turn OFF "alert on sweep" and leave "alert on
  buy/sell signal" ON. then follow the steps above. you'll only get alerted
  on the filtered setups — nothing on raw sweeps.


===============================================================================
6. RECOMMENDED STARTING CONFIGURATIONS
===============================================================================

starting points. adjust based on what the chart is actually doing.

--- BTC / ETH (majors, 15m–1h) ---
  pivot length:         10
  zone width:           0.3%
  sweep wick min:       0.1%
  volume multiplier:    1.5x
  ema alignment:        on
  multi-touch:          off

--- SOL / mid-caps (15m–1h) ---
  pivot length:         10
  zone width:           0.4%
  sweep wick min:       0.15%
  volume multiplier:    1.5x
  ema alignment:        on
  multi-touch:          off

--- PEPE / meme coins (5m–15m) ---
  pivot length:         7
  zone width:           0.5%
  sweep wick min:       0.15%
  volume multiplier:    2.0x
  ema alignment:        off  (mean-reversion often works better)
  multi-touch:          on

--- lower timeframes (1m–5m) ---
  pivot length:         5–7
  zone width:           0.2%
  volume multiplier:    2.0x  (more noise to filter)
  multi-touch:          on    (strongly recommended)

--- higher timeframes (4h–1d, swing) ---
  pivot length:         15–20
  zone width:           0.4–0.5%
  ema lengths:          50 / 100 / 200
  multi-touch:          on


===============================================================================
7. TROUBLESHOOTING
===============================================================================

TOO MANY SIGNALS / TOO MUCH NOISE
  - turn on multi-touch zone requirement
  - raise volume multiplier to 2.0x+
  - increase pivot length to 15

TOO FEW SIGNALS / MISSING OBVIOUS SETUPS
  - turn off require volume spike
  - turn off ema trend alignment
  - lower sweep wick min to 0.05%
  - reduce pivot length to 7

ZONES IN THE WRONG PLACES
  - increase pivot length so only bigger pivots qualify
  - widen merge threshold so close zones consolidate

ROUND NUMBERS NOT MATCHING THE ASSET'S STRUCTURE
  - set round number interval manually instead of using auto

INDICATOR SLOW OR LAGGY
  - reduce max active zones to 10–15
  - turn off round number levels if not needed

"STUDY ERROR" ON PASTE
  - make sure you're pasting into pine editor (bottom of chart), not
    somewhere else
  - make sure the //@version=5 line at the top is intact
  - if tradingview changed something on their end and the script breaks,
    reply to the delivery email and i'll ship a fix


===============================================================================
8. SUPPORT
===============================================================================

reply to the delivery email. goes straight to noah@malloylabs.net.

for bespoke custom builds (starting at $500, calibrated entirely to your
trading profile — your pairs, your session, your capital, your risk):
  malloylabs.net

live trade documentation and process:
  @malloyalgos on twitter / x


===============================================================================
the code is yours. modify it, strip out what you don't need, add what you
do. if you build something genuinely better, let me know — i might use it.

— noah
===============================================================================
