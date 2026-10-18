// ============================================================================
// 2. AUTHENTICATION & WOMEN'S BOUTIQUE ADMIN ENGINE (auth.js)
// Features: Genuine Email Extension Validator + Database Sign-Up & Sign-In
// ============================================================================

window.ADMIN_CREDENTIALS = {
  email: "administrator",
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
window.authModalTab = "signin"; // 'signin' or 'signup'

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

window.switchAuthTab = function (tab) {
  window.authModalTab = tab;
  window.renderLoginContent();
};

// GENUINE EMAIL EXTENSION VALIDATOR
window.isValidGenuineEmail = function (email) {
  var clean = (email || "").trim().toLowerCase();
  // Allowed genuine commercial, educational, and international domain extensions
  var validExtensions = [
    "@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", 
    "@icloud.com", "@rediffmail.com", "@co.in", "@in", ".edu", 
    "@gov.in", "@ac.in", "@proton.me", "@zoho.com"
  ];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return false;

  var hasValidExt = false;
  for (var i = 0; i < validExtensions.length; i++) {
    if (clean.endsWith(validExtensions[i])) {
      hasValidExt = true;
      break;
    }
  }
  return hasValidExt;
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

  var signinTabClass = window.authModalTab === "signin" ? "border-b-2 border-myntra text-myntra font-bold" : "text-gray-500";
  var signupTabClass = window.authModalTab === "signup" ? "border-b-2 border-myntra text-myntra font-bold" : "text-gray-500";

  var tabHeader =
    '<div class="grid grid-cols-2 border-b border-gray-200 mb-4 text-xs uppercase text-center">' +
    '<button type="button" onclick="window.switchAuthTab(\'signin\')" class="py-2.5 ' +
    signinTabClass +
    '">Sign In</button>' +
    '<button type="button" onclick="window.switchAuthTab(\'signup\')" class="py-2.5 ' +
    signupTabClass +
    '">Create Account</button>' +
    "</div>";

  if (window.authModalTab === "signin") {
    container.innerHTML =
      tabHeader +
      '<form onsubmit="window.handleDatabaseSignIn(event)" class="space-y-3.5 text-xs">' +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-600 mb-1">Email ID or Mobile Number *</label>' +
      '<input id="signinId" type="text" required placeholder="Enter email or mobile" class="w-full border rounded px-3 py-2 text-xs" />' +
      "</div>" +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-600 mb-1">Password *</label>' +
      '<input id="signinPass" type="password" required placeholder="Enter password" class="w-full border rounded px-3 py-2 text-xs" />' +
      "</div>" +
      '<p id="loginError" class="text-xs text-red-600 font-semibold hidden"></p>' +
      '<button type="submit" class="w-full py-2.5 bg-myntra text-white font-bold rounded uppercase tracking-wider shadow-sm">Sign In</button>' +
      "</form>";
  } else {
    container.innerHTML =
      tabHeader +
      '<form onsubmit="window.handleDatabaseSignUp(event)" class="space-y-3 text-xs">' +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-600 mb-1">Full Name *</label>' +
      '<input id="signupName" type="text" required placeholder="e.g. Ananya Iyer" class="w-full border rounded px-3 py-2 text-xs" />' +
      "</div>" +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-600 mb-1">Genuine Email ID *</label>' +
      '<input id="signupEmail" type="email" required placeholder="e.g. name@gmail.com" class="w-full border rounded px-3 py-2 text-xs" />' +
      '<p class="text-[10px] text-gray-400 mt-0.5">Must be a valid extension (@gmail.com, @yahoo.com, etc.)</p>' +
      "</div>" +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-600 mb-1">Mobile Number *</label>' +
      '<input id="signupMobile" type="tel" maxlength="10" required placeholder="10-digit mobile" class="w-full border rounded px-3 py-2 text-xs" />' +
      "</div>" +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-600 mb-1">Create Password *</label>' +
      '<input id="signupPass" type="password" required placeholder="Create secure password" class="w-full border rounded px-3 py-2 text-xs" />' +
      "</div>" +
      '<p id="signupError" class="text-xs text-red-600 font-semibold hidden"></p>' +
      '<button type="submit" class="w-full py-2.5 bg-myntra text-white font-bold rounded uppercase tracking-wider shadow-sm">Register &amp; Sign Up</button>' +
      "</form>";
  }
};

// 1. DATABASE SIGN-IN (Fetches credentials directly from SQL Server)
window.handleDatabaseSignIn = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  var identifier = document.getElementById("signinId").value.trim();
  var password = document.getElementById("signinPass").value.trim();
  var errorEl = document.getElementById("loginError");

  // Silent Admin Bypass
  if (identifier.toLowerCase() === window.ADMIN_CREDENTIALS.email.toLowerCase()) {
    if (password !== window.ADMIN_CREDENTIALS.password) {
      errorEl.textContent = "Invalid Admin password.";
      errorEl.classList.remove("hidden");
      return;
    }
    window.currentUser = { name: "Boutique Admin", identifier: window.ADMIN_CREDENTIALS.email, role: "admin" };
    window.safeStorage.setItem("bharatstyle_women_v2_user", JSON.stringify(window.currentUser));
    window.updateUserHeaderUI();
    window.toggleLoginModal(false);
    window.toggleAdminDashboard(true);
    window.showToast("Welcome Admin!");
    return;
  }

  window.DB_Operations.authenticateCustomer({ identifier: identifier, password: password }, function (res) {
    if (res.success) {
      window.currentUser = res.user;
      window.safeStorage.setItem("bharatstyle_women_v2_user", JSON.stringify(window.currentUser));
      window.updateUserHeaderUI();
      window.toggleLoginModal(false);
      window.showToast("Welcome back, " + window.currentUser.name + "!");
    } else {
      errorEl.textContent = res.error || "Invalid login credentials.";
      errorEl.classList.remove("hidden");
    }
  });
};

