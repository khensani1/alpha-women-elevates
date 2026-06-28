import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-brand-text py-16 px-4 border-t border-brand-border" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="text-3xl font-serif font-bold tracking-tighter mb-6 block text-brand-text">
            ALPHA<span className="text-brand-indigo">WOMEN</span> ELEVATES
          </Link>
          <p className="text-brand-text/60 max-w-sm mb-8 leading-relaxed font-serif italic">
            Empowering women through community, mentorship, and collective growth. 
            Join our network of visionary leaders and changemakers.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif text-lg mb-6 text-brand-sunset lowercase italic">Explore</h4>
          <ul className="space-y-4 text-[10px] uppercase tracking-widest text-brand-muted">
            <li><Link to="/about" className="hover:text-brand-sunset transition-colors">About Story</Link></li>
            <li><Link to="/services" className="hover:text-brand-sunset transition-colors">Our Services</Link></li>
            <li><Link to="/community" className="hover:text-brand-sunset transition-colors">Community Hub</Link></li>
            <li><Link to="/shop" className="hover:text-brand-sunset transition-colors">AWE Merchant</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-6 text-brand-sunset lowercase italic">Legal</h4>
          <ul className="space-y-4 text-[10px] uppercase tracking-widest text-brand-muted">
            <li><Link to="/terms" className="hover:text-brand-sunset transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-sunset transition-colors">Privacy Policy (POPIA)</Link></li>
            <li><Link to="/contact" className="hover:text-brand-sunset transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-brand-muted/50">
        <p>&copy; 2026 Alpha Women Elevates. All rights reserved.</p>
        <p className="mt-4 md:mt-0">Design for Excellence</p>
      </div>
    </footer>
  );
}
