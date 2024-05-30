import {
	ActionRowBuilder,
	bold,
	ButtonBuilder,
	codeBlock,
	ColorResolvable,
	EmbedBuilder,
	GuildMember,
	hyperlink,
	ModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle,
	underline,
	WebhookClient,
} from "discord.js";
import type WTBClient from "../main.js";
import BotModal from "../utils/modal.js";
import { getErrorMessage } from "../utils/getters.js";
import { getProduct } from "../utils/stockx.js";
import { getAverageColor } from "fast-average-color-node";
import { getWebhooks } from "../utils/webhooks.js";

const defaultMaxNote = 10;
export default class WTBCreate extends BotModal {
	constructor(client: WTBClient) {
		super(import.meta.filename, client, {
			title: "Créer un nouveau WTB",
			inputs: [
				new TextInputBuilder()
					.setCustomId("sku")
					.setLabel("SKU StockX")
					.setRequired(true)
					.setStyle(TextInputStyle.Short),
				new TextInputBuilder()
					.setCustomId("etat")
					.setLabel(`Etat de la paire (ramené sur ${defaultMaxNote})`)
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
					.setPlaceholder(
						`'8 / 10', '17 / 20',... - Sur ${defaultMaxNote} par défaut.`
					),
				new TextInputBuilder()
					.setCustomId("payout")
					.setLabel("Payout")
					.setRequired(false)
					.setPlaceholder("ex. '15', '25,6€', '95€', '230.85€', ...")
					.setStyle(TextInputStyle.Short),
				new TextInputBuilder()
					.setCustomId("sizes")
					.setLabel("Tailles souhaités")
					.setPlaceholder(
						"Séparer les différentes tailles souhaité par des virgules."
					)
					.setRequired(false)
					.setStyle(TextInputStyle.Short),
				new TextInputBuilder()
					.setCustomId("description")
					.setRequired(false)
					.setStyle(TextInputStyle.Paragraph)
					.setLabel("Informations supplémentaires")
					.setPlaceholder(
						"Ecrivez ici les éventuelles informations supplémentaires sur la paire recherchée."
					),
			],
		});
	}

	private parseSizes(input: string) {
		if (!input) return ["Full sizes"];
		return input
			.split(/\s*,\s*/)
			.map((size) => `* ${size}`)
			.join("\n");
	}
	private parsePayout(input: string) {
		if (!input) return "?";
		const number = parseFloat(
			input.replaceAll(/\s*/g, "").replace(",", ".")
		);
		if (isNaN(number)) return null;
		return number.toLocaleString("fr-FR", {
			currency: "EUR",
			style: "currency",
		});
	}
	private parseEtat(input: string) {
		const [note_str, max_str] = input.split(/\s*\/\s*/);
		const [note, max] = [
			parseFloat(note_str || "0"),
			parseFloat(max_str || defaultMaxNote.toString()),
		];
		if (isNaN(note) || isNaN(max) || note > max) return null;

		return `${((note * defaultMaxNote) / max).toFixed(
			1
		)} / ${defaultMaxNote}`;
	}

	async onSubmited(
		interaction: ModalSubmitInteraction,
		...parameters: any[]
	): Promise<any> {
		await interaction.deferUpdate();
		const getField = (id: string) =>
			interaction.fields.getTextInputValue(id);
		const sku = getField("sku");
		const customDescription = getField("description");
		const fields = {
			SKU: sku,
			"Etat recherché": this.parseEtat(getField("etat")),
			Payout: this.parsePayout(getField("payout")),
			Tailles: this.parseSizes(getField("sizes")),
		};

		for (const [key, value] of Object.entries(fields)) {
			if (value === null)
				return interaction.reply(
					getErrorMessage(`Entrée invalide pour le champ "${key}".`)
				);
		}

		const data = await getProduct(sku);
		if (!data)
			return interaction.user.send(
				getErrorMessage(
					"Le produit associé à ce SKU n'a pas été trouvé. Le problème peut également venir de StockX qui bloque la recherche."
				)
			);

		const extractedColor = await getAverageColor(data.image, {
			ignoredColor: [255, 255, 255],
		});
		const embed = new EmbedBuilder()
			.setAuthor({
				name: data?.name || "<titre introuvable>",
				url: data.url,
			})
			.setColor(
				(parseInt(extractedColor.hex.slice(1), 16) ||
					"Random") as ColorResolvable
			)
			.setFields(
				Object.entries(fields).map(([key, value]) => ({
					name: bold(underline(key) + " :"),
					value: codeBlock(value as string),
					inline: true,
				}))
			)
			.setImage(data.image)
			.setTimestamp();

		if (customDescription) embed.setDescription(customDescription);

		const channel = this.client.channels.cache.get(
			this.client.settings.guild.channels.wtb
		);

		if (!channel?.isTextBased())
			return interaction.user.send({
				content: getErrorMessage(
					"Je n'ai pas trouvé le salon où envoyer les offres."
				),
			});

		const meetup = this.client.getComponent("buttons", "meetup");
		const shipping = this.client.getComponent("buttons", "shipping");
		const close = this.client.getComponent("buttons", "close-wtb");

		if (!(meetup && shipping && close))
			return interaction.user.send({
				content: getErrorMessage(
					"Je n'ai pas réussi à construire correctement le message."
				),
			});
		const message = await channel.send({
			content: "",
			embeds: [embed],
			components: [
				new ActionRowBuilder<ButtonBuilder>().setComponents(
					meetup.component,
					shipping.component,
					close.component
				),
			],
		});
		getWebhooks().forEach((url) => {
			new WebhookClient({ url }).send({
				content: hyperlink("Nouveau WTB :", message.url),
				embeds: [embed],
			});
		});
	}
}
