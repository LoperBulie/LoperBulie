const fs = require("fs");
const path = require("path");

module.exports.config = {
	name: "lista",
	version: "1.0.3",
	hasPermssion: 0,
	credits: "CYBER BOT TEAM (mod by January)",
	description: "Wysyła losowe zdjęcie z folderu images",
	commandCategory: "Picture",
	usages: "lista",
	cooldowns: 1,
};

module.exports.run = async function({ api, event }) {
	const folderPath = __dirname + "/images";

	if (!fs.existsSync(folderPath)) {
		return api.sendMessage("Folder 'images' nie istnieje!", event.threadID, event.messageID);
	}

	const files = fs.readdirSync(folderPath).filter(file =>
		/\.(jpg|jpeg|png|gif)$/i.test(file)
	);

	if (files.length === 0) {
		return api.sendMessage("Brak zdjęć w folderze!", event.threadID, event.messageID);
	}

	const randomImage = files[Math.floor(Math.random() * files.length)];
	const imagePath = folderPath + "/" + randomImage;

	return api.sendMessage({
		body: "Oto losowy obrazek:",
		attachment: fs.createReadStream(imagePath)
	}, event.threadID, event.messageID);
};
