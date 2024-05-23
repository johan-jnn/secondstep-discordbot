import { GuildMember } from "discord.js";
import Settings, { id } from "../../settings.js";

function findID(list: id[], id: id) {
  return list.find(e => e == id)
}

export function isModerator(
	member: GuildMember,
	{ moderators }: Settings
): boolean {
	if (findID(moderators.users, member.id)) return true;
	const { roles } = member;
	return !!roles.cache.find((role) => findID(moderators.roles, role.id));
}
