import type { Interaction } from "discord.js";
import type WTBClient from "../main.js";
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
			const command = this.client.getComponent(
				"commands",
				interaction.commandName
			);
			if (command) return command.onSent(interaction);
		} else if (interaction.isModalSubmit()) {
			const modal = this.client.getComponent(
				"modals",
				interaction.customId
			);
			if (modal) return modal.onSubmited(interaction);
		} else if (interaction.isButton()) {
			const button = this.client.getComponent(
				"buttons",
				interaction.customId
			);
			if (button) return button.onClick(interaction);
		}
	}
}
