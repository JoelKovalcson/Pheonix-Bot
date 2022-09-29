async function getVisitorRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.VISITOR_ROLE_ID);
}

async function getMemberRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.MEMBER_ROLE_ID);
}

async function getLeadershipRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.LEADERSHIP_ROLE_ID);
}

async function getRecruitRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.RECRUIT_ROLE_ID);
}

async function getRecruiterRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.RECRUITER_ROLE_ID);
}

async function getHeadRecruiterRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.HEAD_RECRUITER_ROLE_ID);
}

async function getAssociateRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.ASSOCIATE_ROLE_ID);
}

async function getGuestRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.GUEST_ROLE_ID);
}

async function getIGNUnknownRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.IGN_UNKNOWN_ID);
}

async function getInactiveRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.INACTIVE_ROLE_ID);
}

async function getActiveOverrideRole(guild) {
	return await guild.roles.cache.find(role => role.id == process.env.ACTIVE_OVERRIDE_ID)
}

module.exports = { 
	getVisitorRole,
	getMemberRole,
	getLeadershipRole, 
	getRecruiterRole, 
	getHeadRecruiterRole, 
	getRecruitRole, 
	getAssociateRole,
	getGuestRole,
	getIGNUnknownRole,
	getInactiveRole,
	getActiveOverrideRole
};