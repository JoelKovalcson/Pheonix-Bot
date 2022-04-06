const { getLogChannel } = require("./get-channels");

async function logMessage(guild, message) {
	getLogChannel(guild).then((channel) => {
		channel.send({...message});
	});
}

module.exports = { logMessage };