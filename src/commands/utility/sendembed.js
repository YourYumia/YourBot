const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');



module.exports =  {
    data: new SlashCommandBuilder()
        .setName('sendembed')
        .setDescription('Create an embed!')
        .addStringOption(option => 
            option.setName('title')
                .setDescription('Embed title')
                .setRequired(true)
                .addChoices()
        )
        .addStringOption(option => 
            option.setName('description')
                .setDescription('Embed main text body')
                .setRequired(true)
                .addChoices()
        )
        .addAttachmentOption(option => 
            option.setName('thumbnail')
                .setDescription('Embed thumbnail')
                .setRequired(false)
        ),
    
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
            .setTitle(interaction.options.getString('title'))
            .setDescription(interaction.options.getString('description'))
            .setTimestamp();

        if (interaction.options.getAttachment('thumbnail')) {
            embed.setThumbnail(interaction.options.getAttachment('thumbnail').url);
        }

        await interaction.reply({ content: null, embeds: [embed] });
    },
};