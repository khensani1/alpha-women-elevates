import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export function Shop() {
  const [activeCategory, setActiveCategory] = useState('All');
 const { addToCart } = useCart() as any;
  const navigate = useNavigate();

  // Price converted to pure numbers for accurate math inside your Cart component
  const products = [
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

  const categories = ['All', 'Apparel', 'Accessories', 'Stationary'];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleAddToBag = (product: any) => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="bg-brand-bg min-h-screen pt-32 pb-24 px-4 overflow-hidden text-brand-text">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-8 border-b border-brand-border pb-12">
          <div>
            <span className="section-label mb-4 block text-brand-indigo">Official Merchandise</span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-title text-brand-text"
            >
              The <span className="italic opacity-60">Merchant.</span>
            </motion.h1>
          </div>

          <div className="flex flex-wrap gap-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)} /* FIX 1: Set category instead of adding item to bag */
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
                  activeCategory === cat 
                    ? 'text-brand-text after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[1px] after:bg-brand-sunset' 
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-brand-border">
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group border-r border-b border-brand-border p-8 hover:bg-brand-bg-accent/10 transition-colors"
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-8 bg-brand-luxury/20">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale brightness-75"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {/* FIX 3: Bound onClick to trigger the handleAddToBag route logic */}
                  <button 
                    onClick={() => handleAddToBag(product)}
                    className="w-full bg-brand-luxury text-brand-text py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-brand-sunset/30 hover:bg-brand-indigo transition-colors shadow-[0_0_15px_rgba(204,43,94,0.3)] cursor-pointer"
                  >
                    <ShoppingCart size={14} />
                    Add to Bag
                  </button>
                </div>
              </div>
              <div>
                <span className="section-label mb-2 block text-brand-indigo">{product.category}</span>
                <h3 className="text-xl font-serif mb-2 text-brand-text">{product.name}</h3>
                {/* FIX 2: Render out R cleanly next to the numerical item value */}
                <p className="font-serif italic text-brand-text/60">R{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}