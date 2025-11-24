
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Globe, Unlock } from 'lucide-react';
import { Button } from '../components/Button';
import { CATEGORIES } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
        navigate(`/gallery?search=${encodeURIComponent(query)}`);
    } else {
        navigate('/gallery');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-arch-bg bg-paper-texture">
      
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-arch-accent/10 text-arch-accent text-sm font-medium">
            <Unlock className="h-3 w-3" />
            <span>Open Access Digital Archive</span>
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-stone-900 leading-tight">
          Unveiling the Wisdom of Ages
        </h1>
        
        <p className="text-lg md:text-xl text-stone-600 max-w-2xl">
          Saraswati Archives is a free, public sanctuary for ancient manuscripts. 
          Use our AI to preserve, translate, and explore the world's documented heritage together.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-lg relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            name="search"
            placeholder="Search the public collection..."
            className="w-full pl-11 pr-4 py-4 rounded-full border border-stone-200 shadow-sm bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-arch-accent focus:border-transparent outline-none transition-all"
          />
        </form>

        <div className="pt-4">
          <Button 
            size="lg" 
            className="rounded-full pl-8 pr-6 group"
            onClick={() => navigate('/gallery')}
          >
            Explore the Collection
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xs text-stone-400 mt-4">No account required to browse or search.</p>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-20 border-t border-stone-200/50 bg-stone-50/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center text-stone-900 mb-12">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => navigate(`/gallery?category=${category}`)}
                className="group p-6 bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-arch-accent/30 transition-all text-center"
              >
                <span className="block font-serif text-lg font-medium text-stone-800 group-hover:text-arch-accent mb-1">
                    {category}
                </span>
                <span className="text-xs text-stone-400 group-hover:text-arch-accent/70">View Collection</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
