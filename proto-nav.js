// Texperts prototype — client-side "routing" + light interactivity.
// This is a static clickthrough prototype for design review only: no real
// cart, search, or account logic. It just makes the exported Stitch screens
// navigable to each other and gives dead-end links a friendly placeholder.
(function () {
  var ROUTES = {
    catalog: "index.html",
    laptops: "laptops.html",
    about: "stores.html"
  };

  var CURRENT_PAGE = document.body.getAttribute("data-page") || "";

  function targetFor(path, label) {
    if (ROUTES[path]) return ROUTES[path];
    var section = label || path;
    // Stash context in sessionStorage rather than a query string: some
    // static hosts (incl. local dev servers with clean-URL redirects)
    // strip query strings on redirect, which would lose this otherwise.
    try {
      sessionStorage.setItem("protoComingSoon", JSON.stringify({ section: section, from: CURRENT_PAGE }));
    } catch (err) {}
    return "coming-soon.html";
  }

  function showToast(message) {
    var toast = document.getElementById("proto-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "proto-toast";
      toast.style.cssText =
        "position:fixed;left:50%;bottom:28px;transform:translate(-50%,12px);" +
        "background:#0B0B10;color:#fff;font-family:Inter,sans-serif;font-size:13px;" +
        "font-weight:600;padding:10px 18px;border-radius:9999px;z-index:9999;" +
        "box-shadow:0 12px 24px -4px rgba(0,0,0,0.35);opacity:0;" +
        "transition:opacity .2s ease, transform .2s ease;pointer-events:none;";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(toast._hideTimer);
    requestAnimationFrame(function () {
      toast.style.opacity = "1";
      toast.style.transform = "translate(-50%,0)";
    });
    toast._hideTimer = setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translate(-50%,12px)";
    }, 1800);
  }

  function getLabel(el) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll(".material-symbols-outlined").forEach(function (icon) {
      icon.remove();
    });
    return (clone.textContent || "").trim().replace(/\s+/g, " ");
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("a, button");
    if (!el) return;

    var title = el.getAttribute("title") || "";
    var text = getLabel(el);

    // Product quick-view / inquire actions -> the one built-out PDP.
    if (/^(view|inquire)\b/i.test(title)) {
      e.preventDefault();
      window.location.href = "product.html";
      return;
    }

    var path = el.getAttribute && el.getAttribute("data-path");
    if (path) {
      e.preventDefault();
      window.location.href = targetFor(path, text);
      return;
    }

    if (/add to cart/i.test(text)) {
      e.preventDefault();
      showToast("Added to cart (prototype preview — no real checkout)");
      return;
    }

    var href = el.getAttribute && el.getAttribute("href");
    if (href === "#") {
      e.preventDefault();
    }
  });

  // Highlight the current section in the top nav, matching the design's
  // own data-active-classes convention.
  document.querySelectorAll("nav[data-active-classes] [data-path]").forEach(function (a) {
    if (a.getAttribute("data-path") === CURRENT_PAGE) {
      var classes = a.closest("nav").getAttribute("data-active-classes").split(/\s+/);
      classes.forEach(function (c) {
        if (c) a.classList.add(c);
      });
    }
  });

  // Small non-blocking banner so reviewers know this is a design preview.
  var banner = document.createElement("div");
  banner.textContent = "DESIGN PREVIEW — for client review only, not a live store";
  banner.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:100000;background:#C8F542;color:#0B0B10;" +
    "font-family:'Space Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.08em;" +
    "text-align:center;padding:3px 8px;text-transform:uppercase;";
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(banner);
    var bannerHeight = banner.offsetHeight || 18;

    // Fixed-position header/dock need to be nudged down manually since
    // body padding doesn't affect position:fixed elements.
    var header = document.querySelector("body > header");
    if (header) header.style.top = bannerHeight + "px";

    var aside = document.querySelector("body > aside");
    if (aside) aside.style.marginTop = bannerHeight + "px";

    var main = document.querySelector("body > main");
    if (main) main.style.paddingTop = (parseInt(getComputedStyle(main).paddingTop, 10) || 0) + bannerHeight + "px";
  });
})();
