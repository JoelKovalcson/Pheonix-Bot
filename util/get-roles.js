async function getVisitorRole(guild) {
	return guild.roles.fetch(`${process.env.VISITOR_ROLE_ID}`);
}

async function getMemberRole(guild) {
	return guild.roles.fetch(`${process.env.MEMBER_ROLE_ID}`);
}

async function getLeadershipRole(guild) {
	return guild.roles.fetch(`${process.env.LEADERSHIP_ROLE_ID}`);
}

module.exports = { getVisitorRole, getMemberRole, getLeadershipRole };