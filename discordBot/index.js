// import DiscordJS, { Intents } from 'discord.js';

const { Client, Intents } = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
    ]
});

client.on('ready', () => {
    console.log('Ready!');

    const guildId = '987431303051874374';
    const guild = client.guilds.cache.get(guildId);
    let commands

    if (guild) {
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }

    commands?.create({
        name: 'ping',
        description: 'replies with pong',
    })
});

client.on('messageCreate', (message) => {
    if (message.content === 'good boi') {
        message.reply('haha thanks 💛');
    }

});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }

    const { commandName, options } = interaction;

    if (commandName === "ping") {
        interaction.reply({
            content: 'pong, you wanna play?',
            //ephemeral: true,
        });
    }
});

client.on('messageCreate', (message) => {
    if (message.content === 'good night') {
        message.reply('you too');
    }
});

const msgFunction = async (daoName, userPublicAddress, slug) => {
    const channelID = '987075186312511569';
    const channel = await client.channels.fetch(channelID);
    channel.send(`New Review on ${daoName} \nby ${userPublicAddress} \nURL: https://www.truts.xyz/dao/${slug}`);
};

client.login(process.env.TOKEN);


module.exports = msgFunction;
