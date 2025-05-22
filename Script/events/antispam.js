const userActivity = {};
const maxMessages = 7;
const timeWindow = 7 * 1000;

module.exports.config = {
  name: "antispam",
  eventType: ["message"],
  version: "1.0.0",
  credits: "ChatGPT",
  description: "Wyrzuca użytkownika za spam"
};

module.exports.run = () => {}; // wymagane przez silnik

module.exports.handleEvent = async function({ api, event }) {
  const { senderID, threadID, isGroup } = event;
  if (!isGroup || senderID == api.getCurrentUserID()) return;

  const now = Date.now();

  if (!userActivity[senderID]) {
    userActivity[senderID] = { count: 1, startTime: now };
  } else {
    if (now - userActivity[senderID].startTime < timeWindow) {
      userActivity[senderID].count++;

      if (userActivity[senderID].count >= maxMessages) {
        try {
          await api.removeUserFromGroup(senderID, threadID);
          api.sendMessage(`⚠️ Użytkownik ${senderID} został wyrzucony za spam (${maxMessages} wiadomości w ${timeWindow / 1000}s).`, threadID);
        } catch (err) {
          api.sendMessage(`❌ Nie mogę wyrzucić użytkownika ${senderID}. Brak uprawnień admina.`, threadID);
        }
        delete userActivity[senderID];
      }
    } else {
      userActivity[senderID] = { count: 1, startTime: now };
    }
  }
};
