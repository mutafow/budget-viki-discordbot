const playRecording = async (message, recordingURL) => {
    if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(recordingURL, {volume: 1});

        dispatcher.on('finish', () => {
            connection.disconnect();
            dispatcher.destroy();
        });

        dispatcher.on('error', error => {
            console.log(error);
        });
        
        return true;
    } else {
        return false;
    }
}

module.exports = playRecording;