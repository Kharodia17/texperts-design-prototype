// Floating "Compare Designs" widget shared by every theme variant.
// Pure inline styles on purpose: each theme defines its own Tailwind
// color tokens, so this widget can't rely on theme utility classes and
// stay visually consistent across all four skins.
(function () {
  var THEMES = [
    { id: "texperts", label: "Texperts Classic", swatch: "#532CD8" },
    { id: "evetech", label: "Evetech Style", swatch: "#B6FF00" },
    { id: "techcoza", label: "Marketplace Style", swatch: "#1E4FD6" },
    { id: "clickcomputer", label: "Click Computer Style", swatch: "#6B3FD4" }
  ];

  var ROUTES = { catalog: "index.html", laptops: "laptops.html", product: "product.html", about: "stores.html" };

  function currentTheme() {
    return document.body.getAttribute("data-theme") || "";
  }

  function currentFile() {
    var page = document.body.getAttribute("data-page");
    return ROUTES[page] || "index.html";
  }

  function build() {
    var theme = currentTheme();
    var file = currentFile();
    var wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;left:16px;bottom:16px;z-index:99998;font-family:Inter,system-ui,sans-serif;";

    var panel = document.createElement("div");
    panel.style.cssText =
      "display:none;flex-direction:column;gap:4px;background:#14141E;border:1px solid #2A2A38;" +
      "border-radius:14px;padding:10px;margin-bottom:10px;box-shadow:0 20px 40px -8px rgba(0,0,0,0.5);min-width:220px;";

    var heading = document.createElement("div");
    heading.textContent = "Compare designs";
    heading.style.cssText = "color:rgba(255,255,255,0.5);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:4px 8px 6px;";
    panel.appendChild(heading);

    THEMES.forEach(function (t) {
      var isCurrent = t.id === theme;
      var row = document.createElement(isCurrent ? "div" : "a");
      if (!isCurrent) row.setAttribute("href", "../" + t.id + "/" + file);
      row.style.cssText =
        "display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;text-decoration:none;" +
        "font-size:13px;font-weight:600;color:#fff;cursor:" + (isCurrent ? "default" : "pointer") + ";" +
        "background:" + (isCurrent ? "rgba(255,255,255,0.08)" : "transparent") + ";";
      if (!isCurrent) {
        row.addEventListener("mouseenter", function () { row.style.background = "rgba(255,255,255,0.06)"; });
        row.addEventListener("mouseleave", function () { row.style.background = "transparent"; });
      }
      var dot = document.createElement("span");
      dot.style.cssText = "width:9px;height:9px;border-radius:50%;background:" + t.swatch + ";box-shadow:0 0 0 3px rgba(255,255,255,0.06);flex-shrink:0;";
      var label = document.createElement("span");
      label.textContent = t.label;
      var badge = document.createElement("span");
      if (isCurrent) {
        badge.textContent = "current";
        badge.style.cssText = "margin-left:auto;font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,0.4);font-weight:700;";
      }
      row.appendChild(dot);
      row.appendChild(label);
      if (isCurrent) row.appendChild(badge);
      panel.appendChild(row);
    });

    var divider = document.createElement("div");
    divider.style.cssText = "height:1px;background:#2A2A38;margin:6px 4px;";
    panel.appendChild(divider);

    var allLink = document.createElement("a");
    allLink.href = "../index.html";
    allLink.textContent = "View all 4 designs →";
    allLink.style.cssText = "display:block;padding:8px 10px;font-size:12px;font-weight:700;color:#B6FF00;text-decoration:none;";

    panel.appendChild(allLink);

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Compare designs");
    toggle.style.cssText =
      "display:flex;align-items:center;gap:8px;background:#14141E;color:#fff;border:1px solid #2A2A38;" +
      "border-radius:9999px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;" +
      "box-shadow:0 12px 24px -4px rgba(0,0,0,0.4);";
    toggle.innerHTML =
      '<span style="font-size:16px;line-height:1;">◉</span><span>Compare Designs</span>';

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = panel.style.display === "flex";
      panel.style.display = open ? "none" : "flex";
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) panel.style.display = "none";
    });

    wrap.appendChild(panel);
    wrap.appendChild(toggle);
    document.body.appendChild(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
