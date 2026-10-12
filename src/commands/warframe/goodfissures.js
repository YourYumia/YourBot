const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');



// Return a Discord timestamp that is rendered in each viewer's local timezone.
function fixExpiry(expiry) {
    const date = new Date(expiry);
    if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Invalid expiry date: ${expiry}`);
    }

    return `<t:${Math.floor(date.getTime() / 1000)}:f>`;
}



module.exports =  {
    data: new SlashCommandBuilder()
        .setName('goodfissures')
        .setDescription('Replies with active survival and void-cascade omnia fissures (Warframe)!'),
    
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
            .setTitle('Fetching fissures...')
            .setTimestamp();

        await interaction.reply({ content: null, embeds: [initEmbed] });
        
        await fetch('https://api.warframestat.us/pc/fissures')
            .then(res => res.json())
            .then(data => {
                    const IDEAL = ["Survival", "Void Cascade"];
                    const MISSIONS =  data.filter(m => m.tier === 'Omnia' && IDEAL.includes(m.missionType));
                    
                    const fieldArr = [];
                    for (const m of MISSIONS) {
                        const NODE = m.isHard ? `Steel Path ${m.node}` : m.node;
                        const EXPIRY = fixExpiry(m.expiry);
                        fieldArr.push({ name: NODE, value: EXPIRY, inline: true });
                    }

                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setColor(roleColor)
                        .setTitle('Good Fissures 💫')
                        .setFields(fieldArr)
                        .setTimestamp();

                    return interaction.editReply({ embeds: [embed] });
                })
            .catch(error => console.error(error));
    },
};