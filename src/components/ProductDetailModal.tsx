import React, { useState } from 'react';
import { X, ShieldCheck, Truck, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Product } from '../types/index.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const hasPromo = product.promotional_price && product.promotional_price > 0 && product.promotional_price < product.price;
  const effectivePrice = hasPromo ? product.promotional_price! : product.price;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-neutral-950/70 text-neutral-400 hover:text-white hover:bg-neutral-800 transition backdrop-blur-sm"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-neutral-950 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-800">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/80 mb-4">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails if multiple */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto w-full py-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImageIndex === i ? 'border-orange-500 scale-105' : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-500/10 text-orange-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  {product.category}
                </span>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Esgotado
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {product.stock} un. em estoque
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
                {product.name}
              </h2>

              {/* Price section */}
              <div className="mt-4 pb-4 border-b border-neutral-800">
                {hasPromo ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-display font-extrabold text-orange-400">
                      R$ {effectivePrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm text-neutral-500 line-through">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="bg-orange-600 text-neutral-950 font-black text-xs px-2 py-0.5 rounded-md">
                      OFERTA
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="text-xs text-neutral-400 block mt-1">
                  em até 12x no cartão ou com desconto especial no Pix
                </span>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Descrição do Produto
                </h4>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {product.description || 'Produto de alta qualidade com garantia VitrineFox.'}
                </p>
              </div>
            </div>

            {/* Actions - Direct Redirection to Pay Inside Link */}
            <div className="mt-6 pt-4 border-t border-neutral-800">
              {product.redirect_url ? (
                <div>
                  <a
                    href={product.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-neutral-950 shadow-xl shadow-orange-600/30 transition duration-200 cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] select-none"
                  >
                    <span>Comprar Agora • Pagar no Link Oficial</span>
                    <ExternalLink className="w-5 h-5 stroke-[2.5]" />
                  </a>
                  <p className="text-center text-[11px] text-neutral-400 mt-2">
                    Você será redirecionado para a página oficial para concluir seu pagamento com segurança.
                  </p>
                </div>
              ) : (
                <div>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Olá! Gostaria de comprar o produto "${product.name}" da VitrineFox.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white transition cursor-pointer"
                  >
                    <span>Consultar Produto / Comprar</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-center text-[10px] text-neutral-500 mt-1.5">
                    O proprietário da loja responderá diretamente com as opções de pagamento.
                  </p>
                </div>
              )}

              {/* Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-neutral-400 pt-2 border-t border-neutral-800/60">
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Envio Imediato</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Garantia 90 Dias</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Devolução Fácil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
