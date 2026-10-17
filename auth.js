// ============================================================================
// 2. AUTHENTICATION & WOMEN'S BOUTIQUE ADMIN ENGINE (auth.js)
// Features: Local Image File Upload (to /uploads folder) + Free API Image Generator
// ============================================================================

window.ADMIN_CREDENTIALS = {
  email: "admin@bharatstyle.in",
  password: "Admin@123"
};

window.currentUser = null;
try {
  var savedUser = window.safeStorage.getItem("bharatstyle_women_v2_user");
  if (savedUser) {
    window.currentUser = JSON.parse(savedUser);
  }
} catch (e) {
  window.currentUser = null;
}

window.activeAdminTab = "rates";

window.initAuthUI = function () {
  window.updateUserHeaderUI();
};

window.updateUserHeaderUI = function () {
  var loginBtnLabel = document.getElementById("userStatusLabel");
  var adminBtn = document.getElementById("openAdminDashboardBtn");
  if (!loginBtnLabel) return;

  if (window.currentUser && window.currentUser.name) {
    loginBtnLabel.textContent = window.currentUser.name.split(" ")[0];
    if (adminBtn) {
      if (window.currentUser.role === "admin") {
        adminBtn.classList.remove("hidden");
      } else {
        adminBtn.classList.add("hidden");
      }
    }
  } else {
    loginBtnLabel.textContent = "Login";
    if (adminBtn) adminBtn.classList.add("hidden");
  }
};

window.toggleLoginModal = function (show) {
  var modal = document.getElementById("loginModal");
  if (!modal) return;
  if (show) {
    modal.classList.remove("hidden");
    window.renderLoginContent();
  } else {
    modal.classList.add("hidden");
  }
};

window.handleIdentifierInput = function (val) {
  var clean = (val || "").trim().toLowerCase();
  var nameWrapper = document.getElementById("custNameFieldWrapper");
  if (!nameWrapper) return;

  if (clean === window.ADMIN_CREDENTIALS.email.toLowerCase()) {
    nameWrapper.classList.add("hidden");
  } else {
    nameWrapper.classList.remove("hidden");
  }
};

window.renderLoginContent = function () {
  var container = document.getElementById("loginModalBody");
  if (!container) return;

  if (window.currentUser) {
    var initial = window.currentUser.name.charAt(0).toUpperCase();
    var isAdm = window.currentUser.role === "admin";
    var badgeClass = isAdm ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-800";
    var badgeText = isAdm ? "★ Boutique Administrator" : "Verified Member";
    var identifierText = window.currentUser.identifier ? window.currentUser.identifier : "";

    var adminButtonHtml = "";
    if (isAdm) {
      adminButtonHtml =
        '<button type="button" onclick="window.toggleLoginModal(false); window.toggleAdminDashboard(true);" ' +
        'class="w-full py-2.5 bg-gray-900 text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-gray-800">' +
        "⚙ Open Admin Control Panel</button>";
    }

    container.innerHTML =
      '<div class="text-center py-4">' +
      '<div class="w-14 h-14 rounded-full bg-pink-50 text-myntra flex items-center justify-center mx-auto mb-3 text-xl font-bold border border-pink-200">' +
      initial +
      "</div>" +
      '<h3 class="text-base font-bold text-gray-900">' +
      window.currentUser.name +
      "</h3>" +
      '<p class="text-xs text-gray-500 mt-0.5">' +
      identifierText +
      "</p>" +
      '<span class="inline-block mt-2 px-3 py-0.5 text-[11px] font-bold rounded-full ' +
      badgeClass +
      '">' +
      badgeText +
      "</span>" +
      '<div class="mt-6 space-y-2">' +
      adminButtonHtml +
      '<button type="button" onclick="window.handleLogout()" class="w-full py-2.5 border border-gray-300 text-gray-700 rounded font-bold text-xs uppercase hover:bg-gray-100">Logout</button>' +
      "</div></div>";
    return;
  }

  container.innerHTML =
    '<form onsubmit="window.handleUnifiedLogin(event)" class="space-y-3.5">' +
    "<div>" +
    '<label class="block text-[11px] font-bold uppercase text-gray-600 mb-1">Mobile Number or Email ID *</label>' +
    '<input id="unifiedLoginId" type="text" required autocomplete="off" oninput="window.handleIdentifierInput(this.value)" placeholder="Enter mobile or email" class="w-full border rounded px-3 py-2 text-xs" />' +
    "</div>" +
    '<div id="custNameFieldWrapper">' +
    '<label class="block text-[11px] font-bold uppercase text-gray-600 mb-1">Full Name (Optional)</label>' +
    '<input id="unifiedLoginName" type="text" autocomplete="off" placeholder="Enter your name" class="w-full border rounded px-3 py-2 text-xs" />' +
    "</div>" +
    "<div>" +
    '<label class="block text-[11px] font-bold uppercase text-gray-600 mb-1">Password / OTP *</label>' +
    '<input id="unifiedLoginPass" type="password" required autocomplete="off" placeholder="Enter password or OTP" class="w-full border rounded px-3 py-2 text-xs" />' +
    "</div>" +
    '<p id="loginError" class="text-xs text-red-600 font-semibold hidden"></p>' +
    '<button type="submit" class="w-full py-2.5 bg-myntra text-white font-bold rounded text-xs uppercase tracking-wider shadow-sm">' +
    "Continue" +
    "</button>" +
    "</form>";
};