// 2. DATABASE SIGN-UP (Validates email extension & saves into SQL Server)
window.handleDatabaseSignUp = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  var name = document.getElementById("signupName").value.trim();
  var email = document.getElementById("signupEmail").value.trim();
  var mobile = document.getElementById("signupMobile").value.trim();
  var password = document.getElementById("signupPass").value.trim();
  var errorEl = document.getElementById("signupError");

  // Validate Genuine Email Extension
  if (!window.isValidGenuineEmail(email)) {
    errorEl.textContent = "Please enter a genuine email with a trusted domain (@gmail.com, @yahoo.com, etc.).";
    errorEl.classList.remove("hidden");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    errorEl.textContent = "Please enter a valid 10-digit Indian mobile number.";
    errorEl.classList.remove("hidden");
    return;
  }

  window.DB_Operations.registerCustomer({ email: email, name: name, mobile: mobile, password: password }, function (res) {
    if (res.success) {
      window.showToast("Account created successfully! Please sign in.");
      window.switchAuthTab("signin");
    } else {
      errorEl.textContent = res.error || "Registration failed.";
      errorEl.classList.remove("hidden");
    }
  });
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
// ADMIN DASHBOARD & DUAL IMAGE UPLOAD ENGINE
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
    window.showToast("Uploaded picture successfully!");
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
    window.showToast("Uploaded picture successfully!");
  };
  reader.readAsDataURL(file);
};

window.renderAdminRatesAndImagesTab = function (container) {
  window.DB_Operations.getAllProducts(function (products) {
    var rowsHtml = "";
    for (var idx = 0; idx < products.length; idx++) {
      var p = products[idx];
      rowsHtml +=
        '<tr class="hover:bg-gray-50">' +
        '<td class="p-2"><img id="preview-img-' + idx + '" src="' + p.image + '" class="w-10 h-12 object-cover rounded border" /></td>' +
        '<td class="p-2 font-bold text-gray-800">' + p.id + '<input id="edit-brand-' + idx + '" type="text" value="' + p.brand + '" class="block mt-1 w-28 border rounded px-1.5 py-0.5 text-xs font-semibold text-myntra" /></td>' +
        '<td class="p-2"><input id="edit-name-' + idx + '" type="text" value="' + p.name + '" class="w-48 border rounded px-2 py-1 text-xs" /></td>' +
        '<td class="p-2"><input id="edit-price-' + idx + '" type="number" min="99" value="' + p.price + '" class="w-24 border rounded px-2 py-1 text-xs font-bold text-gray-900" /></td>' +
        '<td class="p-2"><input id="edit-mrp-' + idx + '" type="number" min="99" value="' + p.mrp + '" class="w-24 border rounded px-2 py-1 text-xs text-gray-500" /></td>' +
        '<td class="p-2">' +
        '<div class="space-y-1">' +
        '<input id="edit-img-' + idx + '" type="url" value="' + p.image + '" oninput="document.getElementById(\'preview-img-' + idx + '\').src = this.value" class="w-56 border rounded px-2 py-1 text-xs" />' +
        '<div class="flex items-center space-x-1.5 pt-0.5">' +
        '<button type="button" onclick="window.pullApiImageForRow(' + idx + ')" class="px-2 py-0.5 bg-pink-100 text-myntra font-bold rounded text-[10px]">🎲 API</button>' +
        '<label class="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold rounded text-[10px] cursor-pointer hover:bg-purple-200">📁 Upload <input type="file" accept="image/*" class="hidden" onchange="window.handleLocalFileUploadForRow(event, ' + idx + ')" /></label>' +
        '</div></div></td>' +
        '<td class="p-2 text-center"><button type="button" onclick="window.deleteProductById(\'' + p.id + '\')" class="text-red-600 hover:underline font-bold text-xs">Delete</button></td>' +
        '</tr>';
    }

    container.innerHTML =
      '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">' +
      '<p class="text-xs text-gray-600">Manage products directly in SQL Server database.</p>' +
      '<div class="flex space-x-2">' +
      '<button type="button" onclick="window.saveBulkProductEdits()" class="px-4 py-1.5 bg-myntra text-white rounded text-xs font-bold uppercase">💾 Save All Changes to DB</button>' +
      '</div></div>' +
      '<div class="overflow-x-auto border rounded-lg max-h-[55vh]">' +
      '<table class="w-full text-left border-collapse text-xs">' +
      '<thead class="bg-gray-100 uppercase text-[11px] text-gray-600 sticky top-0 z-10"><tr>' +
      '<th class="p-2.5">Preview</th><th class="p-2.5">ID / Brand</th><th class="p-2.5">Name</th><th class="p-2.5">Price</th><th class="p-2.5">MRP</th><th class="p-2.5">Image Source</th><th class="p-2.5 text-center">Action</th>' +
      '</tr></thead><tbody class="divide-y">' + rowsHtml + '</tbody></table></div>';
  });
};

