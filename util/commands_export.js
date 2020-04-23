const CommandsExport = module.exports = {
    commands: null,
    set: function(newCommands) {
        CommandsExport.commands = newCommands;
    },
    list: function() {
        return CommandsExport.commands;
    }
}