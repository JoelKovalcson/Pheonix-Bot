async function getLogChannel (guild) {
	return await guild.channels.cache.find(channel => channel.id == process.env.LOG_CHANNEL_ID);
}

async function getMemberLogChannel (guild) {
	return await guild.channels.cache.find(channel => channel.id == process.env.MEMBER_LOG_CHANNEL_ID);
}

async function getInviteLogChannel (guild) {
	return await guild.channels.cache.find(channel => channel.id == process.env.INVITE_LOG_CHANNEL_ID);
}

async function getJoinClanChannel (guild) {
	return await guild.channels.cache.find(channel => channel.id == process.env.JOIN_CLAN_CHANNEL_ID);
}

module.exports = {getLogChannel, getJoinClanChannel, getMemberLogChannel, getInviteLogChannel};