export interface ProductMemory {
  display_name: string;
  tare: number;
  usage_count: number;
  last_used_at: number;
}

export interface SupplierMemory {
  display_name: string;
  last_product_slug: string;
  products: Record<string, ProductMemory>;
}

export interface Database {
  suppliers: Record<string, SupplierMemory>;
}

const STORAGE_KEY = 'conferente_learning_db';

// Helper to normalize strings (remove accents, lowercase)
const normalize = (str: string) => 
  str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const getDB = (): Database => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { suppliers: {} };
  } catch (e) {
    return { suppliers: {} };
  }
};

const saveDB = (db: Database) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const learn = (supplier: string, product: string, tare: number) => {
  if (!supplier || !product) return;

  const db = getDB();
  const supplierSlug = normalize(supplier);
  const productSlug = normalize(product);

  // Initialize Supplier if new
  if (!db.suppliers[supplierSlug]) {
    db.suppliers[supplierSlug] = {
      display_name: supplier,
      last_product_slug: '',
      products: {}
    };
  }

  // Update Supplier Metadata
  db.suppliers[supplierSlug].display_name = supplier; // Keep most recent casing
  db.suppliers[supplierSlug].last_product_slug = productSlug;

  // Initialize/Update Product
  const currentProduct = db.suppliers[supplierSlug].products[productSlug];
  
  db.suppliers[supplierSlug].products[productSlug] = {
    display_name: product,
    tare: tare,
    usage_count: (currentProduct?.usage_count || 0) + 1,
    last_used_at: Date.now()
  };

  saveDB(db);
  console.log(`[Learning] Learned: ${supplier} -> ${product} = Tare ${tare}kg`);
};

export const predict = (supplier: string): { product: string; tare: number } | null => {
  if (!supplier) return null;

  const db = getDB();
  const supplierSlug = normalize(supplier);
  const supplierData = db.suppliers[supplierSlug];

  if (!supplierData || !supplierData.last_product_slug) return null;

  const lastProductSlug = supplierData.last_product_slug;
  const productData = supplierData.products[lastProductSlug];

  if (productData) {
    return {
      product: productData.display_name,
      tare: productData.tare
    };
  }

  return null;
};

// Allow looking up specific product for a supplier (if user types product manually)
export const predictProductTare = (supplier: string, product: string): number | null => {
  if (!supplier || !product) return null;
  
  const db = getDB();
  const supplierSlug = normalize(supplier);
  const productSlug = normalize(product);
  
  const productData = db.suppliers[supplierSlug]?.products[productSlug];
  return productData ? productData.tare : null;
};