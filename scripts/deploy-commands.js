require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { commandsJSON } = require('../commands');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commandsJSON })
	.then((response) => {
		// Log each command name and id to console (Might store this for populating selections later)
		for(var command of response) {
			console.log(`\x1b[33m${command.name}: ${command.id}\x1b[0m`);
		}
		console.log('\x1b[32mCommands deployed.\x1b[0m');
	})
	.catch(console.error);