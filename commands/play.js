const Recording = require('../models/recording');
const { reacts } = require('../config/config.json');
const playRecording = require('../actions/play');

module.exports = {
	name: 'play',
	description: 'Plays a recording from the database!',
	arguments: '<name>',
	execute: async (message, args) => {
        const [name] = args;
        const recording = await Recording.findOne({name});
        if(recording !== null) {
            const result = await playRecording(message, recording.url);
            await message.react(result ? reacts.success : reacts.error);
        } else {
            await message.react(reacts.error);
        }
	},
};