window.saveBulkProductEdits = function () {
  window.DB_Operations.getAllProducts(function (products) {
    var completedCount = 0;
    for (var idx = 0; idx < products.length; idx++) {
      var p = products[idx];
      var brandEl = document.getElementById("edit-brand-" + idx);
      var nameEl = document.getElementById("edit-name-" + idx);
      var priceEl = document.getElementById("edit-price-" + idx);
      var mrpEl = document.getElementById("edit-mrp-" + idx);
      var imgEl = document.getElementById("edit-img-" + idx);

      if (brandEl && nameEl && priceEl) {
        p.brand = brandEl.value.trim();
        p.name = nameEl.value.trim();
        p.price = parseInt(priceEl.value, 10) || p.price;
        p.mrp = parseInt(mrpEl.value, 10) || p.mrp;
        p.image = imgEl.value.trim();

        window.DB_Operations.saveProduct(p, function () {
          completedCount++;
          if (completedCount >= products.length) {
            window.refreshStorefrontUI();
            window.showToast("All changes saved to SQL Server DB!");
          }
        });
      }
    }
  });
};

window.deleteProductById = function (productId) {
  fetch(window.API_BASE_URL + "/products/" + productId, { method: "DELETE" })
    .then(function () {
      window.refreshStorefrontUI();
      window.renderAdminRatesAndImagesTab(document.getElementById("adminDashboardBody"));
      window.showToast("Product deleted from database.");
    });
};

window.renderAdminNewProductTab = function (container) {
  var defaultApiImg = window.fetchFreeWomenImageFromAPI();
  container.innerHTML =
    '<form onsubmit="window.handleAddNewProduct(event)" class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">' +
    '<div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">' +
    '<div><label class="block font-bold uppercase text-gray-600 mb-1">Brand *</label><input id="newProdBrand" type="text" required placeholder="e.g. Biba" class="w-full border rounded px-3 py-2" /></div>' +
    '<div><label class="block font-bold uppercase text-gray-600 mb-1">Outfit Title *</label><input id="newProdName" type="text" required placeholder="e.g. Anarkali Suit" class="w-full border rounded px-3 py-2" /></div>' +
    '<div><label class="block font-bold uppercase text-gray-600 mb-1">Silhouette *</label><select id="newProdStyle" class="w-full border rounded px-2 py-2 bg-white"><option value="Kurtas & Suits">Kurtas & Suits</option><option value="Sarees">Sarees</option><option value="Lehengas & Festive">Lehengas</option><option value="Fusion Dresses">Fusion Dresses</option></select></div>' +
    '<div><label class="block font-bold uppercase text-gray-600 mb-1">Price (₹) *</label><input id="newProdPrice" type="number" required placeholder="2499" class="w-full border rounded px-3 py-2" /></div>' +
    '<div><label class="block font-bold uppercase text-gray-600 mb-1">MRP (₹) *</label><input id="newProdMrp" type="number" required placeholder="4999" class="w-full border rounded px-3 py-2" /></div>' +
    '<div class="sm:col-span-2"><label class="block font-bold uppercase text-gray-600 mb-1">Image URL *</label>' +
    '<div class="flex space-x-2"><input id="newProdImage" type="url" required value="' + defaultApiImg + '" oninput="document.getElementById(\'newProdLivePreview\').src = this.value" class="flex-1 border rounded px-3 py-2 text-xs" />' +
    '<button type="button" onclick="window.pullApiImageForNewProduct()" class="px-3 py-2 bg-pink-100 text-myntra font-bold rounded text-xs">🎲 API</button>' +
    '<label class="px-3 py-2 bg-purple-100 text-purple-800 font-bold rounded text-xs cursor-pointer">📁 Upload<input type="file" accept="image/*" class="hidden" onchange="window.handleLocalFileUploadForNewProduct(event)" /></label></div></div>' +
    '<div class="sm:col-span-2 pt-2"><button type="submit" class="w-full py-3 bg-myntra text-white font-bold uppercase rounded">+ Save New Item to Database</button></div>' +
    '</div><div class="bg-gray-50 p-4 rounded border flex flex-col items-center justify-center">' +
    '<span class="text-[11px] font-bold uppercase text-gray-500 mb-2">Preview</span>' +
    '<img id="newProdLivePreview" src="' + defaultApiImg + '" class="w-40 h-52 object-cover rounded shadow border bg-white" />' +
    '</div></form>';
};

