const Recording = require('../models/recording');
const { reacts } = require('../config/config.json');

module.exports = {
	name: 'unbind',
    description: 'Unbinds emoji from recording.',
	arguments: '<recording>',
    execute: async (message, args) => {
        const [name] = args;
        const result = await Recording.findOneAndUpdate({name}, {reaction: null}, { new: true });
        if(result.reaction === null) {
            await message.react(reacts.success);
        } else {
            await message.react(reacts.error);
        }
    }
}