const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');



module.exports =  {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong and latency information!'),
    
    async execute(client, interaction) {
        const roleColor = interaction.inGuild()
            ? interaction.member.roles.color?.color ?? Colors.Blurple
            : Colors.Blurple;

        const initEmbed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setColor(roleColor)
            .setTitle('Pinging...')
            .setTimestamp();

        await interaction.reply({ content: null, embeds: [initEmbed] });
        const sent = await interaction.fetchReply();
        const pingTime = sent.createdTimestamp - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setColor(roleColor)
            .setTitle('Pong 🏓')
            .addFields(
                { name: 'Latency', value: `${pingTime}ms`, inline: true },
                {
                    name: 'API latency',
                    value: `${Math.round(interaction.client.ws.ping)}ms`,
                    inline: true
                }
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};