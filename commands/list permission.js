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
		const command = (await interaction.client.guilds.cache.get(interaction.guildId).commands.fetch()).find((command) => command.name === command_name);

		if (!command) {
			interaction.reply('Command name not found.');
			return;
		}

		let perms;
		try {
			perms = await command.permissions.fetch();
		}
		catch {
			perms = undefined;
		}

		const em = new MessageEmbed()
			.setTitle(command_name)
			.setDescription(`Default permission: \`${(command.defaultPermission) ? 'on' : 'off'}\``);

		
		if (perms) {
			let roles = '';
			let users = '';
			for (var perm of perms) {
				if (perm.type == 'ROLE') roles += ` <@&${perm.id}>`
				else if (perm.type == 'USER') users += ` <@${perm.id}>`;
			}
			if(roles) em.addField('Roles', roles, false);
			if(users) em.addField('Users', users, false);
		}
		

		interaction.reply({
			embeds: [em]
		})
	}
}