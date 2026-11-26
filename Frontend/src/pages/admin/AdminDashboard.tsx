import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users,
  UserCheck,
  CreditCard,
  AlertTriangle,
  HeartPulse,
  Trash2,
} from 'lucide-react';

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

interface CrmMember {
  id: number;
  name: string;
  surname: string;
  email: string;
  subscription_status: string;
  last_payment_at: string | null;
  created_at: string;
}

interface CrmStats {
  signedUp: number;
  activeMembers: number;
  paidThisMonth: number;
  fallingBack: number;
  needsIntervention: number;
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const [crmStats, setCrmStats] = useState<CrmStats>({
    signedUp: 0,
    activeMembers: 0,
    paidThisMonth: 0,
    fallingBack: 0,
    needsIntervention: 0,
  });
  const [members, setMembers] = useState<CrmMember[]>([]);
  const [crmLoading, setCrmLoading] = useState(true);
  const [crmError, setCrmError] = useState('');

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
      if (!response.ok) throw new Error(data.error || 'Failed to retrieve admin logs.');
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrm = async () => {
    setCrmLoading(true);
    setCrmError('');
    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/crm`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load CRM.');
      setCrmStats(data.stats);
      setMembers(data.members || []);
    } catch (err: any) {
      setCrmError(err.message);
    } finally {
      setCrmLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCrm();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
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

      if (!response.ok) throw new Error('Could not update order status.');

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Permanently remove this member from the CRM database?')) return;

    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/members/${memberId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not remove member.');
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      await fetchCrm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredOrders =
    filterStatus === 'All' ? orders : orders.filter((o) => o.status === filterStatus);

  const totalRevenue = orders.reduce(
    (acc, curr) => acc + (parseFloat(curr.total_amount) || 0),
    0
  );
  const pendingOrders = orders.filter((o) => o.status === 'Processing').length;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-neutral-900 mb-1">
              AWE Control Hub
            </h1>
            <p className="text-xs text-neutral-700 italic">
              Super admin CRM, fulfillment tracking &amp; order operations
            </p>
          </div>

          <button
            onClick={() => {
              fetchOrders();
              fetchCrm();
            }}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 border border-purple-900/30 text-purple-950 rounded text-xs font-bold tracking-wider uppercase hover:bg-purple-900/10 transition-colors cursor-pointer"
            style={{ backgroundColor: '#E6E0F8' }}
          >
            <RefreshCw size={14} className={loading || crmLoading ? 'animate-spin' : ''} /> Sync
            Workspace
          </button>
        </div>

        {/* CRM ANALYTICS */}
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-800 mb-4 flex items-center gap-2">
            <Users size={14} /> Database Analysis — Basic CRM
          </h2>

          {crmError && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded text-xs mb-4">
              {crmError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[
              {
                label: 'Signed Up',
                value: crmStats.signedUp,
                icon: <Users size={14} />,
                hint: 'All registrations',
              },
              {
                label: 'Active Members',
                value: crmStats.activeMembers,
                icon: <UserCheck size={14} />,
                hint: 'Paid & active',
              },
              {
                label: 'Paid This Month',
                value: crmStats.paidThisMonth,
                icon: <CreditCard size={14} />,
                hint: 'Successful payments',
              },
              {
                label: 'Falling Back',
                value: crmStats.fallingBack,
                icon: <AlertTriangle size={14} />,
                hint: 'Failed / cancelled',
              },
              {
                label: 'Needs Intervention',
                value: crmStats.needsIntervention,
                icon: <HeartPulse size={14} />,
                hint: 'Stuck pending / failed',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="p-5 border border-neutral-300 rounded shadow-sm"
                style={{ backgroundColor: '#E6E0F8' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2 flex items-center gap-2">
                  {card.icon} {card.label}
                </p>
                <p className="font-serif text-3xl font-bold text-neutral-900">
                  {crmLoading ? '—' : card.value}
                </p>
                <p className="text-[10px] text-neutral-600 mt-1 italic">{card.hint}</p>
              </div>
            ))}
          </div>

          {/* Full member list — remove anyone */}
          <div
            className="p-6 border border-neutral-300 rounded shadow-sm"
            style={{ backgroundColor: '#E6E0F8' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-800">
                Member database ({members.length})
              </h3>
              <Link
                to="/admin/members"
                className="text-[10px] font-bold uppercase tracking-widest text-purple-950 underline"
              >
                Open full members manager →
              </Link>
            </div>
            {crmLoading ? (
              <p className="text-xs italic text-neutral-700">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="text-xs italic text-neutral-700">No members in the database.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-neutral-400/60 rounded p-3 bg-purple-100/20"
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {m.name} {m.surname}
                      </p>
                      <p className="text-xs text-neutral-700">{m.email}</p>
                      <p className="text-[10px] uppercase tracking-wider text-amber-900 mt-1">
                        {m.subscription_status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="flex items-center gap-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-800 text-white hover:bg-red-700 rounded cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ORDER METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div
            className="p-6 border border-neutral-300 rounded shadow-sm flex flex-col justify-between"
            style={{ backgroundColor: '#E6E0F8' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2 flex items-center gap-2">
              <Package size={14} /> Total Received
            </p>
            <p className="font-serif text-3xl font-bold text-neutral-900">{orders.length}</p>
          </div>

          <div
            className="p-6 border border-neutral-300 rounded shadow-sm flex flex-col justify-between"
            style={{ backgroundColor: '#E6E0F8' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-2 flex items-center gap-2">
              <Clock size={14} /> Pending Fulfillment
            </p>
            <p className="font-serif text-3xl font-bold text-amber-900">{pendingOrders}</p>
          </div>

          <div
            className="p-6 border border-neutral-300 rounded shadow-sm flex flex-col justify-between"
            style={{ backgroundColor: '#E6E0F8' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-900 mb-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Total Volume
            </p>
            <p className="font-serif text-3xl font-bold text-purple-950">
              R{totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Processing', 'Shipped', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded border transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-purple-950 text-white border-purple-950'
                  : 'text-neutral-800 border-neutral-400 hover:border-purple-900'
              }`}
              style={filterStatus !== status ? { backgroundColor: '#E6E0F8' } : {}}
            >
              {status}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-900 rounded text-xs mb-6">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-neutral-700 font-serif italic">
            Synchronizing order records...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            className="border border-neutral-300 rounded p-12 text-center text-neutral-700 italic"
            style={{ backgroundColor: '#E6E0F8' }}
          >
            No order logs available matching criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 border border-neutral-300 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                style={{ backgroundColor: '#E6E0F8' }}
              >
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs font-bold text-purple-950 bg-purple-200/60 px-2 py-0.5 rounded border border-purple-300">
                      #AWE-{order.id}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded border ${
                        order.status === 'Delivered'
                          ? 'border-emerald-600 text-emerald-900 bg-emerald-100/50'
                          : order.status === 'Shipped'
                            ? 'border-blue-600 text-blue-900 bg-blue-100/50'
                            : 'border-amber-600 text-amber-900 bg-amber-100/50'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-xs text-neutral-700">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-neutral-800">
                    Client:{' '}
                    <span className="text-purple-950 font-normal">{order.customer_email}</span>
                  </p>

                  <div className="border border-neutral-400/60 p-3 rounded space-y-1 bg-purple-100/20">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="text-xs text-neutral-800 flex items-center gap-2">
                        <span>•</span>
                        <span className="font-semibold text-neutral-900">{item.product_name}</span>
                        <span className="text-neutral-600">&times; {item.quantity}</span>
                        <span className="text-neutral-600 text-[11px] italic">
                          ({item.size} / {item.color})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col justify-between items-end gap-4 min-w-[180px] border-t md:border-t-0 pt-4 md:pt-0 border-neutral-400/50">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-700 block">
                      Order Total
                    </span>
                    <span className="font-serif text-2xl font-bold text-purple-950">
                      R{order.total_amount}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                        className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-purple-950 text-white hover:bg-purple-900 transition-colors rounded cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <Truck size={12} /> Ship
                        </span>
                      </button>
                    )}
                    {order.status !== 'Delivered' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-800 text-white hover:bg-emerald-700 transition-colors rounded cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} /> Deliver
                        </span>
                      </button>
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
