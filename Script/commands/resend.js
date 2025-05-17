module.exports.config = {
  name: "resend",
  version: "1.1.0",
  hasPermission: 0,
  credits: "Zetsu + ulepszenia by ChatGPT",
  description: "Pokazuje wiadomość usuniętą przez użytkownika",
  commandCategory: "group",
  usages: "/resend",
  cooldowns: 3
};

const cache = new Map();
const MAX_CACHE_SIZE = 1000;

module.exports.handleEvent = async function ({ event, api, Users }) {
  const { messageID, threadID, senderID, type, messageReply, attachments, body } = event;

  if (!global.data.resend) global.data.resend = {};
  if (!global.data.resend[threadID]) return;

  if (type === "message_unsend") {
    const cached = cache.get(messageID);
    if (!cached) return;

    const senderName = (await Users.getNameUser(cached.senderID)) || "Użytkownik";
    let messageText = `@${senderName} usunął wiadomość:\n`;

    if (cached.body) messageText += cached.body;

    const mentions = [{
      tag: `@${senderName}`,
      id: cached.senderID
    }];

    if (cached.attachments.length > 0) {
      const attachmentsData = cached.attachments.map(item => item.url);
      api.sendMessage({ body: messageText, mentions, attachment: attachmentsData }, threadID);
    } else {
      api.sendMessage({ body: messageText, mentions }, threadID);
    }

  } else if (type === "message") {
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
