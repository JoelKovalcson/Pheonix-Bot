const { getMemberRole, getLeadershipRole, getVisitorRole } = require("./get-roles");
const { logMessage } = require("./log");

async function checkRoster(guild) {
	const members = await guild.members.fetch();
	const memberRole = await getMemberRole(guild);
	const leadershipRole = await getLeadershipRole(guild);
	const visitorRole = await getVisitorRole(guild);
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
			await logMessage(guild, `\n<@&${leadershipRole.id}>\n>>> <@!${id}> has multiple guild roles!\nVisitor: **${isVisitor}**\nMember: **${isMember}**\nLeader: **${isLeader}**`);
		}
		console.log(`${member.displayName}: ${id}`);
	}
}

module.exports = {checkRoster};