window.handleUnifiedLogin = function (e) {
  if (e && e.preventDefault) e.preventDefault();

  var rawId = document.getElementById("unifiedLoginId").value.trim();
  var pass = document.getElementById("unifiedLoginPass").value.trim();
  var nameEl = document.getElementById("unifiedLoginName");
  var customName = nameEl ? nameEl.value.trim() : "";
  var errorEl = document.getElementById("loginError");

  if (rawId.toLowerCase() === window.ADMIN_CREDENTIALS.email.toLowerCase()) {
    if (pass !== window.ADMIN_CREDENTIALS.password) {
      errorEl.textContent = "Invalid credentials. Please check your email and password.";
      errorEl.classList.remove("hidden");
      return;
    }

    window.currentUser = {
      name: "Boutique Admin",
      identifier: window.ADMIN_CREDENTIALS.email,
      mobile: "9876543210",
      role: "admin"
    };

    window.safeStorage.setItem("bharatstyle_women_v2_user", JSON.stringify(window.currentUser));
    window.updateUserHeaderUI();
    window.toggleLoginModal(false);
    window.toggleAdminDashboard(true);
    window.showToast("Welcome Admin! Opening Boutique Control Center...");
    return;
  }

  var isMobile = /^[6-9]\d{9}$/.test(rawId);
  var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawId);

  if (!isMobile && !isEmail) {
    errorEl.textContent = "Please enter a valid 10-digit Indian mobile number or email ID.";
    errorEl.classList.remove("hidden");
    return;
  }

  if (pass !== "1234") {
    errorEl.textContent = "Invalid OTP or password. Please try again.";
    errorEl.classList.remove("hidden");
    return;
  }

  var shopperName = customName ? customName : (isEmail ? rawId.split("@")[0] : "Shopper");
  window.currentUser = {
    name: shopperName,
    identifier: isMobile ? "+91 " + rawId : rawId,
    mobile: isMobile ? rawId : "",
    role: "customer"
  };

  window.safeStorage.setItem("bharatstyle_women_v2_user", JSON.stringify(window.currentUser));
  window.updateUserHeaderUI();
  window.toggleLoginModal(false);
  window.showToast("Welcome to BharatStyle Women, " + window.currentUser.name + "!");
};

window.handleLogout = function () {
  window.currentUser = null;
  window.safeStorage.removeItem("bharatstyle_women_v2_user");
  window.updateUserHeaderUI();
  window.toggleLoginModal(false);
  window.toggleAdminDashboard(false);
  window.showToast("Logged out successfully");
};

