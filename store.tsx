import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, DEFAULT_IMAGE_CONFIG, DEFAULT_SRT_CONFIG, DEFAULT_TEXT_CONFIG, DEFAULT_VOICE_SETTINGS, Translation, AppImage, TextConfig, SrtConfig, VoiceSettings, DEFAULT_TEXT_CONFIG2 } from './types';

interface AppContextType extends AppState {
  setArticleId: (id: string) => void;
  setArticleTitle: (title: string) => void;
  setArticleContent: (content: string) => void;
  setArticleUrl: (url: string) => void;
  addTextConfig: (config: TextConfig) => void;
  updateTextConfig: (config: TextConfig) => void;
  deleteTextConfig: (id: string) => void;
  setImageConfigPrompt: (prompt: string) => void;
  setSrtConfigPrompt: (prompt: string) => void;
  updateTranslation: (translation: Translation) => void;
  addImage: (image: AppImage) => void;
  updateImage: (image: AppImage) => void;
  removeImage: (id: string) => void;
  resetTranslations: () => void;
  resetArticle: () => void;
  setElevenLabsApiKey: (key: string) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  login: (password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'article_adapter_session_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsedState = JSON.parse(saved);
      // Ensure voiceSettings exists for backward compatibility
      if (!parsedState.voiceSettings) {
        parsedState.voiceSettings = DEFAULT_VOICE_SETTINGS;
      }
      if (typeof parsedState.isAuthenticated === 'undefined') {
        parsedState.isAuthenticated = false;
      }
      if (!parsedState.srtConfig) {
        parsedState.srtConfig = DEFAULT_SRT_CONFIG;
      }
      return parsedState;
    }
    return {
      article: { title: '', content: '', url: '' },
      translations: [],
      images: [],
      isAuthenticated: false,
      textConfigs: [DEFAULT_TEXT_CONFIG,DEFAULT_TEXT_CONFIG2],
      imageConfig: DEFAULT_IMAGE_CONFIG,
      srtConfig: DEFAULT_SRT_CONFIG,
      elevenLabsApiKey: process.env.EL_API_KEY || process.env.ELEVENLABS_API_KEY || '',
      voiceSettings: DEFAULT_VOICE_SETTINGS,
    };
  });

  useEffect(() => {
    try {
      // Create a lightweight version of state to save
      // Exclude large binary data like audio files to prevent QuotaExceededError
      const stateToSave = {
        ...state,
        translations: state.translations.map(t => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { voiceFile, ...rest } = t; 
          return rest;
        }),
        // Also limit images if they are too large, but lets start with audio
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Failed to save state to localStorage (Quota Exceeded):", e);
    }
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

  const setArticleId = (id: string) => setState(prev => ({ ...prev, article: { ...prev.article, id } }));
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

  const setSrtConfigPrompt = (prompt: string) => setState(prev => ({
    ...prev,
    srtConfig: { prompt }
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

  const resetArticle = () => setState(prev => ({
    ...prev,
    article: { title: '', content: '', url: '' },
    translations: prev.textConfigs.map(cfg => ({ configId: cfg.id, title: '', content: '' })),
    images: []
  }));

  const updateVoiceSettings = (settings: Partial<VoiceSettings>) => setState(prev => ({
    ...prev,
    voiceSettings: { ...prev.voiceSettings, ...settings }
  }));

  const login = (password: string) => {
    // @ts-ignore
    const envPassword = process.env.PASSWORD;
    if (!envPassword || password === envPassword) {
      setState(prev => ({ ...prev, isAuthenticated: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setState(prev => ({ ...prev, isAuthenticated: false }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setArticleId,
      setArticleTitle,
      setArticleContent,
      setArticleUrl,
      addTextConfig,
      updateTextConfig,
      deleteTextConfig,
      setImageConfigPrompt,
      setSrtConfigPrompt,
      updateTranslation,
      addImage,
      updateImage,
      removeImage,
      resetArticle,
      resetTranslations,
      setElevenLabsApiKey,
      updateVoiceSettings,
      login,
      logout
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