window.handleAddNewProduct = function (e) {
  e.preventDefault();
  var newProduct = {
    id: "WMN-" + Math.floor(1000 + Math.random() * 9000),
    brand: document.getElementById("newProdBrand").value.trim(),
    name: document.getElementById("newProdName").value.trim(),
    style: document.getElementById("newProdStyle").value,
    price: parseInt(document.getElementById("newProdPrice").value, 10),
    mrp: parseInt(document.getElementById("newProdMrp").value, 10),
    rating: 4.8,
    reviews: 12,
    sizes: ["S", "M", "L", "XL"],
    image: document.getElementById("newProdImage").value.trim(),
    inStock: true
  };

  window.DB_Operations.saveProduct(newProduct, function (success) {
    if (success) {
      window.refreshStorefrontUI();
      window.switchAdminTab("rates");
      window.showToast("New item successfully created and saved in SQL Server database!");
    }
  });
};

window.renderAdminCouponsTab = function (container) {
  window.DB_Operations.getAllCoupons(function (couponsObj) {
    var codes = Object.keys(couponsObj);
    var listHtml = "";
    for (var i = 0; i < codes.length; i++) {
      var code = codes[i];
      var d = couponsObj[code];
      listHtml += '<div class="p-3 bg-gray-50 border rounded flex items-center justify-between"><div><span class="px-2 py-0.5 bg-pink-100 text-myntra font-bold rounded text-xs">' + code + '</span><p class="text-xs text-gray-600 mt-1">' + d.description + '</p></div></div>';
    }
    container.innerHTML = '<div class="space-y-3 text-xs"><h3 class="font-bold uppercase text-gray-700">Active DB Coupons</h3><div class="space-y-2">' + listHtml + '</div></div>';
  });
};

