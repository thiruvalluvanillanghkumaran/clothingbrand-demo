// ============================================================================
// AUTHENTICATION & ADMIN STORE MANAGEMENT ENGINE (auth.js)
// Default Admin Credentials:
//   Admin ID / Email : admin@bharatstyle.in
//   Password         : Admin@123
// ============================================================================

const ADMIN_CREDENTIALS = {
  email: "admin@bharatstyle.in",
  password: "Admin@123"
};

let currentUser = JSON.parse(localStorage.getItem("bharatstyle_user")) || null;
let loginTabMode = "customer"; // 'customer' | 'admin'
let activeAdminTab = "rates";  // 'rates' | 'new-product' | 'coupons' | 'banner'

function initAuthUI() {
  updateUserHeaderUI();
}

function updateUserHeaderUI() {
  const loginBtnLabel = document.getElementById("userStatusLabel");
  const adminBtn = document.getElementById("openAdminDashboardBtn");

  if (currentUser) {
    loginBtnLabel.textContent = currentUser.name.split(" ")[0];
    if (currentUser.role === "admin") {
      adminBtn.classList.remove("hidden");
    } else {
      adminBtn.classList.add("hidden");
    }
  } else {
    loginBtnLabel.textContent = "Login";
    adminBtn.classList.add("hidden");
  }
}

// ============================================================================
// LOGIN MODAL (CUSTOMER OTP vs ADMIN CREDENTIALS)
// ============================================================================
function toggleLoginModal(show, defaultMode = "customer") {
  const modal = document.getElementById("loginModal");
  if (show) {
    loginTabMode = defaultMode;
    modal.classList.remove("hidden");
    renderLoginContent();
  } else {
    modal.classList.add("hidden");
  }
}

function switchLoginTab(mode) {
  loginTabMode = mode;
  renderLoginContent();
}

