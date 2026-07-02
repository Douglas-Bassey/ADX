const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const responseBox = document.getElementById("chat-response");
const conversationList = document.getElementById("conversation-list");
const mobileConversationList = document.getElementById(
  "mobile-conversation-list",
);
const newChatBtn = document.getElementById("new-chat-btn");
const mobileNewChatBtn = document.getElementById("mobile-new-chat-btn");
const STORAGE_KEY = "engineConversationId";
let activeConversation = null;

const formatMessageContent = (content = "") => {
  const escapedText = String(content)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escapedText
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n/g, "<br>");
};

const getConversationTimestamp = (conversation) => {
  const rawTime = conversation?.updatedAt || conversation?.createdAt || 0;
  return new Date(rawTime).getTime();
};

const sortConversations = (conversations = []) => {
  return [...conversations].sort(
    (left, right) =>
      getConversationTimestamp(right) - getConversationTimestamp(left),
  );
};

const toggleSidebar = () => {
  if (window.innerWidth < 992) return;

  document.querySelector(".app-layout")?.classList.toggle("sidebar-collapsed");
};

const renderConversation = (conversation, options = {}) => {
  if (!responseBox) return;

  const messages = [...(conversation?.messages || [])];

  if (options.pendingMessage) {
    messages.push({ role: "user", content: options.pendingMessage });
  }

  if (options.isThinking) {
    messages.push({ role: "assistant", content: "Thinking..." });
  }

  if (options.errorMessage) {
    messages.push({ role: "assistant", content: options.errorMessage });
  }

  if (!messages.length) {
    responseBox.innerHTML =
      '<div class="chat-bubble assistant">Ask me an engineering question.</div>';
    return;
  }

  responseBox.innerHTML = messages
    .map((message) => {
      const formattedContent = formatMessageContent(message.content);
      return `<div class="chat-bubble ${message.role}">${formattedContent}</div>`;
    })
    .join("");
};

const renderHistory = (conversations) => {
  const sortedConversations = sortConversations(conversations);
  const listMarkup = sortedConversations
    .map((conversation) => {
      const title = conversation.title || "New conversation";
      const isActive = conversation._id === conversationId;
      return `<button class="recent-item ${isActive ? "active" : ""}" data-id="${conversation._id}" type="button">${title}</button>`;
    })
    .join("");

  if (conversationList) {
    conversationList.innerHTML = listMarkup;
  }

  if (mobileConversationList) {
    mobileConversationList.innerHTML = listMarkup;
  }
};

const loadHistory = async () => {
  try {
    const res = await fetch("/api/conversations");
    if (!res.ok) return;
    const conversations = await res.json();
    renderHistory(conversations);
  } catch (error) {
    console.error("Unable to load conversations", error);
  }
};

const createConversation = async () => {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Unable to start a conversation");
  }

  return res.json();
};

const sendMessage = async (conversationId, message) => {
  const res = await fetch("/api/conversations/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, message }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Unable to get a response");
  }

  return res.json();
};

const loadConversation = async (id) => {
  try {
    const res = await fetch(`/api/conversations/${id}`);

    if (!res.ok) {
      throw new Error("Unable to load conversation");
    }

    const conversationData = await res.json();
    activeConversation = conversationData;
    renderConversation(activeConversation);
  } catch (error) {
    renderConversation(activeConversation || { messages: [] });
  }
};

let conversationId = localStorage.getItem(STORAGE_KEY);

const setInputBusyState = (isBusy) => {
  const promptBox = document.querySelector(".prompt-box");
  if (!promptBox) return;

  promptBox.style.display = isBusy ? "none" : "block";
};

const startNewConversation = async () => {
  conversationId = null;
  activeConversation = null;
  localStorage.removeItem(STORAGE_KEY);
  responseBox.innerHTML =
    '<div class="chat-bubble assistant">Ask me an engineering question.</div>';
  input.value = "";
  setInputBusyState(false);
  await loadHistory();
};

const handleSend = async () => {
  const message = input?.value.trim();

  if (!message) return;

  renderConversation(activeConversation || { messages: [] }, {
    pendingMessage: message,
    isThinking: true,
  });
  sendBtn.disabled = true;
  setInputBusyState(true);

  try {
    if (!conversationId) {
      const conversation = await createConversation();
      conversationId = conversation._id;
      localStorage.setItem(STORAGE_KEY, conversationId);
    }

    const result = await sendMessage(conversationId, message);
    activeConversation = result.conversation;
    renderConversation(activeConversation);
    await loadHistory();
  } catch (error) {
    renderConversation(activeConversation || { messages: [] }, {
      pendingMessage: message,
      errorMessage: error.message || "Unable to reach the assistant right now.",
    });
  } finally {
    input.value = "";
    sendBtn.disabled = false;
    setInputBusyState(false);
  }
};

if (conversationId) {
  loadConversation(conversationId);
}

loadHistory();

sendBtn?.addEventListener("click", handleSend);
input?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSend();
  }
});

newChatBtn?.addEventListener("click", startNewConversation);
mobileNewChatBtn?.addEventListener("click", startNewConversation);
document.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
  button.addEventListener("click", toggleSidebar);
});

document.addEventListener("click", async (event) => {
  const target = event.target.closest(".recent-item");
  if (!target) return;

  const selectedId = target.getAttribute("data-id");
  if (!selectedId) return;

  conversationId = selectedId;
  localStorage.setItem(STORAGE_KEY, selectedId);
  await loadConversation(selectedId);
  await loadHistory();
});
