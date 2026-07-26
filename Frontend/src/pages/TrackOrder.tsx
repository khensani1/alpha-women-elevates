import { useState } from 'react';

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

export function TrackOrder() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setOrders([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tracking?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to retrieve track history.');
      }

      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper step function to color-code the delivery timeline step highlights
  const getStatusStepClass = (currentStatus: string, expectedStep: string) => {
    const statuses = ['Processing', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus);
    const expectedIndex = statuses.indexOf(expectedStep);

    if (currentStatus === 'Cancelled') return 'bg-red-500 border-red-500 text-white';
    if (currentIndex >= expectedIndex) return 'bg-brand-luxury text-white border-brand-luxury';
    return 'border-brand-text/20 text-brand-text/40 bg-transparent';
  };

  return (
    <main className="bg-brand-bg text-brand-text min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl mb-4 text-brand-luxury">Track Order</h1>
        <p className="font-serif italic text-brand-text/60 mb-12">Enter the email address you used during purchase to review package transit histories.</p>

        {/* Tracking Lookup Box */}
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-16 max-w-xl">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your tracking email"
            className="flex-1 bg-transparent border border-brand-text/20 p-4 text-sm focus:outline-none focus:border-brand-luxury text-brand-text placeholder:text-brand-muted"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-luxury text-brand-text px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Searching...' : 'Track History'}
          </button>
        </form>

        {/* Error / System Responses */}
        {error && <p className="font-serif italic text-red-500 mb-8">{error}</p>}

        {/* Active Order Results Output */}
        <div className="space-y-12">
          {orders.map((order) => (
            <div key={order.id} className="border border-brand-text/10 p-6 md:p-8 bg-brand-luxury/5 rounded-sm">
              
              {/* Order Header Summary Details */}
              <div className="flex flex-col md:flex-row md:justify-between border-b border-brand-text/10 pb-6 mb-6 gap-4">
                <div>
                  <h3 className="font-sans text-sm font-bold tracking-wider uppercase text-brand-luxury">Order Ref: AWE-{order.id}</h3>
                  <p className="text-xs text-brand-muted mt-1"> Placed on: {new Date(order.created_at).toLocaleDateString()} </p>
                </div>
                <div className="md:text-right">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Total Paid</p>
                  <p className="font-sans font-bold text-xl text-brand-luxury">R{order.total_amount}</p>
                </div>
              </div>

              {/* Delivery Progress Status Timeline */}
              {order.status !== 'Cancelled' ? (
                <div className="grid grid-cols-3 gap-2 text-center mb-10 max-w-2xl mx-auto relative pt-4">
                  
                  {/* Step 1: Processing */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-xs border-2 ${getStatusStepClass(order.status, 'Processing')}`}>1</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Processing</span>
                  </div>

                  {/* Step 2: Shipped */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-xs border-2 ${getStatusStepClass(order.status, 'Shipped')}`}>2</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">In Transit</span>
                  </div>

                  {/* Step 3: Delivered */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-xs border-2 ${getStatusStepClass(order.status, 'Delivered')}`}>3</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Delivered</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 mb-8 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
                  This transaction record has been marked as Cancelled.
                </div>
              )}

              {/* Item Breakdown Sublist */}
              <div>
                <h4 className="font-serif text-sm font-bold mb-4 uppercase tracking-wider text-brand-muted">Manifest Items</h4>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs border-b border-brand-text/5 pb-2">
                      <div>
                        <span className="font-bold uppercase tracking-wide text-brand-luxury">{item.product_name}</span>
                        <p className="text-brand-muted italic mt-0.5">Size: {item.size} | Color: {item.color}</p>
                      </div>
                      <span className="font-sans font-bold text-brand-muted">Qty: {item.quantity} &times; R{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}