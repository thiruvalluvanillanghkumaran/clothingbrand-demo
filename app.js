// ============================================================================
// CORE STOREFRONT & CHECKOUT ENGINE (app.js)
// Syncs live with Admin updates from data.js / localStorage
// ============================================================================

let catalog = [];
let siteConfig = {};
let cart = JSON.parse(localStorage.getItem("bharatstyle_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("bharatstyle_wishlist")) || [];
let appliedCoupon = null;

let filters = {
  category: "All",
  style: "All",
  search: "",
  brands: [],
  maxPrice: 10000,
  sortBy: "recommended"
};

document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();
  refreshStorefrontUI();
  updateBagAndWishlistBadges();
});

function refreshStorefrontUI() {
  catalog = getActiveProducts();
  siteConfig = getActiveSiteConfig();

  // Update Top Promo Banner
  const promoEl = document.getElementById("dailyPromoBanner");
  if (promoEl) {
    promoEl.textContent = siteConfig.promoBannerText;
  }

  // Update available coupon hints inside Bag drawer
  const couponHintEl = document.getElementById("availableCouponsHint");
  if (couponHintEl && siteConfig.coupons) {
    const codes = Object.keys(siteConfig.coupons);
    couponHintEl.textContent = codes.length ? `Available: ${codes.join(", ")}` : "No active coupons";
  }

  renderBrandCheckboxes();
  renderProducts();
}

function renderBrandCheckboxes() {
  const uniqueBrands = [...new Set(catalog.map((item) => item.brand))];
  const container = document.getElementById("brandFilterList");

  container.innerHTML = uniqueBrands
    .map(
      (brand) => `
    <label class="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
      <input type="checkbox" value="${brand}" ${
        filters.brands.includes(brand) ? "checked" : ""
      } onchange="toggleBrandFilter('${brand}')" class="rounded text-pink-600 focus:ring-0" />
      <span>${brand}</span>
    </label>
  `
    )
    .join("");
}

// Filter Handlers
function setCategoryFilter(category) {
  filters.category = category;
  document.querySelectorAll(".nav-tab").forEach((el) => {
    el.classList.toggle("active", el.dataset.cat === category);
  });
  renderProducts();
}

function setStyleFilter(style) {
  filters.style = style;
  renderProducts();
}

function handleSearchInput(val) {
  filters.search = val.trim().toLowerCase();
  renderProducts();
}

function toggleBrandFilter(brand) {
  if (filters.brands.includes(brand)) {
    filters.brands = filters.brands.filter((b) => b !== brand);
  } else {
    filters.brands.push(brand);
  }
  renderProducts();
}

function handlePriceSlider(val) {
  filters.maxPrice = parseInt(val, 10);
  document.getElementById("priceSliderLabel").textContent = `₹${filters.maxPrice.toLocaleString("en-IN")}`;
  renderProducts();
}

function handleSortChange(val) {
  filters.sortBy = val;
  renderProducts();
}

