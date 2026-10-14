import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { OrderLookupModal } from './components/OrderLookupModal.tsx';
import { AdminAuthModal } from './components/AdminAuthModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { api } from './services/api.ts';
import { Product, Category } from './types/index.ts';
import {
  Sparkles,
  SlidersHorizontal,
  PackageOpen,
  ShieldCheck,
  Truck,
  ExternalLink,
  Lock
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check admin session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const valid = await api.verifyAuth();
      setIsAdminLoggedIn(valid);
    };
    checkAuth();
  }, []);

  // Fetch public products and categories from shared server DB
  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(prods);
      setDbCategories(cats);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Merge database categories and product categories
  const categories = useMemo(() => {
    const list = ['Todos'];
    dbCategories.forEach(c => {
      if (!list.includes(c.name)) list.push(c.name);
    });
    products.forEach(p => {
      if (p.category && !list.includes(p.category)) list.push(p.category);
    });
    return list;
  }, [dbCategories, products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => !p.is_deleted && p.is_active);

    if (selectedCategory !== 'Todos') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const effectivePriceA = a.promotional_price && a.promotional_price > 0 && a.promotional_price < a.price ? a.promotional_price : a.price;
      const effectivePriceB = b.promotional_price && b.promotional_price > 0 && b.promotional_price < b.price ? b.promotional_price : b.price;

      if (sortBy === 'price-asc') return effectivePriceA - effectivePriceB;
      if (sortBy === 'price-desc') return effectivePriceB - effectivePriceA;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminAuthOpen(false);
    setIsAdminPanelOpen(true);
  };

  const handleAdminLogout = async () => {
    await api.logout();
    setIsAdminLoggedIn(false);
    setIsAdminPanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* HEADER WITH 15-CLICKS LOGO ACCESS */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
      />

      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 py-10 sm:py-14 border-b border-neutral-800/60">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coleção Exclusiva VitrineFox 2026</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Tecnologia, Estilo e <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Qualidade Superior.</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 mt-3 max-w-xl leading-relaxed">
              Descubra os produtos mais desejados com estoque real garantido, checkout seguro e entrega expressa para todo o território nacional.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-6 pt-6 border-t border-neutral-800/80 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Compra Protegida</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-400" />
                <span>Envio para Todo o Brasil</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span>Links Oficiais Verificados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CATALOG & FILTERS */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Filters and Sorting Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-neutral-950 font-bold shadow-md shadow-orange-600/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-neutral-900 text-neutral-200 text-xs font-medium py-2 px-3 rounded-xl border border-neutral-800 focus:border-orange-500 outline-none cursor-pointer"
            >
              <option value="featured">Mais Recentes</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="name-asc">Nome (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 animate-pulse h-80" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível no momento'}
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mt-1">
                {searchQuery
                  ? `Não encontramos resultados para "${searchQuery}". Tente pesquisar por outros termos.`
                  : 'Nossa equipe está abastecendo o catálogo com novos lançamentos. Volte em breve!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl transition"
                >
                  Limpar Busca
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-950 border-t border-neutral-800 mt-20 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-800/80">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-neutral-950 font-black text-xs">
                  VF
                </div>
                <span className="font-display font-bold text-lg text-white">
                  Vitrine<span className="text-orange-500">Fox</span>
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Vitrine oficial com produtos de alta tecnologia e curadoria refinada. Compras 100% seguras com garantia.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-300 mb-3">
                Atendimento & Suporte
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><button onClick={() => setIsOrderLookupOpen(true)} className="hover:text-orange-400 transition">Rastrear Meu Pedido</button></li>
                <li><span className="hover:text-orange-400 cursor-pointer">Política de Envio e Frete</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer">Trocas e Devoluções</span></li>
                <li><span className="hover:text-orange-400 cursor-pointer">Termos de Serviço</span></li>
              </ul>
            </div>

            {/* Redirection payment info */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-300 mb-3">
                Pagamento & Segurança
              </h4>
              <p className="text-xs text-neutral-400 mb-3">
                Pagamento 100% seguro processado diretamente dentro do link oficial de cada produto.
              </p>
              <div className="flex items-center gap-2 text-neutral-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Checkout Oficial Verificado</span>
              </div>
            </div>

            {/* Admin Info hint */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800/80">
              <div className="flex items-center gap-2 text-neutral-300 text-xs font-semibold mb-1">
                <Lock className="w-3.5 h-3.5 text-orange-500" />
                <span>Acesso do Proprietário</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                O painel administrativo protegido é acessado discretamente através do logotipo no topo da página.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-3">
            <span>© 2026 VitrineFox. Todos os direitos reservados. CNPJ comercial verificado.</span>
            <span>Vitrine Oficial com Redirecionamento Direto.</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
      />

      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onLogout={handleAdminLogout}
        onCatalogUpdated={loadCatalog}
      />
    </div>
  );
}
