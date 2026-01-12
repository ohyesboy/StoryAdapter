export interface TextConfig {
  id: string;
  name: string;
  prompt: string;
}

export interface ImageConfig {
  prompt: string;
}

export interface Translation {
  configId: string;
  title: string;
  content: string;
  voiceFile?: string; // Base64 data URI
  srtContent?: string;
  isGenerating?: boolean;
  isVoiceGenerating?: boolean;
  isSrtGenerating?: boolean;
  speed?: number; // Voice generation speed
}

export interface AppImage {
  id: string;
  originalUrl: string; // Base64 or URL
  generatedUrl?: string; // Base64
  isGenerating?: boolean;
}

export interface Article {
  title: string;
  content: string;
  url?: string;
}

export interface VoiceSettings {
  voiceId: string;
  language: string;
  playbackSpeed: number;
  stability: number;
  readTitle: boolean;
}

export interface AppState {
  article: Article;
  translations: Translation[];
  images: AppImage[];
  textConfigs: TextConfig[];
  imageConfig: ImageConfig;
  elevenLabsApiKey: string; // Allow user override if needed, though env is preferred
  voiceSettings: VoiceSettings;
}

export const DEFAULT_TEXT_CONFIG: TextConfig = {
  id: 'default-chinese',
  name: 'Chinese Beginner Summary',
  prompt: 'Gather the title, the content of this news, translated into Chinese and rewrite into a shorter version for Chinese language learning for beginner level. using narrators perspective, do not incude and dialog. Show translated/edited title and contnet in Chinese, do not append English or pingyin.'
};

export const DEFAULT_IMAGE_CONFIG: ImageConfig = {
  prompt: 'Generate this image in "Editorial Vector" Style'
};

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - default voice
  language: "en",
  playbackSpeed: 1.0,
  stability: 0.5,
  readTitle: false,
};
