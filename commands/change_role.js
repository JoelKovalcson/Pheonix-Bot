const {SlashCommandBuilder} = require('@discordjs/builders');
const { Role, GuildMember } = require('discord.js');
const { getLeadershipRole } = require('../util/get-roles');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('changerole')
		.setDescription('Change whether a user has a specified role or not')
		.setDefaultPermission(false)
		.addUserOption(option => option.setName('target').setDescription('The user to change').setRequired(true))
		.addRoleOption(option => option.setName('role').setDescription('The role to modify').setRequired(true))
		.addBooleanOption(option => option.setName('flag').setDescription('Whether role is on or off for the user').setRequired(true)),
	async execute(interaction) {
		const target = interaction.options.getMember('target');
		const role = interaction.options.getRole('role');
		const flag = interaction.options.getBoolean('flag');
		
		// If the role is being added
		if (flag) {
			// If the member already has the role, send a message back
			if(target.roles.cache.find(r => r.id === role.id)) {
				interaction.reply({content: `<@!${target.id}> already has that role!`, ephemeral: true});
			}
			// Otherwise they need the role
			else {
				await target.roles.add(role);
				interaction.reply({content: `<@!${target.id}> has been given the following role <@&${role.id}>`, ephemeral: true});
			}
		}
		// If the role is being removed
		else {
			// If the member has the role
			if(target.roles.cache.find(r => r.id === role.id)) {
				await target.roles.remove(role);
				interaction.reply({content: `<@!${target.id}> has had the following role removed <@&${role.id}>`, ephemeral: true});
			}
			// The user doesn't have the role
			else {
				interaction.reply({content: `<@!${target.id}> doesn't have that role!`, ephemeral: true});
			}
		}

	}
}