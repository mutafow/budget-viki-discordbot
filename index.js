const Discord = require("discord.js");
const https = require('https');
const fs = require('fs');
const client = new Discord.Client();
const commander = require('./util/commands_export');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const { reactionListener } = require('./actions/reaction-listener');
const { reacts } = require('./config/config.json');

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

commander.set(client.commands);

require("dotenv").config();
const { prefix, token } = process.env;

const mongoose = require('mongoose');
mongoose.connect(process.env.db_conn, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('DB Connection established!');
});


client.login(token);

client.once('ready', () => console.log('Connected to Discord API.'));

client.on('messageReactionAdd', async (react, user) => { await reactionListener(react, user) });

client.on('message', async message => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) {
        await message.react(reacts.error);
        return;
    }

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Schupilo se e neshto da mu eba maikata.');
    }
});

