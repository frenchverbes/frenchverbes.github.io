<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Depot</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Syne+Mono&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0c0c0f; --surface: #141418; --surface2: #1c1c22;
  --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.14);
  --text: #f0ede8; --muted: #888880;
  --accent: #c8f060; --accent-dim: rgba(200,240,96,0.12);
  --red: #ff5f5f; --green: #5dca8c;
  --mono: 'Syne Mono', monospace; --sans: 'Syne', sans-serif;
  --sidebar: 320px;
}
html { background: var(--bg); color: var(--text); font-family: var(--sans); }
body { min-height: 100vh; max-width: 480px; margin: 0 auto; padding: 0 0 14rem; }

.header {
  padding: 1.2rem 1rem 0.65rem;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: var(--bg); z-index: 10;
}
.header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.logo { font-size: 1rem; font-weight: 800; letter-spacing: -0.02em; }
.logo span { color: var(--accent); }
.header-btns { display: flex; gap: 0.35rem; flex-wrap: wrap; justify-content: flex-end; }
.hbtn {
  font-family: var(--mono); font-size: 0.58rem; letter-spacing: 0.06em; text-transform: uppercase;
  background: none; border: 1px solid var(--border); color: var(--muted);
  padding: 0.26rem 0.52rem; border-radius: 4px; cursor: pointer; transition: all 0.15s;
}
.hbtn:hover { border-color: var(--border-hover); color: var(--text); }
.hbtn.sync-active { border-color: rgba(200,240,96,0.4); color: var(--accent); }

.summary { display: grid; grid-template-columns: repeat(4, 1fr); }
.summary-item { padding: 0.4rem 0; text-align: center; }
.summary-item:not(:last-child) { border-right: 1px solid var(--border); }
.summary-label {
  font-family: var(--mono); font-size: 0.48rem; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 0.1rem; line-height: 1.4;
}
.summary-value { font-size: 0.76rem; font-weight: 700; font-family: var(--mono); letter-spacing: -0.01em; }

.positions { padding: 0.4rem 0; }
.empty-state { padding: 2.5rem 1rem; text-align: center; color: var(--muted); font-size: 0.85rem; line-height: 1.6; }
.empty-state strong { display: block; font-size: 0.95rem; color: var(--text); margin-bottom: 0.4rem; }

.pos-group { border-bottom: 1px solid var(--border); overflow: hidden; animation: slideIn 0.3s ease both; }
@keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

.pos-header {
  display: grid; grid-template-columns: auto 1fr auto auto; gap: 0 0.6rem;
  align-items: center; padding: 0.8rem 1rem 0.45rem;
  cursor: pointer; user-select: none; transition: background 0.12s;
}
.pos-header:hover { background: var(--surface); }
.pos-header:active { background: var(--surface2); }

.ticker-badge {
  font-family: var(--mono); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.05em;
  background: var(--surface2); border: 1px solid var(--border); color: var(--accent);
  padding: 0.2rem 0.45rem; border-radius: 4px; min-width: 48px; text-align: center;
}
.ticker-badge.manual { border-color: rgba(200,240,96,0.3); }
.pos-name { font-size: 0.78rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pos-sub { font-family: var(--mono); font-size: 0.6rem; color: var(--muted); margin-top: 0.08rem; }
.pnl-badge { font-family: var(--mono); font-size: 0.7rem; font-weight: 600; text-align: right; white-space: nowrap; }
.pnl-badge.up { color: var(--green); } .pnl-badge.down { color: var(--red); }

/* Eye toggle button */
.eye-btn {
  background: none; border: none; cursor: pointer; padding: 0.15rem 0.25rem;
  color: var(--muted); transition: color 0.15s; font-size: 0.85rem; line-height: 1;
  flex-shrink: 0;
}
.eye-btn:hover { color: var(--text); }
.eye-btn.hidden { color: rgba(255,255,255,0.2); }

/* Hidden position overlay */
.pos-group.pos-hidden .pos-meta,
.pos-group.pos-hidden .lots-list,
.pos-group.pos-hidden .chart-container { display: none; }
.pos-group.pos-hidden .pos-header { opacity: 0.4; }
.pos-group.pos-hidden .pos-header:hover { opacity: 0.65; background: none; }
.hidden-badge {
  font-family: var(--mono); font-size: 0.48rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--muted); border: 1px solid var(--border); border-radius: 3px;
  padding: 0.1rem 0.3rem; margin-left: 0.3rem;
}

.pos-meta { display: grid; grid-template-columns: repeat(3, 1fr); padding: 0 1rem 0.65rem; gap: 0.35rem; }
.meta-label { font-family: var(--mono); font-size: 0.5rem; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.08rem; }
.meta-val { font-size: 0.76rem; font-weight: 600; font-family: var(--mono); }
.meta-val.pos { color: var(--green); } .meta-val.neg { color: var(--red); }

