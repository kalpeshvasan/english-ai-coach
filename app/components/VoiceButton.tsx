"use client";

import { useRef, useState } from "react";

type Props = {
  onResult: (text: string) => void;
  disabled?: boolean;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export default function VoiceButton({ onResult, disabled = false }: Props) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const stopListening = () => {
    const recognition = recognitionRef.current;

    if (recognition) {
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    }

    setListening(false);
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    stopListening();

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const trimmed = transcript.trim();

      if (trimmed) {
        onResult(trimmed);
      }
    };

    recognition.onerror = () => {
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      disabled={disabled}
      className={`voiceButton ${listening ? "listening" : ""}`}
    >
      {listening ? "Stop Listening" : "Start Speaking"}
    </button>
  );
}