"use client";

import { useRef, useState } from "react";

type Props = {
  onResult: (text: string) => void | Promise<void>;
};

export default function VoiceButton({ onResult }: Props) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const playSound = (type: "start" | "stop") => {
    const AudioContext =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "start") {
      // 🔊 Higher beep
      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.15
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } else {
      // 🔊 Lower boop
      oscillator.frequency.value = 400;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.2
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognitionRef.current = recognition;

    // 🔊 Start beep
    playSound("start");

    // 🎤 Start listening after beep
    setTimeout(() => {
      recognition.start();
      setIsListening(true);
    }, 150);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      onResult(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // 🔊 Stop boop
    playSound("stop");

    // 🛑 Stop listening
    setIsListening(false);
  };

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      style={{
        padding: "12px 20px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        background: isListening ? "#fee2e2" : "#111827",
        color: isListening ? "#dc2626" : "white",
        fontWeight: 600,
      }}
    >
      {isListening ? "🛑 Stop Speaking" : "🎤 Start Speaking"}
    </button>
  );
}