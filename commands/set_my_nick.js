const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getVisitorRole } = require('../util/get-roles');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setmynick')
		.setDescription('Sets the nickname of the user to the string provided')
		.addStringOption(option => option.setName('nick').setDescription('The nickname for the user').setRequired(true))
		.setDefaultPermission(false),
	async execute(interaction) {
		const nick = interaction.options.getString('nick');

		const logMessage = new MessageEmbed()
			.setTitle('setmynick')
			.setDescription(`Used by: <@!${interaction.user.id}>`);

		// This should work as long as the nickname isn't too long and the bot has perms higher than the user.
		interaction.member.setNickname(nick)
			.then(() => {
				getVisitorRole(interaction.client.guilds.cache.get(interaction.guildId)).then((visitor_role) => {
					interaction.member.roles.add(visitor_role);
					interaction.reply({content:`Successfully set nickname to: ${nick}`, ephemeral: true});
					return {embeds: [logMessage.addField('Success', `<@!${member.id}> has changed nickname to \`${nick}\`.`, false)]};
				});
			})
			.catch(err => {
				console.log(err);
				interaction.reply({content:`An error occurred setting nickname to: ${nick}`, ephemeral: true});
				return {embeds: [logMessage.addField('Failed', `Error setting nickname to ${nick}`, false)]}
			});
	}
}