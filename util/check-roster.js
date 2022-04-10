const { MessageEmbed } = require("discord.js");
const { addVisitor, addInactive, removeInactive } = require("./storage");

async function checkRoster(guild) {
	console.log('Checking roster...');
	const members = await guild.members.fetch();
	
	for (let [id, member] of members) {
		if (member.roles.cache.find(role => role.id === process.env.MEMBER_ROLE_ID)) {
		}
		if (member.roles.cache.find(role => role.id === process.env.LEADERSHIP_ROLE_ID)) {
		}
		if (member.roles.cache.find(role => role.id === process.env.VISITOR_ROLE_ID)) {
			addVisitor(member);
		}
		if (member.roles.cache.find(role => role.id === process.env.INACTIVE_ROLE_ID)) {
			if(member.roles.cache.find(role => role.id === process.env.ACTIVE_OVERRIDE_ID)) {
				removeInactive(member);
			}
			else {
				addInactive(member);
			}
		}
	}
	console.log('Roster checked!');
}

module.exports = {checkRoster};