.lots-list { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.lots-list.open { max-height: 1000px; }

.lot-row {
  display: grid; grid-template-columns: 1fr auto auto auto;
  align-items: center; gap: 0.35rem;
  padding: 0.48rem 1rem 0.48rem 1.25rem; border-top: 1px solid var(--border);
}
.lot-info { font-size: 0.71rem; }
.lot-date { font-family: var(--mono); font-size: 0.58rem; color: var(--muted); margin-top: 0.06rem; }
.lot-chf { font-family: var(--mono); font-size: 0.67rem; text-align: right; }
.lot-pnl { font-family: var(--mono); font-size: 0.63rem; text-align: right; }
.lot-pnl.up { color: var(--green); } .lot-pnl.down { color: var(--red); }
.lot-sell-btn {
  font-family: var(--mono); font-size: 0.56rem; letter-spacing: 0.04em; text-transform: uppercase;
  background: none; border: 1px solid var(--border); color: var(--muted);
  padding: 0.18rem 0.4rem; border-radius: 3px; cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.lot-sell-btn:hover { border-color: var(--red); color: var(--red); }

/* Manual price update row */
.manual-update-row {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem 0.65rem 1.25rem; border-top: 1px solid var(--border);
}
.manual-price-input {
  background: var(--surface2); border: 1px solid var(--border); border-radius: 4px;
  color: var(--text); font-family: var(--mono); font-size: 0.72rem;
  padding: 0.28rem 0.5rem; outline: none; width: 110px; transition: border-color 0.15s;
}
.manual-price-input:focus { border-color: var(--border-hover); }
.manual-update-btn {
  font-family: var(--mono); font-size: 0.56rem; letter-spacing: 0.04em; text-transform: uppercase;
  background: none; border: 1px solid var(--border); color: var(--muted);
  padding: 0.18rem 0.4rem; border-radius: 3px; cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.manual-update-btn:hover { border-color: var(--accent); color: var(--accent); }
.manual-update-label { font-family: var(--mono); font-size: 0.55rem; color: var(--muted); }

.chart-container { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1); }
.chart-container.open { max-height: 380px; }
.chart-inner { padding: 0 1rem 1rem; }
.chart-tabs { display: flex; gap: 0.28rem; margin-bottom: 0.65rem; flex-wrap: wrap; }
.chart-tab {
  font-family: var(--mono); font-size: 0.56rem; letter-spacing: 0.05em; text-transform: uppercase;
  background: none; border: 1px solid var(--border); color: var(--muted);
  padding: 0.16rem 0.38rem; border-radius: 3px; cursor: pointer; transition: all 0.12s;
}
.chart-tab.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
.chart-canvas-wrap { height: 150px; position: relative; }
canvas { display: block; width: 100% !important; }
.chart-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 0.65rem; color: var(--muted); }

.history-section { padding: 0.7rem 1rem 1rem; }
.history-title { font-family: var(--mono); font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.55rem; }
.history-row { display: flex; align-items: center; padding: 0.35rem 0; border-bottom: 1px solid var(--border); gap: 0.45rem; }
.history-row:last-child { border-bottom: none; }
.h-sym { font-family: var(--mono); font-size: 0.63rem; color: var(--accent); min-width: 48px; }
.h-desc { flex: 1; font-size: 0.65rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.h-amt { font-family: var(--mono); font-size: 0.65rem; white-space: nowrap; }
.h-amt.buy { color: var(--red); } .h-amt.sell { color: var(--green); }

/* Sync modal */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100;
  display: flex; align-items: center; justify-content: center; padding: 1.25rem;
  opacity: 0; pointer-events: none; transition: opacity 0.2s;
}
.modal-backdrop.open { opacity: 1; pointer-events: all; }
.modal {
  background: var(--surface); border: 1px solid var(--border-hover); border-radius: 10px;
  width: 100%; max-width: 380px; padding: 1.4rem;
  transform: translateY(12px); transition: transform 0.2s;
}
.modal-backdrop.open .modal { transform: translateY(0); }
.modal-title { font-size: 0.88rem; font-weight: 800; margin-bottom: 0.22rem; }
.modal-sub { font-family: var(--mono); font-size: 0.6rem; color: var(--muted); margin-bottom: 1.1rem; line-height: 1.55; }
.modal-section-label { font-family: var(--mono); font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.38rem; }
.sync-code-display {
  background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;
  padding: 0.65rem 0.85rem; margin-bottom: 0.5rem;
  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
}
.sync-code-val { font-family: var(--mono); font-size: 1rem; font-weight: 600; color: var(--accent); letter-spacing: 0.1em; }
.sync-code-val.empty { color: var(--muted); font-size: 0.72rem; font-weight: 400; letter-spacing: 0.03em; }
.sync-action-btn {
  font-family: var(--mono); font-size: 0.56rem; letter-spacing: 0.05em; text-transform: uppercase;
  background: none; border: 1px solid var(--border); color: var(--muted);
  padding: 0.2rem 0.46rem; border-radius: 3px; cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.sync-action-btn:hover { border-color: var(--accent); color: var(--accent); }
.sync-divider { display: flex; align-items: center; gap: 0.6rem; margin: 0.9rem 0; }
.sync-divider::before, .sync-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.sync-divider span { font-family: var(--mono); font-size: 0.58rem; color: var(--muted); }
.sync-input-row { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; margin-bottom: 0.9rem; }
.sync-text-input {
  background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;
  color: var(--text); font-family: var(--mono); font-size: 0.8rem; letter-spacing: 0.08em;
  padding: 0.48rem 0.65rem; outline: none; transition: border-color 0.15s; text-transform: uppercase;
}
.sync-text-input::placeholder { color: var(--muted); text-transform: none; letter-spacing: 0.02em; font-size: 0.7rem; }
.sync-text-input:focus { border-color: var(--border-hover); }
.sync-load-btn {
  background: var(--accent); border: none; border-radius: 6px; color: #0c0c0f;
  font-family: var(--mono); font-size: 0.66rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 0.48rem 0.7rem; cursor: pointer; white-space: nowrap; transition: opacity 0.15s;
}
.sync-load-btn:hover { opacity: 0.88; }
.sync-load-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.sync-status { font-family: var(--mono); font-size: 0.62rem; min-height: 0.9rem; margin-bottom: 0.7rem; transition: color 0.2s; }
.sync-status.ok { color: var(--green); } .sync-status.err { color: var(--red); } .sync-status.info { color: var(--muted); }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border); padding-top: 0.85rem; }
.modal-close-btn {
  font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.05em; text-transform: uppercase;
  background: none; border: 1px solid var(--border); color: var(--muted);
  padding: 0.28rem 0.62rem; border-radius: 4px; cursor: pointer; transition: all 0.15s;
}
.modal-close-btn:hover { color: var(--text); border-color: var(--border-hover); }
.modal-push-btn {
  font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.05em; text-transform: uppercase;
  background: var(--accent-dim); border: 1px solid var(--accent); color: var(--accent);
  padding: 0.28rem 0.62rem; border-radius: 4px; cursor: pointer; transition: all 0.15s;
}
.modal-push-btn:hover { background: var(--accent); color: #0c0c0f; }
.modal-push-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Bottom panel */
.bottom-panel {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  background: var(--bg); border-top: 1px solid var(--border); z-index: 20;
  overflow: visible;
}
.panel-tabs { display: flex; border-bottom: 1px solid var(--border); }
.panel-tab {
  flex: 1; font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.07em; text-transform: uppercase;
  background: none; border: none; border-bottom: 2px solid transparent; color: var(--muted);
  padding: 0.52rem 0; cursor: pointer; transition: all 0.15s;
}
.panel-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.panel-body { padding: 0.65rem 1rem 0.8rem; }

.search-wrap { position: relative; margin-bottom: 0.48rem; }
.search-input, .amount-input {
  width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px;
  color: var(--text); font-family: var(--mono); font-size: 0.82rem;
  padding: 0.5rem 0.7rem; outline: none; transition: border-color 0.15s;
}
.search-input::placeholder, .amount-input::placeholder { color: var(--muted); font-size: 0.72rem; }
.search-input:focus, .amount-input:focus { border-color: var(--border-hover); }

.dropdown {
  position: absolute; bottom: calc(100% + 4px); left: 0; right: 0;
  background: var(--surface2); border: 1px solid var(--border-hover); border-radius: 6px;
  overflow-y: auto; max-height: 220px; display: none; z-index: 30;
}
.dropdown.visible { display: block; }
.dropdown-item {
  padding: 0.5rem 0.7rem; cursor: pointer; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 0.5rem; transition: background 0.1s;
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover { background: var(--surface); }
.dd-sym { font-family: var(--mono); font-size: 0.63rem; color: var(--accent); min-width: 50px; }
.dd-name { font-size: 0.72rem; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dd-exch { font-family: var(--mono); font-size: 0.55rem; color: var(--muted); flex-shrink: 0; }

.pill {
  display: none; align-items: center; gap: 0.45rem;
  background: var(--accent-dim); border: 1px solid var(--accent); border-radius: 4px;
  padding: 0.24rem 0.5rem; margin-bottom: 0.48rem;
}
.pill.visible { display: flex; }
.pill-sym { font-family: var(--mono); font-size: 0.68rem; font-weight: 700; color: var(--accent); }
.pill-name { font-size: 0.68rem; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pill-x { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1rem; line-height: 1; transition: color 0.12s; }
.pill-x:hover { color: var(--text); }

.buy-row { display: grid; grid-template-columns: 1fr auto; gap: 0.45rem; }
.buy-btn {
  background: var(--accent); border: none; border-radius: 6px; color: #0c0c0f;
  font-family: var(--mono); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 0.5rem 0.8rem; cursor: pointer; white-space: nowrap; transition: opacity 0.15s, transform 0.1s;
}
.buy-btn:hover { opacity: 0.88; } .buy-btn:active { transform: scale(0.97); }
.buy-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* Manual entry form */
.manual-toggle {
  font-family: var(--mono); font-size: 0.55rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--muted); background: none; border: none; cursor: pointer;
  padding: 0.2rem 0; margin-bottom: 0.4rem; transition: color 0.15s; display: block;
  text-decoration: underline; text-underline-offset: 3px;
}
.manual-toggle:hover { color: var(--text); }
.manual-form { display: none; border-top: 1px solid var(--border); padding-top: 0.6rem; margin-top: 0.2rem; }
.manual-form.visible { display: block; }
.manual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 0.4rem; }
.manual-input {
  width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 6px;
  color: var(--text); font-family: var(--mono); font-size: 0.75rem;
  padding: 0.42rem 0.6rem; outline: none; transition: border-color 0.15s;
}
.manual-input::placeholder { color: var(--muted); font-size: 0.68rem; }
.manual-input:focus { border-color: var(--border-hover); }
.manual-buy-btn {
  width: 100%; background: var(--surface2); border: 1px solid var(--accent); border-radius: 6px; color: var(--accent);
  font-family: var(--mono); font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 0.45rem; cursor: pointer; transition: all 0.15s;
}
.manual-buy-btn:hover { background: var(--accent-dim); }

.sell-list { max-height: 145px; overflow-y: auto; margin-bottom: 0.5rem; }
.sell-row { display: flex; align-items: center; padding: 0.4rem 0; border-bottom: 1px solid var(--border); gap: 0.45rem; }
.sell-row:last-child { border-bottom: none; }
.sell-ticker { font-family: var(--mono); font-size: 0.63rem; color: var(--accent); min-width: 44px; }
.sell-info { flex: 1; font-size: 0.65rem; color: var(--muted); }
.sell-pnl { font-family: var(--mono); font-size: 0.63rem; }
.sell-pnl.up { color: var(--green); } .sell-pnl.down { color: var(--red); }
.sell-pick-btn {
  font-family: var(--mono); font-size: 0.55rem; letter-spacing: 0.04em; text-transform: uppercase;
  background: none; border: 1px solid var(--border); color: var(--muted);
  padding: 0.17rem 0.4rem; border-radius: 3px; cursor: pointer; transition: all 0.12s;
}
.sell-pick-btn:hover { border-color: var(--accent); color: var(--accent); }
.sell-pick-btn.selected { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
.sell-amount-row { display: grid; grid-template-columns: 1fr auto; gap: 0.45rem; }
.sell-confirm-btn {
  background: var(--accent); border: none; border-radius: 6px; color: #0c0c0f;
  font-family: var(--mono); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  padding: 0.5rem 0.8rem; cursor: pointer; white-space: nowrap; transition: opacity 0.15s, transform 0.1s;
}
.sell-confirm-btn:hover { opacity: 0.88; } .sell-confirm-btn:active { transform: scale(0.97); }
.sell-empty { font-family: var(--mono); font-size: 0.68rem; color: var(--muted); padding: 0.35rem 0; }

.refresh-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--accent);
  display: inline-block; margin-left: 0.3rem;
  animation: pulse 2s ease-in-out infinite; vertical-align: middle;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }

/* ════════════════════════════════════════
   DESKTOP  ≥ 860px
   ════════════════════════════════════════ */
@media (min-width: 860px) {
  body {
    max-width: none;
    display: grid;
    grid-template-columns: 1fr var(--sidebar);
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      "header  header"
      "main    sidebar"
      "history sidebar";
    min-height: 100vh;
    padding: 0;
  }

  .header {
    grid-area: header;
    padding: 1rem 1.75rem 0.7rem;
    display: flex; align-items: center; gap: 2rem;
  }
  .header-top { margin-bottom: 0; flex-shrink: 0; }
  .summary {
    flex: 1; display: flex; gap: 0;
    border: none;
  }
  .summary-item {
    padding: 0 1.4rem 0 1.25rem;
    text-align: left;
    border-right: none !important;
    border-left: 1px solid var(--border);
  }
  .summary-item:first-child { border-left: none; padding-left: 0; }
  .summary-label { font-size: 0.5rem; }
  .summary-value { font-size: 0.92rem; }
  .header-btns { margin-left: auto; flex-shrink: 0; gap: 0.45rem; }

  .positions { grid-area: main; padding: 0; border-right: 1px solid var(--border); }
  .pos-header { padding: 1rem 1.5rem 0.5rem; }
  .pos-meta { padding: 0 1.5rem 0.75rem; gap: 0.5rem; }
  .meta-val { font-size: 0.82rem; }
  .chart-inner { padding: 0 1.5rem 1rem; }
  .lot-row { padding: 0.5rem 1.5rem 0.5rem 1.75rem; }
  .pos-name { font-size: 0.85rem; }
  .pos-sub { font-size: 0.63rem; }
  .ticker-badge { font-size: 0.7rem; min-width: 56px; }
  .pnl-badge { font-size: 0.75rem; }

  .history-section {
    grid-area: history;
    padding: 1rem 1.5rem 1.5rem;
    border-right: 1px solid var(--border);
    border-top: 1px solid var(--border);
  }

  /* Sidebar */
  .bottom-panel {
    grid-area: sidebar;
    position: sticky; top: 57px;
    transform: none; left: auto;
    width: auto; max-width: none;
    height: calc(100vh - 57px);
    overflow: visible;
    border-top: none;
    border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
  }
  .panel-tabs { flex-shrink: 0; }
  .panel-body { flex: 1; padding: 1rem 1.25rem 1.25rem; overflow-y: auto; }
  .search-input, .amount-input { font-size: 0.88rem; padding: 0.58rem 0.8rem; }
  .buy-btn, .sell-confirm-btn { font-size: 0.72rem; padding: 0.58rem 1rem; }
  .sell-list { max-height: 300px; }
  .dropdown {
    bottom: auto;
    top: calc(100% + 4px);
    max-height: 280px;
  }
}
</style>
</head>
<body>

<div class="header">
  <div class="header-top">
    <div class="logo">Depot<span>.</span><span class="refresh-dot"></span></div>
  </div>
  <div class="summary">
    <div class="summary-item">
      <div class="summary-label">Bargeld · CHF</div>
      <div class="summary-value" id="sumCash">–</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Depot · CHF</div>
      <div class="summary-value" id="sumDepot">–</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Gesamt · CHF</div>
      <div class="summary-value" id="sumTotal">–</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">G/V</div>
      <div class="summary-value" id="sumPnl">–</div>
    </div>
  </div>
  <div class="header-btns">
    <button class="hbtn" id="syncBtn" onclick="openSyncModal()">Sync</button>
    <button class="hbtn" id="expandAllBtn" onclick="toggleAll()">Aufklappen</button>
    <button class="hbtn" id="fixBtn" onclick="fixBuyPrices()" title="Kaufkurse anhand historischer Daten neu berechnen">Korrigieren</button>
    <button class="hbtn" onclick="resetConfirm()" style="color:var(--red);border-color:rgba(255,95,95,0.3)">Reset</button>
  </div>
</div>

<div class="positions" id="positionsList"></div>

<div class="history-section" id="historySection" style="display:none">
  <div class="history-title">Transaktionshistorie</div>
  <div id="historyList"></div>
</div>

<div class="modal-backdrop" id="syncModal" onclick="onBackdropClick(event)">
  <div class="modal">
    <div class="modal-title">Sync</div>
    <div class="modal-sub">Greife auf dein Depot von anderen Geräten zu – ohne Account. Teile deinen Code.</div>
    <div class="modal-section-label">Dein Sync-Code</div>
    <div class="sync-code-display">
      <span class="sync-code-val" id="currentCodeDisplay">–</span>
      <div style="display:flex;gap:0.35rem;flex-shrink:0">
        <button class="sync-action-btn" onclick="generateCode()">Neu</button>
        <button class="sync-action-btn" id="copyCodeBtn" onclick="copyCode()" style="display:none">Kopieren</button>
      </div>
    </div>
    <div class="sync-divider"><span>oder vorhandenen Code laden</span></div>
    <div class="sync-input-row">
      <input class="sync-text-input" id="syncCodeInput" placeholder="z. B. WOLF-42-DELTA" maxlength="20" oninput="onSyncInputChange()" />
      <button class="sync-load-btn" id="loadBtn" onclick="loadFromCode()" disabled>Laden</button>
    </div>
    <div class="sync-status info" id="syncStatus"></div>
    <div class="modal-footer">
      <button class="modal-close-btn" onclick="closeSyncModal()">Schließen</button>
      <button class="modal-push-btn" id="pushBtn" onclick="pushToCloud()" disabled>Jetzt hochladen</button>
    </div>
  </div>
</div>

<div class="bottom-panel">
  <div class="panel-tabs">
    <button class="panel-tab active" id="tab-buy" onclick="switchTab('buy')">Kaufen</button>
    <button class="panel-tab" id="tab-sell" onclick="switchTab('sell')">Verkaufen</button>
  </div>
  <div class="panel-body" id="panel-buy">
    <div class="search-wrap">
      <input class="search-input" id="searchInput" placeholder="Ticker suchen (z. B. Apple, NVDA…)" autocomplete="off" oninput="onSearch(this.value)" onfocus="onSearchFocus()" />
      <div class="dropdown" id="searchDropdown"></div>
    </div>
    <div class="pill" id="selectedPill">
      <span class="pill-sym" id="pillSym"></span>
      <span class="pill-name" id="pillName"></span>
      <button class="pill-x" onclick="clearSelection()">×</button>
    </div>
    <div class="buy-row">
      <input class="amount-input" id="amountInput" type="number" placeholder="Betrag in CHF" min="1" step="any" />
      <button class="buy-btn" id="buyBtn" onclick="buyPosition()" disabled>Kaufen</button>
    </div>

    <!-- Manual entry -->
    <button class="manual-toggle" onclick="toggleManualForm()">+ Manuell erfassen</button>
    <div class="manual-form" id="manualForm">
      <div class="manual-grid">
        <input class="manual-input" id="manualTicker" placeholder="Ticker (z.B. NESN)" maxlength="12" />
        <input class="manual-input" id="manualName" placeholder="Name (z.B. Nestlé)" />
      </div>
      <div class="manual-grid">
        <input class="manual-input" id="manualBuyPrice" type="number" placeholder="Kaufkurs CHF" min="0.01" step="any" />
        <input class="manual-input" id="manualAmount" type="number" placeholder="Betrag CHF" min="1" step="any" />
      </div>
      <button class="manual-buy-btn" onclick="buyManual()">Manuell kaufen</button>
    </div>
  </div>
  <div class="panel-body" id="panel-sell" style="display:none">
    <div class="sell-list" id="sellList"></div>
    <div class="sell-amount-row" id="sellAmountRow" style="display:none">
      <input class="amount-input" id="sellAmountInput" type="number" placeholder="Anzahl Aktien (leer = alle)" min="0.0001" step="any" />
      <button class="sell-confirm-btn" onclick="confirmSell()">Verkaufen</button>
    </div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-annotation/3.0.1/chartjs-plugin-annotation.min.js"></script>
<script>
const API = 'https://stock-worker.stock-worker.workers.dev';
const START_CASH = 10000;
const SK = 'depot_v3';
const SYNC_CODE_KEY = 'depot_sync_code';

let state = loadState();
let fxRate = null;
let allExpanded = false;
let selectedTicker = null;
let selectedSellSym = null;
let searchTimeout = null;
let searchResults = [];
let charts = {};
let priceCache = {};

function defaultState() { return { cash: START_CASH, lots: [], history: [] }; }
function loadState() {
  try { const r = localStorage.getItem(SK); if (r) return JSON.parse(r); } catch(e) {}
  return defaultState();
}
function save() { localStorage.setItem(SK, JSON.stringify(state)); }

function resetConfirm() {
  if (!confirm('Depot wirklich zurücksetzen?')) return;
  localStorage.removeItem(SK);
  state = defaultState();
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} });
  charts = {}; priceCache = {};
  document.getElementById('positionsList').innerHTML = '';
  document.getElementById('historySection').style.display = 'none';
  document.getElementById('historyList').innerHTML = '';
  silentPush();
  renderAll();
}

