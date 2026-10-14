export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promotional_price?: number | null;
  stock: number;
  category: string;
  images: string[];
  is_active: boolean;
  redirect_url?: string | null;
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled' | 'refunded';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

export interface OrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_id?: string | null;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AdminStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalInventoryUnits: number;
  totalOrders: number;
  paidOrdersCount: number;
  realRevenue: number;
  pendingOrdersCount: number;
  canceledOrdersCount: number;
  topSellingProducts: {
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
    imageUrl?: string;
  }[];
  recentOrders: Order[];
  databaseType: 'supabase_postgres' | 'persistent_json_store';
  supabaseConnected: boolean;
}
