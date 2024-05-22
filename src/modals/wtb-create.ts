import {
	ModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import type WTBClient from "../main";
import BotModal from "../utils/modal";

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
	}

	async onSubmited(
		interaction: ModalSubmitInteraction,
		...parameters: any[]
	): Promise<any> {
		interaction.deferUpdate();
		const sku = interaction.fields.getTextInputValue("sku");
	}
}