async function getFxRate() {
  try { const r = await fetch(API + '/api/fx'); const d = await r.json(); fxRate = d.rate; }
  catch(e) { fxRate = 0.9; }
}

function toChf(price, currency) {
  if (currency === 'CHF') return price;
  if (!fxRate) return price;
  if (currency === 'USD') return price * fxRate;
  if (currency === 'EUR') return price * fxRate * 1.05;
  return price * fxRate;
}

function fmtNum(v) {
  return v.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtChf(v) { return 'CHF\u00a0' + fmtNum(v); }
function fmtPct(v) { return (v >= 0 ? '+' : '') + v.toFixed(2) + '%'; }
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('de-CH', { day:'2-digit', month:'2-digit', year:'2-digit' })
    + ' ' + d.toLocaleTimeString('de-CH', { hour:'2-digit', minute:'2-digit' });
}

async function fetchPrice(symbol) {
  if (priceCache[symbol] && Date.now() - priceCache[symbol].ts < 60000) return priceCache[symbol].data;
  try {
    const r = await fetch(API + '/api/quote?symbol=' + encodeURIComponent(symbol));
    const d = await r.json();
    priceCache[symbol] = { ts: Date.now(), data: d };
    return d;
  } catch(e) { return null; }
}

async function refreshPrices() {
  // Only refresh non-manual positions
  const symbols = [...new Set(state.lots.filter(l => !l.manual).map(l => l.symbol))];
  for (const sym of symbols) {
    const q = await fetchPrice(sym);
    if (q && q.price) {
      state.lots.forEach(l => {
        if (l.symbol === sym && !l.manual) { l.currentPriceNative = q.price; l.currency = q.currency; }
      });
    }
  }
  save();
  renderAll();
}

