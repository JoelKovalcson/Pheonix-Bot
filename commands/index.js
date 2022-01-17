const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => {
	if(file.endsWith('.js') && file != 'index.js') return true;
	else return false;
});

const commands = [];
const commandsJSON = [];

for (const file of commandFiles) {
	const command = require(`./${file}`);
	commands.push(command);
	commandsJSON.push(command.data.toJSON());
}

module.exports = { commands, commandsJSON };