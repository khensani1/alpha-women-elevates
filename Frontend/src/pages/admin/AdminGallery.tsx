import { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Trash2, Upload, Loader2 } from 'lucide-react';

interface DBGalleryItem {
  id: number;
  title: string;
  location: string;
  event_date: string;
}

export function AdminGallery() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live records state array
  const [dbItems, setDbItems] = useState<DBGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real archives on load
  const fetchAdminGallery = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery`);
      if (response.ok) {
        const data = await response.json();
        setDbItems(data);
      }
    } catch (err) {
      console.error("Failed to sync records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminGallery();
  }, []);

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

    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', location);
    formData.append('date', date);
    formData.append('image', selectedFile);

    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server upload execution crash.');
      }

      alert('🎉 File uploaded and memory written live to the website database successfully!');
      
      // Clear inputs and pull fresh list from DB
      setTitle('');
      setLocation('');
      setDate('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchAdminGallery();

    } catch (err: any) {
      alert(`Upload operation failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you completely sure you want to permanently delete this dynamic archive entry?')) return;

    try {
      const token = localStorage.getItem('awe_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to remove archive item.');
      }

      // Filter state directly
      setDbItems(dbItems.filter(item => item.id !== id));
    } catch (err: any) {
      alert(`Delete verification failure: ${err.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-2 text-neutral-900">Manage Archive Directory</h1>
        <p className="text-sm text-neutral-700 mb-8">Upload local event image binaries and control dynamic application content timelines.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CONTROL BOX CREATION FORM */}
          <div 
            className="md:col-span-1 p-6 border border-neutral-300 rounded"
            style={{ backgroundColor: '#C4BCC7' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-indigo mb-4 flex items-center gap-2">
              <Plus size={14} /> Add Event Photograph
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-neutral-800">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Event Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo placeholder:text-neutral-500" 
                  style={{ backgroundColor: '#C4BCC7' }}
                  placeholder="e.g. Strategy Gala" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  className="w-full border border-neutral-400 p-2 text-xs rounded text-neutral-900 focus:outline-none focus:border-brand-indigo placeholder:text-neutral-500" 
                  style={{ backgroundColor: '#C4BCC7' }}
                  placeholder="e.g. Johannesburg" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Event Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full border border-neutral-400 p-2 text-xs rounded focus:outline-none focus:border-brand-indigo text-neutral-900" 
                  style={{ backgroundColor: '#C4BCC7' }}
                />
              </div>
              
              {/* FILE PICKER */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1 text-neutral-700">Attach Device Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-neutral-400 hover:border-brand-indigo p-4 text-center rounded cursor-pointer transition-colors group"
                  style={{ backgroundColor: '#C4BCC7' }}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  <Upload size={20} className="mx-auto text-neutral-600 group-hover:text-brand-indigo mb-2" />
                  <span className="block text-[11px] text-neutral-700 truncate">
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
          <div 
            className="md:col-span-2 p-6 border border-neutral-300 rounded"
            style={{ backgroundColor: '#C4BCC7' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-700 mb-4">Active Directory Records ({dbItems.length})</h2>
            
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-neutral-600" size={24} /></div>
            ) : (
              <div className="divide-y divide-neutral-300">
                {dbItems.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900">{item.title}</h4>
                      <p className="text-xs text-neutral-700 mt-1">
                        {item.location} • {new Date(item.event_date).toLocaleDateString('en-ZA')}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      type="button" 
                      className="text-neutral-600 hover:text-red-600 p-2 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {dbItems.length === 0 && (
                  <p className="text-xs text-neutral-700 text-center py-8">No dynamic entries found inside PostgreSQL records.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}