// ============================================================================
// 3. WOMEN'S BOUTIQUE STOREFRONT & CHECKOUT ENGINE (app.js)
// ============================================================================

window.catalog = [];
window.siteConfig = {};
window.cart = [];
window.wishlist = [];
window.appliedCoupon = null;

try {
  const savedCart = window.safeStorage.getItem("bharatstyle_women_v2_cart");
  if (savedCart) window.cart = JSON.parse(savedCart);
  const savedWish = window.safeStorage.getItem("bharatstyle_women_v2_wishlist");
  if (savedWish) window.wishlist = JSON.parse(savedWish);
} catch (e) {}

window.filters = {
  style: "All",
  search: "",
  brands: [],
  maxPrice: 10000,
  sortBy: "recommended"
};

window.initApp = function () {
  if (typeof window.initAuthUI === "function") {
    window.initAuthUI();
  }
  window.refreshStorefrontUI();
  window.updateBagAndWishlistBadges();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.initApp);
} else {
  window.initApp();
}

window.refreshStorefrontUI = function () {
  window.catalog = window.getActiveProducts();
  window.siteConfig = window.getActiveSiteConfig();

  const promoEl = document.getElementById("dailyPromoBanner");
  if (promoEl && window.siteConfig.promoBannerText) {
    promoEl.textContent = window.siteConfig.promoBannerText;
  }

  const couponHintEl = document.getElementById("availableCouponsHint");
  if (couponHintEl && window.siteConfig.coupons) {
    const codes = Object.keys(window.siteConfig.coupons);
    couponHintEl.textContent = codes.length ? `Try: ${codes.join(", ")}` : "";
  }

  window.renderBrandCheckboxes();
  window.renderProducts();
};

window.renderBrandCheckboxes = function () {
  const container = document.getElementById("brandFilterList");
  if (!container) return;
  const uniqueBrands = [...new Set(window.catalog.map((item) => item.brand))];

  container.innerHTML = uniqueBrands
    .map(
      (brand) => `
    <label class="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
      <input type="checkbox" value="${brand}" ${
        window.filters.brands.includes(brand) ? "checked" : ""
      } onchange="window.toggleBrandFilter('${brand.replace(/'/g, "\\'")}')" class="rounded" />
      <span>${brand}</span>
    </label>
  `
    )
    .join("");
};

// Women's Silhouette Filter Handler (Updates both Top Nav & Sidebar Pills)
window.setStyleFilter = function (style) {
  window.filters.style = style;

  document.querySelectorAll(".nav-tab").forEach((el) => {
    if (el.dataset.style) {
      el.classList.toggle("active", el.dataset.style === style);
    }
  });

  document.querySelectorAll(".style-filter-pill").forEach((el) => {
    if (el.dataset.style) {
      el.classList.toggle("active", el.dataset.style === style);
    }
  });

  window.renderProducts();
};

window.handleSearchInput = function (val) {
  window.filters.search = (val || "").trim().toLowerCase();
  window.renderProducts();
};

window.toggleBrandFilter = function (brand) {
  if (window.filters.brands.includes(brand)) {
    window.filters.brands = window.filters.brands.filter((b) => b !== brand);
  } else {
    window.filters.brands.push(brand);
  }
  window.renderProducts();
};

window.handlePriceSlider = function (val) {
  window.filters.maxPrice = parseInt(val, 10) || 10000;
  const label = document.getElementById("priceSliderLabel");
  if (label) label.textContent = `₹${window.filters.maxPrice.toLocaleString("en-IN")}`;
  window.renderProducts();
};

window.handleSortChange = function (val) {
  window.filters.sortBy = val;
  window.renderProducts();
};

