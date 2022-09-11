require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { commands } = require('./commands');
const { EventHandlers } = require('./event-handlers');

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]});
client.commands = commands;

client.once('ready', () => {
	console.log('Bot Ready!');
});

client.on('interactionCreate', async interaction => {
	if (interaction.isChatInputCommand()) {
		await EventHandlers.handleSlashCommands(client, interaction);
	}
	else if (interaction.isButton()) {
		await EventHandlers.handleRecruitingButtons(client, interaction);
	}
});

client.on('userUpdate', async (oldUser, newUser) => {
	await EventHandlers.storageUserUpdate(client, oldUser, newUser);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	await EventHandlers.storageMemberUpdate(client, oldMember, newMember);
});

client.on('guildMemberRemove', async (member) => {
	await EventHandlers.storageMemberRemove(client, member);
});

client.on('guildMemberAdd', async (member) => {
	await EventHandlers.checkInviteCounts(member.guild, member);
});

client.login(process.env.TOKEN)
	.then(async () => {
		await EventHandlers.storageSetup(client);
		await EventHandlers.checkInviteCounts(await client.guilds.fetch(`${process.env.GUILD_ID}`));
	});