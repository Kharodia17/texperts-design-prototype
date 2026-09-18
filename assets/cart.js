// Texperts prototype — client-side shopping cart, persisted in
// localStorage so it survives across pages. No real checkout/payment;
// this exists purely so "Add to Cart" -> Cart -> Checkout feels real
// for a design review.
(function () {
  var KEY = "texpertsCart";

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (err) {
      return {};
    }
  }

  function writeCart(cart) {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (err) {}
    updateBadge();
  }

  function addItem(id, qty) {
    var cart = readCart();
    cart[id] = (cart[id] || 0) + (qty || 1);
    writeCart(cart);
  }

  function removeItem(id) {
    var cart = readCart();
    delete cart[id];
    writeCart(cart);
  }

  function setQty(id, qty) {
    var cart = readCart();
    if (qty <= 0) {
      delete cart[id];
    } else {
      cart[id] = qty;
    }
    writeCart(cart);
  }

  function clearCart() {
    writeCart({});
  }

  function count() {
    var cart = readCart();
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + cart[id];
    }, 0);
  }

  function updateBadge() {
    var n = count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.style.display = n > 0 ? "" : "none";
    });
  }

  window.TexpertsCart = {
    readCart: readCart,
    addItem: addItem,
    removeItem: removeItem,
    setQty: setQty,
    clearCart: clearCart,
    count: count,
    updateBadge: updateBadge
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateBadge);
  } else {
    updateBadge();
  }
})();
