
import React, { useState, useEffect } from 'react';
import { X, Calendar, Globe, Tag, FileText, AlertCircle, Languages, Edit, Save, User, Trash2, AlertTriangle } from 'lucide-react';
import { Manuscript, FALLBACK_COVER_URL } from '../types';
import { Button } from './Button';

interface ManuscriptReaderProps {
  manuscript: Manuscript;
  onClose: () => void;
  onUpdate?: (manuscript: Manuscript) => void;
  onDelete?: (id: string) => void;
}

export const ManuscriptReader: React.FC<ManuscriptReaderProps> = ({ manuscript, onClose, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'transcription' | 'translation'>('transcription');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState(manuscript.title);
  const [editSummary, setEditSummary] = useState(manuscript.summary);
  const [editTranscription, setEditTranscription] = useState(manuscript.transcription || '');
  const [editTranslation, setEditTranslation] = useState(manuscript.translation || '');

  useEffect(() => {
    setEditTitle(manuscript.title);
    setEditSummary(manuscript.summary);
    setEditTranscription(manuscript.transcription || '');
    setEditTranslation(manuscript.translation || '');
    setImgError(false); // Reset error state when manuscript changes
    setIsEditing(false);
    setShowDeleteConfirm(false);
  }, [manuscript]);

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-stone-100 text-stone-600';
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const handleSave = () => {
    if (onUpdate) {
        onUpdate({
            ...manuscript,
            title: editTitle,
            summary: editSummary,
            transcription: editTranscription,
            translation: editTranslation
        });
        setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
        onDelete(manuscript.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-arch-bg bg-paper-texture rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col md:flex-row overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full hover:bg-white text-stone-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Confirmation Modal Overlay */}
        {showDeleteConfirm && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full border border-red-100">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <div className="bg-red-100 p-2 rounded-full">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold">Confirm Deletion</h3>
                    </div>
                    <p className="text-stone-600 mb-6">
                        Are you sure you want to delete <span className="font-semibold text-stone-900">{manuscript.title}</span>? 
                        This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                        <Button 
                            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                            onClick={handleDelete}
                        >
                            Yes, Delete Manuscript
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {/* Image Panel */}
        <div className="w-full md:w-1/2 bg-stone-900 h-1/3 md:h-full relative flex items-center justify-center overflow-hidden">
          <img 
            src={!imgError ? manuscript.imageUrl : FALLBACK_COVER_URL}
            alt={manuscript.title} 
            onError={() => setImgError(true)}
            className={`max-w-full max-h-full object-contain p-4 transition-opacity duration-300 ${imgError ? 'opacity-50 grayscale' : ''}`}
          />
        </div>

        {/* Content Panel */}
        <div className="w-full md:w-1/2 h-2/3 md:h-full overflow-y-auto p-8 flex flex-col">
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-2 justify-between items-start">
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-arch-accent/10 text-arch-accent">
                        <Tag className="h-3 w-3" /> {manuscript.category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-stone-200 text-stone-700">
                        <Globe className="h-3 w-3" /> {manuscript.language}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-stone-200 text-stone-700">
                        <Calendar className="h-3 w-3" /> {manuscript.period}
                    </span>
                </div>
                
                {!isEditing && (
                    <div className="flex gap-2">
                        {onUpdate && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsEditing(true)}
                                className="text-stone-500 hover:text-arch-accent border border-stone-200 hover:bg-stone-50"
                                title="Edit this manuscript"
                            >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200"
                                title="Delete this manuscript"
                            >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                        )}
                    </div>
                )}
            </div>
            
            {isEditing ? (
                <div className="space-y-3 bg-stone-50 p-4 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2 text-amber-700 text-xs font-medium mb-2">
                        <AlertCircle className="h-3 w-3" />
                        <span>You are editing this manuscript for the public archive.</span>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Title</label>
                        <input 
                            type="text" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded font-serif text-xl font-bold focus:ring-2 focus:ring-arch-accent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Summary</label>
                        <textarea 
                            value={editSummary}
                            onChange={(e) => setEditSummary(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded text-sm min-h-[80px] focus:ring-2 focus:ring-arch-accent outline-none"
                        />
                    </div>
                </div>
            ) : (
                <>
                    <h2 className="font-serif text-3xl font-bold text-stone-900 leading-tight">
                    {manuscript.title}
                    </h2>
                    
                    <p className="text-stone-600 italic border-l-4 border-arch-accent pl-4 py-2 bg-white/50 rounded-r-lg">
                    {manuscript.summary}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        <User className="h-3 w-3" />
                        <span>Contributed by: {manuscript.uploadedBy || 'Anonymous Scholar'}</span>
                    </div>
                </>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200 sticky top-0 bg-arch-bg z-10 pt-2">
                <div className="flex space-x-1 bg-stone-200/50 p-1 rounded-lg">
                     <button 
                        onClick={() => setActiveTab('transcription')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'transcription' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
                    >
                        <FileText className="h-4 w-4" />
                        Transcription
                    </button>
                    <button 
                        onClick={() => setActiveTab('translation')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'translation' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
                    >
                        <Languages className="h-4 w-4" />
                        Translation
                    </button>
                </div>
                
                {activeTab === 'transcription' && manuscript.ocrConfidence !== undefined && (
                    <div className={`text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1 ${getConfidenceColor(manuscript.ocrConfidence)}`}>
                        <AlertCircle className="h-3 w-3" />
                        OCR: {manuscript.ocrConfidence}%
                    </div>
                )}
            </div>
            
            {isEditing ? (
                <div className="flex flex-col h-full">
                    <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">
                        Editing {activeTab === 'transcription' ? 'Original Text' : 'Translation'}
                    </label>
                    {activeTab === 'transcription' ? (
                        <textarea 
                            value={editTranscription}
                            onChange={(e) => setEditTranscription(e.target.value)}
                            className="w-full p-3 border border-stone-300 rounded font-mono text-sm h-64 bg-white focus:ring-2 focus:ring-arch-accent outline-none"
                        />
                    ) : (
                        <textarea 
                            value={editTranslation}
                            onChange={(e) => setEditTranslation(e.target.value)}
                            className="w-full p-3 border border-stone-300 rounded font-serif text-sm h-64 bg-white focus:ring-2 focus:ring-arch-accent outline-none"
                        />
                    )}
                    <div className="flex justify-end gap-2 mt-4">
                         <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                         <Button onClick={handleSave} className="flex items-center gap-2">
                            <Save className="h-4 w-4" /> Save Changes
                         </Button>
                    </div>
                </div>
            ) : (
                <div className="prose prose-stone max-w-none font-serif leading-relaxed text-stone-800 whitespace-pre-wrap min-h-[200px]">
                {activeTab === 'transcription' 
                    ? (manuscript.transcription || "No transcription available.")
                    : (manuscript.translation || "No translation available.")
                }
                </div>
            )}
          </div>
          
          {!isEditing && (
            <div className="mt-8 pt-6 border-t border-stone-200 flex justify-end">
                <Button variant="secondary" onClick={onClose}>Close Reader</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
