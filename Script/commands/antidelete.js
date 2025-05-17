const fs = require("fs");

module.exports.config = {
  name: "antidelete",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "January",
  description: "Pokazuje usuniętą wiadomość",
  commandCategory: "narzędzia",
  usages: "",
  cooldowns: 0
};

let cache = {};

module.exports.handleEvent = async function({ event, api }) {
  const { messageID, threadID, senderID, body, type, attachments } = event;

  // Zapisujemy wiadomość zanim zostanie usunięta
  if (body || attachments.length > 0) {
    cache[messageID] = {
      senderID,
      body,
      type,
      attachments,
      timestamp: Date.now()
    };

    // Czyścimy cache starsze niż 10 minut
    for (let id in cache) {
      if (Date.now() - cache[id].timestamp > 10 * 60 * 1000) delete cache[id];
    }
  }

  // Nasłuchiwanie usunięcia wiadomości
  if (event.type === "message_unsend") {
    const deleted = cache[event.messageID];
    if (!deleted) return;

    let msg = `Wiadomość usunięta przez ${deleted.senderID}:\n`;

    if (deleted.body) msg += `Tekst: ${deleted.body}\n`;

    // Obsługa załączników
    for (const file of deleted.attachments) {
      if (file.type === "photo" || file.type === "audio") {
        const url = file.url;
        msg += `Załącznik (${file.type}): ${url}\n`;
      }
    }

    api.sendMessage(msg, threadID);
  }
};

module.exports.run = () => {};
