export function startVoiceRecognition(
  onResult: (transcript: string) => void,
  onError?: (error: unknown) => void
): (() => void) | null {
  // Use a generic constructor type to avoid TypeScript issues with SpeechRecognition
  type SpeechRecognitionCtor = new () => {
    lang: string;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
    onerror: ((event: { error: unknown }) => void) | null;
    start: () => void;
    stop: () => void;
  };

  const win = window as unknown as {
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    SpeechRecognition?: SpeechRecognitionCtor;
  };

  const SpeechRecognitionAPI = win.webkitSpeechRecognition || win.SpeechRecognition;

  if (!SpeechRecognitionAPI) {
    if (onError) onError(new Error('Speech recognition not supported in this browser'));
    return null;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.start();

  return () => {
    try {
      recognition.stop();
    } catch {
      // ignore
    }
  };
}

export interface ParsedDonation {
  foodType?: string;
  quantity?: number;
  timeSinceCooked?: number;
}

export function parseDonateSpeech(transcript: string): ParsedDonation {
  const lower = transcript.toLowerCase();
  const result: ParsedDonation = {};

  // Food type detection
  const foodTypes = ['rice', 'curry', 'bread', 'desserts', 'vegetables', 'fish', 'dairy'];
  for (const ft of foodTypes) {
    if (lower.includes(ft)) {
      result.foodType = ft;
      break;
    }
  }
  if (!result.foodType) {
    if (lower.includes('roti') || lower.includes('chapati')) result.foodType = 'bread';
    else if (lower.includes('sabzi') || lower.includes('veggie')) result.foodType = 'vegetables';
    else if (lower.includes('sweet') || lower.includes('mithai')) result.foodType = 'desserts';
    else if (lower.includes('milk') || lower.includes('paneer') || lower.includes('curd')) result.foodType = 'dairy';
  }

  // Quantity detection
  const qtyMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo|kilogram)/);
  if (qtyMatch) {
    result.quantity = parseFloat(qtyMatch[1]);
  } else {
    const numMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:portion|serving|plate|meal)/);
    if (numMatch) {
      result.quantity = parseFloat(numMatch[1]) * 0.3;
    }
  }

  // Time since cooked
  const timeMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr)/);
  if (timeMatch) {
    result.timeSinceCooked = parseFloat(timeMatch[1]);
  }

  return result;
}

export function speakImpactSummary(city: string, mealCount: number, peopleCount: number): void {
  if (!window.speechSynthesis) return;

  const text = `Today in ${city}, ${mealCount.toLocaleString()} meals were saved, helping over ${peopleCount.toLocaleString()} people.`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
