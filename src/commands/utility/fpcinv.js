require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');



module.exports =  {
    data: new SlashCommandBuilder()
        .setName('fpcinv')
        .setDescription('Replies with the permanent link to the Fluffy Pup Club server!'),
    
    async execute(client, interaction) {
        const roleColor = interaction.inGuild()
            ? interaction.member.roles.color?.color ?? Colors.Blurple
            : Colors.Blurple;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setColor(roleColor)
            .setDescription(process.env.GUILD_INV)
            .setTitle('Will someone new come to play?')
            .setFooter({text:'Remember that Fluffy Pup Club is a private server!', iconURL:client.user.displayAvatarURL()})
            .setTimestamp();

        await interaction.reply({ content: null, embeds: [embed] });
    },
};