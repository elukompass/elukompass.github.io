// Kompass Challenge · shared logic for days 3–5 and the booking page
const ENDPOINT = "https://script.google.com/macros/s/AKfycbytDWu3nmpvkd61KV8XZq2TOt0JnWC4OBbasqk0_NIBktVtQRvaz2KNnO0QFYcAtqgiFQ/exec";
const SEND_LIVE = true;    // turn on after the Apps Script knows kind "paev", otherwise rows land in Opt-in
const GROUP = "https://www.facebook.com/groups/ruuum";
const PAY = { mees: "https://buy.stripe.com/4gM3cvgS04bP1Y3eeq2kw07", naine: "https://buy.stripe.com/4gM28r59icIlauz1rE2kw08" };
const AREA_NAME = { keha: "Keha", raha: "Raha ja töö", vaim: "Vaim", suhted: "Suhted" };
const FIT = { mees: ["keha", "raha", "vaim"], naine: ["keha", "suhted", "vaim"] };   // main focus per program

const q = new URLSearchParams(location.search);
const PREVIEW = location.hash === "#eelvaade";
const $ = id => document.getElementById(id);
const val = id => ($(id) ? $(id).value.trim() : "");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const emailOk = s => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i.test(s);

// Answers travel between days in this browser only, never in the URL
const load = () => { try { return JSON.parse(localStorage.getItem("kc") || "{}"); } catch (e) { return {}; } };
const save = st => { try { localStorage.setItem("kc", JSON.stringify(st)); } catch (e) {} };
const st = load();
st.sex = q.get("s") === "naine" ? "naine" : q.get("s") === "mees" ? "mees" : st.sex || "mees";
if (AREA_NAME[q.get("a")]) st.area = q.get("a");
if (/^[a-f0-9]{10}$/.test(q.get("k") || "")) st.k = q.get("k");   // opaque person id from the email link, so another device counts as the same person
if (!st.cid) st.cid = Math.random().toString(36).slice(2, 12);   // ties each day's row to the person; the email joins it on Day 5 at the latest
save(st);
document.body.classList.toggle("naine", st.sex === "naine");

let cur = null, trail = [];
const show = (id, isBack) => { if (cur && cur !== id && !isBack) trail.push(cur); cur = id; if (id === "s-done") trail = [];
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("on", s.id === id)); $("back").classList.toggle("hidden", !trail.length); scrollTo(0, 0); };
document.body.insertAdjacentHTML("afterbegin", '<button class="backbtn hidden" id="back" aria-label="Tagasi">←</button>');
$("back").onclick = () => show(trail.pop(), true);
const link = (page, extra) => `${page}?s=${st.sex}${st.area ? "&a=" + st.area : ""}${extra || ""}`;

function audio(day) {
  const a = $("vm"); if (!a) return;
  a.src = `assets/vm/vm${day}-${st.sex === "naine" ? "n" : "m"}.mp3`;
  a.onerror = () => a.classList.add("hidden");   // hidden until the voice note exists
}

// Slider with its number; a slider counts as answered once it moved or was shown a default
function slider(id, onChange) {
  const r = $(id), out = $(id + "-v");
  const paint = () => { if (out) out.textContent = r.value; if (onChange) onChange(+r.value); };
  r.addEventListener("input", paint); paint();
}

function chooser(boxId, multi, onChange) {
  const box = $(boxId), picked = new Set([...box.querySelectorAll("button.on")].map(b => b.dataset.v));
  box.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    if (!multi) { picked.clear(); box.querySelectorAll("button").forEach(x => x.classList.remove("on")); }
    if (picked.has(b.dataset.v)) { picked.delete(b.dataset.v); b.classList.remove("on"); }
    else { picked.add(b.dataset.v); b.classList.add("on"); }
    if (onChange) onChange([...picked]);
  }));
  if (picked.size && onChange) onChange([...picked]);
}

// Area step: skipped when the link or an earlier day already knows it
function needArea(next) {
  if (st.area) return next();
  show("s-pick");
  document.querySelectorAll(".areas button").forEach(b => b.addEventListener("click", () => { st.area = b.dataset.a; save(st); next(); }));
}

// Name + email step: skipped when an earlier day in this browser already has them
function needWho(next) {
  if (st.name && emailOk(st.email || "")) return next();
  show("s-who");
  const check = () => { $("send").disabled = !(val("f-name") && emailOk(val("f-email"))); };
  ["f-name", "f-email"].forEach(id => $(id).addEventListener("input", check));
  $("send").onclick = () => { st.name = val("f-name"); st.email = val("f-email"); save(st); next(); };
}

function sendDay(day, answers, extra) {
  save(st);
  if (!SEND_LIVE || PREVIEW || !ENDPOINT) return;
  const now = new Date().toISOString();
  const data = Object.assign({ kind: "paev", day, cid: st.cid, k: st.k || "", ts: now, sex: st.sex, area: st.area, name: st.name || "", email: st.email || "", consent: st.email ? now : "",
    answers: JSON.stringify(answers).slice(0, 3000), website: val("website") }, extra || {});
  try { fetch(ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(data) }); } catch (e) {}
}
const first = () => esc((st.name || "").split(" ")[0]);

document.addEventListener("input", e => { if (e.target.tagName === "TEXTAREA") { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + 2 + "px"; } });   // boxes grow with the text

(() => { const k = document.querySelector(".brand svg.kompass"); if (!k) return; k.style.cursor = "pointer"; k.addEventListener("click", () => location.reload()); })();   // emblem = back to the start of this day

// Progress rings: show the day, not clickable. The next day opens from the button after finishing.
(() => { const m = location.pathname.match(/paev(\d)/); if (!m) return;
  const nav = document.createElement("div"); nav.className = "daynav"; nav.setAttribute("aria-label", `Samm ${m[1]} / 5`);
  nav.innerHTML = [1, 2, 3, 4, 5].map(i => `<span class="${i === +m[1] ? "on" : i < +m[1] ? "done" : ""}">${i}</span>`).join("");
  document.querySelector(".brand").after(nav); })();