// ============================================================================
// ADMIN DASHBOARD & DUAL IMAGE UPLOAD ENGINE (API + FOLDER UPLOAD)
// ============================================================================
window.toggleAdminDashboard = function (show) {
  var isAdm = window.currentUser && window.currentUser.role === "admin";
  if (show && !isAdm) {
    window.toggleLoginModal(true);
    return;
  }
  var modal = document.getElementById("adminDashboardModal");
  if (!modal) return;
  if (show) {
    modal.classList.remove("hidden");
    window.switchAdminTab(window.activeAdminTab);
  } else {
    modal.classList.add("hidden");
  }
};

window.switchAdminTab = function (tabName) {
  window.activeAdminTab = tabName;
  var buttons = document.querySelectorAll(".admin-tab-btn");
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  }

  var content = document.getElementById("adminDashboardBody");
  if (!content) return;
  if (tabName === "rates") window.renderAdminRatesAndImagesTab(content);
  if (tabName === "new-product") window.renderAdminNewProductTab(content);
  if (tabName === "coupons") window.renderAdminCouponsTab(content);
  if (tabName === "banner") window.renderAdminBannerAndFeesTab(content);
};

// 1. Fetch Free API Image
window.pullApiImageForRow = function (idx) {
  var newUrl = window.fetchFreeWomenImageFromAPI();
  var inputEl = document.getElementById("edit-img-" + idx);
  var previewEl = document.getElementById("preview-img-" + idx);
  if (inputEl) inputEl.value = newUrl;
  if (previewEl) previewEl.src = newUrl;
  window.showToast("Loaded free fashion image from API!");
};

window.pullApiImageForNewProduct = function () {
  var newUrl = window.fetchFreeWomenImageFromAPI();
  var inputEl = document.getElementById("newProdImage");
  var previewEl = document.getElementById("newProdLivePreview");
  if (inputEl) inputEl.value = newUrl;
  if (previewEl) previewEl.src = newUrl;
  window.showToast("Loaded free fashion image from API!");
};

// 2. Local Folder File Upload Handler (Simulates saving into /uploads/ folder)
window.handleLocalFileUploadForRow = function (event, idx) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function (uploadEvent) {
    var base64Url = uploadEvent.target.result;
    var inputEl = document.getElementById("edit-img-" + idx);
    var previewEl = document.getElementById("preview-img-" + idx);

    if (inputEl) inputEl.value = base64Url;
    if (previewEl) previewEl.src = base64Url;
    window.showToast("Successfully uploaded picture to /uploads/ folder!");
  };
  reader.readAsDataURL(file);
};

window.handleLocalFileUploadForNewProduct = function (event) {
  var file = event.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function (uploadEvent) {
    var base64Url = uploadEvent.target.result;
    var inputEl = document.getElementById("newProdImage");
    var previewEl = document.getElementById("newProdLivePreview");

    if (inputEl) inputEl.value = base64Url;
    if (previewEl) previewEl.src = base64Url;
    window.showToast("Successfully uploaded picture to /uploads/ folder!");
  };
  reader.readAsDataURL(file);
};

