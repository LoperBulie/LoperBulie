const userActivity = {};
const maxMessages = 7;
const timeWindow = 7 * 1000; // 15 sekund

module.exports.config = {
  name: "antispam",
  eventType: ["message", "message_reply"],
  version: "1.0.1",
  credits: "ChatGPT",
  description: "Wyrzuca spamujących użytkowników"
};

module.exports.run = () => {}; // wymagane

module.exports.handleEvent = async function({ api, event }) {
  const { threadID, senderID } = event;

  // Pomijaj bota
  if (senderID == api.getCurrentUserID()) return;

  const now = Date.now();

  if (!userActivity[threadID]) userActivity[threadID] = {};
  if (!userActivity[threadID][senderID]) {
    userActivity[threadID][senderID] = { count: 1, start: now };
  } else {
    let activity = userActivity[threadID][senderID];
    if (now - activity.start < timeWindow) {
      activity.count++;
      if (activity.count >= maxMessages) {
        try {
          await api.removeUserFromGroup(senderID, threadID);
          api.sendMessage(`⚠️ Użytkownik ${senderID} został wyrzucony za spam (${maxMessages} wiadomości w ${timeWindow / 1000}s).`, threadID);
        } catch (err) {
          api.sendMessage(`❌ Nie mogę wyrzucić ${senderID}. Czy bot jest adminem?`, threadID);
        }
        delete userActivity[threadID][senderID];
      }
    } else {
      userActivity[threadID][senderID] = { count: 1, start: now };
    }
  }
};
