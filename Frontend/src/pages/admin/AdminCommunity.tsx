import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Calendar, Newspaper } from 'lucide-react';

interface NewsletterRecord {
  id: number;
  title: string;
  created_at: string;
}

interface EventRecord {
  id: number;
  title: string;
  date: string;
  location: string;
}

export function AdminCommunity() {
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState(''); 

  const [newsletters, setNewsletters] = useState<NewsletterRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);

  useEffect(() => {
    const syncWorkspaceData = async () => {
      try {
        const newsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletters`);
        if (newsRes.ok) setNewsletters(await newsRes.json());

        const eventRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events`);
        if (eventRes.ok) setEvents(await eventRes.json());
      } catch (err) {
        console.error('Workspace data synchronization failed:', err);
      }
    };
    syncWorkspaceData();
  }, []);

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return alert('Please enter a title and content.');

    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newsTitle, content: newsContent })
      });

      // Catch raw HTML errors cleanly before processing as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const fallbackRawText = await response.text();
        throw new Error(`Server returned non-JSON payload: ${fallbackRawText.substring(0, 100)}`);
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to publish article.');

      alert('Newsletter published successfully!');
      
      // Handle wrapped or flat backend payload structure safely
      const finalNewsItem = result.data || result;
      setNewsletters([finalNewsItem, ...newsletters]);
      
      setNewsTitle('');
      setNewsContent('');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate || !eventLocation) {
      return alert('Please provide an event name, target date, and physical/virtual location.');
    }

    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: eventTitle, date: eventDate, location: eventLocation })
      });

      // Catch raw HTML errors cleanly before processing as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const fallbackRawText = await response.text();
        throw new Error(`Server returned non-JSON payload: ${fallbackRawText.substring(0, 100)}`);
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to lock event.');

      alert('Upcoming Event posted live!');
      
      // Handle wrapped or flat backend payload structure safely
      const finalEventItem = result.data || result;
      setEvents([finalEventItem, ...events]);

      setEventTitle('');
      setEventDate('');
      setEventLocation('');
    } catch (err: any) {
      alert(`Scheduling failed: ${err.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-2 text-neutral-900">Manage Community Workspace</h1>
        <p className="text-sm text-neutral-700 mb-12">Broadcast newsletters and control upcoming engagement agendas.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* SECTION 1: NEWSLETTERS MANAGER */}
          <div className="space-y-6">
            <div 
              className="p-6 border border-neutral-300 rounded"
              style={{ backgroundColor: '#C4BCC7' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-indigo mb-4 flex items-center gap-2">
                <Newspaper size={14} /> Publish News/Updates
              </h2>
              <form onSubmit={handleCreateNews} className="space-y-4 text-neutral-800">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Article Title</label>
                  <input 
                    type="text" 
                    value={newsTitle} 
                    onChange={(e) => setNewsTitle(e.target.value)} 
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo placeholder:text-neutral-500" 
                    style={{ backgroundColor: '#C4BCC7' }}
                    placeholder="e.g. Scaling Your Business in 2026" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Content Body</label>
                  <textarea 
                    rows={4} 
                    value={newsContent} 
                    onChange={(e) => setNewsContent(e.target.value)} 
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo resize-none placeholder:text-neutral-500" 
                    style={{ backgroundColor: '#C4BCC7' }}
                    placeholder="Write your newsletter insights here..." 
                  />
                </div>
                <button type="submit" className="w-full bg-brand-luxury text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-indigo transition-colors rounded cursor-pointer">
                  Publish Article
                </button>
              </form>
            </div>

            <div 
              className="p-6 border border-neutral-300 rounded"
              style={{ backgroundColor: '#C4BCC7' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-700 mb-4">Published Archives</h3>
              <div className="divide-y divide-neutral-300 text-xs">
                {newsletters.length === 0 ? (
                  <p className="py-2 text-neutral-600 italic">No articles published yet.</p>
                ) : (
                  newsletters.map(news => (
                    <div key={news.id} className="py-3 flex justify-between items-center">
                      <span className="text-neutral-900 font-medium">{news.title}</span>
                      <span className="text-neutral-600">
                        {news.created_at ? new Date(news.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: UPCOMING EVENTS MANAGER */}
          <div className="space-y-6">
            <div 
              className="p-6 border border-neutral-300 rounded"
              style={{ backgroundColor: '#C4BCC7' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-sunset mb-4 flex items-center gap-2">
                <Calendar size={14} /> Schedule Upcoming Event
              </h2>
              <form onSubmit={handleCreateEvent} className="space-y-4 text-neutral-800">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Engagement Name</label>
                  <input 
                    type="text" 
                    value={eventTitle} 
                    onChange={(e) => setEventTitle(e.target.value)} 
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo placeholder:text-neutral-500" 
                    style={{ backgroundColor: '#C4BCC7' }}
                    placeholder="e.g. Annual Summit Gala" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Location / Platform</label>
                  <input 
                    type="text" 
                    value={eventLocation} 
                    onChange={(e) => setEventLocation(e.target.value)} 
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo placeholder:text-neutral-500" 
                    style={{ backgroundColor: '#C4BCC7' }}
                    placeholder="e.g. Johannesburg, SA or Zoom" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Target Date</label>
                  <input 
                    type="date" 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)} 
                    className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo" 
                    style={{ backgroundColor: '#C4BCC7' }}
                  />
                </div>
                <button type="submit" className="w-full bg-brand-sunset text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-colors rounded cursor-pointer">
                  Lock Event Date
                </button>
              </form>
            </div>

            <div 
              className="p-6 border border-neutral-300 rounded"
              style={{ backgroundColor: '#C4BCC7' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-700 mb-4">Live Planned Timelines</h3>
              <div className="divide-y divide-neutral-300 text-xs">
                {events.length === 0 ? (
                  <p className="py-2 text-neutral-600 italic">No upcoming events scheduled.</p>
                ) : (
                  events.map(evt => (
                    <div key={evt.id} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="text-neutral-900 font-medium block">{evt.title}</span>
                        <span className="text-[10px] text-neutral-600">{evt.location}</span>
                      </div>
                      <span className="text-brand-sunset font-bold">{evt.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}