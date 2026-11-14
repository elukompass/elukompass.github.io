/* Kontakt pop-up: any footer link to mailto:kaidi@… opens a small card (name, email, Gmail, copy, WhatsApp if set) */
(function () {
  var EMAIL = "kaidi@kaidikarilaid.com", NAME = "Kaidi Karilaid", WA = "";   // WA: number with country code, digits only, e.g. "3725…"
  var css = ".kt-bg{position:fixed;inset:0;z-index:9999;background:rgba(3,6,12,.6);display:none;align-items:center;justify-content:center;padding:16px}" +
    ".kt-bg.on{display:flex}.kt{width:100%;max-width:340px;background:#0b1424;color:#f4f1ea;border:1px solid rgba(255,200,97,.35);border-radius:20px;padding:22px 20px;box-shadow:0 20px 60px rgba(0,0,0,.5);font:15px/1.5 system-ui,sans-serif;position:relative;text-align:center}" +
    ".kt h3{margin:0 0 2px;font:400 22px Marcellus,Georgia,serif}.kt p{margin:0 0 16px;color:#cfd6e4;word-break:break-all}" +
    ".kt a,.kt button{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:46px;border-radius:99px;margin-top:8px;font-weight:600;text-decoration:none;border:1px solid rgba(255,255,255,.18);background:transparent;color:#f4f1ea;cursor:pointer;font-size:15px}" +
    ".kt a.pr{background:#ffc861;color:#2a1a00;border:0}.kt a.wa{background:#25D366;color:#06210f;border:0}.kt .x{position:absolute;top:8px;right:10px;width:34px;min-height:34px;margin:0;border:0;font-size:18px;color:#cfd6e4}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var bg = document.createElement("div"); bg.className = "kt-bg"; bg.setAttribute("role", "dialog"); bg.setAttribute("aria-label", "Kontakt");
  bg.innerHTML = '<div class="kt"><button class="x" aria-label="Sulge">✕</button><h3>' + NAME + "</h3><p>" + EMAIL + "</p>" +
    '<a class="pr" href="https://mail.google.com/mail/?view=cm&fs=1&to=' + EMAIL + '" target="_blank" rel="noopener">Kirjuta Gmailis</a>' +
    '<a href="mailto:' + EMAIL + '">Ava e-posti äpis</a><button class="cp">Kopeeri aadress</button>' +
    (WA ? '<a class="wa" href="https://wa.me/' + WA + '" target="_blank" rel="noopener">WhatsApp</a>' : "") + "</div>";
  document.body.appendChild(bg);
  var close = function () { bg.classList.remove("on"); };
  bg.addEventListener("click", function (e) { if (e.target === bg || e.target.closest(".x")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  bg.querySelector(".cp").addEventListener("click", function () { var b = this;
    var done = function () { b.textContent = "Kopeeritud ✓"; setTimeout(function () { b.textContent = "Kopeeri aadress"; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, function () { prompt("Kopeeri", EMAIL); }); else prompt("Kopeeri", EMAIL); });
  document.addEventListener("click", function (e) { var a = e.target.closest('a[href^="mailto:' + EMAIL + '"]');
    if (!a || bg.contains(a)) return; e.preventDefault(); bg.classList.add("on"); });
})();