// Tab 3: Coupons Manager (Connected to SQL Server)
window.renderAdminCouponsTab = function (container) {
  window.DB_Operations.getAllCoupons(function (couponsObj) {
    var codes = Object.keys(couponsObj);
    var couponsListHtml = "";

    if (codes.length === 0) {
      couponsListHtml = '<p class="text-gray-400">No active coupons in database.</p>';
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
          '<span class="px-2 py-0.5 bg-pink-100 text-myntra font-extrabold rounded text-xs">' + code + '</span>' +
          '<p class="text-gray-700 font-semibold mt-1">' + desc + '</p>' +
          '<p class="text-[11px] text-gray-500">Type: ' + cType + ' | Value: ' + valueDisplay + ' | Min Order: ₹' + minOrd + '</p>' +
          "</div>" +
          '<button type="button" onclick="window.deleteCouponCode(\'' + code + '\')" class="text-red-600 font-bold hover:underline">Remove</button>' +
          "</div>";
      }
    }

    container.innerHTML =
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">' +
      "<div>" +
      '<h3 class="font-bold uppercase text-gray-700 mb-3">Active DB Coupons</h3>' +
      '<div class="space-y-2.5">' + couponsListHtml + "</div></div>" +
      '<form onsubmit="window.handleAddCoupon(event)" class="bg-gray-50 p-4 rounded border space-y-3">' +
      '<h3 class="font-bold uppercase text-gray-700">Create / Update Coupon in DB</h3>' +
      "<div><label class=\"block font-bold text-gray-600 mb-1\">Coupon Code *</label>" +
      '<input id=\"newCouponCode\" type=\"text\" required placeholder=\"e.g. ROSE30\" class=\"w-full border rounded px-3 py-2 uppercase font-bold\" /></div>' +
      '<div class="grid grid-cols-2 gap-3"><div>' +
      '<label class=\"block font-bold text-gray-600 mb-1\">Discount Type *</label>' +
      '<select id=\"newCouponType\" class=\"w-full border rounded px-2 py-2 bg-white\"><option value=\"PERCENT\">Percentage (%)</option><option value=\"FLAT\">Flat Rupees (₹)</option></select></div>' +
      '<div><label class=\"block font-bold text-gray-600 mb-1\">Value *</label>' +
      '<input id=\"newCouponVal\" type=\"number\" min=\"1\" required placeholder=\"25 or 500\" class=\"w-full border rounded px-3 py-2\" /></div></div>' +
      '<div class="grid grid-cols-2 gap-3"><div>' +
      '<label class=\"block font-bold text-gray-600 mb-1\">Min Order (₹)</label>' +
      '<input id=\"newCouponMin\" type=\"number\" value=\"999\" class=\"w-full border rounded px-3 py-2\" /></div>' +
      '<div><label class=\"block font-bold text-gray-600 mb-1\">Max Discount (₹)</label>' +
      '<input id=\"newCouponMax\" type=\"number\" value=\"1500\" class=\"w-full border rounded px-3 py-2\" /></div></div>' +
      '<div><label class=\"block font-bold text-gray-600 mb-1\">Description *</label>' +
      '<input id=\"newCouponDesc\" type=\"text\" required placeholder=\"e.g. 30% OFF on Silk Sarees\" class=\"w-full border rounded px-3 py-2\" /></div>' +
      '<button type=\"submit\" class=\"w-full py-2.5 bg-myntra text-white font-bold uppercase rounded\">+ Save Coupon to DB</button>' +
      "</form></div>";
  });
};

window.handleAddCoupon = function (e) {
  e.preventDefault();
  var code = document.getElementById("newCouponCode").value.trim().toUpperCase();
  var type = document.getElementById("newCouponType").value;
  var value = parseInt(document.getElementById("newCouponVal").value, 10);
  var minOrder = parseInt(document.getElementById("newCouponMin").value, 10) || 0;
  var maxDiscount = parseInt(document.getElementById("newCouponMax").value, 10) || 1500;
  var description = document.getElementById("newCouponDesc").value.trim();

  var couponObj = { type: type, value: value, minOrder: minOrder, maxDiscount: maxDiscount, description: description };
  window.DB_Operations.saveCoupon(code, couponObj, function (success) {
    if (success) {
      window.refreshStorefrontUI();
      window.renderAdminCouponsTab(document.getElementById("adminDashboardBody"));
      window.showToast("Coupon " + code + " saved to SQL Server DB!");
    }
  });
};

window.deleteCouponCode = function (code) {
  window.DB_Operations.deleteCoupon(code, function (success) {
    if (success) {
      window.refreshStorefrontUI();
      window.renderAdminCouponsTab(document.getElementById("adminDashboardBody"));
      window.showToast("Coupon " + code + " deleted from DB.");
    }
  });
};

