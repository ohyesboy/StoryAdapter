
const API_URL = "https://api.elevenlabs.io/v1";

export const generateSpeech = async (
  text: string,
  apiKey: string,
  voiceId: string = "21m00Tcm4TlvDq8ikWAM", // Rachel - default voice
  modelId: string = "eleven_monolingual_v1",
  stability: number = 0.5,
  speed: number = 1.0,
  voiceId2?: string
): Promise<string> => {
  if (!apiKey) throw new Error("ElevenLabs API Key is missing");

  const parts = text.split(/(\[Speaker[12]\])/g);
  let currentSpeaker = 1;
  const inputs: any[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part === "[Speaker1]") {
        currentSpeaker = 1;
    } else if (part === "[Speaker2]") {
        currentSpeaker = 2;
    } else if (part) {
        const currentVoiceId = currentSpeaker === 2 ? (voiceId2 || voiceId) : voiceId;
        inputs.push({ text: part, voice_id: currentVoiceId });
    }
  }

  console.log(`[ElevenLabs] Generating dialogue with ${inputs.length} segments.`);
  
  const response = await fetch(`${API_URL}/text-to-dialogue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      inputs,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: 0.75,
        speed,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail?.message || "ElevenLabs Dialog API failed");
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
        console.log(`[ElevenLabs] Fetched ${data.voices?.length || 0} voices`);
        return data.voices.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } catch (e) {
        console.error("Error fetching voices:", e);
        return [];
    }
}
