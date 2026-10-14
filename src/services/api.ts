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

function getAuthHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Robust, safe fetch wrapper that prevents:
 * "Unexpected token 'T', "The page c"... is not valid JSON"
 * Inspects content-type, catches non-JSON HTML error pages (like Vercel 404s),
 * and provides clear, descriptive error messages.
 */
async function safeApiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const opts: RequestInit = {
    ...options,
    credentials: 'include' // Always send cookies (admin_session)
  };

  let res: Response;
  try {
    res = await fetch(url, opts);
  } catch (netErr: any) {
    console.error(`[VitrineFox API Network Error] ${url}:`, netErr);
    throw new Error('Falha de conexão com o servidor da VitrineFox. Verifique se o servidor está ativo.');
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  let textBody = '';
  try {
    textBody = await res.text();
  } catch {
    textBody = '';
  }

  let jsonData: any = null;
  if (isJson && textBody.trim()) {
    try {
      jsonData = JSON.parse(textBody);
    } catch (parseErr) {
      console.warn(`[VitrineFox API Parse Error] Não foi possível interpretar resposta JSON de ${url}:`, parseErr);
    }
  }

  if (!res.ok) {
    // If it's a 404 and returned HTML (typical Vercel or proxy 404 "The page could not be found")
    if (res.status === 404) {
      if (!isJson || textBody.includes('The page') || textBody.includes('<!DOCTYPE')) {
        throw new Error(
          `A rota (${url}) não foi encontrada no servidor (Erro 404). Se o projeto foi publicado na Vercel, certifique-se de que a rota Serverless /api está ativa e as variáveis do Supabase estão configuradas.`
        );
      }
      throw new Error(jsonData?.error || 'Recurso não encontrado no servidor.');
    }

    if (res.status === 401) {
      throw new Error(jsonData?.error || 'Senha incorreta ou acesso não autorizado.');
    }

    if (res.status === 429) {
      throw new Error(jsonData?.error || 'Limite de tentativas excedido. Acesso bloqueado temporariamente por segurança.');
    }

    if (res.status === 500) {
      throw new Error(jsonData?.error || 'Erro interno no servidor ao processar os dados.');
    }

    if (jsonData && jsonData.error) {
      throw new Error(jsonData.error);
    }

    throw new Error(`Erro na comunicação com o servidor (Status HTTP ${res.status}).`);
  }

  if (jsonData !== null) {
    return jsonData as T;
  }

  // If response was ok but body was empty or not json
  return {} as T;
}

export const api = {
  // Public Storefront APIs
  async getProducts(): Promise<Product[]> {
    const data = await safeApiRequest<{ products: Product[] }>('/api/products');
    return data.products || [];
  },

  async getProduct(id: string): Promise<Product> {
    const data = await safeApiRequest<{ product: Product }>(`/api/products/${id}`);
    if (!data.product) throw new Error('Produto não encontrado.');
    return data.product;
  },

  async getCategories(): Promise<Category[]> {
    const data = await safeApiRequest<{ categories: Category[] }>('/api/categories');
    return data.categories || [];
  },

  // Category Management
  async createCategory(name: string, icon?: string): Promise<Category> {
    const data = await safeApiRequest<{ category: Category }>('/api/admin/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, icon })
    });
    if (!data.category) throw new Error('Falha ao cadastrar categoria.');
    return data.category;
  },

  async updateCategory(id: string, name: string): Promise<Category> {
    const data = await safeApiRequest<{ category: Category }>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });
    if (!data.category) throw new Error('Falha ao atualizar categoria.');
    return data.category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    await safeApiRequest<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
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
    return await safeApiRequest<{ success: boolean; order: Order; message?: string }>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async getOrder(id: string): Promise<Order> {
    const data = await safeApiRequest<{ order: Order }>(`/api/orders/${id}`);
    if (!data.order) throw new Error('Pedido não localizado.');
    return data.order;
  },

  // Admin Auth APIs
  async login(password: string): Promise<{ token: string; message: string }> {
    const data = await safeApiRequest<{ success: boolean; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (data.token) {
      authStorage.setToken(data.token);
    }
    return data;
  },

  async verifyAuth(): Promise<boolean> {
    const token = authStorage.getToken();
    try {
      const data = await safeApiRequest<{ valid: boolean }>('/api/auth/verify', {
        headers: getAuthHeaders()
      });
      return !!data.valid;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await safeApiRequest('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch {}
    authStorage.clearToken();
  },

  // Admin Catalog & Orders APIs
  async getAdminProducts(): Promise<Product[]> {
    const data = await safeApiRequest<{ products: Product[] }>('/api/admin/products', {
      headers: getAuthHeaders()
    });
    return data.products || [];
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const data = await safeApiRequest<{ product: Product }>('/api/admin/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    if (!data.product) throw new Error('Falha ao cadastrar produto.');
    return data.product;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const data = await safeApiRequest<{ product: Product }>(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!data.product) throw new Error('Falha ao atualizar produto.');
    return data.product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    await safeApiRequest<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return true;
  },

  async updateStock(id: string, stock: number): Promise<void> {
    await safeApiRequest(`/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stock })
    });
  },

  async uploadImage(base64Data: string, filename: string): Promise<string> {
    const data = await safeApiRequest<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ base64Data, filename })
    });
    if (!data.url) throw new Error('Falha no upload da imagem.');
    return data.url;
  },

  async getAdminOrders(): Promise<Order[]> {
    const data = await safeApiRequest<{ orders: Order[] }>('/api/admin/orders', {
      headers: getAuthHeaders()
    });
    return data.orders || [];
  },

  async updateOrderStatus(id: string, status: Order['status'], paymentStatus?: Order['payment_status']): Promise<Order> {
    const data = await safeApiRequest<{ order: Order }>(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, payment_status: paymentStatus })
    });
    if (!data.order) throw new Error('Falha ao alterar status do pedido.');
    return data.order;
  },

  async getAdminStats(): Promise<AdminStats> {
    const data = await safeApiRequest<{ stats: AdminStats }>('/api/admin/stats', {
      headers: getAuthHeaders()
    });
    return data.stats;
  },

  // Test Database Connection (Supabase / Local)
  async testDatabaseConnection(): Promise<{
    connected: boolean;
    message: string;
    databaseType: 'supabase_postgres' | 'persistent_json_store';
    productsCount?: number;
  }> {
    return await safeApiRequest('/api/admin/db/test', {
      headers: getAuthHeaders()
    });
  }
};
