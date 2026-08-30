import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer 
      className="text-neutral-900 py-16 px-4 border-t border-neutral-300" 
      style={{ backgroundColor: '#C4BCC7' }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="text-3xl font-serif font-bold tracking-tighter mb-6 block text-neutral-900">
            ALPHA<span className="text-brand-indigo">WOMEN</span> ELEVATES
          </Link>
          <p className="text-neutral-700 max-w-sm mb-8 leading-relaxed font-serif italic">
            Empowering women through community, mentorship, and collective growth. 
            Join our network of visionary leaders and changemakers.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-6 text-brand-indigo lowercase italic">Explore</h4>
          <ul className="space-y-4 text-[10px] uppercase tracking-widest text-neutral-700 font-semibold">
            <li><Link to="/about" className="hover:text-brand-indigo transition-colors">About Story</Link></li>
            <li><Link to="/services" className="hover:text-brand-indigo transition-colors">Our Services</Link></li>
            <li><Link to="/community" className="hover:text-brand-indigo transition-colors">Community Hub</Link></li>
            <li><Link to="/shop" className="hover:text-brand-indigo transition-colors">AWE Merchant</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-6 text-brand-indigo lowercase italic">Legal</h4>
          <ul className="space-y-4 text-[10px] uppercase tracking-widest text-neutral-700 font-semibold">
            <li><Link to="/terms" className="hover:text-brand-indigo transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-indigo transition-colors">Privacy Policy (POPIA)</Link></li>
            <li><Link to="/contact" className="hover:text-brand-indigo transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-neutral-300 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-neutral-600">
        <p>&copy; 2020 Alpha Women Elevates. All rights reserved.</p>
        <p className="mt-4 md:mt-0">Design for Excellence</p>
      </div>
    </footer>
  );
}