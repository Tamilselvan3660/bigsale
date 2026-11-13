import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, discount, total, couponCode, clearCart } = useCart();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Shipping form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'STRIPE' | 'PAYPAL' | 'CASH_ON_DELIVERY'>('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [customerNotes, setCustomerNotes] = useState('');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load user profile & addresses
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('bigsale_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data.data.user;
          if (userData.addresses && userData.addresses.length > 0) {
            setUserAddresses(userData.addresses);
            const defaultAddr = userData.addresses.find((a: any) => a.isDefault) || userData.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setFullName(defaultAddr.fullName || `${userData.firstName} ${userData.lastName}`);
            setPhone(defaultAddr.phone || userData.phone || '');
            setAddressLine1(defaultAddr.addressLine1 || '');
            setAddressLine2(defaultAddr.addressLine2 || '');
            setCity(defaultAddr.city || '');
            setState(defaultAddr.state || '');
            setPostalCode(defaultAddr.postalCode || '');
            setCountry(defaultAddr.country || 'US');
          } else {
            setFullName(`${userData.firstName} ${userData.lastName}`);
            setPhone(userData.phone || '');
          }
        } catch {
          // ignore
        }
      }
    };
    fetchUserData();
  }, []);

  // Shipping cost calculation
  const getShippingCost = () => {
    if (shippingMethod === 'standard') {
      return subtotal >= 99 || subtotal === 0 ? 0 : 9.99;
    }
    if (shippingMethod === 'express') return 9.99;
    if (shippingMethod === 'overnight') return 19.99;
    return 0;
  };

  const shippingCost = getShippingCost();
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.max(0, total + shippingCost + estimatedTax);

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone || '');
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country || 'US');
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      toast.error('Please complete all required shipping fields');
      return;
    }
    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
        },
        shippingMethod,
        paymentMethod,
        customerNotes,
      };

      const res = await api.post('/checkout', orderPayload);
      const createdOrder = res.data.data.order;

      // Clear local/remote cart
      await clearCart();

      toast.success('Order placed successfully! Thank you for shopping with BIGSALE.');
      navigate(`/orders/${createdOrder.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-white border border-[#D9E0E8] rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-4 shadow-sm">
          <ShoppingBag className="w-8 h-8 text-[#FF9900]" />
        </div>
        <h2 className="text-2xl font-black text-[#172337] mb-2">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">You must have items in your cart to checkout.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#FFD814] hover:bg-[#f7ca00] text-[#0F1B2D] font-bold text-xs px-6 py-3 rounded-xl shadow transition-all"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Delivery Address', icon: MapPin },
    { num: 2, label: 'Shipping Method', icon: Truck },
    { num: 3, label: 'Payment Method', icon: CreditCard },
    { num: 4, label: 'Review & Place', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Checkout Header / Breadcrumb Steps */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E0E8] shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-[#D9E0E8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F1B2D] text-[#FF9900] flex items-center justify-center font-black">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#172337]">BIGSALE Express Checkout</h1>
              <p className="text-[11px] text-slate-500">256-bit SSL encrypted checkout guarantee</p>
            </div>
          </div>
          <Link to="/cart" className="text-xs text-[#FF9900] hover:underline font-bold">
            ← Return to Cart
          </Link>
        </div>

        {/* Step indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
          {steps.map((st) => {
            const Icon = st.icon;
            const isDone = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div
                key={st.num}
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-amber-50/80 border border-[#FF9900]/40'
                    : isDone
                    ? 'bg-slate-50 border border-slate-200'
                    : 'opacity-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    isDone
                      ? 'bg-[#168A43] text-white'
                      : isCurrent
                      ? 'bg-[#FF9900] text-[#0F1B2D]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? '✓' : st.num}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Step {st.num}</p>
                  <p className="text-xs font-bold text-[#172337] truncate">{st.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Step Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Shipping Address */}
          {currentStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D9E0E8] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-[#172337] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF9900]" />
                  <span>Step 1: Shipping Address</span>
                </h2>
                {!user && (
                  <span className="text-xs text-slate-400">
                    Already have an account? <Link to="/login" className="text-[#FF9900] font-bold underline">Sign In</Link>
                  </span>
                )}
              </div>

              {/* Saved Address Selection */}
              {userAddresses.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Choose Saved Address:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-[#FF9900] bg-orange-50/50 ring-2 ring-[#FF9900]/20'
                            : 'border-[#D9E0E8] hover:border-slate-400'
                        }`}
                      >
                        <p className="font-bold text-slate-900">{addr.fullName}</p>
                        <p className="text-slate-600">{addr.addressLine1}</p>
                        <p className="text-slate-500">
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-slate-400 text-[11px] mt-1">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form fields */}
              <form onSubmit={handleStep1Next} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Recipient Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    required
                  />
                </div>

                <Input
                  label="Street Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="742 Evergreen Terrace"
                  required
                />

                <Input
                  label="Apartment, Suite, Unit (Optional)"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt 4B"
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Springfield"
                    required
                  />
                  <Input
                    label="State / Region"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Oregon"
                    required
                  />
                  <Input
                    label="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="97477"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-6 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-[#0F1B2D] font-bold text-xs shadow flex items-center gap-2 transition-colors"
                  >
                    <span>Continue to Shipping</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Shipping Method */}
          {currentStep === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D9E0E8] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-[#172337] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#FF9900]" />
                  <span>Step 2: Shipping Method</span>
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'standard',
                    title: 'Standard Courier Shipping',
                    duration: '3-5 Business Days',
                    price: subtotal >= 99 ? 'Free ($0.00)' : '$9.99',
                    badge: subtotal >= 99 ? 'FREE (Orders over $99)' : undefined,
                  },
                  {
                    id: 'express',
                    title: 'Priority Express Delivery',
                    duration: '2 Business Days',
                    price: '$9.99',
                    badge: 'FAST',
                  },
                  {
                    id: 'overnight',
                    title: 'Next-Day Overnight Priority',
                    duration: 'Next Business Day by 12 PM',
                    price: '$19.99',
                    badge: 'PREMIUM',
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      shippingMethod === method.id
                        ? 'border-[#FF9900] bg-orange-50/40 ring-2 ring-[#FF9900]/20'
                        : 'border-[#D9E0E8] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === method.id}
                        onChange={() => setShippingMethod(method.id as any)}
                        className="text-[#FF9900] focus:ring-[#FF9900] w-4 h-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">{method.title}</p>
                          {method.badge && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{method.duration}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#172337] text-sm">{method.price}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Address
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-2.5 px-6 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-[#0F1B2D] font-bold text-xs shadow flex items-center gap-2 transition-colors"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {currentStep === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D9E0E8] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-[#172337] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#FF9900]" />
                  <span>Step 3: Payment Details</span>
                </h2>
                <div className="flex items-center gap-1 text-xs text-[#168A43] font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-bit Encrypted</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'CREDIT_CARD', label: 'Credit Card' },
                  { id: 'STRIPE', label: 'Stripe Pay' },
                  { id: 'PAYPAL', label: 'PayPal' },
                  { id: 'CASH_ON_DELIVERY', label: 'Cash on Deliv.' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                      paymentMethod === pm.id
                        ? 'border-[#0F1B2D] bg-[#0F1B2D] text-white'
                        : 'border-[#D9E0E8] text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Mock Card Form */}
              <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-[#D9E0E8]">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-[#D9E0E8]">
                  <span className="font-semibold text-slate-700">Simulated Secure Gateway</span>
                  <span className="text-[11px] text-[#FF9900] font-bold">Sandbox Credentials Loaded</span>
                </div>

                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  leftIcon={<CreditCard className="w-4 h-4" />}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiration Date"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                  />
                  <Input
                    label="Security Code (CVC)"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Notes / Gate Code (Optional):
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Leave package on front porch behind planter"
                  className="w-full text-xs p-3 bg-slate-50 border border-[#D9E0E8] rounded-xl outline-none focus:border-[#FF9900]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Shipping
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="py-2.5 px-6 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-[#0F1B2D] font-bold text-xs shadow flex items-center gap-2 transition-colors"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Place Order */}
          {currentStep === 4 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D9E0E8] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-black text-[#172337] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#168A43]" />
                  <span>Step 4: Final Order Review</span>
                </h2>
              </div>

              {/* Review summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-[#D9E0E8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#172337]">Shipping Address:</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[#FF9900] underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                  <p className="font-semibold text-slate-800">{fullName}</p>
                  <p className="text-slate-600">{addressLine1}</p>
                  {addressLine2 && <p className="text-slate-600">{addressLine2}</p>}
                  <p className="text-slate-600">
                    {city}, {state} {postalCode}
                  </p>
                  <p className="text-slate-400 mt-1">{phone}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-[#D9E0E8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#172337]">Payment & Method:</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-[#FF9900] underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-slate-700">
                    <strong>Shipping:</strong> {shippingMethod.toUpperCase()} (${shippingCost.toFixed(2)})
                  </p>
                  <p className="text-slate-700 mt-1">
                    <strong>Payment:</strong> {paymentMethod} (Card ending in 4242)
                  </p>
                  {customerNotes && (
                    <p className="text-slate-500 mt-1 italic">&ldquo;{customerNotes}&rdquo;</p>
                  )}
                </div>
              </div>

              {/* Items in review */}
              <div className="divide-y divide-[#D9E0E8] max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#172337]">{i.quantity}x</span>
                      <span className="text-slate-700 truncate max-w-xs">{i.product?.name}</span>
                    </div>
                    <span className="font-bold text-[#172337]">
                      ${((i.variant?.price != null ? Number(i.variant.price) : Number(i.product.price)) * i.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#168A43] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Guaranteed Delivery Protection</p>
                  <p className="text-emerald-700 text-[11px]">
                    Your order includes transit insurance and free 30-day hassle-free returns.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Payment
                </button>

                {/* Amazon-Style Yellow Place Order Button */}
                <button
                  type="button"
                  disabled={isPlacingOrder}
                  onClick={handlePlaceOrder}
                  className="py-3 px-8 rounded-xl bg-[#FFD814] hover:bg-[#f7ca00] active:bg-[#f0c14b] text-[#0F1B2D] font-black text-sm shadow transition-all flex items-center gap-2"
                >
                  <span>Place Your Order (${grandTotal.toFixed(2)})</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#D9E0E8] shadow-sm space-y-4 sticky top-28">
            <h3 className="font-bold text-[#172337] text-sm pb-3 border-b border-slate-100">
              Order Summary ({items.length} items)
            </h3>

            {/* Thumbnail items */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {items.map((i) => {
                const img =
                  i.product?.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80';
                return (
                  <div key={i.id} className="flex items-center gap-3 text-xs">
                    <img src={img} alt="item" className="w-10 h-10 object-contain rounded-lg border border-slate-100 p-1" />
                    <div className="flex-1 truncate">
                      <p className="font-medium text-slate-800 truncate">{i.product?.name}</p>
                      <p className="text-slate-400">Qty: {i.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ${((i.variant?.price != null ? Number(i.variant.price) : Number(i.product.price)) * i.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cost breakdown */}
            <div className="pt-3 border-t border-[#D9E0E8] space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#168A43] font-bold">
                  <span>Coupon Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Handling</span>
                <span className="font-semibold text-slate-900">
                  {shippingCost === 0 ? <span className="text-[#168A43] font-bold uppercase text-[11px]">Free</span> : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Taxes (8%)</span>
                <span className="font-semibold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-[#D9E0E8] flex justify-between items-baseline font-bold">
                <span className="text-[#172337] text-sm">Order Total</span>
                <span className="text-2xl font-black text-[#172337]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
