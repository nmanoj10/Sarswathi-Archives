
import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Wand2, CheckCircle, AlertCircle, Languages, FileText } from 'lucide-react';
import { Button } from './Button';
import { analyzeManuscriptImage } from '../services/gemini';
import { Manuscript, TARGET_LANGUAGES } from '../types';
import { useAuth } from '../context/AuthContext';

interface UploadAnalyzerProps {
  onClose: () => void;
  onSave: (manuscript: Manuscript) => void;
}

// Helper to compress and convert image to Base64 for persistence
const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Max dimension 1024px to keep string size low for DB/LocalStorage
        const MAX_SIZE = 1024; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            // Fill white background to handle transparency (PNGs)
            // Without this, transparent areas turn black in JPEG conversion
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Return as JPEG Data URL with compression
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        } else {
            reject(new Error("Failed to get canvas context"));
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const UploadAnalyzer: React.FC<UploadAnalyzerProps> = ({ onClose, onSave }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedBase64, setProcessedBase64] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Omit<Manuscript, 'id' | 'imageUrl' | 'dateAdded'> | null>(null);
  const [activeTab, setActiveTab] = useState<'transcription' | 'translation'>('transcription');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Immediate preview using Blob URL (fast)
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Reset states
      setAnalysisResult(null);
      setError(null);
      setActiveTab('transcription');
      setProcessedBase64(null);
      setIsProcessingImage(true);

      // Process for persistence
      try {
        const base64 = await processImage(selectedFile);
        setProcessedBase64(base64);
      } catch (err) {
        console.error("Image processing failed", err);
        setError("Failed to process image. Please try a different file.");
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!processedBase64) {
        setError("Image is still processing. Please wait a moment.");
        return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Extract base64 content (remove "data:image/jpeg;base64," prefix)
      const base64Content = processedBase64.split(',')[1];
      
      // We use the processed JPEG for analysis to ensure consistency
      const result = await analyzeManuscriptImage(base64Content, 'image/jpeg', targetLanguage);
      
      if (result) {
        setAnalysisResult(result);
      } else {
        setError("No analysis result returned. Please try again.");
      }
    } catch (innerError: any) {
      console.error("Analysis execution failed", innerError);
      setError(innerError.message || "Failed to analyze image. Check API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (analysisResult && processedBase64) {
      const newManuscript: Manuscript = {
        id: Date.now().toString(),
        // CRITICAL FIX: Use the processed Base64 string, NOT the Blob URL.
        // This ensures the image is actually stored in the DB/LocalStorage and visible to other users.
        imageUrl: processedBase64, 
        dateAdded: Date.now(),
        uploadedBy: user?.name || 'Anonymous Scholar', 
        ...analysisResult
      };
      onSave(newManuscript);
      onClose();
    }
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-stone-100 text-stone-600';
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-serif font-bold text-stone-900">Digitize Manuscript</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Upload Area */}
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-arch-accent hover:bg-arch-bg/30 transition-all"
            >
              <div className="bg-stone-100 p-4 rounded-full mb-4">
                <Upload className="h-8 w-8 text-stone-600" />
              </div>
              <p className="text-lg font-medium text-stone-900">Click to upload image</p>
              <p className="text-sm text-stone-500 mt-1">Supports JPG, PNG, WEBP</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2">
                <div className="rounded-lg overflow-hidden border border-stone-200 shadow-sm relative">
                   <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover" />
                   {isProcessingImage && (
                       <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                           <Loader2 className="h-8 w-8 text-arch-accent animate-spin" />
                       </div>
                   )}
                </div>
                <div className="mt-4 flex justify-between">
                   <Button variant="outline" size="sm" onClick={() => {
                     setPreviewUrl(null);
                     setFile(null);
                     setAnalysisResult(null);
                     setProcessedBase64(null);
                     setError(null);
                   }}>Change Image</Button>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-800">Analysis Failed</h4>
                      <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {!analysisResult ? (
                  <div className="h-full flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="bg-arch-accent/10 p-4 rounded-full">
                        <Wand2 className="h-8 w-8 text-arch-accent" />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-semibold">AI Analysis Ready</h3>
                        <p className="text-sm text-stone-500 mt-1">Select your preferred language for translation and summary.</p>
                    </div>
                    
                    <div className="w-full text-left">
                        <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Output Language</label>
                        <select 
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="w-full p-2 rounded-md border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:ring-2 focus:ring-arch-accent outline-none cursor-pointer"
                        >
                            {TARGET_LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>

                    <Button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing || isProcessingImage}
                        className="w-full"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : isProcessingImage ? (
                             <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing Image...
                            </>
                        ) : (
                            "Analyze Manuscript"
                        )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium text-sm">Analysis Complete</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-stone-500 uppercase">Title ({targetLanguage})</label>
                            <p className="font-serif text-lg font-bold text-stone-900">{analysisResult.title}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-stone-500 uppercase">Category</label>
                            <div className="flex gap-2 mt-1">
                                <span className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-full font-medium">{analysisResult.category}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-stone-500 uppercase">Original Language</label>
                                <p className="text-stone-800">{analysisResult.language}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-stone-500 uppercase">Period</label>
                                <p className="text-stone-800">{analysisResult.period}</p>
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-semibold text-stone-500 uppercase">Summary ({targetLanguage})</label>
                            <p className="text-sm text-stone-600 leading-relaxed">{analysisResult.summary}</p>
                        </div>
                        
                        {/* Content Tabs */}
                        <div className="mt-2">
                             <div className="flex items-center justify-between mb-2">
                                <div className="flex space-x-1 bg-stone-100 p-1 rounded-lg">
                                    <button 
                                        onClick={() => setActiveTab('transcription')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'transcription' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
                                    >
                                        <FileText className="h-3 w-3" />
                                        Original
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('translation')}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'translation' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
                                    >
                                        <Languages className="h-3 w-3" />
                                        {targetLanguage}
                                    </button>
                                </div>

                                {activeTab === 'transcription' && analysisResult.ocrConfidence && (
                                    <div className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${getConfidenceColor(analysisResult.ocrConfidence)}`}>
                                        <AlertCircle className="h-3 w-3" />
                                        {analysisResult.ocrConfidence}% Accuracy
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-sm font-mono text-stone-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
                                {activeTab === 'transcription' 
                                    ? (analysisResult.transcription || "No text detected.")
                                    : (analysisResult.translation || "No translation available.")
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-stone-100">
                        <Button onClick={handleSave} className="w-full">Contribute to Public Archive</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};