function groupLots() {
  const map = {};
  for (const lot of state.lots) {
    if (!map[lot.symbol]) map[lot.symbol] = { symbol: lot.symbol, name: lot.name, currency: lot.currency, manual: lot.manual || false, lots: [] };
    map[lot.symbol].lots.push(lot);
  }
  return Object.values(map);
}

// Returns only visible groups for summary calculations
function visibleGroups() {
  return groupLots().filter(g => !state.hidden || !state.hidden[g.symbol]);
}

function renderAll() { updateSummary(); renderPositions(); renderSellPanel(); renderHistory(); }

function updateSummary() {
  let depotChf = 0;
  let hiddenManualCost = 0;
  const hidden = state.hidden || {};
  for (const lot of state.lots) {
    if (hidden[lot.symbol]) {
      if (lot.manual) hiddenManualCost += lot.shares * (lot.buyPriceChf || lot.buyPriceNative);
      continue;
    }
    const p = lot.currentPriceNative || lot.buyPriceNative;
    depotChf += lot.shares * toChf(p, lot.currency);
  }
  const virtualCash = state.cash + hiddenManualCost;
  const total = virtualCash + depotChf;
  const pnl = ((total - START_CASH) / START_CASH) * 100;
  document.getElementById('sumCash').textContent  = fmtNum(virtualCash);
  document.getElementById('sumDepot').textContent = fmtNum(depotChf);
  document.getElementById('sumTotal').textContent = fmtNum(total);
  const el = document.getElementById('sumPnl');
  el.textContent = fmtPct(pnl);
  el.style.color = pnl >= 0 ? 'var(--green)' : 'var(--red)';
}

function toggleHidden(sym, event) {
  event.stopPropagation();
  if (!state.hidden) state.hidden = {};
  state.hidden[sym] = !state.hidden[sym];
  save();
  renderAll();
}

