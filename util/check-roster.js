const { addVisitor, addInactive, removeInactive, removeVisitor } = require("./storage");

async function checkRoster(guild) {
	console.log('\x1b[36mChecking roster...\x1b[0m');
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
		else removeVisitor(member);
		if (isInactive) addInactive(member);
		else removeInactive(member);
	});
	console.log('\x1b[32mRoster checked!\x1b[0m');
}

module.exports = {checkRoster};