import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Community', href: '/community' },
    { name: 'Shop', href: '/shop' },
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
            <div className="flex items-center space-x-6 border-l border-brand-border pl-12">
              <Link to="/shop" className="text-brand-text hover:text-brand-indigo transition-colors">
                <ShoppingBag size={18} />
              </Link>
              <Link to="/login" className="text-brand-text hover:text-brand-indigo transition-colors">
                <User size={18} />
              </Link>
              <Link
                to="/signup"
                className="bg-brand-luxury text-brand-text px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors"
              >
                Join Us
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-brand-text">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
