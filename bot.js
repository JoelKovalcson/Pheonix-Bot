require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]});
const {commands, commandsJSON} = require('./commands');
const { logMessage } = require('./util/log');
client.commands = commands;

client.once('ready', () => {
	console.log('Bot Ready!');
});

client.on('interactionCreate', async interaction => {
	if(!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if(!command) return;

	try {
		response = await command.execute(interaction);
		if (response) {
			logMessage( interaction.guild, response);
		}
	} catch (err) {
		console.error(err);
		await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
	}
});

client.login(process.env.TOKEN);