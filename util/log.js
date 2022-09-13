const { getLogChannel, getMemberLogChannel, getInviteLogChannel } = require("./get-channels");

async function logMessage(guild, message, type = null) {
	switch (type) {
		case 'join':
		case 'member':
			getMemberLogChannel(guild).then((channel) => {
				if (channel && message) channel.send({...message});
			});
			break;
		case 'invite':
			getInviteLogChannel(guild).then((channel) => {
				if (channel && message) channel.send({...message});
			});
			break;
		default:
			getLogChannel(guild).then((channel) => {
				if (channel && message) channel.send({...message});
			});
			break;
	}
	
}

module.exports = { logMessage };