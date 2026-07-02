import { Conversation } from "../models/conversation.js";
import { generateGeminiReply } from "../services/geminiService.js";

export const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create({
      title: "New conversation",
      messages: [],
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ createdAt: -1 });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (!conversationId || !trimmedMessage) {
      return res
        .status(400)
        .json({ message: "conversationId and message are required" });
    }

    let conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.messages.push({ role: "user", content: trimmedMessage });

    const reply = await generateGeminiReply(trimmedMessage);

    conversation.messages.push({ role: "assistant", content: reply });

    if (conversation.title === "New conversation") {
      conversation.title = trimmedMessage.slice(0, 40);
    }

    await conversation.save();

    res.status(200).json({ conversation, reply });
  } catch (error) {
    res
      .status(502)
      .json({ message: "Gemini request failed", error: error.message });
  }
};
