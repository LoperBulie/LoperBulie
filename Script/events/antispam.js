const num = 7; // ile wiadomości max
const timee = 7; // w ilu sekundach

module.exports.config = {
  name: "spamkick",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "January + ChatGPT",
  description: `Wyrzuca użytkownika jeśli wyśle ${num} wiadomości w ${timee} sekund`,
  commandCategory: "System",
  usages: "x",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage(`Wyrzuci użytkownika, jeśli spamuje ${num} wiadomości w ciągu ${timee}s`, event.threadID, event.messageID);
};

module.exports.handleEvent = async function ({ api, event }) {
  const { senderID, threadID } = event;

  // pomiń wiadomości od bota
  if (senderID == api.getCurrentUserID()) return;

  if (!global.client.antispam) global.client.antispam = {};

  if (!global.client.antispam[threadID]) global.client.antispam[threadID] = {};

  const now = Date.now();

  if (!global.client.antispam[threadID][senderID]) {
    global.client.antispam[threadID][senderID] = { count: 1, time: now };
  } else {
    let userData = global.client.antispam[threadID][senderID];
    if (now - userData.time < timee * 1000) {
      userData.count++;
    } else {
      // reset licznika po upływie czasu
      userData.count = 1;
      userData.time = now;
    }

    if (userData.count >= num) {
      try {
        await api.removeUserFromGroup(senderID, threadID);
        api.sendMessage(`⚠️ Użytkownik ${senderID} został wyrzucony za spamowanie ${num} wiadomości w ${timee} sekund.`, threadID);
      } catch (e) {
        api.sendMessage(`❌ Nie mogę wyrzucić użytkownika ${senderID}. Czy bot ma uprawnienia administratora?`, threadID);
      }

      // wyczyść dane
      delete global.client.antispam[threadID][senderID];
    }
  }
};