function renderPositions() {
  const list = document.getElementById('positionsList');
  const groups = groupLots();
  const hidden = state.hidden || {};

  if (!groups.length) {
    list.innerHTML = '<div class="empty-state"><strong>Keine Positionen</strong>Kaufe deine erste Aktie im Panel.</div>';
    return;
  }

  [...list.querySelectorAll('.pos-group')].forEach(el => {
    if (!groups.find(g => g.symbol === el.dataset.sym)) {
      el.style.transition = 'opacity 0.2s'; el.style.opacity = '0';
      setTimeout(() => el.remove(), 220);
    }
  });

  groups.forEach((g, gi) => {
    let costChf = 0, curValChf = 0, totalShares = 0;
    for (const lot of g.lots) {
      const cp = lot.currentPriceNative || lot.buyPriceNative;
      costChf    += lot.shares * (lot.buyPriceChf || toChf(lot.buyPriceNative, lot.currency));
      curValChf  += lot.shares * toChf(cp, lot.currency);
      totalShares += lot.shares;
    }
    const pnlAbs = curValChf - costChf;
    const pnlPct = costChf > 0 ? (pnlAbs / costChf) * 100 : 0;
    const curPriceChf = toChf(g.lots[0].currentPriceNative || g.lots[0].buyPriceNative, g.currency);
    const isHidden = !!hidden[g.symbol];
    const isManual = !!g.manual;

    const eyeIcon = isHidden
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

    const manualBadge = isManual ? `<span style="font-family:var(--mono);font-size:0.45rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);border:1px solid var(--border);border-radius:3px;padding:0.1rem 0.28rem;margin-left:0.3rem;">manuell</span>` : '';

    const existing = document.getElementById('grp-' + g.symbol);
    if (existing) {
      existing.className = 'pos-group' + (isHidden ? ' pos-hidden' : '');
      existing.querySelector('.pos-sub').textContent = fmtChf(curPriceChf) + ' · ' + totalShares.toFixed(4);
      const pb = existing.querySelector('.pnl-badge');
      pb.textContent = fmtPct(pnlPct);
      pb.className = 'pnl-badge ' + (pnlPct >= 0 ? 'up' : 'down');
      existing.querySelector('.mv-cost').textContent = fmtChf(costChf);
      existing.querySelector('.mv-val').textContent  = fmtChf(curValChf);
      const pe = existing.querySelector('.mv-pnl');
      pe.textContent = (pnlAbs >= 0 ? '+' : '') + fmtChf(pnlAbs);
      pe.className = 'meta-val mv-pnl ' + (pnlAbs >= 0 ? 'pos' : 'neg');
      existing.querySelector('.lots-list').innerHTML = buildLotsHtml(g);
      const eyeBtn = existing.querySelector('.eye-btn');
      if (eyeBtn) { eyeBtn.innerHTML = eyeIcon; eyeBtn.className = 'eye-btn' + (isHidden ? ' hidden' : ''); }
      return;
    }

    const div = document.createElement('div');
    div.className = 'pos-group' + (isHidden ? ' pos-hidden' : '');
    div.id = 'grp-' + g.symbol; div.dataset.sym = g.symbol;
    div.style.animationDelay = (gi * 0.04) + 's';

    const chartSection = isManual ? buildManualUpdateHtml(g) : `
      <div class="chart-container" id="chart-${g.symbol}">
        <div class="chart-inner">
          <div class="chart-tabs" id="tabs-${g.symbol}">
            <button class="chart-tab active" onclick="loadChart('${g.symbol}','1d',this)">1T</button>
            <button class="chart-tab" onclick="loadChart('${g.symbol}','5d',this)">5T</button>
            <button class="chart-tab" onclick="loadChart('${g.symbol}','1mo',this)">1M</button>
            <button class="chart-tab" onclick="loadChart('${g.symbol}','3mo',this)">3M</button>
            <button class="chart-tab" onclick="loadChart('${g.symbol}','1y',this)">1J</button>
            <button class="chart-tab" onclick="loadChart('${g.symbol}','5y',this)">5J</button>
            <button class="chart-tab" onclick="loadChart('${g.symbol}','max',this)">Max</button>
          </div>
          <div class="chart-canvas-wrap">
            <div class="chart-loading" id="loading-${g.symbol}">laden…</div>
            <canvas id="canvas-${g.symbol}" height="150"></canvas>
          </div>
        </div>
      </div>`;

    div.innerHTML = `
      <div class="pos-header" onclick="toggleGroup('${g.symbol}')">
        <div class="ticker-badge ${isManual ? 'manual' : ''}">${g.symbol}</div>
        <div>
          <div class="pos-name">${g.name}${manualBadge}</div>
          <div class="pos-sub">${fmtChf(curPriceChf)} · ${totalShares.toFixed(4)}</div>
        </div>
        <div class="pnl-badge ${pnlPct >= 0 ? 'up' : 'down'}">${fmtPct(pnlPct)}</div>
        ${isManual ? `<button class="eye-btn${isHidden ? ' hidden' : ''}" onclick="toggleHidden('${g.symbol}', event)" title="${isHidden ? 'Einblenden' : 'Ausblenden'}">${eyeIcon}</button>` : ''}
      </div>
      <div class="pos-meta">
        <div><div class="meta-label">Einstand</div><div class="meta-val mv-cost">${fmtChf(costChf)}</div></div>
        <div><div class="meta-label">Aktuell</div><div class="meta-val mv-val">${fmtChf(curValChf)}</div></div>
        <div><div class="meta-label">G/V</div><div class="meta-val mv-pnl ${pnlAbs >= 0 ? 'pos' : 'neg'}">${(pnlAbs >= 0 ? '+' : '') + fmtChf(pnlAbs)}</div></div>
      </div>
      <div class="lots-list" id="lots-${g.symbol}">${buildLotsHtml(g)}</div>
      ${chartSection}`;
    list.appendChild(div);
  });
}

function buildManualUpdateHtml(g) {
  return `
    <div class="chart-container" id="chart-${g.symbol}">
      <div class="manual-update-row">
        <span class="manual-update-label">Kurs aktualisieren:</span>
        <input class="manual-price-input" id="manualCurPrice-${g.symbol}" type="number" placeholder="${fmtNum(g.lots[0].currentPriceNative || g.lots[0].buyPriceNative)}" min="0.01" step="any" />
        <button class="manual-update-btn" onclick="updateManualPrice('${g.symbol}')">Setzen</button>
      </div>
    </div>`;
}

function updateManualPrice(sym) {
  const input = document.getElementById('manualCurPrice-' + sym);
  const newPrice = parseFloat(input.value);
  if (!newPrice || newPrice <= 0) return;
  state.lots.forEach(l => {
    if (l.symbol === sym && l.manual) l.currentPriceNative = newPrice;
  });
  input.value = '';
  save();
  silentPush();
  renderAll();
}

function buildLotsHtml(g) {
  return [...g.lots].sort((a,b) => new Date(b.boughtAt) - new Date(a.boughtAt)).map(lot => {
    const buyChf  = lot.buyPriceChf || toChf(lot.buyPriceNative, lot.currency);
    const costChf = lot.shares * buyChf;
    const cp      = lot.currentPriceNative || lot.buyPriceNative;
    const curChf  = lot.shares * toChf(cp, lot.currency);
    const pnlAbs  = curChf - costChf;
    const pnlPct  = (pnlAbs / costChf) * 100;
    return `
      <div class="lot-row">
        <div>
          <div class="lot-info">${lot.shares.toFixed(4)} @ ${fmtChf(buyChf)}</div>
          <div class="lot-date">${fmtDate(lot.boughtAt)}</div>
        </div>
        <div class="lot-chf">${fmtChf(curChf)}</div>
        <div class="lot-pnl ${pnlAbs >= 0 ? 'up' : 'down'}">${fmtPct(pnlPct)}</div>
        <button class="lot-sell-btn" onclick="quickSellLot('${lot.id}')">Verk.</button>
      </div>`;
  }).join('');
}

function toggleGroup(sym) {
  const chartEl = document.getElementById('chart-' + sym);
  const lotsEl  = document.getElementById('lots-'  + sym);
  const wasOpen = chartEl && chartEl.classList.contains('open');
  if (chartEl) chartEl.classList.toggle('open');
  if (lotsEl) lotsEl.classList.toggle('open');
  const g = groupLots().find(x => x.symbol === sym);
  if (!wasOpen && g && !g.manual) loadChart(sym, '1d', document.querySelector('#tabs-' + sym + ' .chart-tab'));
}

