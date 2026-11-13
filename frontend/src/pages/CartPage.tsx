import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  ShieldCheck,
  CheckCircle,
  X,
  Lock,
  Truck,
  Check,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    discount,
    total,
    couponCode,
    updateQty,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch {
      // toast shown in useCart
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const freeShippingThreshold = 99;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shipping = isFreeShipping ? 0 : 9.99;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const finalTotal = Math.max(0, total + shipping + estimatedTax);
  const totalItemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-white border border-[#D9E0E8] rounded-3xl flex items-center justify-center mx-auto text-slate-400 mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-[#FF9900]" />
        </div>
        <h2 className="text-2xl font-black text-[#172337] mb-2">Your Shopping Cart is empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-8">
          Your shopping cart lives to serve. Give it purpose — fill it with electronics, hardware, and deals!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#FFD814] hover:bg-[#f7ca00] text-[#0F1B2D] font-bold text-xs px-8 py-3.5 rounded-xl shadow transition-all"
        >
          <span>Explore Today's Deals</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Free shipping progress notification banner */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E0E8] shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#168A43] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            {isFreeShipping ? (
              <p className="text-xs font-bold text-[#168A43] flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Your order qualifies for FREE Express Shipping!
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-700">
                Add <strong className="text-[#172337]">${amountNeededForFreeShipping.toFixed(2)}</strong> more of eligible items to get <strong className="text-[#168A43]">FREE Shipping</strong>
              </p>
            )}
            <p className="text-[11px] text-slate-500">Fast worldwide delivery with real-time GPS tracking.</p>
          </div>
        </div>
        <Link to="/shop" className="hidden sm:inline-block text-xs font-bold text-[#FF9900] hover:underline shrink-0">
          Continue shopping →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#D9E0E8] shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[#D9E0E8] flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#172337]">Shopping Cart</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              <button
                type="button"
                onClick={() => clearCart()}
                className="text-xs text-[#D93025] hover:underline font-bold"
              >
                Deselect all items
              </button>
            </div>

            <div className="divide-y divide-[#D9E0E8]">
              {items.map((item) => {
                const image =
                  item.product?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80';
                const price = item.variant?.price != null ? Number(item.variant.price) : Number(item.product.price);
                const itemTotal = price * item.quantity;

                return (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
                    {/* Thumbnail */}
                    <Link
                      to={`/product/${item.product?.slug || item.productId}`}
                      className="w-24 h-24 rounded-xl bg-slate-50 border border-[#D9E0E8] overflow-hidden shrink-0 p-2 flex items-center justify-center self-center sm:self-start"
                    >
                      <img src={image} alt={item.product?.name} className="w-full h-full object-contain" />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product?.slug || item.productId}`}
                        className="font-bold text-[#172337] hover:text-[#FF9900] text-sm leading-snug line-clamp-2"
                      >
                        {item.product?.name}
                      </Link>

                      <div className="mt-1 space-y-0.5">
                        <span className="text-xs font-bold text-[#168A43]">In Stock</span>
                        <p className="text-[11px] text-slate-500">Eligible for FREE Shipping</p>
                        {item.variant && (
                          <p className="text-xs text-slate-600 font-medium">
                            Option: <span className="font-bold text-slate-800">{item.variant.name}</span>
                          </p>
                        )}
                      </div>

                      {/* Quantity & Actions Bar */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 pt-2 border-t border-slate-100">
                        {/* Qty Stepper */}
                        <div className="flex items-center border border-[#D9E0E8] rounded-lg bg-slate-50">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 text-xs font-bold text-[#172337] min-w-[2rem] text-center">
                            Qty: {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-slate-300">|</span>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.product?.name)}
                          className="text-xs text-[#D93025] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>

                        <span className="text-slate-300">|</span>

                        <Link
                          to="/compare"
                          className="text-xs text-[#FF9900] hover:underline font-semibold"
                        >
                          Compare with similar
                        </Link>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right sm:text-right w-full sm:w-auto shrink-0 self-end sm:self-start">
                      <span className="text-lg font-black text-[#172337]">${itemTotal.toFixed(2)}</span>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-slate-400">(${price.toFixed(2)} each)</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50/60 border-t border-[#D9E0E8] text-right">
              <span className="text-xs text-slate-600">Subtotal ({totalItemCount} items): </span>
              <strong className="text-lg font-black text-[#172337]">${subtotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Order Summary Buy Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#D9E0E8] shadow-sm space-y-5">
            <div className="space-y-1">
              <span className="text-xs text-slate-600">Subtotal ({totalItemCount} items):</span>
              <div className="text-2xl font-black text-[#172337]">${subtotal.toFixed(2)}</div>
            </div>

            {/* Proceed to Checkout CTA (Amazon Bright Yellow) */}
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full py-3 px-4 rounded-xl bg-[#FFD814] hover:bg-[#f7ca00] active:bg-[#f0c14b] text-[#0F1B2D] font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs pt-4 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#168A43] font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Coupon Discount
                  </span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping & Handling</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? (
                    <span className="text-[#168A43] uppercase font-bold text-[11px]">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-[#D9E0E8] flex justify-between items-baseline">
                <span className="font-bold text-[#172337] text-sm">Estimated Total</span>
                <span className="text-2xl font-black text-[#172337]">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-t border-slate-100">
              {couponCode ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-[#168A43]" />
                    <span>Coupon "{couponCode}" applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCoupon()}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (BIGSALE)"
                    className="flex-1 bg-slate-50 border border-[#D9E0E8] rounded-xl px-3 py-2 text-xs uppercase outline-none focus:bg-white focus:border-[#FF9900]"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="bg-slate-100 hover:bg-slate-200 border border-[#D9E0E8] text-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <Lock className="w-3.5 h-3.5 text-[#168A43] shrink-0" />
              <span>Safe & Secure checkout with 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
