import { codeBlock, GuildMember, Interaction, italic, underline } from "discord.js";

export async function getMember(
	interaction: Interaction
): Promise<GuildMember | null> {
	if (!interaction.member) return null;
	if (interaction.member instanceof GuildMember) return interaction.member;
	return interaction.guild?.members.fetch({
		user: interaction.user,
	}) || null;
}

export function getErrorMessage(error: string) {
	return [
		underline("😭 Une erreur est survenu :"),
		codeBlock(error),
		italic("Contactez l'administrateur/développeur du robot ou vérifiez les arguments entrés !")
	].join("\n")
}
