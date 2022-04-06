const { MessageEmbed } = require("discord.js");
const { getMemberRole, getLeadershipRole, getVisitorRole } = require("./get-roles");
const { logMessage } = require("./log");

async function checkRoster(guild) {
	const members = await guild.members.fetch();
	const memberRole = await getMemberRole(guild);
	const leadershipRole = await getLeadershipRole(guild);
	const visitorRole = await getVisitorRole(guild);
	const logEmbed = new MessageEmbed()
		.setTitle('Roster Check')
		.setDescription('The following users have multiple roles they are not supposed to have');
	let listStr = null;
	for (let [id, member] of members) {
		let isMember = false, isLeader = false, isVisitor = false;
		if (member.roles.cache.find(role => role.id === memberRole.id)) {
			isMember = true;
		}
		if (member.roles.cache.find(role => role.id === leadershipRole.id)) {
			isLeader = true;
		}
		if (member.roles.cache.find(role => role.id === visitorRole.id)) {
			isVisitor = true;
		}
		if(isVisitor && isLeader || isVisitor && isMember || isMember && isLeader) {
			// Log a message that someone has a duplicate role
			listStr += `\n<@!${id}>: Visitor - **${isVisitor}** | Member - **${isMember}** | Leader - **${isLeader}**`;
		}
	}
	if (listStr) {
		logEmbed.addField('Users with multiple roles', listStr, false);
		await logMessage(guild, {embeds: [logEmbed]});
	}
}

module.exports = {checkRoster, visitorList};