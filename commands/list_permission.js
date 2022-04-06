const {	SlashCommandBuilder } = require('@discordjs/builders');
const {	Role, GuildMember, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listperm')
		.setDescription('List all permissions for a command.')
		.setDefaultPermission(true)
		.addStringOption(option => option.setName('command').setDescription('The command to list permissions').setRequired(true)),
	async execute(interaction) {
		const command_name = interaction.options.getString('command');
		// Might look into seeing if there's a better way of doing this? Feels clunky
		const command = (await interaction.client.guilds.cache.get(interaction.guildId).commands.fetch()).find((command) => command.name === command_name);

		if (!command) {
			interaction.reply('Command name not found.');
			return;
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
		const em = new MessageEmbed()
			.setTitle(command_name)
			.setDescription(`Default permission: \`${(command.defaultPermission) ? 'on' : 'off'}\``);

		// If permissions exist, fill out role & user restrictions
		if (perms) {
			let roles = '';
			let users = '';
			for (var perm of perms) {
				if (perm.type == 'ROLE') {
					if (perm.id == interaction.client.guilds.cache.get(interaction.guildId).roles.everyone.id) roles += ` @everyone`
					else roles += ` <@&${perm.id}>`
				}
				else if (perm.type == 'USER') users += ` <@!${perm.id}>`;
			}
			// If role or users existed, add them to embed
			if(roles) em.addField('Roles', roles, false);
			if(users) em.addField('Users', users, false);
		}
		

		interaction.reply({
			embeds: [em]
		})
	}
}