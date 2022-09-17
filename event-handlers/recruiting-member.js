const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors } = require("discord.js");
const { getJoinClanChannel } = require("../util/get-channels");
const { getRecruiterRole, getHeadRecruiterRole, getMemberRole, getLeadershipRole, getVisitorRole, getRecruitRole, getAssociateRole, getGuestRole, getInactiveRole } = require("../util/get-roles");
const { logMessage } = require("../util/log");

const handleStartJoinClan = async (client, interaction) => {
	let roles = interaction.member.roles.cache;
	// Make sure leadership or members do not press this
	if (roles.find(role => role.id == process.env.LEADERSHIP_ROLE_ID || role.id == process.env.MEMBER_ROLE_ID)) {
		await interaction.reply({content: 'You are already a member!', ephemeral: true});
		return;
	}
	// Otherwise, they should be good to open a thread to join.
	let joinClanChannel = await getJoinClanChannel(interaction.guild);
	let name = (interaction.member.nickname) ? interaction.member.nickname : interaction.user.username;
	
	// First check if a thread already exists
	let threads = (await joinClanChannel.threads.fetchActive()).threads.filter(thread => {
		thread.name == `Invite ${name}`
	});
	if (threads.size) {
		// They already have a thread, so check if any are still open
		let oldThread = threads.find(thread => !thread.locked);
		if (oldThread) {
			await interaction.reply({content: `Your join channel already exists: <#${oldThread.id}>`, ephemeral: true});
			return;
		}
	}
	// If not, create a thread
	else {
		let headRecruiterRole = await getHeadRecruiterRole(interaction.guild);
		let recruiterRole = await getRecruiterRole(interaction.guild);
		let thread = await joinClanChannel.threads.create({
			name: `${name}`,
			type: ChannelType.PrivateThread,
			autoArchiveDuration: 4320, // Set to 3 days due to server boost being high enough
			reason: `To invite ${name}`,
			invitable: false
		});

		const buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`joinClan:${interaction.user.id}`)
					.setLabel('Joined Clan')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId(`closeJoin`)
					.setLabel('Close Request')
					.setStyle(ButtonStyle.Danger)
			);

		const msgEm = new EmbedBuilder()
			.setTitle('Thanks for applying!')
			.setDescription('Our recruiters have been notified and will be with you when they are next available.')
			.setColor(Colors.DarkOrange)
			.setThumbnail('https://cdn.discordapp.com/attachments/836119123153911842/1018227601174708325/Phoenix_2.png')
			.addFields(
				{
					name: 'Recommended Steps',
					value: '\`1.\` Make sure you are not currently in a clan so a recruiter can invite you.'
							 + '\n\`2.\` A recruiter will send you an invite when they are available.'
							 + '\n\`3.\` Accept the invitation and state that you have joined the clan in this thread.'
							 + '\n\`4.\` A recruiter will set your roles and you are good to go!'
							 + '\n\nNote: The buttons below are for Recruiter use only.',
					inline: true
				},
				{
					name: 'Questions',
					value: 'If you have any questions during this process, do not hesitate to ask.',
					inline: true
				}
			)

		await thread.send({content: `<@${interaction.user.id}> has requested to join the clan <@&${headRecruiterRole.id}> <@&${recruiterRole.id}>`});
		await thread.send({embeds: [msgEm.data],  components: [buttons]})
		await interaction.reply({content: `Your request to join the clan has been sent to the recruiters.\n`
															+ `They will contact you here when they are next available: <#${thread.id}>`, ephemeral: true});
	}
}

