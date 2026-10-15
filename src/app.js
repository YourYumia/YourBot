const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
    REST,
    Routes,
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    ActivityType,
    PresenceUpdateStatus,
    Events,
    MessageFlags
} = require('discord.js');

const commandsPath = path.join(__dirname, 'commands');

function getCommandFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            return getCommandFiles(entryPath);
        }

        return entry.isFile() && entry.name.endsWith('.js')
            ? [entryPath]
            : [];
    });
}

async function deployCommands() {
    try {
        const commands = [];

        const commandFiles = getCommandFiles(commandsPath);

        console.log('\nDetected commands:')

        for (const filePath of commandFiles) {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                const dirName = filePath.split('\\')[(filePath.split('\\').length)-2].replace('\\', '');
                const fileName = filePath.split('\\')[(filePath.split('\\').length)-1].replace('.js', '');
                console.log(`• ${dirName} - ${fileName}`);
                commands.push(command.data.toJSON());
            } else {
                console.log(
                    `WARNING: The command at ${filePath} is missing a required data/execute property!`
                );
            }
        }

        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        console.log(`\nStarted refreshing for ${commands.length} application slash commands globally`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('\nSuccessfully reloaded all commands!');
    } catch (error) {
        console.error('\nError deploying commands:', error);
    }
}



// create new bot instance with permissions
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
    ]
});

// unordered list of unique 'command' items
client.commands = new Collection();

const commandFiles = getCommandFiles(commandsPath);

// register each command in the commands directory
for (const filePath of commandFiles) {
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`\nThe command ${filePath} is missing a required 'data' or 'execute' property!`);
    }
}



client.once(Events.ClientReady, async () => {
    console.log(`\n${client.user.tag} is ready!`);
    await deployCommands();
    console.log(`\nCommands deployed globally!`);

    const statusType = process.env.BOT_STATUS || 'online';
    const activityType = process.env.ACTIVITY_TYPE || 'PLAYING';
    const activityName = process.env.ACTIVITY_NAME || 'with the cute ones!';

     // required enums ;-;
     const activityTypeMap = {
        'PLAYING': ActivityType.Playing,
        'WATCHING': ActivityType.Watching,
        'LISTENING': ActivityType.Listening,
        'STREAMING': ActivityType.Streaming,
        'COMPETING': ActivityType.Competing
     };

     const statusMap = {
        'online': PresenceUpdateStatus.Online,
        'idle': PresenceUpdateStatus.Idle,
        'invisible': PresenceUpdateStatus.Invisible,
        'dnd': PresenceUpdateStatus.DoNotDisturb,
     };

     // create data with enum
     client.user.setPresence({
        status: statusMap[statusType],
        activities: [{
            name: activityName,
            type: activityTypeMap[activityType] 
        }]
     });

     console.log(
        `\n${client.user.tag} status is '${statusType}'\n`+
        `${client.user.tag} activity set to ${activityType} ${activityName}`
    );
});



client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        await interaction.reply({
            content: 'This command is unavailable. Please try again later.',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            // error message only visible to user that triggered the command
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral
            })
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral
            })
        }
    }
});



client.login(process.env.DISCORD_TOKEN);