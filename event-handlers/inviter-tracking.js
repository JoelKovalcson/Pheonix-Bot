const { logMessage } = require("../util/log");

const inviteTable = {
	'S2YQD23FcC': 322570144520077312,
	'Qz8yvBgMcq': 674728562799935508,
	'ntp9E86ZvR': 376397312257294336,
	'uE5MfSGygt': 641995975191429140,
	'XGUVeaBK2C': 265599878460080128,
	'jN496qVWHu': 475055012469538826,
	'SRjc4TaQsE': 293457931024859136
}

var inviteCounts = {};

const logInvites = async (inviteCode, member) => {
	logMessage(member.guild, {content: `<@${member.id}> has joined with <@${inviteTable[inviteCode]}> invite code: \`${inviteCode}\``}, 'invite');
}

const checkInviteCounts = async (guild, member = null) => {
	const invites = await guild.invites.fetch();
	invites.forEach((invite) => {
		// If it doesn't exist
		if (inviteCounts[`${invite.code}`] === undefined) inviteCounts[`${invite.code}`] = invite.uses;
		// If it does exist, only do something if the current value is less
		else if (inviteCounts[`${invite.code}`] < invite.uses) {
			inviteCounts[`${invite.code}`] = invite.uses;
			logInvites(`${invite.code}`, member);
		}
	});
}

module.exports = { checkInviteCounts };