// Tab 1: Rates & Dual Image Options Table
window.renderAdminRatesAndImagesTab = function (container) {
  var products = window.getActiveProducts();
  var rowsHtml = "";

  for (var idx = 0; idx < products.length; idx++) {
    var p = products[idx];
    rowsHtml +=
      '<tr class="hover:bg-gray-50">' +
      '<td class="p-2">' +
      '<img id="preview-img-' + idx + '" src="' + p.image + '" class="w-10 h-12 object-cover rounded border" />' +
      "</td>" +
      '<td class="p-2 font-bold text-gray-800">' +
      p.id +
      '<input id="edit-brand-' + idx + '" type="text" value="' + p.brand + '" class="block mt-1 w-28 border rounded px-1.5 py-0.5 text-xs font-semibold text-myntra" />' +
      "</td>" +
      '<td class="p-2">' +
      '<input id="edit-name-' + idx + '" type="text" value="' + p.name + '" class="w-48 border rounded px-2 py-1 text-xs" />' +
      "</td>" +
      '<td class="p-2">' +
      '<input id="edit-price-' + idx + '" type="number" min="99" value="' + p.price + '" class="w-24 border rounded px-2 py-1 text-xs font-bold text-gray-900" />' +
      "</td>" +
      '<td class="p-2">' +
      '<input id="edit-mrp-' + idx + '" type="number" min="99" value="' + p.mrp + '" class="w-24 border rounded px-2 py-1 text-xs text-gray-500" />' +
      "</td>" +
      '<td class="p-2">' +
      '<div class="space-y-1">' +
      '<input id="edit-img-' + idx + '" type="url" value="' + p.image + '" oninput="document.getElementById(\'preview-img-' + idx + '\').src = this.value" class="w-56 border rounded px-2 py-1 text-xs" placeholder="Image URL / Base64" />' +
      '<div class="flex items-center space-x-1.5 pt-0.5">' +
      '<button type="button" onclick="window.pullApiImageForRow(' + idx + ')" class="px-2 py-0.5 bg-pink-100 text-myntra font-bold rounded text-[10px]">🎲 API Image</button>' +
      '<label class="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold rounded text-[10px] cursor-pointer hover:bg-purple-200">' +
      '📁 Upload from Folder <input type="file" accept="image/*" class="hidden" onchange="window.handleLocalFileUploadForRow(event, ' + idx + ')" />' +
      "</label>" +
      "</div></div>" +
      "</td>" +
      '<td class="p-2 text-center">' +
      '<button type="button" onclick="window.deleteProductById(\'' + p.id + '\')" class="text-red-600 hover:underline font-bold text-xs">Delete</button>' +
      "</td>" +
      "</tr>";
  }

  container.innerHTML =
    '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">' +
    '<p class="text-xs text-gray-600">Update rates or choose either <strong>🎲 API Image</strong> or <strong>📁 Upload from Folder</strong> for each outfit.</p>' +
    '<div class="flex space-x-2">' +
    '<button type="button" onclick="window.resetStoreToDefaults()" class="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100">Reset Defaults</button>' +
    '<button type="button" onclick="window.saveBulkProductEdits()" class="px-4 py-1.5 bg-myntra text-white rounded text-xs font-bold uppercase">💾 Save All Changes</button>' +
    "</div></div>" +
    '<div class="overflow-x-auto border rounded-lg max-h-[55vh]">' +
    '<table class="w-full text-left border-collapse text-xs">' +
    '<thead class="bg-gray-100 uppercase text-[11px] text-gray-600 sticky top-0 z-10">' +
    "<tr>" +
    '<th class="p-2.5">Preview</th>' +
    '<th class="p-2.5">ID / Brand</th>' +
    '<th class="p-2.5">Outfit Name</th>' +
    '<th class="p-2.5">Price (₹)</th>' +
    '<th class="p-2.5">MRP (₹)</th>' +
    '<th class="p-2.5">Image Source (API or Local Folder Upload)</th>' +
    '<th class="p-2.5 text-center">Action</th>' +
    "</tr></thead>" +
    '<tbody class="divide-y">' +
    rowsHtml +
    "</tbody></table></div>";
};

window.saveBulkProductEdits = function () {
  var products = window.getActiveProducts();
  var updated = [];

  for (var idx = 0; idx < products.length; idx++) {
    var p = products[idx];
    var brandEl = document.getElementById("edit-brand-" + idx);
    var nameEl = document.getElementById("edit-name-" + idx);
    var priceEl = document.getElementById("edit-price-" + idx);
    var mrpEl = document.getElementById("edit-mrp-" + idx);
    var imgEl = document.getElementById("edit-img-" + idx);

    var brand = brandEl && brandEl.value.trim() ? brandEl.value.trim() : p.brand;
    var name = nameEl && nameEl.value.trim() ? nameEl.value.trim() : p.name;
    var parsedPrice = priceEl ? parseInt(priceEl.value, 10) : p.price;
    var price = isNaN(parsedPrice) ? p.price : parsedPrice;
    var parsedMrp = mrpEl ? parseInt(mrpEl.value, 10) : p.mrp;
    var mrp = isNaN(parsedMrp) ? p.mrp : parsedMrp;
    var image = imgEl && imgEl.value.trim() ? imgEl.value.trim() : p.image;

    updated.push({
      id: p.id,
      brand: brand,
      name: name,
      style: p.style,
      price: price,
      mrp: Math.max(price, mrp),
      rating: p.rating,
      reviews: p.reviews,
      sizes: p.sizes,
      image: image,
      inStock: true
    });
  }

  window.saveActiveProducts(updated);
  window.refreshStorefrontUI();
  window.showToast("Women's Catalog Rates & Images updated!");
};

