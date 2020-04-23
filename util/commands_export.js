const Discord = require("discord.js");

const CommandsExport = module.exports = {
    set: function(newCommands) {
        CommandsExport.commands = newCommands;
    },
    list: function() {
        return CommandsExport.commands;
    }
}