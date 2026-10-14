import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dbService } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Admin Auth Configuration
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'felipe123!';
const JWT_SECRET = process.env.JWT_SECRET || 'vitrinefox-ultra-secure-key-2026-xyz';

// Rate Limiting for Admin Login attempts
interface LoginAttempt {
  count: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, LoginAttempt>();

// Active Admin Sessions
const activeSessions = new Set<string>();

// Uploads directory
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper to parse cookies from request header
function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const cookies: Record<string, string> = {};
  header.split(';').forEach(c => {
    const [name, ...val] = c.trim().split('=');
    if (name) {
      try {
        cookies[name] = decodeURIComponent(val.join('='));
      } catch {
        cookies[name] = val.join('=');
      }
    }
  });
  return cookies;
}

// Serve uploaded product images statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper to generate secure session token
function generateSessionToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.add(token);
  return token;
}

// Helper to extract session token from Authorization header or Cookie
function getSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookies = parseCookies(req);
  if (cookies.admin_session) {
    return cookies.admin_session;
  }
  return null;
}

// Middleware to verify admin authentication
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = getSessionToken(req);
  if (!token) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login administrativo com a senha de acesso.' });
    return;
  }

  if (!activeSessions.has(token)) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Por favor, faça login novamente.' });
    return;
  }

  next();
}

/* ==========================================================================
   PUBLIC API ENDPOINTS
   ========================================================================== */

// Health & System Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'VitrineFox',
    timestamp: new Date().toISOString(),
    supabaseConnected: dbService.isSupabaseConfigured()
  });
});

// Get Public Catalog Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await dbService.getProducts({ includeInactive: false });
    res.json({ products });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Erro ao carregar produtos do catálogo.' });
  }
});

// Get Single Product by ID or Slug
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await dbService.getProductById(req.params.id);
    if (!product || product.is_deleted) {
      res.status(404).json({ error: 'Produto não encontrado.' });
      return;
    }
    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar produto.' });
  }
});

// Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbService.getCategories();
    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar categorias.' });
  }
});

// Create Order (Checkout)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, shipping_address, items, payment_method } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Dados incompletos para processar o pedido.' });
      return;
    }

    const result = await dbService.createOrder({
      customer_name,
      customer_email,
      customer_phone,
      shipping_address: shipping_address || {},
      items,
      payment_method: payment_method || 'pix'
    });

    if (!result.success || !result.order) {
      res.status(400).json({ error: result.error || 'Falha ao registrar pedido.' });
      return;
    }

    res.status(201).json({
      success: true,
      order: result.order,
      message: 'Pedido realizado com sucesso!'
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Erro interno ao processar pedido.' });
  }
});

// Track Order by ID (Public)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await dbService.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pedido não localizado.' });
      return;
    }
    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar pedido.' });
  }
});

