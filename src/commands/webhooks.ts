import {
	APIEmbedField,
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	inlineCode,
	SharedSlashCommandSubcommands,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	underline,
} from "discord.js";
import type WTBClient from "../main.js";
import BotCommand from "../utils/command.js";
import { getErrorMessage, getMember } from "../utils/getters.js";
import { getWebhooks, updateWebhooks } from "../utils/webhooks.js";
import { isModerator } from "../utils/permissions.js";

const webhookUrlRegexp =
	/^https?:\/\/(discord|discordapp).com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_.-]*)$/;
export default class Ping extends BotCommand {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			//@ts-ignore - Don't know why the type is not reconised
			new SlashCommandBuilder()
				.setDescription("Manage webhooks")
				.addSubcommand((subcommand) =>
					subcommand
						.setName("list")
						.setDescription("Liste tous les webhooks actifs")
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("add")
						.setDescription(
							"Permet d'ajouter un nouveau webhook à la liste"
						)
						.addStringOption((option) =>
							option
								.setRequired(true)
								.setName("webhook-url")
								.setDescription(
									"L'URL du webhook (doit être une url valide)"
								)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName("delete")
						.setDescription("Supprime un webhook de la liste")
						.addNumberOption((option) =>
							option
								.setRequired(true)
								.setName("id")
								.setDescription(
									"L'identifiant/position du webhook à supprimer."
								)
						)
				)
		);
	}

	async onSent(
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		const member = await getMember(interaction);
		if (!member) return;

		if (!isModerator(member, this.client.settings))
			return interaction.reply({
				ephemeral: true,
				content: getErrorMessage(
					"Tu ne possèdes pas la permission d'exécuter cette commande."
				),
			});

		const command = interaction.options.getSubcommand(true);

		switch (command) {
			case "add":
				const url = interaction.options.getString("webhook-url", true);
				if (!webhookUrlRegexp.test(url))
					return interaction.reply({
						ephemeral: true,
						content: getErrorMessage(
							"L'URL du webhook n'est pas valide."
						),
					});
				const new_size = updateWebhooks((list) => {
					list.push(url);
					return list.length;
				});
				return interaction.reply({
					content: `Le webhook vient d'être ajouté. Le robot possède désormais ${new_size} webhooks.`,
				});
			case "delete":
				const id = interaction.options.getNumber("id", true);
				const data = updateWebhooks((list) => {
					if (id < 0 || id >= list.length)
						return {
							err: `Le webhook avec l'ID "${id}" est introuvable.`,
						};
					const webhook = list.splice(id, 1)[0];
					return {
						err: null,
						deleted: webhook,
						new_size: list.length,
					};
				});
				if (data.err)
					return interaction.reply({
						ephemeral: true,
						content: getErrorMessage(data.err),
					});
				else
					return interaction.reply(
						`Le webhook n°${id} vient d'être supprimé (url: ${data.deleted}). Le robot possède désormais ${data.new_size} webhooks.`
					);
			case "list":
				const fields: APIEmbedField[] = getWebhooks().map(
					(url, id) => ({
						name: underline(`Webhook ${inlineCode(`#${id}`)} :`),
						value: url,
						inline: true,
					})
				);

				if (!fields.length)
					return interaction.reply({
						content: "Aucun webhooks n'a encore été ajouté.",
					});

				const embeds: EmbedBuilder[] = [];
				for (const field of fields) {
					let builder = embeds.at(-1);
					if (!builder || (builder.data.fields?.length || 0) >= 25) {
						builder = new EmbedBuilder()
							.setFooter({
								text: `Liste ${embeds.length + 1} / ${
									fields.length % 25
								}`,
							})
							.setColor("Blurple");
						embeds.push(builder);
					}

					builder.addFields(field);
				}
				embeds[0].setTitle("Liste des webhooks :");
				return interaction.reply({
					embeds,
					content: "",
				});
			default:
				return interaction.reply({
					ephemeral: true,
					content: getErrorMessage(
						"La sous-commande n'a pas été trouvé..."
					),
				});
		}
	}
}
