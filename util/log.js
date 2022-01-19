const { getLogChannel } = require("./get-channels");

async function logMessage(guild, message) {
	getLogChannel(guild).then((channel) => {
		channel.send({content: message});
	});
}

module.exports = { logMessage };