function renderLoginContent() {
  const container = document.getElementById("loginModalBody");

  // Logged-in Profile View
  if (currentUser) {
    container.innerHTML = `
      <div class="text-center py-4">
        <div class="w-14 h-14 rounded-full bg-pink-50 text-myntra flex items-center justify-center mx-auto mb-3 text-xl font-bold border border-pink-200">
          ${currentUser.name.charAt(0).toUpperCase()}
        </div>
        <h3 class="text-base font-bold text-gray-900">${currentUser.name}</h3>
        <p class="text-xs text-gray-500 mt-0.5">${currentUser.identifier}</p>
        <span class="inline-block mt-2 px-3 py-0.5 text-[11px] font-bold rounded-full ${
          currentUser.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-800"
        }">
          ${currentUser.role === "admin" ? "★ Store Administrator" : "Verified Customer"}
        </span>

        <div class="mt-6 space-y-2">
          ${
            currentUser.role === "admin"
              ? `<button onclick="toggleLoginModal(false); toggleAdminDashboard(true);" class="w-full py-2.5 bg-gray-900 text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-gray-800">
                   ⚙ Open Admin Control Panel
                 </button>`
              : ""
          }
          <button onclick="handleLogout()" class="w-full py-2.5 border border-gray-300 text-gray-700 rounded font-bold text-xs uppercase hover:bg-gray-100">
            Logout
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Tabs for Customer vs Admin Login
  const tabHeader = `
    <div class="grid grid-cols-2 border-b border-gray-200 mb-4 text-xs font-bold uppercase text-center">
      <button onclick="switchLoginTab('customer')" class="py-2.5 ${
        loginTabMode === "customer" ? "border-b-2 border-myntra text-myntra" : "text-gray-500"
      }">
        Customer Login
      </button>
      <button onclick="switchLoginTab('admin')" class="py-2.5 ${
        loginTabMode === "admin" ? "border-b-2 border-purple-600 text-purple-700" : "text-gray-500"
      }">
        Admin Login
      </button>
    </div>
  `;

  if (loginTabMode === "customer") {
    container.innerHTML = `
      ${tabHeader}
      <div class="space-y-3.5">
        <div class="bg-pink-50 p-2.5 rounded text-[11px] text-gray-700 border border-pink-100">
          <strong>Customer Demo:</strong> Enter any 10-digit Indian mobile number & OTP <strong>1234</strong>.
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-gray-600 mb-1">Full Name</label>
          <input id="custLoginName" type="text" placeholder="e.g. Karthik Raja" class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-pink-500" />
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-gray-600 mb-1">Mobile Number (+91)</label>
          <input id="custLoginMobile" type="tel" maxlength="10" placeholder="10-digit mobile number" class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-pink-500" />
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-gray-600 mb-1">OTP</label>
          <input id="custLoginOtp" type="password" maxlength="4" value="1234" class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-pink-500" />
        </div>
        <p id="loginError" class="text-xs text-red-600 font-semibold hidden"></p>
        <button onclick="handleCustomerLogin()" class="w-full py-2.5 bg-myntra text-white font-bold rounded text-xs uppercase tracking-wider">
          Login as Customer
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      ${tabHeader}
      <div class="space-y-3.5">
        <div class="bg-purple-50 p-2.5 rounded text-[11px] text-purple-900 border border-purple-200">
          <strong>Admin Credentials:</strong><br/>
          ID: <code>admin@bharatstyle.in</code> | Password: <code>Admin@123</code>
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-gray-600 mb-1">Admin Email / ID</label>
          <input id="adminLoginEmail" type="email" value="admin@bharatstyle.in" class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-purple-600" />
        </div>
        <div>
          <label class="block text-[11px] font-bold uppercase text-gray-600 mb-1">Admin Password</label>
          <input id="adminLoginPassword" type="password" value="Admin@123" class="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-purple-600" />
        </div>
        <p id="loginError" class="text-xs text-red-600 font-semibold hidden"></p>
        <button onclick="handleAdminLogin()" class="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded text-xs uppercase tracking-wider">
          Login to Admin Portal
        </button>
      </div>
    `;
  }
}

function handleCustomerLogin() {
  const name = document.getElementById("custLoginName").value.trim() || "BharatStyle Shopper";
  const mobile = document.getElementById("custLoginMobile").value.trim();
  const otp = document.getElementById("custLoginOtp").value.trim();
  const errorEl = document.getElementById("loginError");

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    errorEl.textContent = "Please enter a valid 10-digit Indian mobile number.";
    errorEl.classList.remove("hidden");
    return;
  }
  if (otp !== "1234") {
    errorEl.textContent = "Invalid OTP. Use 1234.";
    errorEl.classList.remove("hidden");
    return;
  }

  currentUser = { name, identifier: `+91 ${mobile}`, mobile, role: "customer" };
  localStorage.setItem("bharatstyle_user", JSON.stringify(currentUser));
  updateUserHeaderUI();
  toggleLoginModal(false);
  showToast(`Welcome, ${currentUser.name}!`);
}

function handleAdminLogin() {
  const email = document.getElementById("adminLoginEmail").value.trim();
  const password = document.getElementById("adminLoginPassword").value.trim();
  const errorEl = document.getElementById("loginError");

  if (email.toLowerCase() !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
    errorEl.textContent = "Invalid Admin ID or Password!";
    errorEl.classList.remove("hidden");
    return;
  }

  currentUser = {
    name: "Store Admin",
    identifier: email,
    mobile: "9876543210",
    role: "admin"
  };

  localStorage.setItem("bharatstyle_user", JSON.stringify(currentUser));
  updateUserHeaderUI();
  toggleLoginModal(false);
  toggleAdminDashboard(true);
  showToast("Logged in as Store Admin");
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("bharatstyle_user");
  updateUserHeaderUI();
  toggleLoginModal(false);
  showToast("Logged out successfully");
}

// ============================================================================
// 4-TAB ADMIN STORE MANAGEMENT PORTAL
// ============================================================================
function toggleAdminDashboard(show) {
  if (show && (!currentUser || currentUser.role !== "admin")) {
    toggleLoginModal(true, "admin");
    return;
  }

  const modal = document.getElementById("adminDashboardModal");
  if (show) {
    modal.classList.remove("hidden");
    switchAdminTab(activeAdminTab);
  } else {
    modal.classList.add("hidden");
  }
}

function switchAdminTab(tabName) {
  activeAdminTab = tabName;
  document.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  const content = document.getElementById("adminDashboardBody");
  if (tabName === "rates") renderAdminRatesAndImagesTab(content);
  if (tabName === "new-product") renderAdminNewProductTab(content);
  if (tabName === "coupons") renderAdminCouponsTab(content);
  if (tabName === "banner") renderAdminBannerAndFeesTab(content);
}

// ----------------------------------------------------------------------------
// TAB 1: UPDATE DAILY RATES, IMAGES & STOCK
// ----------------------------------------------------------------------------
function renderAdminRatesAndImagesTab(container) {
  const products = getActiveProducts();

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <p class="text-xs text-gray-600">Update daily selling rates (₹), MRPs, royalty-free image links, or delete items.</p>
      <div class="flex space-x-2">
        <button onclick="resetStoreToDefaults()" class="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100">
          Reset Defaults
        </button>
        <button onclick="saveBulkProductEdits()" class="px-4 py-1.5 bg-myntra text-white rounded text-xs font-bold uppercase">
          💾 Save All Rate & Image Changes
        </button>
      </div>
    </div>

    <div class="overflow-x-auto border rounded-lg max-h-[55vh]">
      <table class="w-full text-left border-collapse text-xs">
        <thead class="bg-gray-100 uppercase text-[11px] text-gray-600 sticky top-0 z-10">
          <tr>
            <th class="p-2.5">Preview</th>
            <th class="p-2.5">ID / Brand</th>
            <th class="p-2.5">Outfit Name</th>
            <th class="p-2.5">Selling Price (₹)</th>
            <th class="p-2.5">MRP (₹)</th>
            <th class="p-2.5">Royalty-Free Image URL</th>
            <th class="p-2.5 text-center">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          ${products
            .map(
              (p, idx) => `
            <tr class="hover:bg-gray-50">
              <td class="p-2">
                <img id="preview-img-${idx}" src="${p.image}" class="w-10 h-12 object-cover rounded border" />
              </td>
              <td class="p-2 font-bold text-gray-800">
                ${p.id}
                <input id="edit-brand-${idx}" type="text" value="${p.brand}" class="block mt-1 w-28 border rounded px-1.5 py-0.5 text-xs font-semibold text-myntra" />
              </td>
              <td class="p-2">
                <input id="edit-name-${idx}" type="text" value="${p.name}" class="w-48 border rounded px-2 py-1 text-xs" />
              </td>
              <td class="p-2">
                <input id="edit-price-${idx}" type="number" min="99" value="${p.price}" class="w-24 border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-900" />
              </td>
              <td class="p-2">
                <input id="edit-mrp-${idx}" type="number" min="99" value="${p.mrp}" class="w-24 border border-gray-300 rounded px-2 py-1 text-xs text-gray-500" />
              </td>
              <td class="p-2">
                <input
                  id="edit-img-${idx}"
                  type="url"
                  value="${p.image}"
                  oninput="document.getElementById('preview-img-${idx}').src = this.value"
                  class="w-64 border border-gray-300 rounded px-2 py-1 text-xs"
                />
              </td>
              <td class="p-2 text-center">
                <button onclick="deleteProductById('${p.id}')" class="text-red-600 hover:underline font-bold text-xs">Delete</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function saveBulkProductEdits() {
  const products = getActiveProducts();
  const updated = products.map((p, idx) => {
    const brand = document.getElementById(`edit-brand-${idx}`).value.trim() || p.brand;
    const name = document.getElementById(`edit-name-${idx}`).value.trim() || p.name;
    const price = parseInt(document.getElementById(`edit-price-${idx}`).value, 10) || p.price;
    const mrp = parseInt(document.getElementById(`edit-mrp-${idx}`).value, 10) || p.mrp;
    const image = document.getElementById(`edit-img-${idx}`).value.trim() || p.image;

    return {
      ...p,
      brand,
      name,
      price,
      mrp: Math.max(price, mrp),
      image
    };
  });

  saveActiveProducts(updated);
  refreshStorefrontUI();
  showToast("Rates & Images updated across the store!");
}

