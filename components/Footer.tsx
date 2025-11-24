import React from 'react';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-stone-400" />
            <span className="font-serif text-lg font-bold text-stone-900">Saraswati Archives</span>
          </div>
          <p className="text-stone-500 text-sm">Built for the preservation of knowledge.</p>
          <p className="text-stone-400 text-xs">© 2025 Saraswati Archives. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};