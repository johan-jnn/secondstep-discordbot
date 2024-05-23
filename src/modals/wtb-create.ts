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
import { StockXProduct } from "../utils/stockx.js";

export default class WTBCreate extends BotModal {
	private webhooks: WebhookClient[];
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
					.setLabel("Etat de la paire")
					.setStyle(TextInputStyle.Short)
					.setPlaceholder(
						"Note à donner (ex. '8 / 10', '17 / 20', ...)"
					),
				new TextInputBuilder()
					.setCustomId("payout")
					.setLabel("Payout")
					.setPlaceholder("ex. '15', '25,6€', '95€', '230.85€', ...")
					.setStyle(TextInputStyle.Short),
				new TextInputBuilder()
					.setCustomId("sizes")
					.setLabel("Tailles souhaités")
					.setPlaceholder(
						"Si plusieurs tailles souhaités, séparer les différentes tailles par des virgules."
					)
					.setStyle(TextInputStyle.Short),
			],
		});

		this.webhooks= client.settings.wtb_webhooks.map((url) => new WebhookClient({ url }));
	}

	async onSubmited(
		interaction: ModalSubmitInteraction,
		...parameters: any[]
	): Promise<any> {
		await interaction.deferUpdate();
		const getField = (id: string) =>
			interaction.fields.getTextInputValue(id);
		const sku = getField("sku");
		const fields = {
			SKU: sku,
			"Etat recherché": getField("etat"),
			Payout: getField("payout"),
			Tailles: getField("sizes")
				.split(/\s*,\s*/)
				.map((size) => `* ${size}`)
				.join("\n"),
		};

		const data: StockXProduct = {
			brand: "<BRAND>",
			productId: sku,
			title: "<TITLE>",
			urlKey: "https://johan-janin.com",
			productType: "Shoes",
			styleId: null,
			productAttributes: {
				color: null,
				colorway: null,
				gender: null,
				releaseDate: "08-25-2014",
				retailPrice: 250,
				season: "<SEASON>",
			},
		};

		const embed = new EmbedBuilder()
			.setAuthor({
				name: data.title || "<titre introuvable>",
				url: data.urlKey,
			})
			.setColor(
				(data.productAttributes.color || "Random") as ColorResolvable
			)
			.setFields(
				Object.entries(fields).map(([key, value]) => ({
					name: bold(underline(key) + " :"),
					value: codeBlock(value),
					inline: true,
				}))
			)
			.setTimestamp();

		const channel = this.client.channels.cache.get(
			this.client.settings.guild.channels.buyers
		);

		if (!channel?.isTextBased())
			return interaction.user.send({
				content:
					"Oups... Je n'ai pas trouvé le channel où envoyer les offres. Contactez l'administrateur/développeur du robot.",
			});

		const meetup = this.client.getComponent("buttons", "meetup");
		const shipping = this.client.getComponent("buttons", "shipping");
		const close = this.client.getComponent("buttons", "close-wtb");

		if (!(meetup && shipping && close))
			return interaction.user.send({
				content:
					"Oups... Je n'ai pas réussi à construire correctement le message. Contactez l'administrateur/développeur du robot.",
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
		this.webhooks.forEach(hook => {
			hook.send({
				content: hyperlink("Nouveau WTB :", message.url),
				embeds: [embed]
			})
		})
	}
}
