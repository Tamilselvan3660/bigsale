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

  const shippingCost = {
    standard: subtotal >= 99 ? 0 : 9.99,
    express: 9.99,
    overnight: 19.99,
  }[shippingMethod];

  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.max(0, total + shippingCost + estimatedTax);

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !addressLine1 || !city || !state || !postalCode) {
      toast.error('Please fill in all required shipping address fields');
      return;
    }
    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const token = localStorage.getItem('bigsale_token');
      if (!token) {
        toast.error('Please login to place an order');
        navigate('/login', { state: { from: { pathname: '/checkout' } } });
        return;
      }

      // If user has a selected address ID, use it. Otherwise use first address or create
      const addressId = selectedAddressId || userAddresses[0]?.id;

      if (!addressId) {
        toast.error('Shipping address ID is required to complete order.');
        setIsPlacingOrder(false);
        return;
      }

      const res = await api.post('/checkout/place-order', {
        shippingAddressId: addressId,
        paymentMethod,
        customerNotes: customerNotes || undefined,
      });

      const order = res.data.data.order;
      toast.success('Order placed successfully! 🎉');
      await clearCart();
      navigate('/order-confirmation', { state: { order } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Your Bag is Empty</h2>
        <p className="text-sm text-slate-500 mb-6">Add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-navy-900 text-white font-bold text-xs px-6 py-3 rounded-xl">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10" />

          {[
            { num: 1, label: 'Address', icon: MapPin },
            { num: 2, label: 'Shipping', icon: Truck },
            { num: 3, label: 'Payment', icon: CreditCard },
            { num: 4, label: 'Review', icon: CheckCircle2 },
          ].map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div key={step.num} className="flex flex-col items-center bg-slate-50 px-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-accent-600 text-white ring-4 ring-blue-100'
                      : 'bg-white border border-slate-300 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs mt-1.5 font-bold ${
                    isCurrent ? 'text-accent-600' : isDone ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Step Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Shipping Address */}
          {currentStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent-600" />
                  <span>Step 1: Shipping Address</span>
                </h2>
                {!user && (
                  <span className="text-xs text-slate-400">
                    Already registered? <Link to="/login" className="text-accent-600 font-semibold underline">Login</Link>
                  </span>
                )}
              </div>

              {/* Saved Address Selection (if any) */}
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
                            ? 'border-accent-600 bg-accent-50/50 ring-2 ring-accent-100'
                            : 'border-slate-200 hover:border-slate-300'
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
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Shipping
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Shipping Method */}
          {currentStep === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-accent-600" />
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
                        ? 'border-accent-600 bg-accent-50/40 ring-2 ring-accent-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === method.id}
                        onChange={() => setShippingMethod(method.id as any)}
                        className="text-accent-600 focus:ring-accent-500 w-4 h-4"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">{method.title}</p>
                          {method.badge && (
                            <span className="text-[10px] font-bold bg-navy-100 text-navy-800 px-2 py-0.5 rounded-full">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{method.duration}</p>
                      </div>
                    </div>
                    <span className="font-bold text-navy-900 text-sm">{method.price}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Address
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  size="md"
                  onClick={() => setCurrentStep(3)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {currentStep === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent-600" />
                  <span>Step 3: Payment Details</span>
                </h2>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
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
                        ? 'border-navy-900 bg-navy-900 text-white'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Mock Card Form */}
              <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Simulated Card Gateway</span>
                  <span className="text-[11px] text-accent-600 font-medium">Test credentials loaded</span>
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
                  Delivery Notes / Instructions (Optional):
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Leave package on front porch behind flower planter"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-accent-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Shipping
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  size="md"
                  onClick={() => setCurrentStep(4)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Place Order */}
          {currentStep === 4 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Step 4: Final Order Review</span>
                </h2>
              </div>

              {/* Review summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Ship To:</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-accent-600 underline font-semibold"
                    >
                      Edit
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

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Method & Payment:</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-accent-600 underline font-semibold"
                    >
                      Edit
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
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{i.quantity}x</span>
                      <span className="text-slate-700 truncate max-w-xs">{i.product?.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      ${((i.variant?.price != null ? Number(i.variant.price) : Number(i.product.price)) * i.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Guaranteed Delivery Protection</p>
                  <p className="text-emerald-700">
                    Your order includes transit insurance and free 30-day hassle-free returns.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(3)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Payment
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  isLoading={isPlacingOrder}
                  onClick={handlePlaceOrder}
                  className="font-bold text-sm px-8 shadow-lg shadow-orange-500/20"
                >
                  Place Order Now (${grandTotal.toFixed(2)})
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 sticky top-28">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              Cart Breakdown ({items.length} items)
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
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon ({couponCode || 'BIGSALE'})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping ({shippingMethod})</span>
                <span className="font-semibold text-slate-900">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Taxes</span>
                <span className="font-semibold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline font-bold">
                <span className="text-slate-900">Total</span>
                <span className="text-xl font-black text-navy-900">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
