const Discord = require("discord.js");
const Recording = require('../models/recording');

module.exports = {
	name: 'list',
	description: 'Displays a list of current recordings.',
	arguments: '',
	execute: async (message, args) => {
        const recordings = await Recording.find({});
        const recordingFields = recordings.map(rec => {return {name: rec.name, value: `React: ${rec.reaction === null ? '-' : rec.reaction} | [Download audio](${rec.url})` } })
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Frazi')
            .addFields(recordingFields)
            .setFooter('Bati tupiq app', 'https://cdn.discordapp.com/app-icons/701873228880281632/1bbbe91aac7d0e7a664a8d51a0e635cb.png?size=256')
        ;
        message.channel.send(embed);
    }
};