const handleJoinClan = async (client, interaction) => {

	let headRecruiterRole = await getHeadRecruiterRole(interaction.guild);
	let recruiterRole = await getRecruiterRole(interaction.guild);
	let leadershipRole = await getLeadershipRole(interaction.guild);

	// If someone that is not a recruiter or leadership clicks the button, fuss at them
	if (!interaction.member.roles.cache.hasAny(headRecruiterRole.id, recruiterRole.id, leadershipRole.id)) {
		interaction.reply({content: 'You are not a recruiter!', ephemeral: true});
		return;
	}

	const logMessage = new EmbedBuilder()
		.setTitle('Join Clan')
		.setDescription(`Used by: <@${interaction.user.id}>`);
	// If it is a recruiter or leadership, remove Visitor, give them Recruit and Member
	try {
		let member = await interaction.guild.members.fetch(interaction.customId.split(':')[1]);
		let memberRole = await getMemberRole(interaction.guild);
		let recruitRole = await getRecruitRole(interaction.guild);
		let visitorRole = await getVisitorRole(interaction.guild);
		let associateRole = await getAssociateRole(interaction.guild);
		let guestRole = await getGuestRole(interaction.guild);
		let inactiveRole = await getInactiveRole(interaction.guild);
		let removeRoles = [];
		let addRoles = [];
		// Check for roles to add
		if (!member.roles.cache.has(memberRole.id)) addRoles.push(memberRole);
		if (!member.roles.cache.has(recruitRole.id)) addRoles.push(recruitRole);
		// Check for roles to remove
		if (member.roles.cache.has(inactiveRole)) removeRoles.push(inactiveRole);
		if (member.roles.cache.has(visitorRole.id)) removeRoles.push(visitorRole);
		if (member.roles.cache.has(associateRole.id)) removeRoles.push(associateRole);
		if (member.roles.cache.has(guestRole.id)) removeRoles.push(guestRole);
		// Change roles
		if (addRoles.length) await member.roles.add(addRoles);
		if (removeRoles.length) await member.roles.remove(removeRoles);

		logMessage.addFields({name: 'Success', value: `<@${member.id}> has joined the clan!`, inline: false});

		await interaction.reply({content: 'User roles should now be setup! Please verify before closing this thread.', ephemeral: true});
	} catch (err) {
		logMessage.addFields({name: 'Failed', value: `There were problems setting proper roles for <@${member.id}>.`, inline: false});
		await interaction.reply({content: 'That user is no longer in the server, or another error occurred.', ephemeral: true});
	}
	return {embeds: [logMessage.data]}
}

const handleCloseJoin = async (client, interaction) => {
	let headRecruiterRole = await getHeadRecruiterRole(interaction.guild);
	let recruiterRole = await getRecruiterRole(interaction.guild);
	let leadershipRole = await getLeadershipRole(interaction.guild);
	
	// If someone that is not a recruiter or leadership clicks the button, fuss at them
	if (!interaction.member.roles.cache.hasAny(headRecruiterRole.id, recruiterRole.id, leadershipRole.id)) {
		interaction.reply({content: 'You are not a recruiter!', ephemeral: true});
		return;
	}

	// Don't try to send anything if the channel is archived.
	if (interaction.channel.archived) return;

	await interaction.reply({content: `<@${interaction.user.id}> has closed this thread.`});
	if (!interaction.channel.archived) interaction.channel.setLocked(true, 'Recruitment Finished');
	if (!interaction.channel.archived) interaction.channel.setArchived(true, 'Recruitment Finished');
}

const handleGuestRole = async (client, interaction) => {
	let visitorRole = await getVisitorRole(interaction.guild);
	let inactiveRole = await getInactiveRole(interaction.guild);
	let roles = interaction.member.roles;

	if (!roles.cache.hasAny(visitorRole.id, inactiveRole.id)) {
		await interaction.reply({content: 'You are not a visitor!', ephemeral: true});
		return;
	}

	let guestRole = await getGuestRole(interaction.guild);
	let associateRole = await getAssociateRole(interaction.guild);

	if (roles.cache.hasAny(associateRole.id, guestRole.id)) {
		await interaction.reply({content: 'You already have a guest role!', ephemeral: true});
		return;
	}

	let memberRole = await getMemberRole(interaction.guild);
	let leadershipRole = await getLeadershipRole(interaction.guild);

	if (roles.cache.hasAny(memberRole.id, leadershipRole.id)) {
		await interaction.reply({content: 'You are already in the clan, you do not need the guest role!', ephemeral: true});
		return;
	}

	let addRoles = [];
	let removeRoles = [];

	if (!roles.cache.has(guestRole.id)) addRoles.push(guestRole);
	if (roles.cache.has(visitorRole.id)) removeRoles.push(visitorRole);
	if (roles.cache.has(inactiveRole.id)) removeRoles.push(inactiveRole);

	if (addRoles.length) await roles.add(addRoles);
	if (removeRoles.length) await roles.remove(removeRoles);
	await interaction.reply({content: 'You have been given the Guest role!', ephemeral: true});
}

const handleRecruitingButtons = async (client, interaction) => {
	try {
		if (interaction.customId === 'startJoin') {
			await handleStartJoinClan(client, interaction);
		}
		else if (interaction.customId === 'guestRole') {
			await handleGuestRole(client, interaction);
		}
		else if (interaction.customId.startsWith('joinClan:')) {
			let response = await handleJoinClan(client, interaction);
			logMessage(interaction.guild, response, 'join');
		}
		else if (interaction.customId === 'closeJoin') {
			await handleCloseJoin(client, interaction);
		}
	} catch (err) {
		console.log(`\x1b[31m${err}\x1b[0m`);
	}
}

module.exports = {handleRecruitingButtons};