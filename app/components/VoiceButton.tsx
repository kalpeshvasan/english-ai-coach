"use client";

import { useRef, useState } from "react";

type Props = {
  onResult: (text: string) => void | Promise<void>;
};

export default function VoiceButton({ onResult }: Props) {
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");

  const playSound = (type: "start" | "stop") => {
    const AudioContext =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    if (!AudioContext) return;

    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "start") {
      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(
        0.15,
        audioContext.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.15
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } else {
      oscillator.frequency.value = 400;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(
        0.15,
        audioContext.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.2
      );

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }

    setTimeout(() => {
      audioContext.close();
    }, 300);
  };

  const createRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    // Important
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
      }

      if (finalTranscript) {
        transcriptRef.current += finalTranscript;
      }

      console.log(
        "Current transcript:",
        transcriptRef.current
      );
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");

      // If user has NOT clicked Stop,
      // restart recognition automatically.
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.log("Recognition restart:", error);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.log("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    return recognition;
  };

  const isListeningRef = useRef(false);

  const startListening = () => {
    if (isListeningRef.current) return;

    transcriptRef.current = "";

    const recognition = createRecognition();

    if (!recognition) return;

    recognitionRef.current = recognition;

    isListeningRef.current = true;
    setIsListening(true);

    // Start beep
    playSound("start");

    setTimeout(() => {
      try {
        recognition.start();
      } catch (error) {
        console.log("Recognition start error:", error);
      }
    }, 150);
  };

  const stopListening = () => {
    if (!isListeningRef.current) return;

    console.log(
      "Stopping speech. Final transcript:",
      transcriptRef.current
    );

    // Change state FIRST so onend doesn't restart recognition
    isListeningRef.current = false;
    setIsListening(false);

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Recognition stop error:", error);
      }

      recognitionRef.current = null;
    }

    // Stop beep
    playSound("stop");

    // Get complete transcript
    const finalText = transcriptRef.current.trim();

    console.log("Final text:", finalText);

    // Only NOW send to Gemini
    if (finalText) {
      onResult(finalText);
    }

    // Clear transcript for next recording
    transcriptRef.current = "";
  };

  return (
    <button
      type="button"
      onClick={
        isListening
          ? stopListening
          : startListening
      }
      style={{
        padding: "12px 20px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        background: isListening
          ? "#fee2e2"
          : "#111827",
        color: isListening
          ? "#dc2626"
          : "white",
        fontWeight: 600,
      }}
    >
      {isListening
        ? "🛑 Stop Speaking"
        : "🎤 Start Speaking"}
    </button>
  );
}