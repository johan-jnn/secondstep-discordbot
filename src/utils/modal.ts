import {
	ActionRowBuilder,
	ButtonInteraction,
	ChatInputCommandInteraction,
	ModalBuilder,
	TextInputBuilder,
	type AnySelectMenuInteraction,
	type APIModalInteractionResponseCallbackData,
	type Interaction,
} from "discord.js";
import type WTBClient from "../main";
import path from "node:path";

export default class BotModal {
	readonly informations: APIModalInteractionResponseCallbackData;
	readonly client: WTBClient;
	constructor(
		__filename: string,
		client: WTBClient,
		modal: {
			title: string;
			inputs: TextInputBuilder[];
		}
	) {
		this.informations = new ModalBuilder()
			.setTitle(modal.title)
			.setCustomId(path.parse(__filename).name)
			.setComponents(
				modal.inputs.map((input) =>
					new ActionRowBuilder<TextInputBuilder>().setComponents(
						input
					)
				)
			)
			.toJSON();
		this.client = client;
	}

	async onSubmited(...parameters: any[]): Promise<any> {}
	async show(
		interaction:
			| ChatInputCommandInteraction
			| ButtonInteraction
			| AnySelectMenuInteraction
	) {
		if (interaction.replied || interaction.deferred)
			throw new Error(
				`Cannot show "${this.informations.custom_id}" modal because the given interaction has been replied/deffered.`
			);
		return interaction.showModal(this.informations);
	}
}

export class BotModalElement extends BotModal {
	//@ts-ignore
	constructor(client: WTBClient);
}
