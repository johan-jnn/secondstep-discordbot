import {
	bold,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	hyperlink,
	inlineCode,
	quote,
	ThreadAutoArchiveDuration,
	underline,
} from "discord.js";
import WTBClient from "../main.js";
import BotButton from "../utils/button.js";
import { getErrorMessage } from "../utils/getters.js";

export default class Meetup extends BotButton {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			new ButtonBuilder()
				.setLabel("Meetup")
				.setStyle(ButtonStyle.Primary)
				.setEmoji("🚶")
				.setLabel("Meetup")
		);
	}

	async onClick(interaction: ButtonInteraction): Promise<any> {
		if (!interaction.guild) return;
		if (
			!(
				interaction.channel?.type === ChannelType.GuildText ||
				interaction.channel?.type === ChannelType.GuildAnnouncement
			)
		)
			return;
		const { label } = this.informations;
		if (!label)
			return interaction.reply({
				content:
					"Oups... Une erreur est survenu (le bouton n'a pas de label). Contactez l'administrateur/développeur du robot.",
				ephemeral: true,
			});

		const { thread } = interaction.message;
		const ticketTitle =
			interaction.message.embeds[0].author?.name || "<generated>";
		if (thread) {
			const threadLabels = /\[\s*(.+?)(?:\s*&\s*(.*?))?\s*\]/.exec(
				thread.name
			);
			if (!threadLabels)
				return interaction.reply({
					content: getErrorMessage(
						"Les labels du thread n'ont pas été trouvé."
					),
					ephemeral: true,
				});

			if (threadLabels[0].includes(label))
				return interaction.reply({
					content: `Le ticket a déjà été ouvert. ${hyperlink(
						"Clickez ici pour y accéder",
						thread.url
					)}.`,
					ephemeral: true,
				});
			else {
				await thread.setName(`[${threadLabels[1]} & ${label}]`);

				await thread.send({
					content: [
						bold(
							underline(
								`${
									this.informations.emoji?.name ||
									"information_source"
								} Le ticket vient de changer d'état !`
							)
						),
						quote(
							`Il est désormais valable en ${inlineCode(
								threadLabels[1]
							)} et en ${inlineCode(label)}.`
						),
					].join("\n"),
				});

				return interaction.reply({
					content: `Le thread vient d'être modifié. ${hyperlink(
						"Cliquez pour y accéder",
						thread.url
					)}`,
					ephemeral: true,
				});
			}
		}
		const name = `[${label}]> ` + ticketTitle;
		return interaction.channel.threads
			.create({
				name,
				startMessage: interaction.message,
				autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
				reason: `${interaction.user.username} can sell ${name}.`,
			})
			.then((thread) =>
				interaction.reply({
					content: `Le ticket vient d'être ouvert ! ${hyperlink(
						"Clickez pour commencer la conversation",
						thread.url
					)}`,
					ephemeral: true,
				})
			);
	}
}
