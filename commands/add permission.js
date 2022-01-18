const {SlashCommandBuilder} = require('@discordjs/builders');
const { Role, GuildMember } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addperm')
		.setDescription('Set whether a user or role can use a specific command')
		.setDefaultPermission(true)
		.addMentionableOption(option => option.setName('target').setDescription('The user or role').setRequired(true))
		.addStringOption(option => option.setName('command').setDescription('The command to give use permission').setRequired(true)),
	async execute(interaction) {
		const mentionable = interaction.options.getMentionable('target');
		let perms;
		if (mentionable instanceof Role) {
			perms = {
				id: mentionable.id,
				type: 'ROLE',
				permission: true
			};
		}
		else if (mentionable instanceof GuildMember) {
			perms = {
				id: mentionable.id,
				type: 'USER',
				permission: true
			};
		}
		else {
			interaction.reply('Invalid Role or User provided.');
			return;
		}
		const command_name = interaction.options.getString('command');
		// Need to get the command ID from a table, going to use database
		const command = (await interaction.client.guilds.cache.get(interaction.guildId).commands.fetch()).find((command) => command.name === command_name);
		command.permissions.add({permissions: [perms]})
			.then(interaction.reply({content:'Permissions successfully added', ephemeral: true}));
	}
}