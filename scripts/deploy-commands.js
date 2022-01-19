require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { commandsJSON } = require('../commands');

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commandsJSON })
	.then((response) => {
		// Log each command name and id to console (Might store this for populating selections later)
		for(var command of response) {
			console.log(`${command.name}: ${command.id}`);
		}
		console.log('Commands deployed.');
	})
	.catch(console.error);