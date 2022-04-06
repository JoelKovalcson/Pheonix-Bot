const { TimestampStyles } = require("@discordjs/builders");
const { MessageEmbed, Formatters } = require("discord.js");

const visitorList = [];
const visitorStorageName = "Visitor List";
const visitorMessages = [];

async function readStorage(guild) {
	const storageChannel = await guild.channels.fetch(`${process.env.STORAGE_CHANNEL_ID}`);
	const messages = await storageChannel.messages.fetch();
	// This currently assumes that this channel won't get filled with messages as the fetch gets up to 50 messages.
	// Get messages from the channel
	for (var message in messages) {
		// Find the messages storing visitor information
		if (message.embeds[0].title === visitorStorageName && message.author.id == guild.client.user.id) {
			visitorMessages.push(message);
			// Look through the fields
			for (var field in message.embeds[0].fields) {
				// Get all users listed in that field
				const users = field.value.split('\n');
				// For each user line
				for (var user in users) {
					// Get their information
					const userInfo = user.split(' ');
					// We know this regex will work as we wrote the original embed
					const id = userInfo[0].match(/(\d+)/)[0];
					const date = userInfo[userInfo.length-1];
					// Add them to the visitor list
					visitorList.push({
						id,
						date: Date.parse( parseInt(date.split(':')[1]) * 1000 )
					});
				}
				
			}
		}
	}
}

async function writeStorage() {
	const storageChannel = await guild.channels.fetch(`${process.env.STORAGE_CHANNEL_ID}`);
	let curEmbed;
	let messageNum = 0;
	let blockNum = 0;
	let i;
	let visitors = '';
	for (i = 0; i < visitorList.length; i++) {
		// Setup for every message, limiting to 60 users per message
		if (i % 60 === 0) {
			// Get the current message index
			messageNum = Math.floor(i/60);
			// Check if a message exists
			if (visitorMessages.length > messageNum) {
				// If it does, get the current embed to use
				curEmbed = visitorMessages[messageNum].embeds[0];
				// Clear fields to fill with visitors
				curEmbed.setFields([]);
			}
			// If no message exists, create one
			else {
				const message = await storageChannel.send({embeds: [new MessageEmbed().setTitle(visitorStorageName)]});
				curEmbed = message.embeds[0];
				// Add new message to the visitor message array
				visitorMessages.push(message);
			}
		}
		if (i % 10 === 0) {
			blockNum = Math.floor(i/10);
			if (visitors) curEmbed.addField(`Block ${blockNum+1}`, visitors, true);
			visitors = '';
		}
		visitors += `\n<@!${visitorList[i].id}> has been a visitor since ${Formatters.time(visitorList[i].date, TimestampStyles.RelativeTime)}`
	}
}

module.exports = {readStorage, writeStorage};