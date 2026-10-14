import React, { useState } from 'react';
import { X, CheckCircle, Copy, Check, ArrowRight, ShieldCheck, QrCode, CreditCard, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { api } from '../services/api.ts';
import { Order, PaymentMethod } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [zip, setZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  if (!isOpen) return null;

  const shippingFee = subtotal >= 200 ? 0 : 19.90;
  const grandTotal = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName || !customerEmail || !customerPhone || !street || !number || !city || !zip) {
      setError('Por favor, preencha todos os campos obrigatórios de identificação e endereço.');
      return;
    }

    if (cart.length === 0) {
      setError('Sua sacola está vazia.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zip
        },
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod
      };

      const response = await api.createOrder(orderPayload);
      if (response.success && response.order) {
        setCreatedOrder(response.order);
        setStep('success');
        clearCart();
        onOrderSuccess(response.order);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!createdOrder) return;
    const pixCode = `00020126580014br.gov.bcb.pix0136vitrinefox-pedidos-${createdOrder.id}520400005303986540${createdOrder.total.toFixed(2)}5802BR5910VitrineFox6009SaoPaulo62070503***6304`;
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-sm transition-opacity"
      />

      <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div>
            <div className="mb-6">
              <span className="text-[11px] uppercase tracking-widest font-bold text-orange-500">
                Checkout Seguro VitrineFox
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
                Finalizar Compra
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Preencha seus dados para entrega e selecione a forma de pagamento.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Buyer info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 border-b border-neutral-800 pb-2">
                  1. Dados do Comprador
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ana Silva"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      WhatsApp / Celular *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 border-b border-neutral-800 pb-2">
                  2. Endereço de Entrega
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      CEP *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="00000-000"
                      value={zip}
                      onChange={e => setZip(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Rua / Avenida *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Av. Paulista"
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="1000"
                      value={number}
                      onChange={e => setNumber(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Complemento (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Apto 42"
                      value={complement}
                      onChange={e => setComplement(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Bairro
                    </label>
                    <input
                      type="text"
                      placeholder="Bela Vista"
                      value={neighborhood}
                      onChange={e => setNeighborhood(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="São Paulo"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                      Estado (UF)
                    </label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full bg-neutral-950 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-neutral-800 focus:border-orange-500 outline-none"
                    >
                      {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 border-b border-neutral-800 pb-2">
                  3. Forma de Pagamento
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs font-bold">Pix</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Aprovação imediata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-bold">Cartão</span>
                    <span className="text-[10px] text-neutral-400">Até 12x</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'boleto'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs font-bold">Boleto</span>
                    <span className="text-[10px] text-neutral-400">Em até 3 dias</span>
                  </button>
                </div>
              </div>

              {/* Order total bar */}
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Itens ({cart.length}):</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Frete para {city || 'seu endereço'}:</span>
                  <span className={shippingFee === 0 ? 'text-emerald-400 font-bold' : ''}>
                    {shippingFee === 0 ? 'GRÁTIS' : `R$ ${shippingFee.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Total do Pedido:</span>
                  <span className="text-orange-400">R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-50 text-neutral-950 font-bold text-sm uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-xl shadow-orange-600/25 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Validando estoque e gerando pedido...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar e Gerar Pedido</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Dados protegidos por criptografia de ponta a ponta</span>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS SCREEN */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9" />
            </div>

            <span className="text-xs uppercase tracking-widest font-bold text-orange-500">
              Pedido Registrado no Banco de Dados
            </span>
            <h2 className="font-display font-bold text-2xl text-white mt-1">
              Pedido Recebido com Sucesso!
            </h2>
            <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto">
              Guarde o código do seu pedido para acompanhar o envio e a confirmação de pagamento.
            </p>

            {createdOrder && (
              <div className="my-6 p-5 bg-neutral-950 rounded-2xl border border-neutral-800 text-left space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-800/80">
                  <span className="text-xs text-neutral-400">Código do Pedido:</span>
                  <span className="font-mono font-bold text-sm text-orange-400">
                    {createdOrder.id}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Comprador:</span>
                  <span className="text-neutral-200 font-semibold">{createdOrder.customer_name}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Total a Pagar:</span>
                  <span className="text-white font-bold text-sm">
                    R$ {createdOrder.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Status do Pagamento:</span>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    Aguardando Confirmação
                  </span>
                </div>

                {/* Pix instructions if Pix */}
                {createdOrder.payment_method === 'pix' && (
                  <div className="mt-4 p-4 rounded-xl bg-orange-950/20 border border-orange-500/30">
                    <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5 mb-2">
                      <QrCode className="w-4 h-4" /> Chave Pix Copia e Cola
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={`00020126580014br.gov.bcb.pix0136vitrinefox-pedidos-${createdOrder.id}520400005303986540${createdOrder.total.toFixed(2)}5802BR5910VitrineFox6009SaoPaulo62070503***6304`}
                        className="w-full bg-neutral-900 text-[11px] font-mono text-neutral-300 p-2 rounded-lg border border-neutral-800 truncate"
                      />
                      <button
                        onClick={handleCopyPix}
                        className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-neutral-950 font-bold text-xs rounded-lg transition shrink-0 flex items-center gap-1"
                      >
                        {copiedPix ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-2">
                      Abra o app do seu banco, escolha Pix &gt; Copia e Cola e conclua o pagamento.
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setStep('form');
                onClose();
              }}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              Voltar à Loja
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
