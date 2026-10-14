import React, { useState, useRef, useEffect } from 'react';
import { Search, Shield, X, Package, Sparkles } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAdminAuth: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminPanel: () => void;
  onOpenOrderLookup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAdminAuth,
  isAdminLoggedIn,
  onOpenAdminPanel,
  onOpenOrderLookup
}) => {
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    setClickCount(prev => {
      const nextCount = prev + 1;

      // Reset timer if idle for 4.5 seconds
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 4500);

      // Trigger secret admin modal at 15 clicks
      if (nextCount >= 15) {
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 60, 40]);
        }
        onOpenAdminAuth();
        return 0;
      }
      return nextCount;
    });
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 transition-all">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-xs font-medium py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Frete Grátis para todo o Brasil em compras acima de R$ 200 • Envio Imediato</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* LOGO WITH 15-CLICKS DISCREET DETECTOR */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoClick}
              className="group flex items-center gap-2.5 focus:outline-none select-none text-left cursor-pointer"
              title="VitrineFox — Loja Oficial"
              aria-label="VitrineFox Logo"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-neutral-950 fill-current" stroke="none">
                  {/* Stylized Fox Mark */}
                  <polygon points="12,2 5,14 8,22 16,22 19,14" />
                  <polygon points="12,7 8,14 16,14" fill="#ffffff" opacity="0.9" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  Vitrine<span className="text-orange-500">Fox</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-widest -mt-1 hidden sm:block">
                  Catálogo Oficial
                </span>
              </div>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar produtos, fones, mochilas..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-neutral-900/90 text-sm text-neutral-100 placeholder-neutral-400 pl-10 pr-9 py-2 sm:py-2.5 rounded-xl border border-neutral-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors shadow-inner"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Track Order lookup button */}
            <button
              onClick={onOpenOrderLookup}
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-neutral-300 hover:text-orange-400 px-3 py-2 rounded-lg hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition"
              title="Acompanhar meus pedidos"
            >
              <Package className="w-4 h-4 text-orange-500" />
              <span>Rastrear Pedido</span>
            </button>

            {/* Admin Badge button (only visible if logged in) */}
            {isAdminLoggedIn && (
              <button
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 text-xs font-semibold bg-orange-600/20 text-orange-400 border border-orange-500/40 hover:bg-orange-600/30 px-3 py-2 rounded-lg transition"
                title="Painel Administrativo Ativo"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Painel Dono</span>
              </button>
            )}

            {/* Atendimento Online */}
            <a
              href="https://wa.me/?text=Ol%C3%A1!%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20os%20produtos%20da%20VitrineFox."
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white flex items-center gap-2 transition text-xs font-semibold"
              title="Falar com Atendimento"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline text-neutral-300">Atendimento</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