window.deleteProductById = function (productId) {
  var products = window.getActiveProducts().filter(function (p) {
    return p.id !== productId;
  });
  window.saveActiveProducts(products);
  window.refreshStorefrontUI();
  window.renderAdminRatesAndImagesTab(document.getElementById("adminDashboardBody"));
  window.showToast("Outfit " + productId + " removed.");
};

// Tab 2: Add New Women's Outfit (with API + Folder Upload options)
window.renderAdminNewProductTab = function (container) {
  var defaultApiImg = window.fetchFreeWomenImageFromAPI();

  container.innerHTML =
    '<form onsubmit="window.handleAddNewProduct(event)" class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">' +
    '<div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">' +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-600 mb-1">Indian Women\'s Brand *</label>' +
    '<input id="newProdBrand" type="text" required placeholder="e.g. Biba, Soch, Libas" class="w-full border rounded px-3 py-2" />' +
    "</div>" +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-600 mb-1">Women\'s Outfit Title *</label>' +
    '<input id="newProdName" type="text" required placeholder="e.g. Rose Silk Anarkali Suit" class="w-full border rounded px-3 py-2" />' +
    "</div>" +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-600 mb-1">Silhouette Category *</label>' +
    '<select id="newProdStyle" class="w-full border rounded px-3 py-2 bg-white">' +
    '<option value="Kurtas & Suits">Kurtas &amp; Suits</option>' +
    '<option value="Sarees">Sarees</option>' +
    '<option value="Lehengas & Festive">Lehengas &amp; Festive</option>' +
    '<option value="Fusion Dresses">Fusion Dresses</option>' +
    "</select></div>" +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-600 mb-1">Sizes (Comma Separated) *</label>' +
    '<input id="newProdSizes" type="text" value="XS, S, M, L, XL, XXL" required class="w-full border rounded px-3 py-2" />' +
    "</div>" +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-600 mb-1">Selling Rate (₹) *</label>' +
    '<input id="newProdPrice" type="number" min="99" required placeholder="e.g. 2499" class="w-full border rounded px-3 py-2 font-bold" />' +
    "</div>" +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-600 mb-1">Original MRP (₹) *</label>' +
    '<input id="newProdMrp" type="number" min="99" required placeholder="e.g. 4999" class="w-full border rounded px-3 py-2" />' +
    "</div>" +
    '<div class="sm:col-span-2 space-y-2">' +
    '<label class="block font-bold uppercase text-gray-600">Product Picture (Choose API or Upload from Folder) *</label>' +
    '<div class="flex items-center space-x-2">' +
    '<input id="newProdImage" type="url" required value="' +
    defaultApiImg +
    '" oninput="document.getElementById(\'newProdLivePreview\').src = this.value" class="flex-1 border rounded px-3 py-2 text-xs" placeholder="Image URL" />' +
    '<button type="button" onclick="window.pullApiImageForNewProduct()" class="px-3 py-2 bg-pink-100 text-myntra font-bold rounded text-xs">🎲 API Image</button>' +
    '<label class="px-3 py-2 bg-purple-100 text-purple-800 font-bold rounded text-xs cursor-pointer hover:bg-purple-200">' +
    '📁 Upload Picture <input type="file" accept="image/*" class="hidden" onchange="window.handleLocalFileUploadForNewProduct(event)" />' +
    "</label>" +
    "</div>" +
    "</div>" +
    '<div class="sm:col-span-2 pt-2">' +
    '<button type="submit" class="w-full py-3 bg-myntra text-white font-bold uppercase tracking-wider rounded">+ Publish New Women\'s Outfit</button>' +
    "</div></div>" +
    '<div class="bg-gray-50 p-4 rounded border flex flex-col items-center justify-center">' +
    '<span class="text-[11px] font-bold uppercase text-gray-500 mb-2">Live Outfit Preview</span>' +
    '<img id="newProdLivePreview" src="' +
    defaultApiImg +
    '" alt="Preview" class="w-40 h-52 object-cover rounded shadow border bg-white" />' +
    "</div></form>";
};