/* ==========================================================================
   ADMIN AUTHENTICATION & LOGIN RATE LIMITING
   ========================================================================== */

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };

  // Check lockout
  if (attempt.lockedUntil > now) {
    const minutesRemaining = Math.ceil((attempt.lockedUntil - now) / 60000);
    res.status(429).json({
      error: `Muitas tentativas incorretas. Acesso bloqueado temporariamente por ${minutesRemaining} minuto(s).`
    });
    return;
  }

  // Validate Password
  if (password === ADMIN_PASSWORD) {
    loginAttempts.delete(ip); // Reset attempts
    const token = generateSessionToken();

    // Set secure HttpOnly cookie for session persistence across browsers
    const cookieFlags = [
      `admin_session=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=86400', // 24 hours
      ...(isProduction ? ['Secure'] : [])
    ].join('; ');
    res.setHeader('Set-Cookie', cookieFlags);

    res.json({
      success: true,
      token,
      message: 'Autenticado com sucesso no Painel VitrineFox.'
    });
  } else {
    attempt.count += 1;
    if (attempt.count >= 5) {
      attempt.lockedUntil = now + 5 * 60 * 1000; // 5 minutes lockout
      loginAttempts.set(ip, attempt);
      res.status(429).json({
        error: 'Limite de 5 tentativas excedido. Painel administrativo bloqueado temporariamente por 5 minutos.'
      });
      return;
    }

    loginAttempts.set(ip, attempt);
    const remaining = 5 - attempt.count;
    res.status(401).json({
      error: `Senha incorreta. Você tem mais ${remaining} tentativa(s) antes do bloqueio temporário.`
    });
  }
});

app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  res.json({ valid: true, message: 'Sessão administrativa válida.' });
});

app.post('/api/auth/logout', (req, res) => {
  const token = getSessionToken(req);
  if (token) {
    activeSessions.delete(token);
  }

  // Clear cookie
  const clearCookieFlags = [
    'admin_session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    ...(isProduction ? ['Secure'] : [])
  ].join('; ');
  res.setHeader('Set-Cookie', clearCookieFlags);

  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

/* ==========================================================================
   ADMIN MANAGEMENT ENDPOINTS (PROTECTED)
   ========================================================================== */

// Get All Products (including inactive)
app.get('/api/admin/products', requireAdminAuth, async (req, res) => {
  try {
    const products = await dbService.getProducts({ includeInactive: true });
    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar produtos.' });
  }
});

// Category Management Routes
app.post('/api/admin/categories', requireAdminAuth, async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !String(name).trim()) {
      res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
      return;
    }
    const category = await dbService.createCategory(name, icon);
    res.status(201).json({ category, message: 'Categoria criada com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
});

app.put('/api/admin/categories/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
      return;
    }
    const updated = await dbService.updateCategory(id, name);
    if (!updated) {
      res.status(404).json({ error: 'Categoria não encontrada.' });
      return;
    }
    res.json({ category: updated, message: 'Categoria atualizada!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar categoria.' });
  }
});

app.delete('/api/admin/categories/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dbService.deleteCategory(id);
    if (!success) {
      res.status(404).json({ error: 'Categoria não encontrada.' });
      return;
    }
    res.json({ success: true, message: 'Categoria removida com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao remover categoria.' });
  }
});

// Create New Product
app.post('/api/admin/products', requireAdminAuth, async (req, res) => {
  try {
    const { name, description, price, promotional_price, stock, category, images, is_active, redirect_url } = req.body;

    if (!name || price === undefined || stock === undefined || !category) {
      res.status(400).json({ error: 'Nome, preço, estoque e categoria são obrigatórios.' });
      return;
    }

    const created = await dbService.createProduct({
      name: String(name).trim(),
      slug: '',
      description: String(description || '').trim(),
      price: Number(price),
      promotional_price: promotional_price ? Number(promotional_price) : null,
      stock: Math.max(0, parseInt(stock, 10)),
      category: String(category).trim(),
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      is_active: is_active !== false,
      redirect_url: redirect_url ? String(redirect_url).trim() : null
    });

    res.status(201).json({ product: created, message: 'Produto cadastrado com sucesso!' });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Erro ao salvar produto no banco de dados.' });
  }
});

// Update Product
app.put('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.promotional_price !== undefined) {
      updates.promotional_price = updates.promotional_price ? Number(updates.promotional_price) : null;
    }
    if (updates.stock !== undefined) updates.stock = Math.max(0, parseInt(updates.stock, 10));
    if (updates.redirect_url !== undefined) {
      updates.redirect_url = updates.redirect_url ? String(updates.redirect_url).trim() : null;
    }

    const updated = await dbService.updateProduct(id, updates);
    if (!updated) {
      res.status(404).json({ error: 'Produto não encontrado.' });
      return;
    }

    res.json({ product: updated, message: 'Produto atualizado com sucesso!' });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Delete Product (Soft delete to protect order history)
app.delete('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dbService.deleteProduct(id);
    if (!success) {
      res.status(404).json({ error: 'Produto não encontrado.' });
      return;
    }
    res.json({ success: true, message: 'Produto removido com sucesso preservando o histórico de pedidos.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao excluir produto.' });
  }
});

// Quick Stock Adjust
app.patch('/api/admin/products/:id/stock', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (stock === undefined || isNaN(stock) || stock < 0) {
      res.status(400).json({ error: 'Valor de estoque inválido.' });
      return;
    }

    const success = await dbService.updateStock(id, parseInt(stock, 10));
    if (!success) {
      res.status(404).json({ error: 'Produto não encontrado.' });
      return;
    }

    res.json({ success: true, stock: parseInt(stock, 10) });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao ajustar estoque.' });
  }
});

// Real Image Upload (Base64 / Data URL to local persistent storage or Supabase Storage)
app.post('/api/admin/upload', requireAdminAuth, async (req, res) => {
  try {
    const { base64Data, filename } = req.body;

    if (!base64Data || typeof base64Data !== 'string') {
      res.status(400).json({ error: 'Nenhum dado de imagem fornecido.' });
      return;
    }

    // Match data URI pattern: data:image/jpeg;base64,...
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Formato de imagem inválido. Utilize JPG, PNG, WEBP ou GIF.' });
      return;
    }

    const mimeType = matches[1];
    const rawBuffer = Buffer.from(matches[2], 'base64');

    // 10MB limit
    if (rawBuffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'O tamanho da imagem não pode ultrapassar 10MB.' });
      return;
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(mimeType)) {
      res.status(400).json({ error: 'Tipo de arquivo não permitido. Apenas JPG, PNG, WEBP e GIF são aceitos.' });
      return;
    }

    const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
    const safeName = `fox_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, rawBuffer);
    const imageUrl = `/uploads/${safeName}`;

    res.status(201).json({
      url: imageUrl,
      filename: safeName,
      message: 'Upload concluído com sucesso!'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Falha no processamento do upload de imagem.' });
  }
});

