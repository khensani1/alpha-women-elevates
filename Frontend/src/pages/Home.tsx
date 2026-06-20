import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';

export function Home() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State Configuration (Only holding secure contact details)
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoinCommunity = async () => {
    try {
      setIsRedirecting(true);
      const response = await fetch('http://localhost:5000/api/community-link');
      const data = await response.json();
      if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      alert("Could not reach server.");
    } finally {
      setIsRedirecting(false);
    }
  };

  // Form Submission Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/initialize-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.redirectUrl) {
        // Redirect the user directly to PayFast's secure billing engine screen
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || "Could not link to payment gateway.");
      }
    } catch (error) {
      alert("Network communication failure with the registration server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden bg-brand-bg text-brand-text">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 md:p-16 flex flex-col justify-center border-r border-brand-border">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="section-label mb-8 block text-brand-indigo">Alpha Women Elevates // Est. 2023</span>
            <h1 className="editorial-title mb-10 text-brand-text">
              Women<br /><span className="italic opacity-60">Elevates.</span>
            </h1>
            <p className="text-xl text-brand-text opacity-70 mb-12 leading-relaxed font-serif italic max-w-lg">
              Empowering a global community of forward-thinking women through mentorship, curated events, and collective commerce.
            </p>
            
            <div className="flex flex-col gap-4">
              <button onClick={handleJoinCommunity} disabled={isRedirecting} className="w-full text-left flex items-center justify-between bg-brand-luxury text-brand-text px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] group border border-brand-border hover:bg-brand-indigo transition-colors disabled:opacity-50 cursor-pointer">
                {isRedirecting ? 'Connecting to Portal...' : 'Join Our Community'}
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full text-left flex items-center justify-between border border-brand-text text-brand-text px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] group hover:bg-brand-luxury transition-colors cursor-pointer"
              >
                Become a Member
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <div className="mt-20 pt-10 border-t border-brand-border text-[10px] uppercase tracking-[0.2em] text-brand-muted">Digital Presence Project / Global Network</div>
          </motion.div>
        </div>

        {/* Right side information board */}
        <div className="hidden md:block relative bg-brand-bg-accent/30 border-l border-brand-border">
          <div className="absolute inset-0 p-16 flex flex-col gap-12 overflow-y-auto">
            <div>
              <span className="section-label mb-6 block text-brand-indigo">Current Impact</span>
              <div className="grid grid-cols-2 gap-8">
                <div className="border-t border-brand-border pt-6">
                  <span className="block text-4xl font-serif text-brand-text">4,280+</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Active Members</span>
                </div>
                <div className="border-t border-brand-border pt-6">
                  <span className="block text-4xl font-serif text-brand-text">500+</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted">Businesses Scaled</span>
                </div>
              </div>
            </div>

            <div className="bg-sunset-gradient text-brand-text p-10 shadow-2xl border border-brand-sunset/20">
              <span className="section-label text-brand-text/50 mb-6 block">Next Engagement</span>
              <div className="text-5xl font-serif mb-4 tracking-tighter text-brand-text">14 Oct</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-text opacity-90">Annual Leadership Summit • Cape Town</div>
              <div className="mt-8">
                <button onClick={handleJoinCommunity} className="text-[10px] font-bold uppercase tracking-[0.2em] underline decoration-brand-text/30 underline-offset-4 hover:decoration-brand-text transition-all bg-transparent border-none cursor-pointer text-brand-text">
                  RSVP ACCESS →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Form Overlay Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-luxury/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-bg w-full max-w-xl max-h-[90vh] overflow-y-auto border border-brand-border shadow-2xl p-8 relative text-brand-luxury"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={20} />
              </button>

              <div className="mb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-text block mb-2">Tier 01 // Premium Membership</span>
                <h3 className="font-serif text-3xl text-brand-indigo">Join the Collective</h3>
                <div className="mt-4 p-4 bg-brand-bg-accent/10 border-l-4 border-brand-text">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold tracking-wide text-brand-text">Monthly Debit Order:</span>
                    <span className="font-serif text-xl font-bold text-brand-text">R 100.00 / mo</span>
                  </div>
                  <p className="text-[11px] text-brand-muted leading-relaxed mt-1">
                    By completing this form, you authorize Alpha Women Elevates to process a recurring monthly debit transaction of R100.00 until cancelled.
                  </p>
                </div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold mb-2">First Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-brand-border p-3 text-sm focus:outline-brand-indigo bg-white text-black" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold mb-2">Surname</label>
                    <input type="text" required value={formData.surname} onChange={(e) => setFormData({...formData, surname: e.target.value})} className="w-full border border-brand-border p-3 text-sm focus:outline-brand-indigo bg-white text-black" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold mb-2">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-brand-border p-3 text-sm focus:outline-brand-indigo bg-white text-black" />
                </div>

                <div className="bg-brand-bg-accent/5 p-4 border border-brand-border rounded text-[11px] text-brand-muted leading-relaxed">
                  🔒 <strong>Secure External Checkout:</strong> To fully safeguard your payment security, clicking below redirects you directly to PayFast's official, POPIA-compliant transaction processor to verify your subscription setup.
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-brand-luxury text-white hover:bg-brand-indigo p-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-50 cursor-pointer">
                  {isSubmitting ? 'Connecting to Secure Checkout...' : 'Accept & Proceed to Payment'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}