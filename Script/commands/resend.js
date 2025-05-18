const ignoredUsers = ["61575094813494"]; // <-- Tutaj wpisz ID użytkowników do ignorowania

module.exports.config = {
	name: "resend",
	version: "1.2.13",
	hasPermssion: 1,
	credits: "𝙋𝙆𝙄𝙉𝙂 𝙇𝙊𝘾𝘼𝙇",
	description: "Là resend thôi Fix Ver > 2.0.0",
	commandCategory: "general",
	usages: "",
	cooldowns: 0,
	hide: true,
	dependencies: {
		request: "",
		"fs-extra": "",
		axios: ""
	}
};

module.exports.handleEvent = async function({ event: e, api: a, client: t, Users: s }) {
	const request = global.nodemodule["request"];
	const axios = global.nodemodule["axios"];
	const { writeFileSync, createReadStream } = global.nodemodule["fs-extra"];

	let { messageID: msgID, senderID: senderID, threadID: threadID, body: body } = e;
	global.logMessage || (global.logMessage = new Map);
	global.data.botID || (global.data.botID = a.getCurrentUserID());
	const threadData = global.data.threadData.get(threadID) || {};

	// Jeśli wyłączone lub wiadomość od bota, lub nadawca ignorowany
	if ((threadData.resend === undefined || threadData.resend !== 0) &&
		senderID !== global.data.botID &&
		!ignoredUsers.includes(senderID)) {

		if (e.type !== "message_unsend") {
			global.logMessage.set(msgID, {
				msgBody: body,
				attachment: e.attachments
			});
		}

		if (e.type === "message_unsend") {
			const oldMsg = global.logMessage.get(msgID);
			if (!oldMsg) return;

			const senderName = await s.getNameUser(senderID);

			// Brak załączników
			if (!oldMsg.attachment || oldMsg.attachment.length === 0) {
				return a.sendMessage(`${senderName} usunął wiadomość:\n${oldMsg.msgBody}`, threadID);
			}

			// Z załącznikami
			let index = 0;
			const response = {
				body: `${senderName} usunął ${oldMsg.attachment.length} załącznik(i).` +
					(oldMsg.msgBody ? `\n\nZawartość: ${oldMsg.msgBody}` : ""),
				attachment: [],
				mentions: [{
					tag: senderName,
					id: senderID
				}]
			};

			for (const att of oldMsg.attachment) {
				index++;
				const fileExt = att.url.substring(att.url.lastIndexOf('.') + 1);
				const filePath = `${__dirname}/cache/${index}.${fileExt}`;
				const fileData = (await axios.get(att.url, { responseType: "arraybuffer" })).data;
				writeFileSync(filePath, Buffer.from(fileData, "utf-8"));
				response.attachment.push(createReadStream(filePath));
			}

			a.sendMessage(response, threadID);
		}
	}
};

module.exports.languages = {
	vi: {
		on: "Bật",
		off: "Tắt",
		successText: "resend thành công"
	},
	en: {
		on: "on",
		off: "off",
		successText: "resend success!"
	},
	pl: {
		on: "Włączono",
		off: "Wyłączono",
		successText: "resend pomyślnie ustawiony"
	}
};

module.exports.run = async function({ api: e, event: a, Threads: t, getText: s }) {
	const { threadID, messageID } = a;
	let data = (await t.getData(threadID)).data;

	if (data.resend === undefined || data.resend === false) {
		data.resend = true;
	} else {
		data.resend = false;
	}

	await t.setData(threadID, { data });
	global.data.threadData.set(threadID, data);
	e.sendMessage(`${data.resend ? s("on") : s("off")} ${s("successText")}`, threadID, messageID);
};
