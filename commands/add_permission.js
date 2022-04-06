const {SlashCommandBuilder} = require('@discordjs/builders');
const { Role, GuildMember } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addperm')
		.setDescription('Set whether a user or role can use a specific command')
		.setDefaultPermission(false)
		.addMentionableOption(option => option.setName('target').setDescription('The user or role').setRequired(true))
		.addStringOption(option => option.setName('command').setDescription('The command to give use permission').setRequired(true))
		.addBooleanOption(option => option.setName('flag').setDescription('Whether to give or revoke permission').setRequired(true)),
	async execute(interaction) {
		const mentionable = interaction.options.getMentionable('target');
		const command_name = interaction.options.getString('command');
		const perm_set = interaction.options.getBoolean('flag');
		const command = (await interaction.client.guilds.cache.get(interaction.guildId).commands.fetch()).find((command) => command.name === command_name);
		let perms;
		let ping;

		if(!command) {
			interaction.reply('Command name not found.');
			return;
		}
		
		if (mentionable instanceof Role) {
			if (interaction.client.guilds.cache.get(interaction.guildId).roles.everyone.id == mentionable.id) ping = `@everyone`
			else ping = `<@&${mentionable.id}>`;
			perms = {
				id: mentionable.id,
				type: 'ROLE',
				permission: perm_set
			};
		}
		else if (mentionable instanceof GuildMember) {
			ping = `<@${mentionable.id}>`;
			perms = {
				id: mentionable.id,
				type: 'USER',
				permission: perm_set
			};
		}
		else {
			interaction.reply('Invalid Role or User provided.');
			return;
		}
		
		command.permissions.add({permissions: [perms]})
			.then(interaction.reply({content:`Permission for \`${command_name}\` turned ${(perm_set) ? 'on' : 'off'} for ${ping}`, ephemeral: true}));
	}
}