import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function Cart() {
  const { cartItems, removeFromCart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Step 4: Clear the cart automatically if redirected back after a successful payment
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      clearCart();
    }
  }, [searchParams, clearCart]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);

    try {
      // 1. Post order details to your Node.js/Express backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/payfast-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getCartTotal(),
          item_name: `AWE Order - ${cartItems.map(i => i.name).join(', ')}`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // 2. Redirect the user directly to PayFast's official payment page
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
        <h1 className="font-serif text-4xl md:text-6xl mb-12 tyranny text-brand-luxury">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="font-serif italic text-brand-text/60">Your cart is currently empty.</p>
        ) : (
          <div className="space-y-8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b border-brand-text/10 pb-4">
                <div>
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider">{item.name}</h3>
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

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-brand-luxury text-brand-text py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors cursor-pointer disabled:opacity-50 mt-8"
            >
              {loading ? 'Processing Checkout...' : 'Proceed to checkout'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}