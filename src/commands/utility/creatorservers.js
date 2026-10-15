require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags } = require('discord.js');



module.exports =  {
    data: new SlashCommandBuilder()
        .setName('creatorservers')
        .setDescription('Replies with the permanent link to a chosen creator server!')
        .addIntegerOption(option =>
            option.setName('server')
                .setDescription('FPC / YV / FDS')
                .setRequired(true)
                .addChoices(
                    { name: 'fluffy pup club', value: 1 },
                    { name: 'your.vault', value: 2 },
                    { name: 'friend distribution service', value: 3 }
                )
        ),
    
    async execute(client, interaction) {
        const target = interaction.options.getInteger('server') - 1;
        const server = [
            {
                name: 'Fluffy Pup Club',
                title: 'Will someone new come to play?',
                footer: 'Remember that Fluffy Pup Club is a private server!',
                img: process.env.FPC_IMG,
                inv: process.env.FPC_INV
            }, 
            {
                name: 'Your.Vault',
                title: 'Yumia\'s personal vault',
                footer: 'What are you doing here?',
                img: process.env.YV_IMG,
                inv: process.env.YV_INV
            }, 
            {
                name: 'Friend Distribution Service',
                title: 'A gateway to Yumia and Co\'s private friend-group servers',
                footer: 'You\'ll need to submit a ticket to join a server from here!',
                img: process.env.FDS_IMG,
                inv: process.env.FDS_INV
            }
        ][target];

        if (interaction.user.id !== process.env.CREATOR_ID && target === 1) {
            return interaction.reply({
                content: 'You are not authorised to generate this link!',
                flags: MessageFlags.Ephemeral
            });
        }

        const roleColor = interaction.inGuild()
            ? interaction.member.roles.color?.color ?? Colors.Blurple
            : Colors.Blurple;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: server.name,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setColor(roleColor)
            .setThumbnail(server.img)
            .setDescription(server.inv)
            .setTitle(server.title)
            .setFooter({text:server.footer, iconURL:client.user.displayAvatarURL()})
            .setTimestamp();

        await interaction.reply({ content: null, embeds: [embed] });
    },
};