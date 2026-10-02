import { useState, useEffect } from 'react';
import { Package, Newspaper, Mail, Calendar, ChevronRight, ExternalLink } from 'lucide-react';

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

interface Newsletter {
  id: number;
  title: string;
  excerpt: string;
  content_url?: string;
  published_at: string;
}

export function Profile() {
  const [activeTab, setActiveTab] = useState<'orders' | 'newsletters'>('orders');
  
  // User session & query states
  const [memberEmail, setMemberEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  
  // Loading & Error states
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingNewsletters, setLoadingNewsletters] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Auto-fetch public newsletter archives on component mount
  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    setLoadingNewsletters(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newsletters`);
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data.newsletters || data || []);
      }
    } catch (err) {
      console.error('Failed to load newsletters archive:', err);
    } finally {
      setLoadingNewsletters(false);
    }
  };

  const handleFetchMemberOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setLoadingOrders(true);
    setOrderError('');
    setIsSearching(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tracking?email=${encodeURIComponent(memberEmail.trim())}`);
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
        
        {/* PROFILE HEADER */}
        <div className="border-b border-brand-text/10 pb-8 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-luxury font-bold">Member Portal</h1>
          <p className="text-xs text-brand-muted mt-2 italic">
            Access your purchase history, delivery statuses, and official Alpha Women Elevates publication archives.
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-brand-text/10 mb-8 space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
              activeTab === 'orders'
                ? 'border-brand-luxury text-brand-luxury'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            <Package size={16} /> Past Orders
          </button>

          <button
            onClick={() => setActiveTab('newsletters')}
            className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
              activeTab === 'newsletters'
                ? 'border-brand-luxury text-brand-luxury'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            <Newspaper size={16} /> Newsletter Archives
          </button>
        </div>

        {/* =---------------- TAB 1: PAST ORDERS ----------------= */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            
            {/* Email Verification Form */}
            <form onSubmit={handleFetchMemberOrders} className="bg-brand-luxury/5 p-6 border border-brand-text/10 rounded-sm">
              <label htmlFor="memberEmail" className="block text-xs font-bold uppercase tracking-wider mb-2 text-brand-text">
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

            {/* Orders List */}
            {isSearching && orders.length === 0 && !loadingOrders && !orderError && (
              <p className="text-sm font-serif italic text-brand-muted">No orders associated with this email address.</p>
            )}

            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-brand-text/10 p-6 bg-brand-luxury/5 rounded-sm space-y-4">
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
                      <span className="text-xs font-bold text-brand-luxury">Total: R{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Delivery Status Progression */}
                  {order.status !== 'Cancelled' ? (
                    <div className="grid grid-cols-3 gap-2 text-center my-4 max-w-md mx-auto">
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
                    <div className="text-center py-2 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                      Order Cancelled
                    </div>
                  )}

                  {/* Items Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-brand-text/10">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-brand-muted">
                        <div>
                          <span className="font-bold text-brand-text">{item.product_name}</span>
                          <span className="italic text-[10px] ml-2">(Size: {item.size} | Color: {item.color})</span>
                        </div>
                        <span>Qty: {item.quantity} &times; R{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* =---------------- TAB 2: NEWSLETTER ARCHIVES ----------------= */}
        {activeTab === 'newsletters' && (
          <div className="space-y-6">
            {loadingNewsletters ? (
              <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">Loading newsletter archives...</p>
            ) : newsletters.length === 0 ? (
              <p className="text-sm font-serif italic text-brand-muted">No published newsletters found in the archive.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {newsletters.map((nl) => (
                  <article key={nl.id} className="p-6 border border-brand-text/10 bg-brand-luxury/5 rounded-sm space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(nl.published_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Mail size={12} /> Official Broadcast</span>
                    </div>

                    <h2 className="font-serif text-xl font-bold text-brand-luxury">{nl.title}</h2>
                    <p className="text-xs text-brand-muted leading-relaxed">{nl.excerpt}</p>

                    {nl.content_url && (
                      <a
                        href={nl.content_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-luxury hover:underline pt-2"
                      >
                        Read Full Edition <ExternalLink size={12} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}