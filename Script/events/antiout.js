const fs = require("fs");
const path = require("path");
const login = require("fca-unofficial");

const funnyMessages = [
  "Myślałeś, że uciekniesz? Niespodzianka!",
  "Grupa to twoje przeznaczenie.",
  "No i gdzie lecisz?",
  "Złapany! Powrót do klatki.",
  "Nie tak prędko, kolego.",
  "Czemu uciekasz, było tak fajnie?"
];

module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.1",
  credits: "ChatGPT x January",
  description: "Dodaje użytkownika z powrotem jeśli opuści grupę (smartadd)"
};

module.exports.run = async function ({ api, event }) {
  const leftUserID = event.logMessageData.leftParticipantFbId;
  const threadID = event.threadID;
  const botID = api.getCurrentUserID();

  if (leftUserID === botID) return; // Nie próbuj dodać siebie

  const appStatesDir = path.join(__dirname, "..", "..", "appstate");
  const files = fs.readdirSync(appStatesDir).filter(f => f.endsWith(".json"));
  if (files.length === 0) return api.sendMessage("Brak kont do auto-dodania (antiout).", threadID);

  for (const file of files) {
    const filePath = path.join(appStatesDir, file);
    const appState = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    try {
      const success = await new Promise((resolve, reject) => {
        login({ appState }, (err, tempApi) => {
          if (err) return reject(err);

          tempApi.addUserToGroup(leftUserID, threadID, (err) => {
            if (err) return resolve(false);

            const msg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
            tempApi.sendMessage(msg, threadID);
            resolve(true);
          });
        });
      });

      if (success) {
        console.log(`[antiout] Użytkownik ${leftUserID} został przywrócony przez konto ${file}`);
        return;
      }

    } catch (e) {
      console.log(`[antiout] Błąd przy użyciu konta ${file}: ${e.message}`);
    }
  }

  api.sendMessage("Nie udało się automatycznie przywrócić użytkownika (wszystkie konta zablokowane).", threadID);
};