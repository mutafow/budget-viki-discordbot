const Recording = require('../models/recording');
const { reacts } = require('../config/config.json');

module.exports = {
	name: 'json',
	description: 'Sends a json with all recordings.',
	arguments: '',
	execute: async (message, args) => {
        const results = await Recording.find({});
        const recorings = results.map( ({name, url, reaction}) => {return {name, url, reaction}});
        message.channel.send(`\`\`\`json\n${JSON.stringify(recorings, null, 2)}\`\`\`}`);
	},
};