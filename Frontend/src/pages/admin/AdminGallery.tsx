import { useState, useRef } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Trash2, Upload } from 'lucide-react';

export function AdminGallery() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated live directory array
  const [mockItems, setMockItems] = useState([
    { id: 1, title: 'Annual Leadership Summit', date: '2025-10-14', location: 'Cape Town' },
    { id: 2, title: 'Women in Tech Networking Mixer', date: '2025-08-22', location: 'Johannesburg' },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !date || !selectedFile) {
      return alert('Please completely fill in all text details and attach an event photograph.');
    }

    // 📦 Append payload details into an encrypted Multipart FormData stream object
    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    formData.append('date', date);
    formData.append('image', selectedFile); // Pushes the raw local computer file asset binary

    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Never include 'Content-Type': 'application/json' here when passing FormData! 
          // The browser automatically sets the correct multi-part boundary flags for you.
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server upload execution crash.');
      }

      alert('🎉 File uploaded and memory written live to the website database successfully!');
      
      // Sync UI state, then wipe input forms clean
      setMockItems([{ id: Date.now(), title, date, location }, ...mockItems]);
      setTitle('');
      setLocation('');
      setDate('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err: any) {
      alert(`Upload operation failed: ${err.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-2">Manage Archive Directory</h1>
        <p className="text-sm text-neutral-400 mb-8">Upload local event image binaries and control dynamic application content timelines.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CONTROL BOX CREATION FORM */}
          <div className="md:col-span-1 bg-neutral-950 p-6 border border-neutral-800 rounded">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-indigo mb-4 flex items-center gap-2">
              <Plus size={14} /> Add Event Photograph
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-neutral-300">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-400">Event Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs rounded text-white focus:outline-none focus:border-brand-indigo" placeholder="e.g. Strategy Gala" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-400">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs rounded text-white focus:outline-none focus:border-brand-indigo" placeholder="e.g. Johannesburg" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-400">Event Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs rounded focus:outline-none focus:border-brand-indigo text-white" />
              </div>
              
              {/* 🖥️ BRAND NEW FILE PICKER LAYOUT ENGINE */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-400">Attach Device Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-neutral-800 hover:border-brand-indigo bg-neutral-900 p-4 text-center rounded cursor-pointer transition-colors group"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <Upload size={20} className="mx-auto text-neutral-500 group-hover:text-brand-indigo mb-2" />
                  <span className="block text-[11px] text-neutral-400 truncate">
                    {selectedFile ? selectedFile.name : 'Click to scan local files...'}
                  </span>
                </div>
              </div>

              <button type="submit" className="w-full bg-brand-luxury text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-indigo transition-colors rounded cursor-pointer mt-2">
                Upload File Binary
              </button>
            </form>
          </div>

          {/* ACTIVE LIVE DIRECTORY LISTING PANEL */}
          <div className="md:col-span-2 bg-neutral-950 p-6 border border-neutral-800 rounded">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Active Directory Records ({mockItems.length})</h2>
            <div className="divide-y divide-neutral-800">
              {mockItems.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{item.location} • {item.date}</p>
                  </div>
                  <button type="button" className="text-neutral-500 hover:text-red-400 p-2 transition-colors cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}