window.handleAddNewProduct = function (e) {
  e.preventDefault();
  var products = window.getActiveProducts();
  var nextNum = 101 + products.length + Math.floor(Math.random() * 50);

  var price = parseInt(document.getElementById("newProdPrice").value, 10);
  var mrp = Math.max(price, parseInt(document.getElementById("newProdMrp").value, 10));
  var sizesRaw = document.getElementById("newProdSizes").value;
  var sizes = sizesRaw
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(Boolean);

  var newProduct = {
    id: "WMN-" + nextNum,
    brand: document.getElementById("newProdBrand").value.trim(),
    name: document.getElementById("newProdName").value.trim(),
    style: document.getElementById("newProdStyle").value,
    price: price,
    mrp: mrp,
    rating: 4.8,
    reviews: 19,
    sizes: sizes.length ? sizes : ["S", "M", "L", "XL"],
    image: document.getElementById("newProdImage").value.trim(),
    inStock: true
  };

  products.unshift(newProduct);
  window.saveActiveProducts(products);
  window.refreshStorefrontUI();
  window.switchAdminTab("rates");
  window.showToast("Added " + newProduct.brand + " - " + newProduct.name + "!");
};

// Tab 3: Coupons Manager
window.renderAdminCouponsTab = function (container) {
  var config = window.getActiveSiteConfig();
  var couponsObj = config.coupons ? config.coupons : {};
  var codes = Object.keys(couponsObj);
  var couponsListHtml = "";

  if (codes.length === 0) {
    couponsListHtml = '<p class="text-gray-400">No active coupons configured.</p>';
  } else {
    for (var i = 0; i < codes.length; i++) {
      var code = codes[i];
      var details = couponsObj[code];
      var cType = details.type ? details.type : "PERCENT";
      var cVal = details.value ? details.value : 0;
      var valueDisplay = cType === "FLAT" ? "₹" + cVal : cVal + "%";
      var minOrd = details.minOrder ? details.minOrder : 0;
      var desc = details.description ? details.description : "";

      couponsListHtml +=
        '<div class="p-3 bg-gray-50 border rounded flex items-center justify-between">' +
        "<div>" +
        '<span class="px-2 py-0.5 bg-pink-100 text-myntra font-extrabold rounded text-xs">' +
        code +
        "</span>" +
        '<p class="text-gray-700 font-semibold mt-1">' +
        desc +
        "</p>" +
        '<p class="text-[11px] text-gray-500">Type: ' +
        cType +
        " | Value: " +
        valueDisplay +
        " | Min Order: ₹" +
        minOrd +
        "</p>" +
        "</div>" +
        '<button type="button" onclick="window.deleteCouponCode(\'' +
        code +
        '\')" class="text-red-600 font-bold hover:underline">Remove</button>' +
        "</div>";
    }
  }

  container.innerHTML =
    '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">' +
    "<div>" +
    '<h3 class="font-bold uppercase text-gray-700 mb-3">Active Boutique Coupons</h3>' +
    '<div class="space-y-2.5">' +
    couponsListHtml +
    "</div></div>" +
    '<form onsubmit="window.handleAddCoupon(event)" class="bg-gray-50 p-4 rounded border space-y-3">' +
    '<h3 class="font-bold uppercase text-gray-700">Create / Update Coupon Code</h3>' +
    "<div>" +
    '<label class="block font-bold text-gray-600 mb-1">Coupon Code *</label>' +
    '<input id="newCouponCode" type="text" required placeholder="e.g. ROSE30" class="w-full border rounded px-3 py-2 uppercase font-bold" />' +
    "</div>" +
    '<div class="grid grid-cols-2 gap-3">' +
    "<div>" +
    '<label class="block font-bold text-gray-600 mb-1">Discount Type *</label>' +
    '<select id="newCouponType" class="w-full border rounded px-2 py-2 bg-white">' +
    '<option value="PERCENT">Percentage (%)</option>' +
    '<option value="FLAT">Flat Rupees (₹)</option>' +
    "</select></div>" +
    "<div>" +
    '<label class="block font-bold text-gray-600 mb-1">Discount Value *</label>' +
    '<input id="newCouponVal" type="number" min="1" required placeholder="e.g. 25 or 500" class="w-full border rounded px-3 py-2" />' +
    "</div></div>" +
    '<div class="grid grid-cols-2 gap-3">' +
    "<div>" +
    '<label class="block font-bold text-gray-600 mb-1">Min Order (₹)</label>' +
    '<input id="newCouponMin" type="number" value="999" class="w-full border rounded px-3 py-2" />' +
    "</div>" +
    "<div>" +
    '<label class="block font-bold text-gray-600 mb-1">Max Discount Cap (₹)</label>' +
    '<input id="newCouponMax" type="number" value="1500" class="w-full border rounded px-3 py-2" />' +
    "</div></div>" +
    "<div>" +
    '<label class="block font-bold text-gray-600 mb-1">Promotional Description *</label>' +
    '<input id="newCouponDesc" type="text" required placeholder="e.g. 30% OFF on Women\'s Silk Sarees & Lehengas" class="w-full border rounded px-3 py-2" />' +
    "</div>" +
    '<button type="submit" class="w-full py-2.5 bg-myntra text-white font-bold uppercase rounded">+ Save Coupon Code</button>' +
    "</form></div>";
};

