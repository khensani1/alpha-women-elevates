import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Package, Truck, CheckCircle2, RefreshCw, MapPin } from 'lucide-react';

interface OrderItem {
  product_name: string;
  quantity: number;
  size: string;
  color: string;
  price: string;
}

interface Order {
  id: number;
  customer_email: string;
  total_amount: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  created_at: string;
  items: OrderItem[];
}

const STATUS_STEPS = ['Processing', 'Shipped', 'Delivered'] as const;

export function AdminTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load tracking board.');
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error('Could not update parcel status.');

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        )
      );

      if (newStatus === 'Shipped') {
        alert('Status updated. The customer has been emailed that their parcel is on its way.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const stepIndex = (status: string) => STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-neutral-900 mb-1">Parcel Tracking</h1>
            <p className="text-xs text-neutral-700 italic">
              Update how far each parcel is. Marking &quot;On its way&quot; emails the customer automatically.
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 border border-purple-900/30 text-purple-950 rounded text-xs font-bold tracking-wider uppercase hover:bg-purple-900/10 transition-colors cursor-pointer"
            style={{ backgroundColor: '#C4BCC7' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-900 rounded text-xs mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-neutral-700 font-serif italic">
            Loading parcel board...
          </div>
        ) : orders.length === 0 ? (
          <div
            className="border border-neutral-300 rounded p-12 text-center text-neutral-700 italic"
            style={{ backgroundColor: '#C4BCC7' }}
          >
            No orders to track yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 border border-neutral-300 rounded shadow-sm"
                style={{ backgroundColor: '#C4BCC7' }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-bold text-purple-950 bg-purple-200/60 px-2 py-0.5 rounded border border-purple-300">
                        #AWE-{order.id}
                      </span>
                      <span className="text-xs text-neutral-700 flex items-center gap-1">
                        <MapPin size={12} /> {order.customer_email}
                      </span>
                      <span className="text-xs text-neutral-600">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <div className="border border-neutral-400/60 p-3 rounded space-y-1 bg-purple-100/20">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="text-xs text-neutral-800">
                          <span className="font-semibold">{item.product_name}</span>
                          <span className="text-neutral-600"> × {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Visual progress for user-facing mirror */}
                    <div className="grid grid-cols-3 gap-2 max-w-md pt-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const current = stepIndex(order.status);
                        const done = current >= idx;
                        return (
                          <div key={step} className="flex flex-col items-center text-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                                done
                                  ? 'bg-purple-950 text-white border-purple-950'
                                  : 'border-neutral-400 text-neutral-500'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-neutral-700">
                              {step === 'Shipped' ? 'On its way' : step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                      Update parcel status
                    </p>
                    {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                        className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-purple-950 text-white hover:bg-purple-900 transition-colors rounded cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Truck size={12} /> On its way (email buyer)
                      </button>
                    )}
                    {order.status !== 'Delivered' && (
                      <button
                        disabled={updatingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-800 text-white hover:bg-emerald-700 transition-colors rounded cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle2 size={12} /> Mark Delivered
                      </button>
                    )}
                    {order.status === 'Delivered' && (
                      <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                        <Package size={14} /> Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
