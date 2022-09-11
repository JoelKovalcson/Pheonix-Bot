const { addVisitor, addInactive, removeInactive } = require("./storage");

async function checkRoster(guild) {
	console.log('Checking roster...');
	const members = await guild.members.fetch();
	
	members.forEach((member, id) => {
		let isVisitor = undefined;
		let isInactive = undefined;
		member.roles.cache.forEach((role, id) => {
			// If they are a visitor
			if (id == process.env.VISITOR_ROLE_ID) {
				isVisitor = true;
			}
			// If they are inactive and do not have override
			else if (id == process.env.INACTIVE_ROLE_ID && isInactive === undefined ) {
				isInactive = true;
			}
			// If they have active override
			else if (id == process.env.ACTIVE_OVERRIDE_ID) {
				isInactive = false;
			}
		});

		if (isVisitor) addVisitor(member);
		if (isInactive) addInactive(member);
		else removeInactive(member);
	});
	console.log('Roster checked!');
}

module.exports = {checkRoster};