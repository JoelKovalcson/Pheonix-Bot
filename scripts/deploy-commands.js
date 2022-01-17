const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { commandsJSON } = require('../commands');
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commandsJSON })
	.then(() => console.log('Commands deployed.'))
	.catch(console.error);