function clearAllFilters() {
  filters = {
    category: "All",
    style: "All",
    search: "",
    brands: [],
    maxPrice: 10000,
    sortBy: "recommended"
  };
  document.getElementById("searchInput").value = "";
  document.getElementById("priceRangeInput").value = 10000;
  document.getElementById("priceSliderLabel").textContent = "₹10,000";
  renderBrandCheckboxes();
  setCategoryFilter("All");
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const countEl = document.getElementById("productCountLabel");

  let filtered = catalog.filter((item) => {
    const matchCat = filters.category === "All" || item.category === filters.category;
    const matchStyle = filters.style === "All" || item.style === filters.style;
    const matchBrand = filters.brands.length === 0 || filters.brands.includes(item.brand);
    const matchPrice = item.price <= filters.maxPrice;
    const matchSearch =
      !filters.search ||
      item.name.toLowerCase().includes(filters.search) ||
      item.brand.toLowerCase().includes(filters.search) ||
      item.style.toLowerCase().includes(filters.search);

    return matchCat && matchStyle && matchBrand && matchPrice && matchSearch;
  });

  if (filters.sortBy === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (filters.sortBy === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (filters.sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
  if (filters.sortBy === "discount") {
    filtered.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
  }

  countEl.textContent = `${filtered.length} Indian Brand Outfits Available`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white p-12 text-center rounded border border-gray-200">
        <p class="text-sm font-bold text-gray-700">No outfits match your current filter selection.</p>
        <button onclick="clearAllFilters()" class="mt-4 px-5 py-2 bg-myntra text-white text-xs font-bold uppercase rounded">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const discount = Math.max(0, Math.round(((p.mrp - p.price) / p.mrp) * 100));
      const isWishlisted = wishlist.includes(p.id);

      return `
      <div class="product-card rounded overflow-hidden flex flex-col justify-between">
        <div>
          <div class="product-img-wrapper">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
            <div class="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 shadow-sm">
              <span>${p.rating}</span>
              <span class="text-teal-rating">★</span>
              <span class="text-gray-400">|</span>
              <span class="text-gray-600">${p.reviews}</span>
            </div>
            <button onclick="toggleWishlist('${p.id}')" class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition">
              <span class="${isWishlisted ? "text-myntra" : "text-gray-400"} text-base">♥</span>
            </button>
          </div>

          <div class="p-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-sm text-gray-900 truncate">${p.brand}</h3>
              <span class="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200">${p.style}</span>
            </div>
            <p class="text-xs text-gray-500 truncate mt-0.5">${p.name}</p>

            <div class="mt-2 flex items-baseline space-x-1.5">
              <span class="font-bold text-sm text-gray-900">₹${p.price.toLocaleString("en-IN")}</span>
              <span class="text-xs text-gray-400 line-through">₹${p.mrp.toLocaleString("en-IN")}</span>
              <span class="text-xs font-semibold text-orange-500">(${discount}% OFF)</span>
            </div>

            <div class="mt-2.5 flex items-center space-x-1 overflow-x-auto pb-1">
              ${p.sizes
                .map(
                  (s, i) => `
                <button onclick="selectCardSize('${p.id}', '${s}', this)" data-size="${s}" class="size-chip-${p.id} text-[11px] px-2 py-0.5 border rounded${
                    i === 0 ? "border-pink-600 text-pink-600 font-bold bg-pink-50" : "border-gray-300 text-gray-600"
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
          <button onclick="addToBag('${p.id}')" class="w-full py-2 bg-myntra text-white text-xs font-bold uppercase tracking-wider rounded">
            Add to Bag
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

function selectCardSize(productId, size, btnEl) {
  document.querySelectorAll(`.size-chip-${productId}`).forEach((b) => {
    b.className = `size-chip-${productId} text-[11px] px-2 py-0.5 border rounded border-gray-300 text-gray-600`;
  });
  btnEl.className = `size-chip-${productId} text-[11px] px-2 py-0.5 border rounded border-pink-600 text-pink-600 font-bold bg-pink-50`;
}

// Wishlist & Cart
function toggleWishlist(productId) {
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter((id) => id !== productId);
    showToast("Removed from Wishlist");
  } else {
    wishlist.push(productId);
    showToast("Saved to Wishlist ♥");
  }
  localStorage.setItem("bharatstyle_wishlist", JSON.stringify(wishlist));
  updateBagAndWishlistBadges();
  renderProducts();
}

function addToBag(productId) {
  const product = catalog.find((p) => p.id === productId);
  if (!product) return;

  const selectedChip = document.querySelector(`.size-chip-${productId}.border-pink-600`);
  const chosenSize = selectedChip ? selectedChip.dataset.size : product.sizes[0];

  const existing = cart.find((item) => item.id === productId && item.size === chosenSize);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, size: chosenSize, qty: 1 });
  }

  saveCart();
  showToast(`${product.brand} (${chosenSize}) added to Bag!`);
}

function updateCartQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  renderBagDrawer();
}

function saveCart() {
  localStorage.setItem("bharatstyle_cart", JSON.stringify(cart));
  updateBagAndWishlistBadges();
}

function updateBagAndWishlistBadges() {
  const totalBagItems = cart.reduce((acc, item) => acc + item.qty, 0);
  document.getElementById("bagCountBadge").textContent = totalBagItems;
  document.getElementById("wishlistCountBadge").textContent = wishlist.length;
}

function toggleBagDrawer(show) {
  const drawer = document.getElementById("bagDrawer");
  if (show) {
    renderBagDrawer();
    drawer.classList.remove("hidden");
  } else {
    drawer.classList.add("hidden");
  }
}

function applyCouponCode() {
  const input = document.getElementById("couponInput").value.trim().toUpperCase();
  const msgEl = document.getElementById("couponStatusMsg");
  const coupons = siteConfig.coupons || {};

  if (coupons[input]) {
    appliedCoupon = input;
    msgEl.textContent = `✓ ${input} applied: ${coupons[input].description}`;
    msgEl.className = "text-xs text-green-600 font-semibold mt-1";
  } else {
    appliedCoupon = null;
    msgEl.textContent = `Invalid coupon code. Try one of: ${Object.keys(coupons).join(", ")}`;
    msgEl.className = "text-xs text-red-600 font-semibold mt-1";
  }
  renderBagDrawer();
}

function calculateCartTotals() {
  let totalMrp = 0;
  let subtotal = 0;

  cart.forEach((cartItem) => {
    const product = catalog.find((p) => p.id === cartItem.id);
    if (product) {
      totalMrp += product.mrp * cartItem.qty;
      subtotal += product.price * cartItem.qty;
    }
  });

  const mrpDiscount = totalMrp - subtotal;
  let couponDiscount = 0;

  const coupons = siteConfig.coupons || {};
  if (appliedCoupon && coupons[appliedCoupon]) {
    const c = coupons[appliedCoupon];
    if (subtotal >= (c.minOrder || 0)) {
      if (c.type === "PERCENT") {
        couponDiscount = Math.min(Math.round((subtotal * c.value) / 100), c.maxDiscount || 99999);
      } else {
        couponDiscount = c.value;
      }
    }
  }

  const platformFee = subtotal > 0 ? siteConfig.platformFee : 0;
  const finalPayable = Math.max(0, subtotal - couponDiscount + platformFee);

  return { totalMrp, subtotal, mrpDiscount, couponDiscount, platformFee, finalPayable };
}

