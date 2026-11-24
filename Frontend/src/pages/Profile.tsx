import { useState } from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

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

export function Profile() {
  const [memberEmail, setMemberEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleFetchMemberOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setLoadingOrders(true);
    setOrderError('');
    setIsSearching(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tracking?email=${encodeURIComponent(memberEmail.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'No order records found for this email.');
      }
      setOrders(data.orders || []);
    } catch (err: any) {
      setOrderError(err.message);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusStepClass = (currentStatus: string, expectedStep: string) => {
    const statuses = ['Processing', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(currentStatus);
    const expectedIndex = statuses.indexOf(expectedStep);

    if (currentStatus === 'Cancelled') return 'bg-red-500 border-red-500 text-white';
    if (currentIndex >= expectedIndex) return 'bg-brand-luxury text-white border-brand-luxury';
    return 'border-brand-text/20 text-brand-text/40 bg-transparent';
  };

  return (
    <main className="bg-brand-bg text-brand-text min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-brand-text/10 pb-8 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-luxury font-bold">
            Member Portal
          </h1>
          <p className="text-xs text-brand-muted mt-2 italic">
            Access your purchase history and live delivery status. Newsletter archives now live on
            the{' '}
            <Link to="/community" className="text-brand-luxury underline underline-offset-2">
              Community
            </Link>{' '}
            page.
          </p>
        </div>

        <div className="flex border-b border-brand-text/10 mb-8 space-x-8">
          <div className="flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest border-b-2 border-brand-luxury text-brand-luxury">
            <Package size={16} /> Past Orders
          </div>
        </div>

        <div className="space-y-8">
          <form
            onSubmit={handleFetchMemberOrders}
            className="bg-brand-luxury/5 p-6 border border-brand-text/10 rounded-sm"
          >
            <label
              htmlFor="memberEmail"
              className="block text-xs font-bold uppercase tracking-wider mb-2 text-brand-text"
            >
              Verify Member Email
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="memberEmail"
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Enter your checkout email"
                className="flex-1 bg-transparent border border-brand-text/20 p-3 text-sm focus:outline-none focus:border-brand-luxury text-brand-text placeholder:text-brand-muted"
              />
              <button
                type="submit"
                disabled={loadingOrders}
                className="bg-brand-luxury text-brand-text px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors cursor-pointer disabled:opacity-50"
              >
                {loadingOrders ? 'Loading...' : 'Find History'}
              </button>
            </div>
          </form>

          {orderError && (
            <p className="text-sm font-serif italic text-red-500 bg-red-500/10 p-4 border border-red-500/20 rounded-sm">
              {orderError}
            </p>
          )}

          {isSearching && orders.length === 0 && !loadingOrders && !orderError && (
            <p className="text-sm font-serif italic text-brand-muted">
              No orders associated with this email address.
            </p>
          )}

          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-brand-text/10 p-6 bg-brand-luxury/5 rounded-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-brand-text/10 pb-4 gap-2">
                  <div>
                    <span className="font-sans text-xs font-bold tracking-wider uppercase text-brand-luxury">
                      Order Ref: AWE-{order.id}
                    </span>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Placed: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-luxury">
                      Total: R{order.total_amount}
                    </span>
                  </div>
                </div>

                {order.status !== 'Cancelled' ? (
                  <div className="grid grid-cols-3 gap-2 text-center my-4 max-w-md mx-auto">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[10px] border-2 ${getStatusStepClass(order.status, 'Processing')}`}
                      >
                        1
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest mt-1">
                        Processing
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[10px] border-2 ${getStatusStepClass(order.status, 'Shipped')}`}
                      >
                        2
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest mt-1">
                        On its way
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[10px] border-2 ${getStatusStepClass(order.status, 'Delivered')}`}
                      >
                        3
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest mt-1">
                        Delivered
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    Order Cancelled
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-brand-text/10">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs text-brand-muted"
                    >
                      <div>
                        <span className="font-bold text-brand-text">{item.product_name}</span>
                        <span className="italic text-[10px] ml-2">
                          (Size: {item.size} | Color: {item.color})
                        </span>
                      </div>
                      <span>
                        Qty: {item.quantity} &times; R{item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
