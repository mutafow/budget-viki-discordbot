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

const routeChannel = (react, user) => {
	if (react.message.member.voice.channel)
		return react.message;
	else
		return user.presence;
};

const reactionListener = async (react, user) => {
    const reaction = parseName(react);
    const result = await Recording.findOne({reaction});
    if(result !== null) {
		const destination = routeChannel(react, user);
        await playRecording(destination, result.url);
    } else {
        console.log('error');
    }
}

module.exports = {reactionListener, parseName, filter};