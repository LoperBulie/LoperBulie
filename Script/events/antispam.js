const num = 7; // ile wiadomości w okresie `timee` powoduje wyrzucenie
const timee = 7; // ile sekund trwa okno czasowe

module.exports.config = {
  name: "antispam",
  version: "1.0.0",
  credits: "ChatGPT",
  description: `Wyrzuca użytkownika, jeśli spamuje więcej niż ${num} wiadomości w ${timee}s`,
  eventType: ["message"]
};

const userActivity = {}; // { senderID: { count, timeStart } }

module.exports.handleEvent = async function ({ api, event }) {
  const { senderID, threadID, isGroup } = event;
  if (!isGroup || !senderID || senderID == api.getCurrentUserID()) return;

  const now = Date.now();

  if (!userActivity[senderID]) {
    userActivity[senderID] = {
      count: 1,
      timeStart: now
    };
  } else {
    const timePassed = (now - userActivity[senderID].timeStart) / 1000;

    if (timePassed > timee) {
      // Resetujemy okno czasowe
      userActivity[senderID] = {
        count: 1,
        timeStart: now
      };
    } else {
      userActivity[senderID].count++;
    }
  }

  // Jeśli użytkownik przekroczył limit wiadomości w oknie czasowym
  if (userActivity[senderID].count >= num) {
    try {
      await api.removeUserFromGroup(senderID, threadID);
      api.sendMessage(`⚠️ Użytkownik ${senderID} został wyrzucony za spamowanie (${num}+ wiadomości w ${timee}s).`, threadID);
    } catch (err) {
      api.sendMessage(`❌ Nie udało się wyrzucić użytkownika ${senderID}. Prawdopodobnie jestem bez uprawnień admina.`, threadID);
    }

    // Reset po wyrzuceniu
    delete userActivity[senderID];
  }
};
