const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');



// Return a Discord timestamp that is rendered in each viewer's local timezone.
function fixExpiry(expiry) {
    const date = new Date(expiry);
    if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Invalid expiry date: ${expiry}`);
    }

    return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}



function getFissures(data, interaction, roleColor) {
    const IDEAL = ["Survival", "Void Cascade"];
    const MISSIONS =  data.filter(m => m.tier === 'Omnia' && IDEAL.includes(m.missionType));
    const BONUS = data.filter(m => m.node.split(" ").includes('(Eris)'));
    if(BONUS != [])
    {
        for(let i = 0; i < BONUS.length; i++) {
            MISSIONS.push(BONUS[i]);
        };
    };
    
    const fieldArr = [];
    for (const m of MISSIONS) {
        const NODE = m.isHard ? `Steel Path ${m.missionType} ${m.node}` :`${m.missionType} ${m.node}`;
        const EXPIRY = fixExpiry(m.expiry);
        fieldArr.push({ name: NODE, value: `Expiration: ${EXPIRY}`, inline: false });
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

    return embed;
}



function getArchon(data, interaction, roleColor) {
    const MISSIONS = data.missions.map(m => m.type)
    const EXPIRY = fixExpiry(data.expiry)
    
    let shard = '';
    switch (data.boss) {
        case 'Archon Boreal':
            shard='Azure Shard';
        case 'Archon Amar':
            shard='Crimson Shard';
        case 'Archon Nira':
            shard='Topaz Shard';
    }

    const embed = new EmbedBuilder()
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setColor(roleColor)
        .setTitle(`Hunt Archon ${data.boss} for a ${shard}`)
        .setDescription(`Archon Hunt Expiration: ${EXPIRY}`)
        .addFields(
            { name:'Stage One',value:MISSIONS[0] },
            { name:'Stage Two',value:MISSIONS[1] },
            { name:'Stage Three',value:MISSIONS[2] }
        )
        .setTimestamp();
    
    return embed;
}



module.exports =  {
    data: new SlashCommandBuilder()
        .setName('warframe')
        .setDescription('Replies with specified Warframe world-state info!')
        .addIntegerOption(option =>
            option.setName('endpoint')
                .setDescription('fetch warframe info')
                .setRequired(true)
                .addChoices(
                    { name: 'fissures', value: 1 },
                    { name: 'archon', value: 2 }
                )
        ),
        
    
    async execute(client, interaction) {
        const roleColor = interaction.inGuild()
            ? interaction.member.roles.color?.color ?? Colors.Blurple
            : Colors.Blurple;

        const t =
        [
            {endpoint:'fissures',txt:'fissures',func:getFissures},
            {endpoint:'archonHunt',txt:'archon',func:getArchon}

        ][interaction.options.getInteger('endpoint')-1];

        const initEmbed = new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setColor(roleColor)
            .setTitle(`Fetching ${t.txt}...`)
            .setTimestamp();

        await interaction.reply({ content: null, embeds: [initEmbed] });
        
        await fetch(`https://api.warframestat.us/pc/${t.endpoint}`)
            .then(res => res.json())
            .then(data => {
                    return interaction.editReply({ embeds: [t.func(data, interaction, roleColor)] });
                })
            .catch(error => console.error(error));
    },
};