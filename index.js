const Discord = require("discord.js");
const {prefix, token} = process.env;
const client = new Discord.Client();
const https = require('https');
const fs = require('fs');
const path = require('path');
const RECORDS_FOLD = require("path").join(__dirname, `/records/`);

client.login(token);

client.once('ready', () => console.log('ready'));

client.on('message', async message => {
    if (!message.guild) return;

    const content = message.content.split(' ');

    if(content[0] !== `${prefix}viki`) {
        return;
    }

    const name = content[2];
    switch(content[1]) 
    {
        case 'add':
            await addRecord(name, message);
            break;
        case 'play':
            await playRecord(name, message);
            break;
        case 'list': 
            message.channel.send(listRecords());
            break;
        default:
            message.channel.send('Kakvo mi govorish?');
            break;
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
	// When we receive a reaction we check if the reaction is partial or not
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
	// Now the message has been cached and is fully available
	console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
	// The reaction is now also fully available and the properties will be reflected accurately:
	console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
});

const addRecord = (name, message) => {
    if(name === undefined || name === null || name === '') {
        message.channel.send('Ne sum dostatuchno lucknal da si izmislqm sam imena.');
        return;
    }
    if(message.attachments === null || message.attachments === undefined) {
        message.channel.send('Dai mi fail, a?');
        return;
    }
    downloadRecord(name, message);
}

const downloadRecord = (name, message) => {
    const it = message.attachments.values();
    const file = fs.createWriteStream(`${RECORDS_FOLD}${name}.mp3`);
    const request = https.get(it.next().value.url, function(response) {
        response.pipe(file);
    });
    file.on('finish', function() {
        file.close();
        message.channel.send("Skill.");
    });
}

const playRecord = async (name, message) => {
    if (message.member.voice.channel) {
        let file = `${RECORDS_FOLD}${name}.mp3`;
        
        if (!fs.existsSync(file)) {
            message.channel.send('Samo skill e da ocelish imeto');
            return;
        }
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(file, {volume: 1});

        console.log('playing ' + `${RECORDS_FOLD}${name}.mp3`)

        dispatcher.on('finish', () => {
            connection.disconnect();
            dispatcher.destroy();
        });

        dispatcher.on('error', error => {
            console.log(error)
        });
      } else {
        message.channel.send('You need to join a voice channel first!');
      }
}

const listRecords = () => {
    const dirs = getDirs();

    const mappedDirs = dirs.map( (dir, i) => `${i}. ${getNameFromDir(dir)}\n`);

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Frazi:')
        .setDescription(mappedDirs);

    return embed;
}

const getDirs = () => {
    return fs.readdirSync(RECORDS_FOLD)
        .map((e) => { return path.join(RECORDS_FOLD, e); });   
}

const getNameFromDir = dir => {
    return dir.split('\\').slice(-1)[0].split('/').slice(-1)[0].split('.')[0]; // NAI LUDIQ RED MAIKO
}
