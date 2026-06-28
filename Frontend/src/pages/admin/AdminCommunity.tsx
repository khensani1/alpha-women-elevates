import { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Trash2, Calendar, Newspaper } from 'lucide-react';

export function AdminCommunity() {
  // States for creating a Newsletter
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');

  // States for creating an Upcoming Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Simulated live database states
  const [newsletters, setNewsletters] = useState([
    { id: 1, title: 'June Community Update', date: '2026-06-15' },
  ]);
  const [events, setEvents] = useState([
    { id: 1, title: 'Annual Leadership Summit', date: '2026-10-14' },
  ]);

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return alert('Please enter a title and content.');

    setNewsletters([{ id: Date.now(), title: newsTitle, date: new Date().toISOString().split('T')[0] }, ...newsletters]);
    alert('📰 Newsletter published successfully!');
    setNewsTitle('');
    setNewsContent('');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) return alert('Please provide an event name and date.');

    setEvents([{ id: Date.now(), title: eventTitle, date: eventDate }, ...events]);
    alert('📅 Upcoming Event posted live!');
    setEventTitle('');
    setEventDate('');
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-2">Manage Community Workspace</h1>
        <p className="text-sm text-neutral-400 mb-12">Broadcast newsletters and control upcoming engagement agendas.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* 📰 SECTION 1: NEWSLETTERS MANAGER */}
          <div className="space-y-6">
            <div className="bg-neutral-950 p-6 border border-neutral-800 rounded">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-indigo mb-4 flex items-center gap-2">
                <Newspaper size={14} /> Publish News/Updates
              </h2>
              <form onSubmit={handleCreateNews} className="space-y-4 text-neutral-300">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-400">Article Title</label>
                  <input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs rounded text-white focus:outline-none focus:border-brand-indigo" placeholder="e.g. Scaling Your Business in 2026" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-400">Content Body</label>
                  <textarea rows={4} value={newsContent} onChange={(e) => setNewsContent(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs rounded text-white focus:outline-none focus:border-brand-indigo resize-none" placeholder="Write your newsletter insights here..." />
                </div>
                <button type="submit" className="w-full bg-brand-luxury text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-indigo transition-colors rounded cursor-pointer">
                  Publish Article
                </button>
              </form>
            </div>

            <div className="bg-neutral-950 p-6 border border-neutral-800 rounded">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Published Archives</h3>
              <div className="divide-y divide-neutral-800 text-xs">
                {newsletters.map(news => (
                  <div key={news.id} className="py-3 flex justify-between items-center">
                    <span className="text-neutral-200 font-medium">{news.title}</span>
                    <span className="text-neutral-500">{news.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 📅 SECTION 2: UPCOMING EVENTS MANAGER */}
          <div className="space-y-6">
            <div className="bg-neutral-950 p-6 border border-neutral-800 rounded">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-sunset mb-4 flex items-center gap-2">
                <Calendar size={14} /> Schedule Upcoming Event
              </h2>
              <form onSubmit={handleCreateEvent} className="space-y-4 text-neutral-300">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-400">Engagement Name</label>
                  <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs rounded text-white focus:outline-none focus:border-brand-indigo" placeholder="e.g. Annual Summit Gala" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-400">Target Date</label>
                  <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs rounded text-white focus:outline-none focus:border-brand-indigo" />
                </div>
                <button type="submit" className="w-full bg-brand-sunset text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-colors rounded cursor-pointer">
                  Lock Event Date
                </button>
              </form>
            </div>

            <div className="bg-neutral-950 p-6 border border-neutral-800 rounded">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Live Planned Timelines</h3>
              <div className="divide-y divide-neutral-800 text-xs">
                {events.map(evt => (
                  <div key={evt.id} className="py-3 flex justify-between items-center">
                    <span className="text-neutral-200 font-medium">{evt.title}</span>
                    <span className="text-brand-sunset font-bold">{evt.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}