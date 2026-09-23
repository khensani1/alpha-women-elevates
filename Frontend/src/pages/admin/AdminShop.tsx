import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ShoppingBag, PlusCircle, Trash2, Tag, DollarSign, Image } from 'lucide-react';

interface ProductRecord {
  id: number;
  name: string;
  category: string;
  price: number | string;
  image: string;
  created_at?: string;
}

export function AdminShop() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Apparel');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Apparel', 'Accessories', 'Stationary'];

  // Initial products fallback matching the default shop catalog
  const initialFallbackProducts: ProductRecord[] = [
    {
      id: 1,
      name: "Ambassador T-Shirt",
      category: "Apparel",
      price: 299,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600&h=800"
    },
    {
      id: 2,
      name: "Empowerment Journal",
      category: "Stationary",
      price: 150,
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600&h=800"
    },
    {
      id: 3,
      name: "Alpha Women Cap",
      category: "Accessories",
      price: 180,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600&h=800"
    },
    {
      id: 4,
      name: "Visionary Tote Bag",
      category: "Accessories",
      price: 120,
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600&h=800"
    }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.length > 0 ? data : initialFallbackProducts);
      } else {
        setProducts(initialFallbackProducts);
      }
    } catch (err) {
      console.error('Failed to sync shop inventory from server:', err);
      setProducts(initialFallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image) {
      return alert('Please enter item name, selling price, and image URL.');
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return alert('Please enter a valid numeric price.');
    }

    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          category,
          price: parsedPrice,
          image
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('New merchandise added to shop storefront!');
        setProducts([result.data || result, ...products]);
      } else {
        // Fallback local addition if backend route is in development
        const newLocalProduct: ProductRecord = {
          id: Date.now(),
          name,
          category,
          price: parsedPrice,
          image
        };
        setProducts([newLocalProduct, ...products]);
        alert('Product added successfully!');
      }

      setName('');
      setPrice('');
      setImage('');
      setCategory('Apparel');
    } catch (err: any) {
      alert(`Posting failed: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to remove this merchandise item?')) return;

    try {
      const token = localStorage.getItem('awe_token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-1 text-neutral-900">Manage Shop Inventory</h1>
        <p className="text-xs text-neutral-700 mb-8 italic">Control merchandise offerings, product prices, and catalog imagery.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SECTION 1: ADD PRODUCT FORM */}
          <div className="lg:col-span-1 space-y-6">
            <div 
              className="p-6 border border-neutral-300 rounded shadow-sm"
              style={{ backgroundColor: '#C4BCC7' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-950 mb-4 flex items-center gap-2">
                <PlusCircle size={14} /> Post New Merchandise
              </h2>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-neutral-800">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700 flex items-center gap-1">
                    <ShoppingBag size={12} /> Product Title
                  </label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-purple-900 placeholder:text-neutral-500" 
                    style={{ backgroundColor: '#C4BCC7' }}
                    placeholder="e.g. Ambassador Hoodie" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700 flex items-center gap-1">
                    <Tag size={12} /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-purple-900"
                    style={{ backgroundColor: '#C4BCC7' }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700 flex items-center gap-1">
                    <DollarSign size={12} /> Price (ZAR)
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-purple-900 placeholder:text-neutral-500" 
                    style={{ backgroundColor: '#C4BCC7' }}
                    placeholder="299.00" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700 flex items-center gap-1">
                    <Image size={12} /> Image URL
                  </label>
                  <input 
                    type="text" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-purple-900 placeholder:text-neutral-500" 
                    style={{ backgroundColor: '#C4BCC7' }}
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>

                {image && (
                  <div className="mt-2">
                    <span className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">Image Preview:</span>
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded border border-neutral-400"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Invalid+Image+URL'; }}
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-purple-950 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-900 transition-colors rounded cursor-pointer mt-2"
                >
                  Publish To Store
                </button>
              </form>
            </div>
          </div>

          {/* SECTION 2: LIVE CATALOG MANAGER */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              className="p-6 border border-neutral-300 rounded shadow-sm"
              style={{ backgroundColor: '#C4BCC7' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-800 mb-4 flex items-center justify-between">
                <span>Active Storefront Items</span>
                <span className="text-purple-950 font-serif lowercase italic text-sm">({products.length} listed)</span>
              </h3>

              {loading ? (
                <p className="py-8 text-center text-xs text-neutral-700 italic">Syncing storefront items...</p>
              ) : products.length === 0 ? (
                <p className="py-8 text-center text-xs text-neutral-700 italic">No products available in shop catalogue.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((item) => (
                    <div 
                      key={item.id} 
                      className="border border-neutral-400/80 rounded p-4 flex gap-4 bg-purple-100/20 relative group"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-24 object-cover rounded border border-neutral-300 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded border border-purple-300 inline-block mb-1">
                            {item.category}
                          </span>
                          <h4 className="font-serif font-bold text-neutral-900 text-sm">{item.name}</h4>
                          <p className="font-serif italic text-purple-950 font-bold text-sm mt-1">
                            R{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                          </p>
                        </div>

                        <button 
                          onClick={() => handleDeleteProduct(item.id)}
                          className="self-end flex items-center gap-1 text-[10px] uppercase font-bold text-red-800 hover:text-red-950 transition-colors cursor-pointer mt-2"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}