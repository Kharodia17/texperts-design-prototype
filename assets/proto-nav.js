// Texperts prototype — client-side "routing" + light interactivity.
// This is a static clickthrough prototype for design review only: no real
// cart, search, or account logic. It just makes the exported screens
// navigable to each other and gives dead-end links a friendly placeholder.
(function () {
  var ROUTES = {
    catalog: "index.html",
    laptops: "laptops.html",
    desktops: "desktops.html",
    accessories: "accessories.html",
    "custom-builds": "custom-builds.html",
    "cart-and-checkout": "cart.html",
    about: "stores.html",
    company: "about.html"
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

  // ---- Smart search (header) ----
  // Live-filters the small product catalog as the reviewer types, and
  // hands off to the Laptops page's own filter engine on Enter / result
  // click, so "search" and "browse" are the same underlying system.
  function stashSearch(query) {
    try {
      sessionStorage.setItem("protoSearch", query);
    } catch (err) {}
  }

  function stashProduct(id) {
    try {
      sessionStorage.setItem("protoProductId", id);
    } catch (err) {}
  }

  function productUrl(id) {
    return "product.html" + (id ? "#" + encodeURIComponent(id) : "");
  }

  function productIdFor(el) {
    var own = el.getAttribute && el.getAttribute("data-id");
    if (own) return own;
    var card = el.closest && el.closest("[data-product-card]");
    return card ? card.getAttribute("data-id") : null;
  }

  function renderSearchResults(query) {
    var box = document.querySelector("[data-search-results]");
    if (!box) return;
    var products = window.TEXPERTS_PRODUCTS || [];
    var q = query.trim().toLowerCase();
    box.innerHTML = "";
    if (!q) return;
    var matches = products.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 || (p.spec || "").toLowerCase().indexOf(q) !== -1;
    });
    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "px-3 py-3 text-sm text-text-muted";
      empty.textContent = 'No matches for "' + query.trim() + '" — try Laptops to browse everything.';
      box.appendChild(empty);
      return;
    }
    matches.slice(0, 6).forEach(function (p) {
      var row = document.createElement("a");
      row.href = "#";
      row.className = "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors";
      row.setAttribute("data-search-result", "");
      row.setAttribute("data-id", p.id);
      row.setAttribute("data-name", p.name);
      row.innerHTML =
        '<span class="w-10 h-10 rounded-md bg-surface-container-lowest flex items-center justify-center shrink-0 overflow-hidden"><img src="' +
        p.img +
        '" class="max-h-full max-w-full object-contain" alt=""/></span>' +
        '<span class="flex flex-col leading-tight flex-1 min-w-0"><span class="text-sm font-medium truncate">' +
        p.name +
        '</span><span class="text-xs text-text-muted truncate">' +
        p.spec +
        "</span></span>" +
        '<span class="text-sm font-semibold shrink-0">' +
        p.price +
        "</span>";
      box.appendChild(row);
    });
  }

  function setSearchExpanded(expanded) {
    var toggle = document.querySelector("[data-search-toggle]");
    if (toggle) toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  function closeSearch() {
    var panel = document.querySelector("[data-search-panel]");
    if (panel) panel.classList.add("hidden");
    setSearchExpanded(false);
  }

  function openSearch() {
    var panel = document.querySelector("[data-search-panel]");
    var input = document.querySelector("[data-search-input]");
    if (panel) panel.classList.remove("hidden");
    setSearchExpanded(true);
    if (input) {
      input.focus();
      renderSearchResults(input.value || "");
    }
  }

  var searchInput = document.querySelector("[data-search-input]");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderSearchResults(searchInput.value);
    });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && searchInput.value.trim()) {
        stashSearch(searchInput.value.trim());
        window.location.href = "laptops.html";
      }
      if (e.key === "Escape") {
        closeSearch();
      }
    });
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("a, button");

    // Click-away closes the open search panel.
    var panel = document.querySelector("[data-search-panel]");
    if (panel && !panel.classList.contains("hidden") && !panel.contains(e.target) && !(el && el.hasAttribute("data-search-toggle"))) {
      closeSearch();
    }

    if (!el) return;

    // Smart Laptop Finder (homepage) -> pre-filters the Laptops page.
    if (el.hasAttribute("data-finder")) {
      try {
        sessionStorage.setItem("protoUseCase", el.getAttribute("data-finder"));
      } catch (err) {}
      window.location.href = "laptops.html";
      return;
    }

    // Mobile nav toggle.
    if (el.hasAttribute("data-menu-toggle")) {
      var menu = document.querySelector("[data-mobile-menu]");
      if (menu) {
        var wasHidden = menu.classList.contains("hidden");
        menu.classList.toggle("hidden");
        menu.classList.toggle("flex");
        el.setAttribute("aria-expanded", wasHidden ? "true" : "false");
      }
      return;
    }

    // Search toggle + result clicks.
    if (el.hasAttribute("data-search-toggle")) {
      var openPanel = document.querySelector("[data-search-panel]");
      if (openPanel && openPanel.classList.contains("hidden")) {
        openSearch();
      } else {
        closeSearch();
      }
      return;
    }
    if (el.hasAttribute("data-search-result")) {
      e.preventDefault();
      var searchId = productIdFor(el);
      if (searchId) stashProduct(searchId);
      window.location.href = productUrl(searchId);
      return;
    }

    var title = el.getAttribute("title") || "";
    var text = getLabel(el);

    // Product quick-view / inquire actions -> the dynamic PDP, stashing
    // which product it should render.
    if (/^(view|inquire)\b/i.test(title)) {
      e.preventDefault();
      var viewId = productIdFor(el);
      if (viewId) stashProduct(viewId);
      window.location.href = productUrl(viewId);
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
      var cartId = productIdFor(el);
      var qtyEl = document.getElementById("pdp-qty");
      var qty = el.id === "pdp-add-btn" && qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
      if (cartId && window.TexpertsCart) {
        window.TexpertsCart.addItem(cartId, qty);
      }
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
