import { GuildMember, Interaction } from "discord.js";

export async function getMember(
	interaction: Interaction
): Promise<GuildMember | null> {
	if (!interaction.member) return null;
	if (interaction.member instanceof GuildMember) return interaction.member;
	return interaction.guild?.members.fetch({
		user: interaction.user,
	}) || null;
}
