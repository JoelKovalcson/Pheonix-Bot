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
	const visitorRole = await getVisitorRole(guild);
	const inactiveRole = await getInactiveRole(guild);
	// This currently assumes that this channel won't get filled with messages as the fetch gets up to 50 messages.
	// Get messages from the channel
	messages.forEach(message => {
		// Find the messages storing visitor information
		if (message.author.id == guild.client.user.id) {
			// Check if its a storage message and if so, search for users
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
	// Look through the fields (up to 5 plus 10 users per field for up to 50)
	for (var field of message.embeds[0].fields) {
		// Get all users listed in that field
		const users = field.value.split('\n');
		// For each user line (up to 10)
		for (var user of users) {
			// Get their information
			const userInfo = user.split(' ');
			// We know this regex will work as we wrote the original embed
			const id = userInfo[0].match(/(\d+)/)[0];
			const date = userInfo[userInfo.length-1];
			// If they aren't in the clan anymore, skip them
			if (!guild.members.cache.has(id)) {
				console.log(`\x1b[33mUser ${id} not found, removing from cache.\x1b[0m`);
				continue;
			}
			// If they have already been read from storage, skip them
			if (userList.find(user => user.id == id)) continue;
			// If they do not have the role for this storage method, skip them
			if ((guild.members.cache.get(id).roles.cache.find(r => {
				return r.id == role.id;
			})) === undefined) continue;
			// Otherwise put them in the storage
			userList.push({
				id,
				date: parseInt(date.split(':')[1])
			});
			// This is a message that holds users we are storage
			validMessage = true;
		}
	}

	// If there is a valid storage message, add it to the list
	if (validMessage) {
		messageList.push(message);
	}
	// Otherwise, delete the message
	else {
		await storageChannel.messages.delete(message);
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

	// Write all the visitor messages
	await writeMessages(visitorList, visitorMessages, 'visitor', visitorStorageName, storageChannel);
	// Write all the inactive messages
	await writeMessages(inactiveList, inactiveMessages, 'inactive', inactiveStorageName, storageChannel);
	
	console.log('\x1b[32mStorage updated!\x1b[0m');
}

async function writeMessages(userList, messageList, storageStr, storageName, storageChannel) {
	let curEmbed = null;
	let messageNum = 0;
	let blockNum = 0;
	let i;
	let fieldStr = '';
	let curMessage = null;

	for (i = 0; i < userList.length; i++) {
		
		// If we are starting a new field, put the previous "block" of 10 users in the embed
		if (i % 10 === 0) {
			if (fieldStr) curEmbed.addFields({name: `Block ${blockNum+1}`, value: fieldStr, inline: false});
			blockNum = Math.floor(i/10);
			fieldStr = '';
		}

		// Setup for every message, limiting to 50 users per message
		if (i % 50 === 0) {
			
			// Print the previous full message and move on to selecting the next message.
			if (curMessage) {
				// Check to see if the messages are identical before printing
				if (JSON.stringify(curMessage.embeds[0].fields) !== JSON.stringify(curEmbed.data.fields)) messageList[messageNum] = await curMessage.edit({embeds: [curEmbed.data]});
			}
			
			// Get the current message index
			messageNum = Math.floor(i/50);
			
			// Check if a message exists
			if (messageList.length > messageNum) {
				curMessage = messageList[messageNum];
				// Get a new embed to use
				curEmbed = new EmbedBuilder().setTitle(storageName);
			}
			// If no message exists, create one
			else {
				curMessage = await storageChannel.send({embeds: [new EmbedBuilder().setTitle(storageName)]});
				curEmbed = new EmbedBuilder().setTitle(storageName);
				// Add new message to the visitor message array
				messageList.push(curMessage);
			}
		}

		// If there are already users in the field, add a newline before adding the next.
		if (fieldStr) fieldStr += "\n";
		fieldStr += `<@${userList[i].id}> has been a ${storageStr} since ${time(userList[i].date, TimestampStyles.RelativeTime)}`
	}

	// When done looking through all messages, update the last message being used if there is still more to print
	if (i > 0) {
		curEmbed.addFields({name: `Block ${blockNum+1}`, value: fieldStr, inline: false});
		if (JSON.stringify(curMessage.embeds[0].fields) !== JSON.stringify(curEmbed.data.fields)) messageList[messageNum] = await curMessage.edit({embeds: [curEmbed.data]});
	}
}

module.exports = {readStorage, writeStorage, addVisitor, removeVisitor, addInactive, removeInactive, cleanStorage};