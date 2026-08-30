import { useState, useEffect } from 'react';

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

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to retrieve admin logs.');
      setOrders(data.orders);
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
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Could not update tracking phase.');
      
      // Local state sync to immediately reflect changes on UI
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="text-center py-20 font-serif italic text-neutral-800">Loading Admin Control Hub...</p>;

  return (
    <main className="text-neutral-900 min-h-screen py-20 px-4" style={{ backgroundColor: '#C4BCC7' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-4xl mb-2 text-brand-luxury">AWE Control Hub</h1>
        <p className="font-serif italic text-neutral-700 mb-12">Fulfillment Tracking & Order Operations Board</p>

        {error && <p className="text-red-600 font-serif mb-6">{error}</p>}

        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="border border-neutral-400 p-6 shadow-sm flex flex-col md:flex-row md:justify-between md:items-start gap-6 rounded"
              style={{ backgroundColor: '#C4BCC7' }}
            >
              
              {/* Left Column: Order Metadata & Manifest Items */}
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <h3 className="font-sans text-sm font-bold tracking-wider uppercase text-brand-luxury">Order Ref: AWE-{order.id}</h3>
                  <span className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider border rounded-full ${
                    order.status === 'Delivered' ? 'border-green-600 text-green-700 bg-green-100/50' :
                    order.status === 'Shipped' ? 'border-blue-500 text-blue-700 bg-blue-100/50' : 'border-amber-500 text-amber-800 bg-amber-100/50'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-700 mb-4">Customer: <span className="font-bold text-neutral-900">{order.customer_email}</span></p>

                <div className="space-y-2 border-t border-neutral-400 pt-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-neutral-800">
                      📦 <span className="font-bold">{item.product_name}</span> &times; {item.quantity} 
                      <span className="text-neutral-600 italic ml-2">(Size: {item.size} | Color: {item.color})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Dynamic Tracking Update Triggers */}
              <div className="md:text-right flex flex-col justify-between h-full min-w-[200px] gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-700">Total Amount</p>
                  <p className="font-sans font-bold text-lg text-brand-luxury">R{order.total_amount}</p>
                </div>

                <div className="flex flex-wrap md:justify-end gap-2">
                  {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                      className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-brand-luxury text-white hover:bg-brand-indigo transition-colors cursor-pointer rounded"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                      className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-green-700 text-white hover:bg-green-800 transition-colors cursor-pointer rounded"
                    >
                      Confirm Delivery
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}