const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: []})
	.then(() => console.log('\x1b[32mCommands cleaned.\x1b[0m'))
	.catch(console.error);