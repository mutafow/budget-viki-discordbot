const Recording = require('../models/recording');
const { reacts } = require('../config/config.json');

module.exports = {
	name: 'add',
	description: 'Adds a recording to the database.',
	arguments: '<name> [<reaction>] and attachment',
	execute: async (message, args) => {
        const { url } = message.attachments.values().next().value;
        const [name, reaction] = args;
        if(name === undefined) {
            await message.react(reacts.error);
            return;
        }
        const recoring = new Recording({name, url, reaction: reaction === undefined ? null : reaction});
        const dbCheck = await Recording.findOne({name});
        if(dbCheck === null) {
            recoring.save();
            await message.react(reacts.success)
        } else {
            await message.react(reacts.error);
        }
	},
};