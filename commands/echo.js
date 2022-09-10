const {SlashCommandBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Echoes a message back to the user')
		.addStringOption(option => option.setName('message').setDescription('The message to echo').setRequired(true))
		.setDefaultMemberPermissions('0'),

	async execute(interaction) {
		const msg = interaction.options.getString('message');
		
		if (msg) return interaction.reply(`Your message is: \`${msg}\``);
		return interaction.reply('No message was provided');
	}
}