// Texperts prototype: restrained motion. Scroll reveals for below-the-fold
// blocks, count-up numbers, the health-meter fill, and the reviews carousel.
// Everything is skipped when the visitor prefers reduced motion.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function fmt(v, decimals) {
    var fixed = v.toFixed(decimals);
    var parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / 1200);
      var v = end * (1 - Math.pow(1 - k, 3));
      el.textContent = prefix + fmt(v, decimals) + suffix;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initReveal() {
    var vh = window.innerHeight;
    var io = !reduce && "IntersectionObserver" in window
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add("is-in");
            if (e.target.hasAttribute("data-count")) countUp(e.target);
            io.unobserve(e.target);
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
      : null;

    var seen = new Map();
    document.querySelectorAll("[data-product-card], .tx-card:not([data-product-card]), .tx-reveal").forEach(function (el) {
      var parent = el.parentElement;
      var i = seen.get(parent) || 0;
      seen.set(parent, i + 1);
      var r = el.getBoundingClientRect();
      var inView = r.top < vh * 0.98 && r.bottom > 0;
      if (!io) { el.classList.add("is-in"); return; }
      if (inView) { requestAnimationFrame(function () { el.classList.add("is-in"); }); return; }
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--d", (i % 4) * 70 + "ms");
      io.observe(el);
    });

    document.querySelectorAll("[data-count]").forEach(function (el) {
      if (!io) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) countUp(el);
      else io.observe(el);
    });
  }

  function initCarousel(root) {
    var track = root.querySelector("[data-carousel-track]");
    var dotsBox = root.querySelector("[data-carousel-dots]");
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var toggle = root.querySelector("[data-carousel-toggle]");
    if (!track) return;
    var slides = Array.prototype.slice.call(track.children);
    var timer = null;
    var userPaused = reduce;
    var hovering = false;
    var holdUntil = 0;
    var dots = [];

    function metrics() {
      var first = slides[0].getBoundingClientRect();
      var gap = slides[1] ? slides[1].getBoundingClientRect().left - first.right : 0;
      var stepPx = first.width + gap;
      var visible = Math.max(1, Math.round((track.clientWidth + gap) / stepPx));
      return { step: stepPx, last: Math.max(0, slides.length - visible) };
    }
    function index() {
      var m = metrics();
      return Math.max(0, Math.min(m.last, Math.round(track.scrollLeft / m.step)));
    }
    function go(i) {
      var m = metrics();
      var target = Math.max(0, Math.min(m.last, i));
      track.scrollTo({ left: target * m.step, behavior: reduce ? "auto" : "smooth" });
    }
    function buildDots() {
      var m = metrics();
      dotsBox.innerHTML = "";
      dots = [];
      for (var i = 0; i <= m.last; i++) {
        var d = document.createElement("button");
        d.type = "button";
        d.setAttribute("aria-label", "Show review " + (i + 1));
        d.className = "relative h-1.5 rounded-full transition-all duration-300 w-1.5 after:absolute after:-inset-2 after:content-['']";
        d.addEventListener("click", (function (k) { return function () { go(k); hold(); }; })(i));
        dotsBox.appendChild(d);
        dots.push(d);
      }
    }
    function update() {
      var m = metrics();
      var i = index();
      if (dots.length !== m.last + 1) buildDots();
      dots.forEach(function (d, k) {
        d.className = "relative h-1.5 rounded-full transition-all duration-300 after:absolute after:-inset-2 after:content-[''] " + (k === i ? "w-6 bg-surface-dark" : "w-1.5 bg-border-subtle");
        if (k === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
      });
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= m.last;
    }
    function hold() { holdUntil = Date.now() + 12000; }
    function advance() {
      if (Date.now() < holdUntil) return;
      var m = metrics();
      var i = index();
      go(i >= m.last ? 0 : i + 1);
    }
    function schedule() {
      clearInterval(timer);
      timer = null;
      if (userPaused || hovering || document.hidden) return;
      timer = setInterval(advance, 6500);
    }
    function setPaused(p) {
      userPaused = p;
      if (toggle) {
        toggle.setAttribute("aria-pressed", p ? "true" : "false");
        toggle.setAttribute("aria-label", p ? "Resume automatic scrolling" : "Pause automatic scrolling");
        var icon = toggle.querySelector("[data-carousel-toggle-icon]");
        if (icon) icon.textContent = p ? "play_arrow" : "pause";
      }
      track.setAttribute("aria-live", p ? "polite" : "off");
      schedule();
    }

    var raf = null;
    track.addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; update(); });
    }, { passive: true });
    track.addEventListener("touchstart", hold, { passive: true });
    track.addEventListener("wheel", hold, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); hold(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); hold(); }
    });
    root.addEventListener("mouseenter", function () { hovering = true; schedule(); });
    root.addEventListener("mouseleave", function () { hovering = false; schedule(); });
    root.addEventListener("focusin", function () { hovering = true; schedule(); });
    root.addEventListener("focusout", function () { hovering = false; schedule(); });
    document.addEventListener("visibilitychange", schedule);
    window.addEventListener("resize", update);

    buildDots();
    update();
    setPaused(userPaused);
  }

  ready(function () {
    initReveal();
    document.querySelectorAll("[data-carousel-root]").forEach(initCarousel);
  });
})();
