async function getLogChannel (guild) {
	return guild.channels.fetch(`${process.env.LOG_CHANNEL_ID}`);
}

module.exports = {getLogChannel};