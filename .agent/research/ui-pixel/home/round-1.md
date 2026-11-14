# Round 1 — home shell pixels

DIMENSIONS: spatial rhythm 9.2, hierarchy 9.6, typography 9.6, color 9.7, interaction 9.6, responsiveness 9.4, consistency 9.3
WEIGHTED: 9.48
BLOCKING: 0
MAJOR: 1
MINOR: 0
GATE: FAIL

- Major, desktop-1280x720.png: the category chips start left of the wordmark and the Forecasts card. Live measurement put the All chip at x=16 and the wordmark at x=96, because `.categories { margin: 0 }` cancelled the frame's `margin-inline: auto`.
