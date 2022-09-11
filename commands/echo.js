const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Echoes a message back to the user')
		.addStringOption(option => option.setName('message').setDescription('The message to echo').setRequired(true))
		.setDefaultMemberPermissions('0'),

	async execute(interaction) {
		// const msg = interaction.options.getString('message');

		const logMessage = new EmbedBuilder()
			.setTitle('echo')
			.setDescription(`Used by: <@!${interaction.user.id}>`);

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('startJoin')
					.setLabel('Join Clan')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('guestRole')
					.setLabel('Get Guest Role')
					.setStyle(ButtonStyle.Secondary)
			);
		
		try {
			interaction.channel.send({content: `Thank you for setting your nickname!\nTo join the clan, click \`Join Clan\`. If you are a visitor interested in being a guest instead, click on \`Get Guest Role\`.`, components: [row]});
			// if (msg) {
			// 	interaction.reply({content: `Your message is: \`${msg}\``, components: [row], ephemeral: true});
				logMessage.addFields({name: 'Success', value: `<@!${interaction.member.id}> has created a message in <#${interaction.channelId}>.`, inline: false});
			// }
			// else {
			// 	interaction.reply('No message was provided');
			// 	logMessage.addFields({name: 'Failed', value: `<@!${interaction.member.id}> tried to created an empty message in <#${interaction.channelId}>.`, inline: false});
			// }
		}
		catch (err) {
			console.log(err);

			// interaction.reply({content: 'An error occurred using this command.', ephemeral: true});
			
			logMessage.addFields({name: 'Failed', value: `An error occurred when <@!${interaction.member.id}> tried to create a message in <#${interaction.channelId}>.`, inline: false});
		}
		return {embeds: [logMessage.data]};
	}
}