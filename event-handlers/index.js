const StorageUpdates = require('./storage-updates');
const SlashCommands = require('./slash-commands');
const RecruitingMembers = require('./recruiting-member');
const InviteTracker = require('./inviter-tracking');

const EventHandlers = {...StorageUpdates, ...SlashCommands, ...RecruitingMembers, ...InviteTracker};

module.exports = {EventHandlers};