const {SlashCommandBuilder} = require('@discordjs/builders');
const { Role, GuildMember } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removeperm')
		.setDescription('Set whether a user or role can use a specific command')
		.setDefaultPermission(false)
		.addMentionableOption(option => option.setName('target').setDescription('The user or role').setRequired(true))
		.addStringOption(option => option.setName('command').setDescription('The command to remove permission').setRequired(true)),
	async execute(interaction) {
		const mentionable = interaction.options.getMentionable('target');
		const command_name = interaction.options.getString('command');
		const command = (await interaction.client.guilds.cache.get(interaction.guildId).commands.fetch()).find((command) => command.name === command_name);
		if(!command) {
			interaction.reply('Command name not found.');
			return;
		}
		if (mentionable instanceof Role) {
			command.permissions.remove({command: command.id, roles: mentionable.id})
				.then(interaction.reply({content:`Permission for \`${command_name}\` has been removed from <@&${mentionable.id}>`, ephemeral: true}));
		}
		else if (mentionable instanceof GuildMember) {
			command.permissions.remove({command: command.id, users: mentionable.id})
				.then(interaction.reply({content:`Permission for \`${command_name}\` has been removed from <@${mentionable.id}>`, ephemeral: true}));
		}
		else {
			interaction.reply('Invalid arguments provided.');
			return;
		}
	}
}