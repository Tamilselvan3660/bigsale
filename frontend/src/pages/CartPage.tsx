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
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import Button from '../components/ui/Button';

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

  const shipping = subtotal >= 99 || subtotal === 0 ? 0 : 9.99;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const finalTotal = Math.max(0, total + shipping + estimatedTax);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400 mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
          Looks like you haven't added anything to your cart yet. Explore thousands of deals today!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-navy-900 hover:bg-slate-800 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-md transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            You have {items.reduce((s, i) => s + i.quantity, 0)} items in your cart
          </p>
        </div>
        <button
          type="button"
          onClick={() => clearCart()}
          className="text-xs text-red-600 hover:text-red-700 font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {items.map((item) => {
              const image =
                item.product?.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80';
              const price = item.variant?.price != null ? Number(item.variant.price) : Number(item.product.price);
              const itemTotal = price * item.quantity;

              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product?.slug || item.productId}`}
                    className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 p-2"
                  >
                    <img src={image} alt={item.product?.name} className="w-full h-full object-contain" />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <Link
                      to={`/product/${item.product?.slug || item.productId}`}
                      className="font-bold text-slate-900 hover:text-accent-600 text-sm block truncate"
                    >
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-slate-500 mt-0.5">Variant: {item.variant.name}</p>
                    )}
                    <p className="text-xs font-semibold text-slate-600 mt-1">${price.toFixed(2)} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:text-navy-900 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-1 text-xs font-bold text-slate-900 min-w-[1.8rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:text-navy-900 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[5rem]">
                    <span className="font-bold text-navy-900 text-sm">${itemTotal.toFixed(2)}</span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.product?.name)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <Link to="/shop" className="text-accent-600 font-semibold hover:underline flex items-center gap-1">
              ← Continue Shopping
            </Link>
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Free returns on all orders</span>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Calculations */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Coupon Discount
                  </span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 uppercase font-bold text-[11px]">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">Total Due</span>
                <span className="text-2xl font-black text-navy-900">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon input */}
            <div className="pt-2">
              {couponCode ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{couponCode}</strong> applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCoupon()}
                    className="text-emerald-800 hover:text-emerald-950"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (try BIGSALE)"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase outline-none focus:bg-white focus:border-accent-500"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    isLoading={isApplyingCoupon}
                  >
                    Apply
                  </Button>
                </form>
              )}
            </div>

            {/* Checkout Button */}
            <Button
              variant="accent"
              size="lg"
              className="w-full font-bold shadow-md shadow-blue-600/20"
              onClick={() => navigate('/checkout')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
