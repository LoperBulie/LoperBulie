module.exports.config = {
  name: "test",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "January",
  description: "Komenda testowa",
  commandCategory: "Test",
  usages: "/test",
  cooldowns: 0
};

module.exports.run = async function({ api, event }) {
  return api.sendMessage("Działa!", event.threadID);
};
