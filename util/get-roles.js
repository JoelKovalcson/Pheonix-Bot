async function getVisitorRole(guild) {
	return guild.roles.fetch(`${process.env.VISITOR_ROLE_ID}`);
}

module.exports = { getVisitorRole };