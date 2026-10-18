// ============================================================================
// SQL SERVER BRIDGE CONNECTOR (db.js)
// ============================================================================

window.API_BASE_URL = "http://localhost:3000/api";

window.DB_Operations = {
  getAllProducts: function (callback) {
    fetch(window.API_BASE_URL + "/products")
      .then(function (res) { return res.json(); })
      .then(function (data) { callback(data && data.length ? data : window.INITIAL_PRODUCTS); })
      .catch(function () { callback(window.INITIAL_PRODUCTS); });
  },

  saveProduct: function (productObj, callback) {
    fetch(window.API_BASE_URL + "/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productObj)
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  saveConfidentialConsumer: function (consumerObj, callback) {
    fetch(window.API_BASE_URL + "/consumers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consumerObj)
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  registerCustomer: function (userData, callback) {
    fetch(window.API_BASE_URL + "/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) { callback(data); })
    .catch(function () { callback({ success: false, error: "Server connection failed." }); });
  },

  authenticateCustomer: function (credentials, callback) {
    fetch(window.API_BASE_URL + "/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) { callback(data); })
    .catch(function () { callback({ success: false, error: "Server connection failed." }); });
  },

  getAllProducts: function (callback) {
    fetch(window.API_BASE_URL + "/products")
      .then(function (res) { return res.json(); })
      .then(function (data) { callback(data && data.length ? data : window.INITIAL_PRODUCTS); })
      .catch(function () { callback(window.INITIAL_PRODUCTS); });
  },

  saveProduct: function (productObj, callback) {
    fetch(window.API_BASE_URL + "/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productObj)
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  deleteProduct: function (productId, callback) {
    fetch(window.API_BASE_URL + "/products/" + productId, { method: "DELETE" })
      .then(function () { if (callback) callback(true); })
      .catch(function () { if (callback) callback(false); });
  },

  // Coupons (Connected to SQL Server)
  getAllCoupons: function (callback) {
    fetch(window.API_BASE_URL + "/coupons")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var fallback = window.DEFAULT_SITE_CONFIG ? window.DEFAULT_SITE_CONFIG.coupons : {};
        callback(data && Object.keys(data).length ? data : fallback);
      })
      .catch(function () {
        var fallback = window.DEFAULT_SITE_CONFIG ? window.DEFAULT_SITE_CONFIG.coupons : {};
        callback(fallback);
      });
  },

  saveCoupon: function (code, couponData, callback) {
    couponData.code = code;
    fetch(window.API_BASE_URL + "/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(couponData)
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  deleteCoupon: function (code, callback) {
    fetch(window.API_BASE_URL + "/coupons/" + code, { method: "DELETE" })
      .then(function () { if (callback) callback(true); })
      .catch(function () { if (callback) callback(false); });
  },

  // Site Config / Banner & Fees (Connected to SQL Server)
  getSiteConfig: function (callback) {
    fetch(window.API_BASE_URL + "/config")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var cfg = window.DEFAULT_SITE_CONFIG || {};
        callback({
          promoBannerText: data && data.promoBannerText !== undefined ? data.promoBannerText : (cfg.promoBannerText || ""),
          platformFee: data && data.platformFee !== undefined ? data.platformFee : (cfg.platformFee || 20),
          freeShippingThreshold: data && data.freeShippingThreshold !== undefined ? data.freeShippingThreshold : (cfg.freeShippingThreshold || 999)
        });
      })
      .catch(function () {
        var cfg = window.DEFAULT_SITE_CONFIG || {};
        callback({
          promoBannerText: cfg.promoBannerText || "",
          platformFee: cfg.platformFee || 20,
          freeShippingThreshold: cfg.freeShippingThreshold || 999
        });
      });
  },

  saveSiteConfig: function (configObj, callback) {
    fetch(window.API_BASE_URL + "/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configObj)
    })
    .then(function (res) { return res.json(); })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  // Confidential Consumer Details Vault
  saveConfidentialConsumer: function (consumerObj, callback) {
    fetch(window.API_BASE_URL + "/consumers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consumerObj)
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  registerCustomer: function (userData, callback) {
    fetch(window.API_BASE_URL + "/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) { callback(data); })
    .catch(function () { callback({ success: false, error: "Server connection failed." }); });
  },

  authenticateCustomer: function (credentials, callback) {
    fetch(window.API_BASE_URL + "/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    })
    .then(function (res) { return res.json(); })
    .then(function (data) { callback(data); })
    .catch(function () { callback({ success: false, error: "Server connection failed." }); });
  },

  getOperators: function (callback) {
    fetch(window.API_BASE_URL + "/operators")
      .then(function (res) { return res.json(); })
      .then(function (data) { callback(data || []); })
      .catch(function () { callback([]); });
  },

  saveOperator: function (opData, callback) {
    fetch(window.API_BASE_URL + "/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opData)
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  deleteOperator: function (email, callback) {
    fetch(window.API_BASE_URL + "/operators/" + email, { method: "DELETE" })
      .then(function () { if (callback) callback(true); })
      .catch(function () { if (callback) callback(false); });
  },

  getApprovals: function (callback) {
    fetch(window.API_BASE_URL + "/approvals")
      .then(function (res) { return res.json(); })
      .then(function (data) { callback(data || []); })
      .catch(function () { callback([]); });
  },

  actionApproval: function (approvalId, action, callback) {
    fetch(window.API_BASE_URL + "/approvals/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalId: approvalId, action: action })
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  getOperatorPermissions: function (email, callback) {
    fetch(window.API_BASE_URL + "/operators/permissions/" + email)
      .then(function (res) { return res.json(); })
      .then(function (data) { callback(data.allowedTabs || ['rates', 'new-product']); })
      .catch(function () { callback(['rates', 'new-product']); });
  },

  saveOperatorPermissions: function (data, callback) {
    fetch(window.API_BASE_URL + "/operators/permissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  savePaymentTransaction: function (txData, callback) {
    fetch(window.API_BASE_URL + "/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txData)
    })
    .then(function () { if (callback) callback(true); })
    .catch(function () { if (callback) callback(false); });
  },

  getCustomerContacts: function (callback) {
    fetch(window.API_BASE_URL + "/customers/contacts")
      .then(function (res) { return res.json(); })
      .then(function (data) { callback(data || []); })
      .catch(function () { callback([]); });
  }
};