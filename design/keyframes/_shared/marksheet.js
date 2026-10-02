// A comp sheet for one mark (phase 6): the favicon at the sizes a browser uses, in light and dark tab strips beside two
// other sites' tabs, the home-screen icon, and the share card it goes with (og-<k>.html, framed at 60%).
import { MARKS } from "./mark.js";

const other = (px, c) => `<svg width="${px}" height="${px}" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="${c}"/></svg>`;
const tab = (icon, title, on, dark) => `<div class="tab${on ? " on" : ""}">${icon}<span>${title}</span></div>`;
const strip = (k, dark) => `<div class="strip${dark ? " dark" : ""}">
  ${tab(other(16, dark ? "#5f6368" : "#9aa0a6"), "Inbox (3)", false, dark)}${tab(MARKS[k](16), "Anas Qumhiyeh", true, dark)}${tab(other(16, dark ? "#8ab4f8" : "#1a73e8"), "Docs", false, dark)}</div>`;

export function sheet(k, { name, why }) {
  document.body.innerHTML = `<div class="frame sheet">
    <header><p class="mono k">Mark ${k.toUpperCase()}</p><h1 class="display">${name}</h1><p class="why">${why}</p></header>
    <section class="sizes">
      ${[16, 32, 48].map((s) => `<figure>${MARKS[k](s)}<figcaption class="mono">${s} px</figcaption></figure>`).join("")}
      <figure class="touch">${MARKS[k](120)}<figcaption class="mono">home screen</figcaption></figure>
    </section>
    <section class="tabs">${strip(k, false)}${strip(k, true)}</section>
    <section class="card"><iframe src="og-${k}.html" width="1200" height="630" scrolling="no"></iframe><p class="mono cap">share card, 1200 × 630</p></section>
  </div>`;
}

const css = `
  .sheet { background: var(--paper); }
  header { position: absolute; left: 64px; top: 56px; width: 520px; }
  header .k { font-size: 12px; color: var(--graphite); }
  header h1 { margin-top: 8px; font-size: 56px; letter-spacing: -.04em; line-height: .95; }
  header .why { margin-top: 18px; font-size: 16px; line-height: 1.5; color: var(--pencil); max-width: 44ch; }
  .sizes { position: absolute; left: 64px; top: 340px; display: flex; align-items: flex-end; gap: 36px; }
  .sizes figure { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .sizes figcaption { font-size: 11px; color: var(--graphite); }
  .touch svg { border-radius: 26px; }
  .tabs { position: absolute; left: 64px; top: 560px; width: 520px; display: grid; gap: 18px; }
  .strip { display: flex; gap: 2px; padding: 8px 8px 0; background: #dee1e6; border-radius: 10px 10px 0 0; }
  .strip.dark { background: #202124; }
  .tab { display: flex; align-items: center; gap: 8px; width: 168px; height: 34px; padding: 0 12px; border-radius: 8px 8px 0 0; font: 12px/1 system-ui, sans-serif; color: #3c4043; }
  .tab.on { background: #fff; }
  .dark .tab { color: #bdc1c6; } .dark .tab.on { background: #35363a; color: #e8eaed; }
  .tab svg { flex: none; }
  .card { position: absolute; right: 64px; top: 176px; width: 720px; }
  .card iframe { border: 0; display: block; transform: scale(.6); transform-origin: 0 0; width: 1200px; height: 630px; box-shadow: 0 30px 60px -30px rgba(13, 13, 12, .45); }
  .card .cap { position: absolute; top: 396px; font-size: 11px; color: var(--graphite); }
`;
document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);