function deleteProductById(productId) {
  const products = getActiveProducts().filter((p) => p.id !== productId);
  saveActiveProducts(products);
  refreshStorefrontUI();
  renderAdminRatesAndImagesTab(document.getElementById("adminDashboardBody"));
  showToast(`Product ${productId} removed.`);
}

// ----------------------------------------------------------------------------
// TAB 2: ADD NEW INDIAN BRAND PRODUCT
// ----------------------------------------------------------------------------
function renderAdminNewProductTab(container) {
  container.innerHTML = `
    <form onsubmit="handleAddNewProduct(event)" class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
      <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label class="block font-bold uppercase text-gray-600 mb-1">Indian Brand Name *</label>
          <input id="newProdBrand" type="text" required list="indianBrandsSuggestions" placeholder="e.g. Manyavar, Biba, Fabindia, Libas" class="w-full border rounded px-3 py-2" />
          <datalist id="indianBrandsSuggestions">
            <option value="Manyavar"></option>
            <option value="Biba"></option>
            <option value="Fabindia"></option>
            <option value="Raymond"></option>
            <option value="W for Woman"></option>
            <option value="Soch"></option>
            <option value="Peter England"></option>
            <option value="Aurelia"></option>
            <option value="House of Pataudi"></option>
            <option value="Global Desi"></option>
            <option value="Libas"></option>
            <option value="Allen Solly"></option>
          </datalist>
        </div>

        <div>
          <label class="block font-bold uppercase text-gray-600 mb-1">Outfit Title *</label>
          <input id="newProdName" type="text" required placeholder="e.g. Chanderi Silk Embroidered Kurta Set" class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block font-bold uppercase text-gray-600 mb-1">Department *</label>
          <select id="newProdCategory" class="w-full border rounded px-3 py-2 bg-white">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        </div>

        <div>
          <label class="block font-bold uppercase text-gray-600 mb-1">Style Category *</label>
          <select id="newProdStyle" class="w-full border rounded px-3 py-2 bg-white">
            <option value="Ethnic">Ethnic</option>
            <option value="Casual">Casual</option>
            <option value="Formal">Formal</option>
          </select>
        </div>

        <div>
          <label class="block font-bold uppercase text-gray-600 mb-1">Selling Rate (₹) *</label>
          <input id="newProdPrice" type="number" min="99" required placeholder="e.g. 2499" class="w-full border rounded px-3 py-2 font-bold" />
        </div>

        <div>
          <label class="block font-bold uppercase text-gray-600 mb-1">Original MRP (₹) *</label>
          <input id="newProdMrp" type="number" min="99" required placeholder="e.g. 4999" class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block font-bold uppercase text-gray-600 mb-1">Available Sizes (Comma Separated) *</label>
          <input id="newProdSizes" type="text" value="S, M, L, XL, XXL" required class="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label class="block font-bold uppercase text-gray-600 mb-1">Royalty-Free Image URL *</label>
          <input
            id="newProdImage"
            type="url"
            required
            value="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
            oninput="document.getElementById('newProdLivePreview').src = this.value"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div class="sm:col-span-2 pt-2">
          <button type="submit" class="w-full py-3 bg-myntra text-white font-bold uppercase tracking-wider rounded">
            + Publish New Product to Storefront
          </button>
        </div>
      </div>

      <!-- Live Image Card Preview -->
      <div class="bg-gray-50 p-4 rounded border flex flex-col items-center justify-center">
        <span class="text-[11px] font-bold uppercase text-gray-500 mb-2">Live Image Preview</span>
        <img
          id="newProdLivePreview"
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
          alt="Preview"
          class="w-40 h-52 object-cover rounded shadow border bg-white"
        />
      </div>
    </form>
  `;
}

