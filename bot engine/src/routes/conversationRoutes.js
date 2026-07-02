import express from "express";
import {
  createConversation,
  getConversationById,
  getConversations,
  sendMessage,
} from "../controllers/conversationController.js";
import { aiRateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/", createConversation);
router.get("/", getConversations);
router.post("/message", aiRateLimiter, sendMessage);
router.get("/:conversationId", getConversationById);

export default router;
