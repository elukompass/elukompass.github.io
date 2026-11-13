/* ytclean: YouTube with no YouTube buttons. Our play button + thin progress bar only.
   ytClean(box, id, {onProgress(fraction)}) → plays the video inside box (box needs position:relative, aspect-ratio). */
(function () {
  var css = '.ytc{position:absolute;inset:0;background:#000;overflow:hidden}.ytc iframe{position:absolute;left:0;top:-160px;width:100%;height:calc(100% + 320px);border:0;pointer-events:none}' +
    '.ytc-shield{position:absolute;inset:0;cursor:pointer;z-index:2}' +
    '.ytc-cover{position:absolute;inset:0;z-index:3;background:#000 center/cover no-repeat;display:grid;place-items:center;cursor:pointer;transition:opacity .25s}' +
    '.ytc-cover.off{opacity:0;pointer-events:none}' +
    '.ytc-btn{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;background:var(--ytc-acc,#ffc861);box-shadow:0 0 0 10px rgba(255,200,97,.22),0 10px 40px rgba(0,0,0,.5)}' +
    '.ytc-btn svg{width:36px;height:36px;fill:#2a1a00;margin-left:5px}' +
    '.ytc-bar{position:absolute;left:0;right:0;bottom:0;height:14px;z-index:4;cursor:pointer;display:flex;align-items:flex-end}' +
    '.ytc-bar i{display:block;height:4px;width:0;background:var(--ytc-acc,#ffc861);border-radius:0 2px 2px 0}' +
    '.ytc-fs{position:absolute;right:10px;bottom:16px;z-index:4;width:36px;height:36px;border:0;border-radius:50%;background:rgba(0,0,0,.45);cursor:pointer;display:grid;place-items:center;opacity:.8}' +
    '.ytc-fs svg{width:18px;height:18px;fill:#fff}';
  var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  var ready = [], loaded = false;
  function api(cb) {
    if (window.YT && YT.Player) return cb();
    ready.push(cb); if (loaded) return; loaded = true;
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () { if (prev) prev(); ready.splice(0).forEach(function (f) { f(); }); };
    var t = document.createElement('script'); t.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(t);
  }
  var PLAY = '<span class="ytc-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>';
  window.ytClean = function (box, id, o) {
    o = o || {};
    if (box.querySelector('.ytc')) return;
    box.innerHTML = '<div class="ytc"><div class="ytc-t"></div><div class="ytc-shield"></div>' +
      '<div class="ytc-cover" style="background-image:url(https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg)">' + PLAY + '</div>' +
      '<button class="ytc-fs" aria-label="Täisekraan"><svg viewBox="0 0 24 24"><path d="M4 9V4h5v2H6v3zm11-5h5v5h-2V6h-3zM4 15h2v3h3v2H4zm14 0h2v5h-5v-2h3z"/></svg></button>' +
      '<div class="ytc-bar"><i></i></div></div>';
    var w = box.querySelector('.ytc'), cover = w.querySelector('.ytc-cover'), bar = w.querySelector('.ytc-bar i'), p, timer;
    api(function () {
      p = new YT.Player(w.querySelector('.ytc-t'), {
        videoId: id, host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, disablekb: 1, fs: 0, cc_load_policy: 0 },
        events: {
          onReady: function (e) { try { e.target.unloadModule('captions'); e.target.unloadModule('cc'); } catch (x) {} e.target.playVideo(); },
          onStateChange: function (e) {
            var st = e.data;   // 1 playing, 2 paused, 0 ended
            cover.classList.toggle('off', st === 1 || st === 3);
            clearInterval(timer);
            if (st === 1) timer = setInterval(tick, 500);
            if (st === 0) { bar.style.width = '100%'; o.onProgress && o.onProgress(1); }
          }
        }
      });
    });
    function tick() { var d = p.getDuration(), c = p.getCurrentTime(); if (!d) return; bar.style.width = (c / d * 100) + '%'; o.onProgress && o.onProgress(c / d); }
    function toggle() { if (!p || !p.getPlayerState) return; p.getPlayerState() === 1 ? p.pauseVideo() : p.playVideo(); }
    w.querySelector('.ytc-shield').onclick = toggle; cover.onclick = toggle;
    w.querySelector('.ytc-bar').onclick = function (e) { if (!p) return; var r = this.getBoundingClientRect(); p.seekTo(p.getDuration() * (e.clientX - r.left) / r.width, true); p.playVideo(); };
    w.querySelector('.ytc-fs').onclick = function () { var el = box; (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el); };
  };
})();
