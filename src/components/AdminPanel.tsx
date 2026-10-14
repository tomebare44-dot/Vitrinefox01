import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  Check,
  X,
  AlertTriangle,
  Database,
  TrendingUp,
  DollarSign,
  Boxes,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Ban,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { Product, Order, AdminStats, Category } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onCatalogUpdated: () => void;
}

type TabType = 'dashboard' | 'products' | 'categories' | 'stock' | 'orders' | 'database';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onLogout,
  onCatalogUpdated
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  // Product Form Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formPromoPrice, setFormPromoPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formCategory, setFormCategory] = useState('Eletrônicos');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formRedirectUrl, setFormRedirectUrl] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete confirm state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Database diagnosis state
  const [dbTesting, setDbTesting] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{
    connected: boolean;
    message: string;
    databaseType: string;
    productsCount?: number;
  } | null>(null);

  const handleTestDatabaseConnection = async () => {
    setDbTesting(true);
    try {
      const res = await api.testDatabaseConnection();
      setDbTestResult(res);
      showNotification(res.message, res.connected ? 'success' : 'error');
    } catch (err: any) {
      setDbTestResult({
        connected: false,
        message: err.message || 'Falha ao testar conexão com o banco.',
        databaseType: 'unknown'
      });
      showNotification(err.message || 'Falha ao testar banco.', 'error');
    } finally {
      setDbTesting(false);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, productsData, ordersData, categoriesData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminProducts(),
        api.getAdminOrders(),
        api.getCategories()
      ]);
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !formCategory) {
        setFormCategory(categoriesData[0].name);
      }
    } catch (err: any) {
      showNotification(err.message || 'Erro ao carregar dados do painel.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Category Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryNameInput('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryNameInput(cat.name);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) {
      showNotification('Digite o nome da categoria.', 'error');
      return;
    }

    setSavingCategory(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryNameInput.trim());
        showNotification(`Categoria "${categoryNameInput}" atualizada com sucesso!`);
      } else {
        const created = await api.createCategory(categoryNameInput.trim());
        showNotification(`Categoria "${created.name}" criada com sucesso!`);
        setFormCategory(created.name);
      }
      setIsCategoryModalOpen(false);
      setCategoryNameInput('');
      setEditingCategory(null);
      await loadAllData();
      onCatalogUpdated();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar categoria.', 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await api.deleteCategory(categoryToDelete.id);
      showNotification(`Categoria "${categoryToDelete.name}" removida com sucesso.`);
      setCategoryToDelete(null);
      await loadAllData();
      onCatalogUpdated();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao remover categoria.', 'error');
    }
  };

  // Open Create Product
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormPromoPrice('');
    setFormStock('10');
    setFormCategory('Eletrônicos');
    setFormImages([
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ]);
    setFormIsActive(true);
    setFormRedirectUrl('');
    setIsProductModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormDescription(prod.description);
    setFormPrice(prod.price.toString());
    setFormPromoPrice(prod.promotional_price ? prod.promotional_price.toString() : '');
    setFormStock(prod.stock.toString());
    setFormCategory(prod.category);
    setFormImages(prod.images || []);
    setFormIsActive(prod.is_active);
    setFormRedirectUrl(prod.redirect_url || '');
    setIsProductModalOpen(true);
  };

  // Real Image Upload (File -> Base64 -> POST /api/admin/upload -> server/uploads/ or Supabase)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Selecione apenas arquivos de imagem (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification('A imagem deve ter no máximo 10MB.', 'error');
      return;
    }

    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const uploadedUrl = await api.uploadImage(base64Data, file.name);
        setFormImages(prev => [uploadedUrl, ...prev]);
        showNotification('Upload da imagem concluído com sucesso!');
      } catch (err: any) {
        showNotification(err.message || 'Falha no upload da imagem.', 'error');
      } finally {
        setImageUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      showNotification('Preencha os campos obrigatórios (Nome e Preço).', 'error');
      return;
    }

    const price = parseFloat(formPrice.replace(',', '.'));
    const promoPrice = formPromoPrice ? parseFloat(formPromoPrice.replace(',', '.')) : null;
    const stock = parseInt(formStock, 10);

    if (isNaN(price) || price <= 0) {
      showNotification('Preço de venda inválido.', 'error');
      return;
    }

    setSavingProduct(true);
    try {
      const payload: Partial<Product> = {
        name: formName.trim(),
        description: formDescription.trim(),
        price,
        promotional_price: promoPrice,
        stock: isNaN(stock) ? 0 : stock,
        category: formCategory,
        images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        is_active: formIsActive,
        redirect_url: formRedirectUrl.trim() || null
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showNotification(`Produto "${formName}" atualizado com sucesso!`);
      } else {
        await api.createProduct(payload);
        showNotification(`Novo produto "${formName}" cadastrado no banco de dados!`);
      }

      setIsProductModalOpen(false);
      await loadAllData();
      onCatalogUpdated();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao salvar produto.', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  // Toggle active/inactive
  const handleToggleProductStatus = async (prod: Product) => {
    try {
      await api.updateProduct(prod.id, { is_active: !prod.is_active });
      showNotification(`Produto "${prod.name}" ${!prod.is_active ? 'ativado' : 'desativado'} na vitrine pública.`);
      await loadAllData();
      onCatalogUpdated();
    } catch (err: any) {
      showNotification('Erro ao alterar status do produto.', 'error');
    }
  };

  // Soft delete product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.deleteProduct(productToDelete.id);
      showNotification(`Produto "${productToDelete.name}" removido (preservando histórico).`);
      setProductToDelete(null);
      await loadAllData();
      onCatalogUpdated();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao excluir produto.', 'error');
    }
  };

  // Quick adjust stock
  const handleQuickStockChange = async (prodId: string, currentStock: number, delta: number) => {
    const nextStock = Math.max(0, currentStock + delta);
    try {
      await api.updateStock(prodId, nextStock);
      setProducts(prev =>
        prev.map(p => (p.id === prodId ? { ...p, stock: nextStock } : p))
      );
      if (stats) {
        setStats({
          ...stats,
          totalInventoryUnits: stats.totalInventoryUnits + (nextStock - currentStock)
        });
      }
      onCatalogUpdated();
    } catch (err: any) {
      showNotification('Erro ao ajustar estoque.', 'error');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showNotification(`Status do pedido ${orderId} atualizado para "${newStatus}".`);
      await loadAllData();
    } catch (err: any) {
      showNotification('Erro ao atualizar status do pedido.', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* Toast notification */}
      {notification && (
        <div className={`fixed top-5 right-5 z-[70] px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200 border ${
          notification.type === 'error'
            ? 'bg-red-950/90 text-red-200 border-red-800'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
          <span>{notification.text}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo & Store Info */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-neutral-950">
                VF
              </div>
              <div>
                <h1 className="font-display font-bold text-base text-white">Painel Dono</h1>
                <span className="text-[10px] text-orange-400 font-semibold block -mt-0.5">
                  VitrineFox Gerenciador
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Voltar à Loja"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-orange-600 text-neutral-950 font-bold shadow-md shadow-orange-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard & Métricas</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-orange-600 text-neutral-950 font-bold shadow-md shadow-orange-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Produtos & Catálogo</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-orange-600 text-neutral-950 font-bold shadow-md shadow-orange-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Categorias</span>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-orange-600 text-neutral-950 font-bold shadow-md shadow-orange-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Controle de Estoque</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-orange-600 text-neutral-950 font-bold shadow-md shadow-orange-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Vendas & Pedidos</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-orange-600 text-neutral-950 font-bold shadow-md shadow-orange-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Banco & Sincronização</span>
            </button>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px]">
            <div className="flex items-center gap-2 text-neutral-400 mb-1">
              <span className={`w-2 h-2 rounded-full ${stats?.supabaseConnected ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              <span className="font-semibold text-neutral-300">
                {stats?.supabaseConnected ? 'Supabase Postgres' : 'Persistent Shared DB'}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-tight">
              Sincronização em tempo real entre celulares e computadores ativa.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 rounded-xl transition text-center"
            >
              Ver Loja
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 border border-red-900/40 rounded-xl transition"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar for mobile nav & refresh */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">VitrineFox Admin</span>
            </div>
            {/* Mobile Tab Select */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={e => setActiveTab(e.target.value as TabType)}
                className="bg-neutral-950 text-white text-xs py-1.5 px-2.5 rounded-lg border border-neutral-800"
              >
                <option value="dashboard">Dashboard</option>
                <option value="products">Produtos</option>
                <option value="categories">Categorias</option>
                <option value="stock">Estoque</option>
                <option value="orders">Pedidos</option>
                <option value="database">Banco de Dados</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition text-xs flex items-center gap-1.5"
              title="Recarregar Dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-neutral-950 font-bold text-xs uppercase tracking-wider transition"
            >
              Ir para Loja
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading && !stats ? (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
              <span className="text-xs">Consultando banco de dados da VitrineFox...</span>
            </div>
          ) : (
            <>
              {/* ========================================================================= */}
              {/* TAB 1: DASHBOARD */}
              {/* ========================================================================= */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Visão Geral do Negócio
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Estatísticas oficiais calculadas a partir dos registros do banco de dados.
                    </p>
                  </div>

                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Revenue from PAID orders only */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Receita Recebida</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-display font-extrabold text-white">
                        R$ {stats.realRevenue.toFixed(2).replace('.', ',')}
                      </div>
                      <span className="text-[11px] text-emerald-400 mt-1 block">
                        Proveniente de {stats.paidOrdersCount} vendas confirmadas
                      </span>
                    </div>

                    {/* Total Orders */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Total de Pedidos</span>
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-display font-extrabold text-white">
                        {stats.totalOrders}
                      </div>
                      <span className="text-[11px] text-amber-400 mt-1 block">
                        {stats.pendingOrdersCount} pendente(s) • {stats.canceledOrdersCount} cancelado(s)
                      </span>
                    </div>

                    {/* Active Products */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Produtos Ativos</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Package className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-display font-extrabold text-white">
                        {stats.activeProducts} <span className="text-xs font-normal text-neutral-400">/ {stats.totalProducts}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 mt-1 block">
                        Disponíveis na vitrine pública
                      </span>
                    </div>

                    {/* Total Inventory Units */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
                      <div className="flex items-center justify-between text-neutral-400 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Unidades em Estoque</span>
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Boxes className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl font-display font-extrabold text-white">
                        {stats.totalInventoryUnits}
                      </div>
                      <span className={`text-[11px] mt-1 block ${stats.outOfStockProducts > 0 ? 'text-red-400' : 'text-neutral-400'}`}>
                        {stats.outOfStockProducts} produto(s) sem estoque
                      </span>
                    </div>
                  </div>

                  {/* Top Selling Products & Recent Orders Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Selling */}
                    <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          Produtos Mais Vendidos
                        </h3>
                        <span className="text-xs text-neutral-400">Vendas confirmadas</span>
                      </div>

                      {stats.topSellingProducts.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-6 text-center">
                          Ainda não há vendas registradas para compor o ranking.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {stats.topSellingProducts.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80">
                              <div className="flex items-center gap-3">
                                <span className="font-display font-bold text-sm text-orange-500 w-5">
                                  #{idx + 1}
                                </span>
                                {p.imageUrl && (
                                  <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover bg-neutral-900 border border-neutral-800" />
                                )}
                                <div>
                                  <h4 className="text-xs font-semibold text-white line-clamp-1">{p.productName}</h4>
                                  <span className="text-[11px] text-neutral-400">{p.totalSold} unidades vendidas</span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-white">
                                R$ {p.revenue.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          Últimos Pedidos
                        </h3>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                        >
                          Ver todos
                        </button>
                      </div>

                      {orders.length === 0 ? (
                        <p className="text-xs text-neutral-400 py-6 text-center">
                          Nenhum pedido recebido ainda.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-orange-400">{order.id}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    order.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                                    order.status === 'canceled' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                  }`}>
                                    {order.status === 'paid' ? 'Pago' : order.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-neutral-400 block mt-0.5">
                                  {order.customer_name} • {order.items.length} item(s)
                                </span>
                              </div>
                              <span className="text-xs font-bold text-white">
                                R$ {order.total.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: PRODUCTS MANAGEMENT */}
              {/* ========================================================================= */}
              {activeTab === 'products' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                        Gerenciamento de Produtos
                      </h2>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Cadastre, edite fotos, preços e categorias sincronizados instantaneamente com o banco.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenCreateProduct}
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Novo Produto</span>
                    </button>
                  </div>

                  {/* Filter & Search */}
                  <div className="flex gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <input
                        type="text"
                        placeholder="Buscar por nome ou categoria..."
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        className="w-full bg-neutral-900 text-xs sm:text-sm text-white rounded-xl pl-9 pr-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                      />
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-950/80 border-b border-neutral-800 uppercase text-[10px] tracking-wider text-neutral-400">
                          <tr>
                            <th className="py-3.5 px-4">Produto</th>
                            <th className="py-3.5 px-4">Categoria</th>
                            <th className="py-3.5 px-4">Preço (R$)</th>
                            <th className="py-3.5 px-4">Estoque</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/80">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-neutral-400">
                                Nenhum produto encontrado.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map(prod => (
                              <tr key={prod.id} className="hover:bg-neutral-850/50 transition">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={prod.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                                      alt=""
                                      className="w-11 h-11 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                                    />
                                    <div>
                                      <h4 className="font-semibold text-white line-clamp-1">{prod.name}</h4>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-neutral-400">ID: {prod.id}</span>
                                        {prod.redirect_url && (
                                          <a
                                            href={prod.redirect_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5 font-medium underline"
                                            title={prod.redirect_url}
                                            onClick={e => e.stopPropagation()}
                                          >
                                            <ExternalLink className="w-2.5 h-2.5" /> Link
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-300">
                                    {prod.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-white">
                                  {prod.promotional_price ? (
                                    <div>
                                      <span className="text-orange-400">R$ {prod.promotional_price.toFixed(2).replace('.', ',')}</span>
                                      <span className="text-[10px] text-neutral-500 line-through block">
                                        R$ {prod.price.toFixed(2).replace('.', ',')}
                                      </span>
                                    </div>
                                  ) : (
                                    <span>R$ {prod.price.toFixed(2).replace('.', ',')}</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`font-bold ${prod.stock <= 0 ? 'text-red-400' : prod.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {prod.stock} un.
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <button
                                    onClick={() => handleToggleProductStatus(prod)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                                      prod.is_active
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                                    }`}
                                  >
                                    {prod.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    <span>{prod.is_active ? 'Ativo na Loja' : 'Inativo'}</span>
                                  </button>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditProduct(prod)}
                                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                                      title="Editar Produto"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setProductToDelete(prod)}
                                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/30 transition"
                                      title="Excluir Produto"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2.5: CATEGORIES MANAGEMENT */}
              {/* ========================================================================= */}
              {activeTab === 'categories' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                        Gerenciamento de Categorias
                      </h2>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Crie e organize categorias para estruturar os filtros da vitrine pública e associar aos produtos.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenCreateCategory}
                      className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Nova Categoria</span>
                    </button>
                  </div>

                  {/* Categories Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => {
                      const count = products.filter(p => p.category === cat.name && !p.is_deleted).length;
                      return (
                        <div
                          key={cat.id}
                          className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between hover:border-orange-500/40 transition group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center group-hover:scale-105 transition">
                              <Layers className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-white">{cat.name}</h3>
                              <span className="text-[11px] text-neutral-400">
                                {count} {count === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                              title="Renomear Categoria"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setCategoryToDelete(cat)}
                              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/30 transition"
                              title="Excluir Categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {categories.length === 0 && (
                    <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400">
                      Nenhuma categoria cadastrada ainda. Clique em "+ Nova Categoria" acima para criar.
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: STOCK MANAGEMENT */}
              {/* ========================================================================= */}
              {activeTab === 'stock' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Controle & Ajuste Rápido de Estoque
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Altere a quantidade de estoque de cada item com 1 clique. O estoque é protegido contra concorrência simultânea.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(prod => (
                      <div key={prod.id} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-neutral-950 border border-neutral-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-white line-clamp-1">{prod.name}</h4>
                            <span className="text-[10px] text-neutral-400 block">{prod.category}</span>
                            <span className={`text-[11px] font-bold ${prod.stock <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {prod.stock} em estoque
                            </span>
                          </div>
                        </div>

                        {/* Adjust buttons */}
                        <div className="flex items-center gap-1 shrink-0 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                          <button
                            onClick={() => handleQuickStockChange(prod.id, prod.stock, -5)}
                            className="px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition"
                            title="-5 unidades"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleQuickStockChange(prod.id, prod.stock, -1)}
                            className="px-2 py-1 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition"
                            title="-1 unidade"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleQuickStockChange(prod.id, prod.stock, 1)}
                            className="px-2 py-1 text-xs font-bold text-orange-400 hover:text-orange-300 hover:bg-neutral-800 rounded-md transition"
                            title="+1 unidade"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleQuickStockChange(prod.id, prod.stock, 5)}
                            className="px-2 py-1 text-[10px] font-bold text-orange-400 hover:text-orange-300 hover:bg-neutral-800 rounded-md transition"
                            title="+5 unidades"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: ORDERS & SALES */}
              {/* ========================================================================= */}
              {activeTab === 'orders' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Registro Real de Vendas & Pedidos
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Histórico inalterável com os valores e produtos do momento exato da compra.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400">
                        Nenhum pedido realizado ainda na loja.
                      </div>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-bold text-orange-400">{order.id}</span>
                                <span className="text-xs text-neutral-400">
                                  {new Date(order.created_at).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <span className="text-xs text-neutral-300 font-medium block mt-0.5">
                                Cliente: {order.customer_name} • {order.customer_email} • {order.customer_phone}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Status changer */}
                              <select
                                value={order.status}
                                onChange={e => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                                className="bg-neutral-950 text-white text-xs font-semibold py-1.5 px-3 rounded-xl border border-neutral-800 focus:border-orange-500 outline-none"
                              >
                                <option value="pending">Pendente</option>
                                <option value="paid">Pago (Aprovado)</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregue</option>
                                <option value="canceled">Cancelado</option>
                              </select>

                              <span className="text-base font-bold text-white ml-2">
                                R$ {order.total.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          </div>

                          {/* Items and Address details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                              <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-2 text-[10px]">
                                Itens Comprados:
                              </span>
                              <div className="space-y-1.5">
                                {order.items.map((it, i) => (
                                  <div key={i} className="flex justify-between text-neutral-300">
                                    <span>{it.quantity}x {it.product_name}</span>
                                    <span className="font-semibold text-white">
                                      R$ {it.subtotal.toFixed(2).replace('.', ',')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                              <span className="font-bold uppercase tracking-wider text-neutral-400 block mb-2 text-[10px]">
                                Endereço de Entrega:
                              </span>
                              <p className="text-neutral-300 leading-relaxed">
                                {order.shipping_address?.street}, {order.shipping_address?.number}
                                {order.shipping_address?.complement ? ` - ${order.shipping_address.complement}` : ''}
                                <br />
                                {order.shipping_address?.neighborhood} - {order.shipping_address?.city}/{order.shipping_address?.state}
                                <br />
                                CEP: {order.shipping_address?.zip}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: DATABASE & SYNC STATUS */}
              {/* ========================================================================= */}
              {activeTab === 'database' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                      Banco de Dados & Sincronização Multi-Dispositivo
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Diagnóstico do problema de sincronização entre celulares e instruções de publicação.
                    </p>
                  </div>

                  {/* Diagnosis Card */}
                  <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-white">
                          Causa Real do Problema e Correção Aplicada
                        </h3>
                        <span className="text-xs text-neutral-400">
                          Por que antes o produto cadastrado no celular A não aparecia no celular B?
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-300 space-y-2.5 leading-relaxed bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                      <p>
                        <strong>Diagnóstico:</strong> Aplicações frontend puras que salvam produtos no <code className="text-orange-400">localStorage</code> do navegador restringem os dados unicamente à memória daquele aparelho específico.
                      </p>
                      <p>
                        <strong>Correção Definitiva na VitrineFox:</strong> Implementamos um backend Express full-stack com API REST centralizada e camada de banco de dados compartilhada. Quando você cadastra um produto no celular:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                        <li>O celular A envia uma requisição autenticada <code className="text-white">POST /api/admin/products</code> para o servidor.</li>
                        <li>O servidor grava o produto no banco de dados persistente (PostgreSQL / atomic store).</li>
                        <li>Qualquer outro celular ou computador que acesse a vitrine faz <code className="text-white">GET /api/products</code> e recebe os mesmos dados imediatamente, sem precisar alterar código nem fazer deploy!</li>
                      </ul>
                    </div>

                    {/* Supabase status */}
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Status da Conexão Supabase</span>
                        <span className="text-[11px] text-neutral-400">
                          {stats?.supabaseConnected
                            ? 'Conectado ao Supabase PostgreSQL com sucesso.'
                            : 'Executando no banco de dados persistente local compartilhado (/data/vitrinefox_db.json).'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        stats?.supabaseConnected
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {stats?.supabaseConnected ? 'Supabase Ativo' : 'Persistent DB Ativo'}
                      </span>
                    </div>

                    {/* Migration file reference */}
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
                      <span className="font-bold text-white block mb-1">Arquivo de Migração Supabase</span>
                      <p className="text-neutral-400 text-[11px]">
                        As tabelas, constraints, índices e políticas RLS estão prontas no arquivo <code className="text-orange-400">supabase/migrations/20261014_init.sql</code>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            onClick={() => setIsProductModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm"
          />

          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500">
                {editingProduct ? 'Editar Cadastro' : 'Novo Produto'}
              </span>
              <h3 className="font-display font-bold text-xl text-white mt-0.5">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Produto na Loja'}
              </h3>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fone FoxPods Pro Wireless"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva os diferenciais, especificações e dimensões..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 299.90"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Preço Promo (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional: 249.90"
                    value={formPromoPrice}
                    onChange={e => setFormPromoPrice(e.target.value)}
                    className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Estoque *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={e => setFormStock(e.target.value)}
                    className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-300">
                      Categoria *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryNameInput('');
                        setIsCategoryModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Nova
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {categories.length === 0 && (
                      <option value="Geral">Geral</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Visibilidade
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      formIsActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                    }`}
                  >
                    {formIsActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{formIsActive ? 'Ativo na Loja' : 'Inativo'}</span>
                  </button>
                </div>
              </div>

              {/* LINK DE REDIRECIONAMENTO */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-orange-400">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Link de Redirecionamento (Opcional)
                  </span>
                  <span className="text-[10px] text-neutral-500 font-normal">Ex: Afiliado, WhatsApp, Shopee</span>
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/produto-externo ou https://wa.me/5511999999999"
                  value={formRedirectUrl}
                  onChange={e => setFormRedirectUrl(e.target.value)}
                  className="w-full bg-neutral-900 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none placeholder:text-neutral-600"
                />
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Se preenchido, os clientes poderão clicar para acessar diretamente seu link externo oficial, facilitando vendas por afiliados, WhatsApp ou checkout externo.
                </p>
              </div>

              {/* REAL IMAGE UPLOAD & PREVIEW */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Imagens do Produto (Upload Real da Galeria ou Câmera)
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploadLoading}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {imageUploadLoading ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <Upload className="w-4 h-4 text-orange-400" />}
                    <span>{imageUploadLoading ? 'Enviando imagem...' : 'Selecionar da Galeria / Arquivo'}</span>
                  </button>
                </div>

                {/* Previews */}
                <div className="flex gap-2 overflow-x-auto py-1">
                  {formImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0 group">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 rounded-md bg-neutral-950/80 text-red-400 hover:bg-red-950 transition opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 cursor-pointer disabled:opacity-50"
                >
                  {savingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                  <span>Salvar Produto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setProductToDelete(null)}
            className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm"
          />

          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-white">Excluir Produto?</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-5">
              O produto <strong>"{productToDelete.name}"</strong> será desativado e removido da vitrine pública. O histórico de pedidos e vendas anteriores será preservado intacto.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsCategoryModalOpen(false)}
            className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm"
          />

          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl z-10 animate-in fade-in duration-200">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {editingCategory ? 'Renomear Categoria' : 'Nova Categoria'}
                </h3>
                <span className="text-[11px] text-neutral-400">
                  {editingCategory ? 'Altere o nome da categoria' : 'Crie uma nova seção para seus produtos'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Smartwatches, Fones, Moda..."
                  value={categoryNameInput}
                  onChange={e => setCategoryNameInput(e.target.value)}
                  className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-neutral-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{editingCategory ? 'Salvar' : 'Criar Categoria'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCategoryToDelete(null)}
            className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm"
          />

          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-white">Excluir Categoria?</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-5">
              Tem certeza que deseja remover a categoria <strong>"{categoryToDelete.name}"</strong>? Os produtos associados não serão apagados.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteCategory}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
