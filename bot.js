require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]});
const {commands, commandsJSON} = require('./commands');
const { checkRoster } = require('./util/check-roster');
const { logMessage } = require('./util/log');
const { readStorage, writeStorage, addVisitor, removeVisitor, removeInactive, addInactive } = require('./util/storage');
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

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	const difference = oldMember.roles.cache.difference(newMember.roles.cache);
	if (difference?.find(role => role.id == process.env.VISITOR_ROLE_ID)) {
		// Visitor role was removed
		if (oldMember.roles.cache.size > newMember.roles.cache.size) {
			removeVisitor(newMember);
		}
		// Visitor role was added
		else {
			addVisitor(newMember);
		}
		await writeStorage(newMember.guild);
	}
	else if (difference?.find(role => role.id == process.env.INACTIVE_ROLE_ID)) {
		if (oldMember.roles.cache.size > newMember.roles.cache.size) {
			removeInactive(newMember);
		}
		// Visitor role was added
		else {
			addInactive(newMember);
		}
		await writeStorage(newMember.guild);
	}
});

client.login(process.env.TOKEN)
	.then(async () => {
		// Get the guild and add perm command, and make sure the owner has the specified permission to add permissions
		const guild = await client.guilds.fetch(`${process.env.GUILD_ID}`);
		const addPermCommand = (await guild.commands.fetch()).find(command => command.name === 'addperm');
		const addPermPermissions = [
			{
				id: `${process.env.OWNER_ID}`,
				type: 'USER',
				permission: true
			},
			{
				id: `${process.env.DEVELOPER_ID}`,
				type: 'USER',
				permission: true
			}
		];
		await addPermCommand.permissions.add({permissions: addPermPermissions});
		// Setup nickname changing permissions
		const setNickCommand = (await guild.commands.fetch()).find(command => command.name === 'setmynick');
		const setNickPermissions = [
			{
				id: `${process.env.LOCKED_NICKNAME_ID}`,
				type: 'ROLE',
				permission: true
			}
		];
		await setNickCommand.permissions.add({permissions: setNickPermissions});
		await readStorage(guild);
		await checkRoster(guild);
		await writeStorage(guild);
	});