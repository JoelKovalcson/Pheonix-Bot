const { MessageEmbed } = require("discord.js");
const { addVisitor, addInactive } = require("./storage");

async function checkRoster(guild) {
	const members = await guild.members.fetch();
	const logEmbed = new MessageEmbed()
		.setTitle('Roster Check')
		.setDescription('The following users have multiple roles they are not supposed to have');
	//let newVisitor = false;
	for (let [id, member] of members) {
		if (member.roles.cache.find(role => role.id === process.env.MEMBER_ROLE_ID)) {
		}
		if (member.roles.cache.find(role => role.id === process.env.LEADERSHIP_ROLE_ID)) {
		}
		if (member.roles.cache.find(role => role.id === process.env.VISITOR_ROLE_ID)) {
			addVisitor(member);
		}
		if (member.roles.cache.find(role => role.id === process.env.INACTIVE_ROLE_ID)) {
			addInactive(member);
		}
	}
}

module.exports = {checkRoster};