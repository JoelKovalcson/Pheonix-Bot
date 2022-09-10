const { removeVisitor, addVisitor, removeInactive, addInactive } = require("../util/storage");

const storageMemberUpdate = async (client, oldMember, newMember) => {
	// Check if there was a different in roles
	const difference = oldMember.roles.cache.difference(newMember.roles.cache);
	if (difference) {
		if (difference.find(role => role.id == process.env.VISITOR_ROLE_ID)) {
			// Visitor role was removed
			if (oldMember.roles.cache.size > newMember.roles.cache.size) {
				removeVisitor(newMember);
			}
			// Visitor role was added
			else {
				addVisitor(newMember);
			}
		}
		else if (difference.find(role => role.id == process.env.INACTIVE_ROLE_ID)) {
			// Inactive role was removed
			if (oldMember.roles.cache.size > newMember.roles.cache.size) {
				removeInactive(newMember);
			}
			// Inactive roll was added, check for lack of override role
			else if (oldMember.roles.cache.size < newMember.roles.cache.size && !newMember.roles.cache.find(role => role.id == process.env.ACTIVE_OVERRIDE_ID)) {
				addInactive(newMember);
			}
		}
		else if (difference.find(role => role.id == process.env.ACTIVE_OVERRIDE_ID)) {
			// Active override removed, check for inactive role as well 
			if (oldMember.roles.cache.size > newMember.roles.cache.size && newMember.roles.cache.find(role => role.id == process.env.INACTIVE_ROLE_ID)) {
				addInactive(newMember);
			}
			// It was given, so make sure they aren't on inactive list
			else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
				removeInactive(oldMember);
			}
		}
	}
}

const storageUserUpdate = async (client, oldUser, newUser) => {
	if (oldUser.username != newUser.username) {
		// Check if they are part of this guild
		const member = client.guilds.cache.find(guild => guild.id == process.env.GUILD_ID).members.cache.find(member => member.id == newUser.id);
		if (member) {
			// Check if they had visitor/member/inactive roles
			if (member.roles.cache.find(role => role.id == process.env.MEMBER_ROLE_ID || role.id == process.env.VISITOR_ROLE_ID || role.id == process.env.INACTIVE_ROLE_ID)) {
				// If they didn't have a nickname, set their nickname to their old username
				if (!member.nickname) await member.setNickname(oldUser.username);
			}
		}
	}
}

const storageMemberRemove = async (client, member) => {
	// Check if they are a visitor or inactive
	if (member.roles.cache.find(role => role.id == process.env.VISITOR_ROLE_ID || role.id == process.env.INACTIVE_ROLE_ID)) {
		// Remove them from both
		removeVisitor(member);
		removeInactive(member);
	}
}

module.exports = {storageMemberUpdate, storageUserUpdate, storageMemberRemove};