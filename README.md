# English AI Coach - Gemini

1. Run `npm install`
2. Create a Gemini API key at https://aistudio.google.com/apikey
3. Create `.env.local`:
   `GEMINI_API_KEY=your_key_here`
4. Run `npm run dev`
5. Open http://localhost:3000

This version replaces OpenAI with Google's Gemini API. It uses `gemini-3.8-flash` for English correction and browser speech recognition. Free-tier availability and limits are controlled by Google and can change.