// Tab 4: Promo Banner & Fees (Connected to SQL Server)
window.renderAdminBannerAndFeesTab = function (container) {
  window.DB_Operations.getSiteConfig(function (config) {
    var safeBannerText = (config.promoBannerText || "").replace(/"/g, "&quot;");

    container.innerHTML =
      '<form onsubmit="window.handleSaveBannerAndFees(event)" class="max-w-xl space-y-4 text-xs">' +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-700 mb-1">Top Promotional Banner Announcement *</label>' +
      '<input id="editBannerText" type="text" required value="' + safeBannerText + '" class="w-full border rounded px-3 py-2 text-xs font-semibold" />' +
      "</div>" +
      '<div class="grid grid-cols-2 gap-4">' +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-700 mb-1">Platform Convenience Fee (₹)</label>' +
      '<input id="editPlatformFee" type="number" min="0" value="' + config.platformFee + '" class="w-full border rounded px-3 py-2" />' +
      "</div>" +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-700 mb-1">Free Shipping Threshold (₹)</label>' +
      '<input id="editFreeShip" type="number" min="0" value="' + config.freeShippingThreshold + '" class="w-full border rounded px-3 py-2" />' +
      "</div></div>" +
      '<button type="submit" class="px-6 py-2.5 bg-myntra text-white font-bold uppercase rounded">Save Banner &amp; Fees to DB</button>' +
      "</form>";
  });
};

window.switchAdminTab = function (tabName) {
  window.activeAdminTab = tabName;
  var buttons = document.querySelectorAll(".admin-tab-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle("active", buttons[i].dataset.tab === tabName);
  }
  var content = document.getElementById("adminDashboardBody");
  if (!content) return;
  if (tabName === "rates") window.renderAdminRatesAndImagesTab(content);
  if (tabName === "new-product") window.renderAdminNewProductTab(content);
  if (tabName === "coupons") window.renderAdminCouponsTab(content);
  if (tabName === "banner") window.renderAdminBannerAndFeesTab(content);
  if (tabName === "operators") window.renderAdminOperatorsTab(content);
  if (tabName === "marketing") window.renderAdminMarketingTab(content);
};

window.renderAdminOperatorsTab = function (container) {
  window.DB_Operations.getOperators(function (operators) {
    window.DB_Operations.getApprovals(function (approvals) {
      var opRows = "";
      for (var i = 0; i < operators.length; i++) {
        var op = operators[i];
        opRows += '<div class="p-2.5 bg-gray-50 border rounded flex justify-between items-center text-xs"><div><strong>' + op.name + '</strong> (' + op.identifier + ')</div><button type="button" onclick="window.deleteOperator(\'' + op.identifier + '\')" class="text-red-600 font-bold">Remove</button></div>';
      }

      var appRows = "";
      for (var j = 0; j < approvals.length; j++) {
        var app = approvals[j];
        appRows += '<div class="p-3 bg-amber-50 border border-amber-200 rounded flex justify-between items-center text-xs"><div><strong>' + app.brand + ' - ' + app.name + '</strong><br/><span class="text-gray-500">Submitted by: ' + app.submitted_by + ' | Price: ₹' + app.price + '</span></div><div class="space-x-2"><button type="button" onclick="window.actionApproval(' + app.approval_id + ', \'Approved\')" class="px-3 py-1 bg-green-600 text-white font-bold rounded">Approve</button><button type="button" onclick="window.actionApproval(' + app.approval_id + ', \'Rejected\')" class="px-3 py-1 bg-red-600 text-white font-bold rounded">Reject</button></div></div>';
      }

      container.innerHTML =
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">' +
        '<div class="space-y-3"><h3 class="font-bold uppercase text-gray-700">Active Store Operators</h3><div class="space-y-2">' + (opRows || '<p class="text-gray-400">No operators found.</p>') + '</div>' +
        '<form onsubmit="window.handleAddOperator(event)" class="bg-gray-50 p-3 rounded border space-y-2.5 mt-4"><h4 class="font-bold text-gray-700">+ Add Store Operator &amp; Permissions</h4>' +
        '<input id="opEmail" type="email" required placeholder="operator@bharatstyle.in" class="w-full border rounded px-2 py-1.5" />' +
        '<input id="opName" type="text" required placeholder="Operator Name" class="w-full border rounded px-2 py-1.5" />' +
        '<input id="opMobile" type="tel" maxlength="10" required placeholder="Mobile Number" class="w-full border rounded px-2 py-1.5" />' +
        '<input id="opPass" type="password" required placeholder="Password" class="w-full border rounded px-2 py-1.5" />' +
        '<div class="pt-1"><label class="block font-bold text-gray-700 mb-1">Allowed Tab Permissions:</label>' +
        '<div class="grid grid-cols-2 gap-1.5 bg-white p-2 border rounded">' +
        '<label class="flex items-center space-x-1.5"><input type="checkbox" name="opPerm" value="rates" checked /> <span>Rates &amp; Images</span></label>' +
        '<label class="flex items-center space-x-1.5"><input type="checkbox" name="opPerm" value="new-product" checked /> <span>Add Outfit</span></label>' +
        '<label class="flex items-center space-x-1.5"><input type="checkbox" name="opPerm" value="coupons" /> <span>Coupons</span></label>' +
        '<label class="flex items-center space-x-1.5"><input type="checkbox" name="opPerm" value="banner" /> <span>Banner &amp; Fees</span></label>' +
        '</div></div>' +
        '<button type="submit" class="w-full py-2.5 bg-purple-700 text-white font-bold rounded uppercase shadow">Create Operator Account</button></form></div>' +
        '<div class="space-y-3"><h3 class="font-bold uppercase text-gray-700">Pending Operator Approvals (' + approvals.length + ')</h3><div class="space-y-2.5 max-h-96 overflow-y-auto">' + (appRows || '<p class="text-gray-400">No pending items to review.</p>') + '</div></div></div>';
    });
  });
};window.handleAddOperator = function (e) {
  e.preventDefault();
  var email = document.getElementById("opEmail").value.trim();
  var name = document.getElementById("opName").value.trim();
  var mobile = document.getElementById("opMobile").value.trim();
  var password = document.getElementById("opPass").value.trim();

  var permCheckboxes = document.querySelectorAll('input[name="opPerm"]:checked');
  var allowedTabs = [];
  for (var i = 0; i < permCheckboxes.length; i++) {
    allowedTabs.push(permCheckboxes[i].value);
  }

  var data = { email: email, name: name, mobile: mobile, password: password, allowedTabs: allowedTabs };
  window.DB_Operations.saveOperator(data, function (success) {
    if (success) {
      window.renderAdminOperatorsTab(document.getElementById("adminDashboardBody"));
      window.showToast("Store operator and permissions created!");
    }
  });
};

window.deleteOperator = function (email) {
  window.DB_Operations.deleteOperator(email, function (success) {
    if (success) {
      window.renderAdminOperatorsTab(document.getElementById("adminDashboardBody"));
      window.showToast("Operator removed.");
    }
  });
};

window.actionApproval = function (approvalId, action) {
  window.DB_Operations.actionApproval(approvalId, action, function (success) {
    if (success) {
      window.renderAdminOperatorsTab(document.getElementById("adminDashboardBody"));
      window.showToast("Request " + action.toLowerCase() + "!");
    }
  });
};

window.handleSaveBannerAndFees = function (e) {
  e.preventDefault();
  var promoBannerText = document.getElementById("editBannerText").value.trim();
  var platformFee = parseInt(document.getElementById("editPlatformFee").value, 10) || 0;
  var freeShippingThreshold = parseInt(document.getElementById("editFreeShip").value, 10) || 0;

  var configObj = { promoBannerText: promoBannerText, platformFee: platformFee, freeShippingThreshold: freeShippingThreshold };
  window.DB_Operations.saveSiteConfig(configObj, function (success) {
    if (success) {
      window.refreshStorefrontUI();
      window.showToast("Banner & fees successfully saved to SQL Server DB!");
    }
  });
};

// Tab 4: Promo Banner & Fees (Connected to SQL Server)
window.renderAdminBannerAndFeesTab = function (container) {
  if (!container) return;
  
  container.innerHTML = '<p class="text-xs text-gray-500">Loading banner and fee settings from database...</p>';

  window.DB_Operations.getSiteConfig(function (config) {
    var bannerText = config && config.promoBannerText ? config.promoBannerText : "";
    var feeVal = config && config.platformFee !== undefined ? config.platformFee : 20;
    var shipVal = config && config.freeShippingThreshold !== undefined ? config.freeShippingThreshold : 999;

    container.innerHTML =
      '<form onsubmit="window.handleSaveBannerAndFees(event)" class="max-w-xl space-y-4 text-xs">' +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-700 mb-1">Top Promotional Banner Announcement *</label>' +
      '<input id="editBannerText" type="text" required value="" class="w-full border rounded px-3 py-2 text-xs font-semibold" />' +
      "</div>" +
      '<div class="grid grid-cols-2 gap-4">' +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-700 mb-1">Platform Convenience Fee (₹)</label>' +
      '<input id="editPlatformFee" type="number" min="0" value="' + feeVal + '" class="w-full border rounded px-3 py-2" />' +
      "</div>" +
      "<div>" +
      '<label class="block font-bold uppercase text-gray-700 mb-1">Free Shipping Threshold (₹)</label>' +
      '<input id="editFreeShip" type="number" min="0" value="' + shipVal + '" class="w-full border rounded px-3 py-2" />' +
      "</div></div>" +
      '<button type="submit" class="px-6 py-2.5 bg-myntra text-white font-bold uppercase rounded">Save Banner &amp; Fees to DB</button>' +
      "</form>";

    // Safely assign text value to prevent quote-breaking HTML injection issues
    var bannerInput = document.getElementById("editBannerText");
    if (bannerInput) {
      bannerInput.value = bannerText;
    }
  });
};

window.handleSaveBannerAndFees = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  
  var bannerInput = document.getElementById("editBannerText");
  var feeInput = document.getElementById("editPlatformFee");
  var shipInput = document.getElementById("editFreeShip");

  var promoBannerText = bannerInput ? bannerInput.value.trim() : "";
  var platformFee = feeInput ? parseInt(feeInput.value, 10) || 0 : 20;
  var freeShippingThreshold = shipInput ? parseInt(shipInput.value, 10) || 0 : 999;

  var configObj = {
    promoBannerText: promoBannerText,
    platformFee: platformFee,
    freeShippingThreshold: freeShippingThreshold
  };

  window.DB_Operations.saveSiteConfig(configObj, function (success) {
    if (success) {
      window.refreshStorefrontUI();
      window.showToast("Banner & fees successfully saved to SQL Server DB!");
    } else {
      window.showToast("Failed to save settings to DB.");
    }
  });
};

