// A walk through the site with the frame readout on (phase 6, step 5): the first load and its opening, a scroll down
// the one page, into a role, a project, /lab (scrolled through) and the colophon and Back from each. Prints the
// readout's report: every place's frame times and the slowest frames with what ran in them.
// node scripts/walk.mjs [origin] [cpu]   (default http://localhost:3100, 1; cpu 4 also uses a phone's screen)
import { chromium } from "@playwright/test";
const origin = process.argv[2] ?? "http://localhost:3100", cpu = +(process.argv[3] ?? 1), phone = cpu > 1;
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ ...(phone ? { viewport: { width: 384, height: 746 }, deviceScaleFactor: 2.8125, isMobile: true, hasTouch: true } : { viewport: { width: 1728, height: 996 }, deviceScaleFactor: 2 }), permissions: ["clipboard-read", "clipboard-write"] });
const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 165, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 });
if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
const wheel = async (px, step = 120) => { await p.mouse.move(300, 300); for (let y = 0; Math.abs(y) < Math.abs(px); y += step * Math.sign(px)) { await p.mouse.wheel(0, step * Math.sign(px)); await p.waitForTimeout(40); } await p.waitForTimeout(1500); };
const to = async (sel) => { await p.evaluate((s) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + scrollY); dispatchEvent(new Event("scroll")); }, sel); await p.waitForTimeout(2500); };
const click = async (sel) => { await p.evaluate((s) => document.querySelector(s).click(), sel); await p.waitForTimeout(5000); };
const back = async () => { await p.goBack(); await p.waitForTimeout(5000); };
await p.goto(`${origin}/?fps`, { waitUntil: "load" }); await p.waitForTimeout(12000);
await wheel(await p.evaluate(() => document.documentElement.scrollHeight));
await to("#roles"); await click('#roles a[href="/roles/deriv"]'); await back();
await to("#work"); await click('#work a[href="/work/faultline"]'); await back();
await to("#lab"); await click('#lab a[href="/lab"]'); await p.waitForTimeout(8000);
await wheel(await p.evaluate(() => document.documentElement.scrollHeight), 160); await back();
await to("#contact"); await click('#contact [data-layer=ink] a[href="/colophon"]'); await back();
await p.getByRole("button", { name: "Copy report" }).click(); await p.waitForTimeout(300);
console.log(await p.evaluate(() => navigator.clipboard.readText()));
if (process.env.TRACE) console.log((await p.evaluate(() => (window.__trace || []).map((e) => `${(e.t / 1000).toFixed(1)} ${e.what}`))).filter((l) => / \d+ ms/.test(l) && +l.match(/(\d+) ms/)[1] >= 20).join("\n"));
await b.close();
