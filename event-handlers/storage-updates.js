const { checkRoster } = require("../util/check-roster");
const { getVisitorRole, getInactiveRole, getActiveOverrideRole, getMemberRole, getGuestRole, getLeadershipRole, getAssociateRole } = require("../util/get-roles");
const { removeVisitor, addVisitor, removeInactive, addInactive, readStorage, writeStorage } = require("../util/storage");
const { worldStateHandler } = require("../util/world-state");

const storageMemberUpdate = async (client, oldMember, newMember) => {
	// Check if there was a different in roles
	const visitorRole =  getVisitorRole(oldMember.guild);
	const inactiveRole = getInactiveRole(oldMember.guild);
	const activeOverrideRole = getActiveOverrideRole(oldMember.guild);

	const difference = oldMember.roles.cache.difference(newMember.roles.cache);
	if (difference) {
		// Visitor role was changed
		if (difference.find(role => role.id == visitorRole.id)) {
			// Visitor role was removed if it's found in the old
			if (oldMember.roles.cache.find(role => role.id == visitorRole.id)) {
				removeVisitor(newMember);
			}
			// Visitor role was added since it is not in old
			else {
				addVisitor(newMember);
			}
		}
		// Inactive role was changed
		if (difference.find(role => role.id == inactiveRole.id)) {
			// Active override was changed
			if (difference.find(role => role.id == activeOverrideRole.id)) {
				// If they were given active override, it does not matter if they are/were inactive, remove them from the storage.
				if (newMember.roles.cache.find(role => role.id == activeOverrideRole.id)) {
					removeInactive(newMember);
				}
				// If active override was removed then check if inactive was added when active was removed
				else if (newMember.roles.cache.find(role => role.id == inactiveRole.id)) {
					addInactive(newMember);
				}
				// If neither were added, they were both removed, so remove inactive
				else {
					removeInactive(newMember);
				}
			}
			// If active override was not changed, do a simple check on inactive role
			else {
				// If they were given inactive, add them
				if (newMember.roles.cache.find(role => role.id == inactiveRole)) {
					addInactive(newMember);
				}
				// Inactive was removed, so remove them
				else {
					removeInactive(newMember);
				}
			}
		}
	}
}

const storageUserUpdate = async (client, oldUser, newUser) => {
	if (oldUser.username != newUser.username) {
		// Check if they are part of this guild
		const member = await client.guilds.cache.find(guild => guild.id == process.env.GUILD_ID).members.fetch(newUser.id);
		if (member) {
			const memberRole = getMemberRole(member.guild);
			const visitorRole = getVisitorRole(member.guild);
			const inactiveRole = getInactiveRole(member.guild);
			const guestRole = getGuestRole(member.guild);
			const leadershipRole = getLeadershipRole(member.guild);
			const associateRole = getAssociateRole(member.guild);
			// Check if they had one of the above roles
			if (member.roles.cache.hasAny(memberRole.id, visitorRole.id, inactiveRole.id, guestRole.id, leadershipRole.id, associateRole.id)) {
				// If they didn't have a nickname, set their nickname to their old username
				try {
					if (!member.nickname) await member.setNickname(oldUser.username);
				} catch (err) {
					console.log(`Do not have perms to set ${newUser.username}'s nickname to ${oldUser.username}.`);
				}
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

const storageSetup = async (client) => {
	const guild = await client.guilds.fetch(`${process.env.GUILD_ID}`);

	await readStorage(guild);
	await checkRoster(guild);
	await writeStorage(guild);
	setInterval(async () => {
		await writeStorage(guild);
	}, 1000*60*5);

	await worldStateHandler(guild);
}

module.exports = {storageMemberUpdate, storageUserUpdate, storageMemberRemove, storageSetup};