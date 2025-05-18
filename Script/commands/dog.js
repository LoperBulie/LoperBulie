const fs = require("fs");
const path = require("path");

module.exports.config = {
	name: "dog",
	version: "1.0.3",
	hasPermssion: 0,
	credits: "CYBER BOT TEAM (mod by January)",
	description: "Wysyła losowe zdjęcie psa z folderu images",
	commandCategory: "Picture",
	usages: "dog",
	cooldowns: 1,
};

module.exports.run = async ({ api, event }) => {
	const folderPath = path.join(__dirname, "images");

	let files;
	try {
		files = fs.readdirSync(folderPath).filter(file =>
			/\.(jpg|jpeg|png|gif)$/i.test(file)
		);
	} catch (err) {
		return api.sendMessage("Błąd: Nie można odczytać folderu 'images'.", event.threadID, event.messageID);
	}

	if (!files.length) {
		return api.sendMessage("Brak plików graficznych w folderze 'images'.", event.threadID, event.messageID);
	}

	const randomImage = files[Math.floor(Math.random() * files.length)];
	const imagePath = path.join(folderPath, randomImage);

	return api.sendMessage({
		body: "Oto losowy piesek!",
		attachment: fs.createReadStream(imagePath)
	}, event.threadID, event.messageID);
};