function renderBagDrawer() {
  const container = document.getElementById("bagItemsContainer");
  const summaryEl = document.getElementById("bagPriceSummary");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <p class="text-gray-500 font-semibold">Your Shopping Bag is empty</p>
        <p class="text-xs text-gray-400 mt-1">Add Indian heritage outfits to proceed to the order form.</p>
      </div>
    `;
    summaryEl.innerHTML = "";
    return;
  }

  container.innerHTML = cart
    .map((item, idx) => {
      const product = catalog.find((p) => p.id === item.id);
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
            <div class="flex items-center space-x-2 border rounded px-2 py-0.5">
              <button onclick="updateCartQty(${idx}, -1)" class="text-xs font-bold text-gray-600">-</button>
              <span class="text-xs font-semibold">${item.qty}</span>
              <button onclick="updateCartQty(${idx}, 1)" class="text-xs font-bold text-gray-600">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  const totals = calculateCartTotals();
  summaryEl.innerHTML = `
    <div class="border-t border-gray-200 pt-3 space-y-1.5 text-xs">
      <div class="flex justify-between text-gray-600"><span>Total MRP</span><span>₹${totals.totalMrp.toLocaleString("en-IN")}</span></div>
      <div class="flex justify-between text-green-600"><span>Discount on MRP</span><span>-₹${totals.mrpDiscount.toLocaleString("en-IN")}</span></div>
      ${
        totals.couponDiscount > 0
          ? `<div class="flex justify-between text-green-600"><span>Coupon (${appliedCoupon})</span><span>-₹${totals.couponDiscount.toLocaleString("en-IN")}</span></div>`
          : ""
      }
      <div class="flex justify-between text-gray-600"><span>Platform Fee</span><span>₹${totals.platformFee}</span></div>
      <div class="flex justify-between font-bold text-sm text-gray-900 border-t pt-2">
        <span>Total Payable</span>
        <span>₹${totals.finalPayable.toLocaleString("en-IN")}</span>
      </div>
    </div>
    <button onclick="openCheckoutOrderForm()" class="mt-4 w-full py-3 bg-myntra text-white font-bold text-xs uppercase tracking-wider rounded">
      Proceed to Order Form
    </button>
  `;
}

// Order Checkout Form
function openCheckoutOrderForm() {
  if (cart.length === 0) return;
  toggleBagDrawer(false);

  const modal = document.getElementById("orderFormModal");
  const totals = calculateCartTotals();
  document.getElementById("checkoutPayableAmount").textContent = `₹${totals.finalPayable.toLocaleString("en-IN")}`;

  if (currentUser) {
    document.getElementById("orderName").value = currentUser.name || "";
    document.getElementById("orderPhone").value = currentUser.mobile || "";
  }

  modal.classList.remove("hidden");
}

function closeCheckoutOrderForm() {
  document.getElementById("orderFormModal").classList.add("hidden");
}

function submitFinalOrder(e) {
  e.preventDefault();
  const name = document.getElementById("orderName").value.trim();
  const phone = document.getElementById("orderPhone").value.trim();
  const pincode = document.getElementById("orderPincode").value.trim();
  const city = document.getElementById("orderCity").value.trim();
  const state = document.getElementById("orderState").value;
  const address = document.getElementById("orderAddress").value.trim();
  const paymentMode = document.querySelector('input[name="paymentMode"]:checked').value;
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
  const totals = calculateCartTotals();
  const orderId = "BS-" + Math.floor(100000 + Math.random() * 900000);

  document.getElementById("orderFormBody").innerHTML = `
    <div class="text-center py-6 space-y-3">
      <div class="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">✓</div>
      <h3 class="text-xl font-bold text-gray-900">Order Confirmed!</h3>
      <p class="text-xs text-gray-600">Order Reference: <strong class="text-gray-900">${orderId}</strong></p>
      <div class="bg-gray-50 p-4 rounded border text-left text-xs space-y-1 max-w-md mx-auto">
        <p><strong>Recipient:</strong> ${name} (+91 ${phone})</p>
        <p><strong>Delivery Address:</strong> ${address}, ${city}, ${state} - ${pincode}</p>
        <p><strong>Payment Mode:</strong> ${paymentMode}</p>
        <p><strong>Total Paid/Payable:</strong> <span class="text-myntra font-bold">₹${totals.finalPayable.toLocaleString("en-IN")}</span></p>
      </div>
      <button onclick="window.location.reload()" class="mt-4 px-6 py-2.5 bg-myntra text-white text-xs font-bold uppercase rounded">
        Continue Shopping
      </button>
    </div>
  `;

  cart = [];
  appliedCoupon = null;
  saveCart();
}

function showToast(message) {
  const toast = document.getElementById("toastNotification");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
}