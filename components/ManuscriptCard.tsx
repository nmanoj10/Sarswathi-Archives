
import React, { useState } from 'react';
import { Manuscript, FALLBACK_COVER_URL } from '../types';
import { Calendar, Globe, Tag } from 'lucide-react';

interface ManuscriptCardProps {
  manuscript: Manuscript;
  onRead?: (manuscript: Manuscript) => void;
}

export const ManuscriptCard: React.FC<ManuscriptCardProps> = ({ manuscript, onRead }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative bg-white border border-stone-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100 relative flex items-center justify-center">
        <img 
            src={!imgError ? manuscript.imageUrl : FALLBACK_COVER_URL}
            alt={manuscript.title} 
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${imgError ? 'opacity-80 grayscale' : ''}`} 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm font-medium line-clamp-2">{manuscript.summary}</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                {manuscript.category}
            </span>
        </div>
        <h3 className="font-serif text-lg font-bold text-stone-900 line-clamp-1 group-hover:text-arch-accent transition-colors">
          {manuscript.title}
        </h3>
        
        <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col gap-1 text-xs text-stone-500">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span>{manuscript.language}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{manuscript.period}</span>
              </div>
            </div>
            
            {onRead && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onRead(manuscript);
                    }}
                    className="text-xs font-medium text-arch-accent hover:text-arch-accentHover border border-arch-accent/30 hover:bg-arch-accent/10 px-3 py-1.5 rounded transition-colors"
                >
                    Read
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