function toggleAll() {
  allExpanded = !allExpanded;
  document.getElementById('expandAllBtn').textContent = allExpanded ? 'Einklappen' : 'Aufklappen';
  groupLots().forEach(g => {
    const chartEl = document.getElementById('chart-' + g.symbol);
    const lotsEl  = document.getElementById('lots-'  + g.symbol);
    if (!chartEl) return;
    if (allExpanded) {
      chartEl.classList.add('open'); if (lotsEl) lotsEl.classList.add('open');
      if (!g.manual) loadChart(g.symbol, '1d', document.querySelector('#tabs-' + g.symbol + ' .chart-tab'));
    } else {
      chartEl.classList.remove('open'); if (lotsEl) lotsEl.classList.remove('open');
    }
  });
}

function intervalForRange(r) {
  return {'1d':'5m','5d':'30m','1mo':'1d','3mo':'1d','1y':'1wk','5y':'1mo','max':'3mo'}[r] || '1d';
}

async function loadChart(sym, range, tabEl) {
  const tabs = document.querySelectorAll('#tabs-' + sym + ' .chart-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');
  const loading = document.getElementById('loading-' + sym);
  const canvas  = document.getElementById('canvas-'  + sym);
  if (!canvas) return;
  loading.style.display = 'flex'; loading.textContent = 'laden…';
  canvas.style.display = 'none';
  if (charts[sym]) { try { charts[sym].destroy(); } catch(e){} delete charts[sym]; }
  const interval = intervalForRange(range);
  try {
    const r = await fetch(API + '/api/chart?symbol=' + encodeURIComponent(sym) + '&range=' + range + '&interval=' + interval);
    const d = await r.json();
    if (!d.points || !d.points.length) throw new Error('no data');
    const lot = state.lots.find(l => l.symbol === sym);
    const currency = lot ? lot.currency : 'USD';
    const labels = d.points.map(p => {
      const dt = new Date(p.time * 1000);
      if (range === '1d') return dt.toLocaleTimeString('de-CH', { hour:'2-digit', minute:'2-digit' });
      if (range === '5d') return dt.toLocaleDateString('de-CH', { weekday:'short' }) + ' ' + dt.toLocaleTimeString('de-CH', { hour:'2-digit', minute:'2-digit' });
      if (range === '5y' || range === 'max') return dt.toLocaleDateString('de-CH', { year:'2-digit', month:'short' });
      return dt.toLocaleDateString('de-CH', { month:'short', day:'numeric' });
    });
    const values = d.points.map(p => toChf(p.value, currency));
    const isUp = values[values.length-1] >= values[0];
    const color = isUp ? '#5dca8c' : '#ff5f5f';

    // Buy markers
    const symLots = state.lots.filter(l => l.symbol === sym);
    const annotations = {};
    symLots.forEach((lot, idx) => {
      const buyTime = new Date(lot.boughtAt).getTime();
      let closestIdx = 0, minDiff = Infinity;
      d.points.forEach((p, i) => {
        const diff = Math.abs(p.time * 1000 - buyTime);
        if (diff < minDiff) { minDiff = diff; closestIdx = i; }
      });
      const buyPriceChf = lot.buyPriceChf || toChf(lot.buyPriceNative, lot.currency);
      annotations['buy_' + idx] = {
        type: 'line', xMin: closestIdx, xMax: closestIdx,
        borderColor: 'rgba(200,240,96,0.7)', borderWidth: 1.5, borderDash: [3,3],
        label: {
          display: true, content: 'Kauf ' + fmtChf(buyPriceChf), position: 'start',
          backgroundColor: 'rgba(12,12,15,0.85)', color: '#c8f060',
          font: { family:"'Syne Mono',monospace", size:9 },
          padding: { top:2, bottom:2, left:4, right:4 }, borderRadius: 3, yAdjust: 6
        }
      };
    });

    loading.style.display = 'none'; canvas.style.display = 'block';
    charts[sym] = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets: [{
        data: values, borderColor: color, borderWidth: 1.5, pointRadius: 0, fill: true,
        backgroundColor: ctx => {
          const g2 = ctx.chart.ctx.createLinearGradient(0,0,0,150);
          g2.addColorStop(0, isUp ? 'rgba(93,202,140,0.18)' : 'rgba(255,95,95,0.18)');
          g2.addColorStop(1, 'rgba(0,0,0,0)'); return g2;
        }, tension: 0.3
      }]},
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 450, easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          annotation: { annotations },
          tooltip: {
            backgroundColor: '#1c1c22', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
            titleColor: '#888880', bodyColor: '#f0ede8',
            titleFont: { family:"'Syne Mono',monospace", size:9 },
            bodyFont:  { family:"'Syne Mono',monospace", size:10 },
            callbacks: { label: ctx => fmtChf(ctx.raw) }
          }
        },
        scales: {
          x: { grid:{display:false}, border:{display:false},
            ticks:{color:'#888880', font:{family:"'Syne Mono',monospace",size:8}, maxTicksLimit:5, maxRotation:0} },
          y: { position:'right', border:{display:false}, grid:{color:'rgba(255,255,255,0.04)'},
            ticks:{color:'#888880', font:{family:"'Syne Mono',monospace",size:8}, maxTicksLimit:4, callback:v=>v.toFixed(0)} }
        }
      }
    });
  } catch(e) {
    loading.textContent = 'Keine Daten'; loading.style.display = 'flex'; canvas.style.display = 'none';
  }
}

// ── Manual Buy ────────────────────────────────────────────────
function toggleManualForm() {
  const form = document.getElementById('manualForm');
  form.classList.toggle('visible');
}

function buyManual() {
  const ticker    = document.getElementById('manualTicker').value.trim().toUpperCase();
  const name      = document.getElementById('manualName').value.trim();
  const buyPrice  = parseFloat(document.getElementById('manualBuyPrice').value);
  const amount    = parseFloat(document.getElementById('manualAmount').value);

  if (!ticker || !name || !buyPrice || !amount) { alert('Alle Felder ausfüllen.'); return; }
  if (amount > state.cash + 0.001) { alert('Nicht genug Bargeld.\nVerfügbar: ' + fmtChf(state.cash)); return; }

  const shares = amount / buyPrice;
  const lot = {
    id: Date.now().toString(),
    symbol: ticker, name,
    shares,
    buyPriceNative: buyPrice,
    buyPriceChf: buyPrice,
    currentPriceNative: buyPrice,
    currency: 'CHF',
    manual: true,
    boughtAt: new Date().toISOString()
  };
  state.lots.push(lot);
  state.cash -= amount;
  state.history.unshift({ type:'buy', symbol:ticker, name, shares, priceChf:buyPrice, totalChf:amount, at:lot.boughtAt, manual:true });
  save();
  silentPush();

  // Clear form
  ['manualTicker','manualName','manualBuyPrice','manualAmount'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('manualForm').classList.remove('visible');
  document.getElementById('positionsList').innerHTML = '';
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} }); charts = {};
  renderAll();
}

// ── Buy ───────────────────────────────────────────────────────
async function buyPosition() {
  if (!selectedTicker) return;
  const amount = parseFloat(document.getElementById('amountInput').value);
  if (!amount || amount <= 0) return;
  if (amount > state.cash + 0.001) { alert('Nicht genug Bargeld.\nVerfügbar: ' + fmtChf(state.cash)); return; }
  const btn = document.getElementById('buyBtn');
  btn.disabled = true; btn.textContent = 'Laden…';
  const quote = await fetchPrice(selectedTicker.symbol);
  if (!quote || !quote.price) {
    btn.textContent = 'Fehler'; setTimeout(() => { btn.textContent = 'Kaufen'; btn.disabled = false; }, 1500); return;
  }
  const priceChf = toChf(quote.price, quote.currency);
  const shares   = amount / priceChf;
  const lot = {
    id: Date.now().toString(),
    symbol: selectedTicker.symbol, name: selectedTicker.name,
    shares,
    buyPriceNative: quote.price,
    buyPriceChf: priceChf,
    currentPriceNative: quote.price,
    currency: quote.currency,
    boughtAt: new Date().toISOString()
  };
  state.lots.push(lot);
  state.cash -= amount;
  state.history.unshift({ type:'buy', symbol:lot.symbol, name:lot.name, shares, priceChf, totalChf:amount, at:lot.boughtAt });
  save();
  silentPush();
  clearSelection();
  document.getElementById('amountInput').value = '';
  btn.textContent = 'Kaufen'; btn.disabled = true;
  document.getElementById('positionsList').innerHTML = '';
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} }); charts = {};
  renderAll();
}