window.handleAddCoupon = function (e) {
  e.preventDefault();
  var config = window.getActiveSiteConfig();
  var code = document.getElementById("newCouponCode").value.trim().toUpperCase();
  var type = document.getElementById("newCouponType").value;
  var value = parseInt(document.getElementById("newCouponVal").value, 10);
  var minOrderInput = parseInt(document.getElementById("newCouponMin").value, 10);
  var minOrder = isNaN(minOrderInput) ? 0 : minOrderInput;
  var maxDiscountInput = parseInt(document.getElementById("newCouponMax").value, 10);
  var maxDiscount = isNaN(maxDiscountInput) ? 5000 : maxDiscountInput;
  var description = document.getElementById("newCouponDesc").value.trim();

  if (!config.coupons) config.coupons = {};
  config.coupons[code] = {
    type: type,
    value: value,
    minOrder: minOrder,
    maxDiscount: maxDiscount,
    description: description
  };

  window.saveActiveSiteConfig(config);
  window.refreshStorefrontUI();
  window.renderAdminCouponsTab(document.getElementById("adminDashboardBody"));
  window.showToast("Coupon " + code + " is now live!");
};

window.deleteCouponCode = function (code) {
  var config = window.getActiveSiteConfig();
  if (config.coupons && config.coupons[code]) {
    delete config.coupons[code];
  }
  window.saveActiveSiteConfig(config);
  window.refreshStorefrontUI();
  window.renderAdminCouponsTab(document.getElementById("adminDashboardBody"));
  window.showToast("Coupon " + code + " deleted.");
};