// 1. Enforce Operator Tab Restrictions Upon Login
window.toggleAdminDashboard = function (show) {
  var user = window.currentUser;
  if (show && (!user || (user.role !== "admin" && user.role !== "store_operator"))) {
    window.toggleLoginModal(true);
    return;
  }
  var modal = document.getElementById("adminDashboardModal");
  if (!modal) return;

  if (show) {
    modal.classList.remove("hidden");
    
    // If user is a store_operator, fetch permissions and hide unauthorized tabs
    if (user.role === "store_operator") {
      window.DB_Operations.getOperatorPermissions(user.identifier, function (allowedTabs) {
        var allTabs = document.querySelectorAll(".admin-tab-btn");
        for (var i = 0; i < allTabs.length; i++) {
          var tabName = allTabs[i].dataset.tab;
          if (allowedTabs.indexOf(tabName) === -1 && tabName !== "operators") {
            allTabs[i].classList.add("hidden");
          } else {
            allTabs[i].classList.remove("hidden");
          }
        }
        window.switchAdminTab(allowedTabs[0] || "rates");
      });
    } else {
      // Admin sees all tabs
      var allTabs = document.querySelectorAll(".admin-tab-btn");
      for (var i = 0; i < allTabs.length; i++) {
        allTabs[i].classList.remove("hidden");
      }
      window.switchAdminTab(window.activeAdminTab);
    }
  } else {
    modal.classList.add("hidden");
  }
};

