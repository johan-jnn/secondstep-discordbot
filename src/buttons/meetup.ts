import {
	bold,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	EmbedBuilder,
	hyperlink,
	inlineCode,
	quote,
	ThreadAutoArchiveDuration,
	underline,
} from "discord.js";
import WTBClient from "../main.js";
import BotButton from "../utils/button.js";
import { getErrorMessage, getMember } from "../utils/getters.js";

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

		if (interaction.channel?.type !== ChannelType.GuildText) return;
		const member = await getMember(interaction);
		if (!member) return;

		const { label } = this.informations;
		if (!label)
			return interaction.reply({
				content: getErrorMessage("Le bouton ne possède pas de label."),
				ephemeral: true,
			});

		const ticketTitle =
			interaction.message.embeds[0].author?.name || "<generated>";

		const name = `[${label}]> ` + ticketTitle;
		return interaction.channel.threads
			.create({
				name,
				autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
				reason: `${interaction.user.username} can sell ${name}.`,
				type: ChannelType.PrivateThread,
			})
			.then(async (thread) => {
				await thread.setInvitable(false);

				await thread.members.add(member);
				for await (const userID of this.client.settings.moderators
					.users)
					await thread.members.add(userID);
				for await (const roleID of this.client.settings.moderators
					.roles) {
					const members =
						interaction.guild?.roles.cache.get(roleID)?.members;

					if (!members) continue;
					await Promise.all(
						members
							.mapValues(({ id }) => thread.members.add(id))
							.values()
					);
				}

				const elementEmbed = new EmbedBuilder(
					interaction.message.embeds[0].toJSON()
				).setFooter({
					text: `Ticket ouvert par ${interaction.user.tag}`,
					iconURL: interaction.user.avatarURL() || undefined,
				});

				await thread
					.send({
						content: `Ticket en ${label} ouvert par ${
							interaction.user.tag
						} !\n${hyperlink(
							"Voir le WTB",
							interaction.message.url
						)}`,
						embeds: [elementEmbed],
					})
					.then((m) => m.pin());

				return interaction.reply({
					content: `Le ticket vient d'être ouvert ! ${hyperlink(
						"Clickez pour voir la conversation",
						thread.url
					)}`,
					ephemeral: true,
				});
			});
	}
}
