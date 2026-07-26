import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Structure interfaces matching your PostgreSQL backend schema
interface EventItem {
  id: number;
  title: string;
  date: string; // or event_date depending on backend naming
  location: string;
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

  // 📡 Fetch live backend records on mount
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // 1. Grab events (Make sure you have an event fetching route or use the newsletter/products structure)
        const eventsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
        }

        // 2. Grab published newsletters
        const newsletterResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletters`);
        if (newsletterResponse.ok) {
          const newsletterData = await newsletterResponse.json();
          setNewsletters(newsletterData);
        }
      } catch (err) {
        console.error("Failed to sync public community feeds:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  const handleRegister = (eventId: number) => {
    if (!registeredEvents.includes(eventId)) {
      setRegisteredEvents([...registeredEvents, eventId]);
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
                  className="p-12 border-r border-b border-brand-border hover:bg-brand-bg-accent/10 transition-colors"
                >
                  <div className="text-3xl font-serif mb-6 text-brand-text tracking-tighter">
                    {/* Safely handles formatting dates like 12 Jul or 2026-07-12 */}
                    {event.date.includes('-') ? new Date(event.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : event.date}
                  </div>
                  <h3 className="text-xl font-serif mb-4 text-brand-text">{event.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.1em] text-brand-muted font-bold">
                    <MapPin size={12} className="text-brand-indigo" />
                    {event.location}
                  </div>
                  <div className="mt-10 pt-6 border-t border-brand-border">
                    <button 
                      onClick={() => handleRegister(event.id)}
                      className={`text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 group transition-colors ${
                        registeredEvents.includes(event.id) ? 'text-green-500' : 'text-brand-text hover:text-brand-sunset'
                      }`}
                    >
                      {registeredEvents.includes(event.id) ? (
                        <>
                          Successfully Registered
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
      </div>
    </div>
  );
}