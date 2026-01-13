export interface TextConfig {
  id: string;
  name: string;
  prompt: string;
}

export interface ImageConfig {
  prompt: string;
}

export interface SrtConfig {
  prompt: string;
}

export interface YoutubeConfig {
  prompt: string;
}

export interface Translation {
  configId: string;
  title: string;
  content: string;
  voiceFile?: string; // Base64 data URI
  srtContent?: string;
  youtubeMetadata?: string;
  isGenerating?: boolean;
  isVoiceGenerating?: boolean;
  isSrtGenerating?: boolean;
  isYoutubeGenerating?: boolean;
  speed?: number; // Voice generation speed
}

export interface AppImage {
  id: string;
  originalUrl: string; // Base64 or URL
  generatedUrl?: string; // Base64
  isGenerating?: boolean;
}

export interface Article {
  id?: string;
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
  isAuthenticated: boolean;
  textConfigs: TextConfig[];
  imageConfig: ImageConfig;
  srtConfig: SrtConfig;
  youtubeConfig: YoutubeConfig;
  elevenLabsApiKey: string; // Allow user override if needed, though env is preferred
  voiceSettings: VoiceSettings;
}

export const DEFAULT_TEXT_CONFIG: TextConfig = {
  id: 'zh_lv1',
  name: 'zh_lv1',
  prompt: 'Gather the title, the content of this news, translated into Chinese and rewrite into a shorter version for Chinese language learning for beginner level, about 200 Chinese characters. using narrators perspective, do not incude and dialog. Show translated/edited title and contnet in Chinese, do not append English or pingyin.'
};

export const DEFAULT_TEXT_CONFIG2: TextConfig = {
  id: 'zh_lv2',
  name: 'zh_lv2',
  prompt: 'Gather the title, the content of this news, translated into Chinese and rewrite into a shorter version for Chinese language learning for intermediate level, about 500 Chinese characters. using narrators perspective, do not incude and dialog. Show translated/edited title and contnet in Chinese, do not append English or pingyin.'
};


export const DEFAULT_IMAGE_CONFIG: ImageConfig = {
  prompt: 'Generate this image in "Editorial Vector" Style'
};

export const DEFAULT_SRT_CONFIG: SrtConfig = {
  prompt: `Listen to this audio file and generate an SRT (SubRip Subtitle) file content for it.
Ensure the timestamps are accurate and the text matches the spoken audio.
Ensure each subtitle block contains only ONE line of text.
Each line should not have more than 30 characters, try not to break at middle of clauses
Chinese characters should be in simplified Chinese
Only output the srt content`
};

export const DEFAULT_YOUTUBE_CONFIG: YoutubeConfig = {
    prompt: `I'm making a YouTube video to teach Chinese with news in slow speed. Please write suggested title and description. Give three suggestions for title. helps evaluate the HSK level.  Response in text that youtube supports in description, for example *text* for bold.

Here is the transcription:

`
};

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel - default voice
  language: "en",
  playbackSpeed: 1.0,
  stability: 0.5,
  readTitle: false,
};
