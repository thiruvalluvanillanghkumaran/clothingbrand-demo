// ============================================================================
// MASTER STORE DATA & DAILY CONFIGURATION FILE (data.js)
// Can be edited directly in code OR updated via the Admin Login Dashboard
// ============================================================================

const DEFAULT_SITE_CONFIG = {
  lastUpdated: "14 Oct 2026",
  promoBannerText: "FESTIVE MEGA SALE: Flat ₹500 OFF on Indian Heritage Wear | Use Code: DESI20",
  platformFee: 20,
  freeShippingThreshold: 999,
  coupons: {
    "DESI20": {
      type: "PERCENT",
      value: 20,
      maxDiscount: 1500,
      minOrder: 999,
      description: "20% OFF up to ₹1,500 on orders above ₹999"
    },
    "FESTIVE500": {
      type: "FLAT",
      value: 500,
      maxDiscount: 500,
      minOrder: 2499,
      description: "Flat ₹500 OFF on orders above ₹2,499"
    }
  }
};

const INITIAL_PRODUCTS = [
  {
    id: "IND-101",
    brand: "Manyavar",
    name: "Royal Silk Blend Woven Sherwani Set",
    category: "Men",
    style: "Ethnic",
    price: 4999,
    mrp: 8999,
    rating: 4.8,
    reviews: 342,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-102",
    brand: "Biba",
    name: "Crimson Gold Block Print Anarkali Kurta Suit",
    category: "Women",
    style: "Ethnic",
    price: 2799,
    mrp: 4599,
    rating: 4.6,
    reviews: 518,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-103",
    brand: "Fabindia",
    name: "Handloom Pure Cotton Indigo Dabu Straight Kurta",
    category: "Men",
    style: "Ethnic",
    price: 1699,
    mrp: 2499,
    rating: 4.7,
    reviews: 289,
    sizes: ["M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-104",
    brand: "W for Woman",
    name: "Emerald Festive Foil Printed Palazzo Set",
    category: "Women",
    style: "Ethnic",
    price: 2199,
    mrp: 3999,
    rating: 4.5,
    reviews: 410,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-105",
    brand: "Raymond",
    name: "Classic Tailored Charcoal Slim-Fit Bandhgala Blazer",
    category: "Men",
    style: "Formal",
    price: 5499,
    mrp: 7999,
    rating: 4.9,
    reviews: 198,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-106",
    brand: "Soch",
    name: "Kanjeevaram Zari Woven Festive Silk Saree",
    category: "Women",
    style: "Ethnic",
    price: 3899,
    mrp: 6999,
    rating: 4.8,
    reviews: 615,
    sizes: ["Free Size"],
    image: "https://images.unsplash.com/photo-1610030469668-93510cb6f49e?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-107",
    brand: "Peter England",
    name: "Pure Linen Mandarin Collar Casual Indian Shirt",
    category: "Men",
    style: "Casual",
    price: 1299,
    mrp: 2199,
    rating: 4.4,
    reviews: 740,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-108",
    brand: "Aurelia",
    name: "Mustard Chanderi Embroidered Straight Kurta",
    category: "Women",
    style: "Ethnic",
    price: 1199,
    mrp: 1999,
    rating: 4.5,
    reviews: 380,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-109",
    brand: "House of Pataudi",
    name: "Embroidered Velvet Jodhpuri Nehru Jacket",
    category: "Men",
    style: "Ethnic",
    price: 2999,
    mrp: 5499,
    rating: 4.7,
    reviews: 225,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    inStock: true
  },
  {
    id: "IND-110",
    brand: "Global Desi",
    name: "Boho Indigo Print Tiered Fusion Maxi Dress",
    category: "Women",
    style: "Casual",
    price: 1899,
    mrp: 3299,
    rating: 4.6,
    reviews: 310,
    sizes: ["S", "M", "L"],
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    inStock: true
  }
];

// ============================================================================
// STORAGE SYNC HELPERS (Syncs Admin Changes with Storefront)
// ============================================================================
function getActiveProducts() {
  const saved = localStorage.getItem("bharatstyle_daily_products");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  }
  return INITIAL_PRODUCTS;
}

function saveActiveProducts(productsList) {
  localStorage.setItem("bharatstyle_daily_products", JSON.stringify(productsList));
}

function getActiveSiteConfig() {
  const saved = localStorage.getItem("bharatstyle_site_config");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_SITE_CONFIG;
    }
  }
  return DEFAULT_SITE_CONFIG;
}

function saveActiveSiteConfig(configObj) {
  localStorage.setItem("bharatstyle_site_config", JSON.stringify(configObj));
}