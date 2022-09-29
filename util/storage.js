const { TimestampStyles, time, EmbedBuilder, ThreadAutoArchiveDuration } = require("discord.js");
const { getVisitorRole, getInactiveRole } = require("./get-roles");

const visitorList = [];
const visitorStorageName = "Visitor List";
const visitorMessages = [];

const inactiveList = [];
const inactiveStorageName = "Inactive List";
const inactiveMessages = [];

async function readStorage(guild) {
	console.log('\x1b[36mReading storage...\x1b[0m');
	await guild.members.fetch();
	const storageChannel = await guild.channels.fetch(`${process.env.STORAGE_CHANNEL_ID}`);
	const messages = (await storageChannel.messages.fetch()).reverse();
	const visitorRole = getVisitorRole(guild);
	const inactiveRole = getInactiveRole(guild);
	// This currently assumes that this channel won't get filled with messages as the fetch gets up to 50 messages.
	// Get messages from the channel
	messages.forEach(message => {
		// Find the messages storing visitor information
		if (message.author.id == guild.client.user.id) {
			// Check if its a storage message
			if (message.embeds[0].title === visitorStorageName) {
				searchMessage(guild, message, visitorList, visitorMessages, visitorRole, storageChannel);
			}
			else if (message.embeds[0].title === inactiveStorageName) {
				searchMessage(guild, message, inactiveList, inactiveMessages, inactiveRole, storageChannel);
			}
		}
	});
	console.log('\x1b[32mStorage read!\x1b[0m');
	console.log(`\x1b[34m${visitorList.length} Visitors\x1b[0m`);
	console.log(`\x1b[35m${inactiveList.length} Inactives\x1b[0m`);
}

async function searchMessage(guild, message, userList, messageList, role, storageChannel) {
	let validMessage = false;
	// Look through the fields (assumption is made that they exist since I wrote the storage method)
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
			if (!guild.members.cache.has(id)) {
				console.log(`\x1b[33mUser ${id} not found, removing from cache.\x1b[0m`);
				continue;
			}
			if (userList.find(user => user.id == id)) continue;
			if ((guild.members.cache.get(id).roles.cache.find(r => r.id == role.id)) === undefined) continue;
			userList.push({
				id,
				date: parseInt(date.split(':')[1])
			});
			validMessage = true;
		}
	}

	if (!validMessage) {
		await storageChannel.messages.delete(message);
	}
	else {
		messageList.push(message);
	}
}

async function cleanStorage(guild) {
	console.log('\x1b[36mCleaning Storage...\x1b[0m');
	let toKick = [];
	const curTime = new Date();
	const members = await guild.members.fetch();
	// Remove visitors from more than 5 days ago
	curTime.setDate(curTime.getDate() - 5);
	visitorList.forEach((visitor) => {
		if (curTime > visitor.date * 1000) {
			toKick.push(visitor);
		}
	});

	// Kick all that were found
	toKick.forEach(async (kick) => {
		let member = members.find(member => member.id == kick.id);
		await member.kick('Visitor has been here longer than 5 days.');
		console.log(`\x1b[33mKicked ${kick.id}\x1b[0m`);
	});
	toKick = [];

	// Remove inactives from more than 30 days ago
	curTime.setDate(curTime.getDate() - 25);
	inactiveList.forEach((inactive) => {
		if (curTime > inactive.date * 1000) {
			toKick.push(inactive);
		}
	});
	
	// Kick all that were found
	toKick.forEach(async (kick) => {
		let member = members.find(member => member.id == kick.id);
		await member.kick('Inactive has been here longer than 30 days.');
		console.log(`\x1b[33mKicked ${kick.id}\x1b[0m`);
	});
	console.log('\x1b[32mStorage Cleaned!\x1b[0m');
}

function addInactive(member) {
	const foundUser = inactiveList.find(inactive => inactive.id === member.id);
	if(foundUser) return false;

	inactiveList.push({
		id: member.id,
		date: Math.floor(Date.now() / 1000)
	});
	console.log(`\x1b[33mAdded inactive: ${member.displayName}\x1b[0m`);
	return true;
}

function removeInactive(member) {
	const foundUser = inactiveList.findIndex(inactive => inactive.id === member.id);
	if (foundUser < 0) return false;

	inactiveList.splice(foundUser, 1);
	console.log(`\x1b[33mRemoved inactive: ${member.displayName}\x1b[0m`);
	return true;
}

