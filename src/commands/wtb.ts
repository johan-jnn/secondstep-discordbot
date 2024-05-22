import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
	type CacheType,
} from "discord.js";
import type WTBClient from "../main";
import BotCommand from "../utils/command.js";

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
		this.client
			.getModal("wtb-create")
			?.show(interaction)
			.catch((err) => {
				interaction.reply({
					content: "An error has come...",
					ephemeral: true,
				});
				console.error(err);
			});
	}
}
