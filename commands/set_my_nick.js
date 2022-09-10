const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Embed } = require('discord.js');
const { getVisitorRole } = require('../util/get-roles');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setmynick')
		.setDescription('Sets the nickname of the user to the string provided')
		.addStringOption(option => option.setName('nick').setDescription('The nickname for the user').setRequired(true))
		.setDefaultMemberPermissions('0'),
	async execute(interaction) {
		const nick = interaction.options.getString('nick');

		const logMessage = new EmbedBuilder()
			.setTitle('setmynick')
			.setDescription(`Used by: <@!${interaction.user.id}>`);

		// This should work as long as the nickname isn't too long and the bot has perms higher than the user.
		try {
			await interaction.member.setNickname(nick);

			const visitor_role = await getVisitorRole(interaction.client.guilds.cache.get(interaction.guildId));
			
			interaction.member.roles.remove(process.env.LOCKED_NICKNAME_ID);
			interaction.member.roles.add(visitor_role);
			interaction.reply({content:`Successfully set nickname to: ${nick}`, ephemeral: true});
			
			logMessage.addField('Success', `<@!${interaction.member.id}> has changed nickname to \`${nick}\`.`, false);
			return {embeds: [logMessage.data]};
		}
		catch (err) {
			console.log(err);

			interaction.reply({content:`An error occurred setting nickname to: ${nick}`, ephemeral: true});
			
			logMessage.addField('Failed', `Error setting nickname to ${nick}`, false);
			return {embeds: [logMessage.data]}
		}
	}
}