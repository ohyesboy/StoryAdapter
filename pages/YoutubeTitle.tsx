import React from 'react';
import { useAppStore } from '../store';
import { generateYoutubeMetadata } from '../services/geminiService';
import { Loader2, Youtube, Copy, Check } from 'lucide-react';
import { Translation } from '../types';

const YoutubeTitle: React.FC = () => {
  const { translations, textConfigs, updateTranslation, youtubeConfig } = useAppStore();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleGenerate = async (t: Translation) => {
    if (!t.content || !youtubeConfig) return;
    
    updateTranslation({ ...t, isYoutubeGenerating: true });
    
    try {
      const result = await generateYoutubeMetadata(t.title, t.content, youtubeConfig.prompt);
      updateTranslation({ 
        ...t, 
        youtubeMetadata: result,
        isYoutubeGenerating: false 
      });
    } catch (e: any) {
      alert(`Generation failed: ${e.message}`);
      updateTranslation({ ...t, isYoutubeGenerating: false });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Youtube className="text-red-600" /> Youtube Metadata
      </h2>
      <p className="text-gray-600">Generate Youtube titles and descriptions for your adapted stories.</p>

      <div className="grid gap-8">
        {translations.map(t => {
            const config = textConfigs.find(c => c.id === t.configId);
            if (!config) return null;

            return (
                <div key={t.configId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4 border-b pb-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 text-lg">{config.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">Based on adaptation</p>
                        </div>
                        <button
                            onClick={() => handleGenerate(t)}
                            disabled={!t.content || t.isYoutubeGenerating}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {t.isYoutubeGenerating ? (
                                <><Loader2 size={16} className="animate-spin" /> Generating...</>
                            ) : (
                                <><Youtube size={16} /> Generate Metadata</>
                            )}
                        </button>
                    </div>

                    {!t.content ? (
                        <p className="text-gray-400 italic">No content generated for this adaptation yet.</p>
                    ) : (
                        <div className="space-y-6">
                            {/* Generated Content Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Youtube Metadata</label>
                                    {t.youtubeMetadata && (
                                        <button 
                                            onClick={() => copyToClipboard(t.youtubeMetadata!, `content-${t.configId}`)}
                                            className="text-gray-400 hover:text-indigo-600 transition-colors"
                                            title="Copy Content"
                                        >
                                            {copiedId === `content-${t.configId}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                        </button>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[150px] text-sm text-gray-800 whitespace-pre-wrap">
                                    {t.youtubeMetadata || <span className="text-gray-400 italic">Not generated yet...</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
        
        {translations.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No adaptations found. Go to the Start page to begin.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default YoutubeTitle;
