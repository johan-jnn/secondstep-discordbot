import type WTBClient from "../main.js";
import { GuildMember, type User } from "discord.js";
import Settings, { id } from "../../settings.js";

function findID(list: id[], id: id) {
	return list.find((e) => e == id);
}

export async function getModeratorUserList(client: WTBClient) {
	const {
		moderators,
		guild: { id: guildID },
	} = client.settings;

	const userList: User[] = [];
	const add = (user: User) =>
		!userList.find((u) => u.id === user.id) && userList.push(user);

	for await (const userID of moderators.users) {
		const found = await client.users.fetch(userID).catch(() => null);
		if (found) add(found);
	}

	if (moderators.roles.length) {
		const guild = client.guilds.cache.get(guildID);
		if (guild) {
			for await (const roleID of moderators.roles) {
				const role = await guild.roles.fetch(roleID);
				if (role) {
					for (const member of Array.from(role.members.values()))
						add(member.user);
				} else
					console.error(
						`!! Role with id [${roleID}] has not been found !!`
					);
			}
		} else console.error("!! The guild has not been found !!");
	}

	return userList;
}

export function isModerator(
	member: GuildMember,
	{ moderators }: Settings
): boolean {
	if (findID(moderators.users, member.id)) return true;
	const { roles } = member;
	return !!roles.cache.find((role) => findID(moderators.roles, role.id));
}
