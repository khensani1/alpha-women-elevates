import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react'; 
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext'; // Import the cart hook

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems } = useCart() as any; // Destructure cart items to calculate the live count

  // Calculate total item quantity in the cart
  const totalItems = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);

  const navLinks = [
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Community', href: '/community' },
    { name: 'Shop', href: '/shop' },
    { name: 'Gallery', href: '/gallery' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-serif font-bold tracking-tighter text-brand-text">
              Alpha <span className="text-brand-indigo">Women</span> Elevates
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text hover:text-brand-indigo transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Desktop Cart Icon Component with Live Badge */}
            <Link to="/cart" className="relative p-2 text-brand-text hover:text-brand-indigo transition-colors flex items-center">
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-luxury text-brand-text text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Right Actions Alignment */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile Cart Button Option */}
            <Link to="/cart" className="relative p-2 text-brand-text flex items-center">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-brand-luxury text-brand-text text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-brand-text cursor-pointer">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-bg border-b border-brand-border overflow-hidden"
          >
            <div className="px-4 pt-4 pb-12 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-2xl font-serif text-brand-text"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-brand-luxury text-brand-text text-center py-5 text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                Membership Access
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}