window.clearAllFilters = function () {
  window.filters = {
    style: "All",
    search: "",
    brands: [],
    maxPrice: 10000,
    sortBy: "recommended"
  };
  const sInput = document.getElementById("searchInput");
  if (sInput) sInput.value = "";
  const pInput = document.getElementById("priceRangeInput");
  if (pInput) pInput.value = 10000;
  const pLabel = document.getElementById("priceSliderLabel");
  if (pLabel) pLabel.textContent = "₹10,000";

  window.renderBrandCheckboxes();
  window.setStyleFilter("All");
};

window.renderProducts = function () {
  const grid = document.getElementById("productGrid");
  const countEl = document.getElementById("productCountLabel");
  if (!grid) return;

  let filtered = window.catalog.filter((item) => {
    const matchStyle = window.filters.style === "All" || item.style === window.filters.style;
    const matchBrand = window.filters.brands.length === 0 || window.filters.brands.includes(item.brand);
    const matchPrice = item.price <= window.filters.maxPrice;
    const matchSearch =
      !window.filters.search ||
      item.name.toLowerCase().includes(window.filters.search) ||
      item.brand.toLowerCase().includes(window.filters.search) ||
      item.style.toLowerCase().includes(window.filters.search);

    return matchStyle && matchBrand && matchPrice && matchSearch;
  });

  if (window.filters.sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (window.filters.sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (window.filters.sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
  if (window.filters.sortBy === "discount") {
    filtered.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
  }

  if (countEl) countEl.textContent = `${filtered.length} Indian Women's Designer Outfits`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm">
        <p class="text-sm font-bold text-gray-700">No women's outfits match your current filter selection.</p>
        <button type="button" onclick="window.clearAllFilters()" class="mt-4 px-5 py-2 bg-myntra text-white text-xs font-bold uppercase rounded">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  const fallbackImg = window.FREE_WOMEN_FASHION_API_POOL[0];

  grid.innerHTML = filtered
    .map((p) => {
      const discount = Math.max(0, Math.round(((p.mrp - p.price) / p.mrp) * 100));
      const isWishlisted = window.wishlist.includes(p.id);

      return `
      <div class="product-card rounded-lg overflow-hidden flex flex-col justify-between">
        <div>
          <div class="product-img-wrapper">
            <img
              src="${p.image}"
              alt="${p.name}"
              loading="lazy"
              onerror="this.onerror=null; this.src='${fallbackImg}';"
            />
            <div class="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 shadow-sm">
              <span>${p.rating}</span>
              <span class="text-teal-rating">★</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-600">${p.reviews}</span>
            </div>
            <button type="button" onclick="window.toggleWishlist('${p.id}')" class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition">
              <span class="${isWishlisted ? "text-myntra" : "text-gray-400"} text-base">♥</span>
            </button>
          </div>

          <div class="p-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-sm text-gray-900 truncate">${p.brand}</h3>
              <span class="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-pink-50 text-myntra rounded border border-pink-200">${p.style}</span>
            </div>
            <p class="text-xs text-gray-600 truncate mt-0.5">${p.name}</p>

            <div class="mt-2 flex items-baseline space-x-1.5">
              <span class="font-bold text-sm text-gray-900">₹${p.price.toLocaleString("en-IN")}</span>
              <span class="text-xs text-gray-400 line-through">₹${p.mrp.toLocaleString("en-IN")}</span>
              <span class="text-xs font-bold text-myntra">(${discount}% OFF)</span>
            </div>

            <div class="mt-2.5 flex items-center space-x-1 overflow-x-auto pb-1">
              ${(p.sizes || ["S", "M", "L", "XL"])
                .map(
                  (s, i) => `
                <button type="button" onclick="window.selectCardSize('${p.id}', '${s}', this)" data-size="${s}" class="size-chip-${p.id} text-[11px] px-2 py-0.5 border rounded${
                    i === 0 ? "border-pink-600 text-pink-600 font-bold bg-pink-50" : "border-gray-300 text-gray-600 bg-white"
                  }">
                  ${s}
                </button>
              `
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="px-3 pb-3">
          <button type="button" onclick="window.addToBag('${p.id}')" class="w-full py-2 bg-myntra text-white text-xs font-bold uppercase tracking-wider rounded shadow-sm">
            Add to Bag
          </button>
        </div>
      </div>
    `;
    })
    .join("");
};

window.selectCardSize = function (productId, size, btnEl) {
  document.querySelectorAll(`.size-chip-${productId}`).forEach((b) => {
    b.className = `size-chip-${productId} text-[11px] px-2 py-0.5 border rounded border-gray-300 text-gray-600 bg-white`;
  });
  btnEl.className = `size-chip-${productId} text-[11px] px-2 py-0.5 border rounded border-pink-600 text-pink-600 font-bold bg-pink-50`;
};

window.toggleWishlist = function (productId) {
  if (window.wishlist.includes(productId)) {
    window.wishlist = window.wishlist.filter((id) => id !== productId);
    window.showToast("Removed from Wishlist");
  } else {
    window.wishlist.push(productId);
    window.showToast("Saved to Women's Wishlist ♥");
  }
  window.safeStorage.setItem("bharatstyle_women_v2_wishlist", JSON.stringify(window.wishlist));
  window.updateBagAndWishlistBadges();
  window.renderProducts();
};

window.addToBag = function (productId) {
  const product = window.catalog.find((p) => p.id === productId);
  if (!product) return;

  const selectedChip = document.querySelector(`.size-chip-${productId}.border-pink-600`);
  const chosenSize = selectedChip ? selectedChip.dataset.size : product.sizes[0];

  const existing = window.cart.find((item) => item.id === productId && item.size === chosenSize);
  if (existing) {
    existing.qty += 1;
  } else {
    window.cart.push({ id: product.id, size: chosenSize, qty: 1 });
  }

  window.saveCart();
  window.showToast(`${product.brand} (${chosenSize}) added to Bag!`);
};

window.updateCartQty = function (index, delta) {
  if (!window.cart[index]) return;
  window.cart[index].qty += delta;
  if (window.cart[index].qty <= 0) {
    window.cart.splice(index, 1);
  }
  window.saveCart();
  window.renderBagDrawer();
};

window.saveCart = function () {
  window.safeStorage.setItem("bharatstyle_women_v2_cart", JSON.stringify(window.cart));
  window.updateBagAndWishlistBadges();
};

window.updateBagAndWishlistBadges = function () {
  const totalBagItems = window.cart.reduce((acc, item) => acc + item.qty, 0);
  const bagBadge = document.getElementById("bagCountBadge");
  const wishBadge = document.getElementById("wishlistCountBadge");
  if (bagBadge) bagBadge.textContent = totalBagItems;
  if (wishBadge) wishBadge.textContent = window.wishlist.length;
};

window.toggleBagDrawer = function (show) {
  const drawer = document.getElementById("bagDrawer");
  if (!drawer) return;
  if (show) {
    window.renderBagDrawer();
    drawer.classList.remove("hidden");
  } else {
    drawer.classList.add("hidden");
  }
};

window.applyCouponCode = function () {
  const inputEl = document.getElementById("couponInput");
  const msgEl = document.getElementById("couponStatusMsg");
  if (!inputEl || !msgEl) return;

  const input = inputEl.value.trim().toUpperCase();
  const coupons = window.siteConfig.coupons || {};

  if (coupons[input]) {
    window.appliedCoupon = input;
    msgEl.textContent = `✓ ${input} applied: ${coupons[input].description || "Discount active"}`;
    msgEl.className = "text-xs text-green-600 font-semibold mt-1";
  } else {
    window.appliedCoupon = null;
    msgEl.textContent = `Invalid code. Try: ${Object.keys(coupons).join(", ")}`;
    msgEl.className = "text-xs text-red-600 font-semibold mt-1";
  }
  window.renderBagDrawer();
};

window.calculateCartTotals = function () {
  let totalMrp = 0;
  let subtotal = 0;

  window.cart.forEach((cartItem) => {
    const product = window.catalog.find((p) => p.id === cartItem.id);
    if (product) {
      totalMrp += product.mrp * cartItem.qty;
      subtotal += product.price * cartItem.qty;
    }
  });

  const mrpDiscount = totalMrp - subtotal;
  let couponDiscount = 0;

  const coupons = window.siteConfig.coupons || {};
  if (window.appliedCoupon && coupons[window.appliedCoupon]) {
    const c = coupons[window.appliedCoupon];
    const minOrder = c.minOrder || 0;
    if (subtotal >= minOrder) {
      if (c.type === "PERCENT" || c.discountPercent) {
        const pct = c.value || c.discountPercent || 0;
        couponDiscount = Math.min(Math.round((subtotal * pct) / 100), c.maxDiscount || 99999);
      } else {
        couponDiscount = c.value || c.flatOff || 0;
      }
    }
  }

  const platformFee = subtotal > 0 ? (window.siteConfig.platformFee || 20) : 0;
  const finalPayable = Math.max(0, subtotal - couponDiscount + platformFee);

  return { totalMrp, subtotal, mrpDiscount, couponDiscount, platformFee, finalPayable };
};

window.renderBagDrawer = function () {
  const container = document.getElementById("bagItemsContainer");
  const summaryEl = document.getElementById("bagPriceSummary");
  if (!container || !summaryEl) return;

  if (window.cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <p class="text-gray-600 font-semibold">Your Women's Boutique Bag is empty</p>
        <p class="text-xs text-gray-400 mt-1">Add Kurtas, Sarees, Lehengas, or Fusion Dresses to order.</p>
      </div>
    `;
    summaryEl.innerHTML = "";
    return;
  }

  container.innerHTML = window.cart
    .map((item, idx) => {
      const product = window.catalog.find((p) => p.id === item.id);
      if (!product) return "";
      return `
      <div class="flex space-x-3 bg-white p-3 rounded border border-gray-200">
        <img src="${product.image}" alt="${product.name}" class="w-16 h-20 object-cover rounded" />
        <div class="flex-1">
          <h4 class="text-xs font-bold text-gray-900">${product.brand}</h4>
          <p class="text-xs text-gray-500 truncate">${product.name}</p>
          <p class="text-[11px] text-gray-600 mt-1">Size: <strong>${item.size}</strong></p>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-xs font-bold text-gray-900">₹${(product.price * item.qty).toLocaleString("en-IN")}</span>
            <div class="flex items-center space-x-2 border rounded px-2 py-0.5 bg-pink-50">
              <button type="button" onclick="window.updateCartQty(${idx}, -1)" class="text-xs font-bold text-gray-700 px-1">-</button>
              <span class="text-xs font-semibold">${item.qty}</span>
              <button type="button" onclick="window.updateCartQty(${idx}, 1)" class="text-xs font-bold text-gray-700 px-1">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  const totals = window.calculateCartTotals();
  summaryEl.innerHTML = `
    <div class="border-t border-gray-200 pt-3 space-y-1.5 text-xs">
      <div class="flex justify-between text-gray-600"><span>Total MRP</span><span>₹${totals.totalMrp.toLocaleString("en-IN")}</span></div>
      <div class="flex justify-between text-green-600"><span>Boutique Discount</span><span>-₹${totals.mrpDiscount.toLocaleString("en-IN")}</span></div>
      ${
        totals.couponDiscount > 0
          ? `<div class="flex justify-between text-green-600"><span>Coupon (${window.appliedCoupon})</span><span>-₹${totals.couponDiscount.toLocaleString("en-IN")}</span></div>`
          : ""
      }
      <div class="flex justify-between text-gray-600"><span>Platform Fee</span><span>₹${totals.platformFee}</span></div>
      <div class="flex justify-between font-bold text-sm text-gray-900 border-t pt-2">
        <span>Total Payable</span>
        <span>₹${totals.finalPayable.toLocaleString("en-IN")}</span>
      </div>
    </div>
    <button type="button" onclick="window.openCheckoutOrderForm()" class="mt-4 w-full py-3 bg-myntra text-white font-bold text-xs uppercase tracking-wider rounded shadow">
      Proceed to Order Form
    </button>
  `;
};

window.openCheckoutOrderForm = function () {
  if (window.cart.length === 0) return;
  window.toggleBagDrawer(false);

  const modal = document.getElementById("orderFormModal");
  const totals = window.calculateCartTotals();
  const payableEl = document.getElementById("checkoutPayableAmount");
  if (payableEl) payableEl.textContent = `₹${totals.finalPayable.toLocaleString("en-IN")}`;

  if (window.currentUser) {
    const nameInput = document.getElementById("orderName");
    const phoneInput = document.getElementById("orderPhone");
    if (nameInput && !nameInput.value) nameInput.value = window.currentUser.name || "";
    if (phoneInput && !phoneInput.value) phoneInput.value = window.currentUser.mobile || "";
  }

  if (modal) modal.classList.remove("hidden");
};

window.closeCheckoutOrderForm = function () {
  const modal = document.getElementById("orderFormModal");
  if (modal) modal.classList.add("hidden");
};

window.submitFinalOrder = function (e) {
  e.preventDefault();
  const name = document.getElementById("orderName").value.trim();
  const phone = document.getElementById("orderPhone").value.trim();
  const pincode = document.getElementById("orderPincode").value.trim();
  const city = document.getElementById("orderCity").value.trim();
  const state = document.getElementById("orderState").value;
  const address = document.getElementById("orderAddress").value.trim();
  const paymentRadio = document.querySelector('input[name="paymentMode"]:checked');
  const paymentMode = paymentRadio ? paymentRadio.value : "UPI";
  const errorEl = document.getElementById("orderFormError");

  if (!/^[6-9]\d{9}$/.test(phone)) {
    errorEl.textContent = "Enter a valid 10-digit Indian mobile number.";
    errorEl.classList.remove("hidden");
    return;
  }
  if (!/^[1-9][0-9]{5}$/.test(pincode)) {
    errorEl.textContent = "Enter a valid 6-digit Indian PIN code.";
    errorEl.classList.remove("hidden");
    return;
  }

  errorEl.classList.add("hidden");
  const totals = window.calculateCartTotals();
  const orderId = "BSW-" + Math.floor(100000 + Math.random() * 900000);

  document.getElementById("orderFormBody").innerHTML = `
    <div class="text-center py-6 space-y-3">
      <div class="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">✓</div>
      <h3 class="text-xl font-bold text-gray-900">Women's Boutique Order Confirmed!</h3>
      <p class="text-xs text-gray-600">Order Reference: <strong class="text-gray-900">${orderId}</strong></p>
      <div class="bg-gray-50 p-4 rounded border text-left text-xs space-y-1 max-w-md mx-auto">
        <p><strong>Recipient:</strong> ${name} (+91 ${phone})</p>
        <p><strong>Delivery Address:</strong> ${address}, ${city}, ${state} - ${pincode}</p>
        <p><strong>Payment Mode:</strong> ${paymentMode}</p>
        <p><strong>Total Paid/Payable:</strong> <span class="text-myntra font-bold">₹${totals.finalPayable.toLocaleString("en-IN")}</span></p>
      </div>
      <button type="button" onclick="window.location.reload()" class="mt-4 px-6 py-2.5 bg-myntra text-white text-xs font-bold uppercase rounded">
        Continue Shopping
      </button>
    </div>
  `;

  window.cart = [];
  window.appliedCoupon = null;
  window.saveCart();
};

window.showToast = function (message) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  if (window.toastTimer) clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
};