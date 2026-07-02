import dotenv from "dotenv";

dotenv.config();

const sanitizeReplyText = (text) => {
  if (!text || typeof text !== "string") return "No response generated.";

  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const generateGeminiReply = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return "ENGINE is ready to help with engineering questions. Add a real Gemini API key in the backend .env file to enable live AI responses.";
  }

  const engineeringPrompt = `You are ENGINE, a technical engineering assistant. Respond clearly and precisely to engineering questions. Use plain text only. Do not use markdown stars, bold, headers, or bullet lists. Write in short paragraphs and keep the structure simple. If helpful, use short labels like "Answer:" and "Why it matters:". User question: ${prompt}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: engineeringPrompt }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini request failed");
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    return sanitizeReplyText(text);
  } catch (error) {
    return `ENGINE could not produce a technical answer. ${error.message}`;
  }
};
