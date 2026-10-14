import React, { useState } from 'react';
import { Eye, AlertCircle, ExternalLink } from 'lucide-react';
import { Product } from '../types/index.ts';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const [imgError, setImgError] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasPromo = product.promotional_price && product.promotional_price > 0 && product.promotional_price < product.price;

  const discountPercent = hasPromo
    ? Math.round(((product.price - (product.promotional_price || 0)) / product.price) * 100)
    : 0;

  const displayImage = imgError || !product.images || product.images.length === 0
    ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    : product.images[0];

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-neutral-900/70 rounded-2xl border border-neutral-800/80 hover:border-orange-500/50 hover:bg-neutral-900 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-orange-950/20 cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-950">
        <img
          src={displayImage}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 justify-between">
          <span className="text-[11px] font-medium text-neutral-300 flex items-center gap-1 bg-neutral-900/80 px-2 py-1 rounded-md backdrop-blur-sm">
            <Eye className="w-3.5 h-3.5 text-orange-400" /> Ver detalhes
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasPromo && (
            <span className="bg-orange-500 text-neutral-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-md tracking-wider">
              -{discountPercent}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <span className="bg-red-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
              Esgotado
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500/90 text-neutral-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Últimas {product.stock} un.
            </span>
          ) : null}
          {product.redirect_url && (
            <span className="bg-orange-500/90 text-neutral-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <ExternalLink className="w-2.5 h-2.5" /> Link Direto
            </span>
          )}
        </div>

        {/* Category tag */}
        <span className="absolute top-2.5 right-2.5 bg-neutral-950/70 backdrop-blur-sm text-neutral-300 text-[10px] font-medium px-2 py-0.5 rounded-full border border-neutral-800">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          {/* Prices */}
          <div>
            {hasPromo ? (
              <div className="flex flex-col">
                <span className="text-[11px] text-neutral-500 line-through">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-base sm:text-lg font-display font-bold text-orange-400">
                  R$ {(product.promotional_price || 0).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">À vista</span>
                <span className="text-base sm:text-lg font-display font-bold text-white">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
          </div>

          {/* Direct Buy / External Redirection Button */}
          <div className="flex items-center gap-1.5">
            {product.redirect_url ? (
              <a
                href={product.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-neutral-950 shadow-md shadow-orange-600/20 transition cursor-pointer select-none"
                title="Pagar diretamente no link oficial"
              >
                <span>Comprar</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(product);
                }}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Oferta</span>
              </button>
            )}
          </div>
      </div>
    </div>
  </div>
);
};
