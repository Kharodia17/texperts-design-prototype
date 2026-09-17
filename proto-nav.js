// Texperts prototype — client-side "routing" + light interactivity.
// This is a static clickthrough prototype for design review only: no real
// cart, search, or account logic. It just makes the exported screens
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

    // Mobile nav toggle.
    if (el.hasAttribute("data-menu-toggle")) {
      var menu = document.querySelector("[data-mobile-menu]");
      if (menu) {
        menu.classList.toggle("hidden");
        menu.classList.toggle("flex");
      }
      return;
    }

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

    if (/subscribe/i.test(text)) {
      e.preventDefault();
      showToast("Subscribed! (prototype preview — no real signup)");
      return;
    }

    var href = el.getAttribute && el.getAttribute("href");
    if (href === "#") {
      e.preventDefault();
    }
  });

  // Highlight the current section in the header nav.
  document.querySelectorAll("header nav a[data-path]").forEach(function (a) {
    if (a.getAttribute("data-path") === CURRENT_PAGE) {
      a.classList.add("text-primary", "font-semibold");
    }
  });

  // Small banner so reviewers know this is a design preview, not the live
  // store. It's a normal block at the very top of <body> — both the header
  // (sticky) and the mobile menu panel below it flow naturally underneath,
  // no manual offset math needed.
  var banner = document.createElement("div");
  banner.textContent = "Design preview — for client review only, not a live store";
  banner.style.cssText =
    "background:#C8F542;color:#0B0B10;font-family:'Space Mono',monospace;font-size:10px;" +
    "font-weight:700;letter-spacing:.06em;text-align:center;padding:4px 8px;text-transform:uppercase;";
  document.addEventListener("DOMContentLoaded", function () {
    document.body.insertBefore(banner, document.body.firstChild);
  });
})();
