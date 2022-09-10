const StorageUpdates = require('./storage-updates');
const SlashCommands = require('./slash-commands');
const RecruitingMembers = require('./recruiting-member');

const EventHandlers = {...StorageUpdates, ...SlashCommands, ...RecruitingMembers};

module.exports = {EventHandlers};