// ── Sell ──────────────────────────────────────────────────────
function renderSellPanel() {
  const container = document.getElementById('sellList');
  const groups = groupLots();
  if (!groups.length) {
    container.innerHTML = '<div class="sell-empty">Keine offenen Positionen.</div>';
    document.getElementById('sellAmountRow').style.display = 'none'; return;
  }
  container.innerHTML = groups.map(g => {
    let totalShares = 0, costChf = 0, curValChf = 0;
    for (const lot of g.lots) {
      totalShares += lot.shares;
      costChf    += lot.shares * (lot.buyPriceChf || toChf(lot.buyPriceNative, lot.currency));
      const cp = lot.currentPriceNative || lot.buyPriceNative;
      curValChf  += lot.shares * toChf(cp, lot.currency);
    }
    const pnl = costChf > 0 ? ((curValChf - costChf) / costChf) * 100 : 0;
    const isSel = selectedSellSym === g.symbol;
    return `
      <div class="sell-row">
        <span class="sell-ticker">${g.symbol}</span>
        <span class="sell-info">${totalShares.toFixed(3)} · ${fmtChf(curValChf)}</span>
        <span class="sell-pnl ${pnl >= 0 ? 'up' : 'down'}">${fmtPct(pnl)}</span>
        <button class="sell-pick-btn ${isSel ? 'selected' : ''}" onclick="selectSellSym('${g.symbol}','${totalShares}')">
          ${isSel ? '✓' : 'Wählen'}
        </button>
      </div>`;
  }).join('');
}

function selectSellSym(sym, maxShares) {
  selectedSellSym = sym;
  document.getElementById('sellAmountRow').style.display = 'grid';
  document.getElementById('sellAmountInput').placeholder = 'Anzahl (max ' + parseFloat(maxShares).toFixed(4) + ', leer = alle)';
  renderSellPanel();
}

function quickSellLot(lotId) {
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot) return;
  switchTab('sell');
  selectedSellSym = lot.symbol;
  document.getElementById('sellAmountRow').style.display = 'grid';
  document.getElementById('sellAmountInput').value = lot.shares.toFixed(4);
  document.getElementById('sellAmountInput').placeholder = 'Anzahl';
  renderSellPanel();
}

async function confirmSell() {
  if (!selectedSellSym) return;
  const sym = selectedSellSym;
  const groups = groupLots();
  const g = groups.find(x => x.symbol === sym);
  if (!g) return;
  let maxShares = 0;
  for (const lot of g.lots) maxShares += lot.shares;
  const raw = parseFloat(document.getElementById('sellAmountInput').value);
  const sharesToSell = (isNaN(raw) || raw <= 0) ? maxShares : raw;
  if (sharesToSell > maxShares + 0.00001) { alert('Nicht genug Aktien.\nVerfügbar: ' + maxShares.toFixed(4)); return; }
  const isManual = g.manual;
  let priceNative, priceChf;
  if (isManual) {
    priceNative = g.lots[0].currentPriceNative || g.lots[0].buyPriceNative;
    priceChf = priceNative;
  } else {
    const quote = await fetchPrice(sym);
    priceNative = (quote && quote.price) ? quote.price : (g.lots[0].currentPriceNative || g.lots[0].buyPriceNative);
    priceChf = toChf(priceNative, g.lots[0].currency);
  }
  const proceeds = sharesToSell * priceChf;
  let remaining = sharesToSell;
  const toRemove = [];
  for (const lot of [...g.lots].sort((a,b) => new Date(a.boughtAt) - new Date(b.boughtAt))) {
    if (remaining <= 0) break;
    if (lot.shares <= remaining + 0.000001) { remaining -= lot.shares; toRemove.push(lot.id); }
    else { lot.shares -= remaining; remaining = 0; }
  }
  state.lots = state.lots.filter(l => !toRemove.includes(l.id));
  // Clean up hidden state if fully sold
  if (!state.lots.find(l => l.symbol === sym) && state.hidden) delete state.hidden[sym];
  state.cash += proceeds;
  state.history.unshift({ type:'sell', symbol:sym, name:g.name, shares:sharesToSell, priceChf, totalChf:proceeds, at:new Date().toISOString() });
  save();
  silentPush();
  selectedSellSym = null;
  document.getElementById('sellAmountInput').value = '';
  document.getElementById('sellAmountRow').style.display = 'none';
  const stillHas = state.lots.find(l => l.symbol === sym);
  if (!stillHas) {
    if (charts[sym]) { try { charts[sym].destroy(); } catch(e){} delete charts[sym]; }
    const el = document.getElementById('grp-' + sym);
    if (el) { el.style.transition = 'opacity 0.2s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 220); }
  }
  renderAll();
}

// ── History ───────────────────────────────────────────────────
function renderHistory() {
  const section = document.getElementById('historySection');
  const list    = document.getElementById('historyList');
  if (!state.history.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = state.history.slice(0, 30).map(h => `
    <div class="history-row">
      <span class="h-sym">${h.symbol}</span>
      <span class="h-desc">${h.type === 'buy' ? 'Kauf' : 'Verk.'} ${h.shares.toFixed(3)} · ${fmtDate(h.at)}</span>
      <span class="h-amt ${h.type}">${h.type === 'buy' ? '−' : '+'}${fmtChf(h.totalChf)}</span>
    </div>`).join('');
}

// ── Search ────────────────────────────────────────────────────
async function onSearch(q) {
  clearTimeout(searchTimeout);
  if (q.length < 2) { closeDropdown(); return; }
  searchTimeout = setTimeout(async () => {
    try {
      const r = await fetch(API + '/api/search?q=' + encodeURIComponent(q));
      searchResults = await r.json(); renderDropdown(searchResults);
    } catch(e) {}
  }, 300);
}
function renderDropdown(results) {
  const dd = document.getElementById('searchDropdown');
  if (!results.length) { dd.classList.remove('visible'); return; }
  dd.innerHTML = results.map((r,i) => `
    <div class="dropdown-item" onclick="selectTicker(${i})">
      <span class="dd-sym">${r.symbol}</span>
      <span class="dd-name">${r.name}</span>
      <span class="dd-exch">${r.exchange||''}</span>
    </div>`).join('');
  dd.classList.add('visible');
}
function closeDropdown() { document.getElementById('searchDropdown').classList.remove('visible'); }
function onSearchFocus() { if (searchResults.length) renderDropdown(searchResults); }
function selectTicker(i) {
  selectedTicker = searchResults[i];
  document.getElementById('searchInput').value = '';
  closeDropdown();
  document.getElementById('pillSym').textContent  = selectedTicker.symbol;
  document.getElementById('pillName').textContent = selectedTicker.name;
  document.getElementById('selectedPill').classList.add('visible');
  document.getElementById('buyBtn').disabled = false;
  document.getElementById('amountInput').focus();
}
function clearSelection() {
  selectedTicker = null;
  document.getElementById('selectedPill').classList.remove('visible');
  document.getElementById('buyBtn').disabled = true;
}

function switchTab(tab) {
  document.getElementById('panel-buy').style.display  = tab === 'buy'  ? 'block' : 'none';
  document.getElementById('panel-sell').style.display = tab === 'sell' ? 'block' : 'none';
  document.getElementById('tab-buy').classList.toggle('active',  tab === 'buy');
  document.getElementById('tab-sell').classList.toggle('active', tab === 'sell');
  if (tab === 'sell') renderSellPanel();
}

document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) closeDropdown(); });

