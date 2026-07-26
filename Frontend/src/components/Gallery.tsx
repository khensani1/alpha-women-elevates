import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Loader2 } from 'lucide-react';

interface GalleryItem {
  id: number;
  title: string;
  location: string;
  image_url: string;
  event_date: string;
  day: string;
  month: string;
  year: string;
}

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery`);
        if (!response.ok) throw new Error('Failed to fetch gallery records.');
        const data = await response.json();

        // Map incoming DB formats to standard presentation objects
        const formattedData = data.map((item: any) => {
          const dateObj = new Date(item.event_date);
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          return {
            id: item.id,
            title: item.title,
            location: item.location,
            image_url: item.image_url,
            event_date: item.event_date,
            day: String(dateObj.getDate()).padStart(2, '0'),
            month: months[dateObj.getMonth()],
            year: String(dateObj.getFullYear())
          };
        });

        setItems(formattedData);
      } catch (err) {
        console.error("Gallery sync breakdown:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  } [], []);

  const uniqueYears = ['All', ...new Set(items.map(event => event.year))];

  const filteredEvents = selectedYear === 'All'
    ? items
    : items.filter(event => event.year === selectedYear);

  if (loading) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center text-brand-text">
        <Loader2 className="animate-spin text-brand-indigo" size={32} />
      </div>
    );
  }

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
                  src={event.image_url.startsWith('http') ? event.image_url : `${import.meta.env.VITE_API_URL}${event.image_url}`} 
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