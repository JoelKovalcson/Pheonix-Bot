const {SlashCommandBuilder} = require('@discordjs/builders');
const { GuildMember, User } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setmynick')
		.setDescription('Sets the nickname of the user to the string provided')
		.addStringOption(option => option.setName('nick').setDescription('The nickname for the user').setRequired(true))
		.setDefaultPermission(false),
	async execute(interaction) {
		const nick = interaction.options.getString('nick');

		// This should work as long as the nickname isn't too long and the bot has perms higher than the user.
		interaction.member.setNickname(nick)
			.then(() => {
				const visitor = 
				interaction.reply(`Successfully set nickname to: ${nick}`)
				interaction.member.roles.add(visitor)
			})
			.catch(err => {
				console.log(err);
				interaction.reply(`An error occurred setting nickname to: ${nick}`);
			});
	}
}