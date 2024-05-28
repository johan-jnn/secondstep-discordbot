import {
	bold,
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
import { getErrorMessage, getMember } from "../utils/getters.js";
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
		if (!interaction.guild) return;
		if (interaction.channel?.type !== ChannelType.GuildText) return;

		const member = await getMember(interaction);
		if (!member) return;
		if (!isModerator(member, this.client.settings))
			return interaction.reply({
				content: "Vous n'êtes pas autorisé à fermer la recherche.",
				ephemeral: true,
			});

		if (!interaction.message.deletable)
			return interaction.reply({
				content: getErrorMessage(
					"Je ne peux pas supprimer ce message."
				),
				ephemeral: true,
			});

		const name = interaction.message.embeds[0].author?.name?.toLowerCase();
		if (!name)
			return interaction.reply({
				ephemeral: true,
				content: getErrorMessage(
					"Le nom du produit n'est pas récupérable..."
				),
			});

		const threads = interaction.channel.threads.cache.filter((thread) =>
			thread.name.toLowerCase().includes(name.toLowerCase())
		);

		if (threads?.size) {
			const category = this.client.channels.cache.get(
				this.client.settings.guild.categories.closed_tickets
			);
			if (category?.type !== ChannelType.GuildCategory)
				return interaction.reply({
					ephemeral: true,
					content: getErrorMessage(
						"La catégorie où créer les logs de tickets n'a pas été trouvé."
					),
				});
			if (
				!category
					.permissionsFor(await interaction.guild.members.fetchMe())
					.has("ManageChannels")
			)
				return interaction.reply({
					ephemeral: true,
					content:
						"Je n'ai pas la permission de créer des salons dans la catégories des tickets fermés.",
				});

			const needToBeSaved: {
				[key: string]: {
					author: Message["author"];
					messages: {
						content: string;
						createdAt: Date;
					}[];
				}[];
			} = {};

			for (const thread of threads.values()) {
				let createdBy: string | undefined;

				const messages = Array.from(
					await thread.messages
						.fetch({
							after: interaction.message.id,
						})
						.then((col) => col.values())
				).reduceRight(
					(data, { author, content, createdAt, system, embeds }) => {
						const lastContent = data.at(-1);
						if (system) return data;
						else if (!lastContent) {
							// The first message is the bot creating message, so we can skip it

							createdBy = embeds[0].footer?.text
								.split(/\s/)
								.at(-1);

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
					[] as (typeof needToBeSaved)[string]
				);

				if (messages) {
					const primaryKey = createdBy || "<unknown user>";
					const key =
						primaryKey in needToBeSaved
							? `${primaryKey} (${
									Object.keys(needToBeSaved).filter((k) =>
										k.startsWith(primaryKey)
									).length
							  })`
							: primaryKey;
					needToBeSaved[key] = messages;
				}
				thread.delete(
					`Le ticket a été fermé par ${interaction.user.tag}`
				);
			}

			const entries = Object.entries(needToBeSaved);
			if (entries.length) {
				interaction.guild.channels
					.create({
						name: (
							interaction.message.embeds[0].author?.name ||
							"unknown"
						)
							.replaceAll(/\s+/g, "-")
							.toLowerCase(),
						parent: category,
					})
					.then(async (channel) => {
						await channel.send({
							content:
								"Retranscription des messages lié au WTB suivant :",
							embeds: [interaction.message.embeds[0]],
						});

						for (const [name, messages] of entries) {
							await channel.threads
								.create({
									name,
									autoArchiveDuration:
										ThreadAutoArchiveDuration.OneHour,
									reason: `Retranscription des messages du thread par ${name}.`,
								})
								.then(async (thread) => {
									for await (const block of messages) {
										await thread.send(
											`${block.author.toString()}:\n${block.messages
												.map((message) =>
													quote(
														`${
															message.content
														} - ${time(
															message.createdAt,
															TimestampStyles.RelativeTime
														)}`
													)
												)
												.join("\n")}`
										);
									}
								});
						}
					});
			}
		}

		const deleted = await interaction.message.delete();
		return interaction.reply({
			content: deleted
				? "Recherche supprimée !"
				: getErrorMessage(
						"Impossible de supprimer la recherche... (Essayez de supprimer le message de vous même)"
				  ),
			ephemeral: true,
		});
	}
}
