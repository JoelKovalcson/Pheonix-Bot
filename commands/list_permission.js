const {	SlashCommandBuilder } = require('@discordjs/builders');
const {	MessageEmbed } = require('discord.js');
const { command_list } = require('../util/command_list');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listperm')
		.setDescription('List all permissions for a command.')
		.setDefaultPermission(false)
		.addStringOption(option => {
			option.setName('command').setDescription('The command to list permissions').setRequired(true);
			for(let command of command_list) {
				option.addChoice(command, command);
			}
			return option;
		}),
	async execute(interaction) {
		const command_name = interaction.options.getString('command');
		// Might look into seeing if there's a better way of doing this? Feels clunky
		const command = (await interaction.client.guilds.cache.get(interaction.guildId).commands.fetch()).find((command) => command.name === command_name);

		const logMessage = new MessageEmbed()
			.setTitle('listperm')
			.setDescription(`Used by: <@!${interaction.user.id}>`);

		if (!command) {
			interaction.reply({content: 'Command name not found.', ephemeral: true});
			return {embeds: [logMessage.addField('Failed', 'Command name not found', false)]};
		}

		let perms;
		// If permissions don't exist for this command, set undefined
		try {
			perms = await command.permissions.fetch();
		}
		catch {
			perms = undefined;
		}

		// Create embed displaying default behavior for command
		const response = new MessageEmbed()
			.setTitle(command_name)
			.setDescription(`Default permission: \`${(command.defaultPermission) ? 'on' : 'off'}\``);

		// If permissions exist, fill out role & user restrictions
		if (perms) {
			let rolesEnabled = '';
			let rolesDisabled = '';
			let usersEnabled = '';
			let usersDisabled = '';
			for (var perm of perms) {
				if (perm.type == 'ROLE') {
					if (perm.id == interaction.client.guilds.cache.get(interaction.guildId).roles.everyone.id) perm.permission ? (rolesEnabled += ` @everyone`) : (rolesDisabled += ` @everyone`);
					else perm.permission ? (rolesEnabled += ` <@&${perm.id}>`) : (rolesDisabled += ` <@&${perm.id}>`);
				}
				else if (perm.type == 'USER') perm.permission ? (usersEnabled += ` <@!${perm.id}>`) : (usersDisabled += ` <@!${perm.id}>`);
			}
			// If role or users existed, add them to embed
			if (rolesEnabled) response.addField('Roles Enabled', rolesEnabled, false);
			if (rolesDisabled) response.addField('Roles Disabled', rolesDisabled, false);
			if (usersEnabled) response.addField('Users Enabled', usersEnabled, false);
			if (usersDisabled) response.addField('Users Disabled', usersDisabled, false);
			
		}
		

		interaction.reply({
			embeds: [response],
			ephemeral: true
		});
		return {embeds: [logMessage.addField('Success', `Permissions for \`${command_name}\` listed.`, false)]}
	}
}