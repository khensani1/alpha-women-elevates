import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Structural types for the integrated tracking feature
interface OrderItem {
  product_name: string;
  quantity: number;
  size: string;
  color: string;
  price: string;
}

interface Order {
  id: number;
  total_amount: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  items: OrderItem[];
}

export function Cart() {
  const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [searchParams] = useSearchParams();

  // 🔄 New UI States to handle tracking within the Cart page
  const [isTrackingMode, setIsTrackingMode] = useState(false);
  const [trackingEmail, setTrackingEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Clear the cart automatically if redirected back after a successful payment
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      clearCart();
    }
  }, [searchParams, clearCart]);

  // Handle the external PayFast redirection checkout flow
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    if (!customerEmail.trim()) {
      alert('Please enter a valid email address to proceed with your order.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/payfast-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getCartTotal(),
          item_name: `Alpha Women Elevates Order`,
          email_address: customerEmail,
          custom_str1: JSON.stringify(cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            size: item.selectedSize || 'N/A',   
            color: item.selectedColor || 'N/A', 
            price: item.price
          })))
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Payment initialization failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error during checkout.');
      setLoading(false);
    }
  };

  // Handle order tracking API requests right inside the component
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingEmail.trim()) return;

    setTrackingLoading(true);
    setTrackingError('');
    setOrders([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tracking?email=${encodeURIComponent(trackingEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to retrieve track history.');
      }
      setOrders(data.orders);
    } catch (err: any) {
      setTrackingError(err.message);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Helper step function to style delivery status nodes
  const getStatusStepClass = (currentStatus: string, expectedStep: string) => {
    const statuses = ['Processing', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus);
    const expectedIndex = statuses.indexOf(expectedStep);

    if (currentStatus === 'Cancelled') return 'bg-red-500 border-red-500 text-white';
    if (currentIndex >= expectedIndex) return 'bg-brand-luxury text-white border-brand-luxury';
    return 'border-brand-text/20 text-brand-text/40 bg-transparent';
  };

  if (searchParams.get('payment') === 'success') {
    return (
      <main className="bg-brand-bg text-brand-text min-h-screen py-20 px-4 text-center">
        <h1 className="font-serif text-4xl mb-4 text-brand-luxury">Payment Successful!</h1>
        <p className="font-serif italic text-brand-text/80 mb-6">Thank you for your purchase. Your order is being processed.</p>
      </main>
    );
  }

  return (
    <main className="bg-brand-bg text-brand-text min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header containing a contextual mode switcher */}
        <div className="flex justify-between items-baseline border-b border-brand-text/10 pb-6 mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-brand-luxury">
            {isTrackingMode ? 'Track Order' : 'Your Cart'}
          </h1>
          <button
            onClick={() => setIsTrackingMode(!isTrackingMode)}
            className="text-xs font-bold uppercase tracking-widest text-brand-luxury border border-brand-luxury/30 px-4 py-2 hover:bg-brand-luxury hover:text-brand-bg transition-all cursor-pointer"
          >
            {isTrackingMode ? 'Back to Cart' : 'Track an Existing Order'}
          </button>
        </div>

        {/* ----------------- VIEW MODE A: ORDER TRACKING PANEL ----------------- */}
        {isTrackingMode ? (
          <div>
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4 mb-12 max-w-xl">
              <input
                type="email"
                required
                value={trackingEmail}
                onChange={(e) => setTrackingEmail(e.target.value)}
                placeholder="Enter the email used at checkout"
                className="flex-1 bg-transparent border border-brand-text/20 p-3 text-sm focus:outline-none focus:border-brand-luxury text-brand-text placeholder:text-brand-muted"
              />
              <button
                type="submit"
                disabled={trackingLoading}
                className="bg-brand-luxury text-brand-text px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors cursor-pointer disabled:opacity-50"
              >
                {trackingLoading ? 'Searching...' : 'Find Order'}
              </button>
            </form>

            {trackingError && <p className="font-serif italic text-red-500 mb-8 text-sm">{trackingError}</p>}

            <div className="space-y-10">
              {orders.map((order) => (
                <div key={order.id} className="border border-brand-text/10 p-6 bg-brand-luxury/5 rounded-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-brand-text/10 pb-4 mb-4 gap-2">
                    <div>
                      <h3 className="font-sans text-xs font-bold tracking-wider uppercase text-brand-luxury">Ref: AWE-{order.id}</h3>
                      <p className="text-[11px] text-brand-muted mt-0.5">Ordered: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-[11px] font-sans font-bold text-brand-luxury">Total: R{order.total_amount}</span>
                    </div>
                  </div>

                  {order.status !== 'Cancelled' ? (
                    <div className="grid grid-cols-3 gap-2 text-center mb-6 max-w-md mx-auto pt-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[10px] border-2 ${getStatusStepClass(order.status, 'Processing')}`}>1</div>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Processing</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[10px] border-2 ${getStatusStepClass(order.status, 'Shipped')}`}>2</div>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">In Transit</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[10px] border-2 ${getStatusStepClass(order.status, 'Delivered')}`}>3</div>
                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Delivered</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 mb-4 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      This order record has been Cancelled.
                    </div>
                  )}

                  <div className="space-y-2 pt-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-[11px] text-brand-muted">
                        <div>
                          <span className="font-bold uppercase text-brand-text">{item.product_name}</span>
                          <span className="italic ml-2">(Size: {item.size} | Color: {item.color})</span>
                        </div>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          
          // ----------------- VIEW MODE B: STANDARD CART MANIFEST -----------------
          <div>
            {cartItems.length === 0 ? (
              <p className="font-serif italic text-brand-text/60">Your cart is currently empty.</p>
            ) : (
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-brand-text/10 pb-4">
                    <div>
                      <h3 className="font-sans text-sm font-bold uppercase tracking-wider">{item.name}</h3>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-xs text-brand-luxury italic mt-0.5">
                          {item.selectedSize && `Size: ${item.selectedSize}`} 
                          {item.selectedSize && item.selectedColor && ' | '} 
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                        </p>
                      )}
                      <p className="text-xs text-brand-muted mt-1">Qty: {item.quantity} &times; R{item.price}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="font-sans font-bold">R{item.price * item.quantity}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-6 flex justify-between items-center text-xl font-bold font-serif">
                  <span>Total:</span>
                  <span>R{getCartTotal()}</span>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-text/10">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider mb-2">
                    Order Delivery Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Enter your email to track your delivery status"
                    className="w-full bg-transparent border border-brand-text/20 p-3 text-sm focus:outline-none focus:border-brand-luxury text-brand-text placeholder:text-brand-muted"
                  />
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-brand-luxury text-brand-text py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors cursor-pointer disabled:opacity-50 mt-4"
                >
                  {loading ? 'Processing Checkout...' : 'Proceed to checkout'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}