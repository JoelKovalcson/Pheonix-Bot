const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

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
		
		const logMessage = new MessageEmbed()
			.setTitle('changerole')
			.setDescription(`Used by: <@${interaction.user.id}>`);

		// If the role is being added
		if (flag) {
			// If the member already has the role, send a message back
			if(target.roles.cache.find(r => r.id === role.id)) {
				interaction.reply({content: `<@${target.id}> already has that role!`, ephemeral: true});
				return {embeds: [logMessage.addField('Failed', `<@${target.id}> already has the role <@&${role.id}>`, false)]};
			}
			// Otherwise they need the role
			else {
				await target.roles.add(role);
				interaction.reply({content: `<@${target.id}> has been given the following role <@&${role.id}>`, ephemeral: true});
				return {embeds: [logMessage.addField('Success', `<@${target.id}> has been given the role <@&${role.id}>`, false)]};
			}
		}
		// If the role is being removed
		else {
			// If the member has the role
			if(target.roles.cache.find(r => r.id === role.id)) {
				await target.roles.remove(role);
				interaction.reply({content: `<@${target.id}> has had the following role removed <@&${role.id}>`, ephemeral: true});
				return {embeds: [logMessage.addField('Success', `<@${target.id}> has had the following role taken away <@&${role.id}>`, false)]};
			}
			// The user doesn't have the role
			else {
				interaction.reply({content: `<@${target.id}> doesn't have that role!`, ephemeral: true});
				return {embeds: [logMessage.addField('Failed', `<@${target.id}> does not have the role <@&${role.id}>`, false)]};
			}
		}

	}
}