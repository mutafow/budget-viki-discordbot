const Discord = require("discord.js");
const dotenv = require("dotenv").config();
const {prefix, token} = process.env;
const client = new Discord.Client();
const https = require('https');
const fs = require('fs');
const path = require('path');
const RECORDS_FOLD = require("path").join(__dirname, `/records/`);
let reactionsFile = fs.readFileSync("./reactions.json");
let reactions = JSON.parse(reactionsFile);

client.login(token);

client.once('ready', () => console.log('ready'));

const determineName = (reaction) => {
	if (reaction.emoji.id == null)
		return reaction.emoji.name;
	else
		return `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
};

const filter = (reaction, user) => {
	let reactionName = determineName(reaction);
	console.log("received: " + reactionName);
	return reaction != null && reactions[reactionName] !== undefined;
};

client.on('message', async message => {
    if (!message.guild) return;

    const content = message.content.split(' ');

	message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
	.then(collected => {
		const reaction = collected.first();
		let reactionName = determineName(reaction);
		console.log(reactionName);
		if (reaction) 
			playRecord(reactions[reactionName], message);
	})
	.catch(collected => {
		console.log('received unknown reaction');
	});
	
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
        case 'bind': 
            bindReaction(message);
            break;
        case 'unbind': 
            unbindReaction(message);
            break;
        break;
        default:
            message.channel.send('Kakvo mi govorish?');
            break;
    }
})

const bindReaction = (message) => {
    const {content} = message;
	let emoji = content[2];
	reactions[emoji] = content[3];
	fs.writeFile('reactions.json', JSON.stringify(reactions), function(error) {
		console.log(`added ${emoji}`);
    });
    message.react(':ok_hand:');
}

const unbindReaction = (message) => {
    const {content} = message;
	let emoji = content[2];
	delete reactions[emoji];
	fs.writeFile('reactions.json', JSON.stringify(reactions), function(error) {
		console.log(`deleted ${emoji}`);
    });
    message.react(':ok_hand:');
}

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
      }
}

const listRecords = () => {
    const dirs = getDirs();
    const flippedReacts = objectFlip(reactions);

    console.log(flippedReacts);

    const mappedDirs = dirs.map( (dir, i) => {
        const name = getNameFromDir(dir);
        const emoji = flippedReacts[name] || '-';

        console.log(name, emoji);
        return `${i}. ${name} (${emoji})\n`;
    });

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setImage('https://cdn.discordapp.com/app-icons/701873228880281632/1bbbe91aac7d0e7a664a8d51a0e635cb.png?size=256')
        .setTitle('Frazi:')
        .setDescription(mappedDirs)
        .setFooter('Bati tupiq app', 'https://cdn.discordapp.com/app-icons/701873228880281632/1bbbe91aac7d0e7a664a8d51a0e635cb.png?size=256')
        ;

    return embed;
}

const getDirs = () => {
    return fs.readdirSync(RECORDS_FOLD)
        .map((e) => { return path.join(RECORDS_FOLD, e); });   
}

const getNameFromDir = dir => {
    return dir.split('\\').slice(-1)[0].split('/').slice(-1)[0].split('.')[0]; // NAI LUDIQ RED MAIKO
}

const objectFlip = (obj) => {
    return Object.entries(obj).reduce((ret, entry) => {
      const [ key, value ] = entry;
      ret[ value ] = key;
      return ret;
    }, {});
  }