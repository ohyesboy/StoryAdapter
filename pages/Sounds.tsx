import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { generateSpeech, getVoices } from '../services/elevenLabsService';
import { generateSrtFromAudio } from '../services/geminiService';
import { Download, Loader2, Play, Volume2, FileText, Pause } from 'lucide-react';
import { Translation } from '../types';

const Sounds: React.FC = () => {
  const { translations, textConfigs, updateTranslation, elevenLabsApiKey, voiceSettings, updateVoiceSettings, article } = useAppStore();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [voices, setVoices] = useState<any[]>([]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const { voiceId, language, stability, readTitle } = voiceSettings;

  useEffect(() => {
    if (elevenLabsApiKey) {
      getVoices(elevenLabsApiKey).then(setVoices);
    }
  }, [elevenLabsApiKey]);

  const handleGenerateSound = async (t: Translation) => {
    if (!t.content) return;
    updateTranslation({ ...t, isVoiceGenerating: true });

    const textToRead = readTitle ? `${t.title}. ${t.content}` : t.content;
    const modelId = 'eleven_v3';
    const speed = t.speed || 1.0;

    try {
      const audioData = await generateSpeech(textToRead, elevenLabsApiKey, voiceId, modelId, stability, speed);
      updateTranslation({ ...t, voiceFile: audioData, isVoiceGenerating: false });
    } catch (e: any) {
      alert(`Voice generation failed: ${e.message}`);
      updateTranslation({ ...t, isVoiceGenerating: false });
    }
  };

  const handleBatchGenerate = async () => {
      const candidates = translations.filter(t => t.content && !t.isVoiceGenerating);
      
      if (candidates.length === 0) return;

      const hasExistingAudio = candidates.some(t => t.voiceFile);

      if (hasExistingAudio) {
          if (!window.confirm(`This will regenerate audio for ${candidates.length} items. Continue?`)) {
              return;
          }
      }

      const promises = candidates.map(t => handleGenerateSound(t));
      await Promise.all(promises);
  };

  const handleGenerateSRT = async (t: Translation) => {
      if (!t.voiceFile) return;
      updateTranslation({...t, isSrtGenerating: true});
      try {
          const srt = await generateSrtFromAudio(t.voiceFile);
          updateTranslation({...t, srtContent: srt, isSrtGenerating: false});
      } catch (e: any) {
          alert(`SRT generation failed: ${e.message}`);
          updateTranslation({...t, isSrtGenerating: false});
      }
  }

  const togglePlay = (t: Translation) => {
      if (playingId === t.configId && audioRef.current) {
          audioRef.current.pause();
          setPlayingId(null);
      } else {
          if (audioRef.current) {
              audioRef.current.pause();
          }
          if (t.voiceFile) {
              const audio = new Audio(t.voiceFile);
              audio.onended = () => setPlayingId(null);
              audioRef.current = audio;
              audio.play();
              setPlayingId(t.configId);
          }
      }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    let href = content;
    if (type !== 'data-url') {
        const blob = new Blob([content], { type: type });
        href = URL.createObjectURL(blob);
    }
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    if (type !== 'data-url') URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Voice Over</h2>

      <div className="bg-white p-3 rounded-lg border shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Creative</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.5"
                    value={stability}
                    onChange={(e) => updateVoiceSettings({ stability: parseFloat(e.target.value) })}
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500">Robust</span>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Lang:</span>
                <select 
                    value={language}
                    onChange={(e) => updateVoiceSettings({ language: e.target.value })}
                    className="border rounded px-2 py-1 text-sm bg-white"
                >
                    <option value="en">English (en)</option>
                    <option value="zh">Chinese (zh)</option>
                    <option value="es">Spanish (es)</option>
                    <option value="fr">French (fr)</option>
                    <option value="de">German (de)</option>
                    <option value="ja">Japanese (ja)</option>
                </select>
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Voice:</span>
                {voices.length > 0 ? (
                  <select
                    value={voiceId}
                    onChange={(e) => updateVoiceSettings({ voiceId: e.target.value })}
                    className="border rounded px-2 py-1 text-sm w-48"
                  >
                    {voices.map((voice: any) => (
                      <option key={voice.voice_id} value={voice.voice_id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input 
                      type="text" 
                      value={voiceId} 
                      onChange={(e) => updateVoiceSettings({ voiceId: e.target.value })}
                      placeholder="Enter Voice ID"
                      className="border rounded px-2 py-1 text-sm w-32"
                  />
                )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t">
            <label className="flex items-center space-x-2 cursor-pointer select-none text-sm text-gray-700">
                <input
                    type="checkbox"
                    checked={readTitle}
                    onChange={e => updateVoiceSettings({ readTitle: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Read Title</span>
            </label>

            <button
                onClick={handleBatchGenerate}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 flex items-center gap-2"
            >
                <Volume2 size={16} /> Batch Generate
            </button>
          </div>
        </div>

      <div className="grid gap-6">
        {translations.map(t => {
            const config = textConfigs.find(c => c.id === t.configId);
            if (!config) return null;

            return (
                <div key={t.configId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{config.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.content || "No content generated yet."}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4 bg-gray-50 p-1.5 rounded-lg border">
                           <span className="text-xs text-gray-500">Speed:</span>
                           <input
                              type="range"
                              min="0.7"
                              max="1.2"
                              step="0.1"
                              value={t.speed || 1.0}
                              onChange={(e) => updateTranslation({ ...t, speed: parseFloat(e.target.value) })}
                              className="w-16 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                           />
                           <span className="text-xs text-gray-500 w-6 font-mono">{(t.speed || 1.0).toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center pt-4 border-t">
                        <button
                            onClick={() => handleGenerateSound(t)}
                            disabled={!t.content || t.isVoiceGenerating}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                        >
                            {t.isVoiceGenerating ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                            {t.voiceFile ? "Regenerate Voice" : "Generate Voice"}
                        </button>

                        {/* Audio Controls */}
                        {t.voiceFile && (
                            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full">
                                <button onClick={() => togglePlay(t)} className="text-indigo-700 hover:text-indigo-900">
                                    {playingId === t.configId ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                </button>
                                <span className="text-xs font-medium text-indigo-700">Audio Ready</span>
                                <button onClick={() => {
                                    const filename = article.id ? `${article.id}_${config.name}.mp3` : `audio-${t.configId}.mp3`;
                                    downloadFile(t.voiceFile!, filename, 'data-url');
                                }} className="ml-2 text-indigo-400 hover:text-indigo-600">
                                    <Download size={16} />
                                </button>
                            </div>
                        )}

                        {/* SRT Controls */}
                        {t.voiceFile && (
                            <>
                                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                {t.srtContent ? (
                                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                                        <FileText size={16} className="text-green-700" />
                                        <span className="text-xs font-medium text-green-700">SRT Ready</span>
                                        <button onClick={() => downloadFile(t.srtContent!, `subs-${t.configId}.srt`, 'text/plain')} className="ml-2 text-green-500 hover:text-green-700">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleGenerateSRT(t)}
                                        disabled={t.isSrtGenerating}
                                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 disabled:opacity-50"
                                    >
                                        {t.isSrtGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                                        Generate SRT
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        })}
        {translations.length === 0 && <p className="text-center text-gray-500">No content available to generate sound.</p>}
      </div>
    </div>
  );
};

export default Sounds;
