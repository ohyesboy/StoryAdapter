import React from 'react';
import { useAppStore } from '../store';
import { adaptText } from '../services/geminiService';
import { Download, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Translation } from '../types';

const EditText: React.FC = () => {
  const { article, translations, textConfigs, updateTranslation } = useAppStore();
  const [selectedModel, setSelectedModel] = React.useState('gemini-3-flash-preview');

  const handleGenerate = async (configId: string) => {
    if (!article.content) {
        alert("Please add original article content first.");
        return;
    }
    const config = textConfigs.find(c => c.id === configId);
    if (!config) return;

    const currentTrans = translations.find(t => t.configId === configId);
    if (!currentTrans) return;

    updateTranslation({ ...currentTrans, isGenerating: true });

    try {
      const result = await adaptText(article.title, article.content, config.prompt, selectedModel);
      updateTranslation({
        ...currentTrans,
        title: result.title,
        content: result.content,
        isGenerating: false
      });
    } catch (e) {
      console.error(e);
      alert("Generation failed. Check API Key.");
      updateTranslation({ ...currentTrans, isGenerating: false });
    }
  };

  const handleBatchGenerate = async () => {
    if (!article.content) {
        alert("Please add original article content first.");
        return;
    }
    const promises = translations.map(t => handleGenerate(t.configId));
    await Promise.all(promises);
  };

  const handleDownload = (t: Translation) => {
    const text = `${t.title}\n\n${t.content}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const config = textConfigs.find(c => c.id === t.configId);
    const configName = config ? config.name : t.configId;
    const filename = article.id ? `${article.id}_${configName}.txt` : `adapted-${t.configId}.txt`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Adapted Versions</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
            <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
          </select>
          <button
            onClick={handleBatchGenerate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
          >
            <Sparkles size={18} />
            Batch Generate All
          </button>
        </div>
      </div>

      <div className="grid gap-8">
        {translations.map((translation) => {
          const config = textConfigs.find(c => c.id === translation.configId);
          if (!config) return null;

          return (
            <div key={translation.configId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-800">{config.name}</h3>
                    <p className="text-xs text-gray-500 truncate max-w-md" title={config.prompt}>{config.prompt}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleGenerate(translation.configId)}
                        disabled={translation.isGenerating}
                        className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                        {translation.isGenerating ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16} />}
                        {translation.title ? 'Regenerate' : 'Generate'}
                    </button>
                    {translation.content && (
                        <button
                            onClick={() => handleDownload(translation)}
                            className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            title="Download .txt"
                        >
                            <Download size={18} />
                        </button>
                    )}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <input
                    type="text"
                    value={translation.title}
                    onChange={(e) => updateTranslation({...translation, title: e.target.value})}
                    placeholder="Generated Title"
                    className="w-full text-lg font-bold border-b border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none py-1 transition-colors"
                />
                <textarea
                    value={translation.content}
                    onChange={(e) => updateTranslation({...translation, content: e.target.value})}
                    placeholder={translation.isGenerating ? "Generating..." : "Content will appear here..."}
                    className="w-full h-64 resize-y outline-none text-gray-700 leading-relaxed p-2 -ml-2 rounded hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-200 transition-colors"
                />
              </div>
            </div>
          );
        })}

        {translations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                No configurations found. Please go to Config page to add prompts.
            </div>
        )}
      </div>
    </div>
  );
};

export default EditText;
