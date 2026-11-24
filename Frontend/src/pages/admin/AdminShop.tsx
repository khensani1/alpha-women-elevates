import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  ShoppingBag,
  PlusCircle,
  Trash2,
  Tag,
  DollarSign,
  Image,
  Pencil,
  PackageX,
  PackageCheck,
  X,
} from 'lucide-react';

interface ProductRecord {
  id: number;
  name: string;
  category: string;
  price: number | string;
  image_url?: string;
  image?: string;
  description?: string;
  is_available?: boolean;
  created_at?: string;
}

const API = import.meta.env.VITE_API_URL;

export function AdminShop() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Apparel');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Apparel');
  const [editPrice, setEditPrice] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const categories = ['Apparel', 'Accessories', 'Stationary'];

  const productImage = (p: ProductRecord) => p.image_url || p.image || '';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/admin/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to sync shop inventory from server:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const authHeaders = () => {
    const token = localStorage.getItem('awe_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

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
      const response = await fetch(`${API}/api/admin/products`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name,
          category,
          price: parsedPrice,
          image,
          description,
          is_available: true,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create product.');

      alert('New merchandise added to shop storefront!');
      setProducts([result.data || result, ...products]);
      setName('');
      setPrice('');
      setImage('');
      setDescription('');
      setCategory('Apparel');
    } catch (err: any) {
      alert(`Posting failed: ${err.message}`);
    }
  };

  const openEdit = (item: ProductRecord) => {
    setEditing(item);
    setEditName(item.name);
    setEditCategory(item.category || 'Apparel');
    setEditPrice(String(item.price));
    setEditImage(productImage(item));
    setEditDescription(item.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const parsedPrice = parseFloat(editPrice);
    if (!editName || isNaN(parsedPrice)) {
      return alert('Name and valid price are required.');
    }

    try {
      const response = await fetch(`${API}/api/admin/products/${editing.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          name: editName,
          category: editCategory,
          price: parsedPrice,
          image: editImage,
          description: editDescription,
          is_available: editing.is_available !== false,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Update failed.');

      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? result.data : p))
      );
      setEditing(null);
      alert('Product updated. Changes are live on the shop.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkOutOfStock = async (id: number) => {
    if (!confirm('Mark this item as out of stock on the public website?')) return;

    try {
      const response = await fetch(`${API}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update stock.');

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...result.data, is_available: false } : p))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRestock = async (id: number) => {
    try {
      const response = await fetch(`${API}/api/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_available: true }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to restock.');

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...result.data, is_available: true } : p))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-1 text-neutral-900">
          Manage Shop Inventory
        </h1>
        <p className="text-xs text-neutral-700 mb-8 italic">
          Add, change, or mark items out of stock — updates reflect on the public shop.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div
              className="p-6 border border-neutral-300 rounded shadow-sm"
              style={{ backgroundColor: '#E6E0F8' }}
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
                    style={{ backgroundColor: '#E6E0F8' }}
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
                    style={{ backgroundColor: '#E6E0F8' }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
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
                    style={{ backgroundColor: '#E6E0F8' }}
                    placeholder="299.00"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">
                    Short Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-purple-900"
                    style={{ backgroundColor: '#E6E0F8' }}
                    placeholder="Optional"
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
                    style={{ backgroundColor: '#E6E0F8' }}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {image && (
                  <div className="mt-2">
                    <span className="block text-[10px] font-bold uppercase text-neutral-700 mb-1">
                      Image Preview:
                    </span>
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border border-neutral-400"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/300?text=Invalid+Image+URL';
                      }}
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

          <div className="lg:col-span-2 space-y-6">
            <div
              className="p-6 border border-neutral-300 rounded shadow-sm"
              style={{ backgroundColor: '#E6E0F8' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-800 mb-4 flex items-center justify-between">
                <span>Storefront Items</span>
                <span className="text-purple-950 font-serif lowercase italic text-sm">
                  ({products.length} listed)
                </span>
              </h3>

              {loading ? (
                <p className="py-8 text-center text-xs text-neutral-700 italic">
                  Syncing storefront items...
                </p>
              ) : products.length === 0 ? (
                <p className="py-8 text-center text-xs text-neutral-700 italic">
                  No products in the catalogue yet. Add your first item.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((item) => {
                    const inStock = item.is_available !== false;
                    return (
                      <div
                        key={item.id}
                        className="border border-neutral-400/80 rounded p-4 flex gap-4 bg-purple-100/20 relative group"
                      >
                        <img
                          src={productImage(item)}
                          alt={item.name}
                          className={`w-20 h-24 object-cover rounded border border-neutral-300 flex-shrink-0 ${
                            inStock ? '' : 'opacity-40 grayscale'
                          }`}
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap gap-1 mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded border border-purple-300">
                                {item.category}
                              </span>
                              {!inStock && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-red-900 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                                  Out of stock
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif font-bold text-neutral-900 text-sm">
                              {item.name}
                            </h4>
                            <p className="font-serif italic text-purple-950 font-bold text-sm mt-1">
                              R
                              {typeof item.price === 'number'
                                ? item.price.toFixed(2)
                                : item.price}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 justify-end mt-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="flex items-center gap-1 text-[10px] uppercase font-bold text-purple-950 hover:underline cursor-pointer"
                            >
                              <Pencil size={12} /> Change
                            </button>
                            {inStock ? (
                              <button
                                onClick={() => handleMarkOutOfStock(item.id)}
                                className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-800 hover:text-red-950 cursor-pointer"
                              >
                                <PackageX size={12} /> Out of stock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestock(item.id)}
                                className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                              >
                                <PackageCheck size={12} /> Restock
                              </button>
                            )}
                            {inStock && (
                              <button
                                onClick={() => handleMarkOutOfStock(item.id)}
                                className="flex items-center gap-1 text-[10px] uppercase font-bold text-neutral-600 hover:text-red-800 cursor-pointer"
                                title="Remove from active stock"
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
              className="w-full max-w-md p-6 border border-neutral-300 rounded shadow-xl relative"
              style={{ backgroundColor: '#E6E0F8' }}
            >
              <button
                onClick={() => setEditing(null)}
                className="absolute top-3 right-3 text-neutral-600 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
              <h3 className="font-serif text-xl font-bold mb-4 text-neutral-900">
                Change Product
              </h3>
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-neutral-400 p-2 text-xs rounded"
                  style={{ backgroundColor: '#E6E0F8' }}
                  placeholder="Name"
                />
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full border border-neutral-400 p-2 text-xs rounded"
                  style={{ backgroundColor: '#E6E0F8' }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full border border-neutral-400 p-2 text-xs rounded"
                  style={{ backgroundColor: '#E6E0F8' }}
                  placeholder="Price"
                />
                <input
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="w-full border border-neutral-400 p-2 text-xs rounded"
                  style={{ backgroundColor: '#E6E0F8' }}
                  placeholder="Image URL"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-neutral-400 p-2 text-xs rounded"
                  style={{ backgroundColor: '#E6E0F8' }}
                  placeholder="Description"
                />
                <button
                  type="submit"
                  className="w-full bg-purple-950 text-white py-3 text-[10px] font-bold uppercase tracking-widest rounded cursor-pointer"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
