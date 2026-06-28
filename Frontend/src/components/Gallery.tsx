import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin } from 'lucide-react';

export function Gallery() {
  // 1. Organize your event data with explicit year, month, and description structures
  const galleryEvents = [
    {
      id: 1,
      title: "Annual Leadership Summit",
      location: "Cape Town",
      day: "14",
      month: "October",
      year: "2025",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "Women in Tech Networking Mixer",
      location: "Johannesburg",
      day: "22",
      month: "August",
      year: "2025",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Entrepreneurship Masterclass",
      location: "Pretoria",
      day: "05",
      month: "August",
      year: "2025",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 4,
      title: "Financial Literacy Strategy Gala",
      location: "Durban",
      day: "11",
      month: "March",
      year: "2024",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=800"
    }
  ];

  // Extract unique years for the filter bar pipeline
  const uniqueYears = ['All', ...new Set(galleryEvents.map(event => event.year))];
  const [selectedYear, setSelectedYear] = useState('All');

  // Filter logic matching your design specifications
  const filteredEvents = selectedYear === 'All'
    ? galleryEvents
    : galleryEvents.filter(event => event.year === selectedYear);

  return (
    <div className="bg-brand-bg min-h-screen pt-32 pb-24 px-4 text-brand-text">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-brand-border pb-12">
          <div className="max-w-2xl">
            <span className="section-label mb-6 block text-brand-indigo">Our Journey</span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-title text-brand-text"
            >
              The <span className="italic opacity-60">Archive.</span>
            </motion.h1>
          </div>
          
          {/* Year Timeline Filter Pipeline */}
          <div className="flex flex-wrap gap-8">
            {uniqueYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative cursor-pointer ${
                  selectedYear === year 
                    ? 'text-brand-text after:content-[""] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-[1px] after:bg-brand-sunset' 
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </header>

        {/* Gallery Dynamic Timeline Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-brand-border">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-r border-b border-brand-border p-6 hover:bg-brand-bg-accent/10 transition-colors group flex flex-col justify-between"
            >
              {/* Image Frame Container */}
              <div className="relative aspect-video w-full overflow-hidden mb-6 bg-brand-luxury/20">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-90"
                  referrerPolicy="no-referrer"
                />
                
                {/* Float Badge Showing Month/Day Layer */}
                <div className="absolute top-4 left-4 bg-brand-bg/90 backdrop-blur-md px-4 py-2 text-center border border-brand-border">
                  <span className="block text-xl font-serif font-bold text-brand-text leading-none">{event.day}</span>
                  <span className="text-[8px] uppercase tracking-widest text-brand-muted font-bold">{event.month.substring(0, 3)}</span>
                </div>
              </div>

              {/* Text Layout Metadata Info */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-brand-indigo">
                  <Calendar size={12} />
                  <span className="text-[9px] uppercase tracking-widest font-semibold">
                    {event.month} {event.year}
                  </span>
                </div>
                
                <h3 className="text-2xl font-serif mb-4 text-brand-text group-hover:text-brand-indigo transition-colors">
                  {event.title}
                </h3>
                
                <div className="flex items-center gap-1 text-brand-muted text-xs font-light">
                  <MapPin size={12} className="text-brand-sunset" />
                  <span>{event.location}, ZA</span>
                </div>
              </div>
              
            </motion.div>
          ))}
        </div>

        {/* Empty State fallback view */}
        {filteredEvents.length === 0 && (
          <p className="text-center font-serif italic text-brand-text/40 py-20">
            No memories archived for this period yet.
          </p>
        )}

      </div>
    </div>
  );
}