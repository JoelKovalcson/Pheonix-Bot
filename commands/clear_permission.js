const { SlashCommandBuilder } = require('@discordjs/builders');
const { Role, GuildMember, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearperm')
		.setDescription('Set whether a user or role can use a specific command')
		.setDefaultPermission(false)
		.addMentionableOption(option => option.setName('target').setDescription('The user or role').setRequired(true))
		.addStringOption(option => option.setName('command').setDescription('The command to clear permission').setRequired(true)),
	async execute(interaction) {
		const mentionable = interaction.options.getMentionable('target');
		const command_name = interaction.options.getString('command');
		const command = (await interaction.client.guilds.cache.get(interaction.guildId).commands.fetch()).find((command) => command.name === command_name);

		const em = new MessageEmbed()
			.setTitle('clearperm')
			.setDescription(`Used by: <@!${interaction.user.id}>`);

		if(!command) {
			interaction.reply({content: 'Command name not found.', ephemeral: true});
			return {embeds: [em.addField('Failed', 'Command name not found.', false)]};
		}
		if (mentionable instanceof Role) {
			command.permissions.remove({command: command.id, roles: mentionable.id})
				.then(() => {
					interaction.reply({content:`Permission for \`${command_name}\` has been cleared from <@&${mentionable.id}>`, ephemeral: true});
					return {embeds: [em.addField('Success', `Permission for \`${command_name}\` has been cleared from <@&${mentionable.id}>`, false)]};
				});
		}
		else if (mentionable instanceof GuildMember) {
			command.permissions.remove({command: command.id, users: mentionable.id})
				.then(() => {
					interaction.reply({content:`Permission for \`${command_name}\` has been cleared for <@!${mentionable.id}>`, ephemeral: true});
					return {embeds: [em.addField('Success', `Permission for \`${command_name}\` has been cleared for <@!${mentionable.id}>`, false)]};
				});
		}
		else {
			interaction.reply({content: 'Invalid arguments provided.', ephemeral: true});
			return {embeds: [em.addField('Failed', 'Invalid arguments provided', false)]};
		}
	}
}