// 2. Tab 6: Bulk Email & WhatsApp Marketing & Upcoming Events Center
window.renderAdminMarketingTab = function (container) {
  window.DB_Operations.getCustomerContacts(function (customers) {
    var emailsList = customers.map(function(c) { return c.identifier; }).join(",");
    var phonesList = customers.map(function(c) { return c.mobile; }).filter(Boolean).join(",");

    var mailtoLink = "mailto:?bcc=" + encodeURIComponent(emailsList) + "&subject=" + encodeURIComponent("🌸 BharatStyle Women's Exclusive Festive Offers & Upcoming Events") + "&body=" + encodeURIComponent("Dear Valued Customer,\n\nExplore our new festive collection of sarees, anarkalis, and lehengas with special offers! Visit us today.\n\nWarm regards,\nBharatStyle Women");
    var whatsappLink = "https://wa.me/?text=" + encodeURIComponent("🌸 BharatStyle Women's Exclusive Festive Offers are live! Explore designer sarees and suits at unbeatable rates today.");

    container.innerHTML =
      '<div class="space-y-4 text-xs">' +
      '<div class="bg-pink-50 p-4 rounded border border-pink-200 space-y-2">' +
      '<h3 class="font-bold text-gray-900 text-sm">📢 Bulk Email & WhatsApp Marketing Hub</h3>' +
      '<p class="text-gray-600">Send notifications regarding upcoming fashion events, seasonal launches, and discount codes to all registered customers (' + customers.length + ' contacts found).</p>' +
      '</div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">' +
      '<div class="bg-white p-4 rounded border space-y-3 shadow-sm">' +
      '<h4 class="font-bold text-gray-800 uppercase">📧 Bulk Email Dispatcher</h4>' +
      '<p class="text-gray-500">Opens your default email client with all registered customer emails pre-filled in BCC.</p>' +
      '<a href="' + mailtoLink + '" target="_blank" class="block text-center py-2.5 bg-blue-600 text-white font-bold rounded uppercase shadow">Open Bulk Email Client</a>' +
      '</div>' +
      '<div class="bg-white p-4 rounded border space-y-3 shadow-sm">' +
      '<h4 class="font-bold text-gray-800 uppercase">💬 WhatsApp Broadcast Link</h4>' +
      '<p class="text-gray-500">Opens WhatsApp Web with a promotional campaign message ready to broadcast.</p>' +
      '<a href="' + whatsappLink + '" target="_blank" class="block text-center py-2.5 bg-green-600 text-white font-bold rounded uppercase shadow">Launch WhatsApp Broadcast</a>' +
      '</div></div></div>';
  });
};

window.exportUpdatedDataJsFile = function () {
  window.showToast("Database mode active. Data is synced directly with SQL Server.");
};

window.resetStoreToDefaults = function () {
  window.showToast("Database active.");
};