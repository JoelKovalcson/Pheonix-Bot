require('dotenv').config();
const { Client, GatewayIntentBits, MessageEmbed } = require('discord.js');
const { commands } = require('./commands');
const { checkRoster } = require('./util/check-roster');
const { logMessage } = require('./util/log');
const { readStorage, writeStorage, addVisitor, removeVisitor, removeInactive, addInactive } = require('./util/storage');
const { worldStateHandler } = require('./util/world-state');



const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]});
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

client.on('userUpdate', async (oldUser, newUser) => {
	if (oldUser.username != newUser.username) {
		// Check if they are part of this guild
		const member = client.guilds.cache.find(guild => guild.id == process.env.GUILD_ID).members.cache.find(member => member.id == newUser.id);
		if (member) {
			// Check if they had visitor/member/inactive roles
			if (member.roles.cache.find(role => role.id == process.env.MEMBER_ROLE_ID || role.id == process.env.VISITOR_ROLE_ID || role.id == process.env.INACTIVE_ROLE_ID)) {
				// If they didn't have a nickname, set their nickname to their old username
				if (!member.nickname) await member.setNickname(oldUser.username);
			}
		}
	}
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	// Check if there was a different in roles
	const difference = oldMember.roles.cache.difference(newMember.roles.cache);
	if (difference) {
		if (difference.find(role => role.id == process.env.VISITOR_ROLE_ID)) {
			// Visitor role was removed
			if (oldMember.roles.cache.size > newMember.roles.cache.size) {
				removeVisitor(newMember);
			}
			// Visitor role was added
			else {
				addVisitor(newMember);
			}
		}
		else if (difference.find(role => role.id == process.env.INACTIVE_ROLE_ID)) {
			// Inactive role was removed
			if (oldMember.roles.cache.size > newMember.roles.cache.size) {
				removeInactive(newMember);
			}
			// Inactive roll was added, check for lack of override role
			else if (oldMember.roles.cache.size < newMember.roles.cache.size && !newMember.roles.cache.find(role => role.id == process.env.ACTIVE_OVERRIDE_ID)) {
				addInactive(newMember);
			}
		}
		else if (difference.find(role => role.id == process.env.ACTIVE_OVERRIDE_ID)) {
			// Active override removed, check for inactive role as well 
			if (oldMember.roles.cache.size > newMember.roles.cache.size && newMember.roles.cache.find(role => role.id == process.env.INACTIVE_ROLE_ID)) {
				addInactive(newMember);
			}
			// It was given, so make sure they aren't on inactive list
			else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
				removeInactive(oldMember);
			}
		}
	}
});

client.on('guildMemberRemove', async (member) => {
	// Check if they are a visitor or inactive
	if (member.roles.cache.find(role => role.id == process.env.VISITOR_ROLE_ID || role.id == process.env.INACTIVE_ROLE_ID)) {
		// Remove them from both
		removeVisitor(member);
		removeInactive(member);
	}
});

client.login(process.env.TOKEN)
	.then(async () => {
		// Get the guild and add perm command, and make sure the owner has the specified permission to add permissions
		const guild = await client.guilds.fetch(`${process.env.GUILD_ID}`);
		
		await readStorage(guild);
		await checkRoster(guild);
		await writeStorage(guild);
		setInterval(async () => {
			await writeStorage(guild);
		}, 1000*60*5);

		worldStateHandler(guild);
		// guild.channels.cache.find(channel => channel.id == process.env.WORLD_STATE_CHANNEL_ID).send({embeds: [new MessageEmbed().setTitle('Current World State')]});
	});