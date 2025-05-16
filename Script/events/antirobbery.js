module.exports.config = {
  name: "guard",
  eventType: ["log:thread-admins"],
  version: "1.0.0",
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Prevent admin changes",
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const { logMessageType, logMessageData, senderID, threadID, author, messageID } = event;

  let thread = await Threads.getData(threadID);
  let data = thread?.data || {};
  if (data.guard !== true) return;

  if (logMessageType !== "log:thread-admins") return;

  const botID = api.getCurrentUserID();
  const targetID = logMessageData.TARGET_ID;
  const action = logMessageData.ADMIN_EVENT;

  function editAdminsCallback(err) {
    if (err) {
      return api.sendMessage("Wystąpił błąd podczas cofania zmian uprawnień administratora.", threadID, messageID);
    }
    return api.sendMessage("Włączono tryb ochrony przed nieautoryzowaną zmianą administratorów.", threadID, messageID);
  }

  if (author === botID || targetID === botID) return;

  if (action === "add_admin") {
    api.changeAdminStatus(threadID, author, false, editAdminsCallback);
    api.changeAdminStatus(threadID, targetID, false);
  } else if (action === "remove_admin") {
    api.changeAdminStatus(threadID, author, false, editAdminsCallback);
    api.changeAdminStatus(threadID, targetID, true);
  }
};
