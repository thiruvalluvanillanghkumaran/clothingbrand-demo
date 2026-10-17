// ============================================================================
// 1. WOMEN'S ONLY STORE DATA & FREE FASHION IMAGE API ENGINE (data.js)
// Exclusively Indian Women's Clothing Brands & Silhouettes
// ============================================================================

window.memoryBackup = {};
window.safeStorage = {
  getItem: function (key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return window.memoryBackup[key] || null;
    }
  },
  setItem: function (key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      window.memoryBackup[key] = value;
    }
  },
  removeItem: function (key) {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete window.memoryBackup[key];
    }
  }
};

// Curated Royalty-Free Women's Fashion API Image Pool (Unsplash CDN Direct API)
window.FREE_WOMEN_FASHION_API_POOL = [
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1610030469668-93510cb6f49e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80"
];

// API Helper: Returns a fresh royalty-free women's clothing image URL
window.fetchFreeWomenImageFromAPI = function () {
  const pool = window.FREE_WOMEN_FASHION_API_POOL;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

window.DEFAULT_SITE_CONFIG = {
  lastUpdated: "October 2026",
  promoBannerText: "🌸 WOMEN'S FESTIVE ROSE EDIT: Flat 20% OFF on Biba, Soch, Libas & W | Code: ROSE20",
  platformFee: 20,
  freeShippingThreshold: 999,
  coupons: {
    "ROSE20": {
      type: "PERCENT",
      value: 20,
      maxDiscount: 1500,
      minOrder: 999,
      description: "20% OFF up to ₹1,500 on Women's Ethnic & Fusion Wear"
    },
    "QUEEN500": {
      type: "FLAT",
      value: 500,
      maxDiscount: 500,
      minOrder: 2499,
      description: "Flat ₹500 OFF on Women's Festive orders above ₹2,499"
    }
  }
};

// 100% INDIAN WOMEN'S CLOTHING CATALOG (No Men's or Kids' items)
window.INITIAL_PRODUCTS = [
  {
    id: "WMN-101",
    brand: "Biba",
    name: "Rose Gold Block Print Anarkali Kurta & Dupatta Set",
    style: "Kurtas & Suits",
    price: 2799,
    mrp: 4599,
    rating: 4.8,
    reviews: 642,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-102",
    brand: "Soch",
    name: "Kanjeevaram Zari Woven Blush Silk Festive Saree",
    style: "Sarees",
    price: 3899,
    mrp: 6999,
    rating: 4.9,
    reviews: 815,
    sizes: ["Free Size"],
    image: "https://images.unsplash.com/photo-1610030469668-93510cb6f49e?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-103",
    brand: "W for Woman",
    name: "Festive Foil Printed Straight Kurta & Palazzo Set",
    style: "Kurtas & Suits",
    price: 2199,
    mrp: 3999,
    rating: 4.6,
    reviews: 490,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-104",
    brand: "Aurelia",
    name: "Chanderi Embroidered Zari Work Straight Kurta",
    style: "Kurtas & Suits",
    price: 1299,
    mrp: 2299,
    rating: 4.5,
    reviews: 530,
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-105",
    brand: "Global Desi",
    name: "Boho Rose Print Tiered Indo-Western Maxi Dress",
    style: "Fusion Dresses",
    price: 1899,
    mrp: 3299,
    rating: 4.7,
    reviews: 318,
    sizes: ["XS", "S", "M", "L"],
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-106",
    brand: "Libas",
    name: "Butter Pink Pure Cotton Schiffli Kurta Sharara Set",
    style: "Kurtas & Suits",
    price: 1999,
    mrp: 3799,
    rating: 4.7,
    reviews: 912,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-107",
    brand: "Ritu Kumar",
    name: "Bridal Heritage Sequinned Organza Lehenga Choli",
    style: "Lehengas & Festive",
    price: 6499,
    mrp: 9999,
    rating: 4.9,
    reviews: 274,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-108",
    brand: "Fabindia",
    name: "Handloom Mulmul Cotton Chikankari Women's Tunic Dress",
    style: "Fusion Dresses",
    price: 1799,
    mrp: 2699,
    rating: 4.6,
    reviews: 405,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-109",
    brand: "Meena Bazaar",
    name: "Banarasi Tissue Silk Woven Designer Saree",
    style: "Sarees",
    price: 3499,
    mrp: 5999,
    rating: 4.8,
    reviews: 367,
    sizes: ["Free Size"],
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "WMN-110",
    brand: "House of Pataudi",
    name: "Royal Marigold Mirror-Work Festive Lehenga Set",
    style: "Lehengas & Festive",
    price: 4599,
    mrp: 7999,
    rating: 4.8,
    reviews: 289,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80",
    inStock: true
  }
];

// Uses new `_women_v2` keys so old Men's cached items are cleared automatically
window.getActiveProducts = function () {
  const saved = window.safeStorage.getItem("bharatstyle_women_v2_products");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return JSON.parse(JSON.stringify(window.INITIAL_PRODUCTS));
};

window.saveActiveProducts = function (productsList) {
  window.safeStorage.setItem("bharatstyle_women_v2_products", JSON.stringify(productsList));
};

window.getActiveSiteConfig = function () {
  const saved = window.safeStorage.getItem("bharatstyle_women_v2_config");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.coupons) return parsed;
    } catch (e) {}
  }
  return JSON.parse(JSON.stringify(window.DEFAULT_SITE_CONFIG));
};

window.saveActiveSiteConfig = function (configObj) {
  window.safeStorage.setItem("bharatstyle_women_v2_config", JSON.stringify(configObj));
};