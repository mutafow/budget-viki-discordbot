const Recording = require('../models/recording');
const { reacts } = require('../config/config.json');
const commander = require('../util/commands_export');
const Discord = require("discord.js");

module.exports = {
	name: 'help',
    description: 'Displays help with bot\'s commands',
	execute: async (message, args) => {
        const commands = commander.list();
		const commandsFields = commands.map(rec => {return {name: rec.name, value: `${rec.description}`} })
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Help')
            .addFields(commandsFields)
            .setFooter('Bati tupiq app', 'https://cdn.discordapp.com/app-icons/701873228880281632/1bbbe91aac7d0e7a664a8d51a0e635cb.png?size=256')
        ;
        message.channel.send(embed);
	}
}