import React, { useState } from 'react';
import { X, Search, Package, Clock, CheckCircle2, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await api.getOrder(orderId.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Pedido não localizado com esse código.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">Pago e Confirmado</span>;
      case 'shipped':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">Enviado / A caminho</span>;
      case 'delivered':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">Entregue</span>;
      case 'canceled':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">Cancelado</span>;
      case 'refunded':
        return <span className="bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">Reembolsado</span>;
      default:
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold">Aguardando Pagamento</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm transition-opacity"
      />

      <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Rastrear Pedido</h3>
            <p className="text-xs text-neutral-400">Consulte o status do seu pedido na VitrineFox</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Ex: VF-2026-123456"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            className="flex-1 bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Buscar</span>
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {order && (
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-2.5 border-b border-neutral-800">
              <span className="font-mono text-xs font-bold text-orange-400">{order.id}</span>
              {getStatusBadge(order.status)}
            </div>

            <div className="text-xs space-y-1 text-neutral-300">
              <p><strong>Comprador:</strong> {order.customer_name}</p>
              <p><strong>Total:</strong> R$ {order.total.toFixed(2).replace('.', ',')}</p>
              <p><strong>Data:</strong> {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                Itens do Pedido:
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-neutral-300">
                    <span className="line-clamp-1">{item.quantity}x {item.product_name}</span>
                    <span className="shrink-0 font-medium text-neutral-200">
                      R$ {item.subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
