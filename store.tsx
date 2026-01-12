import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, DEFAULT_IMAGE_CONFIG, DEFAULT_TEXT_CONFIG, Translation, AppImage, TextConfig } from './types';

interface AppContextType extends AppState {
  setArticleTitle: (title: string) => void;
  setArticleContent: (content: string) => void;
  setArticleUrl: (url: string) => void;
  addTextConfig: (config: TextConfig) => void;
  updateTextConfig: (config: TextConfig) => void;
  deleteTextConfig: (id: string) => void;
  setImageConfigPrompt: (prompt: string) => void;
  updateTranslation: (translation: Translation) => void;
  addImage: (image: AppImage) => void;
  updateImage: (image: AppImage) => void;
  removeImage: (id: string) => void;
  resetTranslations: () => void;
  setElevenLabsApiKey: (key: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'article_adapter_session_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      article: { title: '', content: '', url: '' },
      translations: [],
      images: [],
      textConfigs: [DEFAULT_TEXT_CONFIG],
      imageConfig: DEFAULT_IMAGE_CONFIG,
      elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
    };
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Ensure translations exist for all configs
  useEffect(() => {
    setState(prev => {
      const existingConfigIds = new Set(prev.translations.map(t => t.configId));
      const newTranslations = [...prev.translations];
      let changed = false;

      // Add missing
      prev.textConfigs.forEach(cfg => {
        if (!existingConfigIds.has(cfg.id)) {
          newTranslations.push({
            configId: cfg.id,
            title: '',
            content: '',
          });
          changed = true;
        }
      });

      // Remove orphaned
      const currentConfigIds = new Set(prev.textConfigs.map(c => c.id));
      const filteredTranslations = newTranslations.filter(t => currentConfigIds.has(t.configId));
      if (filteredTranslations.length !== newTranslations.length) {
          changed = true;
      }

      if (changed) {
        return { ...prev, translations: filteredTranslations };
      }
      return prev;
    });
  }, [state.textConfigs.length, state.textConfigs]);

  const setArticleTitle = (title: string) => setState(prev => ({ ...prev, article: { ...prev.article, title } }));
  const setArticleContent = (content: string) => setState(prev => ({ ...prev, article: { ...prev.article, content } }));
  const setArticleUrl = (url: string) => setState(prev => ({ ...prev, article: { ...prev.article, url } }));

  const addTextConfig = (config: TextConfig) => setState(prev => ({ ...prev, textConfigs: [...prev.textConfigs, config] }));
  
  const updateTextConfig = (config: TextConfig) => setState(prev => ({
    ...prev,
    textConfigs: prev.textConfigs.map(c => c.id === config.id ? config : c)
  }));

  const deleteTextConfig = (id: string) => setState(prev => ({
    ...prev,
    textConfigs: prev.textConfigs.filter(c => c.id !== id)
  }));

  const setImageConfigPrompt = (prompt: string) => setState(prev => ({
    ...prev,
    imageConfig: { prompt }
  }));

  const updateTranslation = (translation: Translation) => setState(prev => ({
    ...prev,
    translations: prev.translations.map(t => t.configId === translation.configId ? translation : t)
  }));

  const resetTranslations = () => setState(prev => ({
      ...prev,
      translations: prev.textConfigs.map(cfg => ({ configId: cfg.id, title: '', content: '' }))
  }));

  const addImage = (image: AppImage) => setState(prev => ({ ...prev, images: [...prev.images, image] }));
  
  const updateImage = (image: AppImage) => setState(prev => ({
    ...prev,
    images: prev.images.map(i => i.id === image.id ? image : i)
  }));

  const removeImage = (id: string) => setState(prev => ({
    ...prev,
    images: prev.images.filter(i => i.id !== id)
  }));

  const setElevenLabsApiKey = (key: string) => setState(prev => ({ ...prev, elevenLabsApiKey: key }));

  return (
    <AppContext.Provider value={{
      ...state,
      setArticleTitle,
      setArticleContent,
      setArticleUrl,
      addTextConfig,
      updateTextConfig,
      deleteTextConfig,
      setImageConfigPrompt,
      updateTranslation,
      addImage,
      updateImage,
      removeImage,
      resetTranslations,
      setElevenLabsApiKey,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within AppProvider");
  return context;
};