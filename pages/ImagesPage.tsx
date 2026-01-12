import React, { useRef } from 'react';
import { useAppStore } from '../store';
import { generateImageVariant } from '../services/geminiService';
import { Download, Loader2, Sparkles, Trash2, Upload, RefreshCw } from 'lucide-react';
import { AppImage } from '../types';

const ImagesPage: React.FC = () => {
  const { images, imageConfig, addImage, updateImage, removeImage, article } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const id = Date.now().toString();
        addImage({
          id,
          originalUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (image: AppImage) => {
    updateImage({ ...image, isGenerating: true });
    try {
      const generatedUrl = await generateImageVariant(image.originalUrl, imageConfig.prompt);
      updateImage({ ...image, generatedUrl, isGenerating: false });
    } catch (e) {
      console.error(e);
      alert("Image generation failed. Check API Key.");
      updateImage({ ...image, isGenerating: false });
    }
  };

  const handleBatchGenerate = async () => {
    const promises = images.map(img => handleGenerate(img));
    await Promise.all(promises);
  };

  const handleDownload = (dataUrl: string, index: number, isGenerated: boolean) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    
    let filename;
    if (article.id) {
        filename = `${article.id}_${index + 1}${isGenerated ? '_gen' : ''}.png`;
    } else {
        filename = `image-${index + 1}-${isGenerated ? 'generated' : 'original'}-${Date.now()}.png`;
    }

    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Images</h2>
        <div className="flex gap-2">
            <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
            <Upload size={18} />
            Add Image
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
            
            <button
            onClick={handleBatchGenerate}
            disabled={images.length === 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
            <Sparkles size={18} />
            Batch Generate
            </button>
        </div>
      </div>

      <div className="grid gap-6">
        {images.map((img) => (
          <div key={img.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex gap-6 flex-col md:flex-row">
              {/* Original */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Original</span>
                    <button onClick={() => removeImage(img.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                </div>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                    <img src={img.originalUrl} alt="Original" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="bg-gray-50 p-2 rounded-full text-gray-400">
                    <Sparkles size={24} />
                </div>
              </div>

              {/* Generated */}
              <div className="flex-1 space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Generated</span>
                    {img.generatedUrl && (
                        <button onClick={() => handleDownload(img.generatedUrl!, index, true)} className="text-indigo-600 hover:text-indigo-800">
                            <Download size={16} />
                        </button>
                    )}
                </div>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                    {img.isGenerating ? (
                        <div className="text-indigo-600 flex flex-col items-center">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <span className="text-sm font-medium">Generating...</span>
                        </div>
                    ) : img.generatedUrl ? (
                        <img src={img.generatedUrl} alt="Generated" className="w-full h-full object-contain" />
                    ) : (
                        <div className="text-center">
                             <button
                                onClick={() => handleGenerate(img)}
                                className="text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium transition-colors"
                             >
                                Generate Variant
                             </button>
                             <p className="text-xs text-gray-400 mt-2 px-4">{imageConfig.prompt}</p>
                        </div>
                    )}
                </div>
                {img.generatedUrl && !img.isGenerating && (
                     <button
                     onClick={() => handleGenerate(img)}
                     className="w-full text-gray-500 hover:text-indigo-600 text-sm flex items-center justify-center gap-1 mt-2"
                  >
                     <RefreshCw size={14} /> Regenerate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {images.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                <p className="text-gray-500">No images added yet.</p>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 text-indigo-600 font-medium hover:underline"
                >
                    Upload an image to start
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImagesPage;
