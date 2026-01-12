
const API_URL = "https://api.elevenlabs.io/v1";

export const generateSpeech = async (
  text: string,
  apiKey: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM" // Rachel - default voice
): Promise<string> => {
  if (!apiKey) throw new Error("ElevenLabs API Key is missing");
  
  const response = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail?.message || "ElevenLabs API failed");
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const getVoices = async (apiKey: string) => {
    if (!apiKey) return [];
    try {
        const response = await fetch(`${API_URL}/voices`, {
            headers: { "xi-api-key": apiKey }
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.voices;
    } catch (e) {
        console.error(e);
        return [];
    }
}
