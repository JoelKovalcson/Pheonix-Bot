const { Collection } = require('discord.js');
const fs = require('fs');
const commandFiles = fs.readdirSync('./commands').filter(file => {
	if(file.endsWith('.js') && file != 'index.js') return true;
	else return false;
});

const commands = new Collection();
const commandsJSON = [];

for (const file of commandFiles) {
	const command = require(`./${file}`);
	commands.set(command.data.name, command);
	commandsJSON.push(command.data.toJSON());
}

module.exports = { commands, commandsJSON };