const Recording = require('../models/recording');
const { reacts, BOT_ID } = require('../config/config.json');
const playRecording = require('./play');

const parseName = reaction => {
    return reaction.emoji.id === null ?
        reaction.emoji.name :
        `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
}

const filter = (reaction, user) => {
    return user.id !== BOT_ID;
};

const bindReactionListener = message => {
    message.awaitReactions(filter, { max: 1, time: 60 * 60 * 4 * 1000, errors: ['time'] })
        .then(async collected => {
            const collectedReact = collected.first();
            const reaction = parseName(collectedReact);
            const result = await Recording.findOne({reaction});
            if(result !== null) {
                await playRecording(message, result.url);
            } else {
                console.log('error');
            }
        })
        .catch(collected => {
            console.log(collected);
            message.react('💤')
        });
}

module.exports = {bindReactionListener, parseName, filter};