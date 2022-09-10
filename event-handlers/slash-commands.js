const { logMessage } = require('../util/log');

const handleSlashCommands = async (client, interaction) => {
	const command = client.commands.get(interaction.commandName);

	if(!command) return;

	try {
		response = await command.execute(interaction);
		if (response) {
			logMessage(interaction.guild, response);
		}
	} catch (err) {
		console.error(err);
		await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
	}
}

module.exports = {handleSlashCommands};