import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Briefcase, TrendingUp, Handshake, X } from 'lucide-react';

export function Services() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State Configuration matching the Home page setup
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: ''
  });

  const services = [
    {
      icon: <BookOpen size={32} />,
      title: "Mentorship Programs",
      desc: "Structured guidance from industry leaders and experienced mentors to help you navigate your career and personal growth.",
      benefits: ["1-on-1 Sessions", "Group Coaching", "Curated Resources"]
    },
    {
      icon: <Briefcase size={32} />,
      title: "Business Support",
      desc: "Strategic advice and technical support for member-owned businesses, from scaling operations to digital presence.",
      benefits: ["Strategic Planning", "Networking Access", "Funding Guidance"]
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Empowerment Workshops",
      desc: "Regular workshops focused on skill-building, financial literacy, and personal leadership development.",
      benefits: ["Skill Certifications", "Expert Panels", "Self-Development Tools"]
    },
    {
      icon: <Handshake size={32} />,
      title: "Networking Hub",
      desc: "Instant access to a global network of professional women through our digital community and local chapters.",
      benefits: ["Global Directory", "Exclusive Events", "Collaborative Projects"]
    }
  ];

  // PayFast registration initialization form logic mirrored from the Home page
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/initialize-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.redirectUrl) {
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
    <div className="bg-brand-bg min-h-screen pt-32 pb-24 px-4 text-brand-text">
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-brand-border pb-12">
          <div className="max-w-2xl">
            <span className="section-label mb-6 block text-brand-indigo">Our Offerings</span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-title text-brand-text"
            >
              Empowerment<br />
              <span className="italic opacity-60">Architectures.</span>
            </motion.h1>
          </div>
          <p className="text-lg text-brand-text/70 font-serif italic max-w-xs">
            We provide a comprehensive range of services designed to support your 
            journey at every stage.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t border-brand-border">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-12 border-r border-b border-brand-border group hover:bg-brand-bg-accent/10 transition-colors"
            >
              <div className="text-brand-indigo mb-8">{service.icon}</div>
              <h2 className="text-3xl font-serif mb-6 text-brand-text">{service.title}</h2>
              <p className="text-brand-text/60 mb-10 leading-relaxed font-light">
                {service.desc}
              </p>
              <ul className="space-y-4 mb-12">
                {service.benefits.map(benefit => (
                  <li key={benefit} className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-4 text-brand-text">
                    <div className="w-1 h-1 bg-brand-sunset" />
                    {benefit}
                  </li>
                ))}
              </ul>
              {/* Changed from Link to button layout triggering your membership activation flow modal */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-block border border-brand-text px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-luxury transition-all text-brand-text bg-transparent cursor-pointer"
              >
                Enroll Today
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Synchronized Membership Form Overlay Modal */}
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