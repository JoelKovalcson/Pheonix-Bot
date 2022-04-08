const { TimestampStyles } = require("@discordjs/builders");
const { MessageEmbed, Formatters } = require("discord.js");

const visitorList = [];
const visitorStorageName = "Visitor List";
const visitorMessages = [];

const inactiveList = [];
const inactiveStorageName = "Inactive List";
const inactiveMessages = [];

async function readStorage(guild) {
	console.log('Reading storage...');
	const storageChannel = await guild.channels.fetch(`${process.env.STORAGE_CHANNEL_ID}`);
	const messages = (await storageChannel.messages.fetch()).reverse();
	// This currently assumes that this channel won't get filled with messages as the fetch gets up to 50 messages.
	// Get messages from the channel
	messages.forEach(message => {
		// Find the messages storing visitor information
		if (message.author.id == guild.client.user.id) {
			if (message.embeds[0].title === visitorStorageName) visitorMessages.push(message);
			else if (message.embeds[0].title === inactiveStorageName) inactiveMessages.push(message);
			// Look through the fields
			for (var field of message.embeds[0].fields) {
				// Get all users listed in that field
				const users = field.value.split('\n');
				// For each user line
				for (var user of users) {
					// Get their information
					const userInfo = user.split(' ');
					// We know this regex will work as we wrote the original embed
					const id = userInfo[0].match(/(\d+)/)[0];
					const date = userInfo[userInfo.length-1];
					// Add them to the visitor list
					if (message.embeds[0].title === visitorStorageName) {
						visitorList.push({
							id,
							date: parseInt(date.split(':')[1])
						});
					}
					else if (message.embeds[0].title === inactiveStorageName) {
						inactiveList.push({
							id,
							date: parseInt(date.split(':')[1])
						});
					}
				}
			}
		}
	});
	console.log('Storage read!');
}

function addInactive(member) {
	const foundUser = inactiveList.find(inactive => inactive.id === member.id);
	if(foundUser) return false;

	inactiveList.push({
		id: member.id,
		date: Math.floor(Date.now() / 1000)
	});
	console.log(`Added inactive: ${member.displayName}`);
	return true;
}

function removeInactive(member) {
	const foundUser = inactiveList.findIndex(inactive => inactive.id === member.id);
	if (foundUser < 0) return false;

	inactiveList.splice(foundUser, 1);
	console.log(`Removed inactive: ${member.displayName}`);
	return true;
}

function addVisitor(member) {
	const foundUser = visitorList.find(visitor => visitor.id === member.id);
	if(foundUser) return false;

	visitorList.push({
		id: member.id,
		date: Math.floor(Date.now() / 1000)
	});
	console.log(`Added visitor: ${member.displayName}`);
	return true;
}

function removeVisitor(member) {
	const foundUser = visitorList.findIndex(visitor => visitor.id === member.id);
	if (foundUser < 0) return false;

	visitorList.splice(foundUser, 1);
	console.log(`Removed visitor: ${member.displayName}`);
	return true;
}

async function writeStorage(guild) {
	console.log('Writing Storage...');
	const storageChannel = await guild.channels.fetch(`${process.env.STORAGE_CHANNEL_ID}`);
	let curEmbed = null;
	let messageNum = 0;
	let blockNum = 0;
	let i;
	let fieldStr = '';
	let curMessage = null;
	// Write all the visitor messages
	for (i = 0; i < visitorList.length; i++) {
		if (i % 10 === 0) {
			if (fieldStr) curEmbed.addField(`Block ${blockNum+1}`, fieldStr, false);
			blockNum = Math.floor(i/10);
			fieldStr = '';
		}
		// Setup for every message, limiting to 50 users per message
		if (i % 50 === 0) {
			// Get the current message index
			messageNum = Math.floor(i/50);
			// Check if a message exists
			if (visitorMessages.length > messageNum) {
				// Send previous message because it filled
				if (curMessage) await curMessage.edit({embeds: [curEmbed]});
				curMessage = visitorMessages[messageNum];
				// If it does, get the current message and embed to use
				curEmbed = visitorMessages[messageNum].embeds[0];
				// Clear fields to fill with visitors
				curEmbed.setFields([]);
			}
			// If no message exists, create one
			else {
				if (curMessage) await curMessage.edit({embeds: [curEmbed]});
				curMessage = await storageChannel.send({embeds: [new MessageEmbed().setTitle(visitorStorageName)]});
				curEmbed = curMessage.embeds[0];
				// Add new message to the visitor message array
				visitorMessages.push(curMessage);
			}
		}
		
		fieldStr += `\n<@!${visitorList[i].id}> has been a visitor since ${Formatters.time(visitorList[i].date, TimestampStyles.RelativeTime)}`
	}
	// Update the last message being used.
	if (i > 0) {
		curEmbed.addField(`Block ${blockNum+1}`, fieldStr, false);
		await curMessage.edit({embeds: [curEmbed]});
	}
	fieldStr = '';
	curEmbed = null;
	curMessage = null;
	// Write all the inactive messages
	for (i = 0; i < inactiveList.length; i++) {
		if (i % 10 === 0) {
			if (fieldStr) curEmbed.addField(`Block ${blockNum+1}`, fieldStr, false);
			blockNum = Math.floor(i/10);
			fieldStr = '';
		}
		// Setup for every message, limiting to 60 users per message
		if (i % 50 === 0) {
			// Get the current message index
			messageNum = Math.floor(i/50);
			// Check if a message exists
			if (inactiveMessages.length > messageNum) {
				// Send previous message because it filled
				if (curMessage) await curMessage.edit({embeds: [curEmbed]});
				curMessage = inactiveMessages[messageNum];
				// If it does, get the current message and embed to use
				curEmbed = inactiveMessages[messageNum].embeds[0];
				// Clear fields to fill with visitors
				curEmbed.setFields([]);
			}
			// If no message exists, create one
			else {
				if (curMessage) await curMessage.edit({embeds: [curEmbed]});
				curMessage = await storageChannel.send({embeds: [new MessageEmbed().setTitle(inactiveStorageName)]});
				curEmbed = curMessage.embeds[0];
				// Add new message to the visitor message array
				inactiveMessages.push(curMessage);
			}
		}
		fieldStr += `\n<@!${inactiveList[i].id}> has been inactive since ${Formatters.time(inactiveList[i].date, TimestampStyles.RelativeTime)}`
	}
	// Update the last message being used.
	if (i > 0) {
		curEmbed.addField(`Block ${blockNum+1}`, fieldStr, false);
		await curMessage.edit({embeds: [curEmbed]});
	}
	console.log('Storage updated!');
}

module.exports = {readStorage, writeStorage, addVisitor, removeVisitor, addInactive, removeInactive};