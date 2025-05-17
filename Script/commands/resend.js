module.exports.config = {
  name: "resend",
  version: "1.1.1",
  hasPermission: 0,
  credits: "Zetsu + ChatGPT",
  description: "Pokazuje wiadomość usuniętą przez użytkownika",
  commandCategory: "group",
  usages: "/resend",
  cooldowns: 3
};

const cache = new Map();
const MAX_CACHE_SIZE = 1000;

module.exports.handleEvent = async function ({ event, api, Users }) {
  const { messageID, threadID, senderID, type, body, attachments } = event;

  // Włącznik komendy
  if (!global.data.resend) global.data.resend = {};
  if (!global.data.resend[threadID]) return;

  // Obsługa usunięcia wiadomości
  if (type === "message_unsend") {
    const cached = cache.get(messageID);
    if (!cached) return;

    const senderName = (await Users.getNameUser(cached.senderID)) || "Użytkownik";
    const mentions = [{
      tag: `@${senderName}`,
      id: cached.senderID
    }];

    let msg = `@${senderName} usunął wiadomość:\n`;
    if (cached.body) msg += cached.body;

    if (cached.attachments.length > 0) {
      // Pobierz URL-e jako strumienie lub bufor (jeśli bot to wspiera)
      const attachmentsToSend = cached.attachments.map(a => a.url);
      return api.sendMessage({ body: msg, mentions, attachment: attachmentsToSend }, threadID);
    } else {
      return api.sendMessage({ body: msg, mentions }, threadID);
    }
  }

  // Obsługa zwykłej wiadomości (zapamiętaj)
  if (type === "message") {
    if (cache.size > MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(messageID, {
      senderID,
      body: body || "",
      attachments: attachments || []
    });
  }
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;

  if (!global.data.resend) global.data.resend = {};
  const isActive = global.data.resend[threadID];

  global.data.resend[threadID] = !isActive;

  return api.sendMessage(
    `Funkcja resend została ${!isActive ? "włączona" : "wyłączona"} w tym wątku.`,
    threadID
  );
};
