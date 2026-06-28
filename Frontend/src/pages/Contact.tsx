import { useState, useEffect } from 'react';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    // Prepare the payload for Formspree
    const payload = {
      ...formData,
      _subject: '📩 New Message from Alpha Women Elevates Website',
      _replyto: formData.email, 
    };

    try {
      // Replace 'YOUR_FORMSPREE_FORM_ID' with the unique ID you get from your Formspree dashboard
      const response = await fetch('https://formspree.io/f/mqevqoyy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <main className="bg-brand-bg text-brand-text min-h-screen py-20 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl mb-4 text-brand-luxury">Contact Us</h1>
        <p className="text-[10px] uppercase tracking-widest text-brand-muted mb-12">Get in touch with the network</p>

        {status === 'success' ? (
          <div className="border border-brand-indigo p-6 bg-brand-bg text-center font-serif italic">
            Thank you for reaching out. Your message has been sent securely.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-2">Full Name</label>
              <input
                type="text"
                name="name" // Essential for Formspree tracking maps
                required
                className="w-full bg-transparent border border-brand-text/30 p-3 text-sm focus:outline-none focus:border-brand-indigo text-brand-text font-sans"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-2">Email Address</label>
              <input
                type="email"
                name="email" // Essential for Formspree tracking maps
                required
                className="w-full bg-transparent border border-brand-text/30 p-3 text-sm focus:outline-none focus:border-brand-indigo text-brand-text font-sans"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-2">Message</label>
              <textarea
                name="message" // Essential for Formspree tracking maps
                rows={5}
                required
                className="w-full bg-transparent border border-brand-text/30 p-3 text-sm focus:outline-none focus:border-brand-indigo text-brand-text font-sans resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-brand-luxury text-brand-text py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-indigo transition-colors cursor-pointer disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'error' && (
              <p className="text-xs font-sans uppercase tracking-wider text-center text-red-500">
                Something went wrong. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}