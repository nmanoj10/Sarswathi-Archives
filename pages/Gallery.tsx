
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, X, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { ManuscriptCard } from '../components/ManuscriptCard';
import { UploadAnalyzer } from '../components/UploadAnalyzer';
import { ManuscriptReader } from '../components/ManuscriptReader';
import { Manuscript, CATEGORIES, LANGUAGES, PERIODS } from '../types';
import { db } from '../services/db';

export const Gallery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for manuscripts
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  
  const navigate = useNavigate();

  // Filters state
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Fetch Manuscripts
  const fetchManuscripts = async () => {
    // Don't set loading true here to avoid flickering on background updates
    try {
        const data = await db.manuscripts.find({});
        setManuscripts(data);
    } catch (error) {
        console.error("Failed to fetch manuscripts", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchManuscripts();

    // Listen for storage events to sync changes from other tabs (simulating other users)
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key && e.key.includes('saraswati')) {
            fetchManuscripts();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filtering Logic
  const filteredManuscripts = useMemo(() => {
    return manuscripts.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? m.category === selectedCategory : true;
      const matchesLanguage = selectedLanguage ? m.language === selectedLanguage : true;
      const matchesPeriod = selectedPeriod ? m.period.includes(selectedPeriod) : true;

      return matchesSearch && matchesCategory && matchesLanguage && matchesPeriod;
    });
  }, [manuscripts, searchQuery, selectedCategory, selectedLanguage, selectedPeriod]);

  const handleAddManuscript = async (newManuscript: Manuscript) => {
    await db.manuscripts.insertOne(newManuscript);
    await fetchManuscripts();
  };

  const handleUpdateManuscript = async (updatedManuscript: Manuscript) => {
    await db.manuscripts.updateOne({ id: updatedManuscript.id }, updatedManuscript);
    await fetchManuscripts();
    setSelectedManuscript(updatedManuscript);
  };

  const handleDeleteManuscript = async (id: string) => {
    await db.manuscripts.deleteOne({ id });
    await fetchManuscripts();
    setSelectedManuscript(null);
  };

  const handleDigitizeClick = () => {
    setShowUploadModal(true);
  };

  const updateSearch = (term: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (term) {
        newParams.set('search', term);
    } else {
        newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const updateCategory = (cat: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat) {
        newParams.set('category', cat);
    } else {
        newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-arch-bg bg-paper-texture flex flex-col">
      
      {/* Gallery Header */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-8">
        <div className="container mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div className="space-y-1">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">The Manuscript Collection</h1>
                <p className="text-stone-600">Search, filter, and explore a growing archive of the world's written treasures.</p>
            </div>
            <Button onClick={handleDigitizeClick} className="flex items-center gap-2 shadow-md">
                <Plus className="h-4 w-4" />
                Digitize Manuscript
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input 
                    type="text" 
                    placeholder="Search by title, author, or tag..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:ring-2 focus:ring-arch-accent outline-none"
                    value={searchQuery}
                    onChange={(e) => updateSearch(e.target.value)}
                />
             </div>
             <Button 
                variant="secondary" 
                className="md:hidden w-full flex items-center gap-2 justify-center"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             >
                <Filter className="h-4 w-4" /> Filters
             </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex gap-8 relative">
        
        {/* Sidebar Filters */}
        <aside className={`
            fixed md:relative inset-0 z-40 bg-white md:bg-transparent p-6 md:p-0 md:block md:w-64 shrink-0 transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            <div className="flex justify-between items-center md:hidden mb-6">
                <h2 className="font-serif text-xl font-bold">Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-6 w-6 text-stone-500" />
                </button>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="font-serif font-semibold text-stone-900 mb-3 border-b border-stone-200 pb-2">Category</h3>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="category" 
                                checked={!selectedCategory} 
                                onChange={() => updateCategory(null)}
                                className="accent-arch-accent"
                            />
                            <span className={`text-sm ${!selectedCategory ? 'text-arch-accent font-medium' : 'text-stone-600 group-hover:text-stone-900'}`}>All Categories</span>
                        </label>
                        {CATEGORIES.map(cat => (
                             <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="category" 
                                    checked={selectedCategory === cat}
                                    onChange={() => updateCategory(cat)}
                                    className="accent-arch-accent"
                                />
                                <span className={`text-sm ${selectedCategory === cat ? 'text-arch-accent font-medium' : 'text-stone-600 group-hover:text-stone-900'}`}>{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-serif font-semibold text-stone-900 mb-3 border-b border-stone-200 pb-2">Language</h3>
                    <select 
                        value={selectedLanguage} 
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full p-2 rounded-md border border-stone-200 bg-white text-sm text-stone-700 focus:ring-2 focus:ring-arch-accent outline-none"
                    >
                        <option value="">All Languages</option>
                        {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>

                 <div>
                    <h3 className="font-serif font-semibold text-stone-900 mb-3 border-b border-stone-200 pb-2">Historical Period</h3>
                    <select 
                        value={selectedPeriod} 
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="w-full p-2 rounded-md border border-stone-200 bg-white text-sm text-stone-700 focus:ring-2 focus:ring-arch-accent outline-none"
                    >
                        <option value="">All Periods</option>
                        {PERIODS.map(period => (
                            <option key={period} value={period}>{period}</option>
                        ))}
                    </select>
                </div>
            </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/20 z-30 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}

        {/* Main Content Grid */}
        <main className="flex-1">
            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 text-arch-accent animate-spin" />
                        <p className="text-stone-500">Loading collection...</p>
                    </div>
                </div>
            ) : manuscripts.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-stone-200 rounded-xl bg-white/50">
                    <div className="bg-stone-100 p-4 rounded-full mb-4">
                        <Plus className="h-8 w-8 text-stone-400" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">The Collection is Empty</h3>
                    <p className="text-stone-500 max-w-md">
                        There are no manuscripts in the archive yet. Be the first to preserve a piece of history.
                    </p>
                    <Button onClick={handleDigitizeClick} className="mt-6 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Digitize First Manuscript
                    </Button>
                </div>
            ) : filteredManuscripts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredManuscripts.map(manuscript => (
                        <ManuscriptCard 
                            key={manuscript.id} 
                            manuscript={manuscript} 
                            onRead={(m) => setSelectedManuscript(m)}
                        />
                    ))}
                </div>
            ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-stone-200 rounded-xl bg-white/50">
                    <div className="bg-stone-100 p-4 rounded-full mb-4">
                        <Search className="h-8 w-8 text-stone-400" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">No Manuscripts Found</h3>
                    <p className="text-stone-500 max-w-md">
                        Your search or filter criteria did not match any manuscripts.
                    </p>
                    <Button onClick={() => {
                        updateSearch('');
                        updateCategory(null);
                        setSelectedLanguage('');
                        setSelectedPeriod('');
                    }} variant="outline" className="mt-6">
                        Clear Filters
                    </Button>
                </div>
            )}
        </main>

      </div>

      {showUploadModal && (
        <UploadAnalyzer 
            onClose={() => setShowUploadModal(false)} 
            onSave={handleAddManuscript}
        />
      )}
      
      {selectedManuscript && (
        <ManuscriptReader 
            manuscript={selectedManuscript} 
            onClose={() => setSelectedManuscript(null)} 
            onUpdate={handleUpdateManuscript}
            onDelete={handleDeleteManuscript}
        />
      )}
    </div>
  );
};
