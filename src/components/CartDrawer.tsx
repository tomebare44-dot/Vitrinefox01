import React from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  const freeShippingThreshold = 200;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || totalItems === 0 ? 0 : 19.90;
  const grandTotal = subtotal + shippingFee;

  return (
    <>
      {/* FLOATING BAG BUTTON FIXED AT BOTTOM LEFT (canto inferior esquerdo da interface) */}
      <div className="fixed bottom-5 left-5 z-40 print:hidden">
        <button
          onClick={() => setIsCartOpen(true)}
          className="group relative flex items-center gap-2.5 bg-neutral-900/95 hover:bg-neutral-850 text-white pl-3.5 pr-4 py-3 rounded-full border border-orange-500/40 hover:border-orange-500 shadow-xl shadow-orange-950/40 backdrop-blur-md transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none"
          aria-label="Abrir Sacola de Compras"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-orange-500 group-hover:rotate-6 transition-transform" />
            {totalItems > 0 && (
              <span className="absolute -top-2.5 -right-2.5 bg-orange-500 text-neutral-950 text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-neutral-950 shadow">
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Sacola
            </span>
            <span className="text-xs font-extrabold text-orange-400">
              {totalItems === 0 ? 'Vazia' : `R$ ${subtotal.toFixed(2).replace('.', ',')}`}
            </span>
          </div>
        </button>
      </div>

      {/* OVERLAY & SLIDE-OVER DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h2 className="font-display font-bold text-lg text-white">Minha Sacola</h2>
                <span className="bg-neutral-800 text-neutral-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                aria-label="Fechar sacola"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Alert Bar */}
            <div className="bg-neutral-850 px-4 py-2.5 border-b border-neutral-800/60 text-xs">
              {subtotal >= freeShippingThreshold ? (
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>Parabéns! Você ganhou <strong>Frete Grátis</strong> para este pedido.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-orange-400" />
                      Faltam <strong className="text-orange-400">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</strong> para Frete Grátis!
                    </span>
                    <span className="text-[10px] text-neutral-500 font-bold">R$ 200</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 flex items-center justify-center mb-4 text-neutral-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">Sua sacola está vazia</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mb-6">
                    Explore nossos produtos selecionados e adicione seus itens favoritos.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-600/20"
                  >
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                cart.map(item => {
                  const effectivePrice = item.product.promotional_price && item.product.promotional_price > 0 && item.product.promotional_price < item.product.price
                    ? item.product.promotional_price
                    : item.product.price;
                  const itemTotal = effectivePrice * item.quantity;
                  const isMaxStock = item.quantity >= item.product.stock;

                  return (
                    <div
                      key={item.product.id}
                      className="flex gap-3 bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/80 hover:border-neutral-700 transition"
                    >
                      <img
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-xl bg-neutral-900 border border-neutral-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-neutral-500 hover:text-red-400 p-1 transition"
                              title="Remover produto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            {item.product.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/60">
                          <div>
                            <span className="text-xs font-bold text-orange-400">
                              R$ {itemTotal.toFixed(2).replace('.', ',')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-neutral-500 block">
                                R$ {effectivePrice.toFixed(2).replace('.', ',')} un.
                              </span>
                            )}
                          </div>

                          {/* Quantity selector */}
                          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                              title="Diminuir quantidade"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-neutral-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={isMaxStock}
                              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                              title={isMaxStock ? 'Estoque máximo atingido' : 'Aumentar quantidade'}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {isMaxStock && (
                          <span className="text-[10px] text-amber-500 mt-1">
                            Máx. disponível em estoque ({item.product.stock} un.)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer / Summary */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 bg-neutral-950 border-t border-neutral-800 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal:</span>
                    <span className="text-neutral-200 font-medium">
                      R$ {subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Frete:</span>
                    <span className={shippingFee === 0 ? 'text-emerald-400 font-bold' : 'text-neutral-200 font-medium'}>
                      {shippingFee === 0 ? 'GRÁTIS' : `R$ ${shippingFee.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-bold text-white pt-2 border-t border-neutral-800">
                    <span>Total:</span>
                    <span className="text-orange-400">
                      R$ {grandTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      onProceedToCheckout();
                    }}
                    className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-neutral-950 font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 cursor-pointer text-sm tracking-wide uppercase"
                  >
                    <span>Finalizar Pedido</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-white transition text-center"
                  >
                    Continuar Comprando
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Compra 100% Segura e Verificada</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
