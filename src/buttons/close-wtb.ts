import {
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CacheType,
	ChannelType,
	Message,
	quote,
	ThreadAutoArchiveDuration,
	time,
	TimestampStyles,
} from "discord.js";
import WTBClient from "../main.js";
import BotButton from "../utils/button.js";
import { getMember } from "../utils/getters.js";
import { isModerator } from "../utils/permissions.js";

export default class CloseWTB extends BotButton {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			new ButtonBuilder()
				.setEmoji("✖️")
				.setLabel("Fermer la recherche")
				.setStyle(ButtonStyle.Danger)
		);
	}

	async onClick(interaction: ButtonInteraction<CacheType>): Promise<any> {
		const member = await getMember(interaction);
		if (!member) return;
		if (!isModerator(member, this.client.settings))
			return interaction.reply({
				content: "Vous n'êtes pas autorisé à fermer la recherche.",
				ephemeral: true,
			});

		if (!interaction.message.deletable)
			return interaction.reply({
				content: "Je ne peux pas supprimer ce message...",
				ephemeral: true,
			});
		const { thread } = interaction.message;
		if (thread) {
			const closedChannel = this.client.channels.cache.get(
				this.client.settings.guild.channels.closed_commands
			);
			if (
				closedChannel?.type === ChannelType.GuildText ||
				closedChannel?.type === ChannelType.GuildAnnouncement
			) {
				const messages = Array.from(
					await thread.messages
						.fetch({
							after: interaction.message.id,
						})
						.then((col) => col.values())
				).reduceRight(
					(data, { author, content, createdAt }) => {
						const lastContent = data.at(-1);
						if (!lastContent) {
							// The first message is the bot creating message, so we can skip it
							data.push({
								author,
								messages: [
									{
										createdAt,
										content: "Le fil à été créé...",
									},
								],
							});
						} else if (lastContent.author.id !== author.id) {
							data.push({
								author,
								messages: [{ content, createdAt }],
							});
						} else
							lastContent.messages.push({ content, createdAt });
						return data;
					},
					[] as {
						author: Message["author"];
						messages: {
							content: string;
							createdAt: Date;
						}[];
					}[]
				);
				TimestampStyles.RelativeTime;
				closedChannel.threads
					.create({
						name: `[CLOSED] ${thread.name}`,
						autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
					})
					.then(async (archiveThread) => {
						for await (const block of messages) {
							await archiveThread.send(
								`${block.author.toString()}:\n${block.messages
									.map((message) =>
										quote(
											`${message.content} - ${time(
												message.createdAt,
												TimestampStyles.RelativeTime
											)}`
										)
									)
									.join("\n")}`
							);
						}
						return thread.delete(
							`La recherche a été fermé par ${interaction.user.toString()}.`
						);
					});
			}
		}

		const deleted = await interaction.message.delete();
		return interaction.reply({
			content: deleted
				? "Recherche supprimée !"
				: "Impossible de supprimer la recherche... Essayez de supprimez le message de vous même.",
			ephemeral: true,
		});
	}
}
