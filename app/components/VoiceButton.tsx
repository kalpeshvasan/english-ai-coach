 "use client";

type Props = { listening: boolean; onStart: () => void; onStop: () => void };

export default function VoiceButton({ listening, onStart, onStop }: Props) {
  return (
    <button onClick={listening ? onStop : onStart} className={`voiceButton ${listening ? "listening" : ""}`}>
      {listening ? "Stop Listening" : "Start Speaking"}
    </button>
  );
}