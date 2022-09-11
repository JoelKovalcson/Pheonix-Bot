async function getLogChannel (guild) {
	return guild.channels.fetch(`${process.env.LOG_CHANNEL_ID}`);
}

async function getJoinClanChannel (guild) {
	return guild.channels.fetch(`${process.env.JOIN_CLAN_CHANNEL_ID}`);
}

module.exports = {getLogChannel, getJoinClanChannel};