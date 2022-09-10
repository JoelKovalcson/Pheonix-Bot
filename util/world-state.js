const { EmbedBuilder, time } = require('discord.js');
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
			console.log('Checking for new state again in 60...');
			await new Promise(resolve => setTimeout(resolve, 60 * 1000));
			return await getState();
		}
		const timeList = [];
		timeList.push(worldStateData.earthCycle.expiry);
		timeList.push(worldStateData.cetusCycle.expiry);
		timeList.push(worldStateData.cambionCycle.expiry);
		timeList.push(worldStateData.vallisCycle.expiry);

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
			shortestExpiry
		}
		return prevWorldState;
	}
	catch (err) {
		// Log the error and wait 60 seconds before attempting to get the state again
		console.log(err, response);
		await new Promise(resolve => setTimeout(resolve, 60*1000));
		return await getState();
	}
}

async function worldStateHandler(guild) {
	console.log('Updating World State...');
	const worldState = await getState();
	const updateMessage = await guild.channels.cache.find(channel => channel.id == process.env.WORLD_STATE_CHANNEL_ID).messages.fetch(process.env.WORLD_STATE_MESSAGE_ID);
	
	const newEmbed = new EmbedBuilder().setTitle('Current World State');
	newEmbed.setTimestamp(Date.parse(worldState.timestamp));
	newEmbed.addFields({name: `__Earth__`, value: `*${worldState.earthCycle.state.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.earthCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false});
	newEmbed.addFields({name: `__Plains of Eidolon__`, value: `*${worldState.cetusCycle.state.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.cetusCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false});
	newEmbed.addFields({name: `__Orb Vallis__`, value: `*${worldState.vallisCycle.state.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.vallisCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false});
	newEmbed.addFields({name: `__Cambion Drift__`, value: `*${worldState.cambionCycle.active.toUpperCase()}* until ${time(Math.floor(Date.parse(worldState.cambionCycle.expiry) / 1000), TimestampStyles.ShortTime)}`, inline: false});

	await updateMessage.edit({embeds: [newEmbed.data]});
	console.log('World State updated!');
	const nextUpdate = Date.parse(worldState.shortestExpiry) - Date.now();
	console.log(`Next update in ${Math.floor(nextUpdate / 1000)} seconds.`);
	setTimeout(() => {
		worldStateHandler(guild);
	}, nextUpdate);
}

module.exports = { worldStateHandler };