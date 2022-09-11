const { checkRoster } = require("../util/check-roster");
const { getVisitorRole, getInactiveRole, getActiveOverrideRole, getMemberRole, getGuestRole, getLeadershipRole, getAssociateRole } = require("../util/get-roles");
const { removeVisitor, addVisitor, removeInactive, addInactive, readStorage, writeStorage, cleanStorage } = require("../util/storage");
const { worldStateHandler } = require("../util/world-state");

const storageMemberUpdate = async (client, oldMember, newMember) => {
	// Check if there was a different in roles
	const visitorRole = await getVisitorRole(oldMember.guild);
	const inactiveRole = await getInactiveRole(oldMember.guild);
	const activeOverrideRole = await getActiveOverrideRole(oldMember.guild);

	const difference = oldMember.roles.cache.difference(newMember.roles.cache);
	if (difference) {
		// Visitor role was changed
		if (difference.find(role => role.id == visitorRole.id)) {
			// Visitor role was removed if it's found in the old
			if (oldMember.roles.cache.find(role => role.id == visitorRole.id)) {
				if (!removeVisitor(newMember)) console.log('Member was not in visitor list (1)');
			}
			// Visitor role was added since it is not in old
			else {
				if (!addVisitor(newMember)) console.log('Member was already in visitor list (2)');
			}
		}
		// Inactive role was changed
		if (difference.find(role => role.id == inactiveRole.id)) {
			// Active override was changed
			if (difference.find(role => role.id == activeOverrideRole.id)) {
				// If they were given active override, it does not matter if they are/were inactive, remove them from the storage.
				if (newMember.roles.cache.find(role => role.id == activeOverrideRole.id)) {
					if (!removeInactive(newMember)) console.log('Member was not in inactive list (3)');
				}
				// If active override was removed then check if inactive was added when active was removed
				else if (newMember.roles.cache.find(role => role.id == inactiveRole.id)) {
					if (!addInactive(newMember)) console.log('Member was already in inactive list (4)');
				}
				// If neither were added, they were both removed, so remove inactive
				else {
					if (!removeInactive(newMember)) console.log('Member was not in inactive list (5)');
				}
			}
			// If active override was not changed, do a simple check on inactive role
			else {
				// If they were given inactive, add them
				if (newMember.roles.cache.find(role => role.id == inactiveRole)) {
					if (!addInactive(newMember)) console.log('Member was already in inactive list (6)');
				}
				// Inactive was removed, so remove them
				else {
					if (!removeInactive(newMember)) console.log('Member was not in inactive list (7)');
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
			const memberRole = await getMemberRole(member.guild);
			const visitorRole = await getVisitorRole(member.guild);
			const inactiveRole = await getInactiveRole(member.guild);
			const guestRole = await getGuestRole(member.guild);
			const leadershipRole = await getLeadershipRole(member.guild);
			const associateRole = await getAssociateRole(member.guild);
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
	const visitorRole = await getVisitorRole(member.guild);
	const inactiveRole = await getInactiveRole(member.guild);
	// Check if they are a visitor or inactive
	if (member.roles.cache.hasAny(visitorRole.id, inactiveRole.id)) {
		// Remove them from both
		if (!removeVisitor(member)) console.log('Member was not in visitor list (8)');
		if (!removeInactive(member)) console.log('Member was not in inactive list (9)');
	}
}

const storageSetup = async (client) => {
	const guild = await client.guilds.fetch(`${process.env.GUILD_ID}`);

	await readStorage(guild);
	await checkRoster(guild);
	await cleanStorage(guild);
	await writeStorage(guild);
	setInterval(async () => {
		await cleanStorage(guild);
		await writeStorage(guild);
	}, 1000*60*5);

	await worldStateHandler(guild);
}

module.exports = {storageMemberUpdate, storageUserUpdate, storageMemberRemove, storageSetup};