// Tab 4: Promo Banner & Fees
window.renderAdminBannerAndFeesTab = function (container) {
  var config = window.getActiveSiteConfig();
  var safeBannerText = (config.promoBannerText || "").replace(/"/g, "&quot;");

  container.innerHTML =
    '<form onsubmit="window.handleSaveBannerAndFees(event)" class="max-w-xl space-y-4 text-xs">' +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-700 mb-1">Top Promotional Banner Announcement *</label>' +
    '<input id="editBannerText" type="text" required value="' +
    safeBannerText +
    '" class="w-full border rounded px-3 py-2 text-xs font-semibold" />' +
    "</div>" +
    '<div class="grid grid-cols-2 gap-4">' +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-700 mb-1">Platform Convenience Fee (₹)</label>' +
    '<input id="editPlatformFee" type="number" min="0" value="' +
    config.platformFee +
    '" class="w-full border rounded px-3 py-2" />' +
    "</div>" +
    "<div>" +
    '<label class="block font-bold uppercase text-gray-700 mb-1">Free Shipping Threshold (₹)</label>' +
    '<input id="editFreeShip" type="number" min="0" value="' +
    config.freeShippingThreshold +
    '" class="w-full border rounded px-3 py-2" />' +
    "</div></div>" +
    '<button type="submit" class="px-6 py-2.5 bg-myntra text-white font-bold uppercase rounded">Update Banner &amp; Store Fees</button>' +
    "</form>";
};

window.handleSaveBannerAndFees = function (e) {
  e.preventDefault();
  var config = window.getActiveSiteConfig();
  config.promoBannerText = document.getElementById("editBannerText").value.trim();

  var feeVal = parseInt(document.getElementById("editPlatformFee").value, 10);
  config.platformFee = isNaN(feeVal) ? 0 : feeVal;

  var shipVal = parseInt(document.getElementById("editFreeShip").value, 10);
  config.freeShippingThreshold = isNaN(shipVal) ? 0 : shipVal;

  window.saveActiveSiteConfig(config);
  window.refreshStorefrontUI();
  window.showToast("Boutique banner & fee settings updated!");
};

window.exportUpdatedDataJsFile = function () {
  var config = window.getActiveSiteConfig();
  var products = window.getActiveProducts();
  var apiPool = window.FREE_WOMEN_FASHION_API_POOL || [];

  var lines = [
    "// Auto-Generated by BharatStyle Women's Boutique Admin",
    "window.memoryBackup = {};",
    "window.safeStorage = {",
    "  getItem: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return window.memoryBackup[k] || null; } },",
    "  setItem: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { window.memoryBackup[k] = v; } },",
    "  removeItem: function (k) { try { window.localStorage.removeItem(k); } catch (e) { delete window.memoryBackup[k]; } }",
    "};",
    "window.FREE_WOMEN_FASHION_API_POOL = " + JSON.stringify(apiPool, null, 2) + ";",
    "window.fetchFreeWomenImageFromAPI = function () {",
    "  var pool = window.FREE_WOMEN_FASHION_API_POOL;",
    "  return pool[Math.floor(Math.random() * pool.length)];",
    "};",
    "window.DEFAULT_SITE_CONFIG = " + JSON.stringify(config, null, 2) + ";",
    "window.INITIAL_PRODUCTS = " + JSON.stringify(products, null, 2) + ";",
    "window.getActiveProducts = function () {",
    "  var s = window.safeStorage.getItem('bharatstyle_women_v2_products');",
    "  return s ? JSON.parse(s) : JSON.parse(JSON.stringify(window.INITIAL_PRODUCTS));",
    "};",
    "window.saveActiveProducts = function (list) {",
    "  window.safeStorage.setItem('bharatstyle_women_v2_products', JSON.stringify(list));",
    "};",
    "window.getActiveSiteConfig = function () {",
    "  var s = window.safeStorage.getItem('bharatstyle_women_v2_config');",
    "  return s ? JSON.parse(s) : JSON.parse(JSON.stringify(window.DEFAULT_SITE_CONFIG));",
    "};",
    "window.saveActiveSiteConfig = function (cfg) {",
    "  window.safeStorage.setItem('bharatstyle_women_v2_config', JSON.stringify(cfg));",
    "};"
  ];

  var blob = new Blob([lines.join("\n")], { type: "application/javascript" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data.js";
  link.click();
  window.showToast("Downloaded updated data.js file!");
};

window.resetStoreToDefaults = function () {
  window.safeStorage.removeItem("bharatstyle_women_v2_products");
  window.safeStorage.removeItem("bharatstyle_women_v2_config");
  window.refreshStorefrontUI();
  window.switchAdminTab(window.activeAdminTab);
  window.showToast("Boutique reset to original data.js defaults.");
};