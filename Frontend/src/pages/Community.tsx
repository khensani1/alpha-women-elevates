import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, CheckCircle2, X, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  price?: number; 
}

interface NewsletterItem {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export function Community() {
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration Modal State
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [formData, setFormData] = useState({ name: '', surname: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post-Booking Upsell State
  const [showSubscribeUpsell, setShowSubscribeUpsell] = useState(false);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const eventsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events`);
        if (eventsResponse.ok) setEvents(await eventsResponse.json());

        const newsletterResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletters`);
        if (newsletterResponse.ok) setNewsletters(await newsletterResponse.json());
      } catch (err) {
        console.error("Failed to sync community feeds:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  const openRegistrationModal = (event: EventItem) => {
    setSelectedEvent(event);
    setFormData({ name: '', surname: '', email: '' });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !formData.name || !formData.surname || !formData.email) {
      return alert('Please fill in your name, surname, and email.');
    }

    setIsSubmitting(true);

    try {
      // Send payload to backend booking endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          eventPrice: selectedEvent.price || 0,
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to process event booking.');

      // If event requires payment and backend generated a PayFast payment link/form
      if (selectedEvent.price && selectedEvent.price > 0 && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      // If free event or direct payment completion:
      setRegisteredEvents([...registeredEvents, selectedEvent.id]);
      const isMember = result.isRegisteredMember;

      setSelectedEvent(null);

      // Trigger post-booking upsell popup if the user is NOT a registered member
      if (!isMember) {
        setShowSubscribeUpsell(true);
      } else {
        alert('🎉 Booking successful! Your event ticket has been emailed to you.');
      }

    } catch (err: any) {
      alert(`Registration Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const highlights = [
    {
      name: "Tersh Kgaphola",
      role: "Founder, Alpha Women Elevates",
      story: "Visionary leader dedicated to creating structured support systems that empower women to transcend local boundaries and achieve global impact.",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=200&h=200"
    },
  ];

  if (loading) return <p className="text-center py-20 font-serif italic text-brand-text/60">Syncing Digest feeds...</p>;

  return (
    <div className="bg-brand-bg min-h-screen pt-32 pb-24 px-4 overflow-hidden text-brand-text">
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row justify-between items-baseline gap-8 border-b border-brand-border pb-12">
          <div>
            <span className="section-label mb-6 block text-brand-indigo">Community & Engagements</span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-title text-brand-text"
            >
              The <span className="italic opacity-60">Digest.</span>
            </motion.h1>
          </div>
          <p className="text-lg text-brand-text opacity-70 font-serif italic max-w-sm">
            Celebrate achievements, connect with businesses, and stay updated with upcoming engagements.
          </p>
        </header>

        {/* Member Highlights */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <span className="section-label text-brand-indigo">01 // Member Spotlight</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t border-brand-border">
            {highlights.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-12 border-r border-b border-brand-border flex flex-col sm:flex-row gap-10 bg-brand-bg-accent/5 backdrop-blur-sm"
              >
                <div className="w-24 h-24 bg-brand-luxury/40 shrink-0 border border-brand-border">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale brightness-75" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif mb-2 text-brand-text">{item.name}</h3>
                  <span className="text-[10px] font-bold text-brand-sunset uppercase tracking-[0.1em] block mb-4">{item.role}</span>
                  <p className="text-brand-text/60 italic font-serif leading-relaxed">"{item.story}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Dynamic Newsletters/Updates Section */}
        {newsletters.length > 0 && (
          <section className="mb-32">
            <span className="section-label text-brand-indigo mb-12 block">02 // Latest Articles & Updates</span>
            <div className="space-y-8 max-w-4xl">
              {newsletters.map((article) => (
                <div key={article.id} className="border-b border-brand-border pb-6">
                  <h3 className="text-2xl font-serif text-brand-luxury mb-2">{article.title}</h3>
                  <p className="text-xs text-brand-muted mb-3">{new Date(article.created_at).toLocaleDateString()}</p>
                  <p className="text-sm font-sans text-brand-text/80 leading-relaxed whitespace-pre-wrap">{article.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Events Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-brand-border mb-32">
          <div className="p-12 border-r border-b border-brand-border bg-sunset-gradient text-brand-text">
            <span className="section-label text-brand-text/50 mb-10 block">03 // Calendar</span>
            <h2 className="text-4xl font-serif mb-8 text-brand-text">Upcoming Events</h2>
            <p className="text-brand-text/60 mb-12 font-light leading-relaxed font-serif italic">
              Exclusive gatherings designed for strategic growth and networking.
            </p>
            <Link to="/signup" className="text-[10px] font-bold uppercase tracking-[0.2em] underline decoration-brand-text/30 underline-offset-8 hover:decoration-brand-text transition-all">
              MEMBERSHIP ACCESS →
            </Link>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-0">
            {events.length === 0 ? (
              <p className="p-12 text-xs italic text-brand-muted border-r border-b border-brand-border">No upcoming events listed at this stage.</p>
            ) : (
              events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="p-12 border-r border-b border-brand-border hover:bg-brand-bg-accent/10 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="text-3xl font-serif mb-6 text-brand-text tracking-tighter">
                      {event.date.includes('-') ? new Date(event.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : event.date}
                    </div>
                    <h3 className="text-xl font-serif mb-2 text-brand-text">{event.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.1em] text-brand-muted font-bold mb-4">
                      <MapPin size={12} className="text-brand-indigo" />
                      {event.location}
                    </div>
                    {event.price && event.price > 0 ? (
                      <span className="text-xs font-bold text-brand-luxury bg-brand-luxury/10 px-2 py-1 rounded inline-block">
                        R{event.price} Entry
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                        Free Access
                      </span>
                    )}
                  </div>

                  <div className="mt-10 pt-6 border-t border-brand-border">
                    <button 
                      onClick={() => openRegistrationModal(event)}
                      className={`text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group transition-colors ${
                        registeredEvents.includes(event.id) ? 'text-green-600' : 'text-brand-text hover:text-brand-sunset'
                      }`}
                    >
                      {registeredEvents.includes(event.id) ? (
                        <>
                          Booked / Pass Issued
                          <CheckCircle2 size={14} />
                        </>
                      ) : (
                        <>
                          Register Access
                          <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform text-brand-sunset" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* MODAL 1: REGISTRATION & TICKET FORM */}
        <AnimatePresence>
          {selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md p-8 border border-neutral-300 rounded shadow-2xl relative"
                style={{ backgroundColor: '#C4BCC7' }}
              >
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-900"
                >
                  <X size={20} />
                </button>

                <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-1">Reserve Your Spot</h2>
                <p className="text-xs text-neutral-700 mb-6 font-medium">Event: <span className="font-bold">{selectedEvent.title}</span></p>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">First Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-neutral-400 p-2.5 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo"
                      style={{ backgroundColor: '#C4BCC7' }}
                      placeholder="e.g. Lerato"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Surname</label>
                    <input 
                      type="text" 
                      required
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      className="w-full border border-neutral-400 p-2.5 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo"
                      style={{ backgroundColor: '#C4BCC7' }}
                      placeholder="e.g. Mokoena"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-neutral-400 p-2.5 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo"
                      style={{ backgroundColor: '#C4BCC7' }}
                      placeholder="e.g. lerato@example.com"
                    />
                  </div>

                  <div className="pt-4 border-t border-neutral-400 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">Total payable:</span>
                    <span className="text-base font-serif font-bold text-brand-luxury">
                      {selectedEvent.price && selectedEvent.price > 0 ? `R${selectedEvent.price}` : 'FREE'}
                    </span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-brand-luxury text-white py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-indigo transition-colors rounded cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : selectedEvent.price && selectedEvent.price > 0 ? (
                      <>
                        Proceed to Checkout <CreditCard size={14} />
                      </>
                    ) : (
                      'Confirm & Get Free Pass'
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: NON-MEMBER SUBSCRIPTION UPSELL */}
        <AnimatePresence>
          {showSubscribeUpsell && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-md p-8 border border-neutral-300 rounded shadow-2xl relative text-center"
                style={{ backgroundColor: '#C4BCC7' }}
              >
                <button 
                  onClick={() => setShowSubscribeUpsell(false)}
                  className="absolute top-4 right-4 text-neutral-600 hover:text-neutral-900"
                >
                  <X size={20} />
                </button>

                <div className="w-12 h-12 bg-brand-indigo/20 text-brand-indigo rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} />
                </div>

                <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Ticket Issued Successfully! 🎉</h3>
                <p className="text-xs text-neutral-800 leading-relaxed mb-6">
                  We sent your event entry pass to your email. We noticed you aren't an official subscriber yet! Join our network to unlock full community access, event discounts, and newsletter digests.
                </p>

                <div className="space-y-3">
                  <Link 
                    to="/signup" 
                    onClick={() => setShowSubscribeUpsell(false)}
                    className="block w-full bg-brand-luxury text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-indigo transition-colors rounded"
                  >
                    Become an Official Member
                  </Link>
                  <button 
                    onClick={() => setShowSubscribeUpsell(false)}
                    className="block w-full text-[10px] font-bold uppercase tracking-wider text-neutral-700 hover:underline py-2"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}