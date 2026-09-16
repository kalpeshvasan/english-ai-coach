"use client";

import { useState } from "react";
import VoiceButton from "./VoiceButton";

export default function EnglishCoach() {
  const [message, setMessage] = useState("");
  const [coachResponse, setCoachResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const copyCorrection = async () => {
    try {
      const correction =
        coachResponse
          .match(
            /CORRECTION:\s*([\s\S]*?)(?=EXPLANATION:|$)/i
          )?.[1]
          ?.trim() || "";

      if (!correction) return;

      await navigator.clipboard.writeText(correction);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();

    if (!trimmedText || loading) {
      return;
    }

    setMessage(trimmedText);
    setCoachResponse("");
    setError("");
    setCopied(false);
    setLoading(true);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedText,
        }),
      });

      const data = await response.json();

      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (!data.reply) {
        throw new Error("Gemini returned an empty response");
      }

      setCoachResponse(data.reply);
    } catch (error) {
      console.error("Coach error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(message);
  };

  const handleVoiceResult = async (text: string) => {
    await sendMessage(text);
  };

  const formatResponse = (response: string) => {
    const correction =
      response.match(
        /CORRECTION:\s*([\s\S]*?)(?=EXPLANATION:|$)/i
      )?.[1]?.trim() || "";

    const explanation =
      response.match(
        /EXPLANATION:\s*([\s\S]*?)(?=CONTINUE:|$)/i
      )?.[1]?.trim() || "";

    const continueText =
      response.match(
        /CONTINUE:\s*([\s\S]*)/i
      )?.[1]?.trim() || "";

    return {
      correction,
      explanation,
      continueText,
    };
  };

  const parsed = coachResponse
    ? formatResponse(coachResponse)
    : null;

  return (
    <main className="coach-page">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <section className="coach-container">

        {/* Header */}
        <header className="coach-header">
          <div className="brand">
            <div className="brand-icon">✨</div>

            <div>
              <h1>English Coach</h1>
              <p>Practice English with AI</p>
            </div>
          </div>

          <div className="online-status">
            <span />
            Online
          </div>
        </header>

        {/* Welcome */}
        <div className="welcome-section">
          <div className="coach-avatar">
            🤖
          </div>

          <div>
            <h2>Hi! I&apos;m your English coach 👋</h2>

            <p>
              Speak naturally and I&apos;ll help you improve your
              grammar, vocabulary and sentence structure.
            </p>
          </div>
        </div>

        {/* Conversation */}
        <div className="conversation">

          {/* User message */}
          {message && (
            <div className="message-row user-row">
              <div className="message user-message">
                <div className="message-label">
                  You
                </div>

                <p>{message}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="message-row">
              <div className="message ai-message loading-message">
                <div className="message-label">
                  AI Coach
                </div>

                <div className="typing">
                  <span />
                  <span />
                  <span />
                </div>

                <p>Checking your English...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-box">
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          )}

          {/* AI response */}
          {parsed && !loading && (
            <div className="ai-response">

              {/* Correction */}
              <div className="feedback-card correction-card">

                <div className="feedback-header">
                  <div className="feedback-icon">
                    ✓
                  </div>

                  <div className="feedback-title">
                    <div>
                      <span>Correction</span>
                      <small>Your improved sentence</small>
                    </div>

                    {/* Copy button */}
                    <button
                      type="button"
                      className="copy-button"
                      onClick={copyCorrection}
                      title="Copy correction"
                    >
                      {copied ? (
                        <>
                          ✓ Copied
                        </>
                      ) : (
                        <>
                          📋 Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="correction-text">
                  {parsed.correction || coachResponse}
                </p>
              </div>

              {/* Explanation */}
              {parsed.explanation && (
                <div className="feedback-card explanation-card">
                  <div className="feedback-header">
                    <div className="feedback-icon">
                      💡
                    </div>

                    <div>
                      <span>Explanation</span>
                      <small>Simple explanation</small>
                    </div>
                  </div>

                  <p>
                    {parsed.explanation}
                  </p>
                </div>
              )}

              {/* Continue */}
              {parsed.continueText && (
                <div className="feedback-card continue-card">
                  <div className="feedback-header">
                    <div className="feedback-icon">
                      💬
                    </div>

                    <div>
                      <span>Let&apos;s continue</span>
                      <small>Keep practicing</small>
                    </div>
                  </div>

                  <p className="question-text">
                    {parsed.continueText}
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Input */}
        <form
          className="input-section"
          onSubmit={handleSubmit}
        >
          <div className="input-wrapper">

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Type something in English..."
              rows={3}
              disabled={loading}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  handleSubmit(
                    e as unknown as React.FormEvent
                  );
                }
              }}
            />

            <div className="input-actions">

              <VoiceButton
                onResult={handleVoiceResult}
              />

              <button
                type="submit"
                className="send-button"
                disabled={
                  loading || !message.trim()
                }
              >
                {loading ? (
                  <span className="button-spinner" />
                ) : (
                  <>
                    Send
                    <span>➤</span>
                  </>
                )}
              </button>

            </div>
          </div>

          <div className="input-hint">
            <span>🎙️</span>
            You can type or speak in English
          </div>
        </form>

      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .coach-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;

          background:
            radial-gradient(
              circle at top left,
              #e0e7ff 0%,
              transparent 35%
            ),
            radial-gradient(
              circle at bottom right,
              #dff7ff 0%,
              transparent 35%
            ),
            #f8fafc;

          padding: 40px 20px;
          color: #172033;
        }

        .background-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
          pointer-events: none;
        }

        .glow-one {
          background: #818cf8;
          top: -200px;
          left: -150px;
        }

        .glow-two {
          background: #38bdf8;
          bottom: -200px;
          right: -150px;
        }

        .coach-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          min-height: calc(100vh - 80px);
          margin: auto;

          display: flex;
          flex-direction: column;

          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(20px);

          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 28px;

          box-shadow:
            0 25px 70px rgba(15, 23, 42, 0.12);

          overflow: hidden;
        }

        /* Header */

        .coach-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding: 22px 28px;

          border-bottom: 1px solid #eef0f4;
          background: rgba(255, 255, 255, 0.7);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: linear-gradient(
            135deg,
            #6366f1,
            #8b5cf6
          );

          font-size: 21px;

          box-shadow:
            0 8px 20px rgba(99, 102, 241, 0.3);
        }

        .brand h1 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .brand p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .online-status {
          display: flex;
          align-items: center;
          gap: 7px;

          padding: 7px 12px;

          border-radius: 20px;

          background: #f0fdf4;
          color: #15803d;

          font-size: 12px;
          font-weight: 600;
        }

        .online-status span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        /* Welcome */

        .welcome-section {
          display: flex;
          align-items: center;
          gap: 16px;

          margin: 24px 28px 10px;
          padding: 20px;

          border-radius: 18px;

          background: linear-gradient(
            135deg,
            #eef2ff,
            #f5f3ff
          );

          border: 1px solid #e0e7ff;
        }

        .coach-avatar {
          flex-shrink: 0;

          width: 52px;
          height: 52px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          background: white;

          font-size: 26px;

          box-shadow:
            0 5px 15px rgba(99, 102, 241, 0.12);
        }

        .welcome-section h2 {
          margin: 0 0 5px;

          font-size: 17px;
          font-weight: 700;
        }

        .welcome-section p {
          margin: 0;

          font-size: 13px;
          line-height: 1.6;

          color: #64748b;
        }

        /* Conversation */

        .conversation {
          flex: 1;
          padding: 10px 28px 20px;

          overflow-y: auto;
        }

        .message-row {
          display: flex;
          margin-top: 16px;
        }

        .user-row {
          justify-content: flex-end;
        }

        .message {
          max-width: 75%;
          padding: 14px 17px;
          border-radius: 18px;

          line-height: 1.6;
          font-size: 14px;
        }

        .message-label {
          margin-bottom: 4px;

          font-size: 11px;
          font-weight: 700;
          opacity: 0.7;
        }

        .message p {
          margin: 0;
        }

        .user-message {
          color: white;

          background: linear-gradient(
            135deg,
            #6366f1,
            #7c3aed
          );

          border-bottom-right-radius: 5px;

          box-shadow:
            0 7px 18px rgba(99, 102, 241, 0.2);
        }

        .ai-message {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 5px;
        }

        .ai-message p {
          color: #64748b;
          font-size: 12px;
        }

        /* Loading */

        .typing {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
        }

        .typing span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #6366f1;

          animation: typing 1.2s infinite;
        }

        .typing span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }

          30% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }

        /* AI response */

        .ai-response {
          margin-top: 18px;

          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feedback-card {
          padding: 18px;

          border-radius: 18px;

          background: white;

          border: 1px solid #e5e7eb;

          box-shadow:
            0 5px 20px rgba(15, 23, 42, 0.04);
        }

        .feedback-header {
          display: flex;
          align-items: center;
          gap: 11px;

          margin-bottom: 12px;
        }

        .feedback-icon {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 10px;

          background: #f1f5f9;

          font-size: 15px;
        }

        .feedback-header span {
          display: block;

          font-size: 13px;
          font-weight: 700;
        }

        .feedback-header small {
          display: block;

          margin-top: 2px;

          color: #94a3b8;

          font-size: 11px;
        }

        /* Header content + copy button */

        .feedback-title {
          flex: 1;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 10px;
        }

        .copy-button {
          display: flex;
          align-items: center;
          justify-content: center;

          padding: 7px 11px;

          border: 1px solid #dbe1ea;
          border-radius: 8px;

          background: #f8fafc;

          color: #475569;

          font-size: 11px;
          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s,
            border-color 0.2s,
            transform 0.15s;
        }

        .copy-button:hover {
          background: #eef2ff;
          border-color: #c7d2fe;
          color: #4f46e5;
        }

        .copy-button:active {
          transform: scale(0.96);
        }

        .feedback-card p {
          margin: 0;

          font-size: 14px;
          line-height: 1.7;

          color: #475569;
        }

        .correction-card {
          border-left: 4px solid #22c55e;
        }

        .correction-card .feedback-icon {
          background: #dcfce7;
        }

        .correction-text {
          color: #166534 !important;
          font-weight: 600;
        }

        .explanation-card {
          border-left: 4px solid #f59e0b;
        }

        .explanation-card .feedback-icon {
          background: #fef3c7;
        }

        .continue-card {
          border-left: 4px solid #6366f1;
        }

        .continue-card .feedback-icon {
          background: #e0e7ff;
        }

        .question-text {
          color: #4338ca !important;
          font-weight: 600;
        }

        /* Error */

        .error-box {
          margin-top: 18px;
          padding: 15px;

          border-radius: 14px;

          background: #fef2f2;
          border: 1px solid #fecaca;

          color: #991b1b;
        }

        .error-box strong {
          font-size: 13px;
        }

        .error-box p {
          margin: 5px 0 0;

          font-size: 12px;
        }

        /* Input */

        .input-section {
          padding: 20px 28px 24px;

          border-top: 1px solid #eef0f4;

          background: rgba(255, 255, 255, 0.8);
        }

        .input-wrapper {
          position: relative;

          padding: 5px;

          border: 1px solid #dbe1ea;
          border-radius: 18px;

          background: white;

          box-shadow:
            0 8px 25px rgba(15, 23, 42, 0.06);

          transition:
            border 0.2s,
            box-shadow 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: #818cf8;

          box-shadow:
            0 8px 30px rgba(99, 102, 241, 0.12);
        }

        textarea {
          display: block;

          width: 100%;

          padding: 12px 14px;

          border: none;
          outline: none;

          resize: none;

          font-family: inherit;
          font-size: 14px;

          color: #172033;

          background: transparent;
        }

        textarea::placeholder {
          color: #94a3b8;
        }

        .input-actions {
          display: flex;

          justify-content: flex-end;
          align-items: center;

          gap: 8px;

          padding: 4px;
        }

        .send-button {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          min-width: 90px;

          padding: 10px 16px;

          border: none;
          border-radius: 11px;

          background: linear-gradient(
            135deg,
            #6366f1,
            #7c3aed
          );

          color: white;

          font-size: 13px;
          font-weight: 600;

          cursor: pointer;

          transition:
            transform 0.15s,
            box-shadow 0.15s;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 6px 15px
              rgba(99, 102, 241, 0.3);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 14px;
          height: 14px;

          border: 2px solid
            rgba(255, 255, 255, 0.4);

          border-top-color: white;

          border-radius: 50%;

          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .input-hint {
          display: flex;
          justify-content: center;
          align-items: center;

          gap: 5px;

          margin-top: 9px;

          color: #94a3b8;

          font-size: 11px;
        }

        /* Mobile */

        @media (max-width: 640px) {
          .coach-page {
            padding: 0;
          }

          .coach-container {
            min-height: 100vh;
            border-radius: 0;
          }

          .coach-header {
            padding: 18px;
          }

          .welcome-section {
            margin: 18px;
          }

          .conversation {
            padding: 5px 18px 15px;
          }

          .input-section {
            padding: 15px 18px 20px;
          }

          .message {
            max-width: 90%;
          }

          .online-status {
            display: none;
          }

          .copy-button {
            padding: 6px 8px;
            font-size: 10px;
          }
        }
      `}</style>
    </main>
  );
}