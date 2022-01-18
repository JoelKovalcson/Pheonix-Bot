require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const {commands, commandsJSON} = require('./commands');
client.commands = commands;

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if(!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if(!command) return;

	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(err);
		await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
	}
});

client.login(process.env.TOKEN);