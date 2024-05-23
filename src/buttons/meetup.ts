import {
	APIMessageButtonInteractionData,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChannelType,
	ThreadAutoArchiveDuration,
} from "discord.js";
import WTBClient from "../main.js";
import BotButton from "../utils/button.js";

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

		const { thread } = interaction.message;
		if (thread)
			return interaction.reply({
				content: `Le ticket a déjà été ouvert. [Clique ici pour y accéder](${thread.url}).`,
				ephemeral: true,
			});

		await interaction.deferUpdate();
		const { label } = this.informations;
		const name =
			`[${label || "?"}]> ` +
			(interaction.message.embeds[0].author?.name || "<generated>");
		await interaction.channel.threads.create({
			name,
			startMessage: interaction.message,
			autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
			reason: `${interaction.user.username} can sell ${name}.`,
		});
	}
}