function handleAddNewProduct(e) {
  e.preventDefault();
  const products = getActiveProducts();
  const nextNum = 101 + products.length + Math.floor(Math.random() * 50);

  const price = parseInt(document.getElementById("newProdPrice").value, 10);
  const mrp = Math.max(price, parseInt(document.getElementById("newProdMrp").value, 10));
  const sizesRaw = document.getElementById("newProdSizes").value;
  const sizes = sizesRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const newProduct = {
    id: `IND-${nextNum}`,
    brand: document.getElementById("newProdBrand").value.trim(),
    name: document.getElementById("newProdName").value.trim(),
    category: document.getElementById("newProdCategory").value,
    style: document.getElementById("newProdStyle").value,
    price,
    mrp,
    rating: 4.7,
    reviews: 12,
    sizes: sizes.length ? sizes : ["M", "L", "XL"],
    image: document.getElementById("newProdImage").value.trim(),
    inStock: true
  };

  products.unshift(newProduct);
  saveActiveProducts(products);
  refreshStorefrontUI();
  switchAdminTab("rates");
  showToast(`Added ${newProduct.brand} -${newProduct.name}!`);
}

// ----------------------------------------------------------------------------
// TAB 3: COUPONS MANAGER (ADD / DELETE PROMO CODES)
// ----------------------------------------------------------------------------
function renderAdminCouponsTab(container) {
  const config = getActiveSiteConfig();
  const couponsEntries = Object.entries(config.coupons || {});

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
      <!-- Existing Active Coupons -->
      <div>
        <h3 class="font-bold uppercase text-gray-700 mb-3">Active Store Coupons</h3>
        <div class="space-y-2.5">
          ${
            couponsEntries.length === 0
              ? `<p class="text-gray-400">No active coupons configured.</p>`
              : couponsEntries
                  .map(
                    ([code, details]) => `
                <div class="p-3 bg-gray-50 border rounded flex items-center justify-between">
                  <div>
                    <span class="px-2 py-0.5 bg-pink-100 text-myntra font-extrabold rounded text-xs">${code}</span>
                    <p class="text-gray-700 font-semibold mt-1">${details.description}</p>
                    <p class="text-[11px] text-gray-500">
                      Type: ${details.type} | Value: ${details.type === "PERCENT" ? details.value + "%" : "₹" + details.value} | Min Order: ₹${details.minOrder || 0}
                    </p>
                  </div>
                  <button onclick="deleteCouponCode('${code}')" class="text-red-600 font-bold hover:underline">Remove</button>
                </div>
              `
                  )
                  .join("")
          }
        </div>
      </div>

      <!-- Create or Update Coupon Form -->
      <form onsubmit="handleAddCoupon(event)" class="bg-gray-50 p-4 rounded border space-y-3">
        <h3 class="font-bold uppercase text-gray-700">Create / Update Coupon Code</h3>
        <div>
          <label class="block font-bold text-gray-600 mb-1">Coupon Code *</label>
          <input id="newCouponCode" type="text" required placeholder="e.g. DIWALI30" class="w-full border rounded px-3 py-2 uppercase font-bold" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Discount Type *</label>
            <select id="newCouponType" class="w-full border rounded px-2 py-2 bg-white">
              <option value="PERCENT">Percentage (%)</option>
              <option value="FLAT">Flat Rupees (₹)</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Discount Value *</label>
            <input id="newCouponVal" type="number" min="1" required placeholder="e.g. 25 or 500" class="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-600 mb-1">Min Order (₹)</label>
            <input id="newCouponMin" type="number" value="999" class="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label class="block font-bold text-gray-600 mb-1">Max Discount Cap (₹)</label>
            <input id="newCouponMax" type="number" value="1500" class="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label class="block font-bold text-gray-600 mb-1">Promotional Description *</label>
          <input id="newCouponDesc" type="text" required placeholder="e.g. 30% OFF on Festive Ethnic Wear" class="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" class="w-full py-2.5 bg-myntra text-white font-bold uppercase rounded">
          + Save Coupon Code
        </button>
      </form>
    </div>
  `;
}

function handleAddCoupon(e) {
  e.preventDefault();
  const config = getActiveSiteConfig();
  const code = document.getElementById("newCouponCode").value.trim().toUpperCase();
  const type = document.getElementById("newCouponType").value;
  const value = parseInt(document.getElementById("newCouponVal").value, 10);
  const minOrder = parseInt(document.getElementById("newCouponMin").value, 10) || 0;
  const maxDiscount = parseInt(document.getElementById("newCouponMax").value, 10) || 5000;
  const description = document.getElementById("newCouponDesc").value.trim();

  config.coupons[code] = { type, value, minOrder, maxDiscount, description };
  saveActiveSiteConfig(config);
  refreshStorefrontUI();
  renderAdminCouponsTab(document.getElementById("adminDashboardBody"));
  showToast(`Coupon ${code} is now live!`);
}

function deleteCouponCode(code) {
  const config = getActiveSiteConfig();
  delete config.coupons[code];
  saveActiveSiteConfig(config);
  refreshStorefrontUI();
  renderAdminCouponsTab(document.getElementById("adminDashboardBody"));
  showToast(`Coupon ${code} deleted.`);
}

// ----------------------------------------------------------------------------
// TAB 4: TOP PROMO BANNER & PLATFORM FEES
// ----------------------------------------------------------------------------
function renderAdminBannerAndFeesTab(container) {
  const config = getActiveSiteConfig();

  container.innerHTML = `
    <form onsubmit="handleSaveBannerAndFees(event)" class="max-w-xl space-y-4 text-xs">
      <div>
        <label class="block font-bold uppercase text-gray-700 mb-1">Top Promotional Banner Announcement *</label>
        <input
          id="editBannerText"
          type="text"
          required
          value="${config.promoBannerText}"
          class="w-full border border-gray-300 rounded px-3 py-2 text-xs font-semibold"
        />
        <p class="text-[11px] text-gray-400 mt-1">Appears across the very top gradient bar of the store.</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block font-bold uppercase text-gray-700 mb-1">Platform Convenience Fee (₹)</label>
          <input id="editPlatformFee" type="number" min="0" value="${config.platformFee}" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block font-bold uppercase text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
          <input id="editFreeShip" type="number" min="0" value="${config.freeShippingThreshold}" class="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <button type="submit" class="px-6 py-2.5 bg-myntra text-white font-bold uppercase rounded">
        Update Banner & Store Fees
      </button>
    </form>
  `;
}

function handleSaveBannerAndFees(e) {
  e.preventDefault();
  const config = getActiveSiteConfig();
  config.promoBannerText = document.getElementById("editBannerText").value.trim();
  config.platformFee = parseInt(document.getElementById("editPlatformFee").value, 10) || 0;
  config.freeShippingThreshold = parseInt(document.getElementById("editFreeShip").value, 10) || 0;

  saveActiveSiteConfig(config);
  refreshStorefrontUI();
  showToast("Store banner & fee settings updated!");
}

// ----------------------------------------------------------------------------
// EXPORT UPDATED `data.js` FILE OR RESET DEFAULTS
// ----------------------------------------------------------------------------
function exportUpdatedDataJsFile() {
  const config = getActiveSiteConfig();
  const products = getActiveProducts();

  const fileContent = `// Auto-Generated by BharatStyle Admin Portal (${new Date().toLocaleDateString("en-IN")})
const DEFAULT_SITE_CONFIG = ${JSON.stringify(config, null, 2)};

const INITIAL_PRODUCTS = ${JSON.stringify(products, null, 2)};

function getActiveProducts() {
  const saved = localStorage.getItem("bharatstyle_daily_products");
  return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
}
function saveActiveProducts(productsList) {
  localStorage.setItem("bharatstyle_daily_products", JSON.stringify(productsList));
}
function getActiveSiteConfig() {
  const saved = localStorage.getItem("bharatstyle_site_config");
  return saved ? JSON.parse(saved) : DEFAULT_SITE_CONFIG;
}
function saveActiveSiteConfig(configObj) {
  localStorage.setItem("bharatstyle_site_config", JSON.stringify(configObj));
}
`;

  const blob = new Blob([fileContent], { type: "application/javascript" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data.js";
  link.click();
  showToast("Downloaded updated data.js file!");
}

function resetStoreToDefaults() {
  localStorage.removeItem("bharatstyle_daily_products");
  localStorage.removeItem("bharatstyle_site_config");
  refreshStorefrontUI();
  switchAdminTab(activeAdminTab);
  showToast("Store reset to original data.js defaults.");
}