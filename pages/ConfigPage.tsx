import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Save } from 'lucide-react';

const ConfigPage: React.FC = () => {
  const { 
    textConfigs, 
    addTextConfig, 
    updateTextConfig, 
    deleteTextConfig, 
    imageConfig, 
    setImageConfigPrompt,
    srtConfig,
    setSrtConfigPrompt,
    youtubeConfig,
    setYoutubeConfigPrompt
  } = useAppStore();

  const handleAddTextConfig = () => {
    addTextConfig({
      id: Date.now().toString(),
      name: 'New Config',
      prompt: 'Summarize this article...'
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <h2 className="text-2xl font-bold text-gray-800">Configuration</h2>

      {/* Image Prompt */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-indigo-600 mb-4">Image Generation Prompt</h3>
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Style / Instructions</label>
            <textarea
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                value={imageConfig.prompt}
                onChange={(e) => setImageConfigPrompt(e.target.value)}
            />
            <p className="text-xs text-gray-500">This prompt is used when regenerating images using the Gemini 2.5 Image model.</p>
        </div>
      </section>

      {/* SRT Prompt */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-indigo-600 mb-4">SRT Generation Prompt</h3>
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                value={srtConfig?.prompt ?? ''}
                onChange={(e) => setSrtConfigPrompt(e.target.value)}
            />
            <p className="text-xs text-gray-500">This prompt is used when generating SRT subtitles from audio.</p>
        </div>
      </section>

      {/* Youtube Prompt */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-indigo-600 mb-4">Youtube Title/Desc Prompt</h3>
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                value={youtubeConfig?.prompt ?? ''}
                onChange={(e) => setYoutubeConfigPrompt(e.target.value)}
            />
            <p className="text-xs text-gray-500">This prompt is used when generating Youtube titles and descriptions.</p>
        </div>
      </section>

      {/* Text Prompts */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-indigo-600">Text Adaptation Prompts</h3>
            <button 
                onClick={handleAddTextConfig}
                className="text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
            >
                <Plus size={16} /> Add Config
            </button>
        </div>

        <div className="grid gap-6">
            {textConfigs.map((config) => (
                <div key={config.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => deleteTextConfig(config.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Delete Configuration"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Config Name</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-800"
                                value={config.name}
                                onChange={(e) => updateTextConfig({...config, name: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-32 text-sm"
                                value={config.prompt}
                                onChange={(e) => updateTextConfig({...config, prompt: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default ConfigPage;