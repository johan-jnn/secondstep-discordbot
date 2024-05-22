import type { Interaction } from "discord.js";
import type WTBClient from "../main";
import BotEvent from "../utils/event.js";

export default class InteractionCreate extends BotEvent {
	constructor(client: WTBClient) {
		super(import.meta.filename, client);
	}

	async onTriggered(
		interaction: Interaction,
		...parameters: any[]
	): Promise<any> {
		if (interaction.isChatInputCommand()) {
			const command = this.client.commands?.find(
				(cmd) => cmd.informations.name === interaction.commandName
			);
			if (command) return command.onSent(interaction);
		} else if (interaction.isModalSubmit()) {
			const modal = this.client.getModal(interaction.customId);
			if (modal) return modal.onSubmited(interaction);
		}
	}
}
