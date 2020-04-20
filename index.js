const Discord = require("discord.js");
const {prefix, token} = process.env;
const client = new Discord.Client();
const https = require('https');
const fs = require('fs');
const path = require('path');
const RECORDS_FOLD = require("path").join(__dirname, `/records/`);

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
        case 'random':
            await playRandom(message);
            break;
        case 'list': 
            message.channel.send(listRecords());
            break;
        default:
            message.channel.send('Samo luck.');
            break;
    }
})

client.login(token);


const addRecord = (name, message) => {
    if(name === undefined || name === null || name === '') {
        message.channel.send('Ne sum dostatuchno lucknal da si izmislqm sam imena.');
    }
    downloadRecord(name, message);
}

const downloadRecord = (name, message) => {
    ensureDirectoryExistence(`${RECORDS_FOLD}`);
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
            console.log(name, isNaN(name));
            if(isNaN(name)) {
                message.channel.send('Samo skill e da ocelish imeto');
                return;
            } 
            else {
                const dirs = getDirs();
                const index = parseInt(name);
                if(dirs.length <= index || index < 0) {
                    message.channel.send('Samo skill e da ocelish imeto');
                    return;
                }
                else {
                    file = `${RECORDS_FOLD}${getNameFromDir(dirs[index])}.mp3`
                }
            }
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

const playRandom = async message => {
    const dirs = getDirs();

    // New random list of dirs
    const randomList = dirs.slice(0)
        .map((e) => { return Math.random() < .5 ? e : null; })
        .filter((e) => { return e != null; });
    
    const index = Math.floor(Math.random() * randomList.length);
    const name = getNameFromDir(randomList[index]);
    console.log(name);
    await playRecord(name, message);
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
    return dir.split('\\').slice(-1)[0].split('.')[0];
}

const ensureDirectoryExistence = (filePath) => {
    let dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}