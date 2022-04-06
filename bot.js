require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]});
const {commands, commandsJSON} = require('./commands');
const { checkRoster } = require('./util/check-roster');
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

client.on('guildMemberAdd', async (member) => {
	const setNickCommand = await guild.commands.fetch(`${process.env.SETNICK_ID}`);
	const setNickPermissions = [
		{
			id: `${member.id}`,
			type: 'USER',
			permission: true
		}
	];
	await setNickCommand.permissions.add({permissions: setNickPermissions});
});

client.login(process.env.TOKEN)
	.then(async () => {
		// Get the guild and add perm command, and make sure the owner has the specified permission to add permissions
		const guild = await client.guilds.fetch(`${process.env.GUILD_ID}`);
		const addPermCommand = await guild.commands.fetch(`${process.env.ADDPERM_ID}`);
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
		const setNickCommand = await guild.commands.fetch(`${process.env.SETNICK_ID}`);
		const setNickPermissions = [
			{
				id: `${process.env.VISITOR_ROLE_ID}`,
				type: 'ROLE',
				permission: false
			},
			{
				id: `${process.env.MEMBER_ROLE_ID}`,
				type: 'ROLE',
				permission: false
			},
			{
				id: `${process.env.LEADERSHIP_ROLE_ID}`,
				type: 'ROLE',
				permission: false
			}
		];
		await setNickCommand.permissions.add({permissions: setNickPermissions});
		// checkRoster(guild);
	});