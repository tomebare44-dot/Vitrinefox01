import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, AdminStats, Category } from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory for persistent local database storage
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'vitrinefox_db.json');
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Supabase client instance (if configured)
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('example.com') && !supabaseKey.includes('your_')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[VitrineFox DB] Supabase client initialized with URL:', supabaseUrl);
  } catch (err) {
    console.warn('[VitrineFox DB] Failed to initialize Supabase client:', err);
  }
}

// Initial realistic products for seed
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01-fox-watch',
    name: 'Smartwatch Fox Ultra Pro AMOLED',
    slug: 'smartwatch-fox-ultra-pro',
    description: 'Smartwatch esportivo de alta performance com tela AMOLED de 1.96", monitoramento cardíaco contínuo, oxímetro SpO2, GPS integrado e resistência à água 5ATM. Bateria de até 14 dias.',
    price: 349.90,
    promotional_price: 289.90,
    stock: 18,
    category: 'Eletrônicos',
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-02-fox-pods',
    name: 'Fone FoxPods Max ANC Wireless',
    slug: 'fone-foxpods-max-anc',
    description: 'Fones de ouvido Bluetooth 5.3 com cancelamento ativo de ruído ambiente (ANC), drivers de titânio de 40mm para graves profundos, microfones com isolamento de voz e 45 horas de autonomia.',
    price: 499.00,
    promotional_price: 399.90,
    stock: 12,
    category: 'Eletrônicos',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-03-mochila-urban',
    name: 'Mochila Fox Urban Antifurto Impermeável',
    slug: 'mochila-fox-urban-antifurto',
    description: 'Mochila executiva com tecido Oxford impermeável, trava com segredo TSA embutida, bolso para notebook de até 16 polegadas, porta USB externa e compartimento ergonômico anti-impacto.',
    price: 259.90,
    promotional_price: 199.90,
    stock: 25,
    category: 'Acessórios',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-04-garrafa-inox',
    name: 'Garrafa Térmica Fox Termic 750ml Inox Duplo',
    slug: 'garrafa-termica-fox-termic',
    description: 'Garrafa térmica construída em Aço Inox 18/8 com isolamento a vácuo de parede dupla. Mantém líquidos gelados por até 24 horas ou quentes por até 12 horas. Livre de BPA.',
    price: 129.90,
    promotional_price: 99.90,
    stock: 40,
    category: 'Casa & Estilo',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
    ],
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-05-teclado-stealth',
    name: 'Teclado Mecânico Fox Stealth RGB Mecânico',
    slug: 'teclado-mecanico-fox-stealth',
    description: 'Teclado mecânico compacto 75% com switches silenciosos lubrificados de fábrica, keycaps PBT doubleshot, iluminação RGB per-key personalizável e conexão tri-mode (Bluetooth, 2.4Ghz e cabo).',
    price: 420.00,
    promotional_price: 369.00,
    stock: 8,
    category: 'Eletrônicos',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-06-oculos-polarizado',
    name: 'Óculos Polarizado Fox Carbon UV400',
    slug: 'oculos-polarizado-fox-carbon',
    description: 'Armação ultra-leve em fibra de carbono com lentes polarizadas TAC antirreflexo e proteção total UVA/UVB 400. Inclui estojo rígido e flanela de microfibra.',
    price: 189.90,
    promotional_price: 149.90,
    stock: 15,
    category: 'Moda',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-eletronicos', name: 'Eletrônicos', slug: 'eletronicos' },
  { id: 'cat-acessorios', name: 'Acessórios', slug: 'acessorios' },
  { id: 'cat-moda', name: 'Moda', slug: 'moda' },
  { id: 'cat-casa', name: 'Casa & Estilo', slug: 'casa-estilo' }
];

interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  payment_events: { id: string; event_id: string; type: string; payload: any; created_at: string }[];
}

function readLocalDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.products || !Array.isArray(parsed.products) || parsed.products.length === 0) {
        parsed.products = INITIAL_PRODUCTS;
      }
      if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
        parsed.categories = INITIAL_CATEGORIES;
      }
      if (!parsed.orders || !Array.isArray(parsed.orders)) {
        parsed.orders = [];
      }
      if (!parsed.payment_events || !Array.isArray(parsed.payment_events)) {
        parsed.payment_events = [];
      }
      return parsed;
    }
  } catch (err) {
    console.error('[VitrineFox DB] Error reading local db:', err);
  }

  const initialDb: DatabaseSchema = {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    orders: [],
    payment_events: []
  };
  writeLocalDb(initialDb);
  return initialDb;
}

function writeLocalDb(db: DatabaseSchema) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[VitrineFox DB] Error writing local db:', err);
  }
}

export const dbService = {
  isSupabaseConfigured(): boolean {
    return !!supabase;
  },

  async getProducts(options?: { includeInactive?: boolean }): Promise<Product[]> {
    if (supabase) {
      try {
        let query = supabase.from('products').select('*');
        if (!options?.includeInactive) {
          query = query.eq('is_active', true).eq('is_deleted', false);
        } else {
          query = query.eq('is_deleted', false);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return data.map(p => ({
            ...p,
            is_active: p.is_active !== false,
            is_published: p.is_published !== false,
            price: Number(p.price),
            promotional_price: p.promotional_price ? Number(p.promotional_price) : null,
            stock: Number(p.stock),
            images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? (p.images.startsWith('[') ? JSON.parse(p.images) : [p.images]) : [])
          }));
        } else if (error) {
          console.warn('[VitrineFox DB] Supabase query error, checking local store:', error.message);
        }
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase query failed, falling back to local persistent DB:', e);
      }
    }

    // Local DB fallback
    const local = readLocalDb();
    return local.products.filter(p => {
      if (p.is_deleted) return false;
      if (!options?.includeInactive && !p.is_active) return false;
      return true;
    });
  },

  async getProductById(id: string): Promise<Product | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (!error && data) {
          return {
            ...data,
            is_active: data.is_active !== false,
            is_published: data.is_published !== false,
            price: Number(data.price),
            promotional_price: data.promotional_price ? Number(data.promotional_price) : null,
            stock: Number(data.stock),
            images: Array.isArray(data.images) ? data.images : (typeof data.images === 'string' ? (data.images.startsWith('[') ? JSON.parse(data.images) : [data.images]) : [])
          };
        }
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase getProductById failed:', e);
      }
    }

    const local = readLocalDb();
    const found = local.products.find(p => p.id === id);
    return found || null;
  },

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const id = 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id,
      slug: productData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      is_active: productData.is_active !== false,
      is_published: true,
      publication_status: 'published',
      is_deleted: false,
      created_at: now,
      updated_at: now
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('products').insert([
          {
            id: newProduct.id,
            name: newProduct.name,
            slug: newProduct.slug,
            description: newProduct.description,
            price: newProduct.price,
            promotional_price: newProduct.promotional_price,
            stock: newProduct.stock,
            category: newProduct.category,
            images: newProduct.images,
            is_active: newProduct.is_active,
            redirect_url: newProduct.redirect_url || null,
            is_deleted: false,
            created_at: now,
            updated_at: now
          }
        ]);
        if (error) {
          console.error('[VitrineFox DB] Supabase product insert error:', error.message);
        } else {
          console.log('[VitrineFox DB] Product saved to Supabase PostgreSQL:', newProduct.name);
        }
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase insert failed, storing locally:', e);
      }
    }

    const local = readLocalDb();
    local.products.unshift(newProduct);
    writeLocalDb(local);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const now = new Date().toISOString();

    if (supabase) {
      try {
        const payload: any = { ...updates, updated_at: now };
        if (updates.images) payload.images = JSON.stringify(updates.images);
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) console.error('[VitrineFox DB] Supabase product update error:', error);
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase update failed:', e);
      }
    }

    const local = readLocalDb();
    const idx = local.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    local.products[idx] = {
      ...local.products[idx],
      ...updates,
      updated_at: now
    };
    writeLocalDb(local);
    return local.products[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (supabase) {
      try {
        // Soft delete to preserve historical orders
        await supabase.from('products').update({ is_deleted: true, updated_at: now }).eq('id', id);
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase delete error:', e);
      }
    }

    const local = readLocalDb();
    const idx = local.products.findIndex(p => p.id === id);
    if (idx === -1) return false;

    // Soft delete to protect past orders
    local.products[idx].is_deleted = true;
    local.products[idx].updated_at = now;
    writeLocalDb(local);
    return true;
  },

  async updateStock(id: string, newStock: number): Promise<boolean> {
    if (newStock < 0) return false;
    const now = new Date().toISOString();

    if (supabase) {
      try {
        await supabase.from('products').update({ stock: newStock, updated_at: now }).eq('id', id);
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase update stock failed:', e);
      }
    }

    const local = readLocalDb();
    const prod = local.products.find(p => p.id === id);
    if (!prod) return false;

    prod.stock = newStock;
    prod.updated_at = now;
    writeLocalDb(local);
    return true;
  },

  async getCategories(): Promise<Category[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // fallback
      }
    }
    const local = readLocalDb();
    return local.categories;
  },

  async createCategory(name: string, icon?: string): Promise<Category> {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const id = 'cat-' + slug + '-' + Math.random().toString(36).substring(2, 6);
    const newCat: Category = {
      id,
      name: name.trim(),
      slug,
      icon: icon || 'Tag'
    };

    if (supabase) {
      try {
        await supabase.from('categories').insert([newCat]);
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase createCategory failed:', e);
      }
    }

    const local = readLocalDb();
    if (!local.categories) local.categories = [];
    local.categories.push(newCat);
    writeLocalDb(local);
    return newCat;
  },

  async updateCategory(id: string, name: string): Promise<Category | null> {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (supabase) {
      try {
        await supabase.from('categories').update({ name: name.trim(), slug }).eq('id', id);
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase updateCategory failed:', e);
      }
    }

    const local = readLocalDb();
    const cat = local.categories.find(c => c.id === id);
    if (!cat) return null;
    cat.name = name.trim();
    cat.slug = slug;
    writeLocalDb(local);
    return cat;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase deleteCategory failed:', e);
      }
    }

    const local = readLocalDb();
    const idx = local.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    local.categories.splice(idx, 1);
    writeLocalDb(local);
    return true;
  },

  async getOrders(): Promise<Order[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(o => ({
            ...o,
            subtotal: Number(o.subtotal),
            shipping_fee: Number(o.shipping_fee),
            total: Number(o.total),
            shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
            items: (o.items || []).map((it: any) => ({
              ...it,
              unit_price: Number(it.unit_price),
              quantity: Number(it.quantity),
              subtotal: Number(it.subtotal)
            }))
          }));
        }
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase getOrders failed:', e);
      }
    }

    const local = readLocalDb();
    return local.orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  },

  async createOrder(orderPayload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: any;
    items: { product_id: string; quantity: number }[];
    payment_method: 'pix' | 'credit_card' | 'boleto';
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    const local = readLocalDb();
    const verifiedItems: any[] = [];
    let calculatedSubtotal = 0;

    // Strict Server-Side Stock and Price Validation
    for (const item of orderPayload.items) {
      const prod = local.products.find(p => p.id === item.product_id && !p.is_deleted && p.is_active);
      if (!prod) {
        return { success: false, error: `Produto não encontrado ou indisponível.` };
      }
      if (prod.stock < item.quantity) {
        return {
          success: false,
          error: `Estoque insuficiente para "${prod.name}". Disponível: ${prod.stock} unidade(s).`
        };
      }

      const effectivePrice = prod.promotional_price && prod.promotional_price > 0 && prod.promotional_price < prod.price
        ? prod.promotional_price
        : prod.price;

      const lineTotal = Math.round(effectivePrice * item.quantity * 100) / 100;
      calculatedSubtotal += lineTotal;

      verifiedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        unit_price: effectivePrice,
        quantity: item.quantity,
        subtotal: lineTotal,
        image_url: prod.images[0] || ''
      });
    }

    const shippingFee = calculatedSubtotal > 200 ? 0 : 19.90; // Frete grátis acima de R$ 200
    const total = Math.round((calculatedSubtotal + shippingFee) * 100) / 100;

    const orderId = `VF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    // Decrement stock atomically
    for (const item of orderPayload.items) {
      const prod = local.products.find(p => p.id === item.product_id)!;
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.updated_at = now;
      if (supabase) {
        try {
          await supabase.from('products').update({ stock: prod.stock, updated_at: now }).eq('id', prod.id);
        } catch (e) {
          // ignore
        }
      }
    }

    const newOrder: Order = {
      id: orderId,
      customer_name: orderPayload.customer_name,
      customer_email: orderPayload.customer_email,
      customer_phone: orderPayload.customer_phone,
      shipping_address: orderPayload.shipping_address,
      items: verifiedItems,
      subtotal: Math.round(calculatedSubtotal * 100) / 100,
      shipping_fee: shippingFee,
      total,
      status: 'pending',
      payment_method: orderPayload.payment_method,
      payment_status: 'pending',
      created_at: now,
      updated_at: now
    };

    local.orders.unshift(newOrder);
    writeLocalDb(local);

    if (supabase) {
      try {
        await supabase.from('orders').insert([
          {
            id: newOrder.id,
            customer_name: newOrder.customer_name,
            customer_email: newOrder.customer_email,
            customer_phone: newOrder.customer_phone,
            shipping_address: JSON.stringify(newOrder.shipping_address),
            subtotal: newOrder.subtotal,
            shipping_fee: newOrder.shipping_fee,
            total: newOrder.total,
            status: newOrder.status,
            payment_method: newOrder.payment_method,
            payment_status: newOrder.payment_status,
            created_at: newOrder.created_at,
            updated_at: newOrder.updated_at
          }
        ]);

        for (const it of verifiedItems) {
          await supabase.from('order_items').insert([
            {
              order_id: newOrder.id,
              product_id: it.product_id,
              product_name: it.product_name,
              unit_price: it.unit_price,
              quantity: it.quantity,
              subtotal: it.subtotal,
              image_url: it.image_url
            }
          ]);
        }
      } catch (err) {
        console.warn('[VitrineFox DB] Supabase order insert error:', err);
      }
    }

    return { success: true, order: newOrder };
  },

  async updateOrderStatus(id: string, status: Order['status'], paymentStatus?: Order['payment_status']): Promise<Order | null> {
    const local = readLocalDb();
    const order = local.orders.find(o => o.id === id);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = status;
    if (paymentStatus) {
      order.payment_status = paymentStatus;
    } else if (status === 'paid') {
      order.payment_status = 'approved';
    } else if (status === 'canceled') {
      order.payment_status = 'rejected';
      // Release stock if canceled
      if (previousStatus !== 'canceled') {
        for (const item of order.items) {
          const prod = local.products.find(p => p.id === item.product_id);
          if (prod) {
            prod.stock += item.quantity;
            prod.updated_at = new Date().toISOString();
          }
        }
      }
    }
    order.updated_at = new Date().toISOString();

    writeLocalDb(local);

    if (supabase) {
      try {
        await supabase.from('orders').update({
          status: order.status,
          payment_status: order.payment_status,
          updated_at: order.updated_at
        }).eq('id', id);
      } catch (e) {
        console.warn('[VitrineFox DB] Supabase updateOrderStatus failed:', e);
      }
    }

    return order;
  },

  async getAdminStats(): Promise<AdminStats> {
    const products = await this.getProducts({ includeInactive: true });
    const orders = await this.getOrders();

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const outOfStockProducts = products.filter(p => p.stock <= 0).length;
    const totalInventoryUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

    const totalOrders = orders.length;
    // Real Revenue: calculated ONLY from confirmed paid/delivered orders, never duplicate, never pending or canceled
    const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered' || o.payment_status === 'approved');
    const paidOrdersCount = paidOrders.length;
    const realRevenue = Math.round(paidOrders.reduce((acc, o) => acc + (o.total || 0), 0) * 100) / 100;

    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    const canceledOrdersCount = orders.filter(o => o.status === 'canceled' || o.payment_status === 'rejected').length;

    // Top selling products from paid orders
    const salesByProduct: Record<string, { totalSold: number; revenue: number; name: string; imageUrl?: string }> = {};
    for (const order of paidOrders) {
      for (const item of order.items) {
        if (!salesByProduct[item.product_id]) {
          salesByProduct[item.product_id] = {
            totalSold: 0,
            revenue: 0,
            name: item.product_name,
            imageUrl: item.image_url
          };
        }
        salesByProduct[item.product_id].totalSold += item.quantity;
        salesByProduct[item.product_id].revenue += item.subtotal;
      }
    }

    const topSellingProducts = Object.entries(salesByProduct)
      .map(([productId, info]) => ({
        productId,
        productName: info.name,
        totalSold: info.totalSold,
        revenue: Math.round(info.revenue * 100) / 100,
        imageUrl: info.imageUrl
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalInventoryUnits,
      totalOrders,
      paidOrdersCount,
      realRevenue,
      pendingOrdersCount,
      canceledOrdersCount,
      topSellingProducts,
      recentOrders: orders.slice(0, 10),
      databaseType: supabase ? 'supabase_postgres' : 'persistent_json_store',
      supabaseConnected: !!supabase
    };
  },

  async recordPaymentEvent(eventId: string, type: string, payload: any): Promise<boolean> {
    const local = readLocalDb();
    // Idempotency check: don't process duplicate webhook
    if (local.payment_events.some(e => e.event_id === eventId)) {
      console.log('[VitrineFox DB] Payment event already processed (idempotent):', eventId);
      return false;
    }

    local.payment_events.push({
      id: 'pe-' + Date.now(),
      event_id: eventId,
      type,
      payload,
      created_at: new Date().toISOString()
    });
    writeLocalDb(local);
    return true;
  },

  async testSupabaseConnection(): Promise<{
    connected: boolean;
    message: string;
    databaseType: 'supabase_postgres' | 'persistent_json_store';
    productsCount?: number;
  }> {
    if (!supabase) {
      const local = readLocalDb();
      return {
        connected: false,
        databaseType: 'persistent_json_store',
        message: 'Supabase PostgreSQL não conectado. O sistema está utilizando o banco de dados centralizado local do servidor. Para ativar o Supabase, configure SUPABASE_URL e SUPABASE_ANON_KEY no painel de variáveis de ambiente.',
        productsCount: local.products.filter(p => !p.is_deleted).length
      };
    }

    try {
      const { data, error, count } = await supabase.from('products').select('id', { count: 'exact' });
      if (error) {
        return {
          connected: false,
          databaseType: 'supabase_postgres',
          message: `Falha na consulta ao Supabase: ${error.message}. Verifique as permissões de RLS no editor SQL do Supabase.`
        };
      }

      return {
        connected: true,
        databaseType: 'supabase_postgres',
        message: 'Conexão com o banco Supabase PostgreSQL estabelecida e funcionando com sucesso!',
        productsCount: count || (data ? data.length : 0)
      };
    } catch (err: any) {
      return {
        connected: false,
        databaseType: 'supabase_postgres',
        message: `Erro ao conectar com Supabase: ${err.message || 'Erro desconhecido'}`
      };
    }
  }
};