// ── Sync ──────────────────────────────────────────────────────
const ADJECTIVES = ['WOLF','HAWK','LYNX','BEAR','BULL','STAG','IBIS','CROW','KITE','WREN','PIKE','JADE','ONYX','NOVA','ZETA'];
const NOUNS      = ['DELTA','SIGMA','ALPHA','OMEGA','PRIME','NEXUS','ATLAS','ORBIT','FORGE','ZENITH'];

function generateSyncCode() {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const num  = Math.floor(10 + Math.random() * 90);
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}-${num}-${noun}`;
}
function getSavedCode() { return localStorage.getItem(SYNC_CODE_KEY) || null; }
function setSavedCode(code) { localStorage.setItem(SYNC_CODE_KEY, code); }

async function silentPush() {
  const code = getSavedCode();
  if (!code) return;
  try {
    await fetch(API + '/api/sync?code=' + encodeURIComponent(code), {
      method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(state)
    });
  } catch(e) {}
}

async function autoPullOnLoad() {
  const code = getSavedCode();
  if (!code) return;
  try {
    const res = await fetch(API + '/api/sync?code=' + encodeURIComponent(code));
    if (!res.ok) return;
    const remote = await res.json();
    const remoteLatest = remote.history?.[0]?.at || '';
    const localLatest  = state.history?.[0]?.at  || '';
    const remoteNewer  = remoteLatest > localLatest;
    const remoteMore   = (remote.history?.length || 0) > (state.history?.length || 0);
    if (remoteNewer || remoteMore) {
      state = remote; save();
      Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} }); charts = {};
      document.getElementById('positionsList').innerHTML = '';
      renderAll();
    }
  } catch(e) {}
}

function openSyncModal() { document.getElementById('syncModal').classList.add('open'); refreshSyncModalUI(); }
function closeSyncModal() { document.getElementById('syncModal').classList.remove('open'); setSyncStatus('',''); }
function onBackdropClick(e) { if (e.target === document.getElementById('syncModal')) closeSyncModal(); }

function refreshSyncModalUI() {
  const code    = getSavedCode();
  const display = document.getElementById('currentCodeDisplay');
  const copyBtn = document.getElementById('copyCodeBtn');
  const pushBtn = document.getElementById('pushBtn');
  const syncBtn = document.getElementById('syncBtn');
  if (code) {
    display.textContent = code; display.className = 'sync-code-val';
    copyBtn.style.display = 'inline-block'; pushBtn.disabled = false;
    syncBtn.classList.add('sync-active');
  } else {
    display.textContent = 'Noch kein Code'; display.className = 'sync-code-val empty';
    copyBtn.style.display = 'none'; pushBtn.disabled = true;
    syncBtn.classList.remove('sync-active');
  }
}
function generateCode() {
  setSavedCode(generateSyncCode()); refreshSyncModalUI();
  setSyncStatus('Code generiert — jetzt hochladen zum Aktivieren.', 'info');
}
function copyCode() {
  const code = getSavedCode(); if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    setSyncStatus('Code kopiert!', 'ok'); setTimeout(() => setSyncStatus('','info'), 2000);
  });
}
function onSyncInputChange() {
  document.getElementById('loadBtn').disabled = document.getElementById('syncCodeInput').value.trim().length < 5;
  setSyncStatus('','info');
}
function setSyncStatus(msg, type) {
  const el = document.getElementById('syncStatus');
  el.textContent = msg; el.className = 'sync-status ' + (type || 'info');
}
async function pushToCloud() {
  const code = getSavedCode(); if (!code) return;
  const pushBtn = document.getElementById('pushBtn');
  pushBtn.disabled = true; pushBtn.textContent = 'Lädt…';
  setSyncStatus('Verbinde…', 'info');
  try {
    const res = await fetch(API + '/api/sync?code=' + encodeURIComponent(code), {
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(state)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    setSyncStatus('✓ Hochgeladen — ' + new Date().toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'}), 'ok');
  } catch(e) {
    setSyncStatus('Fehler. Worker erreichbar?', 'err');
  } finally { pushBtn.disabled = false; pushBtn.textContent = 'Jetzt hochladen'; }
}
async function loadFromCode() {
  const raw = document.getElementById('syncCodeInput').value.trim().toUpperCase();
  if (!raw) return;
  const loadBtn = document.getElementById('loadBtn');
  loadBtn.disabled = true; loadBtn.textContent = 'Lädt…';
  setSyncStatus('Suche Depot…', 'info');
  try {
    const res = await fetch(API + '/api/sync?code=' + encodeURIComponent(raw));
    if (res.status === 404) { setSyncStatus('Code nicht gefunden.', 'err'); return; }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const loaded = await res.json();
    if (!confirm('Depot von "' + raw + '" laden? Überschreibt lokale Daten.')) return;
    state = loaded; save(); setSavedCode(raw);
    document.getElementById('syncCodeInput').value = '';
    Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} }); charts = {};
    document.getElementById('positionsList').innerHTML = '';
    renderAll(); await refreshPrices();
    refreshSyncModalUI(); setSyncStatus('✓ Depot geladen!', 'ok');
  } catch(e) {
    setSyncStatus('Verbindungsfehler.', 'err');
  } finally { loadBtn.disabled = false; loadBtn.textContent = 'Laden'; }
}

// ── Fix buy prices ────────────────────────────────────────────
async function fixBuyPrices() {
  if (!confirm('Kaufkurse anhand historischer Daten korrigieren?\nManuelle Einträge werden übersprungen.')) return;
  const btn = document.getElementById('fixBtn');
  btn.textContent = 'Lädt…'; btn.disabled = true;

  const symbols = [...new Set(state.lots.filter(l => !l.manual).map(l => l.symbol))];
  let fixed = 0, failed = 0;

  for (const sym of symbols) {
    const symLots = state.lots.filter(l => l.symbol === sym && !l.manual);
    // Fetch a wide range to cover all buy dates
    try {
      const r = await fetch(API + '/api/chart?symbol=' + encodeURIComponent(sym) + '&range=5y&interval=1d');
      const d = await r.json();
      if (!d.points || !d.points.length) { failed++; continue; }

      // Also get current quote for currency info
      const quote = await fetchPrice(sym);
      const currency = quote ? quote.currency : 'USD';

      for (const lot of symLots) {
        const buyTime = new Date(lot.boughtAt).getTime();
        // Find closest data point to buy date
        let closestPoint = d.points[0];
        let minDiff = Infinity;
        for (const p of d.points) {
          const diff = Math.abs(p.time * 1000 - buyTime);
          if (diff < minDiff) { minDiff = diff; closestPoint = p; }
        }
        const historicPriceNative = closestPoint.value;
        const historicPriceChf = toChf(historicPriceNative, currency);
        // Recalculate shares based on original CHF amount invested
        const originalAmountChf = lot.shares * (lot.buyPriceChf || toChf(lot.buyPriceNative, lot.currency));
        lot.buyPriceNative = historicPriceNative;
        lot.buyPriceChf    = historicPriceChf;
        lot.currency       = currency;
        lot.shares         = originalAmountChf / historicPriceChf;
        fixed++;
      }
    } catch(e) { failed++; }
  }

  save();
  silentPush();
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(e){} }); charts = {};
  document.getElementById('positionsList').innerHTML = '';
  renderAll();
  btn.textContent = 'Korrigieren'; btn.disabled = false;
  const msg = fixed + ' Lot(s) korrigiert' + (failed ? ', ' + failed + ' fehlgeschlagen' : '') + '.';
  alert(msg);
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  await getFxRate();
  renderAll();
  await autoPullOnLoad();
  await refreshPrices();
  setInterval(refreshPrices, 60000);
  setInterval(getFxRate, 300000);
  setInterval(silentPush, 5 * 60 * 1000);
}
init();
</script>
</body>
</html>
