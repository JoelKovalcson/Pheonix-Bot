require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { commands } = require('./commands');
const { handleRecruitingButtons } = require('./event-handlers/recruiting-member');
const { handleSlashCommands } = require('./event-handlers/slash-commands');
const { storageMemberUpdate, storageUserUpdate, storageMemberRemove } = require('./event-handlers/storage-updates');
const { checkRoster } = require('./util/check-roster');
const { readStorage, writeStorage } = require('./util/storage');
const { worldStateHandler } = require('./util/world-state');



const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]});
client.commands = commands;

client.once('ready', () => {
	console.log('Bot Ready!');
});

client.on('interactionCreate', async interaction => {
	if (interaction.isChatInputCommand()) {
		await handleSlashCommands(client, interaction);
	}
	else if (interaction.isButton()) {
		await handleRecruitingButtons(client, interaction);
	}
});

client.on('userUpdate', async (oldUser, newUser) => {
	await storageUserUpdate(client, oldUser, newUser);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	await storageMemberUpdate(client, oldMember, newMember);
});

client.on('guildMemberRemove', async (member) => {
	await storageMemberRemove(client, member);
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