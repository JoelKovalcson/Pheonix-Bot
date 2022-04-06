const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Echoes a message back to the user')
		.addStringOption(option => option.setName('message').setDescription('The message to echo').setRequired(true))
		.setDefaultPermission(false),
	async execute(interaction) {
		const msg = interaction.options.getString('message');
		if (msg) return interaction.reply(`Your message is: \`${msg}\``);
		return interaction.reply('No message was provided');
	}
}