import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, AppWindow as Window, Star, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Community() {
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);

  const handleRegister = (eventId: number) => {
    if (!registeredEvents.includes(eventId)) {
      setRegisteredEvents([...registeredEvents, eventId]);
    }
  };

  const events = [
    {
      id: 1,
      title: "Quarterly Empowerment Gala",
      date: "24 Jun",
      location: "Johannesburg, SA",
    },
    {
      id: 2,
      title: "Digital Leadership Workshop",
      date: "12 Jul",
      location: "Virtual / Zoom",
    }
  ];

  const highlights = [
    {
      name: "Tersh Kgaphola",
      role: "Founder, Alpha Women Elevates",
      story: "Visionary leader dedicated to creating structured support systems that empower women to transcend local boundaries and achieve global impact.",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=200&h=200"
    },
    
  ];

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
            Celebrate achievements, connect with businesses, and stay updated with 
            upcoming engagements.
          </p>
        </header>

        {/* Member Highlights */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <span className="section-label text-brand-indigo">01 // Member Spotlight</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t border-brand-border">
            {highlights.map((item, i) => (
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

        {/* Events Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-brand-border mb-32">
          <div className="p-12 border-r border-b border-brand-border bg-sunset-gradient text-brand-text">
            <span className="section-label text-brand-text/50 mb-10 block">02 // Calendar</span>
            <h2 className="text-4xl font-serif mb-8 text-brand-text">Upcoming Events</h2>
            <p className="text-brand-text/60 mb-12 font-light leading-relaxed font-serif italic">
              Exclusive gatherings designed for strategic growth and networking.
            </p>
            <Link to="/signup" className="text-[10px] font-bold uppercase tracking-[0.2em] underline decoration-brand-text/30 underline-offset-8 hover:decoration-brand-text transition-all">
              MEMBERSHIP ACCESS →
            </Link>
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-0">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-12 border-r border-b border-brand-border hover:bg-brand-bg-accent/10 transition-colors"
              >
                <div className="text-5xl font-serif mb-6 text-brand-text tracking-tighter">{event.date}</div>
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
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
