const { EmbedBuilder, time, TimestampStyles } = require('discord.js');
const fetch = require('node-fetch');

let prevWorldState;

async function getState() {
	let worldStateData;
	let response;
	try {
		response = await fetch('https://api.warframestat.us/pc');
		worldStateData = await response.json();

		// The main case we want to get a new worldstate is if the new one matches the existing one
		if (prevWorldState && worldStateData && prevWorldState.timestamp == worldStateData.timestamp) {
			console.log('\x1b[33mChecking for new state again in 60...\x1b[0m');
			await new Promise(resolve => setTimeout(resolve, 60 * 1000));
			return await getState();
		}
		const timeList = [];
		timeList.push(worldStateData.earthCycle.expiry);
		timeList.push(worldStateData.cetusCycle.expiry);
		timeList.push(worldStateData.cambionCycle.expiry);
		timeList.push(worldStateData.vallisCycle.expiry);
		timeList.push(worldStateData.zarimanCycle.expiry);

		let shortestExpiry = timeList[0];
		for(let i = 1; i < timeList.length; i++) {
			if (timeList[i] < shortestExpiry) shortestExpiry = timeList[i];
		}

		prevWorldState = {
			timestamp: worldStateData.timestamp,
			earthCycle: worldStateData.earthCycle,
			cetusCycle: worldStateData.cetusCycle,
			cambionCycle: worldStateData.cambionCycle,
			vallisCycle: worldStateData.vallisCycle,
			zarimanCycle: worldStateData.zarimanCycle,
			shortestExpiry
		}
		return prevWorldState;
	}
	catch (err) {
		// Log the error and wait 60 seconds before attempting to get the state again
		console.log('\x1b[31m', err, response, '\x1b[0m');
		await new Promise(resolve => setTimeout(resolve, 60*1000));
		return await getState();
	}
}

async function worldStateHandler(guild) {
	console.log('\x1b[36mUpdating World State...\x1b[0m');
	const worldState = await getState();
	const updateMessage = await guild.channels.cache.find(channel => channel.id == process.env.WORLD_STATE_CHANNEL_ID).messages.fetch(process.env.WORLD_STATE_MESSAGE_ID);
	
	const newEmbed = new EmbedBuilder()
		.setTitle('Current World State')
		.setTimestamp(Date.parse(worldState.timestamp))
		.addFields(
			{name: `__Earth__`, value: `*${worldState.earthCycle.state.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.earthCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false},
			{name: `__Plains of Eidolon__`, value: `*${worldState.cetusCycle.state.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.cetusCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false},
			{name: `__Orb Vallis__`, value: `*${worldState.vallisCycle.state.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.vallisCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false},
			{name: `__Cambion Drift__`, value: `*${worldState.cambionCycle.active.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.cambionCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false},
			{name: `__Zariman__`, value: `*${worldState.zarimanCycle.state.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.zarimanCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false}
		);

	await updateMessage.edit({embeds: [newEmbed.data]});
	console.log('\x1b[32mWorld State updated!\x1b[0m');
	const nextUpdate = Date.parse(worldState.shortestExpiry) - Date.now();
	console.log(`\x1b[33mNext update in ${Math.floor(nextUpdate / 1000)} seconds.\x1b[0m`);
	setTimeout(() => {
		worldStateHandler(guild);
	}, nextUpdate);
}

module.exports = { worldStateHandler };