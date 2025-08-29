// Add type definitions for the Web Speech API
interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
  emma: Document | null;
}

interface CustomSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onend: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onnomatch: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: CustomSpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: CustomSpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

// Alias the custom interface to the expected name
type SpeechRecognition = CustomSpeechRecognition;
