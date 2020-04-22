const mongoose = require('mongoose');

const recodgingSchema = new mongoose.Schema({
    name: String,
    url: String,
    reaction: String,
});



module.exports = mongoose.model('recordings', recodgingSchema);