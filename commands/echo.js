const {SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Colors} = require('discord.js');
const { getRecruiterRole } = require('../util/get-roles');

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
			.setDescription(`Used by: <@${interaction.user.id}>`);

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('startJoin')
					.setLabel('Join Clan')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('guestRole')
					.setLabel('Join Guest')
					.setStyle(ButtonStyle.Secondary)
			);

		const msgEm = new EmbedBuilder()
			.setColor(Colors.DarkOrange)
			.setTitle('Thank you for setting your nickname!')
			.setDescription('Welcome to The Phoenix Guards, below is a quick read to help you access the server!')
			.setThumbnail('https://cdn.discordapp.com/attachments/836119123153911842/1018227601174708325/Phoenix_2.png')
			.addFields(
				{
					name: 'Clan',
					value: 'In order to join our clan you can click the \`Join Clan\`'
							 + `button below and a thread will be opened where you can speak to a <@&${(await getRecruiterRole(interaction.guild)).id}> to join.`
							 + '\n\nBenefits for joining:'
							 + '\n- Access to custom <#962799755736539246> & guides!'
							 + '\n- Join in on <#1015800578586181683>'
							 + '\n- Enter <#845370421741486111> & <#892271158471299072>'
							 + '\n- Get <#840747930357071892> for any warframe issues you may have',
					inline: true
				},
				{
					name: 'Guest',
					value: 'In order to join as a guest you can click the \`Join Guest\`'
							 + 'button below. If you ever change your mind and want to join the clan, you will still have access to this channel.'
							 + '\n\n**Note: If you are an admin in another clan, contact us so we can get you the <@&871167977666531348> role.',
					inline: true
				}
			)
		
		// Note on if you are an admin in another clan, contact us so we can get you an Associate role

		try {
			interaction.channel.send({embeds: [msgEm.data], components: [row]});
			// if (msg) {
			// 	interaction.reply({content: `Your message is: \`${msg}\``, components: [row], ephemeral: true});
				logMessage.addFields({name: 'Success', value: `<@${interaction.member.id}> has created a message in <#${interaction.channelId}>.`, inline: false});
			// }
			// else {
			// 	interaction.reply('No message was provided');
			// 	logMessage.addFields({name: 'Failed', value: `<@${interaction.member.id}> tried to created an empty message in <#${interaction.channelId}>.`, inline: false});
			// }
		}
		catch (err) {
			console.log(err);

			// interaction.reply({content: 'An error occurred using this command.', ephemeral: true});
			
			logMessage.addFields({name: 'Failed', value: `An error occurred when <@${interaction.member.id}> tried to create a message in <#${interaction.channelId}>.`, inline: false});
		}
		return {embeds: [logMessage.data]};
	}
}