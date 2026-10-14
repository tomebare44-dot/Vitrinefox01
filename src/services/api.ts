import { Product, Category, Order, AdminStats } from '../types/index.ts';

const TOKEN_KEY = 'vitrinefox_admin_token';

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }
};

function getAuthHeaders(): HeadersInit {
  const token = authStorage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Public Storefront APIs
  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Falha ao obter produtos do catálogo.');
    const data = await res.json();
    return data.products || [];
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Produto não encontrado.');
    const data = await res.json();
    return data.product;
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Falha ao obter categorias.');
    const data = await res.json();
    return data.categories || [];
  },

  async createCategory(name: string, icon?: string): Promise<Category> {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, icon })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar categoria.');
    return data.category;
  },

  async updateCategory(id: string, name: string): Promise<Category> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar categoria.');
    return data.category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erro ao excluir categoria.');
    return true;
  },

  async createOrder(payload: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: any;
    items: { product_id: string; quantity: number }[];
    payment_method: 'pix' | 'credit_card' | 'boleto';
  }): Promise<{ success: boolean; order: Order; message?: string }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao finalizar pedido.');
    }
    return data;
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Pedido não localizado.');
    const data = await res.json();
    return data.order;
  },

  // Admin Auth APIs
  async login(password: string): Promise<{ token: string; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Senha incorreta.');
    }
    authStorage.setToken(data.token);
    return data;
  },

  async verifyAuth(): Promise<boolean> {
    const token = authStorage.getToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/verify', {
        headers: getAuthHeaders()
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch {}
    authStorage.clearToken();
  },

  // Admin Catalog & Orders APIs
  async getAdminProducts(): Promise<Product[]> {
    const res = await fetch('/api/admin/products', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Falha ao listar produtos no painel.');
    const data = await res.json();
    return data.products || [];
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar produto.');
    return data.product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar produto.');
    return data.product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erro ao excluir produto.');
    }
    return true;
  },

  async updateStock(id: string, stock: number): Promise<void> {
    const res = await fetch(`/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stock })
    });
    if (!res.ok) throw new Error('Erro ao ajustar estoque.');
  },

  async uploadImage(base64Data: string, filename: string): Promise<string> {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ base64Data, filename })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha no upload da imagem.');
    return data.url;
  },

  async getAdminOrders(): Promise<Order[]> {
    const res = await fetch('/api/admin/orders', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Falha ao listar pedidos.');
    const data = await res.json();
    return data.orders || [];
  },

  async updateOrderStatus(id: string, status: Order['status'], paymentStatus?: Order['payment_status']): Promise<Order> {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, payment_status: paymentStatus })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao alterar status do pedido.');
    return data.order;
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Falha ao obter dados estatísticos.');
    const data = await res.json();
    return data.stats;
  }
};
