const Recording = require('../models/recording');
const { reacts } = require('../config/config.json');

module.exports = {
	name: 'bind',
    description: 'Binds an emoji to a recording.',
    execute: async (message, args) => {
        const [reaction, name] = args;
        const result = await Recording.findOneAndUpdate({name}, {reaction: reaction}, { new: true });
        if(result.reaction === reaction) {
            await message.react(reacts.success);
        } else {
            await message.react(reacts.error);
        }
    }
}