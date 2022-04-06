const { getLogChannel } = require("./get-channels");

async function logMessage(guild, message = null, embed = null) {
	getLogChannel(guild).then((channel) => {
		channel.send({content: message, embed: embed});
	});
}

module.exports = { logMessage };