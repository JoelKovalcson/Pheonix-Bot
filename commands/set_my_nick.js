const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Embed } = require('discord.js');
const { getVisitorRole, getIGNUnknownRole } = require('../util/get-roles');

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
			.setDescription(`Used by: <@${interaction.user.id}>`);

		// This should work as long as the nickname isn't too long and the bot has perms higher than the user.
		try {
			await interaction.member.setNickname(nick);

			await interaction.reply({content:`Successfully set nickname to: ${nick}`, ephemeral: true});
			const visitorRole = await getVisitorRole(interaction.guild);
			const ignUnknownRole = await getIGNUnknownRole(interaction.guild);
			
			await interaction.member.roles.remove(ignUnknownRole);
			await interaction.member.roles.add(visitorRole);
			
			logMessage.addFields({name: 'Success', value: `<@${interaction.member.id}> has changed nickname to \`${nick}\`.`, inline: false});
			return {embeds: [logMessage.data]};
		}
		catch (err) {
			console.log(`\x1b[31m${err}\x1b[0m`);

			interaction.reply({content:`An error occurred setting nickname to: ${nick}`, ephemeral: true});
			
			logMessage.addFields({name: 'Failed', value: `Error setting nickname to ${nick}`, inline: false});
			return {embeds: [logMessage.data]};
		}
	}
}