import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
	type CacheType,
} from "discord.js";
import type WTBClient from "../main.js";
import BotCommand from "../utils/command.js";
import { isModerator } from "../utils/permissions.js";
import { getErrorMessage, getMember } from "../utils/getters.js";

export default class WTB extends BotCommand {
	constructor(client: WTBClient) {
		super(
			import.meta.filename,
			client,
			new SlashCommandBuilder().setDescription("Poster un nouveau WTB")
		);
	}

	async onSent(
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		const member = await getMember(interaction);
		if (!member) return;

		if (!isModerator(member, this.client.settings))
			return interaction.reply({
				content: "Tu n'es pas autorisé à exécuter cette commande.",
				ephemeral: true,
			});

		this.client
			.getComponent("modals", "wtb-create")
			?.show(interaction)
			.catch((err) => {
				interaction.reply({
					content: getErrorMessage(
						"Je n'ai pas réussi à t'afficher le formulaire..."
					),
					ephemeral: true,
				});
				console.error(err);
			});
	}
}