function addVisitor(member) {
	const foundUser = visitorList.find(visitor => visitor.id === member.id);
	if(foundUser) return false;

	visitorList.push({
		id: member.id,
		date: Math.floor(Date.now() / 1000)
	});
	console.log(`\x1b[33mAdded visitor: ${member.displayName}\x1b[0m`);
	return true;
}

function removeVisitor(member) {
	const foundUser = visitorList.findIndex(visitor => visitor.id === member.id);
	if (foundUser < 0) return false;

	visitorList.splice(foundUser, 1);
	console.log(`\x1b[33mRemoved visitor: ${member.displayName}\x1b[0m`);
	return true;
}

async function writeStorage(guild) {
	console.log('\x1b[36mWriting Storage...\x1b[0m');
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
			if (fieldStr) curEmbed.addFields({name: `Block ${blockNum+1}`, value: fieldStr, inline: false});
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
				if (curMessage) {
					// Check to see if the messages are identical
					if (JSON.stringify(curMessage.embeds[0].fields) !== JSON.stringify(curEmbed.data.fields)) visitorMessages[messageNum-1] = await curMessage.edit({embeds: [curEmbed.data]});
				}
				curMessage = visitorMessages[messageNum];
				// Get a new embed to use
				curEmbed = new EmbedBuilder().setTitle(visitorStorageName);
			}
			// If no message exists, create one
			else {
				if (curMessage) {
					// Check to see if the messages are identical
					if (JSON.stringify(curMessage.embeds[0].fields) !== JSON.stringify(curEmbed.data.fields)) visitorMessages[messageNum-1] = await curMessage.edit({embeds: [curEmbed.data]});
				}
				curMessage = await storageChannel.send({embeds: [new MessageEmbed().setTitle(visitorStorageName)]});
				curEmbed = new EmbedBuilder().setTitle(visitorStorageName);
				// Add new message to the visitor message array
				visitorMessages.push(curMessage);
			}
		}
		if (fieldStr) fieldStr += "\n";
		fieldStr += `<@${visitorList[i].id}> has been a visitor since ${time(visitorList[i].date, TimestampStyles.RelativeTime)}`
	}
	// Update the last message being used.
	if (i > 0) {
		curEmbed.addFields({name: `Block ${blockNum+1}`, value: fieldStr, inline: false});
		if (JSON.stringify(curMessage.embeds[0].fields) !== JSON.stringify(curEmbed.data.fields)) visitorMessages[messageNum] = await curMessage.edit({embeds: [curEmbed.data]});
	}
	fieldStr = '';
	curEmbed = null;
	curMessage = null;
	// Write all the inactive messages
	for (i = 0; i < inactiveList.length; i++) {
		if (i % 10 === 0) {
			if (fieldStr) curEmbed.addFields({name: `Block ${blockNum+1}`, value: fieldStr, inline: false});
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
				if (curMessage) {
					if (JSON.stringify(curMessage.embeds[0].fields) !== JSON.stringify(curEmbed.data.fields)) inactiveMessages[messageNum-1] = await curMessage.edit({embeds: [curEmbed.data]});
				}
				curMessage = inactiveMessages[messageNum];
				// If it does, get the current message and embed to use
				curEmbed = new EmbedBuilder().setTitle(inactiveStorageName);
			}
			// If no message exists, create one
			else {
				if (curMessage) {
					if (JSON.stringify(curMessage.embeds[0].fields) !== JSON.stringify(curEmbed.data.fields)) inactiveMessages[messageNum-1] = await curMessage.edit({embeds: [curEmbed.data]});
				}
				curMessage = await storageChannel.send({embeds: [new MessageEmbed().setTitle(inactiveStorageName)]});
				curEmbed = new EmbedBuilder().setTitle(inactiveStorageName);
				// Add new message to the visitor message array
				inactiveMessages.push(curMessage);
			}
		}
		if (fieldStr) fieldStr += "\n";
		fieldStr += `<@${inactiveList[i].id}> has been inactive since ${time(inactiveList[i].date, TimestampStyles.RelativeTime)}`
	}
	// Update the last message being used.
	if (i > 0) {
		curEmbed.addFields({name: `Block ${blockNum+1}`, value: fieldStr, inline: false});
		if (JSON.stringify(curMessage.embeds[0].fields) !== JSON.stringify(curEmbed.data.fields)) inactiveMessages[messageNum] = await curMessage.edit({embeds: [curEmbed.data]});
	}
	console.log('\x1b[32mStorage updated!\x1b[0m');
}

module.exports = {readStorage, writeStorage, addVisitor, removeVisitor, addInactive, removeInactive, cleanStorage};