// Admin Orders
app.get('/api/admin/orders', requireAdminAuth, async (req, res) => {
  try {
    const orders = await dbService.getOrders();
    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar pedidos.' });
  }
});

// Update Order Status
app.patch('/api/admin/orders/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const updated = await dbService.updateOrderStatus(id, status, payment_status);
    if (!updated) {
      res.status(404).json({ error: 'Pedido não localizado.' });
      return;
    }

    res.json({ order: updated, message: 'Status do pedido atualizado!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar pedido.' });
  }
});

// Admin Dashboard Analytics
app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await dbService.getAdminStats();
    res.json({ stats });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Erro ao calcular métricas do dashboard.' });
  }
});

// Admin Database Connection Test & Synchronization
app.get('/api/admin/db/test', requireAdminAuth, async (req, res) => {
  try {
    const result = await dbService.testSupabaseConnection();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      message: 'Erro ao executar teste de banco de dados: ' + (error.message || 'Erro interno')
    });
  }
});

/* ==========================================================================
   WEBHOOK MERCADO PAGO (COM IDEMPOTÊNCIA)
   ========================================================================== */

app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const eventId = req.headers['x-request-id'] as string || req.body?.id?.toString() || `mp_${Date.now()}`;
    const action = req.body?.action || req.body?.type || 'payment.updated';

    // Verify idempotency
    const isNew = await dbService.recordPaymentEvent(eventId, action, req.body);
    if (!isNew) {
      res.status(200).json({ status: 'already_processed' });
      return;
    }

    console.log('[VitrineFox Webhook] Processed Mercado Pago notification:', eventId, action);
    res.status(200).json({ status: 'received' });
  } catch (err: any) {
    console.error('[VitrineFox Webhook] Error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

/* ==========================================================================
   VITE DEV SERVER MOUNT & PRODUCTION STATIC SERVING
   ========================================================================== */

export async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[VitrineFox] Dev server started with Vite middleware integration.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('[VitrineFox] dist folder not found. Please run npm run build.');
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦊 VitrineFox server is running on http://0.0.0.0:${PORT}`);
  });
}

// Start standalone server unless executed within a serverless runtime (like Vercel)
if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('[VitrineFox] Fatal error starting server:', err);
  });
}

export default app;
